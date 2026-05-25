import type { HydratedDocument } from 'mongoose';
import type { Role } from './types.js';

interface UserLike {
  _id: { toString(): string };
  name: string;
  email: string;
  role: Role;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
  createdAt?: Date;
}

interface MenuLike {
  _id: { toString(): string };
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  featured: boolean;
  available: boolean;
}

function buildFoodPlaceholder(name: string, category: string) {
  const title = name.slice(0, 24).replace(/&/g, '&amp;');
  const label = category.slice(0, 18).replace(/&/g, '&amp;');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#5661f2"/>
          <stop offset="55%" stop-color="#38bdf8"/>
          <stop offset="100%" stop-color="#14b8a6"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="#0f172a"/>
      <circle cx="970" cy="110" r="220" fill="url(#g)" opacity="0.22"/>
      <circle cx="210" cy="680" r="260" fill="#f59e0b" opacity="0.18"/>
      <rect x="70" y="70" width="1060" height="660" rx="52" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)"/>
      <text x="100" y="360" fill="#ffffff" font-size="72" font-family="Arial, Helvetica, sans-serif" font-weight="700">${title}</text>
      <text x="100" y="440" fill="#dbeafe" font-size="34" font-family="Arial, Helvetica, sans-serif">${label}</text>
      <text x="100" y="560" fill="#ffffff" font-size="26" font-family="Arial, Helvetica, sans-serif" opacity="0.8">Fresh, fast, and locally prepared</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
}

function normalizeMenuImageUrl(image: string, name: string, category: string) {
  if (!image) {
    return buildFoodPlaceholder(name, category);
  }

  if (image.includes('images.unsplash.com')) {
    return buildFoodPlaceholder(name, category);
  }

  return image;
}

interface OrderLike {
  _id: { toString(): string };
  userId: string;
  userName: string;
  items: Array<{ menuItemId: string; name: string; price: number; quantity: number }>;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  address: string;
  paymentMethod: string;
  paymentMode?: 'cash' | 'online';
  qrCodeUrl?: string;
  transactionNo?: string;
  verificationCode?: string;
  verificationCodeSentAt?: Date | null;
  verifiedAt?: Date | null;
  createdAt: Date;
}

interface BrandingLike {
  restaurantName: string;
  tagline: string;
  primaryColor: string;
  logoUrl: string;
  heroImageUrl: string;
  supportEmail: string;
  paymentQrCodeUrl?: string;
}

export function mapUser(user: UserLike) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone ?? '',
    address: user.address ?? '',
    city: user.city ?? '',
    pincode: user.pincode ?? '',
    createdAt: user.createdAt ? user.createdAt.toISOString() : ''
  };
}

export function mapMenuItem(item: MenuLike) {
  return {
    id: item._id.toString(),
    name: item.name,
    description: item.description,
    category: item.category,
    price: item.price,
    image: normalizeMenuImageUrl(item.image, item.name, item.category),
    featured: item.featured,
    available: item.available
  };
}

export function mapOrder(order: OrderLike) {
  return {
    id: order._id.toString(),
    userId: order.userId,
    userName: order.userName,
    items: order.items,
    total: order.total,
    status: order.status,
    address: order.address,
    paymentMethod: order.paymentMethod,
    paymentMode: order.paymentMode ?? 'cash',
    qrCodeUrl: order.qrCodeUrl ?? '',
    transactionNo: order.transactionNo ?? '',
    verificationCode: (order as any).verificationCode ?? undefined,
    verificationCodeSentAt: (order as any).verificationCodeSentAt ?? null,
    verifiedAt: (order as any).verifiedAt ?? null,
    createdAt: order.createdAt.toISOString()
  };
}

export function mapBranding(branding: BrandingLike) {
  return {
    restaurantName: branding.restaurantName,
    tagline: branding.tagline,
    primaryColor: branding.primaryColor,
    logoUrl: branding.logoUrl,
    heroImageUrl: branding.heroImageUrl,
    supportEmail: branding.supportEmail,
    paymentQrCodeUrl: branding.paymentQrCodeUrl ?? ''
  };
}
