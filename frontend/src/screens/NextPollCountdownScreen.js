import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import LottieView from 'lottie-react-native';

const pad = (value) => String(value).padStart(2, '0');

const getRemainingTime = (target) => {
  if (!target) return 0;
  return Math.max(0, target - Date.now());
};

export default function NextPollCountdownScreen({ route, navigation }) {
  const { nextPollAt } = route.params || {};
  const targetDate = useMemo(() => (nextPollAt ? new Date(nextPollAt) : null), [nextPollAt]);
  const [remaining, setRemaining] = useState(getRemainingTime(targetDate));
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  useEffect(() => {
    setRemaining(getRemainingTime(targetDate));
  }, [targetDate]);

  useEffect(() => {
    if (!targetDate) return undefined;
    const timer = setInterval(() => {
      setRemaining(getRemainingTime(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const timerLabel = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="never"
    >
      <View style={styles.animationWrapper}>
        <LottieView
          source={{ uri: 'https://cdn.lordicon.com/hrbtmsnb.json' }}
          autoPlay
          loop
          style={styles.lottie}
          colorFilters={[{ keypath: '**', color: colors.secondary }]}
        />
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Igraj ponovo</Text>
        <Text style={styles.subtitle}>Nove ankete za</Text>
        <Text style={styles.timer}>{timerLabel}</Text>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => Alert.alert('Pozovi prijatelja', 'Podijeli aplikaciju i zaobiđi čekanje.')}
        >
          <Text style={styles.secondaryButtonText}>Pozovi prijatelja</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      alignItems: 'center',
      padding: 28,
      borderRadius: 24,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: 'rgba(0,0,0,0.15)',
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
    animationWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      padding: 12,
      backgroundColor: 'transparent',
    },
    lottie: {
      width: 180,
      height: 180,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text_primary,
    },
    subtitle: {
      fontSize: 16,
      color: colors.text_secondary,
      marginTop: 8,
    },
    timer: {
      fontSize: 36,
      fontWeight: '600',
      color: colors.text_primary,
      marginTop: 14,
    },
    secondaryButton: {
      marginTop: 24,
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.secondary,
      backgroundColor: colors.surface,
    },
    secondaryButtonText: {
      color: colors.secondary,
      fontSize: 15,
      fontWeight: '700',
    },
  });
