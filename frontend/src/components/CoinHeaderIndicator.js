import React, { useCallback, useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { Asset } from 'expo-asset';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { fetchCoinBalance } from '../api';
import {
  subscribeToCoinBalance,
  updateCoinBalance,
  getCachedCoinBalance,
} from '../utils/coinHeaderTracker';

const coinAsset = require('../../assets/svg/coin.svg');
const coinAssetDefaultUri = Asset.fromModule(coinAsset).uri;

export default function CoinHeaderIndicator({ onPress }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [coins, setCoins] = useState(getCachedCoinBalance());
  const [coinSvgUri, setCoinSvgUri] = useState(coinAssetDefaultUri || null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const asset = Asset.fromModule(coinAsset);
        await asset.downloadAsync();
        if (mounted) {
          setCoinSvgUri(asset.localUri || asset.uri || coinAssetDefaultUri || null);
        }
      } catch {
        if (mounted) setCoinSvgUri(coinAssetDefaultUri || null);
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

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
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
