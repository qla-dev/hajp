import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { fetchRooms, fetchUserRooms } from '../api';

const TAB_MY_ROOMS = 'my';
const TAB_MEMBER_ROOMS = 'member';

export default function UserRoomsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState(TAB_MY_ROOMS);
  const [ownedRooms, setOwnedRooms] = useState([]);
  const [memberRooms, setMemberRooms] = useState([]);
  const [loadingOwned, setLoadingOwned] = useState(true);
  const [loadingMember, setLoadingMember] = useState(true);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const loadOwnedRooms = useCallback(async () => {
    setLoadingOwned(true);
    try {
      const { data } = await fetchUserRooms();
      setOwnedRooms(data?.rooms || []);
    } catch (error) {
      console.error('Error loading your rooms:', error);
      setOwnedRooms([]);
    } finally {
      setLoadingOwned(false);
    }
  }, []);

  const loadMemberRooms = useCallback(async () => {
    setLoadingMember(true);
    try {
      const { data } = await fetchRooms();
      setMemberRooms(data || []);
    } catch (error) {
      console.error('Error loading member rooms:', error);
      setMemberRooms([]);
    } finally {
      setLoadingMember(false);
    }
  }, []);

  useEffect(() => {
    loadOwnedRooms();
    loadMemberRooms();
  }, [loadOwnedRooms, loadMemberRooms]);

  const renderedRooms = useMemo(
    () => (activeTab === TAB_MY_ROOMS ? ownedRooms : memberRooms),
    [activeTab, ownedRooms, memberRooms],
  );

  const loading = activeTab === TAB_MY_ROOMS ? loadingOwned : loadingMember;
  const onRefresh = activeTab === TAB_MY_ROOMS ? loadOwnedRooms : loadMemberRooms;

  const renderRoom = ({ item }) => (
    <TouchableOpacity
      style={styles.roomCard}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('Rank', {
          screen: 'Ranking',
          params: { roomId: item.id, roomName: item.name },
        })
      }
    >
      <Text style={styles.roomName}>{item.name}</Text>
      {!!item.tagline && <Text style={styles.roomTagline}>{item.tagline}</Text>}
      <Text style={styles.roomMeta}>
        {item.is_private ? 'Privatna' : 'Javna'} - {(item.members ?? item.members_count ?? 0)} clanova
      </Text>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    loading ? (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Ucitavanje</Text>
      </View>
    ) : (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Nema soba</Text>
        <Text style={styles.emptySubtitle}>Jos nema soba u ovoj kategoriji. Pokusaj ponovo kasnije.</Text>
      </View>
    )
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {[TAB_MY_ROOMS, TAB_MEMBER_ROOMS].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
            disabled={activeTab === tab}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === TAB_MY_ROOMS ? 'Moje sobe' : 'Sobe gdje sam clan'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={renderedRooms}
        keyExtractor={(item, index) => String(item.id ?? item.name ?? index)}
        renderItem={renderRoom}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    tabs: {
      flexDirection: 'row',
      padding: 16,
      paddingTop: 100,
      gap: 10,
    },
    tabButton: {
      flex: 1,
      backgroundColor: colors.surface,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    tabButtonActive: {
      borderColor: colors.primary,
      backgroundColor: isDark ? 'rgba(255, 107, 53, 0.12)' : '#eef2ff',
    },
    tabText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text_secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.2,
    },
    tabTextActive: {
      color: colors.primary,
    },
    list: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    roomCard: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    roomName: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text_primary,
      marginBottom: 4,
    },
    roomTagline: {
      fontSize: 13,
      color: colors.text_secondary,
      marginBottom: 6,
    },
    roomMeta: {
      fontSize: 12,
      color: colors.text_secondary,
    },
    loader: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    loadingText: {
      color: colors.text_secondary,
      fontSize: 16,
      marginTop: 8,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text_primary,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.text_secondary,
      textAlign: 'center',
    },
  });
