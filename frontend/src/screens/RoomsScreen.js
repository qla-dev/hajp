import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
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
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.text_secondary} />
          <Text style={styles.loadingText}>Učitavam sobe</Text>
        </View>
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
    paddingTop: 4,
    paddingHorizontal: 16,
    paddingBottom: 4,
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
    paddingTop: 4,
    paddingBottom: 4,
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
