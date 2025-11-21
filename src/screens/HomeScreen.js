import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import { fetchPolls } from '../api';

export default function HomeScreen({ navigation }) {
  const [polls, setPolls] = useState([]);
  useEffect(() => {
    fetchPolls().then(({ data }) => setPolls(data)).catch(() => {});
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 22, fontWeight: '600', color: colors.text_primary }}>Gas</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}><Text>Profile</Text></TouchableOpacity>
      </View>
      <FlatList
        data={polls}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('PollDetail', { id: item.id })} style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 8, marginBottom: 12 }}>
            <Text style={{ fontWeight: '600', color: colors.text_primary }}>{item.question}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity onPress={() => navigation.navigate('CreatePoll')} style={{ position: 'absolute', right: 16, bottom: 16, backgroundColor: colors.primary, padding: 16, borderRadius: 24 }}>
        <Text style={{ color: '#fff' }}>New Poll</Text>
      </TouchableOpacity>
    </View>
  );
}