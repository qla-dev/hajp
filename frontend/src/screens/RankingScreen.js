import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { fetchRoomRanking, getCurrentUser } from '../api';
import MenuTab from '../components/MenuTab';

const PERIODS = [
  { key: 'day', label: 'Danas' },
  { key: 'week', label: 'Sedmica' },
  { key: 'month', label: 'Mjesec' },
];

const BOTTOM_CARD_EXTRA = 96;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const getInitials = (name = '') => {
  const segments = name.trim().split(' ').filter(Boolean);
  if (!segments.length) return '??';
  if (segments.length === 1) return segments[0][0]?.toUpperCase() ?? '??';
  return `${segments[0][0]}${segments[segments.length - 1][0]}`.toUpperCase();
};

const formatHajps = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return String(value ?? '');
  if (Math.abs(num) >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return num.toString();
};

export default function RankingScreen({ route, navigation }) {
  const { roomId, roomName } = route.params || {};
  useEffect(() => {
    if (roomName) {
      navigation.setOptions({ title: roomName });
    }
  }, [navigation, roomName]);

  const [activePeriod, setActivePeriod] = useState(PERIODS[0].key);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);
  const scrollY = useRef(new Animated.Value(0)).current;
  const heroScale = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.88],
    extrapolate: 'clamp',
  });
  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -8],
    extrapolate: 'clamp',
  });
  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.92],
    extrapolate: 'clamp',
  });
  const heroMargin = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [12, 0],
    extrapolate: 'clamp',
  });

  const loadRanking = useCallback(
    async (period, { useLoading = true } = {}) => {
      if (!roomId) return;
      if (useLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError('');
      try {
        const { data } = await fetchRoomRanking(roomId, period);
        setRanking(data?.data ?? []);
      } catch (err) {
        console.error('Greška pri učitavanju rang liste:', err);
        setError('Neuspešno učitavanje rang liste');
      } finally {
        if (useLoading) {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
      }
    },
    [roomId],
  );

  useEffect(() => {
    loadRanking(activePeriod);
  }, [activePeriod, loadRanking]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = await getCurrentUser();
        if (!mounted) return;
        setCurrentUserId(user?.id ?? user?.data?.id ?? null);
      } catch {
        if (!mounted) return;
        setCurrentUserId(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const normalizedCurrentUserId = useMemo(
    () => (currentUserId ? String(currentUserId) : null),
    [currentUserId],
  );

  const heroData = useMemo(() => {
    const entries = [];
    if (ranking[1]) entries.push({ ...ranking[1], rank: 2, position: 'left' });
    if (ranking[0]) entries.push({ ...ranking[0], rank: 1, position: 'center' });
    if (ranking[2]) entries.push({ ...ranking[2], rank: 3, position: 'right' });
    return entries;
  }, [ranking]);

  const heroCount = heroData.length;
  const myRankEntry = useMemo(() => {
    if (!normalizedCurrentUserId) return null;
    const index = ranking.findIndex(
      (entry) => String(entry.user_id) === normalizedCurrentUserId,
    );
    if (index === -1 || index < heroCount) return null;
    return { ...ranking[index], rank: index + 1 };
  }, [normalizedCurrentUserId, ranking, heroCount]);

  const listData = useMemo(() => {
    const result = [];
    ranking.forEach((entry, idx) => {
      if (idx < heroCount) return;
      if (normalizedCurrentUserId && String(entry.user_id) === normalizedCurrentUserId) {
        return;
      }
      result.push({
        ...entry,
        rank: idx + 1,
      });
    });
    return result;
  }, [ranking, heroCount, normalizedCurrentUserId]);

  const renderRow = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.rankCircle}>
        <Text style={styles.rankLabel}>{item.rank}</Text>
      </View>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        </View>
        <View>
          <Text style={styles.userName}>{item.name}</Text>
          {item.username ? <Text style={styles.userMeta}>@{item.username}</Text> : null}
        </View>
      </View>
      <View style={styles.hajpWrapper}>
        <Text style={styles.hajpValue}>{formatHajps(item.hajps)}</Text>
        <Text style={styles.hajpLabel}>hajpova</Text>
      </View>
    </View>
  );

  const emptyComponent = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Još nema hajpova</Text>
      <Text style={styles.emptySubtitle}>Prva osoba koja dobije hajp će se pojaviti ovdje</Text>
    </View>
  );

  const renderHeroSection = () => {
    if (!heroData.length) return null;
    return (
      <View style={styles.heroShellWrapper}>
        <Animated.View
          style={[
            styles.heroShell,
            {
              transform: [{ scaleY: heroScale }, { translateY: heroTranslateY }],
              marginBottom: heroMargin,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.heroSection,
              { transform: [{ scaleX: heroScale }], opacity: heroOpacity },
            ]}
          >
            <View style={styles.heroWrapper}>
              {heroData.map((person) => (
                <View
                  key={`hero-${person.rank}`}
                  style={[
                    styles.heroItem,
                    person.position === 'center' && styles.heroItemCenter,
                  ]}
                >
                  <View style={styles.heroAvatarWrapper}>
                    <View
                      style={[
                        styles.heroAvatar,
                        person.position === 'center' && styles.heroAvatarPrimary,
                      ]}
                    >
                      <Text
                        style={[
                          styles.heroAvatarText,
                          person.position === 'center' && styles.heroAvatarPrimaryText,
                        ]}
                      >
                        {getInitials(person.name)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.heroRankBadge,
                        person.position === 'center' && styles.heroRankBadgePrimary,
                      ]}
                    >
                      <Text
                        style={[
                          styles.heroRankBadgeText,
                          person.position === 'center' && styles.heroRankBadgeTextPrimary,
                        ]}
                      >
                        {person.rank}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.heroName,
                      person.position === 'center' && styles.heroNamePrimary,
                    ]}
                    numberOfLines={1}
                  >
                    {person.name}
                  </Text>
                  <Text
                    style={[
                      styles.heroScore,
                      person.position === 'center' && styles.heroScorePrimary,
                    ]}
                  >
                    {formatHajps(person.hajps ?? 0)}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    );
  };

  const renderMyRankCard = () => {
    if (!myRankEntry) return null;
    return (
      <View style={styles.myRankWrapper}>
        <View style={styles.myRankCard}>
          <Text style={styles.myRankNumber}>{myRankEntry.rank}</Text>
          <View style={styles.myRankContent}>
            <View style={styles.myRankAvatar}>
              <Text style={styles.myRankAvatarText}>{getInitials(myRankEntry.name)}</Text>
            </View>
            <View>
              <Text style={styles.myRankLabel}>My Rank</Text>
              <Text style={styles.myRankName} numberOfLines={1}>
                {myRankEntry.name}
              </Text>
            </View>
          </View>
          <Text style={styles.myRankHajps}>{formatHajps(myRankEntry.hajps)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <MenuTab
        items={PERIODS}
        activeKey={activePeriod}
        onChange={setActivePeriod}
        topPadding={100}
        horizontalPadding={16}
        variant="menu-tab-s"
        color="secondary"
      />
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Učitavanje</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyTitle}>{error}</Text>
        </View>
      ) : (
        <AnimatedFlatList
          data={listData}
          keyExtractor={(item) => String(item.user_id)}
          renderItem={renderRow}
          contentContainerStyle={[
            styles.list,
            ranking.length === 0 && styles.listEmptyContainer,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadRanking(activePeriod, { useLoading: false })}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={ranking.length === 0 ? emptyComponent : null}
          ListHeaderComponent={renderHeroSection}
          ListHeaderComponentStyle={styles.heroHeaderContainer}
          ListFooterComponent={() => <View style={{ height: myRankEntry ? BOTTOM_CARD_EXTRA : 32 }} />}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[0]}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )}
        />
      )}
      {renderMyRankCard()}
    </View>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 40,
    },
    loadingText: {
      marginTop: 12,
      color: colors.text_secondary,
      fontSize: 16,
    },
    list: {
      paddingHorizontal: 16,
      paddingBottom: BOTTOM_CARD_EXTRA + 8,
    },
    listEmptyContainer: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    heroHeaderContainer: {
    },
    heroShellWrapper: {
      width: '100%',
      backgroundColor: colors.background,
      borderRadius: 0,
    },
    heroShell: {
      width: '100%',
      borderRadius: 20,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 0,
      elevation: 4,
      overflow: 'hidden',
    },
    heroSection: {
      width: '100%',
      borderRadius: 20,
      backgroundColor: colors.background,
      paddingVertical: 16,
      paddingHorizontal: 12,
      paddingBottom: 24,

    },
    heroWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 6,
    },
    heroItem: {
      flex: 1,
      alignItems: 'center',
    },
    heroItemCenter: {
      justifyContent: 'center',
    },
    heroItemCenter: {
      justifyContent: 'center',
    },
    heroAvatarWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroAvatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroAvatarPrimary: {
      width: 82,
      height: 82,
      borderRadius: 41,
      backgroundColor: colors.primary,
    },
    heroAvatarText: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text_primary,
    },
    heroAvatarPrimaryText: {
      color: '#fff',
    },
    heroRankBadge: {
      position: 'absolute',
      top: -6,
      right: -4,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroRankBadgePrimary: {
      backgroundColor: colors.primary,
      borderColor: 'transparent',
    },
    heroRankBadgeText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text_primary,
    },
    heroRankBadgeTextPrimary: {
      color: '#fff',
    },
    heroName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text_primary,
      marginTop: 4,
    },
    heroNamePrimary: {
      color: colors.primary,
      fontSize: 16,
    },
    heroScore: {
      fontSize: 13,
      color: colors.text_secondary,
    },
    heroScorePrimary: {
      color: colors.text_primary,
      fontWeight: '700',
      fontSize: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.transparent,
      borderRadius: 16,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,

      elevation: 2,
    },
    rankCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rankLabel: {
      color: colors.text_primary,
      fontWeight: '700',
      fontSize: 14,
    },
    userInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: colors.text_primary,
      fontWeight: '700',
    },
    userName: {
      color: colors.text_primary,
      fontWeight: '700',
      fontSize: 16,
    },
    userMeta: {
      color: colors.text_secondary,
      fontSize: 13,
    },
    hajpWrapper: {
      alignItems: 'flex-end',
    },
    hajpValue: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.primary,
    },
    hajpLabel: {
      fontSize: 11,
      color: colors.text_secondary,
    },
    emptyState: {
      flex: 1,
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text_primary,
      marginBottom: 6,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.text_secondary,
      textAlign: 'center',
    },
    myRankWrapper: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 16,
    },
    myRankCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background,
      borderRadius: 24,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: colors.border,
 
      elevation: 3,
    },
    myRankNumber: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text_primary,
      marginRight: 12,
    },
    myRankContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    myRankAvatar: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    myRankAvatarText: {
      color: colors.text_primary,
      fontWeight: '700',
    },
    myRankLabel: {
      fontSize: 12,
      color: colors.text_secondary,
    },
    myRankName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text_primary,
    },
    myRankHajps: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
    },
  });
