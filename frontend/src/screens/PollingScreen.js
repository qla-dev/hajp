import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Platform, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { baseURL, fetchActiveQuestion, fetchRoomCashoutStatus, refreshQuestionOptions, voteQuestion, skipQuestion } from '../api';
import { Audio } from 'expo-av';
import Avatar from '../components/Avatar';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
let Haptics;
if (Platform.OS !== 'android') {
  // defer loading the native module on Android because it may not be available in the current build
  Haptics = require('expo-haptics');
}
const connectSoundAsset = require('../../assets/sounds/connect.mp3');
const skipSoundAsset = require('../../assets/sounds/skip.mp3');
const shuffleSoundAsset = require('../../assets/sounds/shuffle.mp3');



export default function PollingScreen({ route, navigation }) {
  const { roomId } = route.params || {};
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);
  const headerHeight = useHeaderHeight();
  const [question, setQuestion] = useState(null);
  const [total, setTotal] = useState(0);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshingQuestion, setRefreshingQuestion] = useState(false);
  const [interactionLocked, setInteractionLocked] = useState(false);
  const [finished, setFinished] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [zoomAvatar, setZoomAvatar] = useState(null);
  const [zoomVisible, setZoomVisible] = useState(false);
  const zoomAnim = useRef(new Animated.Value(0)).current;
  const connectSoundRef = useRef(null);
  const skipSoundRef = useRef(null);
  const shuffleSoundRef = useRef(null);
  const emojis = useMemo(() => ['🔥', '🚀', '💎', '🏆', '🎉', '✨'], []);
  const backgrounds = useMemo(
    () => [
      colors.primary,
      '#dc2626',
      '#2563eb',
      '#f97316',
      '#16a34a',
      '#9333ea',
      '#d97706',
      '#059669',
      '#e11d48',
      '#0ea5e9',
      '#6b21a8',
      '#22c55e',
      '#f59e0b',
      '#0284c7',
      '#ea580c',
      '#14b8a6',
      '#b91c1c',
      '#4f46e5',
      '#047857',
      '#c026d3',
    ],
    [colors.primary],
  );
  const [bgColor, setBgColor] = useState(colors.primary);
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      const parent = navigation.getParent();
      if (parent) {
        parent.setParams({ refreshRooms: Date.now() });
      }
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(connectSoundAsset, { shouldPlay: false });
        const { sound: skipSound } = await Audio.Sound.createAsync(skipSoundAsset, { shouldPlay: false });
        const { sound: shuffleSound } = await Audio.Sound.createAsync(shuffleSoundAsset, { shouldPlay: false });
        await shuffleSound.setVolumeAsync(0.1);
        if (mounted) {
          connectSoundRef.current = sound;
          skipSoundRef.current = skipSound;
          shuffleSoundRef.current = shuffleSound;
        } else {
          await sound.unloadAsync();
          await skipSound.unloadAsync();
          await shuffleSound.unloadAsync();
        }
      } catch {
        // ignore sound load errors
      }
    })();
    return () => {
      mounted = false;
      connectSoundRef.current?.unloadAsync();
      skipSoundRef.current?.unloadAsync();
      shuffleSoundRef.current?.unloadAsync();
      connectSoundRef.current = null;
      skipSoundRef.current = null;
      shuffleSoundRef.current = null;
    };
  }, []);

  const handleNoActivePoll = useCallback(async () => {
    if (!roomId) return;
    try {
      const { data } = await fetchRoomCashoutStatus(roomId);
      const targetScreen = data?.can_cashout ? 'CashOut' : 'NextPollCountdown';
      navigation.replace(targetScreen, {
        roomId,
        pollId: data?.poll_id,
        nextPollAt: data?.next_poll_at,
        cashoutAmount: data?.cashout_amount,
      });
    } catch (transitionError) {
      console.error('Failed to determine next screen', transitionError);
    }
  }, [navigation, roomId]);

  useEffect(() => {
    loadQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const loadQuestion = async () => {
    if (!roomId) return;
    if (firstLoad) {
      setLoading(true);
    } else {
      setRefreshingQuestion(true);
    }

    try {
      const { data } = await fetchActiveQuestion(roomId);
      const incomingTotal = data?.total ?? 0;
      const incomingIndex = data?.index ?? 0;

      if (data?.question) {
        setQuestion(data.question);
        setFinished(false);
        setTotal(incomingTotal);
        setIndex(incomingIndex || (incomingTotal ? 1 : 0));
        const idx = Math.max(0, (incomingIndex || 1) - 1);
        setBgColor(backgrounds[idx % backgrounds.length]);
      } else {
        await handleNoActivePoll();
        return;
      }
    } catch (error) {
      if (error?.response?.status === 404) {
        await handleNoActivePoll();
        return;
      }
      setQuestion(null);
      setFinished(false);
      console.error('Error loading active question:', error);
    } finally {
      setFirstLoad(false);
      setLoading(false);
      setRefreshingQuestion(false);
      setInteractionLocked(false);
    }
  };

  const handleVote = async (option) => {
    if (!question || interactionLocked) return;
    setInteractionLocked(true);
    Haptics?.impactAsync?.(Haptics?.ImpactFeedbackStyle?.Medium)?.catch(() => {});
    connectSoundRef.current?.replayAsync().catch(() => {});
    try {
      await voteQuestion(question.id, option, roomId);
      await loadQuestion();
    } catch (error) {
      console.error('Error voting:', error);
      setInteractionLocked(false);
    }
  };

  const handleShuffle = async () => {
    if (!question) return;
    Haptics?.impactAsync?.(Haptics?.ImpactFeedbackStyle?.Light)?.catch(() => {});
    shuffleSoundRef.current?.replayAsync().catch(() => {});
    try {
      const { data } = await refreshQuestionOptions(question.id);
      setQuestion({ ...question, ...data });
    } catch (error) {
      console.error('Error refreshing options:', error);
    }
  };

  const handleSkip = async () => {
    if (!question) {
      setInteractionLocked(true);
      await loadQuestion();
      return;
    }
    if (interactionLocked) return;
    setInteractionLocked(true);
    Haptics?.selectionAsync?.()?.catch(() => {});
    skipSoundRef.current?.replayAsync().catch(() => {});
    try {
      await skipQuestion(question.id, roomId);
    } catch {}
    await loadQuestion();
  };

  if (loading && firstLoad) {
    const loadingLabel = firstLoad ? 'Učitavanje ankete' : 'Učitavanje pitanja';
    return (
      <View style={[styles.container, styles.center, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={colors.textLight} />
        <Text style={styles.loadingText}>{loadingLabel}</Text>
      </View>
    );
  }

  if (finished) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: bgColor }]}>
        <Text style={styles.congratsEmoji}>{emojis[0]}</Text>
        <Text style={styles.congratsTitle}>Cestitamo!</Text>
        <Text style={styles.congratsSubtitle}>Zavrsio si ovu anketu.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Rooms')}>
          <Text style={styles.backButtonText}>Nazad na sobe</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!question) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: bgColor }]}>
        <Text style={styles.loadingText}>Nema aktivnih pitanja</Text>
      </View>
    );
  }

  const emoji = question.emoji || emojis[index % emojis.length];
  const options = question.options || [];

  const resolveAvatar = (photo) => {
    if (!photo) return null;
    // Raw SVG markup -> convert to data URI so Avatar can render it
    if (typeof photo === 'string' && photo.includes('<svg')) {
      const encoded = encodeURIComponent(photo);
      return `data:image/svg+xml;utf8,${encoded}`;
    }
    if (typeof photo === 'string' && /^https?:\/\//i.test(photo)) return photo;
    const cleanBase = (baseURL || '').replace(/\/+$/, '');
    const cleanPath = String(photo).replace(/^\/+/, '');
    if (!cleanBase) return null;
    return `${cleanBase}/${cleanPath}`;
  };

  const normalizedOptions = options.slice(0, 4).map((option, idx) => {
    if (option && typeof option === 'object') {
      const value = option.user_id ?? option.id;
      const label = option.name ?? String(value ?? '');
      const rawAvatar =
        option.profile_photo ||
        option.avatar ||
        option.avatar_url ||
        option.avatarSvg ||
        option.avatar_svg ||
        option.avatar_svg_url ||
        option.avatarSvgUrl ||
        option.photo ||
        option.image ||
        option.picture ||
        option.user?.profile_photo ||
        option.user?.avatar ||
        option.user?.avatar_url ||
        option.user?.photo ||
        option.user?.image ||
        null;
      const avatarUri = resolveAvatar(rawAvatar);
      return { value, label, avatarUri };
    }
    const avatarUri = resolveAvatar(option);
    return { value: option, label: String(option ?? ''), avatarUri };
  });

  const handleOptionLongPress = (option) => {
    if (!option) return;
    Haptics?.selectionAsync?.()?.catch(() => {});
    setZoomAvatar({
      uri: option.avatarUri,
      name: option.label,
    });
    setZoomVisible(true);
    zoomAnim.setValue(0);
    Animated.spring(zoomAnim, {
      toValue: 1,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const closeZoom = () => {
    Animated.timing(zoomAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setZoomVisible(false));
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.progressTrack, { top: headerHeight }]}>
        <View style={[styles.progressFill, { width: `${total ? Math.min(Math.max((index || 0) / (total || 1), 0), 1) * 100 : 0}%` }]} />
      </View>
      <Text style={styles.counter}>
        {index || 1} od {total || 0}
      </Text>

      <View style={styles.pollContent}>
        {refreshingQuestion ? (
          <>
            <ActivityIndicator size="large" color={colors.textLight} />
            <Text style={styles.loadingText}>Učitavanje pitanja</Text>
          </>
        ) : (
          <>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.question}>{question.question}</Text>
          </>
        )}
      </View>

      <View style={styles.optionsContainer}>
        {normalizedOptions.map((option, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => handleVote(option.value)}
            onLongPress={() => handleOptionLongPress(option)}
            style={styles.optionButton}
            disabled={refreshingQuestion || interactionLocked}
          >
            <Avatar
              uri={option.avatarUri}
              name={option.label}
              size={36}
              style={[
                styles.optionAvatar,
                idx === 0 && styles.avatarTopLeft,
                idx === 1 && styles.avatarTopRight,
                idx === 2 && styles.avatarBottomLeft,
                idx === 3 && styles.avatarBottomRight,
              ]}
            />
            <Text style={styles.optionText}>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>

      {zoomVisible && (
        <Pressable style={styles.zoomOverlay} onPress={closeZoom}>
          <BlurView
            intensity={35}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFillObject}
          />
          <Animated.View
            style={[
              styles.zoomAvatarWrap,
              {
                opacity: zoomAnim,
                transform: [
                  {
                    scale: zoomAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1.02],
                    }),
                  },
                ],
              },
            ]}
          >
            <Avatar uri={zoomAvatar?.uri} name={zoomAvatar?.name} size={300} />
          </Animated.View>
        </Pressable>
      )}

      <View style={styles.bottomActions}>
        <TouchableOpacity onPress={handleShuffle} style={styles.actionButton} disabled={refreshingQuestion || interactionLocked}>
          <View style={styles.iconWrapperSmall}>
            <Ionicons name="shuffle-outline" size={26} color={colors.textLight} />
          </View>
          <Text style={styles.actionText}>Novi odgovori</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} style={styles.actionButton} disabled={refreshingQuestion || interactionLocked}>
          <View style={styles.iconWrapperSmall}>
            <Ionicons name="play-skip-forward-outline" size={24} color={colors.textLight} />
          </View>
          <Text style={styles.actionText}>Preskoči pitanje</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1 },
    progressTrack: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 3,
      backgroundColor: 'rgba(255,255,255,0.35)',
      zIndex: 1,
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#FFFFFF',
    },
    center: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
    counter: { color: colors.textLight, fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 120 },
    pollContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emoji: { fontSize: 80, marginBottom: 20 },
    question: { color: colors.textLight, fontSize: 24, fontWeight: '600', textAlign: 'center', lineHeight: 32 },
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 20,
      justifyContent: 'center',
      marginBottom: 20,
    },
    optionButton: {
      backgroundColor: '#ffffff',
      height: 72,
      paddingHorizontal: 16,
      borderRadius: 12,
      margin: 6,
      width: (width - 64) / 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#ffffff',
      position: 'relative',
      overflow: 'visible',
    },
    optionText: {
      color: '#000000',
      fontSize: 15,
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 20,
    },
    optionAvatar: {
      position: 'absolute',
      width: 36,
      height: 36,
    },
    avatarTopLeft: {
      top: -18,
      left: -18,
    },
    avatarTopRight: {
      top: -18,
      right: -18,
    },
    avatarBottomLeft: {
      bottom: -18,
      left: -18,
    },
    avatarBottomRight: {
      bottom: -18,
      right: -18,
    },
    zoomOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      zIndex: 30,
    },
    zoomAvatarWrap: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    bottomActions: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 40, paddingBottom: 40 },
    actionButton: { alignItems: 'center' },
    iconWrapperSmall: { height: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
    actionText: { color: colors.textLight, fontSize: 14, fontWeight: '600' },
    loadingText: { color: colors.textLight, fontSize: 18, textAlign: 'center', marginTop: 12 },
    congratsEmoji: { fontSize: 72, marginBottom: 12 },
    congratsTitle: { color: colors.textLight, fontSize: 26, fontWeight: '700', textAlign: 'center' },
    congratsSubtitle: { color: colors.textLight, fontSize: 16, textAlign: 'center', marginTop: 6, marginBottom: 20 },
    backButton: {
      backgroundColor: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.92)',
      paddingVertical: 14,
      paddingHorizontal: 22,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.9)',
    },
    backButtonText: { color: isDark ? colors.textLight : colors.text_primary, fontWeight: '700', fontSize: 16 },
  });
