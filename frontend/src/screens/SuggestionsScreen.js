import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import SuggestionSlider from '../components/SuggestionSlider';
import SuggestionGrid from '../components/SuggestionGrid';
import RoomCard from '../components/RoomCard';
import FriendListItem from '../components/FriendListItem';
import { fetchFriendRequests, approveFriendRequest } from '../api';

const rooms = [
  {
    id: 1,
    name: 'Grow Together',
    description: 'Soba puna motivacije, mentorstva i cool priča.',
    members: 128,
    is_18_over: true,
    cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 2,
    name: 'Weekend Hype',
    description: 'Casual chat + hajp stream svaki petak.',
    members: 94,
    is_18_over: false,
    cover: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 3,
    name: 'Tech Deep Dive',
    description: 'Deep kodanje, kolaboracije i meme battle.',
    members: 64,
    is_18_over: true,
    cover: 'https://images.unsplash.com/photo-1485217988980-11786ced9454?auto=format&fit=crop&w=800&q=60',
  },
];


export default function SuggestionsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [approvingRequestId, setApprovingRequestId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const { data } = await fetchFriendRequests();
      setRequests(data?.data || data || []);
    } catch {
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApprove = useCallback(
    async (friendId) => {
      if (!friendId) return;
      setApprovingRequestId(friendId);
      try {
        await approveFriendRequest(friendId);
        await loadRequests();
      } finally {
        setApprovingRequestId(null);
      }
    },
    [loadRequests],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshKey((prev) => prev + 1);
    setRefreshing(false);
  }, [loadRequests]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      if (navigation.isFocused()) {
        onRefresh();
      }
    });
    return unsubscribe;
  }, [navigation, onRefresh]);

  return (
    <ScrollView
      style={styles.container}
      contentInsetAdjustmentBehavior="always"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
      }
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Zahtjevi za praćenje</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Friends', {
              screen: 'FriendsList',
              params: { mode: 'requests' },
            })
          }
        >
          <Text style={styles.sectionLink}>Pogledaj sve</Text>
        </TouchableOpacity>
      </View>

      {loadingRequests ? (
        <View style={styles.loaderRow}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <View style={styles.requestsRow}>
          {requests.slice(0, 2).map((item) => (
            <FriendListItem
              key={item.id}
              friend={item}
              isRequestList
              approving={approvingRequestId === item.id}
              onPress={() =>
                navigation.navigate('FriendProfile', {
                  isMine: false,
                  userId: item.friend_id || item.id,
                })
              }
              onApprove={() => handleApprove(item.friend_id || item.id)}
            />
          ))}
          {!requests.length && (
            <Text style={styles.emptyRequests}>Nema novih zahtjeva.</Text>
          )}
        </View>
      )}

      <SuggestionSlider
        linkLabel="Pogledajte sve"
        onLinkPress={() => navigation.navigate('Friends', { screen: 'FriendsList' })}
        refreshKey={refreshKey}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sobe nasumično otvorene</Text>
      </View>

      <View style={styles.roomList}>
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} onPress={() => console.log('Open room', room.name)} />
        ))}
      </View>

      <SuggestionGrid refreshKey={refreshKey} />
    </ScrollView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingBottom: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text_primary,
    },
    sectionLink: {
      color: colors.primary,
      fontWeight: '700',
    },
    requestsRow: {
      flexDirection: 'column',
      gap: 12,
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    loaderRow: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    emptyRequests: {
      paddingHorizontal: 16,
      color: colors.text_secondary,
    },
    roomList: {
      paddingHorizontal: 16,
      paddingTop: 8,
    },
  });
