import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { updateCurrentUser } from '../api';
import { emitProfileUpdated } from '../utils/profileEvents';
import Avatar from '../components/Avatar';
import BottomCTA from '../components/BottomCTA';
import defaultConfig from '../../assets/json/avatarDefaultConfig.json';
import colorsData from '../../assets/json/avatarColors.json';
import optionGroupsData from '../../assets/json/avatarOptionGroups.json';
import tabsData from '../../assets/json/avatarTabs.json';

const sampleHeroUri =
  'https://cdn.dribbble.com/userupload/30645890/file/original-500c027610acebba14fe69de5572dcdd.png?resize=752x&vertical=center';

const { hairColors, hairColorGradients, clotheColors, skinColors } = colorsData;
const { tabOrder = [], tabLabels = {} } = tabsData;

const optionGroups = optionGroupsData.map((group) => {
  if (group.key === 'hairColor') {
    return {
      ...group,
      options: group.options.map((option) => ({
        ...option,
        swatch: hairColors[option.value],
        swatchGradient: hairColorGradients[option.value],
      })),
    };
  }
  if (group.key === 'clotheColor') {
    return {
      ...group,
      options: group.options.map((option) => ({
        ...option,
        swatch: clotheColors[option.value],
      })),
    };
  }
  if (group.key === 'skinColor') {
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
  .map((key) => {
    const group = optionGroups.find((item) => item.key === key);
    if (!group) return null;
    return { ...group, label: tabLabels[key] || group.label };
  })
  .filter(Boolean);

const buildAvatarParams = (config) =>
  new URLSearchParams({
    avatarStyle: 'Circle',
    topType: config.topType,
    accessoriesType: config.accessoriesType,
    hairColor: config.hairColor,
    facialHairType: config.facialHairType,
    clotheType: config.clotheType,
    clotheColor: config.clotheColor,
    eyeType: config.eyeType,
    eyebrowType: config.eyebrowType,
    mouthType: config.mouthType,
    skinColor: config.skinColor,
  });

const buildAvatarSvgUrl = (config) => `https://avataaars.io/?${buildAvatarParams(config).toString()}`;

export default function AvatarGeneratorScreen({ navigation, route }) {
  const seedConfig = route?.params?.seedConfig;
  const [config, setConfig] = useState(() => ({ ...defaultConfig, ...(seedConfig || {}) }));
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(orderedOptionGroups[0]?.key || optionGroups[0].key);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const avatarSvgUrl = useMemo(() => buildAvatarSvgUrl(config), [config]);

  const handleSelect = useCallback((key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const { data } = await updateCurrentUser({ profile_photo: avatarSvgUrl });
      emitProfileUpdated(data);
      Alert.alert('Avatar sačuvan', 'Tvoj novi avatar je postavljen kao profilna slika.');
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
      setConfig((prev) => ({ ...prev, ...route.params.preset }));
    }
  }, [route?.params?.preset]);

  const activeGroup = orderedOptionGroups.find((group) => group.key === activeTab);

  return (
    <View style={styles.screen}>
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
            <Avatar uri={avatarSvgUrl} name="Avatar" variant="avatar-xxl" />
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <BottomCTA
        label="Sačuvaj avatar"
        iconName="person-circle-outline"
        onPress={handleSave}
        fixed
        style={{ paddingHorizontal: 16, paddingBottom: 50 }}
      />
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
      fontWeight: '700',
      fontSize: 15,
    },
  });
