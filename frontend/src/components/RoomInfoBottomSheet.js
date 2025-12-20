import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Share, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { baseURL } from '../api';

const RoomInfoBottomSheet = React.forwardRef(({ room, onClose, modalHeight = 700 }, ref) => {
  const [copied, setCopied] = useState(false);
  const { colors } = useTheme();
  const styles = useThemedStyles((c, isDark) => createStyles(c, isDark));
  const snapPoint = Math.min(modalHeight, 700);

  const invitationCode = useMemo(() => {
    if (room?.code) {
      return room.code.toUpperCase();
    }
    if (!room) return '';
    const seed = `${room.name ?? 'HAJ'}-${room.id ?? '000'}`;
    const cleaned = seed
      .replace(/[^A-Z0-9]/gi, '')
      .toUpperCase()
      .slice(0, 6);
    const suffix = (room.id ?? 0).toString().padStart(3, '0');
    return `${cleaned || 'HAJ'}-${suffix}`;
  }, [room]);

  const vibeStats = useMemo(() => {
    if (!room) return [];
    const baseMembers = room?.members_count ?? room?.members ?? 0;
    const taglineLength = room?.tagline?.length ?? 0;
    const secretSeed = (room?.id ?? 0) % 10;
    return [
      {
        label: 'Energija',
        value: Math.min(100, 32 + baseMembers * 4),
        color: '#f97316',
      },
      {
        label: 'Društvo',
        value: Math.max(20, Math.min(100, 40 + taglineLength * 2)),
        color: '#a855f7',
      },
      {
        label: 'Trend',
        value: Math.min(100, 45 + secretSeed * 5),
        color: '#22d3ee',
      },
    ];
  }, [room]);

  useEffect(() => {
    if (room) {
      setCopied(false);
    }
  }, [room]);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopyCode = async () => {
    if (!invitationCode) return;
    Haptics.selectionAsync().catch(() => {});
    await Clipboard.setStringAsync(invitationCode);
    setCopied(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert('Kod kopiran!', `Pozivni kod sobe ${room?.name || 'Hajp'} je ${invitationCode}`, [
      { text: 'U redu' },
    ]);
  };

  const invitationLink = `${baseURL}/room/invite-code/${invitationCode}`;

  const handleShareCode = async () => {
    if (!invitationCode) return;
    Haptics.selectionAsync().catch(() => {});
    try {
      await Share.share({
        message: `Pozivni kod sobe ${room?.name || 'Hajp'}: ${invitationCode}\nOtvori ${invitationLink}`,
        url: invitationLink,
        title: `${room?.name || 'Hajp'} | Pozivni kod`,
      });
    } catch (error) {
      console.error('Share failed', error);
    }
  };

  const memberCount = room ? room.members ?? room.members_count ?? 0 : 0;

  return (
    <Modalize
      ref={ref}
      snapPoint={600}
      modalHeight={600}
      handleStyle={styles.handle}
      modalStyle={styles.modal}
      overlayStyle={styles.overlay}
      panGestureEnabled
      onClosed={onClose}
      adjustToContentHeight={false}
    >
      {room ? (
        
        <View style={styles.content}>
                    <View style={styles.invitationSection}>
            <View>
              <Text style={styles.sectionTitle}>Pozivni kod</Text>
              <Text style={styles.invitationCode}>{invitationCode}</Text>
            </View>
            <View style={styles.copyActions}>
              <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
                <Ionicons name="copy-outline" size={20} color={colors.text_primary} />
                <Text style={styles.copyLabel}>{copied ? 'Kopirano' : 'Kopiraj'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.copyButton, styles.shareButton]} onPress={handleShareCode}>
                <Ionicons name="share-social-outline" size={20} color={colors.text_primary} />
                <Text style={styles.copyLabel}>Podijeli</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.banner, { shadowColor: colors.primary }]}>
            <Text style={styles.roomName}>{room.name}</Text>
            {!!room.tagline && <Text style={styles.tagline}>{room.tagline}</Text>}
            <View style={styles.badgeRow}>
              <View style={styles.statusBadge}>
                <Text style={styles.badgeText}>{room.is_private ? 'Privatna soba' : 'Javna soba'}</Text>
              </View>
              <View style={styles.memberBadge}>
                <Text style={styles.badgeText}>{memberCount} članova</Text>
              </View>
            </View>
          </View>

          <View style={styles.vibeSection}>
            <Text style={styles.sectionTitle}>Vibe vizualizacija</Text>
            <Text style={styles.sectionSubtitle}>Kako se soba osjeća trenutno</Text>
            {vibeStats.map((stat) => (
              <View key={stat.label} style={styles.statRow}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{`${Math.round(stat.value)}%`}</Text>
                </View>
                <View style={styles.statTrack}>
                  <View
                    style={[
                      styles.statFill,
                      { width: `${stat.value}%`, backgroundColor: stat.color },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>



          <View style={styles.gradientBar}>
            <Text style={styles.gradientLabel}>Uslovi</Text>
            <Text style={styles.gradientDesc}>
              Zrači neon hešića, vibra i minimalno drame. Samo uživaj.
            </Text>
          </View>
        </View>
      ) : null}
    </Modalize>
  );
});

export default RoomInfoBottomSheet;

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    modal: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      backgroundColor: colors.surface,
      paddingBottom: 32,
    },
    overlay: {
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    handle: {
      backgroundColor: colors.text_secondary,
      width: 70,
    },
    content: {
      paddingHorizontal: 18,
      paddingTop: 24,
      gap: 20,
    },
    banner: {
      backgroundColor: colors.primary,
      padding: 20,
      paddingTop: 12,
      borderRadius: 22,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      elevation: 12,
      shadowRadius: 10,
    },
    bannerLabel: {
      color: colors.text_secondary,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    roomName: {
      color: colors.textLight,
      fontSize: 24,
      fontWeight: '700',
      marginTop: 4,
    },
    tagline: {
      color: colors.textLight,
      marginTop: 4,
      fontSize: 14,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      gap: 8,
    },
    statusBadge: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 12,
      paddingVertical: 4,
      paddingHorizontal: 10,
    },
    memberBadge: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 12,
      paddingVertical: 4,
      paddingHorizontal: 10,
    },
    badgeText: {
      color: colors.textLight,
      fontSize: 12,
      fontWeight: '600',
    },
    vibeSection: {
      backgroundColor: isDark ? '#0f0f0f' : '#f6f5ff',
      padding: 18,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.1)',
      gap: 14,
    },
    sectionTitle: {
      color: colors.text_primary,
      fontSize: 16,
      fontWeight: '700',
    },
    sectionSubtitle: {
      color: colors.text_secondary,
      fontSize: 12,
    },
    statRow: {
      gap: 6,
    },
    statHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statLabel: {
      color: colors.text_secondary,
      fontWeight: '600',
    },
    statValue: {
      color: colors.text_primary,
      fontWeight: '700',
    },
    statTrack: {
      height: 6,
      borderRadius: 6,
      backgroundColor: 'rgba(255,255,255,0.2)',
      overflow: 'hidden',
    },
    statFill: {
      height: '100%',
    },
    invitationSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    invitationCode: {
      color: colors.text_primary,
      fontSize: 20,
      fontWeight: '700',
      letterSpacing: 1.5,
      marginTop: 4,
    },
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: 12,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.text_secondary,
      backgroundColor: colors.surface,
    },
    shareButton: {
      backgroundColor: isDark ? colors.surface : colors.surface,
    },
    copyActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    copyLabel: {
      color: colors.text_secondary,
      fontWeight: '600',
    },
    gradientBar: {
      backgroundColor: '#0f0f0f',
      borderRadius: 16,
      padding: 16,
    },
    gradientLabel: {
      color: '#ffd966',
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: 0.8,
    },
    gradientDesc: {
      color: '#fef3c7',
      fontSize: 14,
      marginTop: 6,
    },
  });
