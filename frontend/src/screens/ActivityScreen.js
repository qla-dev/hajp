import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import colors from '../theme/colors';

export default function ActivityScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>Your recent actions will appear here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    borderColor: '#ededed',
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
