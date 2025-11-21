import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import { sendAnonMessage } from '../api';

export default function SendAnonymousMessageScreen({ route, navigation }) {
  const { inbox_id } = route.params || {};
  const [message, setMessage] = useState('');
  const onSend = async () => { try { await sendAnonMessage(inbox_id, message); navigation.goBack(); } catch {} };
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
      <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text_primary }}>Send Anonymous Message</Text>
      <TextInput placeholder="Message" value={message} onChangeText={setMessage} multiline style={{ borderWidth: 1, borderColor: colors.surface, padding: 12, borderRadius: 8, marginTop: 16, minHeight: 120 }} />
      <TouchableOpacity onPress={onSend} style={{ backgroundColor: colors.secondary, padding: 16, borderRadius: 8, marginTop: 16 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>Send</Text>
      </TouchableOpacity>
    </View>
  );
}