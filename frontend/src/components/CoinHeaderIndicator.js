import React, { useCallback, useEffect, useState, useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, findNodeHandle, UIManager, Platform, Dimensions, InteractionManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { fetchCoinBalance } from '../api';
import {
  setCoinHeaderLayout,
  subscribeToCoinBalance,
  updateCoinBalance,
  getCachedCoinBalance,
} from '../utils/coinHeaderTracker';

export default function CoinHeaderIndicator({ onPress }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [coins, setCoins] = useState(getCachedCoinBalance());
  const containerRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function refreshBalance() {
        try {
          const { data } = await fetchCoinBalance();
          const nextCoins = data?.coins ?? 0;
          if (isMounted) {
            updateCoinBalance(nextCoins);
          }
        } catch (error) {
          console.warn('Failed to load coins', error);
        }
      }

      refreshBalance();

      return () => {
        isMounted = false;
      };
    }, []),
  );

  useEffect(() => subscribeToCoinBalance(setCoins), []);

  const measureLayout = useCallback(() => {
    if (!containerRef.current) return;
    const handle = findNodeHandle(containerRef.current);
    if (!handle) return;
    InteractionManager.runAfterInteractions(() => {
      UIManager.measureInWindow(handle, (pageX, pageY, width, height) => {
        setCoinHeaderLayout({ x: pageX, y: pageY, width, height });
      });
    });
  }, []);

  useEffect(() => {
    measureLayout();
    const pending = setInterval(measureLayout, 500);
    const listener = Platform.OS === 'web' ? null : Dimensions.addEventListener?.('change', measureLayout);
    return () => {
      clearInterval(pending);
      listener?.remove?.();
    };
  }, [measureLayout]);

  return (
    <TouchableOpacity
      ref={containerRef}
      style={styles.button}
      onPress={onPress}
      onLayout={measureLayout}
      activeOpacity={0.8}
    >
      <View style={styles.iconWrapper}>
        <Ionicons name="logo-bitcoin" size={20} color={colors.primary} />
      </View>
      <Text style={styles.label}>{coins}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 4,

    },
    iconWrapper: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      color: colors.text_primary,
      fontWeight: '600',
      fontSize: 14,
    },
  });
