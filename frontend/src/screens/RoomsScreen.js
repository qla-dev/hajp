import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { fetchRoomsStatus, fetchUserRooms } from '../api';
import PollItem from '../components/PollItem';
import EmptyState from '../components/EmptyState';
import { useMenuRefresh } from '../context/menuRefreshContext';

const ITEM_HEIGHT = 300;
const SKIP_LIMIT = 3;

const VIBE_OPTIONS = [
  { key: 'Zabava', icon: 'musical-notes-outline' },
  { key: 'Sport', icon: 'fitness-outline' },
  { key: 'Lifestyle', icon: 'leaf-outline' },
  { key: 'Tehnologija', icon: 'laptop-outline' },
  { key: 'Putovanja', icon: 'airplane-outline' },
  { key: 'Hrana', icon: 'restaurant-outline' },
  { key: 'Moda', icon: 'shirt-outline' },
  { key: 'Zdravlje', icon: 'heart-outline' },
  { key: 'Finansije', icon: 'cash-outline' },
  { key: 'Obrazovanje', icon: 'school-outline' },
  { key: 'Za žene', icon: 'flower-outline' },
  { key: 'Za muškarce', icon: 'barbell-outline' },
];

export default function RoomsScreen({ navigation, route }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [keepTopPadding, setKeepTopPadding] = useState(false);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const listRef = useRef(null);

  const scrollToTop = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    try {
      list.scrollToIndex({ index: 0, animated: true, viewPosition: 0 });
    } catch (err) {
      list.scrollToOffset?.({ offset: 0, animated: true });
    }
  }, [rooms.length]);

  const loadRooms = useCallback(async ({ showLoader = true } = {}) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      // Fetch user rooms with preview_members
      const { data: userRoomsResponse } = await fetchUserRooms('user');
      const memberRooms = userRoomsResponse?.rooms || [];
      const memberIds = new Set(memberRooms.map((room) => room.id));

      // Fetch room status data
      const { data } = await fetchRoomsStatus();
      const statusRooms = data?.data || [];
      
      // Merge status data into member rooms
      const roomsWithStatus = memberRooms.map((memberRoom) => {
        const statusData = statusRooms.find((sr) => sr.id === memberRoom.id);
        return {
          ...memberRoom,
          ...statusData, // Merge status data (active_question, polls_count, etc.)
          preview_members: memberRoom.preview_members, // Keep preview_members from userRooms
          mutual_member: memberRoom.mutual_member, // Keep mutual_member from userRooms
        };
      });
      
      // Sort rooms: active/incomplete first, then completed
      const sortedRooms = roomsWithStatus.sort((a, b) => {
        const getStatus = (room) => {
          const highlight = room.active_question;
          const baseTotal = room.polls_count ?? 20;
          const skipped = Math.min(highlight?.skipped ?? 0, SKIP_LIMIT);
          const totalBase = highlight?.total ?? baseTotal;
          const total = Math.max((totalBase || 0) - skipped, 0);
          const answeredWithSkips = highlight?.answered ?? Math.min(room.completed_polls ?? baseTotal, baseTotal);
          const answeredNormalized = Math.max(0, answeredWithSkips - skipped);
          const answered = total > 0 ? Math.min(answeredNormalized, total) : answeredNormalized;
          const isComplete = total > 0 && answered >= total;
          return isComplete ? 1 : 0; // 0 = active, 1 = complete
        };
        
        return getStatus(a) - getStatus(b);
      });
      
      setRooms(sortedRooms);
    } catch (error) {
      console.error('Greška pri učitavanju soba:', error);
      setRooms([]);
    } finally {
      if (showLoader) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }, []);

  const { registerMenuRefresh } = useMenuRefresh();
  const menuRefreshRunningRef = useRef(false);
  useEffect(() => {
    const refreshAndScroll = () => {
      if (menuRefreshRunningRef.current) {
        return;
      }
      
      menuRefreshRunningRef.current = true;
      
      scrollToTop();
      setKeepTopPadding(true);
      setRefreshing(true);
      loadRooms({ showLoader: false }).finally(() => {
        menuRefreshRunningRef.current = false;
      });
    };

    const unsubscribe = registerMenuRefresh('Hajp', refreshAndScroll);
    return unsubscribe;
  }, [loadRooms, registerMenuRefresh, scrollToTop]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const lastRefreshTimestamp = useRef(null);
  useEffect(() => {
    const parent = navigation.getParent();
    if (!parent) return;
    
    const unsubscribe = navigation.addListener('focus', () => {
      const refreshTimestamp = parent.getState()?.routes?.find(r => r.name === 'Hajp')?.params?.refreshRooms;
      
      if (refreshTimestamp && refreshTimestamp !== lastRefreshTimestamp.current) {
        lastRefreshTimestamp.current = refreshTimestamp;
        loadRooms({ showLoader: false });
      }
    });
    return unsubscribe;
  }, [loadRooms, navigation]);

  const renderRoom = ({ item }) => {

    const highlight = item.active_question;
    const baseTotal = item.polls_count ?? 20;
    const fallbackAnswered = Math.min(item.completed_polls ?? baseTotal, baseTotal);

    const skipped = Math.min(highlight?.skipped ?? 0, SKIP_LIMIT);
    const totalBase = highlight?.total ?? baseTotal;
    const total = Math.max((totalBase || 0) - skipped, 0);
    const answeredWithSkips = highlight?.answered ?? fallbackAnswered;
    const answeredNormalized = Math.max(0, answeredWithSkips - skipped);
    const answered = total > 0 ? Math.min(answeredNormalized, total) : answeredNormalized;
    const cashoutDone = !!highlight?.cashout_done;
    const isComplete = total > 0 && answered >= total;
    
    let badgeLabel = 'U progresu';
    if (isComplete) {
      badgeLabel = cashoutDone ? 'Isplaćeno' : 'ISPLATI ODMAH';
    }
    
    const emoji = highlight?.emoji || (item.type === 'Za žene' ? '🌸' : '⚡️');

    const accentColor = isComplete
      ? colors.secondary
      : item.is_private
      ? colors.primary
      : colors.primary;

    // Get room icon based on type
    const vibeMatch = VIBE_OPTIONS.find((option) => option.key === item.type);
    const roomIcon = vibeMatch?.icon || 'leaf-outline';

    return (
      <PollItem
        roomName={item.name}
        question={highlight?.question || item.tagline || item.description}
        answered={answered}
        total={total}
        emoji={emoji}
        badgeLabel={badgeLabel}
        roomCover={item.cover_url || item.cover}
        roomIcon={roomIcon}
        previewMembers={item.preview_members || []}
        memberCount={item.members_count ?? 0}
        mutualMember={item.mutual_member || null}
        onCardPress={() =>
          navigation.navigate('Polling', { roomId: item.id, roomName: item.name })
        }
        accentColor={accentColor}
      />
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Učitavam sobe</Text>
        </View>
      );
    }
    return (
      <EmptyState
        title="Još uvijek nema soba"
        subtitle="Rank sobe će se pojaviti čim ih odaberete."
        onRefresh={() => loadRooms({ showLoader: false })}
        refreshing={loading}
        fullWidth
      />
    );
  };

  const listContentStyle = [
    styles.listContent,
    keepTopPadding && styles.topSpacer,
    rooms.length === 0 && styles.topSpacer,
    rooms.length === 0 && styles.emptyHorizontalPadding,
  ];

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={rooms}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderRoom}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        contentContainerStyle={listContentStyle}
        onScrollBeginDrag={() => setKeepTopPadding(false)}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadRooms({ showLoader: false })}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentInsetAdjustmentBehavior="always"
      />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingText: {
      color: colors.text_secondary,
      fontSize: 16,
      marginTop: 12,
    },
    loader: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 32,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 0,
      gap: 0,
    },
    topSpacer: {
      paddingTop: 40,
      flexGrow: 1,
      justifyContent: 'center',
      paddingBottom: 40,
    },
    emptyHorizontalPadding: {
      paddingHorizontal: 0,
      paddingBottom: 0,
    },
  });