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
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';

/* =========================
   MOCK DATA
========================= */
const MOCK_BADGES = [
  {
    id: 'creator',
    title: 'Creator',
    badges: [
      { id: 'creator-1', title: 'Creator', unlocked: false },
    ],
  },
  {
    id: 'newcomer',
    title: 'Newcomer',
    badges: [
      { id: 'rookie', title: 'Rookie', unlocked: false },
    ],
  },
  {
    id: 'community',
    title: 'Community',
    badges: [
      { id: 'bonus', title: 'Bonus Challenge', unlocked: false },
      { id: 'profile', title: 'Complete profile', unlocked: false },
      { id: 'login', title: 'Log in Champ', unlocked: true },
      { id: 'like', title: 'Appreciator', unlocked: false },
    ],
  },
  {
    id: 'challenge',
    title: 'Challenge',
    badges: [
      { id: 'challenge-1', title: 'First Challenge', unlocked: false },
    ],
  },
];

export default function BadgesScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);

  const loadBadges = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) {
      setLoading(true);
    }
    try {
      await new Promise((r) => setTimeout(r, 300));
      setCategories(MOCK_BADGES);
    } finally {
      setLoading(false);
      if (isRefreshing) {
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadBadges();
  }, [loadBadges]);

  const filtered = categories
    .map((cat) => ({
      ...cat,
      badges: cat.badges.filter((b) =>
        b.title.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.badges.length > 0);

  const renderBadge = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.badgeCard,
        !item.unlocked && styles.badgeLocked,
      ]}
      onPress={() => Haptics.selectionAsync().catch(() => {})}
      activeOpacity={0.85}
    >
      <Ionicons
        name="ribbon-outline"
        size={44}
        color={item.unlocked ? colors.primary : colors.text_secondary}
      />
      <Text
        style={[
          styles.badgeTitle,
          !item.unlocked && styles.badgeTitleLocked,
        ]}
        numberOfLines={2}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => (
    <View style={styles.categoryBlock}>
      <Text style={styles.categoryTitle}>{item.title}</Text>

      <FlatList
        data={item.badges}
        keyExtractor={(b) => b.id}
        renderItem={renderBadge}
        numColumns={3}
        columnWrapperStyle={styles.badgeRow}
        scrollEnabled={false}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* SEARCH */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Pretraga medalja"
          placeholderTextColor={colors.text_secondary}
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadBadges(true);
              }}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

/* =========================
   STYLES
========================= */
const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },

    searchRow: {
      paddingTop: 100,
      paddingBottom: 8,
      paddingHorizontal: 16,
    },

    searchInput: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: colors.text_primary,
      borderWidth: 1,
      borderColor: colors.border,
    },

    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    categoryBlock: {
      marginBottom: 28,
    },

    categoryTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text_primary,
      marginBottom: 14,
      alignSelf: 'center',
      textDecorationLine: 'underline',
      textDecorationColor: colors.primary,
    },

    badgeRow: {
      justifyContent: 'space-between',
      marginBottom: 16,
    },

    badgeCard: {
      width: '31%',
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },

    badgeLocked: {
      opacity: 0.45,
    },

    badgeTitle: {
      marginTop: 8,
      fontSize: 13,
      fontWeight: '700',
      color: colors.text_primary,
      textAlign: 'center',
    },

    badgeTitleLocked: {
      color: colors.text_secondary,
    },
  });