import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function BasicHeader({ title, transparent = false }) {
  const backgroundColor = transparent ? 'transparent' : colors.background;
  const borderColor = transparent ? 'rgba(255,255,255,0.7)' : colors.surface;
  const titleColor = transparent ? colors.textLight : colors.text_primary;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]}>
      <View style={[styles.bar, { borderBottomColor: borderColor }]}>
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.background,
  },
  bar: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text_primary,
  },
});
