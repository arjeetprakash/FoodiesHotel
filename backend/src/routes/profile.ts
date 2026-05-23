import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../auth.js';
import { UserModel } from '../models/User.js';
import { OrderModel } from '../models/Order.js';
import { mapUser, mapOrder } from '../mappers.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const profileRouter = Router();

profileRouter.get('/', requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const user = await UserModel.findById(req.user!.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const orders = await OrderModel.find({ userId: req.user!.id }).sort({ createdAt: -1 });

  return res.json({
    user: mapUser(user),
    orders: orders.map(mapOrder)
  });
}));

profileRouter.put('/', requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const { name, phone, address, city, pincode } = req.body as {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    pincode?: string;
  };

  const updateData: any = {};
  if (name) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;
  if (city !== undefined) updateData.city = city;
  if (pincode !== undefined) updateData.pincode = pincode;

  const updated = await UserModel.findByIdAndUpdate(req.user!.id, updateData, { new: true });
  if (!updated) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ user: mapUser(updated) });
}));
