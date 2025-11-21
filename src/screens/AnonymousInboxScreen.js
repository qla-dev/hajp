import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import colors from '../theme/colors';
import { getInbox } from '../api';

export default function AnonymousInboxScreen({ route }) {
  const { userId } = route.params || {};
  const [inbox, setInbox] = useState(null);
  useEffect(() => { getInbox(userId).then(({ data }) => setInbox(data)).catch(() => {}); }, [userId]);
  const link = inbox?.share_link || '';
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
      <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text_primary }}>Anonymous Inbox</Text>
      <Text style={{ marginTop: 8 }}>{link}</Text>
      <TouchableOpacity style={{ marginTop: 8, backgroundColor: colors.secondary, padding: 12, borderRadius: 8 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>Copy & Share</Text>
      </TouchableOpacity>
      <FlatList
        style={{ marginTop: 16 }}
        data={inbox?.messages || []}
        keyExtractor={(m) => String(m.id)}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8 }}>
            <Text style={{ color: colors.text_primary }}>{item.message}</Text>
          </View>
        )}
      />
    </View>
  );
}