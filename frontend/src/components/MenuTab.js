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
  color = 'primary',
  variant = 'menu-tab-m',
}) {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);
  const activeColor = colors[color] || colors.primary;
  const activeBg =
    colors[`${color}Soft`] || colors[`${color}Opacity`] || colors.secondarySoft || colors.secondaryOpacity || activeColor;
  const sizeStyles = {
    'menu-tab-xs': { paddingVertical: 6, paddingHorizontal: 8, fontSize: 12 },
    'menu-tab-s': { paddingVertical: 9, paddingHorizontal: 12, fontSize: 14 },
    'menu-tab-m': { paddingVertical: 10, paddingHorizontal: 14, fontSize: 15 },
    'menu-tab-l': { paddingVertical: 12, paddingHorizontal: 14, fontSize: 15 },
  };
  const size = sizeStyles[variant] || sizeStyles['menu-tab-m'];

  const renderButton = (item) => {
    const active = item.key === activeKey;
    return (
      <TouchableOpacity
        key={item.key}
        style={[
          styles.tabButton,
          buttonStyle,
          size && { paddingVertical: size.paddingVertical, paddingHorizontal: size.paddingHorizontal },
          active && styles.tabButtonActive,
          active && {
            borderColor: activeColor,
            backgroundColor: activeBg,
          },
          active && activeButtonStyle,
        ]}
        onPress={() => onChange?.(item.key)}
        activeOpacity={0.85}
      >
        <Text
          style={[
            styles.tabText,
            textStyle,
            size && { fontSize: size.fontSize },
            active && [styles.tabTextActive, { color: activeColor }],
            active && activeTextStyle,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const containerStyle = [
    styles.container,
    { paddingTop: topPadding, paddingHorizontal: horizontalPadding, marginBottom: 12 },
    style,
  ];

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
      color: colors.secondary,
    },
  });
