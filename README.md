# Waqt

React Native mobile app with a Node.js backend to remind users about prayer times — fast, offline-first, and privacy-conscious.

## Live App

Current version: **v1.0.0**

Download the Android APK:

https://raw.githubusercontent.com/MdHusainThekiya/waqt/main/WaqtApp/app-release/Waqt-v1.0.0.apk


## Live backend
The backend is deployed on Vercel:

https://waqt-backend.vercel.app

This serves the API used by the mobile app. Make sure to set required environment variables in Vercel for production (e.g., database connection string).

## Features
Waqt provides the following features out of the box:

- Offline-first prayer schedule
  - Prayer times are calculated on-device (no network needed) using the Adhan library and local coordinates.
  - User settings (location, offsets, juristic method, calculation method) are persisted locally using a secure, persisted store so the app works without connectivity.

- Smart notifications
  - Local scheduled reminders via Notifee: 15-minute heads-up reminders and exact Azan time for Maghrib.
  - Notifications are scheduled for today and tomorrow and are rehydrated on app start to survive reboots and updates.
  - Remote push support via Firebase Cloud Messaging for system broadcasts (foreground handling included).

- Qibla compass
  - Calculates the Qibla direction using geographic coordinates and displays a smooth compass using device heading.

- Customization & user sync
  - Customize prayer offsets per prayer, choose juristic and calculation methods.
  - On first-run onboarding can create a user on the backend and optionally sync settings to your account.

- Location permissions & graceful fallback
  - The app requests runtime location permission and falls back to a default location if not granted.

- Beautiful UI and countdowns
  - Live countdown to the next prayer with an elegant home screen and an adjusted daily schedule.

## Privacy & data
- Stored locally: profile (name, email, optional userId), selected location label & coordinates, offsets and preferences.
- Optional sync: if the user signs up during onboarding the app will send minimal settings to the backend (userId, location, offsets, juristic method).
- No analytics or sensitive data is sent without user consent. You control what is synced to the server.


## Download mobile app (APK)
A release APK is included in this repository under `WaqtApp/app-release/Waqt-v1.0.0.apk`.

You can download it directly from GitHub raw content using this link (replace `main` with the correct branch if needed):

https://raw.githubusercontent.com/MdHusainThekiya/waqt/main/WaqtApp/app-release/Waqt-v1.0.0.apk

Note: GitHub serves raw files for repositories. If the repository is public this link will work; for private repos you must authenticate. For a cleaner experience consider attaching the APK to a GitHub Release instead.

## Project structure
- `Backend/` - Node.js + TypeScript API
  - `src/` - source files
  - `vercel.json` - Vercel config for serverless deployment
  - `package.json` - scripts and deps
  - `dist/` - compiled output (ignored in git)

- `WaqtApp/` - React Native app
  - `app-release/` - release APK bundle
  - `src/` - React Native source files

## Quick start
### Backend (local)
1. cd Backend
2. cp sample.env .env and update environment variables (DB connection, etc.)
3. npm install
4. npm run build
5. npm start

API runs on the port defined in `Backend/src/config/env.ts` (or `process.env.PORT`).

### Mobile app
- Open `WaqtApp` in Android Studio or run via React Native CLI / Expo depending on your setup.
- To install the APK on an Android device, enable installs from unknown sources and open the downloaded `Waqt-v1.0.0.apk`.

## Vercel deployment notes
- The Backend is configured as a serverless function with `vercel.json` that builds `src/index.ts` using `@vercel/node`.
- In Vercel Project Settings set environment variables (e.g., MONGODB_URI) and ensure Project Root is `Backend`.

## Contributing
- Fork the repo, make changes, and open a PR. Keep API and mobile changes logically separated.

## License