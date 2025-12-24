import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { fetchFriends, fetchFriendRequests, approveFriendRequest, inviteToRoom } from '../api';
import FriendListItem from '../components/FriendListItem';

export default function FriendsScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [approvingFriendId, setApprovingFriendId] = useState(null);
  const [invitingFriendId, setInvitingFriendId] = useState(null);
  const mode = route?.params?.mode || 'friends';
  const roomId = route?.params?.roomId || null;
  const isRequestList = mode === 'requests';
  const isGroupInvite = mode === 'group-invite';

  const loadFriends = useCallback(async () => {
    setLoading(true);
    try {
      const fetcher = isRequestList ? fetchFriendRequests : fetchFriends;
      const { data } = await fetcher(roomId);
      setFriends(data?.data || data || []);
    } catch {
      setFriends([]);
    } finally {
      setLoading(false);
    }
  }, [isRequestList, roomId]);

  const handleApprove = useCallback(
    async (friendId) => {
      if (!friendId) return;
      setApprovingFriendId(friendId);
      try {
        await approveFriendRequest(friendId);
        await loadFriends();
      } catch {
        // ignore
      } finally {
        setApprovingFriendId(null);
      }
    },
    [loadFriends],
  );

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  const filteredFriends = friends.filter((item) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    const name = (item.name || '').toLowerCase();
    const username = (item.username || '').toLowerCase();
    return name.includes(query) || username.includes(query);
  });

  const formatStatusDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}.${month}.${year}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Pretraga"
          placeholderTextColor={colors.text_secondary}
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <FlatList
          data={filteredFriends}
          keyExtractor={(item, index) => String(item.id || item.username || item.name || index)}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadFriends}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={() => null}
          contentContainerStyle={styles.listContent}
        />
      ) : filteredFriends.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>
            {isRequestList ? 'Nema zahtjeva za povezivanje' : 'Još nemaš prijatelja'}
          </Text>
          <Text style={styles.emptySubtext}>
            {isRequestList
              ? 'Osvježi listu da proveriš nove zahtjeve.'
              : isGroupInvite
              ? 'Pozovi prijatelje da uđu u ovu sobu.'
              : 'Poveži se sa preporukama na ekranu Mreža.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredFriends}
          keyExtractor={(item, index) => String(item.id || item.username || item.name || index)}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadFriends}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => {
            const subtitle = item.title || item.headline || item.bio || '';
            const connectedAt = item.connected_at || item.created_at || null;
            const friendId = item.friend_id || item.id;
            const statusDate = formatStatusDate(connectedAt);
            const statusLabel = statusDate
              ? `${isRequestList ? 'Zahtjev poslan' : 'Povezano'} ${statusDate}`
              : null;
            const username = item.username ? `@${item.username}` : null;
            const fromProfile = route?.params?.fromProfile;

            const handlePress =
              !isGroupInvite &&
              (() => {
                if (fromProfile) {
                  navigation.navigate('ProfileFriends', { isMine: false, userId: friendId });
                } else {
                  navigation.navigate('FriendProfile', {
                    isMine: false,
                    userId: friendId,
                  });
                }
              });

            const handleInvite = async () => {
              if (!roomId || !friendId) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
              setInvitingFriendId(friendId);
              try {
                const response = await inviteToRoom(roomId, friendId);
                const payload = response?.data || {};
                const acceptedFlag = typeof payload.accepted !== 'undefined' ? payload.accepted : null;
                const status = payload.status || '';
                const isPending = acceptedFlag === 0 || status === 'invited' || status === 'requested';
                const title = isPending ? 'Zahtjev poslan' : 'U sobi';
                const body = isPending
                  ? 'Poziv je poslan, korisnik će prihvatiti kada bude spreman.'
                  : 'Korisnik je dodan u sobu.';
                Alert.alert(title, body);
                await loadFriends();
              } catch (error) {
                const message = error?.response?.data?.message || 'Nije moguće poslati poziv.';
                Alert.alert('Greška', message);
              } finally {
                setInvitingFriendId(null);
              }
            };

            return (
              <FriendListItem
                friend={item}
                accepted={item.accepted}
                subtitle={subtitle}
                username={username}
                statusLabel={statusLabel}
                isRequestList={isRequestList}
                isInviteMode={isGroupInvite}
                isMember={Boolean(item.is_member)}
                approving={approvingFriendId === friendId}
                inviting={invitingFriendId === friendId}
                onPress={handlePress}
                onApprove={isRequestList ? () => handleApprove(friendId) : undefined}
                onInvite={isGroupInvite && !item.is_member ? handleInvite : undefined}
              />
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 10,
      paddingHorizontal: 16,
      paddingBottom: 4,
    },
    listContent: {
      paddingTop: 8,
      paddingBottom: 16,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 100,
      paddingBottom: 8,
    },
    searchInput: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: colors.text_primary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text_primary,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.text_secondary,
      textAlign: 'center',
    },
  });


