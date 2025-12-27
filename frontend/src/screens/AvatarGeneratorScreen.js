import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { updateCurrentUser } from '../api';
import { emitProfileUpdated } from '../utils/profileEvents';
import Avatar from '../components/Avatar';

import defaultConfig from '../../assets/json/avatar/avatarDefaultConfig.json';
import colorsData from '../../assets/json/avatar/avatarColors.json';
import optionGroupsData from '../../assets/json/avatar/avatarOptionGroups.json';
import tabsData from '../../assets/json/avatar/avatarTabs.json';
import { buildAvatarSvg, generateRandomConfig } from '../utils/bigHeadAvatar';

const sampleHeroUri =
  'https://cdn.dribbble.com/userupload/30645890/file/original-500c027610acebba14fe69de5572dcdd.png?resize=752x&vertical=center';
const shuffleSoundAsset = require('../../assets/sounds/shuffle.mp3');

const {
  hairColors,
  hairColorGradients,
  clothingColors,
  hatColors,
  lipColors,
  skinColors,
} = colorsData;

const { tabOrder = [], tabLabels = {} } = tabsData;
const BLOCKED_KEYS = new Set(['showBackground', 'backgroundColor', 'backgroundShape']);
const HAIR_BLOCKED_WITH_HAT = new Set(['long', 'bob']);
const HAT_BLOCKING_VALUES = new Set(['beanie', 'turban']);
const HAIR_FALLBACK = 'pixie';
const BODY_FEMALE_VALUE = 'breasts';
const BODY_MALE_VALUE = 'chest';
const applyBaseDefaults = (cfg = {}, { force } = {}) => {
  const next = { ...cfg };
  if (force || !next.clothing) next.clothing = 'shirt';
  if (force || !next.eyes) next.eyes = 'cute';
  if (force || next.accessory === undefined || next.accessory === null) next.accessory = 'none';
  return next;
};
const colorSwatchMap = {
  hairColor: { map: hairColors, gradient: hairColorGradients },
  facialHairColor: { map: hairColors, gradient: hairColorGradients },
  clothingColor: { map: clothingColors },
  hatColor: { map: hatColors || clothingColors },
  lipColor: { map: lipColors },
  faceMaskColor: { map: clothingColors },
};

const optionGroups = optionGroupsData
  .filter((group) => !BLOCKED_KEYS.has(group.key))
  .map((group) => {
    if (group.key === 'body') {
      return {
        ...group,
        label: tabLabels.body || 'Spol',
        options: group.options.map((option) => ({
          ...option,
          emoji: option.value === BODY_FEMALE_VALUE ? '♀' : option.value === BODY_MALE_VALUE ? '♂' : option.emoji,
        })),
      };
    }
    const colorInfo = colorSwatchMap[group.key];

    if (colorInfo?.map) {
      return {
        ...group,
        options: group.options.map((option) => ({
          ...option,
          swatch: colorInfo.map[option.value],
          swatchGradient: colorInfo.gradient?.[option.value],
        })),
      };
    }

    if (group.key === 'skinTone') {
      return {
        ...group,
        options: group.options.map((option) => ({
          ...option,
          swatch: skinColors[option.value],
        })),
      };
    }

    return group;
  });

const orderedOptionGroups = tabOrder
  .filter((key) => !BLOCKED_KEYS.has(key))
  .map((key) => {
    const group = optionGroups.find((item) => item.key === key);
    if (!group) return null;
    return { ...group, label: tabLabels[key] || group.label };
  })
  .filter(Boolean);

const enforceCirclePurple = (cfg = {}) => ({
  ...cfg,
  showBackground: true,
  backgroundShape: 'circle',
  backgroundColor: '#b794f4',
});

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

export default function AvatarGeneratorScreen({ navigation, route }) {
  const seedConfig = route?.params?.seedConfig;
  const userSex = route?.params?.userSex;

  const initialConfig = useMemo(() => {
    const hasSeed = !!seedConfig;
    const base = hasSeed
      ? { ...seedConfig }
      : {
          ...defaultConfig,
          body: userSex === 'girl' ? BODY_FEMALE_VALUE : BODY_MALE_VALUE,
          hair: userSex === 'girl' ? 'long' : defaultConfig.hair,
        };
    const withDefaults = applyBaseDefaults(base, { force: !hasSeed });
    const sanitized = sanitizeHairHatForHat(enforceCirclePurple(withDefaults));
    return hasSeed ? sanitized : applyBodyMouth(sanitized);
  }, [seedConfig, userSex]);

  const [config, setConfig] = useState(() => initialConfig);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(
    orderedOptionGroups[0]?.key || optionGroups[0].key,
  );
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPressed, setAiPressed] = useState(false);
  const shuffleSoundRef = useRef(null);

  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const aiBgAnim = useRef(new Animated.Value(0)).current;

  const gradientColors = useMemo(
    () => [
      'rgba(52,120,255,0.45)',
      'rgba(183,148,244,0.55)',
      'rgba(236,72,153,0.50)',
      'rgba(52,211,153,0.45)',
    ],
    [],
  );

  const avatarSvgUrl = useMemo(() => buildAvatarSvg(config), [config]);
  const shuffleIconColor = useMemo(() => {
    const hex = colors.background || '#ffffff';
    const match = /^#?([a-f\d]{6})/i.exec(hex);
    if (match) {
      const int = parseInt(match[1], 16);
      const r = (int >> 16) & 255;
      const g = (int >> 8) & 255;
      const b = int & 255;
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return brightness > 0.5 ? '#fff' : '#000';
    }
    return '#fff';
  }, [colors.background]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(shuffleSoundAsset, { shouldPlay: false });
        if (mounted) {
          shuffleSoundRef.current = sound;
        } else {
          await sound.unloadAsync();
        }
      } catch {
        // ignore load errors
      }
    })();
    return () => {
      mounted = false;
      shuffleSoundRef.current?.unloadAsync();
      shuffleSoundRef.current = null;
    };
  }, []);

  const playShuffleSound = useCallback(() => {
    shuffleSoundRef.current?.replayAsync().catch(() => {});
  }, []);

  const animatedGradientStyle = useMemo(
    () => ({
      transform: [
        {
          translateX: aiBgAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-220, 220],
          }),
        },
      ],
    }),
    [aiBgAnim],
  );

  const handleSelect = useCallback((key, value) => {
    setConfig((prev) => {
      let next = enforceCirclePurple({ ...prev, [key]: value });
      if (key === 'body' && value === BODY_FEMALE_VALUE) {
        next.hair = 'long';
      } else if (key === 'body' && value === BODY_MALE_VALUE) {
        next.hair = defaultConfig.hair;
      }
      if (key === 'hair') {
        next = sanitizeHairHatForHair(next);
      }
      if (key === 'hat') {
        next = sanitizeHairHatForHat(next);
      }
      if (key === 'body') {
        next = applyBodyMouth(next);
        next = sanitizeHairHatForHair(next);
      }
      next = applyBodyMouth(next);
      return next;
    });
  }, []);

  const handleRandomGender = useCallback((gender) => {
    Haptics.selectionAsync().catch(() => {});
    playShuffleSound();
    let next = generateRandomConfig({
      gender,
      circleBg: true,
      body: gender === 'female' ? BODY_FEMALE_VALUE : BODY_MALE_VALUE,
      hair: gender === 'female' ? 'long' : defaultConfig.hair,
    });
    next = applyBaseDefaults(next, { force: true });
    setConfig(applyBodyMouth(sanitizeHairHatForHat(enforceCirclePurple(next))));
  }, [playShuffleSound]);

  const handleSave = useCallback(async () => {
    if (saving) return;
    Haptics.selectionAsync().catch(() => {});
    setSaving(true);
    try {
      const payload = enforceCirclePurple(config);
      const { data } = await updateCurrentUser({ avatar: JSON.stringify(payload) });
      emitProfileUpdated(data);
      Alert.alert('Avatar sačuvan', 'Tvoj novi avatar je postavljen na profil.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Greška', 'Nismo mogli sačuvati avatar. Pokušaj ponovo.');
    } finally {
      setSaving(false);
    }
  }, [config, navigation, saving]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Avatar kreator',
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.saveButtonText}>Sačuvaj</Text>
          )}
        </TouchableOpacity>
      ),
    });
  }, [colors.primary, handleSave, navigation, saving, styles]);

  useEffect(() => {
    if (route?.params?.preset) {
      setConfig((prev) =>
        sanitizeHairHatForHat(
          enforceCirclePurple(applyBaseDefaults({ ...prev, ...route.params.preset })),
        ),
      );
    }
  }, [route?.params?.preset]);

  useEffect(() => {
    aiBgAnim.setValue(0);
    const loop = Animated.loop(
      Animated.timing(aiBgAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { resetBeforeIteration: true },
    );
    loop.start();
    return () => {
      loop.stop();
      aiBgAnim.stopAnimation();
    };
  }, [aiBgAnim]);

  const handleOpenAiModal = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    setShowAiModal(true);
  }, []);

  const activeGroup = orderedOptionGroups.find((group) => group.key === activeTab);

  return (
    <View style={styles.screen}>
      <Modal
        visible={showAiModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAiModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.modalTitle}>Generiši sa AI</Text>
            <Text style={styles.modalText}>
              Uskoro stiže generisanje avatara putem AI. Do tada koristi postojeće opcije i sačuvaj izgled.
            </Text>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowAiModal(false)}
              activeOpacity={0.9}
            >
              <Text style={styles.modalCloseText}>Zatvori</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={[styles.selectorBar, { backgroundColor: colors.transparent, borderColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
          style={styles.tabs}
        >
          {orderedOptionGroups.map((group) => {
            const active = activeTab === group.key;
            return (
              <TouchableOpacity
                key={group.key}
                onPress={() => setActiveTab(group.key)}
                style={[styles.tabChip, active && [styles.tabChipActive, { borderColor: colors.primary }]]}
                activeOpacity={0.9}
              >
                <Text style={[styles.tabChipText, active && { color: colors.primary }]}>{group.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {activeGroup ? (
          <View style={[styles.optionsPanel, { borderColor: colors.border }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.optionsRow}
            >
              {activeGroup.options.map((option) => {
                const active = config[activeGroup.key] === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleSelect(activeGroup.key, option.value)}
                    style={[styles.optionCard, active && [styles.optionCardActive, { borderColor: colors.primary }]]}
                    activeOpacity={0.9}
                  >
                    {option.swatchGradient ? (
                      <LinearGradient
                        colors={option.swatchGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.swatch, { borderColor: colors.border }]}
                      />
                    ) : option.swatch ? (
                      <View style={[styles.swatch, { backgroundColor: option.swatch }]} />
                    ) : (
                      <Text style={[styles.optionEmoji, active && { color: colors.primary }]}>
                        {option.emoji || '??'}
                      </Text>
                    )}
                    <Text style={[styles.optionText, active && styles.optionTextActive]} numberOfLines={1}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="always"
      >
        <View style={styles.hero}>
          <Image source={{ uri: sampleHeroUri }} style={styles.heroImage} resizeMode="contain" />
          <Text style={styles.title}>Avatar generator</Text>
          <Text style={styles.subtitle}>Centriraj izgled, podesi ton, kosu i detalje.</Text>

          <View style={styles.previewWrapper}>
            <View style={styles.previewCircle}>
              <Avatar
                uri={avatarSvgUrl}
                avatarConfig={config}
                bgMode="default"
                name="Avatar"
                variant="avatar-xxl"
                zoomModal={false}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.genderBadge,
                styles.genderBadgeLeft,
                styles.genderBadgeBorderLeft,
              ]}
              activeOpacity={0.85}
              onPress={() => handleRandomGender('male')}
            >
              <View style={[styles.genderBadgeInner, styles.genderBadgeInnerLeft]} />
              <Ionicons
                name="shuffle"
                size={26}
                color={shuffleIconColor}
                style={styles.shuffleIconMirrored}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderBadge,
                styles.genderBadgeRight,
                styles.genderBadgeBorderRight,
              ]}
              activeOpacity={0.85}
              onPress={() => handleRandomGender('female')}
            >
              <View style={[styles.genderBadgeInner, styles.genderBadgeInnerRight]} />
              <Ionicons name="shuffle" size={26} color={shuffleIconColor} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        {/* AI BUTTON (fixed vertical centering convinced) */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.aiButton}
          onPress={handleOpenAiModal}
          onPressIn={() => setAiPressed(true)}
          onPressOut={() => setAiPressed(false)}
        >
          <View style={[styles.aiBorder, aiPressed && styles.aiBorderPressed]}>
            {/* moving gradient behind border */}
            <Animated.View style={[styles.aiBorderFill, animatedGradientStyle]}>
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
            </Animated.View>

            <View
              style={[
                styles.aiButtonInner,
                { backgroundColor: colors.background },
                aiPressed && styles.aiButtonInnerPressed,
              ]}
            >
              <MaskedView
                style={styles.aiMask} // explicit height
                maskElement={
                  <View style={styles.aiMaskElement}>
                    <View style={styles.aiMaskRow}>
                      <Ionicons name="sparkles-outline" size={18} color="#000" style={styles.aiIcon} />
                      <Text style={styles.aiButtonTextMask} numberOfLines={1}>
                        Generiši sa AI
                      </Text>
                    </View>
                  </View>
                }
              >
                {/* gradient fill for text */}
                <Animated.View style={[styles.aiGradientBase, animatedGradientStyle]}>
                  <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                </Animated.View>
              </MaskedView>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.saveCta, { backgroundColor: colors.primary }, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="person-circle-outline" size={18} color="#fff" style={styles.saveCtaIcon} />
              <Text style={styles.saveCtaText}>Sačuvaj avatar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      marginTop: 100,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
      gap: 16,
    },
    hero: {
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
    },
    previewWrapper: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      paddingHorizontal: 12,
    },
    heroImage: {
      width: '100%',
      borderRadius: 16,
    },
    title: {
      color: colors.text_primary,
      fontSize: 24,
      fontWeight: '800',
      textAlign: 'center',
    },
    subtitle: {
      color: colors.text_secondary,
      fontSize: 14,
      marginTop: 4,
      lineHeight: 20,
      textAlign: 'center',
    },
    previewCircle: {
      paddingVertical: 12,
      paddingHorizontal: 12,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      position: 'relative',
    },

    selectorBar: {
      paddingTop: 0,
      paddingBottom: 12,
      borderBottomWidth: 0,
      elevation: 2,
      zIndex: 2,
    },
    tabs: {
      paddingHorizontal: 10,
      paddingBottom: 8,
    },
    tabRow: {
      gap: 10,
      paddingVertical: 4,
    },
    tabChip: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    tabChipActive: {
      backgroundColor: colors.background,
    },
    tabChipText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text_secondary,
    },

    optionsPanel: {
      marginTop: 0,
      paddingVertical: 8,
      paddingHorizontal: 0,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderLeftWidth: 0,
      borderRightWidth: 0,
    },
    optionsRow: {
      gap: 12,
      paddingVertical: 6,
      paddingHorizontal: 0,
    },
    optionCard: {
      width: 140,
      paddingVertical: 14,
      paddingHorizontal: 12,
      backgroundColor: colors.surface,
      height: 140,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    optionCardActive: {
      backgroundColor: colors.background,
      elevation: 5,
    },
    optionEmoji: {
      fontSize: 32,
      color: colors.text_secondary,
    },
    optionText: {
      fontSize: 16,
      color: colors.text_secondary,
      fontWeight: '700',
      textAlign: 'center',
    },
    optionTextActive: {
      color: colors.primary,
    },
    swatch: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
    },

    saveButton: {
      paddingHorizontal: 8,
      paddingVertical: 6,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: colors.text_primary,
      fontWeight: '500',
      fontSize: 16,
    },

    bottomBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingBottom: 32,
      paddingTop: 12,
      backgroundColor: colors.background,
      gap: 12,
    },

    aiButton: {
      flex: 1,
      height: 57,
    },
    aiBorder: {
      padding: 1.5,
      borderRadius: 20,
      height: 57,
      overflow: 'hidden',
      backgroundColor: colors.background,
      position: 'relative',
    },
    aiBorderPressed: {
      backgroundColor: colors.surface,
    },

    // ✅ was missing in your snippet, but used in JSX
    aiBorderFill: {
      position: 'absolute',
      top: -80,
      left: -320,
      width: 820,
      height: 220,
    },

    aiButtonInner: {
      borderRadius: 19,
      height: 54,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      width: '99.9%',
    },
    aiButtonInnerPressed: {
      backgroundColor: colors.surface,
      opacity: 0.95,
    },

    // ✅ MaskedView MUST have explicit height to align vertically reliably
    aiMask: {
      height: 54,
      width: '100%',
    },

    // ✅ This controls vertical centering of the mask
    aiMaskElement: {
      height: 54,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },

    aiMaskRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },

    aiIcon: {
      marginRight: 6,
    },

    aiButtonTextMask: {
      fontWeight: '700',
      fontSize: 16,
      color: '#000',
      // On Android this can affect perceived vertical centering:
      includeFontPadding: false,
      textAlignVertical: 'center',
    },

    // gradient sheet that moves
    aiGradientBase: {
      position: 'absolute',
      top: -80,
      left: -320,
      width: 820,
      height: 220,
    },

    saveCta: {
      flex: 1,
      borderRadius: 20,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      height: 55,
    },
    saveCtaText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
    saveCtaIcon: {
      marginRight: 4,
    },

    genderBadge: {
      position: 'absolute',
      top: '50%',
      marginTop: -20,
      width: 52,
      height: 52,
      borderRadius: 26,
      borderWidth: 0,
      backgroundColor: colors.surfaceDark || colors.surface,
      alignItems: 'center',
      elevation: 4,
      justifyContent: 'center',
      overflow: 'hidden',
    },
    genderBadgeLeft: {
      left: 5,
    },
    genderBadgeRight: {
      right: 5,
    },
    genderBadgeBorderLeft: {
      borderColor: '#3b82f6',
    },
    genderBadgeBorderRight: {
      borderColor: '#ec4899',
    },
    genderBadgeInner: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.28,
    },
    genderBadgeInnerLeft: {
      backgroundColor: '#3b82f6',
    },
    genderBadgeInnerRight: {
      backgroundColor: '#ec4899',
    },
    shuffleIconMirrored: {
      transform: [{ rotateY: '180deg' }],
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    modalCard: {
      width: '100%',
      borderRadius: 16,
      padding: 20,
      gap: 10,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text_primary,
    },
    modalText: {
      fontSize: 15,
      color: colors.text_secondary,
      lineHeight: 20,
    },
    modalClose: {
      alignSelf: 'flex-end',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: colors.primary,
    },
    modalCloseText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 14,
    },
  });
