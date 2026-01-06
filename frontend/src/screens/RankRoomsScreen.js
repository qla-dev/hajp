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
import { fetchRooms } from '../api';
import RoomCard from '../components/RoomCard';

export default function RankRoomsScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

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
    <RoomCard
      room={item}
      connectButtonHide={1}
      onPress={() => navigation.navigate('Ranking', { roomId: item.id, roomName: item.name })}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderRoom}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadRooms} tintColor={colors.primary} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Učitavanje</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 0,
      paddingBottom: 0,
    },
    loader: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    loadingText: {
      color: colors.text_secondary,
      fontSize: 16,
      marginTop: 12,
    },
    list: {
      flexGrow: 1,
      paddingTop: 0,
      paddingBottom: 8,
      paddingHorizontal: 16,
    },
  });
