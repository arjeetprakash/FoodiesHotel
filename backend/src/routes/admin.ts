import { Router } from 'express';
import { requireAuth, requireRole } from '../auth.js';
import { MenuItemModel } from '../models/MenuItem.js';
import { OrderModel } from '../models/Order.js';
import { UserModel } from '../models/User.js';
import { BrandingModel } from '../models/Branding.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { mapBranding, mapMenuItem, mapOrder, mapUser } from '../mappers.js';

export const adminRouter = Router();

function formatDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfDayUtc(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

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

adminRouter.get('/analytics', asyncHandler(async (req, res) => {
  const rawDays = Number(req.query.days ?? 7);
  const days = [1, 7, 30].includes(rawDays) ? rawDays : 7;

  const now = new Date();
  const startToday = startOfDayUtc(now);
  const startWindow = startOfDayUtc(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1))));

  const [orders, customers, menuItems] = await Promise.all([
    OrderModel.find({ createdAt: { $gte: startWindow } }).select({ total: 1, createdAt: 1 }).lean(),
    UserModel.find({ role: 'customer', createdAt: { $gte: startWindow } }).select({ createdAt: 1 }).lean(),
    MenuItemModel.countDocuments()
  ]);

  const byDay = new Map<string, { date: string; revenue: number; orders: number; customers: number }>();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset));
    const key = formatDayKey(day);
    byDay.set(key, { date: key, revenue: 0, orders: 0, customers: 0 });
  }

  for (const order of orders) {
    const createdAt = new Date(order.createdAt as Date);
    const key = formatDayKey(createdAt);
    const bucket = byDay.get(key);
    if (bucket) {
      bucket.orders += 1;
      bucket.revenue += Number(order.total ?? 0);
    }
  }

  for (const customer of customers) {
    const createdAt = new Date(customer.createdAt as Date);
    const key = formatDayKey(createdAt);
    const bucket = byDay.get(key);
    if (bucket) {
      bucket.customers += 1;
    }
  }

  const todayKey = formatDayKey(startToday);
  const today = byDay.get(todayKey) ?? { date: todayKey, revenue: 0, orders: 0, customers: 0 };

  return res.json({
    analytics: {
      menuItems,
      today,
      days: Array.from(byDay.values())
    }
  });
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
