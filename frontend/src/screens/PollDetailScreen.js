import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/darkMode';
import { fetchPollDetail, votePoll } from '../api';

export default function PollDetailScreen({ route }) {
  const { id } = route.params || {};
  const [poll, setPoll] = useState(null);
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: colors.background },
    question: { fontSize: 20, fontWeight: '600', color: colors.text_primary },
    option: {
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionText: { color: colors.text_primary },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  });

  useEffect(() => {
    fetchPollDetail(id)
      .then(({ data }) => setPoll(data))
      .catch(() => {});
  }, [id]);

  if (!poll) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: colors.text_primary }}>Učitavam...</Text>
      </View>
    );
  }

  const onVote = async (opt) => {
    try {
      await votePoll(id, opt);
    } catch {}
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{poll.question}</Text>
      <View style={{ height: 16 }} />
      {(poll.options || []).map((o) => (
        <TouchableOpacity key={o} onPress={() => onVote(o)} style={styles.option}>
          <Text style={styles.optionText}>{o}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
