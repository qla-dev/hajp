import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';

export default function UserOrientationsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spreman si</Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
        activeOpacity={0.9}
      >
        <Text style={styles.primaryButtonText}>Otvori aplikaciju</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      padding: 24,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text_primary,
      marginBottom: 24,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 16,
    },
    primaryButtonText: {
      color: colors.textLight,
      fontWeight: '700',
      fontSize: 16,
    },
  });
