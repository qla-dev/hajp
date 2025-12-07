import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { fetchRooms, fetchActiveQuestion } from '../api';
import PollItem from '../components/PollItem';

export default function RoomsScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomPolls, setRoomPolls] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadActivePolls = async () => {
      if (!rooms.length) {
        setRoomPolls({});
        return;
      }
      const highlights = {};
      await Promise.all(
        rooms.map(async (room) => {
          if (controller.signal.aborted) return;
          try {
            const { data } = await fetchActiveQuestion(room.id);
            highlights[room.id] = {
              question: data?.question?.question ?? null,
              emoji: data?.question?.emoji ?? null,
              answered: Math.max(0, Math.min(data?.total ?? 0, (data?.index ?? 1) - 1)),
              total: data?.total ?? 0,
            };
          } catch {
            highlights[room.id] = undefined;
          }
        }),
      );
      if (!controller.signal.aborted) {
        setRoomPolls(highlights);
      }
    };

    loadActivePolls();
    return () => controller.abort();
  }, [rooms]);

  const loadRooms = async ({ showLoader = true } = {}) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const { data } = await fetchRooms();
      setRooms(data || []);
    } catch (error) {
      console.error('Greška pri učitavanju soba:', error);
    } finally {
      if (showLoader) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  const renderRoom = ({ item }) => {
    const highlight = roomPolls[item.id];
    const baseTotal = item.polls_count ?? 20;
    const fallbackAnswered = Math.min(item.completed_polls ?? baseTotal, baseTotal);

    const total = highlight?.total ?? baseTotal;
    const answered = highlight?.answered ?? fallbackAnswered;
    const isComplete = total > 0 && answered >= total;
    const emoji = highlight?.emoji || (item.type === 'Za žene' ? '🌸' : '⚡️');

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
        accentColor={isComplete ? colors.error : item.is_private ? colors.error : colors.primary}
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
    rooms.length === 0 && styles.emptyContainer,
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderRoom}
        contentContainerStyle={listContentStyle}
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
      paddingTop: 20,
      paddingBottom: 150,
      gap: 12,
    },
    emptyContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingBottom: 40,
    },
  });
