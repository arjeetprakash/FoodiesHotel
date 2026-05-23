import bcrypt from 'bcryptjs';
import { UserModel } from './models/User.js';
import { MenuItemModel } from './models/MenuItem.js';
import { BrandingModel } from './models/Branding.js';
import { WebsiteVisitModel } from './models/WebsiteVisit.js';

const seedMenu = [
  {
    name: 'Signature Burger',
    description: 'Beef patty, cheddar, onion jam, and house sauce.',
    category: 'Burgers',
    price: 12.5,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    available: true
  },
  {
    name: 'Creamy Alfredo Pasta',
    description: 'Fresh pasta with parmesan cream and herbs.',
    category: 'Pasta',
    price: 14,
    image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    available: true
  },
  {
    name: 'Grilled Chicken Bowl',
    description: 'Rice, vegetables, grilled chicken, and spicy mayo.',
    category: 'Bowls',
    price: 11,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80',
    featured: false,
    available: true
  },
  {
    name: 'Chocolate Lava Cake',
    description: 'Warm cake with a molten chocolate center.',
    category: 'Desserts',
    price: 7.5,
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    available: true
  }
];

export async function seedDatabase() {
  const existingAdmin = await UserModel.findOne({ email: 'admin@foodieshotel.com' }).lean();
  if (!existingAdmin) {
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await UserModel.create({
      name: 'Restaurant Admin',
      email: 'admin@foodieshotel.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      phone: '+1234567890',
      address: '123 Main Street',
      city: 'New York',
      pincode: '10001'
    });
  }

  const existingCustomer = await UserModel.findOne({ email: 'customer@foodieshotel.com' }).lean();
  if (!existingCustomer) {
    const customerPasswordHash = await bcrypt.hash('customer123', 10);
    await UserModel.create({
      name: 'Demo Customer',
      email: 'customer@foodieshotel.com',
      passwordHash: customerPasswordHash,
      role: 'customer',
      phone: '+1987654321',
      address: '456 Oak Avenue',
      city: 'Los Angeles',
      pincode: '90001'
    });
  }

  const menuCount = await MenuItemModel.countDocuments();
  if (menuCount === 0) {
    await MenuItemModel.insertMany(seedMenu);
  }

  const brandingCount = await BrandingModel.countDocuments();
  if (brandingCount === 0) {
    await BrandingModel.create({
      restaurantName: 'FoodiesHotel',
      tagline: 'Fresh meals. Fast delivery. Full control.',
      primaryColor: '#d3542b',
      logoUrl: '',
      heroImageUrl: '',
      supportEmail: 'support@foodieshotel.com',
      paymentQrCodeUrl: ''
    });
  }

  const visitCounter = await WebsiteVisitModel.findOne({ key: 'main' }).lean();
  if (!visitCounter) {
    await WebsiteVisitModel.create({ key: 'main', count: 0 });
  }
}
