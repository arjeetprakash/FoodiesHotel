import { Router } from 'express';
import { MenuItemModel } from '../models/MenuItem.js';
import { BrandingModel } from '../models/Branding.js';
import { mapBranding, mapMenuItem } from '../mappers.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const publicRouter = Router();

publicRouter.get('/menu', asyncHandler(async (_req, res) => {
  const items = await MenuItemModel.find().sort({ createdAt: -1 });
  return res.json({ items: items.map(mapMenuItem) });
}));

publicRouter.get('/branding', asyncHandler(async (_req, res) => {
  const branding = await BrandingModel.findOne().sort({ createdAt: -1 });
  if (!branding) {
    return res.status(404).json({ message: 'Branding not configured' });
  }

  return res.json({ branding: mapBranding(branding) });
}));
