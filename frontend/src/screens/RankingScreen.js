import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SvgUri } from 'react-native-svg';
import { Asset } from 'expo-asset';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { fetchRoomRanking } from '../api';
import MenuTab from '../components/MenuTab';

/* 👑 SVG ASSET */
const crownAsset = require('../../assets/svg/crown.svg');
const crownUri = Asset.fromModule(crownAsset).uri;

const PERIODS = [
  { key: 'day', label: 'Danas' },
  { key: 'week', label: 'Sedmica' },
  { key: 'month', label: 'Mjesec' },
];

const BOTTOM_CARD_EXTRA = 96;
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const getInitials = (name = '') => {
  const p = name.trim().split(' ').filter(Boolean);
  if (!p.length) return '??';
  if (p.length === 1) return p[0][0].toUpperCase();
  return `${p[0][0]}${p[p.length - 1][0]}`.toUpperCase();
};

const formatHajps = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}k`;
  return String(n);
};

export default function RankingScreen({ route, navigation }) {
  const { roomId, roomName } = route.params || {};
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const [activePeriod, setActivePeriod] = useState('day');
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(false);

  /* 🎬 ANIMACIJE */
  const winnerIntro = useRef(new Animated.Value(0)).current;
  const crownPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (roomName) navigation.setOptions({ title: roomName });
  }, [roomName, navigation]);

  useEffect(() => {
    Animated.timing(winnerIntro, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(crownPulse, {
          toValue: 1.25,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(crownPulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [winnerIntro, crownPulse]);

  const loadRanking = useCallback(async (period) => {
    if (!roomId) return;
    setLoading(true);
    try {
      const { data } = await fetchRoomRanking(roomId, period);
      setRanking(data?.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadRanking(activePeriod);
  }, [activePeriod, loadRanking]);

  const heroData = useMemo(() => {
    const arr = [];
    if (ranking[1]) arr.push({ ...ranking[1], rank: 2 });
    if (ranking[0]) arr.push({ ...ranking[0], rank: 1 });
    if (ranking[2]) arr.push({ ...ranking[2], rank: 3 });
    return arr;
  }, [ranking]);

  const listData = useMemo(
    () => ranking.slice(3).map((u, i) => ({ ...u, rank: i + 4 })),
    [ranking],
  );

  const renderHero = () => (
    <View style={styles.heroWrapper}>
      {heroData.map((p) => {
        const isWinner = p.rank === 1;

        return (
          <Animated.View
            key={`hero-${p.rank}`}
            style={[
              styles.heroItem,
              isWinner && {
                opacity: winnerIntro,
                transform: [
                  {
                    scale: winnerIntro.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                  { translateY: -26 },
                ],
              },
            ]}
          >
            {/* 👑 SVG KRUNA / MEDALJE */}
            <Animated.View
              style={[
                styles.heroIconTop,
                isWinner && { transform: [{ scale: crownPulse }] },
              ]}
            >
              {p.rank === 1 && (
                <SvgUri
                  uri={crownUri}
                  width={26}
                  height={26}
                  style={{ tintColor: '#FFD700' }} // ✨ GOLD FILTER
                />
              )}

              {p.rank === 2 && (
                <Ionicons name="medal" size={18} color="#C0C0C0" />
              )}
              {p.rank === 3 && (
                <Ionicons name="medal" size={18} color="#CD7F32" />
              )}
            </Animated.View>

            <View
              style={[
                styles.heroAvatar,
                isWinner && styles.heroAvatarPrimary,
                p.rank === 1 && styles.goldBorder,
                p.rank === 2 && styles.silverBorder,
                p.rank === 3 && styles.bronzeBorder,
              ]}
            >
              <Text
                style={[
                  styles.heroAvatarText,
                  isWinner && styles.heroAvatarPrimaryText,
                ]}
              >
                {getInitials(p.name)}
              </Text>
            </View>

            <Text style={styles.heroName} numberOfLines={1}>
              {p.name}
            </Text>
            <Text style={styles.heroScore}>{formatHajps(p.hajps)}</Text>
          </Animated.View>
        );
      })}
    </View>
  );

  const renderRow = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.rankCircle}>
        <Text style={styles.rankLabel}>{item.rank}</Text>
      </View>

      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        </View>
        <Text style={styles.userName}>{item.name}</Text>
      </View>

      <View style={styles.hajpWrapper}>
        <Text style={styles.hajpValue}>{formatHajps(item.hajps)}</Text>
        <Text style={styles.hajpLabel}>hajpova</Text>
      </View>
    </View>
  );

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
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <AnimatedFlatList
          data={listData}
          keyExtractor={(i) => String(i.user_id)}
          renderItem={renderRow}
          ListHeaderComponent={renderHero}
          stickyHeaderIndices={[0]}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { paddingHorizontal: 16, paddingBottom: BOTTOM_CARD_EXTRA },

    heroWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 16,
      backgroundColor: colors.background,
    },

    heroItem: { flex: 1, alignItems: 'center' },
    heroIconTop: { marginBottom: 6 },

    heroAvatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },

    heroAvatarPrimary: {
      width: 82,
      height: 82,
      borderRadius: 41,
      backgroundColor: colors.primary,
    },

    goldBorder: { borderColor: '#FFD700' },
    silverBorder: { borderColor: '#C0C0C0' },
    bronzeBorder: { borderColor: '#CD7F32' },

    heroAvatarText: { fontSize: 20, fontWeight: '700', color: colors.text_primary },
    heroAvatarPrimaryText: { color: '#fff' },

    heroName: { marginTop: 4, fontWeight: '600', color: colors.text_primary },
    heroScore: { color: colors.text_secondary },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 10,
    },

    rankCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    rankLabel: { fontWeight: '700', color: colors.text_primary },

    userInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    avatarText: { fontWeight: '700', color: colors.text_primary },
    userName: { fontWeight: '700', color: colors.text_primary },

    hajpWrapper: { alignItems: 'flex-end' },
    hajpValue: { fontSize: 18, fontWeight: '800', color: colors.primary },
    hajpLabel: { fontSize: 11, color: colors.text_secondary },
  });
