export type Role = 'admin' | 'customer';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
}

export interface AdminCustomer extends AuthUser {
  createdAt?: string;
}

export interface AdminDayAnalytics {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface AdminAnalytics {
  menuItems: number;
  today: AdminDayAnalytics;
  days: AdminDayAnalytics[];
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface Branding {
  restaurantName: string;
  tagline: string;
  primaryColor: string;
  logoUrl: string;
  heroImageUrl: string;
  supportEmail: string;
  paymentQrCodeUrl?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  featured: boolean;
  available: boolean;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  address: string;
  paymentMethod: string;
  paymentMode?: 'cash' | 'online';
  qrCodeUrl?: string;
  transactionNo?: string;
  verificationCode?: string;
  verificationCodeSentAt?: string;
  verifiedAt?: string;
  createdAt: string;
}
