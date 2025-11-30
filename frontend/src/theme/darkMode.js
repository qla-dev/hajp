import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, THEME_MODES } from './colors';

const STORAGE_KEY = '@hajp/theme-mode';

const ThemeContext = createContext({
  mode: THEME_MODES.SYSTEM,
  setMode: () => {},
  colors: lightColors,
  isDark: false,
});

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState(THEME_MODES.SYSTEM);
  const [resolvedSystemMode, setResolvedSystemMode] = useState(systemScheme || THEME_MODES.LIGHT);

  // Load persisted preference
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === THEME_MODES.DARK || stored === THEME_MODES.LIGHT || stored === THEME_MODES.SYSTEM) {
          setMode(stored);
        }
      })
      .catch(() => {});
  }, []);

  // Persist selection
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {});
  }, [mode]);

  // Keep an internal state that updates when the OS theme changes
  useEffect(() => {
    setResolvedSystemMode(systemScheme || THEME_MODES.LIGHT);
  }, [systemScheme]);

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setResolvedSystemMode(colorScheme || THEME_MODES.LIGHT);
    });
    return () => listener?.remove?.();
  }, []);

  const resolvedScheme = mode === THEME_MODES.SYSTEM ? resolvedSystemMode : mode;
  const isDark = resolvedScheme === THEME_MODES.DARK;

  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      colors,
      isDark,
      systemScheme: resolvedSystemMode,
    }),
    [mode, setMode, colors, isDark, resolvedSystemMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useThemedStyles(styleFactory) {
  const { colors, isDark } = useTheme();
  return useMemo(() => styleFactory(colors, isDark), [colors, isDark, styleFactory]);
}

export default ThemeProvider;
