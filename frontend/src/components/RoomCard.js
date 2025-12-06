import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1440&q=80';

export default function RoomCard({ room = {}, onPress, onJoin, joining }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const coverUri = room.cover_url || room.cover || FALLBACK_COVER;
  const memberCount = room.members_count ?? room.members ?? 0;
  const privacyLabel = room.is_private ? 'Privatna' : 'Javna';
  const typeLabel = room.type || 'Vibe';

  const handleJoin = () => {
    onJoin?.(room);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <ImageBackground source={{ uri: coverUri }} style={styles.cover} imageStyle={styles.coverImage}>
        <View style={styles.overlay} />
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
        <View style={styles.infoBlock}>
          <Text style={styles.title}>{room.name}</Text>
          {!!room.tagline && <Text style={styles.tagline}>{room.tagline}</Text>}
        </View>
      </ImageBackground>
      <View style={styles.bottomRow}>
        <View style={styles.memberRow}>
          <Ionicons name="people-circle-outline" size={22} color={colors.secondary} />
          <Text style={styles.memberText}>{memberCount} članova</Text>
        </View>
        <TouchableOpacity style={styles.joinButton} onPress={handleJoin} disabled={!onJoin || joining}>
          {joining ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.memberText, { color: colors.primary }]}>Pridruži se</Text>
          )}
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
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 5,
    },
    cover: {
      height: 200,
      justifyContent: 'space-between',
    },
    coverImage: {
      resizeMode: 'cover',
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
      paddingBottom: 24,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: '#fff',
      marginBottom: 4,
    },
    tagline: {
      fontSize: 13,
      color: '#fff',
      letterSpacing: 0.3,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 14,
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
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: colors.background,
    },
    description: {
      paddingHorizontal: 20,
      paddingBottom: 16,
      fontSize: 13,
      color: colors.text_secondary,
      lineHeight: 18,
    },
  });
