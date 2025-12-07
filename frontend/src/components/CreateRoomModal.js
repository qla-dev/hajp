import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useTheme, useThemedStyles } from '../theme/darkMode';

const vibeOptions = [
  { id: 'public', label: 'Public' },
  { id: 'private', label: 'Private' },
  { id: 'afterparty', label: 'Afterparty' },
];

const defaultForm = {
  name: '',
  type: 'public',
  tagline: '',
  description: '',
  cover_url: '',
  is_private: false,
  is_18_over: false,
};

const TAB_BAR_HEIGHT = 110;

const CreateRoomModal = forwardRef(({ onCreate }, ref) => {
  const modalRef = useRef(null);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  useImperativeHandle(ref, () => ({
    open: () => modalRef.current?.open(),
    close: () => modalRef.current?.close(),
  }));

  const handleFieldChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    if (!form.name.trim()) return;
    if (!onCreate) return;
    setSubmitting(true);
    try {
      await onCreate(form);
      setForm(defaultForm);
      modalRef.current?.close();
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  }, [form, onCreate, submitting]);

  return (
    <Modalize
      ref={modalRef}
      adjustToContentHeight
      handleStyle={styles.modalHandle}
      modalStyle={[styles.modalizeModal]}
      withReactModal
      scrollViewProps={{ contentContainerStyle: { paddingBottom: TAB_BAR_HEIGHT } }}
      onClosed={() => setForm(defaultForm)}
    >
      <View style={styles.modalContent}>
        <View style={styles.modalHero}>
          <View style={styles.heroPulse} />
          <Text style={styles.modalSubtitle}>Gen Z ready</Text>
          <Text style={styles.modalTitle}>Kreiraj novu sobu</Text>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.modalInput, styles.modalInputExpanded]}
            placeholder="Naziv sobe"
            placeholderTextColor={colors.text_secondary}
            value={form.name}
            onChangeText={(value) => handleFieldChange('name', value)}
            autoCapitalize="words"
            selectionColor={colors.primary}
            editable={!submitting}
          />
        </View>

        <Text style={styles.sectionCaption}>Odaberi vibe</Text>
        <View style={styles.chipRow}>
          {vibeOptions.map((option) => {
            const active = form.type === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => handleFieldChange('type', option.id)}
                style={[styles.typeChip, active && styles.typeChipActive]}
                disabled={submitting}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    active && styles.typeChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionCaption}>Tagline i opis</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="Dodaj kratki tagline"
          placeholderTextColor={colors.text_secondary}
          value={form.tagline}
          onChangeText={(value) => handleFieldChange('tagline', value)}
          autoCapitalize="sentences"
          editable={!submitting}
        />
        <TextInput
          style={[styles.modalInput, styles.modalInputMultiline]}
          placeholder="Opis sobe"
          placeholderTextColor={colors.text_secondary}
          value={form.description}
          onChangeText={(value) => handleFieldChange('description', value)}
          multiline
          numberOfLines={3}
          editable={!submitting}
        />

        <Text style={styles.sectionCaption}>Nek’ se zna</Text>
        <View style={styles.toggleRow}>
          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>Privatna</Text>
            <Switch
              value={form.is_private}
              onValueChange={(value) => handleFieldChange('is_private', value)}
              thumbColor={form.is_private ? colors.primary : colors.border}
              trackColor={{ true: colors.primary, false: colors.text_secondary }}
              disabled={submitting}
            />
          </View>
          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>18+</Text>
            <Switch
              value={form.is_18_over}
              onValueChange={(value) => handleFieldChange('is_18_over', value)}
              thumbColor={form.is_18_over ? colors.primary : colors.border}
              trackColor={{ true: colors.primary, false: colors.text_secondary }}
              disabled={submitting}
            />
          </View>
        </View>

        <Text style={styles.sectionCaption}>Cover i link</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="Cover URL (opcionalno)"
          placeholderTextColor={colors.text_secondary}
          value={form.cover_url}
          onChangeText={(value) => handleFieldChange('cover_url', value)}
          autoCapitalize="none"
          editable={!submitting}
        />

        <TouchableOpacity
          style={[styles.modalButton, (submitting || !form.name.trim()) && styles.modalButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting || !form.name.trim()}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.textLight} />
          ) : (
            <Text style={styles.modalButtonText}>Dodaj sobu</Text>
          )}
        </TouchableOpacity>
      </View>
    </Modalize>
  );
});

const createStyles = (colors) =>
  StyleSheet.create({
    modalHandle: {
      backgroundColor: colors.border,
      width: 50,
    },
    modalizeModal: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    modalContent: {
      padding: 24,
      gap: 16,
    },
    modalHero: {
      alignItems: 'center',
      gap: 4,
    },
    heroPulse: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary,
      opacity: 0.15,
    },
    modalSubtitle: {
      fontSize: 12,
      letterSpacing: 1,
      color: colors.text_secondary,
      textTransform: 'uppercase',
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text_primary,
    },
    inputRow: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: colors.text_primary,
      backgroundColor: colors.background,
    },
    modalInputExpanded: {
      borderWidth: 0,
      borderRadius: 0,
      backgroundColor: 'transparent',
    },
    modalInputMultiline: {
      minHeight: 90,
      textAlignVertical: 'top',
    },
    sectionCaption: {
      fontSize: 14,
      color: colors.text_secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    chipRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    typeChip: {
      flex: 1,
      marginRight: 8,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    typeChipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '15',
    },
    typeChipText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text_primary,
    },
    typeChipTextActive: {
      color: colors.primary,
    },
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    toggleItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: 1,
    },
    toggleLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text_primary,
    },
    modalButton: {
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      backgroundColor: colors.primary,
      marginTop: 8,
    },
    modalButtonDisabled: {
      opacity: 0.6,
    },
    modalButtonText: {
      color: colors.textLight,
      fontWeight: '700',
      fontSize: 15,
    },
    modalizeInset: {
      paddingBottom: TAB_BAR_HEIGHT,
      marginBottom: -TAB_BAR_HEIGHT / 2,
    },
    portal: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      justifyContent: 'flex-end',
      zIndex: 9999,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 10000,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
  });

export default CreateRoomModal;
