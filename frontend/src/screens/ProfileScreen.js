import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  ActivityIndicator,
  PanResponder,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SvgUri } from 'react-native-svg';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { getCurrentUser, fetchMyVotes, fetchUserRooms, baseURL, fetchFriends, fetchUserProfile, fetchUserRoomsFor, fetchUserFriendsCount, fetchFriendshipStatus, addFriend, recordProfileView } from '../api';
import { useMenuRefresh } from '../context/menuRefreshContext';
import BottomCTA from '../components/BottomCTA';
import SuggestionSlider from '../components/SuggestionSlider';

export default function ProfileScreen({ navigation, route }) {
  const NAV_ICON_BASE_URI = `${baseURL}/img/nav-icons`;
  const CONNECT_ICON_URI = `${NAV_ICON_BASE_URI}/user-add.svg`;
  const [user, setUser] = useState(null);
  const [hypeCount, setHypeCount] = useState(0);
  const [recentHypes, setRecentHypes] = useState([]);
  const [roomSummary, setRoomSummary] = useState({ total: 0, rooms: [] });
  const [friendsCount, setFriendsCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const isRefreshingRef = useRef(false);
  const [keepTopPadding, setKeepTopPadding] = useState(false);
  const setKeepTopPaddingWithLogging = useCallback((value) => {
    setKeepTopPadding(value);
  }, []);
  const [friendStatus, setFriendStatus] = useState({ exists: false, approved: null });
  const [friendStatusLoading, setFriendStatusLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const glowAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        return dx > 10 && Math.abs(dx) > Math.abs(dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;
        if (dx > 120 || vx > 0.35) {
          navigation.canGoBack() && navigation.goBack();
        }
      },
    }),
  ).current;

  const scrollViewRef = useRef(null);

  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const loadVotes = useCallback(async (selectedUserId) => {
    try {
      const { data } = await fetchMyVotes(selectedUserId);
      setHypeCount(data?.length || 0);
      setRecentHypes((data || []).slice(0, 10));
    } catch {
      setHypeCount(0);
      setRecentHypes([]);
    }
  }, []);

  const loadData = useCallback(async () => {
    const current = await getCurrentUser();
    setUser(current);
    await loadVotes();
    try {
      const { data } = await fetchUserRooms();
      setRoomSummary({ total: data?.total || 0, rooms: data?.rooms || [] });
    } catch {
      setRoomSummary({ total: 0, rooms: [] });
    }
    try {
      const { data } = await fetchFriends();
      setFriendsCount((data?.data || data || []).length);
    } catch {
      setFriendsCount(0);
    }
  }, [loadVotes]);

  const loadOtherProfile = useCallback(
    async (userId) => {
      if (!userId) return;
      setFriendStatusLoading(true);
      try {
        const [{ data: userRes }, { data: roomsRes }, { data: friendsRes }, { data: statusRes }] = await Promise.all([
          fetchUserProfile(userId),
          fetchUserRoomsFor(userId),
          fetchUserFriendsCount(userId),
          fetchFriendshipStatus(userId),
        ]);
        setUser(userRes?.data || userRes || null);
        setRoomSummary({ total: roomsRes?.total || 0, rooms: roomsRes?.rooms || [] });
        setFriendsCount(friendsRes?.count ?? 0);
        setFriendStatus({
          exists: !!statusRes?.exists,
          approved: typeof statusRes?.approved === 'number' ? statusRes.approved : null,
        });
        await loadVotes(userId);
      } catch {
        setRoomSummary({ total: 0, rooms: [] });
        setFriendsCount(0);
        setFriendStatus({ exists: false, approved: null });
        setHypeCount(0);
        setRecentHypes([]);
      } finally {
        setFriendStatusLoading(false);
      }
    },
    [loadVotes],
  );

  useEffect(() => {
    if (isOtherProfile && route?.params?.userId) {
      loadOtherProfile(route.params.userId);
    } else {
      loadData();
    }
  }, [isOtherProfile, route?.params?.userId, loadData, loadOtherProfile]);

  useFocusEffect(
    useCallback(() => {
      if (isOtherProfile && route?.params?.userId) {
        loadOtherProfile(route.params.userId);
      } else {
        loadData();
      }
    }, [isOtherProfile, route?.params?.userId, loadData, loadOtherProfile]),
  );

  const onRefresh = useCallback(async () => {
    if (isRefreshingRef.current) {
      console.log('[Profile] onRefresh already running, skipping duplicate');
      return;
    }
    
    console.log('[Profile] pull to refresh triggered');
    isRefreshingRef.current = true;
    setRefreshing(true);
    
    try {
      const viewingOther = route?.params?.isMine === false;
      if (viewingOther && route?.params?.userId) {
        await loadOtherProfile(route.params.userId);
      } else {
        await loadData();
      }
    } finally {
      isRefreshingRef.current = false;
      setRefreshing(false);
    }
  }, [loadData, loadOtherProfile, route?.params?.isMine, route?.params?.userId]);

  const isOtherProfile = route?.params?.isMine === false;
  const isMine = !isOtherProfile;

  useEffect(() => {
    if (isOtherProfile && route?.params?.userId) {
      recordProfileView(route.params.userId).catch(() => {});
    }
  }, [isOtherProfile, route?.params?.userId]);
  const hasActiveFriendship = friendStatus.exists && friendStatus.approved === 1;
  const isPrivateProfile = Boolean(user?.is_private);
  const showPrivateNotice = isOtherProfile && isPrivateProfile && !hasActiveFriendship;

  const username = user?.name ? user.name.toLowerCase().replace(' ', '') : 'gost';
  const normalizedRooms = (roomSummary.rooms || [])
    .map((room) => {
      if (typeof room === 'string') return room;
      if (room?.name) return room.name;
      return '';
    })
    .filter(Boolean);
  const displayedRooms = normalizedRooms.slice(0, 3);
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
  const isFriendActionLoading = connecting || friendStatusLoading;
  const isConnected = friendStatus.exists && friendStatus.approved === 1;
  const showConnectedStyle = isConnected && !isFriendActionLoading;
  const connectLabel = friendStatus.exists
    ? friendStatus.approved === 1
      ? 'Povezani ste'
      : 'Zahtjev poslan'
    : 'Poveži se';
  const isConnectCta = !friendStatus.exists && !isFriendActionLoading;
  const connectButtonStyle = [
    styles.shareButton,
    !isConnected && styles.connectButton,
    isConnectCta && styles.connectButtonPrimary,
  ].filter(Boolean);
  const connectTextStyles = [
    styles.shareButtonText,
    showConnectedStyle ? { color: colors.success } : styles.connectButtonText,
    isConnectCta && styles.connectButtonPrimaryText,
  ].filter(Boolean);
  const connectIconColor = isConnectCta ? colors.textLight : showConnectedStyle ? colors.success : colors.primary;
  const connectSpinnerColor = isConnectCta ? colors.textLight : colors.primary;

  const handleConnectPress = async () => {
    if (!isOtherProfile || !route?.params?.userId || isFriendActionLoading) return;
    if (hasActiveFriendship) return;

    setConnecting(true);
    try {
      const { data } = await addFriend(route.params.userId);
      const approved = typeof data?.approved === 'number' ? data.approved : friendStatus.approved ?? 1;
      setFriendStatus({ exists: true, approved });
    } catch {
      // ignore error, keep previous state
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    const title = user?.username
      ? `@${user.username}`
      : user?.name
      ? `@${user.name.replace(/\s+/g, '').toLowerCase()}`
      : 'Profil';
    navigation.setOptions?.({ title });
  }, [navigation, user]);

  const { registerMenuRefresh } = useMenuRefresh();
  const menuRefreshRunningRef = useRef(false);
  useEffect(() => {
    const unsubscribe = registerMenuRefresh('Profile', () => {
      if (menuRefreshRunningRef.current) {
        return;
      }
      
      menuRefreshRunningRef.current = true;
      
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      setKeepTopPaddingWithLogging(true);
      setRefreshing(true);
      
      onRefresh().finally(() => {
        menuRefreshRunningRef.current = false;
      });
    });
    return () => {
      unsubscribe();
    };
  }, [onRefresh, registerMenuRefresh, setKeepTopPaddingWithLogging]);

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
    <View style={styles.screen} {...panResponder.panHandlers}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, keepTopPadding && styles.topSpacer]}
        contentInsetAdjustmentBehavior="always"
        onScrollBeginDrag={() => {
          setKeepTopPaddingWithLogging(false);
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        {isMine && (
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
        )}
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
              <Text style={styles.userName}>{user?.name || ''}</Text>
              <View style={styles.statsRow}>
                <TouchableOpacity
                  style={styles.statItemRow}
                  onPress={() => navigation.navigate('ProfileFriendsList')}
                >
                  <Text style={styles.statNumber}>{friendsCount}</Text>
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
      

        {!showPrivateNotice && (
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
        )}

        <View style={styles.section2}>
          {isMine ? (
            <View style={styles.rowSpread}>
              <TouchableOpacity style={styles.shareButton} onPress={() => navigation.navigate('EditProfile', { user })}>
                <Text style={styles.shareButtonText}>Uredi profil</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareButton} onPress={() => navigation.navigate('Share')}>
                <Text style={styles.shareButtonText}>Podijeli profil</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.rowSpread}>
              <TouchableOpacity
                style={connectButtonStyle}
                onPress={handleConnectPress}
                disabled={isFriendActionLoading || hasActiveFriendship}
              >
                {isFriendActionLoading ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8 }}>
                    <ActivityIndicator size="small" color={connectSpinnerColor} />
                    <Text style={connectTextStyles}>Učitavanje</Text>
                  </View>
                ) : isConnectCta ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8 }}>
                    <SvgUri uri={CONNECT_ICON_URI} width={18} height={18} color={connectIconColor} fill={connectIconColor} />
                    <Text style={connectTextStyles}>{connectLabel}</Text>
                  </View>
                ) : (
                  <Text style={connectTextStyles}>{connectLabel}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {showPrivateNotice ? (
          <View style={styles.privateWrapper}>
            <SuggestionSlider
              linkLabel="Pogledaj sve"
              onLinkPress={() => navigation.navigate('Friends', { screen: 'FriendsList' })}
            />
            <View style={styles.privateNotice}>
              <View style={styles.privateIcon}>
                <Ionicons name="lock-closed-outline" size={40} color={colors.text_secondary} />
              </View>
              <Text style={styles.privateTitle}>Ovo je privatan račun</Text>
              <Text style={styles.privateSubtitle}>
                Počnite pratiti ovaj korisnički račun kako biste vidjeli njihove fotografije i videozapise.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.section3}>
            <Text style={styles.sectionTitle}>Posljedni hajpovi</Text>
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
        )}

      </ScrollView>

      {isMine && (
        <BottomCTA
          label="Nadogradi na Premium"
          iconName="diamond-outline"
          onPress={() => navigation.navigate('Subscription')}
          fixed
        />
      )}
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
    topSpacer: {
      paddingTop: 40,
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
      backgroundColor: colors.background,
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
      height: 48,
      justifyContent: 'center',
    },
    shareButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text_primary,
    },
    connectButton: {
      borderColor: colors.primary,
    },
    connectButtonText: {
      color: colors.primary,
      fontWeight: '700',
    },
    connectButtonPrimary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    connectButtonPrimaryText: {
      color: colors.textLight,
    },
    coinRow: {
      paddingHorizontal: 14,
      paddingVertical: 18,
      paddingTop: 7,
      backgroundColor: colors.transparent,
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
    section3: {
      padding: 16,
      paddingBottom: 16,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    privateWrapper: {
      gap: 12,
      paddingTop: 0,
    },
    privateNotice: {
      paddingTop: 12,
      alignItems: 'center',
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.transparent,
    },
    privateIcon: {
      width: 90,
      height: 90,
      borderRadius: 45,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    privateTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text_primary,
      marginBottom: 8,
    },
    privateSubtitle: {
      fontSize: 14,
      color: colors.text_secondary,
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: 24,
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