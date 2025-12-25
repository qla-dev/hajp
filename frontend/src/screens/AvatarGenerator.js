import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, Image, Platform } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { updateCurrentUser } from '../api';
import { emitProfileUpdated } from '../utils/profileEvents';

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
    key: 'topType',
    label: 'Hair',
    options: [
      { value: 'LongHairCurly', label: 'Curly' },
      { value: 'LongHairStraight', label: 'Straight' },
      { value: 'LongHairBob', label: 'Bob' },
      { value: 'ShortHairShortFlat', label: 'Short' },
      { value: 'ShortHairDreads01', label: 'Dreads' },
      { value: 'NoHair', label: 'No hair' },
    ],
  },
  {
    key: 'hairColor',
    label: 'Hair color',
    options: Object.entries(hairColors).map(([value, swatch]) => ({ value, label: value.replace(/([A-Z])/g, ' $1').trim(), swatch })),
  },
  {
    key: 'accessoriesType',
    label: 'Accessories',
    options: [
      { value: 'Blank', label: 'None' },
      { value: 'Round', label: 'Glasses' },
      { value: 'Kurt', label: 'Sunnies' },
      { value: 'Prescription01', label: 'Optic 1' },
      { value: 'Prescription02', label: 'Optic 2' },
      { value: 'Wayfarers', label: 'Wayfarer' },
    ],
  },
  {
    key: 'clotheType',
    label: 'Outfit',
    options: [
      { value: 'BlazerShirt', label: 'Blazer' },
      { value: 'Hoodie', label: 'Hoodie' },
      { value: 'ShirtCrewNeck', label: 'Crew' },
      { value: 'ShirtScoopNeck', label: 'Scoop' },
      { value: 'Overall', label: 'Overall' },
    ],
  },
  {
    key: 'eyeType',
    label: 'Eyes',
    options: [
      { value: 'Default', label: 'Default' },
      { value: 'Happy', label: 'Happy' },
      { value: 'Wink', label: 'Wink' },
      { value: 'Surprised', label: 'Surprised' },
      { value: 'Squint', label: 'Squint' },
    ],
  },
  {
    key: 'eyebrowType',
    label: 'Brows',
    options: [
      { value: 'Default', label: 'Default' },
      { value: 'RaisedExcitedNatural', label: 'Raised' },
      { value: 'UpDownNatural', label: 'Up/Down' },
      { value: 'AngryNatural', label: 'Bold' },
      { value: 'FlatNatural', label: 'Flat' },
    ],
  },
  {
    key: 'mouthType',
    label: 'Mouth',
    options: [
      { value: 'Default', label: 'Neutral' },
      { value: 'Smile', label: 'Smile' },
      { value: 'Twinkle', label: 'Twinkle' },
      { value: 'Serious', label: 'Serious' },
      { value: 'Disbelief', label: 'Chill' },
    ],
  },
  {
    key: 'skinColor',
    label: 'Skin tone',
    options: Object.entries(skinColors).map(([value, swatch]) => ({ value, label: value.replace(/([A-Z])/g, ' $1').trim(), swatch })),
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

const AvatarPreview = ({ svgUrl }) =>
  Platform.OS === 'web' ? (
    <Image source={{ uri: svgUrl }} style={{ width: 220, height: 220 }} resizeMode="contain" />
  ) : (
    <SvgUri uri={svgUrl} width={220} height={220} />
  );

export default function AvatarGenerator({ navigation, route }) {
  const seedConfig = route?.params?.seedConfig;
  const [config, setConfig] = useState(() => ({ ...defaultConfig, ...(seedConfig || {}) }));
  const [saving, setSaving] = useState(false);
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="always">
      <View style={styles.hero}>
        <View>
          <Text style={styles.eyebrow}>Clean & playful</Text>
          <Text style={styles.title}>Napravi svoj avatar</Text>
          <Text style={styles.subtitle}>Podešavaj kosu, oči i detalje, zatim ga postavi kao profilnu fotku.</Text>
        </View>
        <View style={styles.previewCard}>
          <View style={styles.previewCircle}>
            <AvatarPreview svgUrl={avatarSvgUrl} />
          </View>
          <View style={styles.previewPills}>
            <View style={styles.previewPill}>
              <Ionicons name="sparkles-outline" size={14} color={colors.primary} />
              <Text style={styles.previewPillText}>svg</Text>
            </View>
            <View style={styles.previewPill}>
              <Ionicons name="color-palette-outline" size={14} color={colors.text_secondary} />
              <Text style={styles.previewPillText}>tonovi</Text>
            </View>
            <View style={styles.previewUrl}>
              <Text style={styles.previewUrlLabel}>SVG url za spremanje</Text>
              <Text style={styles.previewUrlValue} numberOfLines={1} selectable>
                {avatarSvgUrl}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {optionGroups.map((group) => (
        <View key={group.key} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>{group.label}</Text>
            <View style={styles.dotRow}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <View style={[styles.dot, { backgroundColor: colors.border }]} />
              <View style={[styles.dot, { backgroundColor: colors.text_secondary }]} />
            </View>
          </View>
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

      <TouchableOpacity style={styles.primaryButton} onPress={handleSave} disabled={saving} activeOpacity={0.9}>
        {saving ? <ActivityIndicator color={colors.textLight} /> : <Text style={styles.primaryButtonText}>Sačuvaj avatar</Text>}
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
      padding: 16,
      paddingBottom: 32,
      gap: 16,
    },
    hero: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 14,
      shadowColor: colors.primary,
      shadowOpacity: 0.15,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
    eyebrow: {
      color: colors.text_secondary,
      fontWeight: '600',
      letterSpacing: 0.5,
      fontSize: 12,
      marginBottom: 4,
    },
    title: {
      color: colors.text_primary,
      fontSize: 22,
      fontWeight: '800',
    },
    subtitle: {
      color: colors.text_secondary,
      fontSize: 14,
      marginTop: 4,
      lineHeight: 20,
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
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    previewPills: {
      gap: 8,
      flex: 1,
    },
    previewPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.transparent,
      alignSelf: 'flex-start',
    },
    previewPillText: {
      color: colors.text_secondary,
      fontWeight: '700',
      fontSize: 12,
      textTransform: 'lowercase',
    },
    previewUrl: {
      marginTop: 6,
      padding: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.transparent,
      gap: 4,
    },
    previewUrlLabel: {
      fontSize: 11,
      color: colors.text_secondary,
      fontWeight: '700',
    },
    previewUrlValue: {
      fontSize: 11,
      color: colors.text_primary,
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    sectionLabel: {
      color: colors.text_primary,
      fontSize: 16,
      fontWeight: '800',
    },
    dotRow: {
      flexDirection: 'row',
      gap: 6,
      alignItems: 'center',
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      opacity: 0.8,
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
      marginTop: 4,
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOpacity: 0.24,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 5,
    },
    primaryButtonText: {
      color: colors.textLight,
      fontWeight: '800',
      fontSize: 15,
      letterSpacing: 0.3,
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
