import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '../theme/colors';
import { fetchActiveQuestion, refreshQuestionOptions, voteQuestion, skipQuestion } from '../api';

const { width } = Dimensions.get('window');

export default function PollingScreen({ route, navigation }) {
  const { roomId } = route.params || {};
  const [question, setQuestion] = useState(null);
  const [total, setTotal] = useState(0);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const emojis = useMemo(() => ['🔥', '⭐️', '💥', '🎉', '💫', '✨'], []);

  useEffect(() => {
    loadQuestion();
  }, [roomId]);

  const loadQuestion = async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      const { data } = await fetchActiveQuestion(roomId);
      const incomingTotal = data?.total ?? 0;
      const incomingIndex = data?.index ?? 0;
      if (data?.question) {
        setQuestion(data.question);
        setFinished(false);
        setTotal(incomingTotal);
        setIndex(incomingIndex || (incomingTotal ? 1 : 0));
      } else {
        setQuestion(null);
        setFinished(true);
        setTotal(incomingTotal);
        setIndex(incomingIndex || 0);
      }
    } catch (error) {
      setQuestion(null);
      setFinished(false);
      console.error('Error loading active question:', error);
    }
    setLoading(false);
  };

  const handleVote = async (option) => {
    if (!question) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    try {
      await voteQuestion(question.id, option);
      await loadQuestion();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleShuffle = async () => {
    if (!question) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      const { data } = await refreshQuestionOptions(question.id);
      setQuestion({ ...question, ...data });
    } catch (error) {
      console.error('Error refreshing options:', error);
    }
  };

  const handleSkip = async () => {
    if (!question) {
      await loadQuestion();
      return;
    }
    Haptics.selectionAsync().catch(() => {});
    try {
      await skipQuestion(question.id);
    } catch {}
    await loadQuestion();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, styles.pollBackground]}>
        <ActivityIndicator size="large" color={colors.textLight} />
        <Text style={styles.loadingText}>Učitavanje ankete...</Text>
      </View>
    );
  }

  if (finished) {
    return (
      <View style={[styles.container, styles.center, styles.pollBackground]}>
        <Text style={styles.congratsEmoji}>🎉</Text>
        <Text style={styles.congratsTitle}>Čestitamo!</Text>
        <Text style={styles.congratsSubtitle}>Završio si ovu anketu.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Rooms')}>
          <Text style={styles.backButtonText}>Nazad na sobe</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!question) {
    return (
      <View style={[styles.container, styles.center, styles.pollBackground]}>
        <Text style={styles.loadingText}>Nema aktivnih pitanja</Text>
      </View>
    );
  }

  const emoji = question.emoji || emojis[0];
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
    <View style={[styles.container, styles.pollBackground]}>
      <Text style={styles.counter}>
        {index || 1} od {total || 0}
      </Text>

      <View style={styles.pollContent}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.question}>{question.question}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {normalizedOptions.map((option, idx) => (
          <TouchableOpacity key={idx} onPress={() => handleVote(option.value)} style={styles.optionButton}>
            <Text style={styles.optionText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bottomActions}>
        <TouchableOpacity onPress={handleShuffle} style={styles.actionButton}>
          <View style={styles.iconWrapper}>
            <Ionicons name="shuffle-outline" size={32} color={colors.textLight} />
          </View>
          <Text style={styles.actionText}>Izmiješaj</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} style={styles.actionButton}>
          <View style={styles.iconWrapper}>
            <Ionicons name="play-skip-forward-outline" size={32} color={colors.textLight} />
          </View>
          <Text style={styles.actionText}>Preskoči</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pollBackground: { backgroundColor: colors.pollBlue },
  center: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  counter: { color: colors.textLight, fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 150 },
  pollContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emoji: { fontSize: 80, marginBottom: 20 },
  question: { color: colors.textLight, fontSize: 24, fontWeight: '600', textAlign: 'center', lineHeight: 32 },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, justifyContent: 'center', marginBottom: 20 },
  optionButton: { backgroundColor: 'rgba(255, 255, 255, 0.92)', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12, margin: 6, width: (width - 64) / 2, alignItems: 'center' },
  optionText: { color: colors.text_primary, fontSize: 15, fontWeight: '600', textAlign: 'center' },
  bottomActions: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 40, paddingBottom: 40 },
  actionButton: { alignItems: 'center' },
  iconWrapper: { height: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  actionText: { color: colors.textLight, fontSize: 14, fontWeight: '600' },
  loadingText: { color: colors.textLight, fontSize: 18, textAlign: 'center', marginTop: 12 },
  congratsEmoji: { fontSize: 72, marginBottom: 12 },
  congratsTitle: { color: colors.textLight, fontSize: 26, fontWeight: '700', textAlign: 'center' },
  congratsSubtitle: { color: colors.textLight, fontSize: 16, textAlign: 'center', marginTop: 6, marginBottom: 20 },
  backButton: { backgroundColor: 'rgba(255,255,255,0.92)', paddingVertical: 14, paddingHorizontal: 22, borderRadius: 14 },
  backButtonText: { color: colors.text_primary, fontWeight: '700', fontSize: 16 },
});
