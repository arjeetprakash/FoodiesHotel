import { Schema, model } from 'mongoose';

const brandingSchema = new Schema(
  {
    restaurantName: { type: String, required: true },
    tagline: { type: String, required: true },
    primaryColor: { type: String, required: true },
    logoUrl: { type: String, default: '' },
    heroImageUrl: { type: String, default: '' },
    supportEmail: { type: String, default: 'support@foodieshotel.com' },
    paymentQrCodeUrl: { type: String, default: '' }
  },
  { timestamps: true }
);

export const BrandingModel = model('Branding', brandingSchema);
