import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import {
  fetchFriends,
  fetchUserFriends,
  fetchFriendRequests,
  approveFriendRequest,
  fetchBlockedFriends,
  unblockUser,
  inviteToRoom,
  acceptRoomInvite,
  approveRoomMember,
} from '../api';
import FriendListItem from '../components/FriendListItem';
import { useRoomSheet } from '../context/roomSheetContext';
import { Audio } from 'expo-av';
const connectSoundAsset = require('../../assets/sounds/connect.mp3');

export default function FriendsScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { openRoomSheet } = useRoomSheet();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [approvingFriendId, setApprovingFriendId] = useState(null);
  const [invitingFriendId, setInvitingFriendId] = useState(null);
  const [unblockingId, setUnblockingId] = useState(null);
  const mode = route?.params?.mode || 'friends';
  const roomId = route?.params?.roomId || null;
  const targetUserId = route?.params?.userId || null;
  const fromProfile = route?.params?.fromProfile;
  const isRequestList = mode === 'requests';
  const isGroupInvite = mode === 'group-invite';
  const isBlockedList = mode === 'blocked';
  const connectSoundRef = React.useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(connectSoundAsset, { shouldPlay: false });
        if (mounted) connectSoundRef.current = sound;
        else await sound.unloadAsync();
      } catch {
        // ignore load errors
      }
    })();
    return () => {
      mounted = false;
      connectSoundRef.current?.unloadAsync();
      connectSoundRef.current = null;
    };
  }, []);

  const loadFriends = useCallback(async () => {
    console.log('[FriendsScreen] loadFriends start', {
      mode,
      isRequestList,
      isGroupInvite,
      roomId,
      targetUserId,
      fromProfile,
    });
    setLoading(true);
    try {
      let response;
      if (isRequestList) {
        response = await fetchFriendRequests();
      } else if (isBlockedList) {
        response = await fetchBlockedFriends();
      } else if (targetUserId && !isGroupInvite) {
        response = await fetchUserFriends(targetUserId);
      } else {
        response = await fetchFriends(roomId);
      }
      const data = response?.data;
      setFriends(data?.data || data || []);
      console.log('[FriendsScreen] loadFriends success', {
        count: (data?.data || data || []).length,
        keys: data ? Object.keys(data) : null,
      });
    } catch (err) {
      console.log('[FriendsScreen] loadFriends error', err?.message || err);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  }, [isRequestList, roomId, targetUserId, isGroupInvite, fromProfile, mode]);

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
            {isRequestList
              ? 'Nema zahtjeva za povezivanje'
              : isBlockedList
              ? 'Nema blokiranih korisnika'
              : 'Još nemaš prijatelja'}
          </Text>
          <Text style={styles.emptySubtext}>
            {isRequestList
              ? 'Osvježi listu da proveriš nove zahtjeve.'
              : isBlockedList
              ? 'Blokiraj korisnike sa njihovog profila pa će se pojaviti ovde.'
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
            const refType = item.ref_type || null;
            const subtitle = item.title || item.headline || item.bio || '';
            const connectedAt = item.connected_at || item.created_at || null;
            const friendId = item.friend_id || item.id;
            const approveTargetId =
              refType === 'friendship' && item.user_id ? item.user_id : friendId;
            const statusDate = formatStatusDate(connectedAt);
            const statusLabel = statusDate
              ? `${isRequestList ? 'Zahtjev poslan' : 'Povezano'} ${statusDate}`
              : null;
            const username = item.username ? `@${item.username}` : null;
            const fromProfile = route?.params?.fromProfile;
            const profileRouteName = route?.params?.profileRouteName || 'ProfileFriends';

            const doUnblock = async () => {
              if (!friendId) return;
              setUnblockingId(friendId);
              try {
                await unblockUser(friendId);
                await loadFriends();
                Alert.alert('Odblokirano', 'Korisnik je uklonjen sa blok liste.');
              } catch {
                Alert.alert('Greška', 'Nije moguće odblokirati korisnika.');
              } finally {
                setUnblockingId(null);
              }
            };

            const handleUnblock = () => {
              Haptics.selectionAsync().catch(() => {});
              Alert.alert('Odblokiraj korisnika?', 'Ponovo će moći da te kontaktira.', [
                { text: 'Otkaži', style: 'cancel' },
                { text: 'Odblokiraj', style: 'destructive', onPress: doUnblock },
              ]);
            };

            if (isBlockedList) {
              const actionNode = (
                <TouchableOpacity
                  style={styles.unblockButton}
                  onPress={handleUnblock}
                  disabled={unblockingId === friendId}
                >
                  {unblockingId === friendId ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={styles.unblockButtonText}>Odblokiraj</Text>
                  )}
                </TouchableOpacity>
              );

              return (
                <FriendListItem
                  friend={item}
                  refType="blocked"
                  username={username}
                  statusLabel={statusLabel || 'Blokiran'}
                  hideStatus
                  renderAction={actionNode}
                />
              );
            }

            const handlePress =
              !isGroupInvite &&
              (() => {
                Haptics.selectionAsync().catch(() => {});
                if (refType === 'my-room-allowence') {
                  navigation.navigate('FriendProfile', { isMine: false, userId: item.user_id });
                  return;
                }
                if (refType === 'room-invite') {
                  const roomPayload = {
                    id: item.id,
                    name: item.room_name || item.name,
                    cover_url: item.profile_photo,
                    type: item.room_icon,
                  };
                  openRoomSheet(
                    roomPayload,
                    null,
                    null,
                    1,
                    () => setFriends((prev) => prev.filter((f) => f.ref_id !== item.ref_id)),
                  );
                  return;
                }
                if (fromProfile) {
                  navigation.navigate(profileRouteName, { isMine: false, userId: friendId });
                  return;
                }
                navigation.navigate('FriendProfile', {
                  isMine: false,
                  userId: friendId,
                });
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
                setFriends((prev) =>
                  prev.map((f) => {
                    if ((f.friend_id || f.id) === friendId) {
                      return {
                        ...f,
                        is_member: true,
                        accepted: isPending ? 0 : 1,
                      };
                    }
                    return f;
                  }),
                );
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
                refType={refType}
                subtitle={subtitle}
                username={username}
                statusLabel={statusLabel}
                isRequestList={isRequestList}
                isInviteMode={isGroupInvite}
                isMember={Boolean(item.is_member)}
                approving={approvingFriendId === friendId}
                inviting={invitingFriendId === friendId}
                onPress={handlePress}
                onApprove={
                  isRequestList
                    ? async () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                        if (refType === 'room-invite') {
                          try {
                            connectSoundRef.current?.replayAsync().catch(() => {});
                            const { data } = await acceptRoomInvite(item.id);
                            const roomName = item.room_name || '';
                            Alert.alert(
                              'Dobrodošao u grupu!',
                              data?.message || `Uspješno si prihvatio poziv za grupu ${roomName}.`,
                            );
                            setFriends((prev) => prev.filter((f) => f.ref_id !== item.ref_id));
                          } catch {
                            Alert.alert('Greška', 'Nije moguće prihvatiti poziv.');
                          }
                        } else if (refType === 'my-room-allowence') {
                          try {
                            connectSoundRef.current?.replayAsync().catch(() => {});
                            const { data } = await approveRoomMember(item.id, item.user_id);
                            Alert.alert(
                              'Član odobren',
                              data?.message || `Korisnik ${item.name || ''} je odobren, vidjet će sobu čim uđe.`,
                            );
                            setFriends((prev) => prev.filter((f) => f.ref_id !== item.ref_id));
                          } catch {
                            Alert.alert('Greška', 'Nije moguće odobriti pristup.');
                          }
                        } else {
                          try {
                            connectSoundRef.current?.replayAsync().catch(() => {});
                            const { data } = await approveFriendRequest(approveTargetId);
                            const name = item.name || item.username || 'korisnikom';
                            Alert.alert(
                              'Povezivanje uspjelo',
                              data?.message || `Sada ste povezani sa korisnikom ${name}.`,
                            );
                            setFriends((prev) => prev.filter((f) => f.ref_id !== item.ref_id));
                          } catch (error) {
                            const message = error?.response?.data?.message || 'Nije moguće prihvatiti zahtjev.';
                            Alert.alert('Greška', message);
                          }
                        }
                      }
                    : undefined
                }
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
    unblockButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    unblockButtonText: {
      color: colors.primary,
      fontWeight: '700',
    },
  });



