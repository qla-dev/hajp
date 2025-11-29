import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import api from '../api';

export default function CreatePollScreen({ navigation }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['','']);
  const [target_school, setTargetSchool] = useState('');

  const onSubmit = async () => {
    const payload = { question, options: options.filter(Boolean), target_school };
    try { await api.post('/api/polls', payload); navigation.goBack(); } catch {}
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
      <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text_primary }}>Create Poll</Text>
      <TextInput placeholder="Question" value={question} onChangeText={setQuestion} style={{ borderWidth: 1, borderColor: colors.surface, padding: 12, borderRadius: 8, marginTop: 16 }} />
      {options.map((opt, i) => (
        <TextInput key={i} placeholder={`Option ${i+1}`} value={opt} onChangeText={(t)=>{
          const next = [...options]; next[i]=t; setOptions(next);
        }} style={{ borderWidth: 1, borderColor: colors.surface, padding: 12, borderRadius: 8, marginTop: 12 }} />
      ))}
      <TouchableOpacity onPress={()=> setOptions([...options,''])} style={{ marginTop: 8 }}><Text style={{ color: colors.primary }}>Add option</Text></TouchableOpacity>
      <TextInput placeholder="Target School" value={target_school} onChangeText={setTargetSchool} style={{ borderWidth: 1, borderColor: colors.surface, padding: 12, borderRadius: 8, marginTop: 12 }} />
      <TouchableOpacity onPress={onSubmit} style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 8, marginTop: 16 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}