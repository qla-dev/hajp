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
  topType: 'LongHairCurly',
  accessoriesType: 'Blank',
  hairColor: 'BrownDark',
  facialHairType: 'Blank',
  clotheType: 'BlazerShirt',
  clotheColor: 'Black',
  eyeType: 'Default',
  eyebrowType: 'Default',
  mouthType: 'Default',
  skinColor: 'Light',
};

const hairColors = {
  Auburn: '#A55728',
  Black: '#2C1B18',
  Blue: '#65C9FF',
  Blonde: '#B58143',
  BlondeGolden: '#D6A57B',
  Brown: '#724133',
  BrownDark: '#4A312C',
  PastelPink: '#F4C1C4',
  Platinum: '#ECDCBF',
  Red: '#C65F48',
  SilverGray: '#E8E1E1',
};

const clotheColors = {
  Black: '#262E33',
  Blue01: '#65C9FF',
  Blue02: '#5199E4',
  Blue03: '#25557C',
  Gray01: '#E6E6E6',
  Gray02: '#929598',
  Heather: '#3C4F5C',
  PastelBlue: '#B1E2FF',
  PastelGreen: '#A7FFC4',
  PastelOrange: '#FFDEB5',
  PastelRed: '#FFAFB9',
  PastelYellow: '#FFFFB1',
  Pink: '#FF488E',
  Red: '#FF5C5C',
  White: '#FFFFFF',
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
    label: 'Frizura',
    options: [
      { value: 'NoHair', label: 'Bez kose', emoji: '🧑‍🦲' },
      { value: 'Eyepatch', label: 'Povez na oku', emoji: '🏴‍☠️' },
      { value: 'Hat', label: 'Šešir', emoji: '🎩' },
      { value: 'Hijab', label: 'Hidžab', emoji: '🧕' },
      { value: 'Turban', label: 'Turban', emoji: '👳' },
      { value: 'WinterHat1', label: 'Zimska kapa 1', emoji: '🧢' },
      { value: 'WinterHat2', label: 'Zimska kapa 2', emoji: '🧢' },
      { value: 'WinterHat3', label: 'Zimska kapa 3', emoji: '🧢' },
      { value: 'WinterHat4', label: 'Zimska kapa 4', emoji: '🧢' },
      { value: 'LongHairBigHair', label: 'Duga kosa - bujna', emoji: '💁' },
      { value: 'LongHairBob', label: 'Duga kosa - bob', emoji: '💇' },
      { value: 'LongHairBun', label: 'Duga kosa - punđa', emoji: '💁‍♀️' },
      { value: 'LongHairCurly', label: 'Duga kosa - kovrdžava', emoji: '💁‍♂️' },
      { value: 'LongHairCurvy', label: 'Duga kosa - talasi', emoji: '💁' },
      { value: 'LongHairDreads', label: 'Duga kosa - dredovi', emoji: '🧑‍🦱' },
      { value: 'LongHairFrida', label: 'Frida stil', emoji: '🌺' },
      { value: 'LongHairFro', label: 'Afro duga', emoji: '🦱' },
      { value: 'LongHairFroBand', label: 'Afro s trakom', emoji: '🎀' },
      { value: 'LongHairNotTooLong', label: 'Duga kosa - srednja', emoji: '💇' },
      { value: 'LongHairShavedSides', label: 'Duga s izbrijanim stranama', emoji: '✂️' },
      { value: 'LongHairMiaWallace', label: 'Mia Wallace', emoji: '💃' },
      { value: 'LongHairStraight', label: 'Duga kosa - ravna', emoji: '💇‍♀️' },
      { value: 'LongHairStraight2', label: 'Duga kosa - ravna 2', emoji: '💇‍♀️' },
      { value: 'LongHairStraightStrand', label: 'Duga kosa - pramen', emoji: '🧵' },
      { value: 'ShortHairDreads01', label: 'Kratki dredovi 1', emoji: '🧑‍🦱' },
      { value: 'ShortHairDreads02', label: 'Kratki dredovi 2', emoji: '🧑‍🦱' },
      { value: 'ShortHairFrizzle', label: 'Kovrdžava kratka', emoji: '🌀' },
      { value: 'ShortHairShaggyMullet', label: 'Šegi mullet', emoji: '🦊' },
      { value: 'ShortHairShortCurly', label: 'Kratka kovrdžava', emoji: '🌀' },
      { value: 'ShortHairShortFlat', label: 'Kratka ravna', emoji: '✂️' },
      { value: 'ShortHairShortRound', label: 'Kratka zaobljena', emoji: '⭕️' },
      { value: 'ShortHairShortWaved', label: 'Kratka valovita', emoji: '🌊' },
      { value: 'ShortHairSides', label: 'Kratka sa stranama', emoji: '📐' },
      { value: 'ShortHairTheCaesar', label: 'Cezar', emoji: '🏺' },
      { value: 'ShortHairTheCaesarSidePart', label: 'Cezar sa razdjeljkom', emoji: '📏' },
    ],
  },
  {
    key: 'accessoriesType',
    label: 'Dodaci',
    options: [
      { value: 'Blank', label: 'Bez dodataka', emoji: '✨' },
      { value: 'Kurt', label: 'Kurt naočale', emoji: '😎' },
      { value: 'Prescription01', label: 'Naočale 1', emoji: '👓' },
      { value: 'Prescription02', label: 'Naočale 2', emoji: '👓' },
      { value: 'Round', label: 'Okrugle naočale', emoji: '🕶️' },
      { value: 'Sunglasses', label: 'Sunčane naočale', emoji: '🕶️' },
      { value: 'Wayfarers', label: 'Wayfarer naočale', emoji: '🕶️' },
    ],
  },
  {
    key: 'hairColor',
    label: 'Boja kose',
    options: [
      { value: 'Auburn', label: 'Kesten', swatch: hairColors.Auburn },
      { value: 'Black', label: 'Crna', swatch: hairColors.Black },
      { value: 'Blue', label: 'Plava', swatch: hairColors.Blue },
      { value: 'Blonde', label: 'Plava svijetla', swatch: hairColors.Blonde },
      { value: 'BlondeGolden', label: 'Plava zlatna', swatch: hairColors.BlondeGolden },
      { value: 'Brown', label: 'Smeđa', swatch: hairColors.Brown },
      { value: 'BrownDark', label: 'Tamno smeđa', swatch: hairColors.BrownDark },
      { value: 'PastelPink', label: 'Pastelno roza', swatch: hairColors.PastelPink },
      { value: 'Platinum', label: 'Platinasta', swatch: hairColors.Platinum },
      { value: 'Red', label: 'Crvena', swatch: hairColors.Red },
      { value: 'SilverGray', label: 'Srebrno siva', swatch: hairColors.SilverGray },
    ],
  },
  {
    key: 'facialHairType',
    label: 'Brada i brkovi',
    options: [
      { value: 'Blank', label: 'Bez brade', emoji: '🙂' },
      { value: 'BeardMedium', label: 'Brada srednja', emoji: '🧔' },
      { value: 'BeardLight', label: 'Brada svijetla', emoji: '🧔‍♂️' },
      { value: 'BeardMajestic', label: 'Impozantna brada', emoji: '🧔‍♀️' },
      { value: 'MoustacheFancy', label: 'Ufrizirani brkovi', emoji: '👨' },
      { value: 'MoustacheMagnum', label: 'Magnum brkovi', emoji: '👨‍🦰' },
    ],
  },
  {
    key: 'clotheType',
    label: 'Odjeća',
    options: [
      { value: 'BlazerShirt', label: 'Sako + košulja', emoji: '🧥' },
      { value: 'BlazerSweater', label: 'Sako + džemper', emoji: '🧥' },
      { value: 'CollarSweater', label: 'Džemper s kragnom', emoji: '🧶' },
      { value: 'GraphicShirt', label: 'Majica s printom', emoji: '👕' },
      { value: 'Hoodie', label: 'Dukserica', emoji: '🧥' },
      { value: 'Overall', label: 'Tregerice', emoji: '👖' },
      { value: 'ShirtCrewNeck', label: 'Majica (okrugli izrez)', emoji: '👕' },
      { value: 'ShirtScoopNeck', label: 'Majica (široki izrez)', emoji: '👚' },
      { value: 'ShirtVNeck', label: 'Majica (V-izrez)', emoji: '👕' },
    ],
  },
  {
    key: 'clotheColor',
    label: 'Boja odjeće',
    options: Object.entries(clotheColors).map(([value, swatch]) => {
      const labels = {
        Black: 'Crna',
        Blue01: 'Plava 01',
        Blue02: 'Plava 02',
        Blue03: 'Plava 03',
        Gray01: 'Siva 01',
        Gray02: 'Siva 02',
        Heather: 'Melirano',
        PastelBlue: 'Pastel plava',
        PastelGreen: 'Pastel zelena',
        PastelOrange: 'Pastel narandžasta',
        PastelRed: 'Pastel crvena',
        PastelYellow: 'Pastel žuta',
        Pink: 'Roza',
        Red: 'Crvena',
        White: 'Bijela',
      };
      return { value, label: labels[value] || value, swatch };
    }),
  },
  {
    key: 'eyeType',
    label: 'Oči',
    options: [
      { value: 'Close', label: 'Zatvorene', emoji: '😌' },
      { value: 'Cry', label: 'Plačne', emoji: '😭' },
      { value: 'Default', label: 'Standard', emoji: '👀' },
      { value: 'Dizzy', label: 'Zbunjene', emoji: '😵' },
      { value: 'EyeRoll', label: 'Prevrtanje', emoji: '🙄' },
      { value: 'Happy', label: 'Sretne', emoji: '😊' },
      { value: 'Hearts', label: 'Srca', emoji: '😍' },
      { value: 'Side', label: 'Na stranu', emoji: '👁️' },
      { value: 'Squint', label: 'Poluzatvorene', emoji: '😑' },
      { value: 'Surprised', label: 'Iznenađene', emoji: '😮' },
      { value: 'Wink', label: 'Namig', emoji: '😉' },
      { value: 'WinkWacky', label: 'Namig (šaljivo)', emoji: '😜' },
    ],
  },
  {
    key: 'eyebrowType',
    label: 'Obrve',
    options: [
      { value: 'Angry', label: 'Ljute', emoji: '😠' },
      { value: 'AngryNatural', label: 'Ljute prirodne', emoji: '😡' },
      { value: 'Default', label: 'Standard', emoji: '🙂' },
      { value: 'DefaultNatural', label: 'Standard prirodne', emoji: '😊' },
      { value: 'FlatNatural', label: 'Ravne', emoji: '😐' },
      { value: 'RaisedExcited', label: 'Podignute', emoji: '😲' },
      { value: 'RaisedExcitedNatural', label: 'Podignute prirodne', emoji: '🤨' },
      { value: 'SadConcerned', label: 'Zabrinute', emoji: '😟' },
      { value: 'SadConcernedNatural', label: 'Zabrinute prirodne', emoji: '😔' },
      { value: 'UnibrowNatural', label: 'Spajene obrve', emoji: '🤨' },
      { value: 'UpDown', label: 'Gore-dolje', emoji: '😯' },
      { value: 'UpDownNatural', label: 'Gore-dolje prirodne', emoji: '😯' },
    ],
  },
  {
    key: 'mouthType',
    label: 'Usta',
    options: [
      { value: 'Concerned', label: 'Zabrinuta', emoji: '😟' },
      { value: 'Default', label: 'Neutralna', emoji: '😐' },
      { value: 'Disbelief', label: 'Nevjerica', emoji: '😲' },
      { value: 'Eating', label: 'Jede', emoji: '😋' },
      { value: 'Grimace', label: 'Grimas', emoji: '😬' },
      { value: 'Sad', label: 'Tužna', emoji: '😢' },
      { value: 'ScreamOpen', label: 'Vrisak', emoji: '😱' },
      { value: 'Serious', label: 'Ozbiljna', emoji: '😑' },
      { value: 'Smile', label: 'Osmijeh', emoji: '😄' },
      { value: 'Tongue', label: 'Jezik', emoji: '😛' },
      { value: 'Twinkle', label: 'Iskra', emoji: '🤩' },
      { value: 'Vomit', label: 'Povraća', emoji: '🤮' },
    ],
  },
  {
    key: 'skinColor',
    label: 'Koža',
    options: [
      { value: 'Tanned', label: 'Preplanula', swatch: skinColors.Tanned },
      { value: 'Yellow', label: 'Žuta', swatch: skinColors.Yellow },
      { value: 'Pale', label: 'Svijetla', swatch: skinColors.Pale },
      { value: 'Light', label: 'Blijeda', swatch: skinColors.Light },
      { value: 'Brown', label: 'Smeđa', swatch: skinColors.Brown },
      { value: 'DarkBrown', label: 'Tamno smeđa', swatch: skinColors.DarkBrown },
      { value: 'Black', label: 'Crna', swatch: skinColors.Black },
    ],
  },
];

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

  const activeGroup = optionGroups.find((group) => group.key === activeTab);

  return (
    <View style={styles.screen}>
      <View style={[styles.selectorBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
          style={styles.tabs}
        >
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

        {activeGroup ? (
          <View style={[styles.optionsPanel, { borderColor: colors.border, backgroundColor: colors.background }]}>
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
                    {option.swatch ? (
                      <View style={[styles.swatch, { backgroundColor: option.swatch }]} />
                    ) : (
                      <Text style={[styles.optionEmoji, active && { color: colors.primary }]}>{option.emoji || '🙂'}</Text>
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
      paddingTop: 8,
      paddingBottom: 12,
      borderBottomWidth: 1,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
      zIndex: 2,
    },
    tabs: {
      paddingHorizontal: 10,
      paddingBottom: 4,
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
      marginTop: 8,
      borderRadius: 18,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderWidth: 1,
    },
    optionsRow: {
      gap: 12,
      paddingVertical: 6,
      paddingHorizontal: 2,
    },
    optionCard: {
      width: 140,
      paddingVertical: 14,
      paddingHorizontal: 12,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      gap: 10,
    },
    optionCardActive: {
      backgroundColor: colors.background,
      shadowColor: colors.primary,
      shadowOpacity: 0.22,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
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
