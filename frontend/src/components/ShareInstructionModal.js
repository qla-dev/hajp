import React, { useMemo, useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useTheme, useThemedStyles } from '../theme/darkMode';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const SLIDE_PADDING = 16;
const SLIDE_WIDTH = CARD_WIDTH - SLIDE_PADDING * 2;

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
  const pagerRef = useRef(null);
  const [activePlatform, setActivePlatform] = useState('instagram');
  const [stepIndex, setStepIndex] = useState(0);

  const steps = SHARE_STEPS[activePlatform] || SHARE_STEPS.instagram;
  const current = steps[stepIndex] || steps[0];
  const isLastStep = stepIndex === steps.length - 1;
  const activeTabIcon = PLATFORM_TABS.find((t) => t.key === activePlatform)?.icon || 'share-social';

  const handlePlatform = (key) => {
    setActivePlatform(key);
    setStepIndex(0);
    Haptics.selectionAsync().catch(() => {});
    pagerRef.current?.scrollToIndex?.({ index: 0, animated: true });
  };

  const handleNext = () => {
    const next = (stepIndex + 1) % steps.length;
    setStepIndex(next);
    Haptics.selectionAsync().catch(() => {});
    pagerRef.current?.scrollToIndex?.({ index: next, animated: true });
  };

  if (!visible) return null;

  const handleStepPress = (idx) => {
    setStepIndex(idx);
    pagerRef.current?.scrollToIndex?.({ index: idx, animated: true });
    Haptics.selectionAsync().catch(() => {});
  };

  const onScrollEnd = (e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round((offsetX - SLIDE_PADDING) / SLIDE_WIDTH);
    if (newIndex !== stepIndex) {
      setStepIndex(newIndex);
      Haptics.selectionAsync().catch(() => {});
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={60} tint="dark" style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouchable} activeOpacity={1} onPress={onClose} />

        <TouchableOpacity onPress={onClose} style={styles.closeFloating} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="close" size={34} color="#fff" />
        </TouchableOpacity>

        <View style={styles.tabsFloating}>
          <View style={styles.tabRow}>
            {PLATFORM_TABS.map((tab) => {
              const active = tab.key === activePlatform;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => handlePlatform(tab.key)}
                  style={[styles.tabButton, active && styles.tabButtonActive]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name={tab.icon} size={22} color={active ? colors.text_primary : colors.text_secondary} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>{current.title}</Text>
            <View style={styles.stepRow}>
              {steps.map((_, idx) => {
                const active = idx === stepIndex;
                return (
                  <TouchableOpacity key={idx} onPress={() => handleStepPress(idx)} style={[styles.stepCircle, active && styles.stepCircleActive]}>
                    <Text style={[styles.stepNumber, active && styles.stepNumberActive]}>{idx + 1}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.body}>{current.body}</Text>
            <FlatList
              ref={pagerRef}
              data={steps}
              keyExtractor={(_, idx) => `${activePlatform}-${idx}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onScrollEnd}
              snapToAlignment="start"
              snapToOffsets={steps.map((_, idx) => SLIDE_PADDING + SLIDE_WIDTH * idx)}
              decelerationRate="fast"
              getItemLayout={(_, idx) => ({
                length: SLIDE_WIDTH,
                offset: SLIDE_PADDING + SLIDE_WIDTH * idx,
                index: idx,
              })}
              contentContainerStyle={styles.sliderContent}
              renderItem={({ item }) => (
                <View style={[styles.previewSlide]}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.previewImage} />
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
              )}
            />

            <TouchableOpacity
              style={[
                styles.nextButton,
                isLastStep ? styles.nextButtonPrimary : styles.nextButtonSecondary,
              ]}
              onPress={handleNext}
            >
              <View style={styles.nextRow}>
                {isLastStep && <Ionicons name={activeTabIcon} size={18} color={colors.textLight} style={styles.nextIcon} />}
                <Text style={styles.nextText}>{isLastStep ? 'Podijeli' : 'Sljedeći korak'}</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
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
    tabsFloating: {
      width: CARD_WIDTH,
      marginBottom: 10,
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    closeFloating: {
      position: 'absolute',
      top: 60,
      right: 34,
      zIndex: 20,
    },
    backdropTouchable: {
      ...StyleSheet.absoluteFillObject,
    },
    card: {
      width: CARD_WIDTH,
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
      justifyContent: 'center',
      gap: 12,
    },
    tabButton: {
      backgroundColor: 'transparent',
      borderRadius: 16,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    tabButtonActive: {
      backgroundColor: colors.surface,
      borderColor: colors.primary,
    },
    closeButton: {
      padding: 8,
      marginLeft: 8,
      display: 'none',
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
    sliderContent: {
      paddingHorizontal: SLIDE_PADDING,
    },
    previewSlide: {
      width: SLIDE_WIDTH,
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
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 2,
      borderColor: colors.surface,
      overflow: 'hidden',
      backgroundColor: colors.secondary,
      alignSelf: 'center',
      top: '50%',
      marginTop: -36,
    },
    nextButton: {
      paddingVertical: 14,
      borderRadius: 20,
      marginTop: 12,
      alignItems: 'center',
      backgroundColor: 'transparent',
      width: '100%',
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
    nextRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    nextIcon: {
      marginRight: 4,
    },
  });
