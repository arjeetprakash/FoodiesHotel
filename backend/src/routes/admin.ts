import { Router } from 'express';
import { requireAuth, requireRole } from '../auth.js';
import { MenuItemModel } from '../models/MenuItem.js';
import { OrderModel } from '../models/Order.js';
import { UserModel } from '../models/User.js';
import { BrandingModel } from '../models/Branding.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { mapBranding, mapMenuItem, mapOrder, mapUser } from '../mappers.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole('admin'));

adminRouter.get('/summary', asyncHandler(async (_req, res) => {
  const [customers, admins, items, ordersData] = await Promise.all([
    UserModel.countDocuments({ role: 'customer' }),
    UserModel.countDocuments({ role: 'admin' }),
    MenuItemModel.countDocuments(),
    OrderModel.find().select({ total: 1 }).lean()
  ]);

  const revenue = ordersData.reduce((sum, order) => sum + (order.total ?? 0), 0);
  return res.json({ summary: { customers, admins, items, orders: ordersData.length, revenue } });
}));

adminRouter.get('/users', asyncHandler(async (_req, res) => {
  const users = await UserModel.find().sort({ createdAt: -1 });
  return res.json({ users: users.map(mapUser) });
}));

adminRouter.get('/orders', asyncHandler(async (_req, res) => {
  const orders = await OrderModel.find().sort({ createdAt: -1 });
  return res.json({ orders: orders.map(mapOrder) });
}));

adminRouter.get('/menu', asyncHandler(async (_req, res) => {
  const items = await MenuItemModel.find().sort({ createdAt: -1 });
  return res.json({ items: items.map(mapMenuItem) });
}));

adminRouter.post('/menu', asyncHandler(async (req, res) => {
  const { name, description, category, price, image, featured, available } = req.body as {
    name?: string;
    description?: string;
    category?: string;
    price?: number;
    image?: string;
    featured?: boolean;
    available?: boolean;
  };

  if (!name || !description || !category || price === undefined || !image) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const item = await MenuItemModel.create({
    name,
    description,
    category,
    price: Number(price),
    image,
    featured: Boolean(featured),
    available: available ?? true
  });

  return res.status(201).json({ item: mapMenuItem(item) });
}));

adminRouter.patch('/menu/:itemId', asyncHandler(async (req, res) => {
  const updated = await MenuItemModel.findByIdAndUpdate(String(req.params.itemId), { $set: req.body }, { new: true });
  if (!updated) {
    return res.status(404).json({ message: 'Menu item not found' });
  }

  return res.json({ item: mapMenuItem(updated) });
}));

adminRouter.delete('/menu/:itemId', asyncHandler(async (req, res) => {
  const removed = await MenuItemModel.findByIdAndDelete(String(req.params.itemId));
  if (!removed) {
    return res.status(404).json({ message: 'Menu item not found' });
  }

  return res.json({ success: true });
}));

adminRouter.get('/branding', asyncHandler(async (_req, res) => {
  const branding = await BrandingModel.findOne().sort({ createdAt: -1 });
  if (!branding) {
    return res.status(404).json({ message: 'Branding not configured' });
  }

  return res.json({ branding: mapBranding(branding) });
}));

adminRouter.put('/branding', asyncHandler(async (req, res) => {
  const payload = req.body as {
    restaurantName?: string;
    tagline?: string;
    primaryColor?: string;
    logoUrl?: string;
    heroImageUrl?: string;
    supportEmail?: string;
    paymentQrCodeUrl?: string;
  };

  const current = await BrandingModel.findOne().sort({ createdAt: -1 });
  if (!current) {
    const created = await BrandingModel.create({
      restaurantName: payload.restaurantName ?? 'FoodiesHotel',
      tagline: payload.tagline ?? 'Fresh meals. Fast delivery. Full control.',
      primaryColor: payload.primaryColor ?? '#d3542b',
      logoUrl: payload.logoUrl ?? '',
      heroImageUrl: payload.heroImageUrl ?? '',
      supportEmail: payload.supportEmail ?? 'support@foodieshotel.com',
      paymentQrCodeUrl: payload.paymentQrCodeUrl ?? ''
    });
    return res.json({ branding: mapBranding(created) });
  }

  current.restaurantName = payload.restaurantName ?? current.restaurantName;
  current.tagline = payload.tagline ?? current.tagline;
  current.primaryColor = payload.primaryColor ?? current.primaryColor;
  current.logoUrl = payload.logoUrl ?? current.logoUrl;
  current.heroImageUrl = payload.heroImageUrl ?? current.heroImageUrl;
  current.supportEmail = payload.supportEmail ?? current.supportEmail;
  current.paymentQrCodeUrl = payload.paymentQrCodeUrl ?? current.paymentQrCodeUrl;
  await current.save();

  return res.json({ branding: mapBranding(current) });
}));
