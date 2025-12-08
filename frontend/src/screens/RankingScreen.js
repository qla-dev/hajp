import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { fetchRoomRanking } from '../api';

const PERIODS = [
  { key: 'day', label: 'Danas' },
  { key: 'week', label: 'Sedmica' },
  { key: 'month', label: 'Mjesec' },
];

const getInitials = (name = '') => {
  const segments = name.trim().split(' ').filter(Boolean);
  if (!segments.length) return '??';
  if (segments.length === 1) return segments[0][0]?.toUpperCase() ?? '??';
  return `${segments[0][0]}${segments[segments.length - 1][0]}`.toUpperCase();
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
  const [error, setError] = useState('');
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);

  const loadRanking = useCallback(
    async (period) => {
      if (!roomId) return;
      setLoading(true);
      setError('');
      try {
        const { data } = await fetchRoomRanking(roomId, period);
        setRanking(data?.data ?? []);
      } catch (err) {
        console.error('Greška pri učitavanju rang liste:', err);
        setError('Neuspešno učitavanje rang liste');
      } finally {
        setLoading(false);
      }
    },
    [roomId],
  );

  useEffect(() => {
    loadRanking(activePeriod);
  }, [activePeriod, loadRanking]);

  const renderRow = ({ item, index }) => (
    <View style={[styles.row, index === 0 && styles.topRow]}>
      <View style={styles.rankCircle}>
        <Text style={styles.rankLabel}>{index + 1}</Text>
      </View>
      <View style={styles.userInfo}>
        <View style={[styles.avatar, index === 0 && styles.avatarTop]}>
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        </View>
        <View>
          <Text style={styles.userName}>{item.name}</Text>
          {item.username ? <Text style={styles.userMeta}>@{item.username}</Text> : null}
        </View>
      </View>
      <View style={styles.hajpWrapper}>
        <Text style={styles.hajpValue}>{item.hajps}</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {PERIODS.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.tabButton,
              activePeriod === period.key && styles.tabButtonActive,
              activePeriod === period.key && { borderColor: colors.primary },
            ]}
            onPress={() => setActivePeriod(period.key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, activePeriod === period.key && styles.tabTextActive]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
        <FlatList
          data={ranking}
          keyExtractor={(item) => String(item.user_id)}
          renderItem={renderRow}
          contentContainerStyle={styles.list}
          ListEmptyComponent={emptyComponent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    tabs: {
      flexDirection: 'row',
      gap: 8,
      paddingBottom: 16,
      paddingTop: 90,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'transparent',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    tabButtonActive: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#eef4ff',
    },
    tabText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text_secondary,
    },
    tabTextActive: {
      color: colors.primary,
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
      paddingBottom: 32,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadowSecondary ?? '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.07,
      shadowRadius: 10,
      elevation: 2,
    },
    topRow: {
      borderColor: colors.primary,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#eef6ff',
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
    avatarTop: {
      backgroundColor: colors.primary,
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
  });
