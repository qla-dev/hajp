import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { baseURL } from '../api';
import { vibeOptions } from '../data/vibes';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
const connectSoundAsset = require('../../assets/sounds/connect.mp3');

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1440&q=80';

export default function RoomCard({ room = {}, onPress, onJoin, joining }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const connectSoundRef = useRef(null);
  const normalizedCoverUrl = room.cover_url || room.cover;
  const coverUri = normalizedCoverUrl
    ? `${baseURL.replace(/\/$/, '')}${normalizedCoverUrl}`
    : FALLBACK_COVER;
  const memberCount = room.members_count ?? room.members ?? 0;
  const privacyLabel = room.is_private ? 'Privatna' : 'Javna';
  const typeLabel = room.type || 'Vibe';

  const vibeIcon = useMemo(() => {
    const match = vibeOptions.find((option) => option.key === room.type);
    return match?.icon || 'leaf-outline';
  }, [room.type]);

  const previewMembers = room.preview_members || [];
  const mutualMember = room.mutual_member;

  const getMemberDisplayName = (member) => {
    if (!member) return 'Član';
    const base = member.name || member.username || 'Član';
    return base.split(' ')[0] || base;
  };

  const memberLabel = useMemo(() => {
    const displayed = [];

    if (mutualMember?.name || mutualMember?.username) {
      const mutualName = getMemberDisplayName(mutualMember);
      const usernameSuffix = !mutualMember.name && mutualMember.username ? ` (@${mutualMember.username})` : '';
      displayed.push(`${mutualName}${usernameSuffix}`);
    }

    const firstOther = previewMembers.find(
      (member) => !mutualMember || member?.id !== mutualMember.id,
    );
    if (firstOther) {
      displayed.push(getMemberDisplayName(firstOther));
    }

    const tailCount = Math.max(memberCount - displayed.length, 0);

    if (displayed.length) {
      const names = displayed.join(', ');
      const tail = tailCount > 0 ? ` i još ${tailCount} članova` : '';
      return `${names}${tail}`;
    }

    return `${memberCount} članova`;
  }, [mutualMember, previewMembers, memberCount]);

  const resolveAvatar = (photo) => {
    if (!photo) return null;
    if (/^https?:\/\//i.test(photo)) return photo;
    const cleanBase = (baseURL || '').replace(/\/+$/, '');
    const cleanPath = photo.replace(/^\/+/, '');
    return `${cleanBase}/${cleanPath}`;
  };

  const renderAvatar = (member, index) => {
    const uri = resolveAvatar(member?.profile_photo);
    const rawLabel = member?.name || member?.username || 'Član';
    const label = rawLabel.split(' ')[0] || rawLabel;
    const initials = label
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');

    return uri ? (
      <Image
        key={`${member?.id || label}-${index}`}
        source={{ uri }}
        style={[styles.avatar, { zIndex: previewMembers.length - index }]}
      />
    ) : (
      <View
        key={`${member?.id || label}-${index}`}
        style={[styles.avatar, styles.avatarFallback, { zIndex: previewMembers.length - index }]}
      >
        <Text style={styles.avatarFallbackText}>{initials}</Text>
      </View>
    );
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(connectSoundAsset, { shouldPlay: false });
        if (mounted) {
          connectSoundRef.current = sound;
        } else {
          await sound.unloadAsync();
        }
      } catch {
        // ignore sound load errors
      }
    })();
    return () => {
      mounted = false;
      connectSoundRef.current?.unloadAsync();
      connectSoundRef.current = null;
    };
  }, []);

  const playConnectFeedback = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    connectSoundRef.current?.replayAsync().catch(() => {});
  }, []);

  const handleJoin = () => {
    playConnectFeedback();
    onJoin?.(room);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <ImageBackground source={{ uri: coverUri }} style={styles.cover} imageStyle={styles.coverImage}>
        <View style={styles.overlay} />
        <View style={styles.vibeBadge}>
          <Ionicons name={vibeIcon} size={28} color={colors.primary} />
        </View>
        <View style={styles.topRow}>
          <View style={[styles.privacyBadge, room.is_private ? styles.publicBadge : styles.publicBadge]}>
            <Ionicons name={room.is_private ? 'lock-closed' : 'lock-open'} size={14} color="#fff" />
            <Text style={styles.privacyText}>{privacyLabel}</Text>
          </View>
          <View style={styles.typeCluster}>
            <Text style={styles.typeText}>{typeLabel}</Text>
            {room.is_18_over ? <Text style={[styles.typeText, styles.adultText]}>18+</Text> : null}
          </View>
        </View>
      </ImageBackground>

      <View style={styles.infoBlock}>
        <View style={styles.infoHeader}>
          <View style={styles.infoHeaderSpacer} />
          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoin}
            disabled={!onJoin || joining}
            activeOpacity={0.85}
          >
            <View style={styles.joinContent}>
              {joining && <ActivityIndicator size="small" color={colors.primary} style={styles.joinSpinner} />}
              <Text style={styles.joinButtonText}>{joining ? 'Pridruživanje' : 'Pridruži se'}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>{room.name}</Text>
        {!!room.tagline && <Text style={styles.tagline}>{room.tagline}</Text>}
      </View>
      <View style={styles.bottomRow}>
        <View style={styles.memberRow}>
          <View style={styles.avatarStack}>
            {previewMembers.map((member, idx) => renderAvatar(member, idx))}
          </View>
          <Text style={styles.memberText}>{memberLabel}</Text>
        </View>
      </View>
      {!!room.description && (
        <Text style={styles.description} numberOfLines={3}>
          {room.description}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      width: '100%',
      marginBottom: 16,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: colors.transparent,
      borderWidth: 1,
      borderColor: colors.border,
  
      elevation: 5,
    },
    cover: {
      height: 90,
      justifyContent: 'space-between',
    },
    coverImage: {
      resizeMode: 'cover',
    },
    vibeBadge: {
      position: 'absolute',
      left: 12,
      bottom: -28,
      width: 64,
      height: 64,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 5,
      zIndex: 3,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    privacyBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      gap: 4,
      backgroundColor: colors.secondary,
    },
    privateBadge: {
      backgroundColor: colors.error,
    },
    publicBadge: {
      backgroundColor: colors.secondary,
    },
    privacyText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 12,
    },
    typeCluster: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    typeText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#fff',
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 12,
    },
    adultText: {
      backgroundColor: 'rgba(255, 0, 0, 0.9)',
      paddingRight: 7,
    },
    infoBlock: {
      paddingHorizontal: 16,
      paddingBottom: 0,
      paddingTop: 48,
      position: 'relative',
    },
    infoHeader: {
      position: 'absolute',
      top: 10,
      right: 10,
    },
    infoHeaderSpacer: {
      width: 0,
    },
    title: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.text_primary,
      marginBottom: 8,
    },
    tagline: {
      fontSize: 13,
      color: colors.text_secondary,
      letterSpacing: 0.3,
      lineHeight: 18,
      marginBottom: 8,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingBottom: 12,
    },
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    memberText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text_secondary,
    },
    joinButton: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.primary,
      paddingHorizontal: 14,
      height: 36,
      justifyContent: 'center',
      backgroundColor: colors.transparent,
    },
    joinContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      columnGap: 6,
    },
    joinSpinner: {
      marginRight: 4,
    },
    joinButtonText: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.primary,
    },
    description: {
      paddingHorizontal: 20,
      paddingBottom: 12,
      fontSize: 13,
      color: colors.text_secondary,
      lineHeight: 18,
    },
    avatarStack: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 8,
    },
    avatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.background,
      marginLeft: -8,
    },
    avatarFallback: {
      backgroundColor: colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarFallbackText: {
      color: colors.textLight,
      fontWeight: '800',
      fontSize: 12,
    },
  });
