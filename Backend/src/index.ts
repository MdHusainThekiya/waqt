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

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', userRouter);

const bootstrap = async () => {
  await connectDatabase();
  app.listen(env.port, () => {
    console.log(`API listening on port ${env.port}`);
  });
};

bootstrap().catch(error => {
  console.error('Failed to start server', error);
  process.exit(1);
});

