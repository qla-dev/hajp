require('dotenv').config();

const appJson = require('./app.json');
const appJsonConfig = appJson.expo || {};
const firstValue = (...values) => values.find((value) => typeof value === 'string' && value.trim()) || '';
const unique = (values) => Array.from(new Set(values.filter(Boolean)));

const googleClientConfig = {
  androidClientId: firstValue(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID, process.env.GOOGLE_ANDROID_CLIENT_ID),
  iosClientId: firstValue(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, process.env.GOOGLE_IOS_CLIENT_ID),
  expoClientId: firstValue(process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID, process.env.GOOGLE_EXPO_CLIENT_ID),
  webClientId: firstValue(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, process.env.GOOGLE_WEB_CLIENT_ID),
};
const googleIosReversedClientId = googleClientConfig.iosClientId
  ? `com.googleusercontent.apps.${googleClientConfig.iosClientId.replace('.apps.googleusercontent.com', '')}`
  : '';

const resolveConfig = (baseConfig) => {
  const existingSchemes = Array.isArray(baseConfig.scheme)
    ? baseConfig.scheme
    : [baseConfig.scheme].filter(Boolean);
  const existingPlugins = baseConfig.plugins || [];
  const hasWebBrowserPlugin = existingPlugins.some((plugin) =>
    Array.isArray(plugin) ? plugin[0] === 'expo-web-browser' : plugin === 'expo-web-browser',
  );

  return {
    ...baseConfig,
    scheme: unique([...existingSchemes, 'hajp', googleIosReversedClientId]),
    plugins: hasWebBrowserPlugin ? existingPlugins : [...existingPlugins, 'expo-web-browser'],
    extra: {
      ...(baseConfig.extra || {}),
      google: googleClientConfig,
    },
  };
};

module.exports = ({ config } = {}) => resolveConfig(config || appJsonConfig);
