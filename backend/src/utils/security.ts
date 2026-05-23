import { createHash, randomBytes } from 'node:crypto';

export function generateSecureToken(size = 48) {
  return randomBytes(size).toString('base64url');
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function generateVerificationCode(length: number = 4): string {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return code;
}
