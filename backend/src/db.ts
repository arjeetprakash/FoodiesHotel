import mongoose from 'mongoose';
import { config } from './config.js';

let connected = false;

export async function connectDatabase() {
  if (connected) {
    return;
  }

  await mongoose.connect(config.mongodbUri);
  connected = true;
}
