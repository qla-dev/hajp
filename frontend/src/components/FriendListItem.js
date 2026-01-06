import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import Avatar from './Avatar';

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
  hideStatus = false,
  renderAction = null,
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const usernameLabel =
    username ||
    (friend.username ? `@${friend.username}` : null) ||
    friend.inviter_name ||
    friend.name;

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
    return (
      <Avatar
        user={friend}
        avatarConfig={friend.avatar_config || friend.avatarConfig || null}
        name={friend.name || friend.username || 'Korisnik'}
        variant="avatar-friendlist"
        zoomModal={false}
      />
    );
  };

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress}>
      {renderAvatar()}
      <View style={styles.info}>
        <Text style={styles.name}>
          {refType === 'room-invite'
            ? friend.room_name || friend.name || 'Soba'
            : refType === 'my-room-allowence' || refType === 'friendship'
            ? friend.name || 'Korisnik'
            : friend.name || friend.username || 'Korisnik'}
        </Text>
        {usernameLabel && (
          <Text style={styles.subtitleMuted}>
            {refType === 'room-invite' ? 'Poziv od ' : ''}
            {usernameLabel}
          </Text>
        )}
        {refType === 'room-invite' && friend.inviter_name ? (
          <Text style={styles.subtitle}>
            Poziva te {friend.inviter_name}
            {friend.room_name ? ` u sobu ${friend.room_name}` : ''}
          </Text>
        ) : refType === 'my-room-allowence' && friend.room_name ? (
          <Text style={styles.subtitle}>Želi da se pridruži {friend.room_name}</Text>
        ) : refType === 'friendship' ? (
          <Text style={styles.subtitle}>Želi da se povežete</Text>
        ) : null}
        {!!subtitle &&
          refType !== 'room-invite' &&
          refType !== 'my-room-allowence' &&
          refType !== 'friendship' && <Text style={styles.subtitle}>{subtitle}</Text>}
        {!!statusLabel && !hideStatus && <Text style={styles.meta}>{statusLabel}</Text>}
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
        renderAction ?? (
          <View style={styles.rowAction}>
            <Ionicons name="chevron-forward" size={20} color={colors.text_secondary} />
          </View>
        )
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
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.secondary,
    },
    roomAvatar: {
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 5,
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
      fontSize: 12,
      paddingTop: 7,
    },
    subtitleMuted: {
      color: colors.text_secondary,
      fontSize: 12,
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
