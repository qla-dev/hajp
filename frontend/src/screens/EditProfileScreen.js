import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import FormTextInput from '../components/FormTextInput';
import { getCurrentUser, updateCurrentUser, uploadProfilePhoto } from '../api';

const genderOptions = [
  { key: 'girl', label: 'Zensko', icon: 'female-outline' },
  { key: 'boy', label: 'Musko', icon: 'male-outline' },
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
  const [form, setForm] = useState(() => normalizeUser(passedUser));
  const [initialValues, setInitialValues] = useState(() => normalizeUser(passedUser));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
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
      Alert.alert('Uspjesno', 'Promjene su sacuvane.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Greska', 'Nismo mogli sacuvati promjene. Pokusaj ponovo.');
    } finally {
      setSaving(false);
    }
  }, [applyUser, form.email, form.name, form.sex, isDirty, navigation, saving]);

  const onPickPhoto = useCallback(async () => {
    if (uploadingPhoto) return;

    const ensurePermission = async () => {
      const current = await ImagePicker.getMediaLibraryPermissionsAsync();
      let status = current.status;
      if (status !== 'granted' && status !== 'limited') {
        const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
        status = req.status;
      }
      return status === 'granted' || status === 'limited';
    };

    const hasPermission = await ensurePermission();
    if (!hasPermission) {
      Alert.alert('Dozvola potrebna', 'Odobri pristup galeriji kako bi promijenio avatar.');
      return;
    }

    let result;
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        selectionLimit: 1,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    } catch (err) {
      console.warn('Image picker error', err);
      Alert.alert('Galerija', err?.message || 'Nismo mogli otvoriti galeriju. Provjeri dozvole i pokusaj ponovo.');
      return;
    }

    if (result?.canceled || !result?.assets?.length) return;

    const asset = result.assets[0];
    const uri = asset.uri;
    const mimeType = asset.mimeType || 'image/jpeg';
    const filename = asset.fileName || `avatar.${mimeType.split('/')[1] || 'jpg'}`;

    const formData = new FormData();
    formData.append('photo', { uri, name: filename, type: mimeType });

    setUploadingPhoto(true);
    try {
      const { data } = await uploadProfilePhoto(formData);
      applyUser(data);
    } catch (e) {
      Alert.alert('Greska', 'Nismo mogli prenijeti sliku. Pokusaj ponovo.');
    } finally {
      setUploadingPhoto(false);
    }
  }, [applyUser, uploadingPhoto]);

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
        <View style={styles.avatarContainer}>
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
          <TouchableOpacity style={styles.cameraBadge} onPress={onPickPhoto} activeOpacity={0.9} disabled={uploadingPhoto}>
            {uploadingPhoto ? (
              <ActivityIndicator size="small" color={colors.text_primary} />
            ) : (
              <Ionicons name="camera" size={18} color={colors.text_primary} />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.avatarNote}>Formati slika do 3 MB</Text>
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
    avatarWrapper: {
      alignItems: 'center',
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    avatarContainer: {
      width: 140,
      height: 140,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.surface,
    },
    cameraBadge: {
      position: 'absolute',
      bottom: 6,
      right: 16,
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.background,
      shadowColor: colors.primary,
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    avatarNote: {
      marginTop: 8,
      fontSize: 12,
      color: colors.text_secondary,
    },
    label: {
      marginBottom: 4,
      color: colors.text_secondary,
      fontWeight: '600',
      fontSize: 13,
      paddingHorizontal: 2,
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
