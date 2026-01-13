import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import {
  baseURL,
  fetchFriendActivities,
  fetchUserRooms,
  fetchUserStories,
} from '../api';
import { useMenuRefresh } from '../context/menuRefreshContext';
import ActivityItem from '../components/ActivityItem';
import RoomCard from '../components/RoomCard';
import MenuTab from '../components/MenuTab';
import EmptyState from '../components/EmptyState';
import StoriesSlider from '../components/StoriesSlider';
import StoriesViewer from '../components/StoriesViewer';

const TAB_ACTIVITY = 'activity';
const TAB_RANK = 'rank';
const PAGE_LIMIT = 10;

export default function LiveScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState(TAB_ACTIVITY);
  const [activities, setActivities] = useState([]);
  const [activityPage, setActivityPage] = useState(1);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingMoreActivities, setLoadingMoreActivities] = useState(false);
  const [hasMoreActivities, setHasMoreActivities] = useState(true);

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const listRef = useRef(null);
  const roomsListRef = useRef(null);
  const [storyUsers, setStoryUsers] = useState([]);
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [storyViewerStories, setStoryViewerStories] = useState([]);
  const [storyViewerUserIndex, setStoryViewerUserIndex] = useState(0);
  const [storyViewerUserName, setStoryViewerUserName] = useState('');
  const storyCacheRef = useRef({});

  const resolvePagination = (meta, payload) => {
    const hasMore =
      typeof meta?.has_more === 'boolean'
        ? meta.has_more
        : typeof meta?.hasMore === 'boolean'
        ? meta.hasMore
        : typeof meta?.next_page_url === 'string'
        ? Boolean(meta.next_page_url)
        : payload.length >= PAGE_LIMIT;
    return hasMore;
  };

  const loadActivities = useCallback(
    async (page = 1, append = false) => {
      if (append) {
        setLoadingMoreActivities(true);
      } else {
        setLoadingActivities(true);
        setHasMoreActivities(true);
      }

      try {
        const { data } = await fetchFriendActivities(page, PAGE_LIMIT);
        const payload = data?.data || data || [];
        const meta = data?.meta || data?.pagination || data?.paging || {};
        setActivities((prev) => (append ? [...prev, ...payload] : payload));
        setActivityPage(page);
        setHasMoreActivities(resolvePagination(meta, payload));
      } catch (error) {
        if (!append) {
          setActivities([]);
          setHasMoreActivities(false);
        }
        console.error('Greška pri učitavanju aktivnosti:', error);
      } finally {
        if (append) {
          setLoadingMoreActivities(false);
        } else {
          setLoadingActivities(false);
        }
      }
    },
    [],
  );

  const loadRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      const { data } = await fetchUserRooms('user');
      const list = data?.rooms || data?.data || data || [];
      setRooms(list);
    } catch (error) {
      console.error('Greška pri učitavanju rank soba:', error);
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === TAB_ACTIVITY) {
      loadActivities(1);
    } else {
      loadRooms();
    }
  }, [activeTab, loadActivities, loadRooms]);

  const { registerMenuRefresh } = useMenuRefresh();
  const handleLoadMore = () => {
    if (loadingActivities || loadingMoreActivities || !hasMoreActivities) return;
    loadActivities(activityPage + 1, true);
  };

  const scrollToTop = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    try {
      list.scrollToOffset({ offset: 0, animated: true });
    } catch {
      list.scrollToOffset?.({ offset: 0, animated: true });
    }
  }, []);

  const scrollRoomsToTop = useCallback(() => {
    const list = roomsListRef.current;
    if (!list) return;
    try {
      list.scrollToOffset({ offset: 0, animated: true });
    } catch {
      list.scrollToOffset?.({ offset: 0, animated: true });
    }
  }, []);

  useEffect(() => {
    let scheduled;
    const unsubscribe = registerMenuRefresh('Rank', () => {
      if (activeTab === TAB_ACTIVITY) {
        scrollToTop();
        if (scheduled) {
          clearTimeout(scheduled);
        }
        scheduled = setTimeout(() => {
          loadActivities(1);
          scheduled = null;
        }, 260);
        return;
      }

      scrollRoomsToTop();
      if (scheduled) {
        clearTimeout(scheduled);
      }
      scheduled = setTimeout(() => {
        loadRooms();
        scheduled = null;
      }, 260);
    });

    return () => {
      if (scheduled) {
        clearTimeout(scheduled);
      }
      unsubscribe();
    };
  }, [activeTab, loadActivities, loadRooms, registerMenuRefresh, scrollToTop, scrollRoomsToTop]);

  const normalizeStory = useCallback(
    (story) => {
      const mediaUrl = story?.media_url;
      const absolute =
        mediaUrl && mediaUrl.startsWith('http')
          ? mediaUrl
          : mediaUrl && mediaUrl.startsWith('/')
          ? `${baseURL}${mediaUrl}`
          : mediaUrl;
      return {
        ...story,
        media_url: absolute,
      };
    },
    [baseURL],
  );

  const formatStories = useCallback(
    (stories) => {
      if (!Array.isArray(stories)) return [];
      return stories.map(normalizeStory);
    },
    [normalizeStory],
  );

  const loadStoriesForUser = useCallback(
    async (user, index) => {
      if (!user?.id) return;
      const userId = user.id;
      const cached = storyCacheRef.current[userId];
      if (cached && cached.length) {
        setStoryViewerStories(cached);
        setStoryViewerUserIndex(index);
        setStoryViewerUserName(user.name || user.username || '');
        setStoryViewerVisible(true);
        return;
      }

      try {
        const { data } = await fetchUserStories(userId);
        const payload = data?.data || [];
        const normalized = formatStories(payload);
        storyCacheRef.current[userId] = normalized;
        if (!normalized.length) {
          setStoryViewerVisible(false);
          return;
        }
        setStoryViewerStories(normalized);
        setStoryViewerUserIndex(index);
        setStoryViewerUserName(user.name || user.username || '');
        setStoryViewerVisible(true);
      } catch (error) {
        console.error('Failed to load stories for user', error);
      }
    },
    [formatStories],
  );

  const handleStoryUsersLoaded = useCallback((users) => {
    setStoryUsers(Array.isArray(users) ? users : []);
  }, []);

  const handleStoryUserPress = useCallback(
    (user, index) => {
      loadStoriesForUser(user, index);
    },
    [loadStoriesForUser],
  );

  const handleAdvanceToNextUser = useCallback(() => {
    const nextIndex = storyViewerUserIndex + 1;
    const nextUser = storyUsers[nextIndex];
    if (!nextUser) {
      setStoryViewerVisible(false);
      return false;
    }
    loadStoriesForUser(nextUser, nextIndex);
    return true;
  }, [loadStoriesForUser, storyUsers, storyViewerUserIndex]);

  const renderActivityEmpty = () => (
    <EmptyState
      title="Još uvijek nema aktivnosti"
      subtitle="Aktivnosti će se pojaviti čim se nešto dogodi."
      onRefresh={() => loadActivities(1)}
      refreshing={loadingActivities}
      fullWidth
    />
  );

  const renderRoomEmpty = () => (
    <EmptyState
      title="Još uvijek nema rank soba"
      subtitle="Pridruži se sobama i pratite rankove."
      onRefresh={loadRooms}
      refreshing={loadingRooms}
      fullWidth
    />
  );

  const renderActivities = () => (
    <FlatList
      ref={listRef}
      data={activities}
      keyExtractor={(item, idx) => `${item.id || idx}-${idx}`}
      renderItem={({ item, index }) => (
        <ActivityItem activity={item} isLast={index === activities.length - 1} navigation={navigation} />
      )}
      contentContainerStyle={[
        styles.messagesList,
        !activities.length && styles.flexGrow,
        !activities.length && styles.emptyHorizontalPadding,
      ]}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={loadingActivities}
          onRefresh={() => loadActivities(1)}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      ListFooterComponent={
        loadingMoreActivities ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
        ) : null
      }
    />
  );

  const renderRooms = () => (
    <FlatList
      ref={roomsListRef}
      data={rooms}
      keyExtractor={(item) => `${item.id}`}
      renderItem={({ item }) => (
        <RoomCard
          room={item}
          connectButtonHide={1}
          onPress={() => navigation.navigate('Ranking', { roomId: item.id, roomName: item.name })}
        />
      )}
      contentContainerStyle={[
        styles.messagesList,
        rooms.length === 0 && styles.flexGrow,
        rooms.length === 0 && styles.emptyHorizontalPadding,
      ]}
      refreshControl={
        <RefreshControl refreshing={loadingRooms} onRefresh={loadRooms} tintColor={colors.primary} colors={[colors.primary]} />
      }
      ListEmptyComponent={renderRoomEmpty}
    />
  );

  const renderContent = () => {
    if (activeTab === TAB_ACTIVITY) {
      if (loadingActivities && !activities.length) {
        return (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Učitavanje</Text>
          </View>
        );
      }
      if (!activities.length) {
        return renderActivityEmpty();
      }
      return renderActivities();
    }

    if (loadingRooms && !rooms.length) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Učitavanje</Text>
        </View>
      );
    }

    return renderRooms();
  };

  return (
    <View style={styles.container2}>
      <StoriesSlider
        title="Priče"
        showHeader
        onUserPress={handleStoryUserPress}
        onUsersLoaded={handleStoryUsersLoaded}
        topPadding={100}
      />
      <MenuTab
        items={[
          { key: TAB_ACTIVITY, label: 'Aktivnosti' },
          { key: TAB_RANK, label: 'Rank' },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
        topPadding={20}
        horizontalPadding={16}
        variant="menu-tab-s"
        color="secondary"
      />
      {renderContent()}
      <StoriesViewer
        visible={storyViewerVisible}
        stories={storyViewerStories}
        userName={storyViewerUserName}
        initialIndex={0}
        onClose={() => setStoryViewerVisible(false)}
        onAdvanceToNextUser={handleAdvanceToNextUser}
      />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container2: {
      flex: 1,
      paddingTop: 100,
      
    },
    messagesList: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    emptyHorizontalPadding: {
      paddingHorizontal: 0,
      paddingBottom: 0,
    },
    flexGrow: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    loadingText: {
      fontSize: 16,
      color: colors.text_secondary,
      marginTop: 12,
    },
  });
