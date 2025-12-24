import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Animated } from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import RoomCard from './RoomCard';
import { fetchRooms, joinRoom } from '../api';

export default function RoomSuggestions({ refreshKey, onRoomPress }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningRoomId, setJoiningRoomId] = useState(null);
  const [fadeValues] = useState({});

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchRooms();
      setRooms(data?.data || data || []);
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRoomJoin = useCallback(
    async (roomId) => {
      if (!roomId) return;
      const targetRoom = rooms.find((r) => r.id === roomId);
      setJoiningRoomId(roomId);
      try {
        const { data } = await joinRoom(roomId);
        if (!fadeValues[roomId]) {
          fadeValues[roomId] = new Animated.Value(1);
        }
        Animated.timing(fadeValues[roomId], {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          setRooms((prev) => prev.filter((r) => r.id !== roomId));
        });
        const roomName = targetRoom?.name || '';
        Alert.alert(
          data?.status === 'requested' ? 'Zahtjev poslan' : 'Pridruženo',
          data?.status === 'requested'
            ? `Poslan je zahtjev za pridruživanje sobi ${roomName}.`
            : `Uspješno ste se pridružili sobi ${roomName}.`,
        );
      } catch (error) {
        const message = error?.response?.data?.message || 'Nije moguće poslati zahtjev za sobu.';
        Alert.alert('Greška', message);
      } finally {
        setJoiningRoomId(null);
      }
    },
    [rooms],
  );

  useEffect(() => {
    loadRooms();
  }, [loadRooms, refreshKey]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Predložene sobe po tvojim aktivnostima</Text>
      </View>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        rooms.map((room) => (
          <Animated.View
            key={room.id}
            style={fadeValues[room.id] ? { opacity: fadeValues[room.id] } : undefined}
          >
            <RoomCard
              room={room}
              onPress={() => onRoomPress?.(room)}
              onJoin={() => handleRoomJoin(room.id)}
              joining={joiningRoomId === room.id}
            />
          </Animated.View>
        ))
      )}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      marginTop: 8,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 10,
    },
    title: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text_primary,
    },
    loader: {
      paddingVertical: 12,
    },
  });
