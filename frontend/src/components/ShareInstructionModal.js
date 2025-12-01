import React, { useMemo, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useTheme, useThemedStyles } from '../theme/darkMode';

const { width } = Dimensions.get('window');

const SHARE_STEPS = {
  instagram: [
    { title: 'Kako dodati link u story', body: 'Klikni na sticker ikonu.', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=60' },
    { title: 'Kako dodati link u story', body: 'Izaberi Link naljepnicu.', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=60' },
    { title: 'Kako dodati link u story', body: 'Zalijepi hajp link i potvrdi.', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=60' },
    { title: 'Kako dodati link u story', body: 'Objavi story i taguj prijatelje.', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=60' },
  ],
  snapchat: [
    { title: 'Dodaj link na Snapchat', body: 'Otvori kameru i klikni na sticker.', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=60' },
    { title: 'Dodaj link na Snapchat', body: 'Izaberi Link naljepnicu.', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=60' },
    { title: 'Dodaj link na Snapchat', body: 'Zalijepi hajp link i potvrdi.', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=60' },
    { title: 'Dodaj link na Snapchat', body: 'Objavi i pozovi ekipu.', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=60' },
  ],
  whatsapp: [
    { title: 'Podijeli na WhatsApp', body: 'Kopiraj link i otvori status.', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=60' },
    { title: 'Podijeli na WhatsApp', body: 'Zalijepi link u opis statusa.', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=60' },
    { title: 'Podijeli na WhatsApp', body: 'Dodaj sticker ili tekst po želji.', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=60' },
    { title: 'Podijeli na WhatsApp', body: 'Objavi i podijeli sa ekipom.', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=60' },
  ],
};

const PLATFORM_TABS = [
  { key: 'instagram', icon: 'logo-instagram' },
  { key: 'snapchat', icon: 'logo-snapchat' },
  { key: 'whatsapp', icon: 'logo-whatsapp' },
];

export default function ShareInstructionModal({ visible, onClose, avatarUri, avatarInitial }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [activePlatform, setActivePlatform] = useState('instagram');
  const [stepIndex, setStepIndex] = useState(0);

  const steps = SHARE_STEPS[activePlatform] || SHARE_STEPS.instagram;
  const current = steps[stepIndex] || steps[0];

  const handlePlatform = (key) => {
    setActivePlatform(key);
    setStepIndex(0);
    Haptics.selectionAsync().catch(() => {});
  };

  const handleNext = () => {
    const next = (stepIndex + 1) % steps.length;
    setStepIndex(next);
    Haptics.selectionAsync().catch(() => {});
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={50} tint="dark" style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.tabRow}>
            <View style={styles.tabGroup}>
              {PLATFORM_TABS.map((tab) => {
                const active = tab.key === activePlatform;
                return (
                  <TouchableOpacity key={tab.key} onPress={() => handlePlatform(tab.key)} style={[styles.tabButton, active && styles.tabButtonActive]}>
                    <Ionicons name={tab.icon} size={22} color={active ? colors.text_primary : colors.text_secondary} />
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={colors.text_primary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>{current.title}</Text>
            <View style={styles.stepRow}>
              {steps.map((_, idx) => {
                const active = idx === stepIndex;
                return (
                  <View key={idx} style={[styles.stepCircle, active && styles.stepCircleActive]}>
                    <Text style={[styles.stepNumber, active && styles.stepNumberActive]}>{idx + 1}</Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.body}>{current.body}</Text>
            <View style={styles.preview}>
              {current.image ? (
                <Image source={{ uri: current.image }} style={styles.previewImage} />
              ) : (
                <View style={[styles.previewImage, styles.previewPlaceholder]}>
                  <Text style={styles.previewInitial}>{avatarInitial}</Text>
                </View>
              )}
              <View style={styles.previewAvatar}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <View style={[styles.previewAvatar, styles.previewPlaceholder]}>
                    <Text style={styles.previewInitial}>{avatarInitial}</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.nextButton,
              stepIndex === steps.length - 1 ? styles.nextButtonPrimary : styles.nextButtonSecondary,
            ]}
            onPress={handleNext}
          >
            <Text style={styles.nextText}>Sljedeći korak</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      width: width * 0.9,
      backgroundColor: colors.surface,
      borderRadius: 28,
      padding: 16,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 10,
      overflow: 'hidden',
    },
    tabRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    tabGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      gap: 8,
    },
    tabButton: {
      backgroundColor: colors.background,
      borderRadius: 16,
      paddingVertical: 10,
      paddingHorizontal: 14,
      marginRight: 0,
    },
    tabButtonActive: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    closeButton: {
      marginLeft: 'auto',
      padding: 8,
    },
    content: {
      alignItems: 'center',
      paddingVertical: 8,
      gap: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text_primary,
      textAlign: 'center',
    },
    stepRow: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
    },
    stepCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepCircleActive: {
      backgroundColor: colors.primary,
    },
    stepNumber: {
      color: colors.text_secondary,
      fontWeight: '700',
    },
    stepNumberActive: {
      color: colors.textLight,
    },
    body: {
      fontSize: 14,
      color: colors.text_secondary,
      textAlign: 'center',
      paddingHorizontal: 16,
    },
    preview: {
      width: '100%',
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: colors.background,
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    previewImage: {
      width: '100%',
      height: 220,
      resizeMode: 'cover',
    },
    previewPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.secondary,
    },
    previewInitial: {
      fontSize: 34,
      fontWeight: '800',
      color: colors.textLight,
    },
    previewAvatar: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      width: 52,
      height: 52,
      borderRadius: 26,
      borderWidth: 2,
      borderColor: colors.surface,
      overflow: 'hidden',
      backgroundColor: colors.secondary,
    },
    nextButton: {
      paddingVertical: 14,
      borderRadius: 16,
      marginTop: 12,
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    nextButtonSecondary: {
      backgroundColor: colors.secondary,
    },
    nextButtonPrimary: {
      backgroundColor: colors.primary,
    },
    nextText: {
      color: colors.textLight,
      fontWeight: '800',
      fontSize: 16,
    },
  });
