import express from 'express';
import cors from 'cors';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { publicRouter } from './routes/public.js';
import { ordersRouter } from './routes/orders.js';
import { adminRouter } from './routes/admin.js';
import { uploadRouter } from './routes/upload.js';
import { profileRouter } from './routes/profile.js';
import { connectDatabase } from './db.js';
import { seedDatabase } from './seed.js';

const app = express();
const uploadDir = resolve(process.cwd(), config.uploadDir);

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (config.nodeEnv !== 'production' && origin.startsWith('http://localhost')) return callback(null, true);
    const allowed = String(config.corsOrigin).split(',').map((s) => s.trim());
    if (allowed.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'foodieshotel-backend' });
});

app.use('/api/auth', authRouter);
app.use('/api', publicRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/profile', profileRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : 'Unexpected server error';
  return res.status(500).json({ message });
});

async function startServer() {
  await connectDatabase();
  await seedDatabase();

  app.listen(config.port, () => {
    console.log(`FoodiesHotel backend is running on http://localhost:${config.port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
