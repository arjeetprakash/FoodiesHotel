import { Router } from 'express';
import { mkdirSync, existsSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import multer from 'multer';
import { requireAuth, requireRole } from '../auth.js';
import { config } from '../config.js';

const uploadDir = resolve(process.cwd(), config.uploadDir);
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDir),
  filename: (_req, file, callback) => {
    const safeExtension = extname(file.originalname) || '.jpg';
    callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExtension}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new Error('Only image files are supported'));
      return;
    }

    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

export const uploadRouter = Router();

uploadRouter.post('/image', requireAuth, requireRole('admin'), upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  const imageUrl = `${config.publicBaseUrl}/uploads/${req.file.filename}`;
  return res.status(201).json({ imageUrl });
});
