import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { fetchFriendActivities } from '../api';
import { useMenuRefresh } from '../context/menuRefreshContext';
import RankRoomsScreen from './RankRoomsScreen';
import ActivityItem from '../components/ActivityItem';
import MenuTab from '../components/MenuTab';

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
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const loadActivities = useCallback(
    async (page = 1, append = false) => {
      if (append) {
        setLoadingMoreActivities(true);
      } else {
        setLoadingActivities(true);
        setHasMoreActivities(true);
      }
      try {
        const response = await fetchFriendActivities(page, PAGE_LIMIT);
        const { data, meta } = response.data;
        setActivities((prev) => (append ? [...prev, ...data] : data));
        setActivityPage(page);
        setHasMoreActivities(meta?.has_more ?? false);
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
    if (activeTab === TAB_ACTIVITY) {
      loadActivities(1);
    }
  }, [activeTab, loadActivities]);

  const { registerMenuRefresh } = useMenuRefresh();
  useEffect(() => {
    const unsubscribe = registerMenuRefresh('Rank', () => {
      if (activeTab === TAB_ACTIVITY) {
        loadActivities(1);
      }
    });
    return unsubscribe;
  }, [activeTab, loadActivities, registerMenuRefresh]);

  const handleLoadMore = () => {
    if (!hasMoreActivities || loadingMoreActivities || loadingActivities) return;
    loadActivities(activityPage + 1, true);
  };

  const renderContent = () => {
    if (activeTab === TAB_RANK) {
      return (
        <View style={styles.rankWrapper}>
          <RankRoomsScreen navigation={navigation} />
        </View>
      );
    }

    if (loadingActivities) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Učitavanje</Text>
        </View>
      );
    }

    if (!activities.length) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>Još uvijek nema aktivnosti</Text>
          <Text style={styles.emptySubtext}>Aktivnost će se pojaviti čim se nešto dogodi.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={activities}
        keyExtractor={(item, idx) => `${item.id || idx}-${idx}`}
        renderItem={({ item, index }) => (
          <ActivityItem
            activity={item}
            isLast={index === activities.length - 1}
            navigation={navigation}
          />
        )}
        contentContainerStyle={styles.messagesList}
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
  };

  return (
    <View style={styles.container}>
      <MenuTab
        items={[
          { key: TAB_ACTIVITY, label: 'Aktivnosti' },
          { key: TAB_RANK, label: 'Rank' },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
        topPadding={100}
        horizontalPadding={16}
        variant="menu-tab-s"
        color="secondary"
      />

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
    rankWrapper: {
      flex: 1,
    },
    messagesList: {
      paddingHorizontal: 16,
      paddingBottom: 16,
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
