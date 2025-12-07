import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useTheme, useThemedStyles } from '../theme/darkMode';

const CreateRoomModal = forwardRef(({ onCreate }, ref) => {
  const modalRef = useRef(null);
  const [roomName, setRoomName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  useImperativeHandle(ref, () => ({
    open: () => modalRef.current?.open(),
    close: () => modalRef.current?.close(),
  }));

  const handleSubmit = useCallback(async () => {
    const trimmed = roomName.trim();
    if (!trimmed || submitting) return;
    if (!onCreate) return;
    setSubmitting(true);
    try {
      await onCreate(trimmed);
      setRoomName('');
      modalRef.current?.close();
    } catch {
      // swallow errors
    } finally {
      setSubmitting(false);
    }
  }, [roomName, onCreate, submitting]);

  return (
    <Modalize
      ref={modalRef}
      adjustToContentHeight
      handleStyle={styles.modalHandle}
      modalStyle={styles.modalizeModal}
      onClosed={() => setRoomName('')}
    >
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Kreiraj novu sobu</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="Naziv sobe"
          placeholderTextColor={colors.text_secondary}
          value={roomName}
          onChangeText={setRoomName}
          autoCapitalize="words"
          selectionColor={colors.primary}
          onSubmitEditing={() => handleSubmit()}
          editable={!submitting}
        />
        <TouchableOpacity
          style={[styles.modalButton, (!roomName.trim() || submitting) && styles.modalButtonDisabled]}
          onPress={handleSubmit}
          disabled={!roomName.trim() || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.textLight} />
          ) : (
            <Text style={styles.modalButtonText}>Dodaj sobu</Text>
          )}
        </TouchableOpacity>
      </View>
    </Modalize>
  );
});

const createStyles = (colors) =>
  StyleSheet.create({
    modalHandle: {
      backgroundColor: colors.border,
      width: 50,
    },
    modalizeModal: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    modalContent: {
      padding: 24,
      gap: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text_primary,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: colors.text_primary,
      backgroundColor: colors.background,
    },
    modalButton: {
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    modalButtonDisabled: {
      opacity: 0.6,
    },
    modalButtonText: {
      color: colors.textLight,
      fontWeight: '700',
      fontSize: 15,
    },
  });

export default CreateRoomModal;
