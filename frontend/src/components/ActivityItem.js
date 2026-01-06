import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import Avatar from './Avatar';
import * as Haptics from 'expo-haptics';

export default function ActivityItem({ activity, isLast, navigation }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const selectedTarget = activity.selected_user || activity.selectedUser;
  const isCasterAction = activity.action === 'ishajpao';
  const relevantUser = isCasterAction ? activity.user : selectedTarget || activity.user;
  const actionLabel = formatActionLabel(activity.action);

  const otherUserSex = isCasterAction
    ? selectedTarget?.sex || activity.selected_user_sex || activity.selectedUser?.sex
    : activity.user?.sex;
  const genderColor = otherUserSex === 'girl' ? '#f472b6' : '#60a5fa';

  const handlePress = () => {
    const targetId = relevantUser?.id;
    if (!targetId) return;
    Haptics.selectionAsync().catch(() => {});
    navigation?.navigate('LiveFriendProfile', {
      isMine: false,
      userId: targetId,
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={[styles.card, isLast && styles.cardLast]}>
      <Avatar
        user={relevantUser}
        avatarConfig={relevantUser?.avatar_config || relevantUser?.avatarConfig || null}
        name={relevantUser?.name || relevantUser?.username || 'Korisnik'}
        variant="friendlist"
        zoomModal={false}
        style={styles.avatar}
      />
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
    </TouchableOpacity>
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
      marginRight: 12,
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
