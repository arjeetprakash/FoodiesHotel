import { Schema, model } from 'mongoose';

const menuItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    featured: { type: Boolean, default: false },
    available: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const MenuItemModel = model('MenuItem', menuItemSchema);
