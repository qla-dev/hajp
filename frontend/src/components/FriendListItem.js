import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';

export default function FriendListItem({
  friend,
  subtitle,
  username,
  statusLabel,
  isRequestList,
  isInviteMode,
  isMember,
  approving,
  inviting,
  onPress,
  onApprove,
  onInvite,
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const renderAvatar = () => {
    if (friend.profile_photo) {
      return <Image source={{ uri: friend.profile_photo }} style={styles.avatar} />;
    }

    const label = friend.name || friend.username || 'Korisnik';
    const initials = label
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');

    return (
      <View style={[styles.avatar, styles.avatarFallback]}>
        <Text style={styles.avatarFallbackText}>{initials}</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress}>
      {renderAvatar()}
      <View style={styles.info}>
        <Text style={styles.name}>{friend.name || friend.username || 'Korisnik'}</Text>
        {username ? <Text style={styles.subtitle}>{username}</Text> : null}
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {!!statusLabel && <Text style={styles.meta}>{statusLabel}</Text>}
      </View>
      {isInviteMode ? (
        isMember ? (
          <View style={styles.inRoomBadge}>
            <Text style={styles.inRoomText}>U sobi</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.acceptButton, styles.inviteButton]}
            onPress={onInvite}
            disabled={inviting}
          >
            {inviting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.acceptButtonText}>Pozovi</Text>
            )}
          </TouchableOpacity>
        )
      ) : isRequestList ? (
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={onApprove}
          disabled={approving}
        >
          {approving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.acceptButtonText}>Prihvati</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.rowAction}>
          <Ionicons name="chevron-forward" size={20} color={colors.text_secondary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      gap: 12,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.secondary,
    },
    avatarFallback: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarFallbackText: {
      color: colors.textLight,
      fontWeight: '800',
      fontSize: 18,
    },
    info: {
      flex: 1,
      gap: 2,
    },
    name: {
      fontWeight: '800',
      color: colors.text_primary,
    },
    subtitle: {
      color: colors.text_secondary,
    },
    meta: {
      color: colors.text_secondary,
      fontSize: 12,
    },
    acceptButton: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    inviteButton: {
      backgroundColor: colors.transparent,
    },
    acceptButtonText: {
      color: colors.primary,
      fontWeight: '700',
    },
    rowAction: {
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    inRoomBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    inRoomText: {
      color: colors.text_secondary,
      fontWeight: '700',
      fontSize: 12,
    },
  });
