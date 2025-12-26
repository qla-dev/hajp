import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import FormTextInput from '../components/FormTextInput';
import Avatar from '../components/Avatar';
import { getCurrentUser, updateCurrentUser, uploadProfilePhoto, removeProfilePhoto, baseURL } from '../api';
import { emitProfileUpdated, addProfileUpdatedListener } from '../utils/profileEvents';

const genderOptions = [
  { key: 'girl', label: 'Žensko', icon: 'female-outline' },
  { key: 'boy', label: 'Muško', icon: 'male-outline' },
];
const years = Array.from({ length: 35 }, (_, i) => 16 + i); // 16 through 50
const AVATAR_SIZE = 180;
const PROFILE_SIZE = 135;

const normalizeUser = (user) => ({
  name: user?.name || '',
  username: user?.username || '',
  email: user?.email || '',
  sex: user?.sex || '',
  grade: user?.grade ? Number(user.grade) || 18 : 18,
  profile_photo: user?.profile_photo || '',
  avatar: user?.avatar || '',
});

const resolveAvatar = (photo) => {
  if (!photo) return null;
  if (/^https?:\/\//i.test(photo)) return photo;
  const cleanBase = (baseURL || '').replace(/\/+$/, '');
  const cleanPath = photo.replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
};

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
  const profileFallback =
    'https://ui-avatars.com/api/?name=' +
    (form.name || 'Korisnik') +
    '&size=200&background=' +
    encodeURIComponent(colors.profilePurple.replace('#', '')) +
    '&color=' +
    avatarTextColor;

  const isDirty = ['name', 'email', 'sex'].some((key) => form[key] !== initialValues[key]);

  const applyUser = useCallback((userData, { emit } = { emit: true }) => {
    const normalized = normalizeUser(userData);
    setForm(normalized);
    setInitialValues(normalized);
    if (emit) {
      emitProfileUpdated(userData);
    }
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

  useEffect(() => {
    const unsubscribe = addProfileUpdatedListener((userData) => {
      if (userData) {
        applyUser(userData, { emit: false });
      }
    });
    return unsubscribe;
  }, [applyUser]);

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
        // grade removed from backend; keep only editable fields
      };
      const { data } = await updateCurrentUser(payload);
      applyUser(data);
      Alert.alert('Svaka čast!', 'Promjene su sačuvane na tvom nalogu', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Greška', 'Nismo mogli sačuvati promjene. Pokušaj ponovo.');
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
      applyUser(data.user || data);
      Alert.alert('Uspjeh', data.message || 'Profilna slika je ažurirana.');
    } catch (e) {
      Alert.alert('Greška', 'Nismo mogli prenijeti sliku. Pokusaj ponovo.');
    } finally {
      setUploadingPhoto(false);
    }
  }, [applyUser, uploadingPhoto]);

  const onRemovePhoto = useCallback(async () => {
    try {
      const { data } = await removeProfilePhoto();
      applyUser(data.user || data);
      Alert.alert('Uspjeh', data.message || 'Profilna slika je uklonjena.');
    } catch (e) {
      Alert.alert('Greška', 'Nismo mogli ukloniti sliku. Pokusaj ponovo.');
    }
  }, [applyUser]);

  const onRemoveAvatar = useCallback(async () => {
    try {
      const { data } = await updateCurrentUser({ avatar: null });
      applyUser(data);
      Alert.alert('Uspjeh', 'Avatar je uklonjen.');
    } catch (e) {
      Alert.alert('Greška', 'Nismo mogli ukloniti avatar. Pokusaj ponovo.');
    }
  }, [applyUser]);

  const onOpenAvatarGenerator = useCallback(() => {
    navigation.navigate('AvatarGenerator', { seedConfig: { avatarStyle: 'Circle' } });
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={onSave}
          disabled={!isDirty || saving || loading}
          style={[styles.saveButton, (!isDirty || saving || loading) && styles.saveButtonDisabled]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {saving ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={styles.saveButtonText}>Spasi</Text>}
        </TouchableOpacity>
      ),
    });
  }, [colors.text_primary, isDirty, loading, navigation, onSave, saving, styles]);

  if (loading) {
    return (
      <View style={[styles.container, styles.fullscreenLoader]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Učitavanje informacija</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentInsetAdjustmentBehavior="always">
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarRow}>
          <View style={[styles.avatarContainer, styles.avatarContainerProfile]}>
            <Avatar
              uri={
                resolveAvatar(form.profile_photo, form.name) ||
                profileFallback
              }
              name={form.name || 'Korisnik'}
              variant="avatar-m"
              size={PROFILE_SIZE}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraBadge} onPress={onPickPhoto} activeOpacity={0.9} disabled={uploadingPhoto}>
              {uploadingPhoto ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="camera" size={18} color={colors.text_primary} />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.editPhotoCta} onPress={onPickPhoto} activeOpacity={0.9} disabled={uploadingPhoto}>
              <Text style={styles.editPhotoText}>Izmijeni sliku</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.avatarContainer,
              styles.avatarGenerator,
              form.avatar ? styles.avatarContainerAvatar : styles.avatarContainerPlaceholder,
            ]}
            onPress={onOpenAvatarGenerator}
            activeOpacity={0.9}
            disabled={uploadingPhoto}
          >
            {form.avatar ? (
              <Avatar uri={form.avatar} name={form.name || 'Avatar'} variant="avatar-m" size={AVATAR_SIZE} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarGeneratorIcon, styles.avatarPlaceholder]}>
                <Ionicons name="happy-outline" size={48} color={colors.primary} />
              </View>
            )}
            <Text style={styles.avatarGeneratorText}>{form.avatar ? 'Izmijeni avatar' : 'Kreiraj avatar'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.avatarNote}>Dodaj sliku do 3 MB ili kreiraj avatar. Ista će biti javno dostupna.</Text>
        <View style={styles.removeRow}>
          <TouchableOpacity style={styles.removePhotoButton} onPress={onRemovePhoto} disabled={uploadingPhoto || saving}>
            <Text style={styles.removePhotoText}>Ukloni profilnu sliku</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removePhotoButton} onPress={onRemoveAvatar} disabled={uploadingPhoto || saving}>
            <Text style={styles.removePhotoText}>Ukloni avatar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={[styles.label, styles.labelSpacing]}>Osnovni podaci</Text>
        <FormTextInput
          placeholder="Korisnicko ime"
          value={form.username}
          editable={false}
          style={[styles.input, styles.disabledInput]}
        />
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
        <Text style={[styles.label, styles.labelSpacing]}>Pol</Text>
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
      </View>

      <View style={styles.yearSection}>
        <Text style={[styles.label, styles.labelSpacing]}>Godine</Text>
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
      </View>

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Učitavanje profila...</Text>
        </View>
      )}

      {/* <Text style={styles.sectionLabel}>Podesavanja naloga</Text>
      <View style={styles.formSection}>
        <TouchableOpacity style={styles.listRow}>
          <Text style={styles.listRowText}>Vrati kupovine</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listRow}>
          <Text style={styles.listRowText}>Upravljaj nalogom</Text>
        </TouchableOpacity>
      </View> */}
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
      paddingVertical: 0,
      marginTop: -30,
      backgroundColor: colors.transparent,
      borderBottomWidth: 0,
      borderColor: colors.border,
    },
    avatarRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 20,
      paddingHorizontal: 12,
    },
    avatarContainer: {
      width: '45%',
      maxWidth: 200,
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 8,
    },
    avatarContainerProfile: {},
    avatarContainerPlaceholder: {},
    avatarContainerAvatar: {},
    avatar: {
      backgroundColor: colors.surface,
    },
    cameraBadge: {
      position: 'absolute',
      bottom: 20,
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
    editPhotoCta: {
      paddingTop: 6,
    },
    editPhotoText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
    },
    avatarGenerator: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingHorizontal: 8,
    },
    avatarGeneratorIcon: {
      width: PROFILE_SIZE,
      height: PROFILE_SIZE,
      borderRadius: PROFILE_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    avatarPlaceholder: {
      gap: 6,
    },
    avatarPlaceholderText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text_secondary,
    },
    avatarGeneratorText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
    },
    avatarNote: {
      marginTop: 15,
      fontSize: 12,
      color: colors.text_secondary,
      textAlign: 'center',
    },
    removePhotoButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    removePhotoText: {
      color: colors.error,
      fontWeight: '700',
      fontSize: 13,
      textDecorationLine: 'underline',
    },
    removeRow: {
      marginTop: 6,
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'center',
    },
    label: {
      marginBottom: 4,
      color: colors.text_secondary,
      fontWeight: '600',
      fontSize: 13,
      paddingHorizontal: 2,
    },
    labelSpacing: {
      marginTop: 6,
      marginBottom: 6,
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
      paddingVertical: 0,
      paddingTop: 4,
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
      marginTop: 18,
    },
    formSection: {
      backgroundColor: colors.transparent,
      paddingHorizontal: 16,
      paddingVertical: 16,
      paddingBottom: 0,
      borderTopWidth: 1,
      borderBottomWidth: 0,
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
    disabledInput: {
      opacity: 0.7,
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
      paddingTop: 10,
      paddingBottom: 6,
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
      marginTop: 8,
    },
    fullscreenLoader: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    yearSection: {
      backgroundColor: colors.transparent,
      paddingLeft: 16,
      paddingRight: 0,
      paddingVertical: 12,
      paddingBottom: 26,
      borderBottomWidth: 0,
      borderTopWidth: 0,
      borderColor: colors.border,
      gap: 8,
    },
  });
