import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';

export default function RoomCard({ room, onPress }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: room.cover }} style={styles.cover} />
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Ionicons name="people" size={14} color={colors.textLight} />
          <Text style={styles.badgeText}>{room.members} članova</Text>
        </View>
        <View style={[styles.badge, room.is_18_over ? styles.adultBadge : styles.generalBadge]}>
          <Text style={styles.badgeText}>{room.is_18_over ? '18+' : '+13'}</Text>
        </View>
      </View>
      <Text style={styles.title}>{room.name}</Text>
      <Text style={styles.subtitle}>{room.description}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      width: '100%',
      backgroundColor: colors.transparent,
      borderRadius: 18,
      marginBottom: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    cover: {
      width: '100%',
      height: 160,
    },
    badgeRow: {
      position: 'absolute',
      top: 8,
      left: 8,
      right: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 12,
    },
    adultBadge: {
      backgroundColor: 'rgba(255,107,53,0.9)',
    },
    generalBadge: {
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    badgeText: {
      color: colors.textLight,
      fontSize: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text_primary,
      marginTop: 12,
      marginHorizontal: 16,
    },
    subtitle: {
      fontSize: 13,
      color: colors.text_secondary,
      marginHorizontal: 16,
      marginBottom: 16,
      marginTop: 4,
    },
  });
