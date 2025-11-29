import { Schema, model } from 'mongoose';

const OffsetSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'],
    },
    offset: { type: Number, default: 0 },
  },
  { _id: false },
);

const UserSettingsSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      label: { type: String, required: true },
    },
    juristicMethod: {
      type: String,
      enum: ['STANDARD', 'HANAFI'],
      default: 'STANDARD',
    },
    prayerOffsets: { type: [OffsetSchema], default: [] },
  },
  { timestamps: true },
);

export const UserSettingsModel = model('UserSettings', UserSettingsSchema);

