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
import RoomSuggestions from '../components/RoomSuggestions';
import SuggestionGrid from '../components/SuggestionGrid';
import FriendListItem from '../components/FriendListItem';
import { fetchFriendRequests, approveFriendRequest } from '../api';

export default function SuggestionsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [approvingRequestId, setApprovingRequestId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [skipSliderHaptic, setSkipSliderHaptic] = useState(false);

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

  const handleGridCardPress = useCallback(
    (item) => {
      setSkipSliderHaptic(true);
      const friendId = item.friend_id || item.id;
      if (!friendId) return;
      navigation.navigate('FriendProfile', {
        isMine: false,
        userId: friendId,
      });
    },
    [navigation],
  );

  return (
    <ScrollView
      style={styles.container}
      contentInsetAdjustmentBehavior="always"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
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
        linkLabel="Pogledaj sve"
        onLinkPress={() => navigation.navigate('Friends', { screen: 'FriendsList' })}
        refreshKey={refreshKey}
        skipNextHaptic={skipSliderHaptic}
        onClearSkip={() => setSkipSliderHaptic(false)}
      />

      <RoomSuggestions refreshKey={refreshKey} onRoomPress={(room) => console.log('Open room', room?.name)} />

      <SuggestionGrid refreshKey={refreshKey} onCardPress={handleGridCardPress} />
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
      paddingHorizontal: 0,
      color: colors.text_secondary,
    },
  });
