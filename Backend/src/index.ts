import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { connectDatabase } from './config/database';
import { env } from './config/env';
import { userRouter } from './routes/userRoutes';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: '*',
  }),
);
app.use(express.json());
app.use(morgan('dev'));

app.get(['/','/health'], (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', userRouter);

// For Vercel serverless functions we should export the app and avoid calling
// app.listen. Connect to the database lazily on the first request to avoid
// blocking cold starts.

let isDbConnected = false;

const ensureDb = async () => {
  if (!isDbConnected) {
    await connectDatabase();
    isDbConnected = true;
  }
};

// Export the Express app for local usage and testing
export { app };

// Default export compatible with @vercel/node. It ensures DB connection and
// passes control to the Express app.
export default async function handler(req: any, res: any) {
  try {
    await ensureDb();
    return app(req, res);
  } catch (error) {
    console.error('Serverless handler error', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

