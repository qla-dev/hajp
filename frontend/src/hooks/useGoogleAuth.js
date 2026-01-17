import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { googleLogin } from '../api';

WebBrowser.maybeCompleteAuthSession();

const getGoogleConfig = () => {
  const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};
  return extra.google || {};
};

export default function useGoogleAuth({ onSuccess } = {}) {
  const googleConfig = getGoogleConfig();
  const requestArgs = {
    expoClientId: googleConfig.expoClientId || undefined,
    iosClientId: googleConfig.iosClientId || undefined,
    androidClientId: googleConfig.androidClientId || undefined,
    webClientId: googleConfig.webClientId || undefined,
    redirectUri: makeRedirectUri({ useProxy: true }),
  };
  const hasClientId = Object.values(requestArgs).some(Boolean);
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(requestArgs);
  const [loading, setLoading] = useState(false);

  const handleToken = useCallback(
    async (idToken) => {
      if (!idToken) {
        Alert.alert('Greška', 'Google token nije dostupan.');
        return;
      }
      setLoading(true);
      try {
        const data = await googleLogin({ id_token: idToken });
        onSuccess?.(data);
      } catch (error) {
        const message = error?.response?.data?.message || 'Google prijava nije uspjela. Pokušaj ponovo.';
        Alert.alert('Greška', message);
      } finally {
        setLoading(false);
      }
    },
    [onSuccess],
  );

  useEffect(() => {
    if (response?.type === 'success') {
      handleToken(response.params?.id_token);
    } else if (response?.type === 'error') {
      const message = response?.error?.message || 'Google prijava je otkazana.';
      Alert.alert('Greška', message);
    }
  }, [response, handleToken]);

  const signIn = useCallback(() => {
    if (!hasClientId) {
      Alert.alert('Greška', 'Google autentikacija nije konfigurirana.');
      return;
    }
    if (!request) {
      Alert.alert('Greška', 'Google autentikacija trenutno nije dostupna.');
      return;
    }
    promptAsync({ useProxy: true });
  }, [hasClientId, promptAsync, request]);

  return {
    signIn,
    loading,
    ready: hasClientId && !!request,
  };
}
