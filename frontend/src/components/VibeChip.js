import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/darkMode';

export default function VibeChip({
  option,
  active,
  onPress,
  descriptionLines = 2,
  style,
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <View style={styles.iconColumn}>
        <Ionicons
          name={option.icon}
          size={32}
          color={active ? colors.primary : colors.text_secondary}
          style={styles.icon}
        />
      </View>
      <View style={styles.textColumn}>
        <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
        {option.description ? (
          <Text style={styles.description} numberOfLines={descriptionLines}>
            {option.description}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      width: '100%',
      minHeight: 90,
      gap: 12,
    },
    chipActive: {
      borderColor: colors.primary,
    },
    iconColumn: {
      width: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      marginLeft: 0,
    },
    textColumn: {
      flex: 1,
      justifyContent: 'center',
      minHeight: 60,
    },
    label: {
      color: colors.text_secondary,
      fontWeight: '600',
    },
    labelActive: {
      color: colors.primary,
    },
    description: {
      fontSize: 12,
      color: colors.text_secondary,
      opacity: 0.75,
      marginTop: 2,
    },
  });
