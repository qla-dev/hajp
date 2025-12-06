import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { baseURL } from '../api';

export default function ActivityItem({ activity, isLast }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const resolveAvatar = (photo) => {
    if (!photo) return null;
    if (/^https?:\/\//i.test(photo)) return photo;
    const cleanBase = (baseURL || '').replace(/\/+$/, '');
    const cleanPath = photo.replace(/^\/+/, '');
    return `${cleanBase}/${cleanPath}`;
  };

  const selectedTarget = activity.selected_user;
  const isCasterAction = activity.action === 'ishajpao';
  const relevantUser = isCasterAction ? activity.user : selectedTarget || activity.user;
  const initials = (relevantUser?.name || relevantUser?.username || 'Korisnik')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
  const avatarUri = resolveAvatar(relevantUser?.profile_photo);
  const actionLabel = formatActionLabel(activity.action);

  const genderColor = relevantUser?.sex === 'boy' ? '#60a5fa' : '#f472b6';

  return (
    <View style={[styles.card, isLast && styles.cardLast]}>
      {avatarUri ? (
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarFallbackText}>{initials}</Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{relevantUser?.name || relevantUser?.username || 'Korisnik'}</Text>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {activity?.question?.question || 'Aktivnost'}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{activity.action === 'ishajpan' ? 'Od' : 'Za'}</Text>
          <Ionicons name="flame" size={14} color={genderColor} />
          <Text style={styles.metaText}>
            {`u grupi ${activity?.question?.poll?.room?.name || 'nepoznata grupa'}`}
          </Text>
        </View>
      </View>
      <Text style={styles.time}>
        {activity.created_at ? formatTimeLabel(activity.created_at) : ''}
      </Text>
    </View>
  );
}

const formatActionLabel = (action) => {
  if (!action) return 'Aktivnost';
  return action.charAt(0).toUpperCase() + action.slice(1);
};

const formatTimeLabel = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  if (diffDays >= 1 && diffDays <= 6) {
    return `${diffDays}d`;
  }

  return date.toLocaleDateString('bs-BA', { day: '2-digit', month: 'short' });
};

const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingVertical: 14,
      paddingHorizontal: 0,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    cardLast: {
      borderBottomWidth: 0,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
      backgroundColor: colors.secondary,
    },
    avatarFallback: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
      backgroundColor: colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarFallbackText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
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
    actionLabel: {
      fontSize: 14,
      color: colors.text_secondary,
      textTransform: 'capitalize',
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
      minWidth: 48,
      textAlign: 'right',
    },
  });
