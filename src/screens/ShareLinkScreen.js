import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';

export default function ShareLinkScreen() {
  const link = 'http://localhost:8000/inbox/preview';
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
      <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text_primary }}>Share Your Link</Text>
      <Text style={{ marginTop: 8 }}>{link}</Text>
      <TouchableOpacity style={{ marginTop: 12, backgroundColor: colors.primary, padding: 16, borderRadius: 8 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>Share</Text>
      </TouchableOpacity>
    </View>
  );
}