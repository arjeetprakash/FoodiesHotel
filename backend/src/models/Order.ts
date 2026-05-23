import { Schema, model } from 'mongoose';

const orderItemSchema = new Schema(
  {
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending'
    },
    address: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    paymentMode: { type: String, enum: ['cash', 'online'], default: 'cash' },
    qrCodeUrl: { type: String, default: '' },
    transactionNo: { type: String, default: '' },
    verificationCode: { type: String, required: true },
    verificationCodeSentAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export const OrderModel = model('Order', orderSchema);
