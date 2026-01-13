import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import Avatar from './Avatar';
import { fetchStoryUsers } from '../api';

const ITEM_SIZE = 88;
const INNER_SIZE = 70;

export default function StoriesSlider({
  title = 'Priče',
  subtitle,
  showHeader = true,
  onUserPress,
  onActiveUserChange,
  onUsersLoaded,
  refreshKey,
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const loadStoryUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchStoryUsers({ limit: 20 });
      const payload = data?.data || [];
      setUsers(payload);
      onUsersLoaded?.(payload);
      if (payload.length) {
        setActiveIndex(0);
        onActiveUserChange?.(payload[0], 0);
      }
    } catch (error) {
      console.error('Failed to load story users', error);
      setUsers([]);
      onUsersLoaded?.([]);
    } finally {
      setLoading(false);
    }
  }, [onActiveUserChange, onUsersLoaded]);

  useEffect(() => {
    loadStoryUsers();
  }, [loadStoryUsers, refreshKey]);

  const handleUserPress = useCallback(
    (user, index) => {
      onUserPress?.(user, index);
    },
    [onUserPress],
  );

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }) => {
      const nextIndex = viewableItems[0]?.index;
      if (typeof nextIndex === 'number' && nextIndex !== activeIndex) {
        setActiveIndex(nextIndex);
        const nextUser = users[nextIndex];
        if (nextUser) {
          onActiveUserChange?.(nextUser, nextIndex);
        }
      }
    },
    [activeIndex, onActiveUserChange, users],
  );

  const renderPlaceholder = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Još nema priča</Text>
      <TouchableOpacity onPress={loadStoryUsers} style={styles.retryButton}>
        <Text style={styles.retryText}>Osvježi</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.item}
      key={item.id}
      activeOpacity={0.75}
      onPress={() => handleUserPress(item, index)}
    >
      <LinearGradient
        colors={[colors.primary, colors.secondary, colors.primary]}
        style={styles.ring}
        start={[0, 0]}
        end={[1, 1]}
      >
        <View style={styles.inner}>
          <Avatar
            user={item}
            variant="avatar-xs"
            size={56}
            mode="photo"
            storyEnabled={false}
          />
        </View>
      </LinearGradient>
      <Text style={styles.label} numberOfLines={1}>
        {item.name || item.username || 'Korisnik'}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !users.length) {
    return (
      <View style={styles.loaderRow}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View>
      {showHeader && (
        <View style={styles.headerRow}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      )}
      {users.length ? (
        <FlatList
          data={users}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.id}`}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      ) : (
        renderPlaceholder()
      )}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    headerRow: {
      paddingHorizontal: 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      color: colors.text_primary,
      fontSize: 16,
      fontWeight: '700',
    },
    subtitle: {
      color: colors.text_secondary,
    },
    list: {
      paddingLeft: 16,
      paddingBottom: 12,
      paddingRight: 8,
    },
    item: {
      alignItems: 'center',
      width: ITEM_SIZE,
      marginRight: 12,
    },
    ring: {
      width: INNER_SIZE + 18,
      height: INNER_SIZE + 18,
      borderRadius: (INNER_SIZE + 18) / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    inner: {
      width: INNER_SIZE,
      height: INNER_SIZE,
      borderRadius: INNER_SIZE / 2,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      color: colors.text_secondary,
      fontSize: 12,
      marginTop: 6,
      textAlign: 'center',
      width: ITEM_SIZE,
    },
    loaderRow: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    emptyState: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      alignItems: 'center',
    },
    emptyTitle: {
      color: colors.text_secondary,
      marginBottom: 8,
    },
    retryButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    retryText: {
      color: colors.primary,
      fontWeight: '700',
    },
  });
