import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { createRoom } from '../api';

const VIBE_OPTIONS = [
  { id: 'school', label: 'Školska smjena' },
  { id: 'uni', label: 'Univerzitetska struka' },
  { id: 'creative', label: 'Kreativna scena' },
  { id: 'afterparty', label: 'Afterparty' },
  { id: 'chill', label: 'Chill zona' },
  { id: 'insider', label: 'Insider krug' },
];

const PRIVACY_OPTIONS = [
  { id: 'public', label: 'Javna' },
  { id: 'private', label: 'Privatna' },
];

const defaultForm = {
  name: '',
  tagline: '',
  description: '',
  vibe: VIBE_OPTIONS[0].id,
  privacy: PRIVACY_OPTIONS[0].id,
  cover_url: '',
  is_18_over: false,
};

export default function CreateRoomScreen({ navigation }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const headerHeight = useHeaderHeight();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const handleFieldChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim() || loading) return;
    setLoading(true);
    try {
      await createRoom({
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        description: form.description.trim(),
        vibe: form.vibe,
        privacy: form.privacy,
        cover_url: form.cover_url.trim(),
        is_18_over: form.is_18_over,
      });
      navigation.goBack();
    } catch {
      // ignore errors
    } finally {
      setLoading(false);
    }
  }, [form, loading, navigation]);

  return (
    <View style={styles.screen}>
      <View style={{ height: headerHeight }} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Kreiraj novu sobu</Text>
        <TextInput
          style={styles.input}
          placeholder="Naziv sobe"
          placeholderTextColor={colors.text_secondary}
          value={form.name}
          onChangeText={(value) => handleFieldChange('name', value)}
          autoCapitalize="words"
          selectionColor={colors.primary}
          editable={!loading}
        />
        <Text style={styles.label}>Vibe</Text>
        <View style={styles.optionRow}>
          {VIBE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionChip, form.vibe === option.id && styles.optionChipActive]}
              onPress={() => handleFieldChange('vibe', option.id)}
              disabled={loading}
            >
              <Text style={[styles.optionText, form.vibe === option.id && styles.optionTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Privatnost</Text>
        <View style={styles.optionRow}>
          {PRIVACY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionChip, form.privacy === option.id && styles.optionChipActive]}
              onPress={() => handleFieldChange('privacy', option.id)}
              disabled={loading}
            >
              <Text style={[styles.optionText, form.privacy === option.id && styles.optionTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.sectionLabel}>Tagline</Text>
        <TextInput
          style={styles.input}
          placeholder="Kratki tagline"
          placeholderTextColor={colors.text_secondary}
          value={form.tagline}
          onChangeText={(value) => handleFieldChange('tagline', value)}
          autoCapitalize="sentences"
          editable={!loading}
        />
        <Text style={styles.sectionLabel}>Opis</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Detaljniji opis"
          placeholderTextColor={colors.text_secondary}
          value={form.description}
          onChangeText={(value) => handleFieldChange('description', value)}
          multiline
          numberOfLines={4}
          editable={!loading}
        />
        <Text style={styles.sectionLabel}>Cover URL</Text>
        <TextInput
          style={styles.input}
          placeholder="https://..."
          placeholderTextColor={colors.text_secondary}
          value={form.cover_url}
          onChangeText={(value) => handleFieldChange('cover_url', value)}
          autoCapitalize="none"
          editable={!loading}
        />
        <Text style={styles.sectionLabel}>18+</Text>
        <TouchableOpacity
          onPress={() => handleFieldChange('is_18_over', !form.is_18_over)}
          style={[styles.toggle, form.is_18_over ? styles.toggleActive : styles.toggleInactive]}
        >
          <Text style={styles.toggleText}>{form.is_18_over ? 'Da' : 'Ne'}</Text>
        </TouchableOpacity>
        <View style={{ height: 120 }} />
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, (!form.name.trim() || loading) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!form.name.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.textLight} />
          ) : (
            <Text style={styles.submitText}>Dodaj sobu</Text>
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
    },
    body: {
      padding: 24,
      gap: 16,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text_primary,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      color: colors.text_primary,
    },
    inputMultiline: {
      minHeight: 90,
      textAlignVertical: 'top',
    },
    label: {
      fontSize: 12,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: colors.text_secondary,
    },
    sectionLabel: {
      fontSize: 14,
      color: colors.text_secondary,
      marginTop: 4,
    },
    optionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    optionChip: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    optionChipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '15',
    },
    optionText: {
      color: colors.text_primary,
      fontWeight: '600',
    },
    optionTextActive: {
      color: colors.primary,
    },
    toggle: {
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    toggleActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '0f',
    },
    toggleInactive: {},
    toggleText: {
      color: colors.text_primary,
      fontWeight: '600',
    },
    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: 24,
      borderTopWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    submitButton: {
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitText: {
      color: colors.textLight,
      fontWeight: '700',
      fontSize: 16,
    },
  });
