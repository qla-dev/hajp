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
import { useMenuRefresh } from '../context/menuRefreshContext';

const ITEM_HEIGHT = 300;

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
      let memberIds;
      try {
        const { data: memberRoomsData } = await fetchUserRooms('user');
        const memberRooms = memberRoomsData?.rooms || [];
        memberIds = new Set(memberRooms.map((room) => room.id));
      } catch (memberError) {
        console.error('Greška pri dohvaćanju tvojih soba:', memberError);
      }

      const { data } = await fetchRoomsStatus();
      const availableRooms = data?.data || [];
      const filteredRooms =
        memberIds == null ? availableRooms : availableRooms.filter((room) => memberIds.has(room.id));
      setRooms(filteredRooms);
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

    const total = highlight?.total ?? baseTotal;
    const answered = highlight?.answered ?? fallbackAnswered;
    const isComplete = total > 0 && answered >= total;
    const emoji = highlight?.emoji || (item.type === 'Za žene' ? '🌸' : '⚡️');

    const accentColor = isComplete
      ? colors.secondary
      : item.is_private
      ? colors.primary
      : colors.primary;

    return (
      <PollItem
        roomName={item.name}
        question={highlight?.question || item.tagline || item.description}
        answered={answered}
        total={total}
        emoji={emoji}
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
      <View style={styles.emptyState}>
        <Text style={[styles.loadingText, { marginTop: 0 }]}>Još nema soba</Text>
      </View>
    );
  };

  const listContentStyle = [
    styles.listContent,
    keepTopPadding && styles.topSpacer,
    rooms.length === 0 && styles.topSpacer,
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
  });
