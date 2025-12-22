import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Ionicons } from '@expo/vector-icons';
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
  const [copied, setCopied] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const confettiTimeout = useRef(null);
  const referralCode = 'HYPER-HAJP';
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      const parent = navigation.getParent();
      if (parent) {
        parent.setParams({ refreshRooms: Date.now() });
      }
    });
    return unsubscribe;
  }, [navigation]);

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
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Preporuči prijatelje i osvoji</Text>
          <Text style={styles.subtitle}>
            Pozovi ekipu da uđe u Hajp. Svi uzimaju coine dok odbrojavanje ponovno počne.
          </Text>

          <View style={styles.heroIcon}>
            <LottieView
              source={{ uri: 'https://cdn.lordicon.com/jvucoldz.json' }}
              autoPlay
              loop
              style={styles.heroLottie}
              colorFilters={[{ keypath: '**', color: colors.primary }]}
            />
          </View>

          <View style={styles.rewardRow}>
            <Ionicons name="diamond" size={24} color="#fff" />
            <Text style={styles.rewardValue}>50</Text>
            <Text style={styles.rewardLabel}>Osvoji besplatne coine</Text>
          </View>

          <Text style={styles.bodyText}>
            Kad se prijatelji pridruže, svi dobijete coine. Zajedno skupljate 50 coina po pozivu.
          </Text>

          <View style={styles.codeStrip}>
            <View>
            <Text style={styles.codeLabel}>Vaš kod preporuke</Text>
              <Text style={styles.codeValue}>{referralCode}</Text>
            </View>
            <TouchableOpacity
              style={[styles.copyButton, copied && styles.copyButtonActive]}
              onPress={handleCopyReferral}
              activeOpacity={0.8}
            >
              <Text style={styles.copyButtonText}>{copied ? 'Kopirano' : 'Kopiraj kod'}</Text>
            </TouchableOpacity>
          </View>

       
        </View>

        <View style={styles.shareWrap}>
          <Text style={styles.timerLabel}>Sljedeća anketa za</Text>
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>{timerLabel}</Text>
          </View>
       
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
    },
    container: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      justifyContent: 'flex-start',
      padding: 0,
    },
    card: {
      backgroundColor: colors.secondary,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
      paddingTop: 100,
      paddingHorizontal: 24,
      paddingBottom: 26,

      elevation: 10,
    },
    title: {
      color: '#fff',
      fontSize: 28,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 12,
    },
    subtitle: {
      color: '#fff',
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 20,
    },
    heroIcon: {
      alignItems: 'center',
      marginBottom: 16,
    },
    heroPresent: {
      width: 130,
      height: 120,
      borderRadius: 20,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      marginBottom: 12,
    },
    heroRibbon: {
      position: 'absolute',
      top: 12,
      width: 60,
      height: 12,
      backgroundColor: colors.primary,
      borderRadius: 6,
    },
    heroGift: {
      width: 70,
      height: 70,
      borderRadius: 14,
      backgroundColor: colors.primary,
    },
    heroLottie: {
      width: 200,
      height: 200,
    },
    confettiSprays: {
      flexDirection: 'row',
      gap: 14,
      marginTop: 4,
    },
    rewardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      marginBottom: 12,
    },
    rewardValue: {
      color: '#fff',
      fontSize: 32,
      fontWeight: '800',
    },
    rewardLabel: {
      color: '#fff',
      fontSize: 14,
    },
    bodyText: {
      color: '#fff',
      fontSize: 13,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 18,
    },
    codeStrip: {
      backgroundColor: colors.primary,
      borderRadius: 24,
      paddingVertical: 18,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: '#fff',
    },
    codeLabel: {
      color: '#fff',
      fontSize: 12,
    },
    codeValue: {
      color: '#fff',
      fontSize: 24,
      fontWeight: '800',
    },
    copyButton: {
      backgroundColor: '#fff',
      borderRadius: 16,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    copyButtonActive: {
      backgroundColor: colors.success,
    },
    copyButtonText: {
      color: colors.primary,
      fontWeight: '700',
    },
    referralHint: {
      color: '#fff',
      fontSize: 13,
      textAlign: 'center',
      marginTop: 12,
    },
    tipText: {
      color: '#fff',
      fontSize: 12,
      textAlign: 'center',
      marginTop: 10,
      textDecorationLine: 'underline',
      letterSpacing: 0.3,
    },
    counterBadge: {
      backgroundColor: '#fff',
      borderRadius: 20,
      paddingVertical: 14,
      marginTop: 16,
      alignItems: 'center',
    },
    counterLabel: {
      fontSize: 12,
      color: colors.secondary,
      letterSpacing: 1,
      marginBottom: 4,
      textTransform: 'uppercase',
    },
    counterValue: {
      fontSize: 32,
      color: colors.primary,
      fontWeight: '900',
    },
    shareWrap: {
      padding: 24,
      backgroundColor: colors.background,
      alignItems: 'center',
      gap: 16,
    },
    timerLabel: {
      color: colors.text_primary,
      fontSize: 14,
      fontWeight: '600',
    },
    timerBadge: {
      backgroundColor: colors.surface,
      paddingVertical: 18,
      paddingHorizontal: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    timerText: {
      fontSize: 36,
      fontWeight: '800',
      color: colors.text_primary,
      letterSpacing: 1,
    },
    shareButton: {
      width: '100%',
      borderRadius: 26,
      paddingVertical: 16,
      alignItems: 'center',
    },
    shareButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
    },
    confettiWrapper: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 20,
    },
  });
