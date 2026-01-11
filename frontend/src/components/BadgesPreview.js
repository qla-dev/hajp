import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';

export default function BadgesPreview({
  badges = [],
  onPress,
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  if (!badges || badges.length === 0) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="ribbon-outline" size={18} color={colors.primary} />
          <Text style={styles.title}>{badges.length} Medalje</Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.text_secondary}
        />
      </View>

      {/* Badges row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgesRow}
      >
        {badges.slice(0, 6).map((badge, index) => (
          <View key={index} style={styles.badgeItem}>
            <View style={styles.badgeIcon}>
              {/* Placeholder icon – replace with SVG/Image later */}
              <Ionicons
                name={badge.icon || 'medal-outline'}
                size={22}
                color={colors.textLight}
              />
            </View>
            <Text style={styles.badgeLabel} numberOfLines={1}>
              {badge.title}
            </Text>
          </View>
        ))}
      </ScrollView>
    </TouchableOpacity>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 16,
      marginTop: 12,
      padding: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },

    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    title: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text_primary,
    },

    badgesRow: {
      flexDirection: 'row',
      gap: 14,
      paddingRight: 8,
    },

    badgeItem: {
      width: 64,
      alignItems: 'center',
      gap: 6,
    },

    badgeIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOpacity: 0.25,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },

    badgeLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.text_secondary,
      textAlign: 'center',
    },
  });
