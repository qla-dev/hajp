import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';

export default function BottomCTA({ label, onPress, iconName, emoji, fixed = false }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.container, fixed && styles.containerFixed]}>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        {iconName ? (
          <Ionicons name={iconName} size={20} color={colors.textLight} style={styles.icon} />
        ) : emoji ? (
          <Text style={styles.emoji}>{emoji}</Text>
        ) : null}
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      padding: 20,
      paddingBottom: 10,
      paddingTop: 10,
      backgroundColor: 'transparent',
    },
    containerFixed: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#FFFFFF',
    },
    button: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 18,
      borderRadius: 30,
      minHeight: 56,
    },
    icon: {
      marginRight: 8,
    },
    emoji: {
      fontSize: 20,
      marginRight: 8,
      marginBottom: 2,
      color: colors.textLight,
    },
    label: {
      color: colors.textLight,
      fontSize: 16,
      fontWeight: '700',
    },
  });
