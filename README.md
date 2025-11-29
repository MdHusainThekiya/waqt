# Waqt

React Native Mobile App with NodeJS backend to remind users about prayer times.

## Live backend
The backend is deployed on Vercel:

https://waqt-backend.vercel.app

This serves the API used by the mobile app. Make sure to set required environment variables in Vercel for production (e.g., database connection string).

## Download mobile app (APK)
A release APK is included in this repository under `WaqtApp/app-release/Waqt-v1.0.0.apk`.

You can download it directly from GitHub raw content using this link (replace `main` with the correct branch if needed):

https://raw.githubusercontent.com/MdHusainThekiya/waqt/main/WaqtApp/app-release/Waqt-v1.0.0.apk

Note: GitHub serves raw files for repositories. If the repository is public this link will work; for private repos you must authenticate.

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