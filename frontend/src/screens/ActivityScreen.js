import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '../theme/darkMode';

export default function ActivityScreen() {
  const styles = useThemedStyles(createStyles);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Aktivnosti</Text>
        <Text style={styles.subtitle}>Tvoje nedavne radnje će biti ovdje.</Text>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text_primary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: colors.text_secondary,
    },
  });
