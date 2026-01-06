import React, { useCallback, useEffect, useState, useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, findNodeHandle, UIManager, Platform, Dimensions, InteractionManager } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { Asset } from 'expo-asset';
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
  const [coinSvgUri, setCoinSvgUri] = useState(null);
  const hasValidLayoutRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const asset = Asset.fromModule(require('../../assets/svg/coin.svg'));
        await asset.downloadAsync();
        if (mounted) {
          setCoinSvgUri(asset.localUri || asset.uri);
        }
      } catch {
        if (mounted) setCoinSvgUri(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function refreshBalance() {
        try {
          const { data } = await fetchCoinBalance();
          const nextCoins = data?.coins ?? 0;
          if (isMounted) {
            updateCoinBalance(nextCoins);
            setCoins(nextCoins);
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
        if (height <= 0 || width <= 0) return;
        if (pageY < 0 && hasValidLayoutRef.current) return;
        if (pageY >= 0) {
          hasValidLayoutRef.current = true;
        }
        setCoinHeaderLayout({ x: pageX, y: pageY, width, height });
      });
    });
  }, []);

  useEffect(() => {
    measureLayout();
    const pending = setTimeout(measureLayout, 400);
    const listener = Platform.OS === 'web' ? null : Dimensions.addEventListener?.('change', measureLayout);
    return () => {
      clearTimeout(pending);
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
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {coinSvgUri ? (
        <SvgUri width={24} height={24} uri={coinSvgUri} />
      ) : (
        <View style={[styles.fallbackIcon, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.primary, fontWeight: '800' }}></Text>
        </View>
      )}
      <Text style={styles.label}>{coins}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      minHeight: 32,
      minWidth: 54,
      paddingHorizontal: 8,
      borderRadius: 18,
      borderWidth: 0,
      backgroundColor: 'transparent',
    },
    fallbackIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    label: {
      color: colors.text_primary,
      fontWeight: '600',
      fontSize: 13,
      minWidth: 12,
      marginLeft: 8,
    },
  });
