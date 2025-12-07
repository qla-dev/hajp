import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import FormTextInput from '../components/FormTextInput';
import { createRoom } from '../api';

const vibeOptions = [
  { key: 'zabava', label: 'Zabava u gradu', icon: 'musical-notes-outline' },
  { key: 'biznis', label: 'Biznis okruženje', icon: 'briefcase-outline' },
  { key: 'skola', label: 'Školsko okruženje', icon: 'school-outline' },
  { key: 'univerzitet', label: 'Studentski kutak', icon: 'book-outline' },
  { key: 'gaming', label: 'Gaming arena', icon: 'game-controller-outline' },
  { key: 'pop kultura', label: 'Pop kultura', icon: 'tv-outline' },
];

const privacyOptions = [
  { key: 'public', label: 'Javno', icon: 'globe-outline', value: false },
  { key: 'private', label: 'Privatna', icon: 'lock-closed-outline', value: true },
];

export default function CreateRoomScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [selectedVibe, setSelectedVibe] = useState(vibeOptions[0].key);
  const [isPrivate, setIsPrivate] = useState(false);
  const [is18Over, setIs18Over] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      setErrorMessage('Naziv sobe je obavezan.');
      return;
    }

    setErrorMessage('');
    setCreating(true);

    try {
      await createRoom({
        name: name.trim(),
        tagline: tagline.trim() || undefined,
        description: description.trim() || undefined,
        cover_url: coverUrl.trim() || undefined,
        type: selectedVibe,
        is_private: isPrivate,
        is_18_over: is18Over,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Neuspjeh pri kreiranju sobe', error);
      setErrorMessage('Neuspješno kreiranje sobe, pokušaj ponovo.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 110 : 80}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerSpacer} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Naziv sobe</Text>
          <FormTextInput
            value={name}
            onChangeText={setName}
            placeholder="Unesi naziv sobe"
            style={styles.input}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tagline</Text>
          <FormTextInput
            value={tagline}
            onChangeText={setTagline}
            placeholder="Kratka poruka ili moto"
            style={styles.input}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Opis</Text>
          <FormTextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Opširnije objasni vibe sobe"
            style={[styles.input, styles.multiline]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Cover link</Text>
          <FormTextInput
            value={coverUrl}
            onChangeText={setCoverUrl}
            placeholder="https://example.com/cover.jpg"
            style={styles.input}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Vibe</Text>
          <View style={styles.chipRow}>
            {vibeOptions.map((option) => {
              const active = selectedVibe === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.chip,
                    active && styles.chipActive,
                    { borderColor: active ? colors.primary : colors.border },
                  ]}
                  onPress={() => setSelectedVibe(option.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={active ? colors.textLight : colors.text_secondary}
                    style={styles.chipIcon}
                  />
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Privatnost</Text>
          <View style={styles.privacyRow}>
            {privacyOptions.map((option, index) => {
              const active = isPrivate === option.value;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.privacyButton,
                    active && styles.privacyActive,
                    index === 0 && { marginRight: 8 },
                    index === 1 && { marginLeft: 8 },
                  ]}
                  onPress={() => setIsPrivate(option.value)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={active ? colors.primary : colors.text_secondary}
                  />
                  <Text style={[styles.privacyLabel, active && styles.privacyLabelActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>18+ prostor</Text>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>
                {is18Over ? 'Samo za 18+' : 'Otvoreno za sve uzraste'}
              </Text>
              <Text style={styles.switchSubLabel}>
                {is18Over ? 'Sadržaj prilagođen odraslima' : 'Dozvoljeno mlađima od 18'}
              </Text>
            </View>
            <Switch
              value={is18Over}
              onValueChange={setIs18Over}
              thumbColor={is18Over ? colors.primary : colors.surface}
              trackColor={{ false: colors.border, true: colors.primary }}
              ios_backgroundColor={colors.border}
            />
          </View>
        </View>

        {errorMessage ? <Text style={styles.errorLabel}>{errorMessage}</Text> : null}

        <View style={{ height: Math.max(insets.bottom + 60, 60) }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={[styles.cta, creating && styles.ctaDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator color={colors.textLight} />
          ) : (
            <Text style={styles.ctaLabel}>Dodaj sobu</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 40,
    },
    headerSpacer: {
      height: 32,
    },
    section: {
      marginBottom: 16,
    },
    sectionLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text_secondary,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text_primary,
      fontSize: 16,
    },
    multiline: {
      minHeight: 100,
      paddingTop: 12,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 16,
      borderWidth: 1,
      backgroundColor: colors.surface,
      marginBottom: 10,
      marginRight: 10,
    },
    chipActive: {
      backgroundColor: colors.primary,
    },
    chipIcon: {
      marginRight: 8,
    },
    chipLabel: {
      fontSize: 14,
      color: colors.text_secondary,
    },
    chipLabelActive: {
      color: colors.textLight,
    },
    privacyRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    privacyButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 14,
      backgroundColor: colors.surface,
    },
    privacyActive: {
      borderColor: colors.primary,
      backgroundColor: colors.surfaceDark,
    },
    privacyLabel: {
      marginLeft: 8,
      fontWeight: '600',
      color: colors.text_secondary,
    },
    privacyLabelActive: {
      color: colors.primary,
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    switchLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text_primary,
    },
    switchSubLabel: {
      fontSize: 13,
      color: colors.text_secondary,
    },
    errorLabel: {
      color: colors.error,
      fontSize: 13,
      marginBottom: 12,
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: 16,
      backgroundColor: colors.background,
    },
    cta: {
      height: 54,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaDisabled: {
      opacity: 0.7,
    },
    ctaLabel: {
      color: colors.textLight,
      fontSize: 16,
      fontWeight: '700',
    },
  });
