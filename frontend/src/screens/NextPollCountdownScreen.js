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
import { SvgUri } from 'react-native-svg';
import { Asset } from 'expo-asset';
import SuggestionSlider from '../components/SuggestionSlider';

const pad = (value) => String(value).padStart(2, '0');

const FIXED_TIMER_HEIGHT = 140;

const coinAsset = require('../../assets/svg/coin.svg');
const coinAssetDefaultUri = Asset.fromModule(coinAsset).uri;

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
  const [coinSvgUri, setCoinSvgUri] = useState(coinAssetDefaultUri || null);
  const confettiTimeout = useRef(null);

  const referralCode = 'HYPER-HAJP';
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      const parent = navigation.getParent();
      if (parent) parent.setParams({ refreshRooms: Date.now() });
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    setRemaining(getRemainingTime(targetDate));
  }, [targetDate]);

  useEffect(() => {
    if (!targetDate) return;
    const timer = setInterval(() => {
      setRemaining(getRemainingTime(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  useEffect(() => () => clearTimeout(confettiTimeout.current), []);

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
      {/* PURPLE BLOCK */}
      <View style={styles.secondaryWrap}>
        <ScrollView
          contentContainerStyle={[styles.content]}
          contentInsetAdjustmentBehavior="never"
          showsVerticalScrollIndicator={false}
        >
          {/* hero */}
          <View style={styles.hero}>
            <Text style={styles.title}>Preporuči prijatelje i osvoji</Text>
            <Text style={styles.subtitle}>
              Pozovi ekipu da uđe u Hajp. Svi uzimaju coine dok odbrojavanje ponovno počne.
            </Text>
          </View>

          {/* suggestions */}
          <View style={styles.sliderSection}>
            <Text style={styles.suggestionsTitle}>Osobe iz ove sobe koje možda poznaješ</Text>
            <SuggestionSlider
              cardStyle={{ backgroundColor: colors.background }}
            />
          </View>

          {/* reward */}
          <View style={styles.rewardSection}>
            <View style={styles.rewardRow}>
              {coinSvgUri ? <SvgUri width={24} height={24} uri={coinSvgUri} /> : null}
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
        </ScrollView>
      </View>

      {/* FIXED TIMER ON BACKGROUND */}
      <View style={styles.fixedTimer}>
        <Text style={styles.timerLabel}>Sljedeća anketa za</Text>
        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>{timerLabel}</Text>
        </View>
      </View>

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
    },

    secondaryWrap: {
      flex: 1,
      backgroundColor: colors.secondary,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
      overflow: 'hidden',
      marginBottom: FIXED_TIMER_HEIGHT,
    },

    content: {
      paddingTop: 120,
    },

    hero: {
      paddingHorizontal: 24,
      marginBottom: 32,
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
      lineHeight: 20,
    },

    sliderSection: {
      marginBottom: 5,
    },

    suggestionsTitle: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 12,
    },

    rewardSection: {
      paddingHorizontal: 24,
      paddingBottom: 30,
    },

    rewardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
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

    fixedTimer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: FIXED_TIMER_HEIGHT,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 16,
      backgroundColor: colors.background,
      alignItems: 'center',
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

    confettiWrapper: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 20,
    },
  });
