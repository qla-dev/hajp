import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';

/**
 * Generic tab switcher used across screens.
 * items: [{ key, label }]
 */
export default function MenuTab({
  items = [],
  activeKey,
  onChange,
  topPadding = 0,
  horizontalPadding = 0,
  style,
  scrollable = false,
  contentContainerStyle,
  buttonStyle,
  activeButtonStyle,
  textStyle,
  activeTextStyle,
  gap = 10,
}) {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);

  const renderButton = (item) => {
    const active = item.key === activeKey;
    return (
      <TouchableOpacity
        key={item.key}
        style={[
          styles.tabButton,
          buttonStyle,
          active && styles.tabButtonActive,
          active && { backgroundColor: isDark ? 'rgba(255, 107, 53, 0.12)' : '#eef2ff', borderColor: colors.primary },
          active && activeButtonStyle,
        ]}
        onPress={() => onChange?.(item.key)}
        activeOpacity={0.85}
      >
        <Text style={[styles.tabText, textStyle, active && styles.tabTextActive, active && activeTextStyle]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const containerStyle = [styles.container, { paddingTop: topPadding, paddingHorizontal: horizontalPadding }, style];

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={containerStyle}
        contentContainerStyle={[styles.scrollContent, { gap }, contentContainerStyle]}
      >
        {items.map(renderButton)}
      </ScrollView>
    );
  }

  return <View style={[...containerStyle, { flexDirection: 'row', gap }]}>{items.map(renderButton)}</View>;
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {},
    scrollContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
    },
    tabButton: {
      flex: 1,
      backgroundColor: colors.surface,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    tabButtonActive: {},
    tabText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text_secondary,
    },
    tabTextActive: {
      color: colors.primary,
    },
  });
