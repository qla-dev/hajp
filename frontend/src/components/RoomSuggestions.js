import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import RoomCard from './RoomCard';
import { fetchRooms, joinRoom } from '../api';

export default function RoomSuggestions({ refreshKey, onRoomPress }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningRoomId, setJoiningRoomId] = useState(null);

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
      setJoiningRoomId(roomId);
      try {
        const { data } = await joinRoom(roomId);
        Alert.alert(
          data?.status === 'requested' ? 'Zahtjev poslan' : 'Pridruženo',
          data?.status === 'requested'
            ? 'Poslan je zahtjev za pridruživanje sobi.'
            : 'Uspješno ste se pridružili sobi.',
        );
      } catch (error) {
        const message = error?.response?.data?.message || 'Nije moguće poslati zahtjev za sobu.';
        Alert.alert('Greška', message);
      } finally {
        setJoiningRoomId(null);
      }
    },
    [],
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
          <RoomCard
            key={room.id}
            room={room}
            onPress={() => onRoomPress?.(room)}
            onJoin={() => handleRoomJoin(room.id)}
            joining={joiningRoomId === room.id}
          />
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
