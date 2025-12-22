import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import ConfettiCannon from 'react-native-confetti-cannon';

const pad = (value) => String(value).padStart(2, '0');

const getRemainingTime = (target) => {
  if (!target) return 0;
  return Math.max(0, target - Date.now());
};

export default function NextPollCountdownScreen({ route }) {
  const { nextPollAt } = route.params || {};
  const targetDate = useMemo(() => (nextPollAt ? new Date(nextPollAt) : null), [nextPollAt]);
  const [remaining, setRemaining] = useState(getRemainingTime(targetDate));
  const [copied, setCopied] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const confettiTimeout = useRef(null);
  const referralCode = 'HYPER-HAJP';
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

  useEffect(() => () => clearTimeout(confettiTimeout.current), []);

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const timerLabel = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  const handleCopyReferral = async () => {
    await Clipboard.setStringAsync(referralCode);
    await Haptics.selectionAsync();
    setCopied(true);
    setConfettiKey((prev) => prev + 1);
    clearTimeout(confettiTimeout.current);
    confettiTimeout.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.page}>
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

        <View style={styles.contentBox}>
          <Text style={styles.referralTitle}>Preporuči prijatelje</Text>
          <Text style={styles.referralSubtitle}>
            Podijeli kod, osvoji bonus čekanja i drži ankete živima. Svaki novi prijatelj pojačava hajp.
          </Text>
          <View style={styles.referralBadge}>
            <View>
              <Text style={styles.referralLabel}>Kod preporuke</Text>
              <Text style={styles.referralCode}>{referralCode}</Text>
            </View>
            <TouchableOpacity
              style={[styles.copyButton, copied && styles.copyButtonActive]}
              onPress={handleCopyReferral}
              activeOpacity={0.8}
            >
              <Text style={styles.copyButtonText}>{copied ? 'Kopirano!' : 'Kopiraj'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.referralHint}>Dummy nagrada: +5 preskakanja kada neko pristupi putem tvoje preporuke.</Text>

          <Text style={[styles.referralTitle, styles.timerIntro]}>Sljedeća anketa za:</Text>
          <Text style={styles.timer}>{timerLabel}</Text>
        </View>
      </ScrollView>
      {confettiKey > 0 && (
        <View style={styles.confettiWrapper} pointerEvents="none">
          <ConfettiCannon
            key={confettiKey}
            count={90}
            origin={{ x: 0, y: 0 }}
            fadeOut
            autoStart
            fallSpeed={4500}
            colors={[colors.primary, colors.secondary]}
          />
        </View>
      )}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: colors.background,
      position: 'relative',
    },
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
    contentBox: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
      shadowColor: 'rgba(0,0,0,0.08)',
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 5,
      gap: 20,
    },
    contentBox: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 24,
      shadowColor: 'rgba(0,0,0,0.12)',
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
      gap: 16,
    },
    animationWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      padding: 20,
      backgroundColor: colors.secondary,
      borderRadius: 24,
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
    referralTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text_primary,
      marginBottom: 6,
    },
    referralSubtitle: {
      color: colors.text_secondary,
      fontSize: 14,
      lineHeight: 20,
    },
    referralBadge: {
      marginTop: 18,
      padding: 16,
      borderRadius: 18,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    referralLabel: {
      color: colors.text_secondary,
      fontSize: 12,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    referralCode: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text_primary,
    },
    copyButton: {
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: 14,
      backgroundColor: colors.primary,
    },
    copyButtonActive: {
      backgroundColor: colors.success,
    },
    copyButtonText: {
      color: '#fff',
      fontWeight: '700',
    },
    referralHint: {
      marginTop: 10,
      color: colors.text_secondary,
      fontSize: 13,
    },
    timerIntro: {
      marginTop: 16,
      fontSize: 18,
      fontWeight: '700',
      color: colors.text_primary,
    },
    confettiWrapper: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 20,
    },
  });
