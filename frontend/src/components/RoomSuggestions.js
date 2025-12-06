import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import RoomCard from './RoomCard';
import { fetchRooms } from '../api';

export default function RoomSuggestions({ refreshKey, onRoomPress }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

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
