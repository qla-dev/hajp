import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/darkMode';
import api from '../api';
import FormTextInput from '../components/FormTextInput';

export default function CreatePollScreen({ navigation }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [target_school, setTargetSchool] = useState('');

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const onSubmit = async () => {
    const payload = { question, options: options.filter(Boolean), target_school };
    try {
      await api.post('/polls', payload);
      navigation.goBack();
    } catch {}
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Poll</Text>
      <FormTextInput
        placeholder="Question"
        value={question}
        onChangeText={setQuestion}
        style={styles.input}
      />
      {options.map((opt, i) => (
        <FormTextInput
          key={i}
          placeholder={`Option ${i + 1}`}
          value={opt}
          onChangeText={(text) => {
            const next = [...options];
            next[i] = text;
            setOptions(next);
          }}
          style={styles.input}
        />
      ))}
      <TouchableOpacity onPress={() => setOptions([...options, ''])} style={styles.addButton}>
        <Text style={styles.addButtonText}>Add option</Text>
      </TouchableOpacity>
      <FormTextInput
        placeholder="Target School"
        value={target_school}
        onChangeText={setTargetSchool}
        style={styles.input}
      />
      <TouchableOpacity onPress={onSubmit} style={styles.submitButton}>
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: colors.background },
    title: { fontSize: 20, fontWeight: '600', color: colors.text_primary },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 8,
      marginTop: 12,
      color: colors.text_primary,
    },
    addButton: { marginTop: 8 },
    addButtonText: { color: colors.primary, fontWeight: '600' },
    submitButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 8, marginTop: 16 },
    submitText: { color: colors.textLight, textAlign: 'center', fontWeight: '700' },
  });
