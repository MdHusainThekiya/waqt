import mongoose from 'mongoose';

import { env } from './env';

export const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(env.mongoUri);
  mongoose.set('strictQuery', true);
};

