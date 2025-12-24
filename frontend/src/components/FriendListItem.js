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
  refType,
  subtitle,
  username,
  statusLabel,
  isRequestList,
  isInviteMode,
  isMember,
  accepted,
  approving,
  inviting,
  onPress,
  onApprove,
  onInvite,
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const renderAvatar = () => {
    if (
      isRequestList &&
      (refType === 'room-invite' || refType === 'my-room-allowence') &&
      friend.room_icon
    ) {
      return (
        <View style={[styles.avatar, styles.roomAvatar]}>
          <Ionicons name={friend.room_icon || 'home-outline'} size={22} color={colors.primary} />
        </View>
      );
    }

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
        <Text style={styles.name}>
          {refType === 'room-invite'
            ? friend.room_name || friend.name || 'Soba'
            : refType === 'my-room-allowence'
            ? friend.name || 'Korisnik'
            : friend.name || friend.username || 'Korisnik'}
        </Text>
        {refType === 'room-invite' && friend.inviter_name ? (
          <Text style={styles.subtitle}>Pozvao te je {friend.inviter_name}</Text>
        ) : refType === 'my-room-allowence' && friend.room_name ? (
          <Text style={styles.subtitle}>Želi da se pridruži {friend.room_name}</Text>
        ) : username ? (
          <Text style={styles.subtitle}>{username}</Text>
        ) : null}
        {!!subtitle && refType !== 'room-invite' && refType !== 'my-room-allowence' && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
        {!!statusLabel && <Text style={styles.meta}>{statusLabel}</Text>}
      </View>
      {isInviteMode ? (
        isMember ? (
          <View style={[styles.inRoomBadge, styles.chip]}>
            <Text style={styles.chipText}>{accepted === 0 || friend.approved === 0 ? 'Na čekanju' : 'U sobi'}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.acceptButton, styles.inviteButton, styles.chip]}
            onPress={onInvite}
            disabled={inviting}
          >
            {inviting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.chipTextPozovi}>Pozovi</Text>
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
    roomAvatar: {
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.primary,
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
      borderWidth: 1,
      borderColor: colors.primary,
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
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 18,
      minWidth: 96,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipText: {
      color: colors.text_secondary,
      fontWeight: '700',
      fontSize: 14,
    },
     chipTextPozovi: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: 14,
    },
  });
