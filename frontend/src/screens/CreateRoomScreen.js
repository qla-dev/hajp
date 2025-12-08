import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import FormTextInput from '../components/FormTextInput';
import { createRoom } from '../api';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80';

const vibeOptions = [
  { key: 'skola', label: 'Školsko okruženje', icon: 'school-outline' },
  { key: 'univerzitet', label: 'Studentski kutak', icon: 'book-outline' },
  { key: 'biznis', label: 'Biznis okruženje', icon: 'briefcase-outline' },
  { key: 'tech', label: 'Tech & startupi', icon: 'hardware-chip-outline' },
  { key: 'zabava', label: 'Zabava u gradu', icon: 'musical-notes-outline' },
  { key: 'gaming', label: 'Gaming arena', icon: 'game-controller-outline' },
  { key: 'pop kultura', label: 'Pop kultura', icon: 'tv-outline' },
  { key: 'muzika', label: 'Muzički jam', icon: 'headset-outline' },
  { key: 'sport', label: 'Sportski duh', icon: 'football-outline' },
  { key: 'art', label: 'Kreativni kutak', icon: 'brush-outline' },
  { key: 'putovanja', label: 'Putnička energija', icon: 'airplane-outline' },
  { key: 'wellness', label: 'Chill & wellness', icon: 'leaf-outline' },
  { key: 'food', label: 'Foodies', icon: 'pizza-outline' },
  { key: 'kino', label: 'Filmska noć', icon: 'film-outline' },
  { key: 'moda', label: 'Street & moda', icon: 'shirt-outline' },
  { key: 'drustvo', label: 'Društvene igre', icon: 'game-controller-outline' },
];

const privacyOptions = [
  { key: 'public', label: 'Javna', icon: 'globe-outline', value: false },
  { key: 'private', label: 'Privatna', icon: 'lock-closed-outline', value: true },
];

export default function CreateRoomScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [coverAsset, setCoverAsset] = useState(null);
  const [selectedVibe, setSelectedVibe] = useState(vibeOptions[0].key);
  const [isPrivate, setIsPrivate] = useState(false);
  const [is18Over, setIs18Over] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isSaveDisabled = creating || !name.trim();
  const emptyContent = !name && !tagline && !description && !coverAsset;
  const scrollStyles = [styles.contentContainer, emptyContent && styles.emptyContainer];
  const coverPreviewUri = coverAsset?.uri || FALLBACK_COVER;

  const handlePickCover = useCallback(async () => {
    console.log('CreateRoomScreen: handlePickCover triggered');
    try {
      const current = await ImagePicker.getMediaLibraryPermissionsAsync();
      let status = current.status;
      if (status !== 'granted' && status !== 'limited') {
        const request = await ImagePicker.requestMediaLibraryPermissionsAsync();
        status = request.status;
      }
      if (status !== 'granted' && status !== 'limited') {
        Alert.alert('Dozvola potrebna', 'Odobri pristup galeriji kako bi postavio cover sobe.');
        return;
      }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      const filename = asset.fileName || `room_cover_${Date.now()}.jpg`;
      const extension = filename.split('.').pop() || 'jpg';
      const mimeType = `image/${extension.toLowerCase()}`;

      setCoverAsset({
        uri: asset.uri,
        name: filename,
        type: mimeType,
      });
    } catch (error) {
      console.error('CreateRoomScreen handlePickCover failed', error);
      Alert.alert('Greška', 'Nismo mogli otvoriti galeriju, pokušaj ponovo.');
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setErrorMessage('Naziv sobe je obavezan.');
      return;
    }

    setErrorMessage('');
    setCreating(true);

    const payload = {
      name: name.trim(),
      tagline: tagline.trim() || undefined,
      description: description.trim() || undefined,
      type: selectedVibe,
      is_private: isPrivate,
      is_18_over: is18Over,
    };
    try {
      const serializeValue = (value) => {
        if (typeof value === 'boolean') {
          return value ? '1' : '0';
        }
        return value;
      };
      if (coverAsset) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, serializeValue(value));
          }
        });
        formData.append('cover', {
          uri: coverAsset.uri,
          name: coverAsset.name,
          type: coverAsset.type || 'image/jpeg',
        });
        await createRoom(formData);
      } else {
        await createRoom(payload);
      }
      setCreating(false);
      Alert.alert('Soba je kreirana', 'Nova soba je spremljena.', [
        {
          text: 'Uredu',
          onPress: () => {
            navigation.navigate('ProfileHome');
          },
        },
      ]);
    } catch (error) {
      console.error('Neuspjeh pri kreiranju sobe', error);
      const backendMessage =
        error?.response?.data?.message || error?.response?.data?.errors?.name?.[0];
      setErrorMessage(
        backendMessage || 'Neuspješno kreiranje sobe, pokušaj ponovo.',
      );
    } finally {
      setCreating(false);
    }
  }, [
    name,
    tagline,
    description,
    coverAsset,
    selectedVibe,
    isPrivate,
    is18Over,
    navigation,
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaveDisabled}
          style={[styles.saveButton, isSaveDisabled && styles.saveButtonDisabled]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {creating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.saveButtonText}>Spasi</Text>
          )}
        </TouchableOpacity>
      ),
    });
  }, [colors.primary, creating, handleSave, isSaveDisabled, navigation, styles]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={scrollStyles}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="always"
    >
      <View style={styles.previewWrapper}>
        <ImageBackground source={{ uri: coverPreviewUri }} style={styles.coverPreview} imageStyle={styles.coverPreviewImage}>
          <View style={styles.coverOverlay}>
            <TouchableOpacity
              style={styles.coverCameraBadge}
              onPress={handlePickCover}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.8}
            >
              <Ionicons name="camera-outline" size={20} color={colors.text_primary} />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.sectionGroup}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Naziv sobe</Text>
          <FormTextInput value={name} onChangeText={setName} placeholder="Unesi naziv sobe" style={styles.input} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tagline</Text>
          <FormTextInput value={tagline} onChangeText={setTagline} placeholder="Kratka poruka ili moto" style={styles.input} />
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
          <Text style={styles.sectionLabel}>Vibe</Text>
          <View style={styles.chipRow}>
            {vibeOptions.map((option) => {
              const active = selectedVibe === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setSelectedVibe(option.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={active ? colors.primary : colors.text_secondary}
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
            {privacyOptions.map((option) => {
              const active = isPrivate === option.value;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.privacyButton, active && styles.privacyActive]}
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
              <Text style={styles.switchLabel}>{is18Over ? 'Samo za 18+' : 'Otvoreno za sve uzraste'}</Text>
              <Text style={styles.switchSubLabel}>
                {is18Over ? 'Sadržaj prilagođen odraslima' : 'Dozvoljeno mlađima od 18'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, is18Over && styles.toggleActive]}
              onPress={() => setIs18Over((prev) => !prev)}
            >
              <Ionicons
                name={is18Over ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={is18Over ? colors.primary : colors.text_secondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {errorMessage ? <Text style={styles.errorLabel}>{errorMessage}</Text> : null}

        <View style={{ height: 40 }} />
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
    contentContainer: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 40,
    },
    emptyContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingBottom: 20,
    },
    previewWrapper: {
      marginTop: 0,
      marginBottom: 12,
    },
    coverPreview: {
      height: 200,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      justifyContent: 'flex-end',
    },
    coverPreviewImage: {
      resizeMode: 'cover',
    },
    coverOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'space-between',
      padding: 16,
    },
    coverLabel: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
    coverActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    coverButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 15,
    },
    coverCameraBadge: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.background,
      shadowColor: colors.primary,
      shadowOpacity: 0.25,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    sectionGroup: {
      marginTop: 12,
    },
    section: {
      marginBottom: 20,
    },
    sectionLabel: {
      fontWeight: '600',
      color: colors.text_secondary,
      marginBottom: 8,
      fontSize: 13,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    input: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      color: colors.text_primary,
    },
    multiline: {
      minHeight: 100,
      paddingTop: 12,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginRight: 0,
      marginBottom: 0,
    },
    chipActive: {
      backgroundColor: colors.surface,
      borderColor: colors.primary,
      color: colors.primary,
    },
    chipLabel: {
      marginLeft: 8,
      color: colors.text_secondary,
    },
    chipLabelActive: {
      color: colors.primary,
    },
    privacyRow: {
      flexDirection: 'row',
      gap: 12,
    },
    privacyButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: 8,
    },
    privacyActive: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
    privacyLabel: {
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
      fontWeight: '600',
      color: colors.text_primary,
      fontSize: 15,
    },
    switchSubLabel: {
      color: colors.text_secondary,
      fontSize: 13,
    },
    toggle: {
      padding: 6,
      borderRadius: 50,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleActive: {
      borderColor: colors.primary,
    },
    errorLabel: {
      color: colors.error,
      fontSize: 13,
      marginTop: 4,
    },
    saveButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 18,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: colors.text_primary,
      fontWeight: '600',
      fontSize: 16,
    },
  });
