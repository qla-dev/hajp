import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { fetchRooms } from '../api';

export default function RoomsScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

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

  const renderRoom = ({ item }) => (
    <TouchableOpacity style={styles.roomCard} onPress={() => navigation.navigate('Polling', { roomId: item.id })}>
      <Text style={styles.roomName}>{item.name}</Text>
      {item.is_18_over ? <Text style={styles.roomBadge}>18+</Text> : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>Učitavam sobe...</Text>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderRoom}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  loadingText: {
    color: colors.text_secondary,
    fontSize: 16,
  },
  list: {
    paddingVertical: 8,
  },
  roomCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text_primary,
  },
  roomBadge: {
    marginTop: 4,
    fontSize: 12,
    color: colors.error,
    fontWeight: '700',
  },
});
