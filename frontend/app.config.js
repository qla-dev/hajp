require('dotenv').config();

const appJson = require('./app.json');
const googleClientConfig = {
  androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID || '',
  iosClientId: process.env.GOOGLE_IOS_CLIENT_ID || '',
  expoClientId: process.env.GOOGLE_EXPO_CLIENT_ID || '',
  webClientId: process.env.GOOGLE_WEB_CLIENT_ID || '',
};

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo?.extra || {}),
      google: googleClientConfig,
    },
  },
};
