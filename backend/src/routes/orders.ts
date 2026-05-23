import { Router } from 'express';
import { requireAuth, requireRole, type AuthRequest } from '../auth.js';
import { MenuItemModel } from '../models/MenuItem.js';
import { OrderModel } from '../models/Order.js';
import { mapMenuItem, mapOrder } from '../mappers.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateVerificationCode } from '../utils/security.js';
import { sendVerificationCode } from '../mailer.js';
import { UserModel } from '../models/User.js';

export const ordersRouter = Router();

ordersRouter.get('/', requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const filter = req.user?.role === 'customer' ? { userId: req.user.id } : {};
  const orders = await OrderModel.find(filter).sort({ createdAt: -1 });
  return res.json({ orders: orders.map(mapOrder) });
}));

ordersRouter.post('/', requireAuth, requireRole('customer'), asyncHandler(async (req: AuthRequest, res) => {
  const { items, address, paymentMethod, paymentMode, qrCodeUrl, transactionNo } = req.body as {
    items?: Array<{ menuItemId: string; quantity: number }>;
    address?: string;
    paymentMethod?: string;
    paymentMode?: 'cash' | 'online';
    qrCodeUrl?: string;
    transactionNo?: string;
  };

  if (!items?.length || !address || !paymentMethod) {
    return res.status(400).json({ message: 'Items, address, and payment method are required' });
  }

  if (paymentMode === 'online' && !transactionNo) {
    return res.status(400).json({ message: 'Transaction number is required for online payments' });
  }

  const menu = await MenuItemModel.find({ available: true });
  const mappedMenu = menu.map(mapMenuItem);
  const resolvedItems = items.map((entry) => {
    const menuItem = mappedMenu.find((item) => item.id === entry.menuItemId);
    if (!menuItem) {
      throw new Error(`Unknown menu item: ${entry.menuItemId}`);
    }

    return {
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: Number(entry.quantity)
    };
  });

  const total = resolvedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const created = await OrderModel.create({
    userId: req.user!.id,
    userName: req.user!.name,
    items: resolvedItems,
    total,
    address,
    paymentMethod,
    paymentMode: paymentMode ?? 'cash',
    qrCodeUrl: qrCodeUrl ?? '',
    transactionNo: transactionNo ?? '',
    verificationCode: generateVerificationCode()
  });

  return res.status(201).json({ order: mapOrder(created) });
}));

ordersRouter.patch('/:orderId/status', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const orderId = String(req.params.orderId);
  const { status } = req.body as { status?: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled' };
  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  const updated = await OrderModel.findByIdAndUpdate(orderId, { $set: { status } }, { new: true });
  if (!updated) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Send verification code to customer and admins when order is confirmed
  if (status === 'confirmed' && updated.verificationCode) {
    try {
      const customer = await UserModel.findById(updated.userId);
      if (customer) {
        await sendVerificationCode(customer.email, customer.name ?? 'Customer', updated.verificationCode, updated._id.toString());
        await OrderModel.findByIdAndUpdate(orderId, { $set: { verificationCodeSentAt: new Date() } });
      }

      // Notify all admins as well
      const admins = await UserModel.find({ role: 'admin' });
      for (const admin of admins) {
        try {
          await sendVerificationCode(admin.email, admin.name ?? 'Admin', updated.verificationCode, updated._id.toString());
        } catch (err) {
          console.error('Failed to notify admin about verification code', admin.email, err);
        }
      }
    } catch (error) {
      console.error('Failed to send verification code notifications:', error);
    }
  }

  return res.json({ order: mapOrder(updated) });
}));

ordersRouter.put('/:orderId/verify', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const orderId = String(req.params.orderId);
  const { verificationCode } = req.body as { verificationCode?: string };

  if (!verificationCode) {
    return res.status(400).json({ message: 'Verification code is required' });
  }

  const order = await OrderModel.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.verificationCode !== verificationCode) {
    return res.status(400).json({ message: 'Invalid verification code' });
  }

  const verified = await OrderModel.findByIdAndUpdate(
    orderId,
    { $set: { verifiedAt: new Date() } },
    { new: true }
  );

  return res.json({ order: mapOrder(verified!) });
}));
