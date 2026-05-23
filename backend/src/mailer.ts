import nodemailer from 'nodemailer';
import { config } from './config.js';
import { OrderModel } from './models/Order.js';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!config.smtpHost) {
    // Fallback to a direct stub that logs the message in development
    transporter = {
      sendMail: async (opts: any) => {
        console.log('Email stub sending (no SMTP configured):', opts);
        return Promise.resolve();
      }
    } as any;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: config.smtpUser ? { user: config.smtpUser, pass: config.smtpPass } : undefined
  });

  return transporter;
}

export async function sendPasswordResetEmail(toEmail: string, toName: string, token: string) {
  const transporterInstance = getTransporter();
  const resetLink = `${config.publicBaseUrl}/login/customer?reset=${encodeURIComponent(token)}`;

  const subject = 'Password reset instructions';
  const text = `Hello ${toName},\n\nWe received a request to reset your password. Use the link below to reset it:\n\n${resetLink}\n\nIf you didn't request a reset, ignore this message.`;
  const html = `<p>Hello ${toName},</p><p>We received a request to reset your password. Click below to reset it:</p><p><a href="${resetLink}">Reset password</a></p><p>If you didn't request a reset, ignore this message.</p>`;

  await transporterInstance!.sendMail({
    from: config.mailFrom,
    to: toEmail,
    subject,
    text,
    html
  } as any);
}

export async function sendVerificationCode(toEmail: string, toName: string, code: string, orderId: string) {
  const transporterInstance = getTransporter();

  // Fetch order details to include in the email
  let orderSummary = '';
  try {
    const order = await OrderModel.findById(orderId);
    if (order) {
      const itemsHtml = (order.items || []).map((it: any) => `<li>${it.quantity} x ${it.name} — $${(it.price || 0).toFixed(2)}</li>`).join('');
      orderSummary = `
        <h4>Order ${order._id}</h4>
        <p><strong>Items:</strong></p>
        <ul>${itemsHtml}</ul>
        <p><strong>Total:</strong> $${(order.total ?? 0).toFixed(2)}</p>
        ${order.address ? `<p><strong>Address:</strong> ${order.address}</p>` : ''}
        ${order.paymentMethod ? `<p><strong>Payment:</strong> ${order.paymentMethod}${order.transactionNo ? ` — TXN: ${order.transactionNo}` : ''}</p>` : ''}
      `;
    }
  } catch (err) {
    console.error('Failed to load order for email composition', orderId, err);
  }

  console.log(`Sending verification code ${code} for order ${orderId} to ${toEmail}` + (orderSummary ? `\nOrder summary included` : ''));

  const subject = 'Your Order Verification Code';
  const text = `Hello ${toName},\n\nYour order has been confirmed! Your verification code for delivery is: ${code}\n\nOrder ID: ${orderId}\n\nPlease share this code with the delivery person to confirm the delivery.`;
  const html = `<p>Hello ${toName},</p>
    <p>Your order has been confirmed! Your verification code for delivery is:</p>
    <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${code}</p>
    ${orderSummary}
    <p>Please share this code with the delivery person to confirm the delivery.</p>`;

  await transporterInstance!.sendMail({
    from: config.mailFrom,
    to: toEmail,
    subject,
    text,
    html
  } as any);
}

export default getTransporter;
