import { Request, Response } from 'express';

import { UserSettingsModel } from '../models/UserSettings';
import type { UserSettingsPayload } from '../types/api';

export const createUser = async (req: Request, res: Response) => {
  const payload = req.body as Partial<UserSettingsPayload>;
  if (!payload?.name || !payload?.location) {
    return res.status(400).json({ message: 'Name and location are required.' });
  }

  const doc = await UserSettingsModel.create({
    name: payload.name,
    email: payload.email,
    location: payload.location,
    juristicMethod: payload.juristicMethod ?? 'STANDARD',
    prayerOffsets: payload.prayerOffsets ?? [],
  });

  return res.status(201).json({ userId: doc._id, settings: doc });
};

export const getSettings = async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ message: 'userId query param is required.' });
  }

  const doc = await UserSettingsModel.findById(userId);
  if (!doc) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.json(doc);
};

export const updateSettings = async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ message: 'userId query param is required.' });
  }

  const payload = req.body as Partial<UserSettingsPayload>;
  const doc = await UserSettingsModel.findByIdAndUpdate(
    userId,
    payload,
    { new: true },
  );

  if (!doc) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.json(doc);
};

