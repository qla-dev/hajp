import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { googleLogin } from '../api';

WebBrowser.maybeCompleteAuthSession();

const getExpoGoogleConfig = () => {
  const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};
  return extra.google || {};
};

const firstValue = (...values) => values.find((value) => typeof value === 'string' && value.trim()) || undefined;

const buildGoogleConfig = () => {
  const extraGoogle = getExpoGoogleConfig();

  return {
    webClientId: firstValue(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, process.env.GOOGLE_WEB_CLIENT_ID, extraGoogle.webClientId),
    iosClientId: firstValue(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, process.env.GOOGLE_IOS_CLIENT_ID, extraGoogle.iosClientId),
    androidClientId: firstValue(
      process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      process.env.GOOGLE_ANDROID_CLIENT_ID,
      extraGoogle.androidClientId,
    ),
    expoClientId: firstValue(
      process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
      process.env.GOOGLE_EXPO_CLIENT_ID,
      extraGoogle.expoClientId,
    ),
  };
};

const getGoogleRedirectUri = (iosClientId) => {
  if (!iosClientId) {
    return undefined;
  }

  const reversedClientId = `com.googleusercontent.apps.${iosClientId.replace('.apps.googleusercontent.com', '')}`;
  return `${reversedClientId}:/oauthredirect`;
};

const getPlatformClientId = (googleConfig) =>
  Platform.select({
    ios: googleConfig.iosClientId || googleConfig.expoClientId,
    android: googleConfig.androidClientId || googleConfig.expoClientId,
    default: googleConfig.webClientId || googleConfig.expoClientId,
  });

export default function useGoogleAuth({ onSuccess } = {}) {
  const googleConfig = useMemo(buildGoogleConfig, []);
  const requestArgs = useMemo(
    () => ({
      ...googleConfig,
      redirectUri: getGoogleRedirectUri(googleConfig.iosClientId),
      selectAccount: true,
    }),
    [googleConfig],
  );
  const hasClientId = Boolean(getPlatformClientId(googleConfig));
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(requestArgs);
  const [loading, setLoading] = useState(false);
  const processedGoogleTokenRef = useRef(null);

  const handleToken = useCallback(
    async (idToken) => {
      if (!idToken) {
        Alert.alert('Greska', 'Google nije vratio token za prijavu.');
        setLoading(false);
        return;
      }

      if (processedGoogleTokenRef.current === idToken) {
        setLoading(false);
        return;
      }

      processedGoogleTokenRef.current = idToken;
      setLoading(true);

      try {
        const data = await googleLogin({ id_token: idToken });
        onSuccess?.(data);
      } catch (error) {
        processedGoogleTokenRef.current = null;
        const message = error?.response?.data?.message || 'Google prijava nije uspjela. Pokusaj ponovo.';
        Alert.alert('Greska', message);
      } finally {
        setLoading(false);
      }
    },
    [onSuccess],
  );

  useEffect(() => {
    if (!response) {
      return;
    }

    if (response.type === 'success') {
      handleToken(response.params?.id_token || response.authentication?.idToken);
      return;
    }

    if (response.type === 'error') {
      Alert.alert('Greska', 'Google prijava nije uspjela.');
      setLoading(false);
    }
  }, [response, handleToken]);

  const signIn = useCallback(async () => {
    if (!hasClientId) {
      Alert.alert(
        'Greska',
        Platform.OS === 'android'
          ? 'Google prijava za Android jos nije konfigurisana.'
          : 'Google prijava nije konfigurisana.',
      );
      return;
    }

    if (!request) {
      Alert.alert('Greska', 'Google prijava jos nije spremna. Pokusaj ponovo.');
      return;
    }

    setLoading(true);

    try {
      const result = await promptAsync();

      if (result.type !== 'success') {
        setLoading(false);
      }
    } catch {
      setLoading(false);
      Alert.alert('Greska', 'Google prijava nije uspjela.');
    }
  }, [hasClientId, promptAsync, request]);

  return {
    signIn,
    loading,
    ready: hasClientId && !!request,
  };
}
