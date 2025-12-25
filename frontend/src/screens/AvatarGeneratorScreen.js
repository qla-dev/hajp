import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { updateCurrentUser } from '../api';
import { emitProfileUpdated } from '../utils/profileEvents';
import Avatar from '../components/Avatar';
import BottomCTA from '../components/BottomCTA';

const sampleHeroUri =
  'https://cdn.dribbble.com/userupload/30645890/file/original-500c027610acebba14fe69de5572dcdd.png?resize=752x&vertical=center';

const defaultConfig = {
  avatarStyle: 'Circle',
  topType: 'LongHairCurly',
  accessoriesType: 'Blank',
  hairColor: 'BrownDark',
  facialHairType: 'Blank',
  clotheType: 'BlazerShirt',
  eyeType: 'Default',
  eyebrowType: 'Default',
  mouthType: 'Default',
  skinColor: 'Light',
};

const hairColors = {
  Auburn: '#A55728',
  Black: '#2C1B18',
  Blonde: '#B58143',
  BlondeGolden: '#D6A57B',
  Brown: '#724133',
  BrownDark: '#4A312C',
  PastelPink: '#F4C1C4',
  Platinum: '#ECDCBF',
  Red: '#C65F48',
  SilverGray: '#E8E1E1',
};

const skinColors = {
  Tanned: '#F1C27D',
  Yellow: '#F9D976',
  Pale: '#FFDBB4',
  Light: '#F2D3B1',
  Brown: '#D1A3A4',
  DarkBrown: '#A1665E',
  Black: '#533724',
};

const optionGroups = [
  {
    key: 'skinColor',
    label: 'Koža',
    options: Object.entries(skinColors).map(([value, swatch]) => ({ value, label: value.replace(/([A-Z])/g, ' $1').trim(), swatch })),
  },
  {
    key: 'topType',
    label: 'Frizura',
    options: [
      { value: 'LongHairCurly', label: 'Kovrdžava' },
      { value: 'LongHairStraight', label: 'Ravna' },
      { value: 'LongHairBob', label: 'Bob' },
      { value: 'ShortHairShortFlat', label: 'Kratka' },
      { value: 'ShortHairDreads01', label: 'Dredovi' },
      { value: 'NoHair', label: 'Bez kose' },
    ],
  },
  {
    key: 'hairColor',
    label: 'Boja kose',
    options: Object.entries(hairColors).map(([value, swatch]) => ({ value, label: value.replace(/([A-Z])/g, ' $1').trim(), swatch })),
  },
  {
    key: 'eyeType',
    label: 'Oči',
    options: [
      { value: 'Default', label: 'Standard' },
      { value: 'Happy', label: 'Sretne' },
      { value: 'Wink', label: 'Namig' },
      { value: 'Surprised', label: 'Iznenađene' },
      { value: 'Squint', label: 'Zatvorene' },
    ],
  },
  {
    key: 'eyebrowType',
    label: 'Obrve',
    options: [
      { value: 'Default', label: 'Standard' },
      { value: 'RaisedExcitedNatural', label: 'Podignute' },
      { value: 'UpDownNatural', label: 'Up/Down' },
      { value: 'AngryNatural', label: 'Jake' },
      { value: 'FlatNatural', label: 'Ravne' },
    ],
  },
  {
    key: 'mouthType',
    label: 'Usta',
    options: [
      { value: 'Default', label: 'Neutral' },
      { value: 'Smile', label: 'Osmijeh' },
      { value: 'Twinkle', label: 'Twinkle' },
      { value: 'Serious', label: 'Ozbiljna' },
      { value: 'Disbelief', label: 'Cool' },
    ],
  },
];

const buildAvatarParams = (config) =>
  new URLSearchParams({
    avatarStyle: config.avatarStyle,
    topType: config.topType,
    accessoriesType: config.accessoriesType,
    hairColor: config.hairColor,
    facialHairType: config.facialHairType,
    clotheType: config.clotheType,
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
  const [activeTab, setActiveTab] = useState(optionGroups[0].key);
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
      console.log('[AvatarGenerator] saving avatar', { svg: avatarSvgUrl });
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

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="always">
        <View style={styles.hero}>
          <Image source={{ uri: sampleHeroUri }} style={styles.heroImage} resizeMode="contain" />
          <Text style={styles.title}>Avatar generator</Text>
          <Text style={styles.subtitle}>Centriraj izgled, podesi ton, kosu i detalje.</Text>
          <View style={styles.previewCircle}>
            <Avatar uri={avatarSvgUrl} name="Avatar" variant="avatar-xxl" />
          </View>
        </View>

        <View style={styles.tabs}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
            {optionGroups.map((group) => {
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
        </View>

        {optionGroups
          .filter((group) => group.key === activeTab)
          .map((group) => (
            <View key={group.key} style={styles.optionsPanel}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsRow}>
                {group.options.map((option) => {
                  const active = config[group.key] === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => handleSelect(group.key, option.value)}
                      style={[styles.optionCard, active && [styles.optionCardActive, { borderColor: colors.primary }]]}
                      activeOpacity={0.9}
                    >
                      {option.swatch ? (
                        <View style={[styles.swatch, { backgroundColor: option.swatch }]} />
                      ) : (
                        <Text style={[styles.optionEmoji, active && { color: colors.primary }]}>☺</Text>
                      )}
                      <Text style={[styles.optionText, active && styles.optionTextActive]} numberOfLines={1}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      <BottomCTA
        label="Sačuvaj avatar"
        iconName="person-circle-outline"
        onPress={handleSave}
        fixed
        style={{ paddingHorizontal: 16, paddingBottom: 50 }}
      />
    </>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
      gap: 16,
    },
    hero: {
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
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
    previewCard: {
      backgroundColor: colors.background,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    previewCircle: {
      paddingVertical: 12,
      paddingHorizontal: 12,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
    },
    tabs: {
      paddingTop: 6,
      paddingBottom: 6,
    },
    tabRow: {
      gap: 8,
      paddingHorizontal: 4,
    },
    tabChip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    tabChipActive: {
      backgroundColor: colors.background,
    },
    tabChipText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text_secondary,
    },
    optionsPanel: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionsRow: {
      gap: 10,
      paddingVertical: 4,
    },
    optionCard: {
      width: 100,
      padding: 10,
      backgroundColor: colors.background,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      gap: 6,
    },
    optionCardActive: {
      backgroundColor: colors.surface,
      shadowColor: colors.primary,
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    optionEmoji: {
      fontSize: 18,
      color: colors.text_secondary,
    },
    optionText: {
      fontSize: 13,
      color: colors.text_secondary,
      fontWeight: '600',
      textAlign: 'center',
    },
    optionTextActive: {
      color: colors.primary,
    },
    swatch: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    primaryButton: {
      display: 'none',
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
