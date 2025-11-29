import { Router } from 'express';

import {
  createUser,
  getSettings,
  updateSettings,
} from '../controllers/userController';

const router = Router();

router.post('/user/create', createUser);
router.get('/user/settings', getSettings);
router.put('/user/settings', updateSettings);

export const userRouter = router;

