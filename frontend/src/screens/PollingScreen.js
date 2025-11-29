import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '../theme/colors';
import { fetchActiveQuestion, refreshQuestionOptions, voteQuestion } from '../api';

const { width } = Dimensions.get('window');

export default function PollingScreen({ route, navigation }) {
  const { roomId } = route.params || {};
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const emojis = useMemo(() => ['🔥', '💥', '🎯', '✨', '🚀', '💡'], []);

  useEffect(() => {
    loadQuestion();
  }, [roomId]);

  const loadQuestion = async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      const { data } = await fetchActiveQuestion(roomId);
      setQuestion(data || null);
    } catch (error) {
      setQuestion(null);
      console.error('Error loading active question:', error);
    }
    setLoading(false);
  };

  const handleVote = async (option) => {
    if (!question) return;
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
    Haptics.selectionAsync().catch(() => {});
    await loadQuestion();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Učitavam pitanje...</Text>
      </View>
    );
  }

  if (!question) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Nema aktivnih pitanja</Text>
      </View>
    );
  }

  const emoji = question.emoji || emojis[0];
  const options = question.options || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.pollBlue }]}>
      <Text style={styles.counter}>Aktivno pitanje</Text>

      <View style={styles.pollContent}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.question}>{question.question}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {options.slice(0, 4).map((option, index) => (
          <TouchableOpacity key={index} onPress={() => handleVote(option)} style={styles.optionButton}>
            <Text style={styles.optionText}>{option}</Text>
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
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  counter: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 150,
  },
  pollContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  question: {
    color: colors.textLight,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 32,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'center',
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    margin: 6,
    width: (width - 64) / 2,
    alignItems: 'center',
  },
  optionText: {
    color: colors.text_primary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  actionButton: {
    alignItems: 'center',
  },
  iconWrapper: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    color: colors.text_primary,
    fontSize: 18,
    textAlign: 'center',
  },
});
