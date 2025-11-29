import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import colors from '../theme/colors';
import { fetchPolls, fetchPollDetail, refreshPollOptions, votePoll } from '../api';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [polls, setPolls] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const emojis = useMemo(() => ['🔥', '💥', '🎯', '✨', '🚀', '💡'], []);

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    setLoading(true);
    try {
      const { data } = await fetchPolls();
      setPolls(data || []);
    } catch (error) {
      console.error('Error loading polls:', error);
    }
    setLoading(false);
  };

  const handleVote = async (option) => {
    const poll = polls[currentIndex];
    try {
      await votePoll(poll.id, option);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      if (currentIndex < polls.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
    }
  };

  const handleShuffle = async () => {
    if (!polls.length) return;
    const poll = polls[currentIndex];
    try {
      const { data } = await refreshPollOptions(poll.id);
      const refreshed = { ...poll, ...data };
      const nextPolls = [...polls];
      nextPolls[currentIndex] = refreshed;
      setPolls(nextPolls);
    } catch (error) {
      console.error('Error refreshing poll:', error);
    }
  };

  const handleSkip = () => {
    if (currentIndex < polls.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Učitavam ankete...</Text>
      </View>
    );
  }

  if (polls.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Nema dostupnih anketa</Text>
        <TouchableOpacity onPress={loadPolls} style={[styles.retryButton, { marginTop: 12 }]}>
          <Text style={styles.retryText}>Ponovo učitaj</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentPoll = polls[currentIndex];
  const pollColors = [colors.pollBlue, colors.pollPink, colors.pollPurple, colors.pollTeal, colors.pollOrange];
  const bgColor = pollColors[currentIndex % pollColors.length];
  const emoji = currentPoll.emoji || emojis[currentIndex % emojis.length];

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={styles.counter}>
        {currentIndex + 1} od {polls.length}
      </Text>

      <View style={styles.pollContent}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.question}>{currentPoll.question}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {currentPoll.options &&
          currentPoll.options.slice(0, 4).map((option, index) => (
            <TouchableOpacity key={index} onPress={() => handleVote(option)} style={styles.optionButton}>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
      </View>

      <View style={styles.bottomActions}>
        <TouchableOpacity onPress={handleShuffle} style={styles.actionButton}>
          <Text style={styles.actionIcon}>🔀</Text>
          <Text style={styles.actionText}>Izmiješaj</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} style={styles.actionButton}>
          <Text style={styles.actionIcon}>⏭️</Text>
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
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
    color: colors.textLight,
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
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: colors.textLight,
    fontWeight: '700',
  },
});
