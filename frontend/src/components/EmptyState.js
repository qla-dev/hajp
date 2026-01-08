import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SvgUri } from 'react-native-svg';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import Avatar from './Avatar';
import { buildAvatarSvg, generateRandomConfig } from '../utils/bigHeadAvatar';

const CARD_COUNT = 3;
const HAIR_BLOCKED_WITH_HAT = new Set(['long', 'bob']);
const HAT_BLOCKING_VALUES = new Set(['beanie', 'turban']);
const HAIR_FALLBACK = 'pixie';
const BODY_FEMALE_VALUE = 'breasts';
const BODY_MALE_VALUE = 'chest';

const SAMPLE_QUESTIONS = [
  'Ko ti se sviđa?',
  'Ko te najviše spominje?',
  'Ko ti se najčešće javlja?',
];
const SAMPLE_NAMES = ['Luka', 'Mia', 'Sara', 'Marko'];
const SAMPLE_TIMES = ['08:38', '08:21', '07:58'];

const sanitizeHairHatForHat = (cfg = {}) => {
  if (cfg.hat === 'hijab') {
    return { ...cfg, hair: HAIR_FALLBACK };
  }
  if (HAIR_BLOCKED_WITH_HAT.has(cfg.hair) && HAT_BLOCKING_VALUES.has(cfg.hat)) {
    return { ...cfg, hair: HAIR_FALLBACK };
  }
  return cfg;
};

const sanitizeHairHatForHair = (cfg = {}) => {
  if (cfg.hat === 'hijab' && cfg.hair !== HAIR_FALLBACK) {
    return { ...cfg, hair: HAIR_FALLBACK };
  }
  if (HAIR_BLOCKED_WITH_HAT.has(cfg.hair) && HAT_BLOCKING_VALUES.has(cfg.hat)) {
    return { ...cfg, hat: 'none' };
  }
  return cfg;
};

const applyBodyMouth = (cfg = {}) => {
  if (cfg.body === BODY_FEMALE_VALUE && cfg.mouth !== 'lips') {
    return { ...cfg, mouth: 'lips' };
  }
  if (cfg.body === BODY_MALE_VALUE && cfg.mouth !== 'openSmile') {
    return { ...cfg, mouth: 'openSmile' };
  }
  return cfg;
};

const applyGenderLashes = (cfg = {}) => {
  if (cfg.body === BODY_FEMALE_VALUE && cfg.lashes !== true) {
    return { ...cfg, lashes: true };
  }
  if (cfg.body === BODY_MALE_VALUE && cfg.lashes !== false) {
    return { ...cfg, lashes: false };
  }
  return cfg;
};

const applyAvatarRules = (cfg = {}) =>
  applyGenderLashes(applyBodyMouth(sanitizeHairHatForHair(sanitizeHairHatForHat(cfg))));

const shuffleArray = (items = []) => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const buildRandomConfig = (gender) =>
  applyAvatarRules({
    ...generateRandomConfig({ gender, circleBg: true }),
    graphic: 'hajp',
  });

const buildPreviewCards = (coinPrice) => {
  const genders = shuffleArray(['female', 'male', Math.random() > 0.5 ? 'female' : 'male']).slice(0, CARD_COUNT);
  const questions = shuffleArray(SAMPLE_QUESTIONS);
  const names = shuffleArray(SAMPLE_NAMES);
  return new Array(CARD_COUNT).fill(null).map((_, index) => {
    const gender = genders[index] || 'female';
    const config = buildRandomConfig(gender);
    return {
      id: `hajp-card-${index}`,
      avatarUri: buildAvatarSvg(config),
      question: questions[index % questions.length],
      from: `Od: ${names[index % names.length]}`,
      time: SAMPLE_TIMES[index % SAMPLE_TIMES.length],
      price: index === CARD_COUNT - 1 ? coinPrice : null,
    };
  });
};

export default function EmptyState({ title, subtitle, onRefresh, coinUri, coinPrice }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const cards = useMemo(() => buildPreviewCards(coinPrice), [coinPrice]);
  const canRefresh = typeof onRefresh === 'function';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.refreshButton, !canRefresh && styles.refreshButtonDisabled]}
        onPress={onRefresh}
        disabled={!canRefresh}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="refresh" size={14} color={colors.text_secondary} />
        <Text style={styles.refreshText}>Osvježi</Text>
      </TouchableOpacity>

      <View style={styles.graphic}>
        <View style={styles.graphicGlow} />
        {cards.map((card, index) => {
          const cardStyle =
            index === 0 ? styles.cardBackLeft : index === 1 ? styles.cardBackRight : styles.cardFront;
          return (
            <View key={card.id} style={[styles.card, cardStyle]}>
              <View style={styles.cardRow}>
                <View style={styles.cardAvatar}>
                  <Avatar uri={card.avatarUri} size={36} zoomModal={false} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {card.question}
                  </Text>
                  <Text style={styles.cardMeta} numberOfLines={1}>
                    {card.from}
                  </Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.cardTime}>{card.time}</Text>
                  {card.price != null ? (
                    <View style={styles.pricePill}>
                      {coinUri ? (
                        <SvgUri width={12} height={12} uri={coinUri} />
                      ) : (
                        <Ionicons name="cash-outline" size={12} color={colors.primary} />
                      )}
                      <Text style={styles.priceText}>{card.price}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 32,
      gap: 10,
    },
    refreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginBottom: 10,
    },
    refreshButtonDisabled: {
      opacity: 0.6,
    },
    refreshText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text_secondary,
    },
    graphic: {
      width: '100%',
      maxWidth: 340,
      height: 190,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    graphicGlow: {
      position: 'absolute',
      width: '88%',
      height: '70%',
      borderRadius: 24,
      backgroundColor: colors.primaryOpacity2,
      opacity: 0.35,
      transform: [{ rotate: '-2deg' }],
    },
    card: {
      position: 'absolute',
      width: '92%',
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: 'rgba(0,0,0,0.18)',
      shadowOpacity: 0.2,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 4,
    },
    cardBackLeft: {
      transform: [{ rotate: '-7deg' }, { translateX: -24 }, { translateY: 12 }],
      opacity: 0.55,
    },
    cardBackRight: {
      transform: [{ rotate: '6deg' }, { translateX: 22 }, { translateY: 18 }],
      opacity: 0.72,
    },
    cardFront: {
      transform: [{ rotate: '-1.5deg' }],
      zIndex: 3,
      elevation: 6,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    cardAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      overflow: 'hidden',
    },
    cardContent: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text_primary,
    },
    cardMeta: {
      fontSize: 11,
      color: colors.text_secondary,
      marginTop: 2,
    },
    cardRight: {
      alignItems: 'flex-end',
      gap: 6,
    },
    cardTime: {
      fontSize: 10,
      color: colors.text_secondary,
    },
    pricePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
    priceText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text_primary,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: colors.text_secondary,
      textAlign: 'center',
      marginTop: 6,
    },
  });
