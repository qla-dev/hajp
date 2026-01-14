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
import { fetchFriendActivities } from '../api';
import ActivityItem from '../components/ActivityItem';
import EmptyState from '../components/EmptyState';
import StoriesSlider from '../components/StoriesSlider';

const PAGE_LIMIT = 10;

export default function LiveScreen({ navigation }) {
  const [activities, setActivities] = useState([]);
  const [activityPage, setActivityPage] = useState(1);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingMoreActivities, setLoadingMoreActivities] = useState(false);
  const [hasMoreActivities, setHasMoreActivities] = useState(true);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const listRef = useRef(null);

  const resolvePagination = (meta, payload) => {
    const hasMore =
      typeof meta?.has_more === 'boolean'
        ? meta.has_more
        : typeof meta?.hasMore === 'boolean'
        ? meta?.hasMore
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

  useEffect(() => {
    loadActivities(1);
  }, [loadActivities]);

  const handleLoadMore = () => {
    if (loadingActivities || loadingMoreActivities || !hasMoreActivities) return;
    loadActivities(activityPage + 1, true);
  };

  const renderActivityEmpty = () => (
    <EmptyState
      title="Još uvijek nema aktivnosti"
      subtitle="Aktivnosti će se pojaviti čim se nešto dogodi."
      onRefresh={() => loadActivities(1)}
      refreshing={loadingActivities}
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

  return (
    <View style={styles.container2}>
      <StoriesSlider title="Priče" showHeader topPadding={100} />
      {loadingActivities && !activities.length ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Učitavanje</Text>
        </View>
      ) : !activities.length ? (
        renderActivityEmpty()
      ) : (
        renderActivities()
      )}
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
