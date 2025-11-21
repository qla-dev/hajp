import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import { login } from '../api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    try {
      await login({ email, password });
      navigation.replace('Home');
    } catch (e) {}
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: '600', color: colors.text_primary }}>Log In</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={{ borderWidth: 1, borderColor: colors.surface, padding: 12, borderRadius: 8, marginTop: 16 }} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, borderColor: colors.surface, padding: 12, borderRadius: 8, marginTop: 12 }} />
      <TouchableOpacity onPress={onLogin} style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 8, marginTop: 16 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '500' }}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
}