import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { baseURL } from '../api';

export default function ActivityItem({ activity }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const resolveAvatar = (photo) => {
    if (!photo) return null;
    if (/^https?:\/\//i.test(photo)) return photo;
    const cleanBase = (baseURL || '').replace(/\/+$/, '');
    const cleanPath = photo.replace(/^\/+/, '');
    return `${cleanBase}/${cleanPath}`;
  };

  return (
    <View style={styles.card}>
      <Image
        source={{
          uri:
            resolveAvatar(activity.user?.profile_photo) ||
            'https://ui-avatars.com/api/?name=' +
              encodeURIComponent(activity.user?.name || 'Korisnik') +
              '&size=80',
        }}
        style={styles.avatar}
      />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{activity.user?.name || activity.user?.username || 'Korisnik'}</Text>
          <Text style={styles.received}>received</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {activity?.question?.question || 'Aktivnost'}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="water" size={14} color="#0ea5e9" />
          <Text style={styles.metaText}>From a boy in 12th grade</Text>
        </View>
      </View>
      <Text style={styles.time}>{activity.created_at ? new Date(activity.created_at).toLocaleTimeString([], { minute: '2-digit' }) : ''}</Text>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 2,
      elevation: 2,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      marginRight: 12,
      backgroundColor: colors.secondary,
    },
    content: {
      flex: 1,
      gap: 4,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    name: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text_primary,
    },
    received: {
      fontSize: 14,
      color: colors.text_secondary,
    },
    message: {
      fontSize: 15,
      color: colors.text_primary,
      fontWeight: '600',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontSize: 13,
      color: colors.text_secondary,
    },
    time: {
      fontSize: 12,
      color: colors.text_secondary,
      marginLeft: 8,
    },
  });
