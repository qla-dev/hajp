Hajp Frontend (Expo + React Native)

Setup
- Install Node.js and Expo CLI (`npm i -g expo` optional)
- Inside `frontend`: `npm install`
- Env: create `.env` with `EXPO_PUBLIC_API_URL=http://localhost:8000` (or your LAN IP for device testing)

Run
- `npx expo start`
- Open iOS/Android simulator or Expo Go on device

Structure
- Theme colors at `src/theme/colors.js`
- Screens: Welcome, Login, Register, Home, CreatePoll, PollDetail, Subscription, Profile, AnonymousInbox, SendAnonymousMessage, ShareLink
- API client at `src/api/index.js` with token interceptors

Notes
- UI uses color tokens and 16px padding, 8px radius
- Connects to Laravel backend routes under `/api/*`
