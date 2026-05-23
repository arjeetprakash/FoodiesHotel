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
    image: item.image,
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
