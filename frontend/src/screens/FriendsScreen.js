import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { fetchFriends } from '../api';

export default function FriendsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const loadFriends = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchFriends();
      setFriends(data?.data || data || []);
    } catch {
      setFriends([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const renderAvatar = (item) => {
    if (item.profile_photo) {
      return <Image source={{ uri: item.profile_photo }} style={styles.avatar} />;
    }
    const label = item.name || item.username || 'Korisnik';
    const initials = label
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
    return (
      <View style={[styles.avatar, styles.avatarFallback]}>
        <Text style={styles.avatarFallbackText}>{initials}</Text>
      </View>
    );
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
          <Text style={styles.emptyText}>Još nemaš prijatelja</Text>
          <Text style={styles.emptySubtext}>Poveži se sa preporukama na ekranu Mreža.</Text>
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
            const name = item.name || item.username || 'Korisnik';
            const subtitle = item.title || item.headline || item.bio || '';
            const connectedAt = item.connected_at || item.created_at || null;
            const friendId = item.friend_id || item.id;

            return (
              <TouchableOpacity
                style={styles.row}
                onPress={() =>
                  navigation.navigate('Profile', {
                    screen: 'ProfileFriends',
                    params: { isMine: false, userId: friendId },
                  })
                }
              >
                {renderAvatar(item)}
                <View style={styles.info}>
                  <Text style={styles.name}>{name}</Text>
                  {item.username ? <Text style={styles.subtitle}>@{item.username}</Text> : null}
                  {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                  {connectedAt ? <Text style={styles.meta}>Povezano {connectedAt}</Text> : null}
                </View>
                <TouchableOpacity style={styles.messageButton}>
                  <Text style={styles.messageIcon}>✉</Text>
                </TouchableOpacity>
              </TouchableOpacity>
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
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      gap: 12,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.secondary,
    },
    info: {
      flex: 1,
      gap: 2,
    },
    name: {
      fontWeight: '800',
      color: colors.text_primary,
    },
    subtitle: {
      color: colors.text_secondary,
    },
    meta: {
      color: colors.text_secondary,
      fontSize: 12,
    },
    messageButton: {
      padding: 8,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    messageIcon: {
      fontSize: 16,
      color: colors.text_secondary,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
    },
    avatarFallback: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarFallbackText: {
      color: colors.textLight,
      fontWeight: '800',
      fontSize: 18,
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
