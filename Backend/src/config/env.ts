import dotenv from 'dotenv';

dotenv.config();

const readEnv = (key: string, fallback?: string) => {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  port: Number(process.env.PORT ?? 4003),
  mongoUri: readEnv('MONGO_URI'),
};

