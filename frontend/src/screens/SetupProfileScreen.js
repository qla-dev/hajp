import React, { useLayoutEffect, useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';
import { useThemedStyles } from '../theme/darkMode';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

// -----------------------------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------------------------

const SCREEN_WIDTH = Dimensions.get('window').width;
const AGE_ITEM_WIDTH = 72;
const ages = Array.from({ length: 20 }, (_, i) => 13 + i); // 13–32

const connectSoundAsset = require('../../assets/sounds/connect.mp3');

const countries = [
  { key: 'ba', label: 'Bosna i Hercegovina', flag: '🇧🇦', prefix: '+387', mask: '## ### ###' },
  { key: 'me', label: 'Crna Gora', flag: '🇲🇪', prefix: '+382', mask: '## ### ###' },
  { key: 'hr', label: 'Hrvatska', flag: '🇭🇷', prefix: '+385', mask: '## ### ###' },
  { key: 'rs', label: 'Srbija', flag: '🇷🇸', prefix: '+381', mask: '## ### ###' },
];

// -----------------------------------------------------------------------------
// STEP 1 – PHONE
// -----------------------------------------------------------------------------

function PhoneStep({ country, phone, onChangePhone, onOpenCountry, styles }) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Unesi broj telefona</Text>
      <Text style={styles.stepSubtitle}>Koristimo ga samo radi sigurnosti naloga.</Text>

      <View style={styles.phoneRow}>
        <TouchableOpacity style={styles.prefixBox} onPress={onOpenCountry}>
          <Text style={styles.prefixText}>{country?.prefix || '+---'}</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.phoneInput}
          value={phone}
          onChangeText={onChangePhone}
          keyboardType="phone-pad"
          placeholder={country?.mask || ''}
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );
}

// -----------------------------------------------------------------------------
// STEP 2 – VERIFICATION
// -----------------------------------------------------------------------------

function VerificationStep({ code, styles }) {
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (timer === 0) return;
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Verifikacija broja</Text>
      <Text style={styles.stepSubtitle}>
        🛡️ Broj telefona neće biti dijeljen s drugima. Koristi se isključivo radi sigurnosti.
      </Text>

      <View style={styles.codeRow}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={styles.codeBox}>
            <Text style={styles.codeText}>{code[i] || ''}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.timerText}>
        {timer > 0 ? `Pošalji ponovo za ${timer}s` : 'Pošalji ponovo'}
      </Text>
    </View>
  );
}

// -----------------------------------------------------------------------------
// STEP 3 – COUNTRY
// -----------------------------------------------------------------------------

function CountryStep({ selected, onSelect, styles }) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Odaberi državu</Text>
      <Text style={styles.stepSubtitle}>Za sada samo informativno 🙂</Text>

      <View style={styles.countryGrid}>
        {countries.map(c => {
          const active = c.key === selected;
          return (
            <TouchableOpacity
              key={c.key}
              style={[styles.countryItem, active && styles.countryItemActive]}
              onPress={() => onSelect(c.key)}
            >
              <Text style={styles.countryFlag}>{c.flag}</Text>
              <Text style={styles.countryLabel}>{c.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// -----------------------------------------------------------------------------
// STEP 4 – AGE
// -----------------------------------------------------------------------------

function AgeStep({ age, onSelect, styles }) {
  const soundRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(connectSoundAsset, { shouldPlay: false });
        soundRef.current = sound;
      } catch {}
    })();
    return () => soundRef.current?.unloadAsync();
  }, []);

  return (
    <View style={styles.stepContentFullWidth}>
      <Text style={styles.stepTitle}>Koliko imaš godina?</Text>
      <Text style={styles.stepSubtitle}>Povuci i pusti – snap je uključen</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={AGE_ITEM_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={styles.ageRow}
        onMomentumScrollEnd={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / AGE_ITEM_WIDTH);
          const value = ages[index];
          if (value && value !== age) {
            onSelect(value);
            Haptics.selectionAsync().catch(() => {});
            soundRef.current?.replayAsync().catch(() => {});
          }
        }}
      >
        {ages.map(a => (
          <View key={a} style={{ width: AGE_ITEM_WIDTH, alignItems: 'center' }}>
            <TouchableOpacity
              style={[styles.ageChip, a === age && styles.ageChipActive]}
              onPress={() => onSelect(a)}
            >
              <Text style={[styles.ageText, a === age && styles.ageTextActive]}>{a}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// -----------------------------------------------------------------------------
// PLACEHOLDERS (DUMMY STEPS)
// -----------------------------------------------------------------------------

function PlaceholderStep({ title, subtitle, styles }) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepSubtitle}>{subtitle}</Text>
      <View style={styles.placeholderBox}>
        <Text style={styles.placeholderText}>Uskoro</Text>
      </View>
    </View>
  );
}

// -----------------------------------------------------------------------------
// MAIN SCREEN
// -----------------------------------------------------------------------------

export default function SetupProfileScreen({ navigation }) {
  const styles = useThemedStyles(createStyles);

  const [stepIndex, setStepIndex] = useState(0);
  const [countryKey, setCountryKey] = useState(null);
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState(null);
  const [verificationCode] = useState('');

  const country = countries.find(c => c.key === countryKey);

  const steps = useMemo(
    () => [
      {
        key: 'phone',
        title: 'Telefon',
        valid: phone.length >= 6,
        render: () => (
          <PhoneStep
            country={country}
            phone={phone}
            onChangePhone={setPhone}
            onOpenCountry={() => setStepIndex(2)}
            styles={styles}
          />
        ),
      },
      {
        key: 'verify',
        title: 'Verifikacija',
        valid: verificationCode.length === 4 || true,
        render: () => <VerificationStep code={verificationCode} styles={styles} />,
      },
      {
        key: 'country',
        title: 'Država',
        valid: !!countryKey,
        render: () => (
          <CountryStep selected={countryKey} onSelect={setCountryKey} styles={styles} />
        ),
      },
      {
        key: 'age',
        title: 'Godine',
        valid: !!age,
        render: () => <AgeStep age={age} onSelect={setAge} styles={styles} />,
      },
      {
        key: 'schoolQuestion',
        title: 'Škola',
        valid: true,
        render: () => (
          <PlaceholderStep
            title="Škola"
            subtitle="Da li trenutno ideš u školu?"
            styles={styles}
          />
        ),
      },
      {
        key: 'jobQuestion',
        title: 'Posao',
        valid: true,
        render: () => (
          <PlaceholderStep
            title="Posao"
            subtitle="Da li trenutno radiš?"
            styles={styles}
          />
        ),
      },
      {
        key: 'vibes',
        title: 'Vibe',
        valid: true,
        render: () => (
          <PlaceholderStep
            title="Vibe"
            subtitle="Kako se najčešće osjećaš?"
            styles={styles}
          />
        ),
      },
    ],
    [styles, phone, countryKey, age, verificationCode],
  );

  const current = steps[stepIndex];

  const next = () => {
    if (!current.valid) return;
    if (stepIndex < steps.length - 1) setStepIndex(i => i + 1);
  };

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: current.title, headerBackVisible: false });
  }, [navigation, current]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>{current.render()}</View>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !current.valid && styles.nextButtonDisabled]}
          onPress={next}
          disabled={!current.valid}
        >
          <Text style={styles.nextButtonText}>Dalje</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// -----------------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------------

const createStyles = colors =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },

    stepContent: { alignItems: 'center', gap: 12, width: '100%' },
    stepContentFullWidth: { alignItems: 'center', gap: 12, width: '100%' },

    stepTitle: { fontSize: 24, fontWeight: '800', color: colors.text_primary, textAlign: 'center' },
    stepSubtitle: { fontSize: 14, color: colors.text_secondary, textAlign: 'center' },

    phoneRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
    prefixBox: { padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
    prefixText: { fontWeight: '800', color: colors.text_primary },
    phoneInput: { flex: 1, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, fontSize: 16, color: colors.text_primary },

    codeRow: { flexDirection: 'row', gap: 12, marginVertical: 20 },
    codeBox: { width: 56, height: 56, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    codeText: { fontSize: 22, fontWeight: '800', color: colors.text_primary },
    timerText: { color: colors.text_secondary },

    ageRow: { paddingHorizontal: 0 },
    ageChip: { width: 56, height: 56, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    ageChipActive: { borderColor: colors.primary, backgroundColor: colors.surface },
    ageText: { fontWeight: '800', color: colors.text_primary },
    ageTextActive: { color: colors.primary },

    countryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
    countryItem: {
      width: (SCREEN_WIDTH - 64) / 2,
      aspectRatio: 1,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
    },
    countryItemActive: { borderColor: colors.primary, backgroundColor: colors.surface },
    countryFlag: { fontSize: 42, lineHeight: 46, textAlign: 'center' },
    countryLabel: { fontWeight: '700', color: colors.text_primary, textAlign: 'center', marginTop: 6 },

    footer: { padding: 20 },

    placeholderBox: {
      marginTop: 16,
      width: '100%',
      padding: 24,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    placeholderText: {
      color: colors.text_secondary,
      fontWeight: '600',
      fontSize: 16,
    },
    nextButton: { backgroundColor: colors.primary, borderRadius: 18, paddingVertical: 14, alignItems: 'center' },
    nextButtonDisabled: { opacity: 0.4 },
    nextButtonText: { color: colors.textLight, fontWeight: '800' },
  });
