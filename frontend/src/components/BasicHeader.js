import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';

export default function BasicHeader({ title, transparent = false, rightComponent = null, onBack }) {
  const backgroundColor = transparent ? 'transparent' : colors.background;
  const borderColor = transparent ? 'rgba(255,255,255,0.7)' : colors.surface;
  const titleColor = transparent ? colors.textLight : colors.text_primary;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]}>
      <View style={[styles.bar, { borderBottomColor: borderColor }]}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={[styles.backText, { color: titleColor }]}>Nazad</Text>
          </TouchableOpacity>
        ) : null}
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
        {rightComponent ? <View style={styles.right}>{rightComponent}</View> : null}
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
    flexDirection: 'row',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text_primary,
  },
  backButton: {
    position: 'absolute',
    left: 12,
    top: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text_primary,
  },
  right: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
