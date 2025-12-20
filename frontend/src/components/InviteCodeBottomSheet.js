import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { joinRoomByCode } from '../api';

const InviteCodeBottomSheet = React.forwardRef(({ onJoinSuccess, onClose }, ref) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const resetState = () => {
    setCode('');
    setError('');
    setLoading(false);
  };

  useEffect(() => {
    if (!error) return undefined;

    const timer = setTimeout(() => setError(''), 2600);
    return () => clearTimeout(timer);
  }, [error]);

  const handleJoin = useCallback(async () => {
    const trimmed = (code || '').trim();
    if (!trimmed) {
      setError('Unesi kod');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await joinRoomByCode(trimmed);
      onJoinSuccess?.();
      ref?.current?.close();
    } catch (joinError) {
      const message =
        joinError?.response?.data?.message ||
        joinError?.message ||
        'Neuspelo pridruživanje';
      setError(message);
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
          onChangeText={(text) => setCode(text)}
          style={styles.input}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
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
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
    },
    submitText: {
      color: colors.textLight,
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    error: {
      color: colors.error,
      fontSize: 13,
      marginBottom: 8,
    },
  });
