import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme, useThemedStyles } from '../theme/darkMode';

export default function BottomCTA({
  label,
  onPress,
  iconName,
  emoji,
  fixed = false,
  style,
  leading,
  disabled = false,
}) {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);

  const Container = fixed ? BlurView : View;
  const leadingNode =
    leading ??
    (iconName ? (
      <Ionicons name={iconName} size={20} color={colors.textLight} style={styles.icon} />
    ) : emoji ? (
      <Text style={styles.emoji}>{emoji}</Text>
    ) : null);

  return (
    <Container
      intensity={fixed ? 24 : 0}
      tint={isDark ? 'dark' : 'light'}
      style={[styles.container, fixed && styles.containerFixed, style]}
    >
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={onPress}
        disabled={disabled}
      >
        {leadingNode ? <View style={styles.leading}>{leadingNode}</View> : null}
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </Container>
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
      backgroundColor: 'rgba(255,255,255,0)',
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
    buttonDisabled: {
      opacity: 0.6,
    },
    leading: {
      marginRight: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {},
    emoji: {
      fontSize: 20,
      marginBottom: 2,
      color: colors.textLight,
    },
    label: {
      color: colors.textLight,
      fontSize: 16,
      fontWeight: '700',
    },
  });
