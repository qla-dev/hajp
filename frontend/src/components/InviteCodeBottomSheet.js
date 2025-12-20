import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { joinRoomByCode } from '../api';

const InviteCodeBottomSheet = React.forwardRef(({ onJoinSuccess, onClose }, ref) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const handleCodeChange = useCallback((text) => {
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(cleaned);
  }, []);

  const [inputFocused, setInputFocused] = useState(false);

  const resetState = () => {
    setCode('');
    setLoading(false);
  };

  const handleJoin = useCallback(async () => {
    const trimmed = (code || '').trim();
    if (!trimmed) {
      Alert.alert('Greška', 'Unesi kod');
      return;
    }
    setLoading(true);
    try {
      const response = await joinRoomByCode(trimmed);
      const payload = response?.data;
      const roomName = payload?.room_name || 'sobi';
      Alert.alert('Uspjeh', `Uspješno si se pridružio sobi: ${roomName}`);
      onJoinSuccess?.();
      ref?.current?.close();
    } catch (joinError) {
      const message =
        joinError?.response?.data?.message ||
        'Uneseni kod ne pripada ni jednoj sobi. Pokušaj ponovo';
      Alert.alert('Greška', message);
    } finally {
      setLoading(false);
    }
  }, [code, onJoinSuccess, ref]);

  return (
    <Modalize
      ref={ref}
      handleStyle={styles.handle}
      modalStyle={styles.modal}
      overlayStyle={styles.overlay}
      adjustToContentHeight
      scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}
      panGestureEnabled
      onClosed={() => {
        resetState();
        onClose?.();
      }}
    >
      <View style={styles.content}>
        <Text style={styles.sheetTitle}>Ukucaj jedinstveni kod sobe</Text>
        <TextInput
          value={code}
          placeholder="ABC123"
          placeholderTextColor={colors.text_secondary}
          onChangeText={handleCodeChange}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          style={[styles.input, inputFocused && { borderColor: colors.primary }]}
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus
          maxLength={6}
        />
        <TouchableOpacity style={styles.submit} onPress={handleJoin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.textLight} />
          ) : (
            <Text style={styles.submitText}>Pridruži se</Text>
          )}
        </TouchableOpacity>
      </View>
    </Modalize>
  );
});

export default InviteCodeBottomSheet;

const createStyles = (colors) =>
  StyleSheet.create({
    modal: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      backgroundColor: colors.surface,
      paddingBottom: 24,
    },
    overlay: {
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    handle: {
      backgroundColor: colors.text_secondary,
      width: 80,
    },
    content: {
      paddingHorizontal: 24,
      paddingTop: 20,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text_primary,
      marginBottom: 15,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 16,
      color: colors.text_primary,
      fontSize: 16,
      letterSpacing: 2,
      marginBottom: 8,
    },
    submit: {
      marginTop: 12,
      marginBottom: 20,
      backgroundColor: colors.primary,
      borderRadius: 30,
      paddingVertical: 18,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOpacity: 0.25,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    submitText: {
      color: colors.textLight,
      fontSize: 18,
      fontWeight: '700',
    },
  });
