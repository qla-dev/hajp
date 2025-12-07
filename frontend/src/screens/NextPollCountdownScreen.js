import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';

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
      contentInsetAdjustmentBehavior="always"
    >
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
      <TouchableOpacity style={styles.backLink} onPress={() => navigation.navigate('Rooms')}>
        <Text style={styles.backLinkText}>Back to rooms</Text>
      </TouchableOpacity>
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
      paddingTop: 24,
      paddingHorizontal: 20,
      justifyContent: 'center',
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
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    secondaryButtonText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: '700',
    },
    backLink: {
      marginTop: 32,
      alignItems: 'center',
    },
    backLinkText: {
      color: colors.text_primary,
      fontSize: 15,
      fontWeight: '600',
    },
  });
