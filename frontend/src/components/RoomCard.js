import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { baseURL } from '../api';
import { vibeOptions } from '../data/vibes';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1440&q=80';

export default function RoomCard({ room = {}, onPress, onJoin, joining }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
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

  const handleJoin = () => {
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
        <Text style={styles.title}>{room.name}</Text>
        {!!room.tagline && <Text style={styles.tagline}>{room.tagline}</Text>}
      </View>
      <View style={styles.bottomRow}>
        <View style={styles.memberRow}>
          <Ionicons name="people-circle-outline" size={22} color={colors.secondary} />
          <Text style={styles.memberText}>{memberCount} članova</Text>
        </View>
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
      height: 100,
      justifyContent: 'space-between',
    },
    coverImage: {
      resizeMode: 'cover',
    },
    vibeBadge: {
      position: 'absolute',
      left: 16,
      bottom: -36,
      width: 72,
      height: 72,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.14,
      shadowRadius: 10,
      elevation: 6,
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
      paddingTop: 44,
    },
    title: {
      fontSize: 22,
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
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingBottom: 12,
    },
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
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
  });
