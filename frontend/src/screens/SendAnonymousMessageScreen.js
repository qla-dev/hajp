import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { sendAnonMessage } from '../api';

export default function SendAnonymousMessageScreen({ route, navigation }) {
  const { inbox_id } = route.params || {};
  const [message, setMessage] = useState('');

  const onSend = async () => {
    try {
      await sendAnonMessage(inbox_id, message);
      navigation.goBack();
    } catch (err) {
      console.error('Greška pri slanju poruke', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pošalji anonimnu poruku</Text>
      <TextInput
        placeholder="Poruka"
        value={message}
        onChangeText={setMessage}
        multiline
        style={styles.input}
        placeholderTextColor={colors.text_secondary}
      />
      <TouchableOpacity onPress={onSend} style={styles.sendButton}>
        <Text style={styles.sendText}>Pošalji</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text_primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    color: colors.text_primary,
  },
  sendButton: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  sendText: {
    color: colors.textLight,
    textAlign: 'center',
    fontWeight: '700',
  },
});
