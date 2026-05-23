import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import type { Role } from './types.js';

export interface AuthPayload {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export function createAccessToken(user: AuthPayload) {
  const signOptions: jwt.SignOptions = {
    expiresIn: config.accessTokenTtl as jwt.SignOptions['expiresIn']
  };

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    config.jwtSecret,
    signOptions
  );
}

export function verifyAccessToken(token: string) {
  const payload = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
  return {
    id: String(payload.sub),
    email: String(payload.email),
    name: String(payload.name),
    role: String(payload.role) as Role
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing authorization token' });
  }

  try {
    req.user = verifyAccessToken(header.slice(7));
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired authorization token' });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
}
