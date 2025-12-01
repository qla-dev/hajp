import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import FormTextInput from '../components/FormTextInput';
import { getCurrentUser, updateCurrentUser } from '../api';

const genderOptions = [
  { key: 'girl', label: 'Žensko', icon: 'female-outline' },
  { key: 'boy', label: 'Muško', icon: 'male-outline' },
];
const years = Array.from({ length: 35 }, (_, i) => 16 + i); // 16 through 50

const normalizeUser = (user) => ({
  name: user?.name || '',
  email: user?.email || '',
  sex: user?.sex || '',
  grade: user?.grade ? Number(user.grade) || 18 : 18,
  profile_photo: user?.profile_photo || '',
});

export default function EditProfileScreen({ navigation, route }) {
  const passedUser = route.params?.user;
  const onSaved = route.params?.onSaved;
  const [form, setForm] = useState(() => normalizeUser(passedUser));
  const [initialValues, setInitialValues] = useState(() => normalizeUser(passedUser));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const avatarTextColor = encodeURIComponent(colors.textLight.replace('#', ''));

  const isDirty = ['name', 'email', 'sex', 'grade'].some((key) => form[key] !== initialValues[key]);

  const applyUser = useCallback((userData) => {
    const normalized = normalizeUser(userData);
    setForm(normalized);
    setInitialValues(normalized);
  }, []);

  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCurrentUser();
      const normalized = normalizeUser(data);
      setInitialValues((prevInitial) => {
        setForm((prevForm) => {
          const wasDirty = ['name', 'email', 'sex', 'grade'].some((key) => prevForm[key] !== prevInitial[key]);
          return wasDirty ? prevForm : normalized;
        });
        return normalized;
      });
    } catch (e) {
      console.warn('Failed to load user profile', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const onChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSave = useCallback(async () => {
    if (!isDirty || saving) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        sex: form.sex ? form.sex.trim() : null,
        grade: form.grade ? String(form.grade) : null,
      };
      const { data } = await updateCurrentUser(payload);
      applyUser(data);
      if (onSaved) {
        await onSaved();
      }
      Alert.alert('Svaka čast!', 'Uspješno spašene izmjene na tvom nalogu', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      alert('Nastala je greška. Pokušaj ponovo.');
    } finally {
      setSaving(false);
    }
  }, [applyUser, form.email, form.name, form.sex, isDirty, navigation, onSaved, saving]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={onSave}
          disabled={!isDirty || saving || loading}
          style={[styles.saveButton, (!isDirty || saving || loading) && styles.saveButtonDisabled]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {saving ? <ActivityIndicator size="small" color={colors.text_primary} /> : <Text style={styles.saveButtonText}>Spasi</Text>}
        </TouchableOpacity>
      ),
    });
  }, [colors.text_primary, isDirty, loading, navigation, onSave, saving, styles]);

  return (
    <ScrollView style={styles.container} contentInsetAdjustmentBehavior="always">
      <View style={styles.avatarWrapper}>
        <Image
          source={{
            uri:
              form.profile_photo ||
              'https://ui-avatars.com/api/?name=' +
                (form.name || 'Korisnik') +
                '&size=200&background=' +
                encodeURIComponent(colors.profilePurple.replace('#', '')) +
                '&color=' +
                avatarTextColor,
          }}
          style={styles.avatar}
        />
        <View style={styles.cameraBadge}>
          <Text style={styles.cameraIcon}>dY",</Text>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formSectionLabel}>Osnovni podaci</Text>
        <FormTextInput
          placeholder="Ime i prezime"
          value={form.name}
          onChangeText={(text) => onChange('name', text)}
          style={styles.input}
          editable={!saving}
          autoCapitalize="words"
        />
        <FormTextInput
          placeholder="Email"
          value={form.email}
          onChangeText={(text) => onChange('email', text)}
          style={styles.input}
          editable={!saving}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Text style={styles.label}>Pol</Text>
        <View style={styles.genderRow}>
          {genderOptions.map((item) => {
            const active = form.sex === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => onChange('sex', item.key)}
                style={[styles.genderButton, active && styles.genderButtonActive]}
                disabled={saving}
              >
                <View style={[styles.genderBadge, active && styles.genderBadgeActive]}>
                  <Ionicons name={item.icon} size={16} color={active ? colors.textLight : colors.text_primary} />
                </View>
                <Text style={[styles.genderText, active && styles.genderTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, styles.ageLabel]}>Godine</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearScroll} contentContainerStyle={styles.yearRow}>
          {years.map((y) => {
            const active = form.grade === y;
            return (
              <TouchableOpacity
                key={y}
                onPress={() => onChange('grade', y)}
                style={[styles.yearChip, active && styles.yearChipActive]}
                disabled={saving}
              >
                <Text style={[styles.yearText, active && styles.yearTextActive]}>{y}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Ucitavanje profila...</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionLabel}>Podesavanja naloga</Text>
      <View style={styles.formSection}>
        <TouchableOpacity style={styles.listRow}>
          <Text style={styles.listRowText}>Vrati kupovine</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listRow}>
          <Text style={styles.listRowText}>Upravljaj nalogom</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    label: {
      marginBottom: 4,
      color: colors.text_secondary,
      fontWeight: '600',
      fontSize: 13,
    },
    genderRow: {
      flexDirection: 'row',
      gap: 12,
    },
    genderButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 12,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    genderButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
    genderBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.border,
    },
    genderBadgeActive: {
      backgroundColor: colors.primary,
    },
    genderText: {
      fontWeight: '700',
      color: colors.text_primary,
    },
    genderTextActive: {
      color: colors.primary,
    },
    yearScroll: {
      width: '100%',
    },
    yearRow: {
      paddingVertical: 6,
      paddingLeft: 0,
      paddingRight: 0,
      gap: 6,
    },
    yearChip: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginRight: 6,
      backgroundColor: colors.surface,
    },
    yearChipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
    yearText: {
      fontWeight: '700',
      color: colors.text_primary,
    },
    yearTextActive: {
      color: colors.primary,
    },
    ageLabel: {
      marginTop: 8,
    },
    avatarWrapper: {
      alignItems: 'center',
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.surface,
    },
    cameraBadge: {
      position: 'absolute',
      bottom: 12,
      right: 20,
    },
    cameraIcon: {
      fontSize: 20,
    },
    formSection: {
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 14,
      fontSize: 15,
      color: colors.text_primary,
    },
    sectionLabel: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 6,
      fontSize: 13,
      color: colors.text_secondary,
      fontWeight: '700',
    },
    formSectionLabel: {
      alignSelf: 'flex-start',
      paddingTop: 4,
      paddingBottom: 4,
      fontSize: 13,
      color: colors.text_secondary,
      fontWeight: '700',
    },
    listRow: {
      paddingVertical: 12,
    },
    listRowText: {
      fontSize: 14,
      color: colors.text_primary,
      fontWeight: '600',
    },
    saveButton: {
      paddingHorizontal: 8,
      paddingVertical: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: colors.text_primary,
      fontWeight: '600',
      fontSize: 16,
    },
    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingTop: 4,
    },
    loadingText: {
      color: colors.text_secondary,
      fontSize: 13,
    },
  });
