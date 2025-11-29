import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import { fetchPollDetail, votePoll } from '../api';

export default function PollDetailScreen({ route }) {
  const { id } = route.params || {};
  const [poll, setPoll] = useState(null);
  useEffect(() => {
    fetchPollDetail(id).then(({ data }) => setPoll(data)).catch(() => {});
  }, [id]);

  if (!poll) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>Loading</Text></View>;

  const onVote = async (opt) => {
    try { await votePoll(id, opt); } catch {}
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
      <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text_primary }}>{poll.question}</Text>
      <View style={{ height: 16 }} />
      {(poll.options || []).map((o) => (
        <TouchableOpacity key={o} onPress={() => onVote(o)} style={{ backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8 }}>
          <Text style={{ color: colors.text_primary }}>{o}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}