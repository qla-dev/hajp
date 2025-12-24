import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { fetchActiveQuestion, fetchRoomCashoutStatus, refreshQuestionOptions, voteQuestion, skipQuestion } from '../api';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');
let Haptics;
if (Platform.OS !== 'android') {
  // defer loading the native module on Android because it may not be available in the current build
  Haptics = require('expo-haptics');
}
const connectSoundAsset = require('../../assets/sounds/connect.mp3');

export default function PollingScreen({ route, navigation }) {
  const { roomId } = route.params || {};
  const { colors } = useTheme();
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
  const connectSoundRef = useRef(null);
  const emojis = useMemo(() => ['🔥', '🚀', '💎', '🏆', '🎉', '✨'], []);
  const backgrounds = useMemo(() => [colors.secondary, '#7c3aed', '#2563eb', '#0ea5e9', '#22c55e', '#f97316'], [colors.secondary]);
  const [bgColor, setBgColor] = useState(colors.secondary);
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
        if (mounted) {
          connectSoundRef.current = sound;
        } else {
          await sound.unloadAsync();
        }
      } catch {
        // ignore sound load errors
      }
    })();
    return () => {
      mounted = false;
      connectSoundRef.current?.unloadAsync();
      connectSoundRef.current = null;
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

  const normalizedOptions = options.slice(0, 4).map((option) => {
    if (option && typeof option === 'object') {
      const value = option.user_id ?? option.id;
      const label = option.name ?? String(value ?? '');
      return { value, label };
    }
    return { value: option, label: String(option ?? '') };
  });

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
            style={styles.optionButton}
            disabled={refreshingQuestion || interactionLocked}
          >
            <Text style={styles.optionText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

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
    },
    optionText: {
      color: '#000000',
      fontSize: 15,
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 20,
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
