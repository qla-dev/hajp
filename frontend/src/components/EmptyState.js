import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { SvgUri } from 'react-native-svg';
import { Asset } from 'expo-asset';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import Avatar from './Avatar';
import { buildAvatarSvg, generateRandomConfig } from '../utils/bigHeadAvatar';
import * as Haptics from 'expo-haptics';

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
const SAMPLE_NAMES = ['Dino', 'Mia', 'Sara', 'Marko'];
const SAMPLE_TIMES = ['08:38', '08:21', '07:58'];

const hajpoviActiveIcon = require('../../assets/svg/nav-icons/hajpovi.svg');
const hajpoviActiveIconUri = Asset.fromModule(hajpoviActiveIcon).uri;

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
    const price = coinPrice || 50;
    return {
      id: `hajp-card-${index}`,
      avatarUri: buildAvatarSvg(config),
      question: questions[index % questions.length],
      from: `Od: ${names[index % names.length]}`,
      time: SAMPLE_TIMES[index % SAMPLE_TIMES.length],
      price,
    };
  });
};

export default function EmptyState({ title, subtitle, onRefresh, coinUri, coinPrice, refreshing = false }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const cards = useMemo(() => buildPreviewCards(coinPrice), [coinPrice]);
  const canRefresh = typeof onRefresh === 'function';
  const handleRefreshPress = useCallback(() => {
    if (canRefresh) {
      Haptics.selectionAsync().catch(() => {});
      onRefresh();
    }
  }, [canRefresh, onRefresh]);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefreshPress}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <TouchableOpacity
        style={[styles.refreshButton, !canRefresh && styles.refreshButtonDisabled]}
        onPress={handleRefreshPress}
        disabled={!canRefresh}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.refreshText}>Osvježi</Text>
        <Ionicons name="refresh" size={84} color={colors.primary} />
      </TouchableOpacity>

      <View style={styles.messageBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.graphic}>
        <View style={styles.graphicGlow} />
        <View style={styles.cardWrapper}>
          {cards.map((card, index) => {
            const cardStyle =
              index === 0
                ? styles.cardOffsetTop
                : index === 1
                ? styles.cardOffsetMiddle
                : styles.cardOffsetBottom;
            const isPrimary = index === 1;
            const genderColor = index === 0 ? '#60a5fa' : '#f472b6';
            const genderIcon = index === 0 ? 'male-outline' : 'female-outline';
            const genderLabel = index === 0 ? 'muškarac' : 'žena';
            return (
              <View key={card.id} style={[styles.cardStack, cardStyle]}>
                <View
                  style={[
                    styles.card,
                    isPrimary && styles.cardMiddle,
                    !isPrimary && styles.cardFaded,
                  ]}
                >
                {!isPrimary && (
                  <BlurView intensity={40} tint="default" style={styles.cardBlurLayer} pointerEvents="none" />
                )}
                  <View style={styles.cardRow}>
                    <View style={styles.cardAvatar}>
                      <Avatar uri={card.avatarUri} size={36} zoomModal={false} />
                      {!isPrimary && (
                        <BlurView intensity={15} tint="default" style={styles.avatarOverlay} />
                      )}
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {card.question}
                      </Text>
                      <View style={styles.cardMetaRow}>
                        {!isPrimary && (
                          <>
                            <Text style={styles.cardMeta} numberOfLines={1}>
                              Od:
                            </Text>
                            <Ionicons
                              name={genderIcon}
                              size={18}
                              color={genderColor}
                              style={styles.metaIcon}
                            />
                            <Text style={styles.cardMeta} numberOfLines={1}>
                              iz grupe
                            </Text>
                          </>
                        )}
                        {isPrimary && (
                          <Text style={styles.cardMeta} numberOfLines={1}>
                            {card.from}
                          </Text>
                        )}
                      </View>
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
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
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
    messageBlock: {
      alignItems: 'center',
      gap: 4,
      paddingVertical: 12,
    },
    refreshButton: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingHorizontal: 16,
      paddingVertical: 8,
      minWidth: 120,
      minHeight: 64,
    },
    refreshButtonDisabled: {
      opacity: 0.6,
    },
    refreshText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
    },
    graphic: {
      width: '100%',
      maxWidth: 360,
      height: 350,
      paddingVertical: 20,
      marginBottom: 30,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    graphicBlur: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 24,
    },
    graphicGlow: {
      position: 'absolute',
      width: '92%',
      height: '80%',
      borderRadius: 28,
      backgroundColor: colors.primaryOpacity2,
      opacity: 0.3,
      transform: [{ rotate: '-2deg' }],
    },
    cardWrapper: {
      width: '92%',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      overflow: 'visible',
    },
      card: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: 'rgba(0,0,0,0.12)',
        shadowOpacity: 0.45,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 14 },
        elevation: 8,
        overflow: 'hidden',
      },
      cardStack: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      },
      cardMiddle: {
        transform: [{ scale: 1.2 }],
        zIndex: 2,
      },
      cardFaded: {
        opacity: 0.7,
      },
      cardBlurLayer: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 20,
        backgroundColor: 'transparent',
      },
      avatarOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 20,
      },
    cardOffsetTop: {
      marginTop: -4,
      transform: [{ translateY: -4 }],
    },
    cardOffsetMiddle: {
      marginTop: 12,
      transform: [{ rotate: '3deg' }],
    },
    cardOffsetBottom: {
      marginTop: 26,
      transform: [{ translateY: 6 }],
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
    cardMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
    },
    metaIcon: {
      marginRight: 0,
    },
    cardMeta: {
      fontSize: 11,
      color: colors.text_secondary,
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
