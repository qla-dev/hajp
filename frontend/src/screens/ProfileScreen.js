import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, RefreshControl, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { getCurrentUser, fetchMyVotes, fetchUserRooms, baseURL } from '../api';
import BottomCTA from '../components/BottomCTA';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [hypeCount, setHypeCount] = useState(0);
  const [recentHypes, setRecentHypes] = useState([]);
  const [roomSummary, setRoomSummary] = useState({ total: 0, rooms: [] });
  const [refreshing, setRefreshing] = useState(false);
  const glowAnim = useRef(new Animated.Value(0)).current;

  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const loadData = useCallback(async () => {
    const current = await getCurrentUser();
    setUser(current);
    try {
      const { data } = await fetchMyVotes();
      setHypeCount(data?.length || 0);
      setRecentHypes((data || []).slice(0, 3));
    } catch {
      setHypeCount(0);
      setRecentHypes([]);
    }
    try {
      const { data } = await fetchUserRooms();
      setRoomSummary({ total: data?.total || 0, rooms: data?.rooms || [] });
    } catch {
      setRoomSummary({ total: 0, rooms: [] });
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const username = user?.name ? user.name.toLowerCase().replace(' ', '') : 'gost';
  const displayedRooms = (roomSummary.rooms || []).slice(0, 3);
  const remainingRooms = Math.max((roomSummary.total || 0) - displayedRooms.length, 0);
  const roomLine =
    displayedRooms.length > 0
      ? `Član ${displayedRooms.join(', ')}${remainingRooms > 0 ? ` i još ${remainingRooms} soba` : ''}`
      : 'Nisi član nijedne sobe';
  const coinBalance = user?.coins ?? 58;
  const avatarTextColor = encodeURIComponent(colors.textLight.replace('#', ''));
  const glowScale = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.25] });
  const glowBaseTransform = [{ translateX: -5 }, { translateY: 5 }];

  useEffect(() => {
    const title = user?.username
      ? `@${user.username}`
      : user?.name
      ? `@${user.name.replace(/\s+/g, '').toLowerCase()}`
      : 'Profil';
    navigation.setOptions?.({ title });
  }, [navigation, user]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ]),
    ).start();
  }, [glowAnim]);

  const resolveAvatar = (photo) => {
    if (!photo) return null;
    if (/^https?:\/\//i.test(photo)) return photo;
    const cleanBase = (baseURL || '').replace(/\/+$/, '');
    const cleanPath = photo.replace(/^\/+/, '');
    return `${cleanBase}/${cleanPath}`;
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        contentInsetAdjustmentBehavior="always"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
          <View style={styles.coinRow}>
          <TouchableOpacity style={styles.coinCard} onPress={() => navigation.navigate('Subscription')}>
            <View style={styles.coinStack}>
              <Animated.View
                style={[
                  styles.coinGlow,
                  styles.coinGlowLarge,
                  { transform: [...glowBaseTransform, { scale: glowScale }], opacity: glowOpacity },
                ]}
              />
              <View style={[styles.coin, styles.coinBack]} />
              <View style={[styles.coin, styles.coinMid]} />
              <View style={[styles.coin, styles.coinFront]}>
                <Text style={styles.coinSymbol}>Hajp</Text>
              </View>
              <Animated.View
                style={[
                  styles.coinGlow,
                  { transform: [...glowBaseTransform, { scale: glowScale }], opacity: glowOpacity },
                ]}
              />
              <View style={[styles.sparkle, styles.sparkleOne]} />
              <View style={[styles.sparkle, styles.sparkleTwo]} />
            </View>
            <View style={styles.coinTextBlock}>
              <Text style={styles.coinLabel}>HAJP COIN</Text>
              <Text style={styles.coinAmount}>{coinBalance}</Text>
              <Text style={styles.coinSub}>Tapni za shop</Text>
            </View>
            <View style={styles.coinPill}>
              <Text style={styles.coinPillText}>Shop</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.profileSection}>
          <View style={styles.profileRow}>
            <Image
              source={{
                uri:
                  resolveAvatar(user?.profile_photo, user?.name) ||
                  'https://ui-avatars.com/api/?name=' +
                    (user?.name || 'Korisnik') +
                    '&size=200&background=' +
                    encodeURIComponent(colors.profilePurple.replace('#', '')) +
                    '&color=' +
                    avatarTextColor,
              }}
              style={styles.profileImage}
            />

            <View style={styles.statsColumn}>
              <Text style={styles.userName}>{user?.name || 'Gost'}</Text>
              <View style={styles.statsRow}>
                <TouchableOpacity
                  style={styles.statItemRow}
                  onPress={() => navigation.navigate('ProfileFriends')}
                >
                  <Text style={styles.statNumber}>176</Text>
                  <Text style={styles.statLabel}>prijatelja</Text>
                </TouchableOpacity>
                <View style={styles.statItemRow}>
                  <Text style={styles.statNumber}>{hypeCount}</Text>
                  <Text style={styles.statLabel}>hajpova</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      

        <View style={styles.userDetails}>
          <View style={styles.roomRow}>
            <View style={styles.roomAvatars}>
              {[0, 1, 2].map((idx) => {
                const name = displayedRooms[idx];
                const label = name ? name.trim().charAt(0).toUpperCase() : '?';
                const isVisible = Boolean(name);
                return (
                  <View
                    key={idx}
                    style={[
                      styles.roomAvatar,
                      { marginLeft: idx === 0 ? 0 : -12, opacity: isVisible ? 1 : 0.4 },
                    ]}
                  >
                    <Text style={styles.roomAvatarText}>{label}</Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.roomSummaryText}>{roomLine}</Text>
          </View>
        </View>

        <View style={styles.section2}>
          <View style={styles.rowSpread}>
            <TouchableOpacity style={styles.shareButton} onPress={() => navigation.navigate('EditProfile', { user })}>
              <Text style={styles.shareButtonText}>Uredi profil</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton} onPress={() => navigation.navigate('Share')}>
              <Text style={styles.shareButtonText}>Podijeli profil</Text>
            </TouchableOpacity>
          </View>
        </View>

   

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top hajpovi</Text>
          {recentHypes.length === 0 ? (
            <Text style={styles.emptyHype}>Još nema hajpova</Text>
          ) : (
            recentHypes.map((item, idx) => (
              <View key={item.id || idx} style={styles.flameItem}>
                <Text style={styles.flameNumber}>{idx + 1}</Text>
                <Text style={styles.flameEmoji}>🔥</Text>
                <Text style={styles.flameText} numberOfLines={1}>
                  {item?.question?.question || 'Hajp'}
                </Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>

      <BottomCTA label="Nadogradi na Premium" iconName="diamond-outline" onPress={() => navigation.navigate('Subscription')} fixed />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      paddingBottom: 90,
    },
    profileSection: {
      paddingVertical: 20,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
      paddingHorizontal: 20,
    },
    profileImage: {
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: colors.surface,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statsColumn: {
      flex: 1,
      gap: 12,
    },
    statItemRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 6,
    },
    statNumber: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text_primary,
    },
    statLabel: {
      fontSize: 13,
      color: colors.text_secondary,
    },
    coinCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.primary,
      shadowOpacity: 0.2,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
    coinStack: {
      width: 64,
      height: 64,
      justifyContent: 'center',
      alignItems: 'center',
      transform: [{ translateX: 5 }, { translateY: -5 }],
    },
    coin: {
      position: 'absolute',
      width: 52,
      height: 52,
      borderRadius: 26,
      borderWidth: 2,
      borderColor: colors.primaryDark,
      justifyContent: 'center',
      alignItems: 'center',
      transform: [{ translateX: -2 }, { translateY: 3 }],
    },
    coinBack: {
      backgroundColor: colors.accent,
      transform: [{ translateX: -10 }, { translateY: 10 }],
      opacity: 0,
    },
    coinMid: {
      backgroundColor: colors.accent,
      transform: [{ translateX: -6 }, { translateY: 6 }],
      opacity: 0.8,
    },
    coinFront: {
      backgroundColor: colors.primary,
      zIndex: 2,
    },
    coinSymbol: {
      color: colors.textLight,
      fontSize: 15,
      fontWeight: '800',
    },
    coinGlow: {
      position: 'absolute',
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: colors.primary,
      opacity: 0.15,
      zIndex: 0,
    },
    coinGlowLarge: {
      width: 80,
      height: 80,
      borderRadius: 45,
      opacity: 0.1,
    },
    sparkle: {
      position: 'absolute',
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.textLight,
      opacity: 0.7,
    },
    sparkleOne: {
      top: 10,
      right: 10,
      zIndex: 2,
      opacity: 0.3,
    },
    sparkleTwo: {
      bottom: 12,
      left: 4,
    },
    coinTextBlock: {
      flex: 1,
      gap: 2,
    },
    coinLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text_secondary,
      letterSpacing: 1,
    },
    coinAmount: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text_primary,
    },
    coinSub: {
      fontSize: 12,
      color: colors.text_secondary,
    },
    coinPill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.primary,
      borderRadius: 14,
    },
    coinPillText: {
      color: colors.textLight,
      fontWeight: '800',
      fontSize: 13,
      letterSpacing: 0.5,
    },
    shareButton: {
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 18,
      flex: 1,
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    shareButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text_primary,
    },
    coinRow: {
      paddingHorizontal: 20,
      paddingVertical: 18,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderTopWidth: 0,
      borderColor: colors.border,
    },
    userDetails: {
      paddingHorizontal: 24,
      paddingVertical: 20,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    userName: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text_primary,
      textAlign: 'left',
    },
    userHandle: {
      fontSize: 15,
      color: colors.text_secondary,
      marginTop: 4,
      textAlign: 'left',
    },
    userInfo: {
      flexDirection: 'row',
      marginTop: 0,
      gap: 12,
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    userInfoItem: {
      fontSize: 13,
      color: colors.text_secondary,
    },
    roomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    roomAvatars: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 12,
    },
    roomAvatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.background,
    },
    roomAvatarText: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.textLight,
    },
    roomSummaryText: {
      flex: 1,
      fontSize: 14,
      color: colors.text_primary,
      fontWeight: '600',
    },
    section: {
      padding: 16,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.transparent,
    },
    section2: {
      padding: 16,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowSpread: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text_primary,
      marginBottom: 12,
    },
    flameItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      gap: 12,
    },
    flameNumber: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
    },
    flameEmoji: {
      fontSize: 22,
    },
    flameText: {
      flex: 1,
      fontSize: 15,
      color: colors.text_primary,
      fontWeight: '600',
    },
    emptyHype: {
      fontSize: 14,
      color: colors.text_secondary,
    },
  });
