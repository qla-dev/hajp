import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ImageBackground, Dimensions, Alert, FlatList } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { getCurrentUser, baseURL } from '../api';
import ShareInstructionModal from '../components/ShareInstructionModal';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72;
const CARD_SPACING = 14;

const topics = [
  {
    key: 'anon',
    title: 'Pošalji mi anonimnu poruku',
    topic: 'anon',
    background: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=60',
  },
  {
    key: 'threewords',
    title: 'Opiši me u 3 riječi',
    topic: '3words',
    background: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60',
  },
  {
    key: 'hotseat',
    title: 'Postavi mi hot seat pitanje',
    topic: 'hotseat',
    background: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=60',
  },
];

export default function ShareScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const flatListRef = useRef(null);
  const [user, setUser] = useState(null);
  const [index, setIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      const data = await getCurrentUser();
      setUser(data);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const onScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / (CARD_WIDTH + CARD_SPACING));
    if (newIndex !== index) {
      setIndex(newIndex);
      Haptics.selectionAsync().catch(() => {});
    }
  };

  const activeTopic = topics[index] || topics[0];

  const shareLink = useMemo(() => {
    const username = user?.username || 'username';
    const cleanBase = (baseURL || '').replace(/\/+$/, '');
    return `https://hajp.app/${username}/${activeTopic.topic}`;
  }, [activeTopic.topic, user?.username]);

  const avatarUri = useMemo(() => {
    if (user?.profile_photo) {
      const photo = user.profile_photo;
      if (/^https?:\/\//i.test(photo)) return photo;
      const cleanBase = (baseURL || '').replace(/\/+$/, '');
      const cleanPath = photo.replace(/^\/+/, '');
      return `${cleanBase}/${cleanPath}`;
    }
    return null;
  }, [user?.profile_photo]);

  const avatarInitial = useMemo(() => {
    const name = (user?.name || '').trim();
    if (!name) {
      return 'K';
    }
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.charAt(0) || '';
    const last = parts[1]?.charAt(0) || '';
    return (first + last).toUpperCase() || 'K';
  }, [user?.name]);

  const onCopyLink = async () => {
    try {
      Haptics.selectionAsync().catch(() => {});
      await Clipboard.setStringAsync(shareLink);
      Alert.alert('Link kopiran!', shareLink, [
        {
          text: 'OK',
          onPress: () => setShowShareModal(true),
        },
      ]);
    } catch {
      Alert.alert('Greška', 'Nismo mogli kopirati link.');
    }
  };

  const onShare = () => {
    Haptics.selectionAsync().catch(() => {});
    setShowShareModal(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentInsetAdjustmentBehavior="always">
        <FlatList
          ref={flatListRef}
          data={topics}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ImageBackground source={{ uri: item.background }} style={styles.bigCard} imageStyle={styles.cardImage}>
                <View style={styles.cardOverlay}>
                  <View style={styles.avatarWrapper}>
                    {avatarUri ? (
                      <Image source={{ uri: avatarUri }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarInitial}>{avatarInitial}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </View>
              </ImageBackground>
            </View>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          onMomentumScrollEnd={onScrollEnd}
          contentContainerStyle={styles.carouselContent}
          snapToAlignment="start"
          snapToOffsets={topics.map((_, i) => i * (CARD_WIDTH + CARD_SPACING))}
          disableIntervalMomentum
          ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
        />
        <View style={styles.pagination}>
          {topics.map((_, dotIdx) => (
            <View key={dotIdx} style={[styles.dot, dotIdx === index && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>Korak 1: Kopiraj svoj link</Text>
          <Text style={styles.linkLabel}>{shareLink}</Text>
          <TouchableOpacity style={styles.copyButton} onPress={onCopyLink}>
            <View style={styles.copyContent}>
              <Ionicons name="link" size={18} color={colors.primary} style={styles.iconMargin} />
              <Text style={styles.copyText}>Kopiraj link</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>Korak 2: Podijeli link u story</Text>
          <TouchableOpacity style={styles.shareButton} onPress={onShare}>
            <View style={styles.shareContent}>
              <Ionicons name="share-social" size={18} color={colors.textLight} style={styles.iconMargin} />
              <Text style={styles.shareButtonText}>Podijeli!</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ShareInstructionModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        avatarUri={avatarUri}
        avatarInitial={avatarInitial}
      />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    carouselContent: {
      paddingVertical: 16,
      paddingHorizontal: (width - CARD_WIDTH) / 2,
    },
    cardWrapper: {
      width: CARD_WIDTH,
    },
    bigCard: {
      height: 240,
      borderRadius: 24,
      overflow: 'hidden',
    },
    cardImage: {
      borderRadius: 24,
    },
    cardOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      gap: 12,
    },
    avatarWrapper: {
      width: 74,
      height: 74,
      borderRadius: 37,
      overflow: 'hidden',
      backgroundColor: colors.secondary,
    },
    avatar: {
      width: '100%',
      height: '100%',
    },
    avatarPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.secondary,
    },
    avatarInitial: {
      color: colors.textLight,
      fontWeight: '700',
      fontSize: 20,
    },
    cardTitle: {
      color: colors.textLight,
      fontSize: 20,
      fontWeight: '800',
      textAlign: 'center',
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(120,120,120,0.25)',
      marginBottom: 10,
    },
    dotActive: {
      backgroundColor: colors.primary,
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
      marginTop: 6,
      marginBottom: 2,
    },
    stepCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    stepTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text_primary,
      marginBottom: 12,
    },
    linkLabel: {
      fontSize: 14,
      color: colors.text_secondary,
      marginBottom: 12,
    },
    copyButton: {
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: 20,
      paddingVertical: 12,
      alignItems: 'center',
    },
    copyContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconMargin: {
      marginRight: 8,
    },
    copyText: {
      color: colors.primary,
      fontWeight: '800',
      fontSize: 15,
    },
    shareButton: {
      marginTop: 12,
      borderRadius: 22,
      paddingVertical: 14,
      backgroundColor: colors.primary,
    },
    shareContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    shareButtonText: {
      color: colors.textLight,
      fontWeight: '800',
      fontSize: 16,
    },
  });
