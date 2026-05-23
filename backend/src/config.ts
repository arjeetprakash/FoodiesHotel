import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/foodieshotel',
  jwtSecret: process.env.JWT_SECRET ?? 'change-me-in-local-dev',
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL ?? '15m',
  refreshTokenDays: Number(process.env.REFRESH_TOKEN_DAYS ?? 30),
  resetTokenMinutes: Number(process.env.RESET_TOKEN_MINUTES ?? 20),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? 'http://localhost:4000',
  uploadDir: process.env.UPLOAD_DIR ?? './uploads'
  ,
  smtpHost: process.env.SMTP_HOST ?? '',
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpUser: process.env.SMTP_USER ?? '',
  smtpPass: process.env.SMTP_PASS ?? '',
  mailFrom: process.env.MAIL_FROM ?? 'no-reply@foodieshotel.com'
};
