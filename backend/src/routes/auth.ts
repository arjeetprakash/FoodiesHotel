import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { createAccessToken, requireAuth, type AuthPayload, type AuthRequest } from '../auth.js';
import { UserModel } from '../models/User.js';
import { RefreshTokenModel } from '../models/RefreshToken.js';
import { PasswordResetTokenModel } from '../models/PasswordResetToken.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateSecureToken, hashToken } from '../utils/security.js';
import { sendPasswordResetEmail } from '../mailer.js';
import { config } from '../config.js';
import { mapUser } from '../mappers.js';

export const authRouter = Router();

function buildAuthPayload(user: { _id: { toString(): string }; name: string; email: string; role: 'admin' | 'customer' }): AuthPayload {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  };
}

async function issueTokens(payload: AuthPayload) {
  const accessToken = createAccessToken(payload);
  const refreshToken = generateSecureToken();
  const refreshExpiry = new Date(Date.now() + config.refreshTokenDays * 24 * 60 * 60 * 1000);

  await RefreshTokenModel.create({
    userId: payload.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: refreshExpiry,
    revokedAt: null
  });

  return { accessToken, refreshToken };
}

authRouter.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
  };

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const existing = await UserModel.findOne({ email: email.toLowerCase() }).lean();
  if (existing) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: 'customer',
    phone: phone ?? ''
  });

  const payload = buildAuthPayload(user);
  const tokens = await issueTokens(payload);
  return res.status(201).json({ ...tokens, user: mapUser(user) });
}));

authRouter.post('/login', asyncHandler(async (req, res) => {
  const { email, password, role } = req.body as {
    email?: string;
    password?: string;
    role?: 'admin' | 'customer';
  };

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, and role are required' });
  }

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user || user.role !== role) {
    return res.status(401).json({ message: 'Invalid credentials for the selected role' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const payload = buildAuthPayload(user);
  const tokens = await issueTokens(payload);
  return res.json({
    ...tokens,
    user: mapUser(user)
  });
}));

authRouter.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  const tokenHash = hashToken(refreshToken);
  const session = await RefreshTokenModel.findOne({ tokenHash, revokedAt: null, expiresAt: { $gt: new Date() } });
  if (!session) {
    return res.status(401).json({ message: 'Refresh token is invalid or expired' });
  }

  const user = await UserModel.findById(session.userId);
  if (!user) {
    return res.status(401).json({ message: 'User not found for refresh token' });
  }

  session.revokedAt = new Date();
  await session.save();

  const payload = buildAuthPayload(user);
  const tokens = await issueTokens(payload);

  return res.json({ ...tokens, user: mapUser(user) });
}));

authRouter.post('/logout', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (refreshToken) {
    await RefreshTokenModel.updateOne(
      { tokenHash: hashToken(refreshToken), revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );
  }

  return res.json({ success: true });
}));

authRouter.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.json({ message: 'If the account exists, a reset link has been sent.' });
  }

  const resetToken = generateSecureToken(32);
  await PasswordResetTokenModel.create({
    userId: user._id.toString(),
    tokenHash: hashToken(resetToken),
    expiresAt: new Date(Date.now() + config.resetTokenMinutes * 60 * 1000),
    usedAt: null
  });
  // Try to send an email. If SMTP isn't configured, our mailer will log the message.
  try {
    await sendPasswordResetEmail(user.email, user.name, resetToken);
  } catch (err) {
    console.error('Failed to send password reset email:', err);
  }

  return res.json({
    message: 'If the account exists, a reset link has been sent.',
    resetToken: config.nodeEnv === 'production' ? undefined : resetToken
  });
}));

authRouter.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body as { token?: string; newPassword?: string };
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  const tokenHash = hashToken(token);
  const resetRecord = await PasswordResetTokenModel.findOne({
    tokenHash,
    usedAt: null,
    expiresAt: { $gt: new Date() }
  });

  if (!resetRecord) {
    return res.status(400).json({ message: 'Reset token is invalid or expired' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await UserModel.updateOne({ _id: resetRecord.userId }, { $set: { passwordHash } });
  await RefreshTokenModel.updateMany({ userId: resetRecord.userId, revokedAt: null }, { $set: { revokedAt: new Date() } });
  resetRecord.usedAt = new Date();
  await resetRecord.save();

  return res.json({ success: true });
}));

authRouter.get('/me', requireAuth, (req: AuthRequest, res) => {
  return res.json({ user: req.user });
});
