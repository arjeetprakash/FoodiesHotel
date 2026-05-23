export type Role = 'admin' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  phone?: string;
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
  createdAt: string;
}

export interface DatabaseShape {
  users: User[];
  menu: MenuItem[];
  orders: Order[];
}
