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
import { useRoomSheet } from '../context/roomSheetContext';

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
  const { openRoomSheet } = useRoomSheet();

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
    if (activeTab === TAB_MY_ROOMS) {
      loadOwnedRooms();
    } else {
      loadMemberRooms();
    }
  }, [activeTab, loadOwnedRooms, loadMemberRooms]);

  const renderedRooms = useMemo(
    () => (activeTab === TAB_MY_ROOMS ? ownedRooms : memberRooms),
    [activeTab, ownedRooms, memberRooms],
  );

  const loading = activeTab === TAB_MY_ROOMS ? loadingOwned : loadingMember;
  const onRefresh = activeTab === TAB_MY_ROOMS ? loadOwnedRooms : loadMemberRooms;

  const handleRoomPress = useCallback(
    (room) => {
      openRoomSheet(room);
    },
    [openRoomSheet],
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Učitavanje</Text>
        </View>
      );
    }

    return (
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
    );
  };
  const renderRoom = ({ item }) => (
    <TouchableOpacity
      style={styles.roomCard}
      activeOpacity={0.8}
      onPress={() => handleRoomPress(item)}
    >
      <Text style={styles.roomName}>{item.name}</Text>
      {!!item.tagline && <Text style={styles.roomTagline}>{item.tagline}</Text>}
      <Text style={styles.roomMeta}>
        {item.is_private ? 'Privatna' : 'Javna'} - {(item.members ?? item.members_count ?? 0)} clanova
      </Text>
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    if (loading) {
      return null;
    }
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Nema soba</Text>
        <Text style={styles.emptySubtitle}>Jos nema soba u ovoj kategoriji. Pokusaj ponovo kasnije.</Text>
      </View>
    );
  };

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
              {tab === TAB_MY_ROOMS ? 'Sobe gdje sam admin' : 'Sobe gdje sam član'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderContent()}
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
      textAlign: 'center',
    },
    tabButtonActive: {
      borderColor: colors.primary,
      backgroundColor: isDark ? 'rgba(255, 107, 53, 0.12)' : '#eef2ff',
    },
    tabText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text_secondary,
      letterSpacing: 0.2,
      textAlign: 'center',
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
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
  });
