import React, { useCallback, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { fetchCoinBalance } from '../api';

let cachedCoins = null;

export default function CoinHeaderIndicator({ onPress }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [coins, setCoins] = useState(cachedCoins ?? 0);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function refreshBalance() {
        try {
          const { data } = await fetchCoinBalance();
          const nextCoins = data?.coins ?? 0;
          if (isMounted) {
            setCoins(nextCoins);
            cachedCoins = nextCoins;
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

  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
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
