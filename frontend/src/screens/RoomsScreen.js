import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { fetchRooms, fetchActiveQuestion } from '../api';
import PollItem from '../components/PollItem';

export default function RoomsScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomPolls, setRoomPolls] = useState({});
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

  const loadRooms = async () => {
    setLoading(true);
    try {
      const { data } = await fetchRooms();
      setRooms(data || []);
    } catch (error) {
      console.error('Greška pri učitavanju soba:', error);
    }
    setLoading(false);
  };

  const renderRoom = ({ item }) => {
    const highlight = roomPolls[item.id];
    const baseTotal = item.polls_count ?? 20;
    const fallbackAnswered = Math.min(
      item.completed_polls ?? Math.floor((item.members_count ?? 0) / 2),
      baseTotal,
    );

    const total = highlight?.total ?? baseTotal;
    const answered = highlight?.answered ?? fallbackAnswered;
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
        accentColor={item.is_private ? colors.error : colors.primary}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Učitavam sobe</Text>
          </View>
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderRoom}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 0,
      paddingHorizontal: 16,
      paddingBottom: 0,
    },
    section: {
      flex: 1,
      paddingTop: 12,
      borderBottomWidth: 0,
    },
    loadingText: {
      color: colors.text_secondary,
      fontSize: 16,
      marginTop: 12,
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    list: {
      paddingTop: 98,
      paddingBottom: 0,
    },
  });
