import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import { register } from '../api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');

  const onRegister = async () => {
    try {
      await register({ name, email, password, school, grade });
      navigation.replace('Home');
    } catch (e) {}
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '600', color: colors.text_primary }}>Create Account</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={{ borderWidth: 1, borderColor: colors.surface, padding: 12, borderRadius: 8, marginTop: 16 }} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={{ borderWidth: 1, borderColor: colors.surface, padding: 12, borderRadius: 8, marginTop: 12 }} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, borderColor: colors.surface, padding: 12, borderRadius: 8, marginTop: 12 }} />
      <TextInput placeholder="School" value={school} onChangeText={setSchool} style={{ borderWidth: 1, borderColor: colors.surface, padding: 12, borderRadius: 8, marginTop: 12 }} />
      <TextInput placeholder="Grade" value={grade} onChangeText={setGrade} style={{ borderWidth: 1, borderColor: colors.surface, padding: 12, borderRadius: 8, marginTop: 12 }} />
      <TouchableOpacity onPress={onRegister} style={{ backgroundColor: colors.secondary, padding: 16, borderRadius: 8, marginTop: 16 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '500' }}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}