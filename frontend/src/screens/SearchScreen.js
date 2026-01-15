import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import FriendListItem from '../components/FriendListItem';
import { searchSocial } from '../api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SEARCH_DELAY_MS = 2000;

export default function SearchScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performSearch = useCallback(
    async (searchTerm) => {
      if (!searchTerm) {
        setResults([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await searchSocial(searchTerm, { limit: 40 });
        const entries = response?.data?.data || response?.data || [];
        const normalized = entries.map((entry) => ({
          ...entry,
          type: entry.type || (entry.username ? 'user' : 'group'),
          id: entry.id,
        }));
        setResults(normalized.map((entry) => {
          const friend = {
            id: entry.id,
            name: entry.name,
            username: entry.username,
            profile_photo: entry.profile_photo || entry.cover_url,
            avatar: entry.avatar,
          };
          const subtitle =
            entry.type === 'group'
              ? entry.subtitle || entry.description || 'Grupa'
              : entry.description || entry.username || null;
          return {
            id: `${entry.type}-${entry.id}`,
            type: entry.type,
            friend,
            subtitle,
            refType: entry.type === 'group' ? 'room-invite' : 'friendship',
            statusLabel: entry.type === 'group' ? 'Grupa' : 'Korisnik',
          };
        }));
      } catch (err) {
        setError(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      performSearch(query.trim());
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleCancel = () => {
    navigation.goBack();
  };

  const recentLabel = useMemo(() => (results.length ? 'Rezultati' : 'Nema rezultata'), [results.length]);

  const headerOffset = insets.top + 64;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: headerOffset },
      ]}
    >
      <View style={styles.searchBarRow}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search-outline" size={18} color={colors.text_secondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text_primary }]}
            placeholder="Pretraživanje"
            placeholderTextColor={colors.text_secondary}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={[styles.cancelText, { color: colors.primary }]}>Odustani</Text>
        </TouchableOpacity>
      </View>
      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
      <Text style={styles.sectionLabel}>{recentLabel}</Text>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <FriendListItem
            friend={item.friend}
            subtitle={item.subtitle}
            refType={item.refType}
            statusLabel={item.statusLabel}
            onPress={() => {
              if (item.type === 'user') {
                navigation.navigate('FriendProfile', {
                  userId: item.friend.id,
                  isMine: false,
                });
              }
            }}
            isLast={index === results.length - 1}
          />
        )}
        contentContainerStyle={styles.resultsList}
        ListEmptyComponent={
          !loading && query.trim().length > 0 ? (
            <Text style={styles.emptyText}>Nema rezultata za "{query.trim()}"</Text>
          ) : null
        }
      />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 0,
    },
    searchBarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    searchInputWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 18,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 16,
    },
    cancelText: {
      fontSize: 16,
      fontWeight: '600',
    },
    sectionLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text_primary,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    resultsList: {
      paddingBottom: 16,
      paddingHorizontal: 16,
    },
    loadingRow: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    emptyText: {
      paddingHorizontal: 16,
      color: colors.text_secondary,
      fontSize: 14,
    },
  });
