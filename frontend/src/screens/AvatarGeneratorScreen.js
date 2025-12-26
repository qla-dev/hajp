import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
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

export default function AvatarGeneratorScreen({ navigation, route }) {
  const seedConfig = route?.params?.seedConfig;
  const [config, setConfig] = useState(() => enforceCirclePurple({ ...defaultConfig, ...(seedConfig || {}) }));
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(orderedOptionGroups[0]?.key || optionGroups[0].key);
  const [showAiModal, setShowAiModal] = useState(false);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const avatarSvgUrl = useMemo(() => buildAvatarSvg(config), [config]);

  const handleSelect = useCallback((key, value) => {
    setConfig((prev) => enforceCirclePurple({ ...prev, [key]: value }));
  }, []);

  const handleRandomGender = useCallback(
    (gender) => {
      const next = generateRandomConfig({ gender, circleBg: true });
      setConfig(enforceCirclePurple(next));
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (saving) return;
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
  }, [avatarSvgUrl, navigation, saving]);

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
          {saving ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={styles.saveButtonText}>Sačuvaj</Text>}
        </TouchableOpacity>
      ),
    });
  }, [colors.primary, handleSave, navigation, saving, styles]);

  useEffect(() => {
    if (route?.params?.preset) {
      setConfig((prev) => enforceCirclePurple({ ...prev, ...route.params.preset }));
    }
  }, [route?.params?.preset]);

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
              Uskoro stiže generisanje avatara putem AI. Do tada koristi postojeće opcije i sacuvaj izgled.
            </Text>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowAiModal(false)} activeOpacity={0.9}>
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsRow}>
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
                      <Text style={[styles.optionEmoji, active && { color: colors.primary }]}>{option.emoji || '??'}</Text>
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

      <ScrollView style={styles.container} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="always">
        <View style={styles.hero}>
          <Image source={{ uri: sampleHeroUri }} style={styles.heroImage} resizeMode="contain" />
          <Text style={styles.title}>Avatar generator</Text>
          <Text style={styles.subtitle}>Centriraj izgled, podesi ton, kosu i detalje.</Text>
          <View style={styles.previewCircle}>
            <Avatar
              uri={avatarSvgUrl}
              avatarConfig={config}
              bgMode="default"
              name="Avatar"
              variant="avatar-xxl"
              zoomModal={false}
            />
            <TouchableOpacity
              style={[styles.genderBadge, styles.genderBadgeLeft]}
              activeOpacity={0.85}
              onPress={() => handleRandomGender('male')}
            >
              <Ionicons name="male" size={18} color="#fff" />
              <Ionicons name="shuffle-outline" size={16} color="#fff" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderBadge, styles.genderBadgeRight]}
              activeOpacity={0.85}
              onPress={() => handleRandomGender('female')}
            >
              <Ionicons name="female" size={18} color="#fff" />
              <Ionicons name="shuffle-outline" size={16} color="#fff" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.aiButton}
          onPress={() => setShowAiModal(true)}
        >
          <LinearGradient
            colors={['#4f9bfd', '#b794f4', '#34d399']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiBorder}
          >
            <View style={styles.aiButtonInner}>
              <MaskedView maskElement={<Ionicons name="sparkles-outline" size={18} color="#000" />}>
                <LinearGradient
                  colors={['#4f9bfd', '#b794f4', '#34d399']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="sparkles-outline" size={18} color="transparent" />
                </LinearGradient>
              </MaskedView>
              <MaskedView maskElement={<Text style={[styles.aiButtonText, styles.aiButtonTextMask]}>Generiši sa AI</Text>}>
                <LinearGradient
                  colors={['#4f9bfd', '#b794f4', '#34d399']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={[styles.aiButtonText, styles.aiButtonTextFill]}>Generiši sa AI</Text>
                </LinearGradient>
              </MaskedView>
            </View>
          </LinearGradient>
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
      height: 55,
    },
    aiBorder: {
      padding: 1.5,
      borderRadius: 20,
      height: '100%',
    },
    aiButtonInner: {
      borderRadius: 19,
      paddingVertical: 12,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.background,
      height: '100%',
    },
    aiButtonText: {
      fontWeight: '700',
      fontSize: 16,
    },
    aiButtonTextMask: {
      color: '#000',
    },
    aiButtonTextFill: {
      color: 'transparent',
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
      bottom: 12,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      elevation: 4,
    },
    genderBadgeLeft: {
      left: 12,
      backgroundColor: '#3b82f6',
    },
    genderBadgeRight: {
      right: 12,
      backgroundColor: '#ec4899',
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
