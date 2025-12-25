import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useTheme, useThemedStyles } from '../theme/darkMode';

const MAX_NOTE_LEN = 50;

const NoteBottomSheet = React.forwardRef(({ initialValue = '', onSave, onClose }, ref) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [note, setNote] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  const resetState = () => {
    setNote(initialValue);
    setLoading(false);
  };

  useImperativeHandle(ref, () => ({
    open: () => modalRef.current?.open(),
    close: () => modalRef.current?.close(),
  }));

  useEffect(() => {
    setNote(initialValue);
  }, [initialValue]);

  const handleNoteChange = useCallback((text) => {
    setNote(text.slice(0, MAX_NOTE_LEN));
  }, []);

  const handleSave = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onSave?.(note.trim());
      modalRef.current?.close();
    } finally {
      setLoading(false);
    }
  }, [loading, note, onSave]);

  return (
    <Modalize
      ref={modalRef}
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
      onOpened={() => {
        setNote(initialValue);
        requestAnimationFrame(() => inputRef.current?.focus?.());
      }}
    >
      <View style={styles.content}>
        <Text style={styles.sheetTitle}>Dodaj misao</Text>
        <Text style={styles.sheetSubtitle}>Kratka bilješka na tvom profilu.</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            value={note}
            placeholder="Podijeli u čemu danas razmišljaš..."
            placeholderTextColor={colors.text_secondary}
            onChangeText={handleNoteChange}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            style={[styles.input, inputFocused && { borderColor: colors.primary }]}
            autoCapitalize="sentences"
            autoCorrect
            maxLength={MAX_NOTE_LEN}
            autoFocus
          />
          <View style={styles.counterPill}>
            <Text style={styles.counterText}>{`${note.length}/${MAX_NOTE_LEN}`}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.submit} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.textLight} /> : <Text style={styles.submitText}>Sačuvaj</Text>}
        </TouchableOpacity>
      </View>
    </Modalize>
  );
});

export default NoteBottomSheet;

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
      marginBottom: 6,
    },
    sheetSubtitle: {
      fontSize: 14,
      color: colors.text_secondary,
      marginBottom: 12,
    },
    inputWrapper: {
      position: 'relative',
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 16,
      color: colors.text_primary,
      fontSize: 16,
    },
    counterPill: {
      position: 'absolute',
      top: -10,
      right: 10,
      backgroundColor: colors.surface,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    counterText: {
      fontSize: 12,
      color: colors.text_secondary,
      fontWeight: '700',
    },
    submit: {
      marginTop: 8,
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
