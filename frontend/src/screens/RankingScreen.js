import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function RankingScreen({ route }) {
  const { roomId } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ranking</Text>
      <Text style={styles.subtitle}>Prikaz rang liste za sobu #{roomId || '-'}</Text>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Ovde će ići lista po glasovima u sobi.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    paddingTop: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text_primary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text_secondary,
    marginBottom: 16,
  },
  placeholder: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ededed',
  },
  placeholderText: {
    color: colors.text_secondary,
    fontSize: 14,
  },
});
