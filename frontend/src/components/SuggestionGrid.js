import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { fetchFriendSuggestions, addFriend, baseURL } from '../api';

const GRID_COLUMNS = 2;

export default function SuggestionGrid({ title = 'Još preporuka', refreshKey }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchFriendSuggestions();
      setItems(data?.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems, refreshKey]);

  const handleConnect = async (item) => {
    if (!item?.id || pendingId === item.id) return;
    setPendingId(item.id);
    try {
      await addFriend(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } finally {
      setPendingId(null);
    }
  };

  const resolveAvatar = (photo) => {
    if (!photo) return null;
    if (/^https?:\/\//i.test(photo)) return photo;
    const cleanBase = (baseURL || '').replace(/\/+$/, '');
    const cleanPath = photo.replace(/^\/+/, '');
    return `${cleanBase}/${cleanPath}`;
  };

  const pickAvatarField = (item) =>
    item.profile_photo || item.photo || item.avatar || item.image || null;

  const renderAvatar = (item) => {
    const uri = resolveAvatar(pickAvatarField(item));
    if (uri) {
      return <Image source={{ uri }} style={styles.avatar} />;
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
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <View style={styles.grid}>
          {items.slice(0, 4).map((item) => (
            <View key={item.id || item.username || item.name} style={styles.card}>
              {renderAvatar(item)}
              <Text style={styles.name}>{item.name || item.username}</Text>
              {item.username ? <Text style={styles.subtitle}>@{item.username}</Text> : null}
              <TouchableOpacity
                style={styles.primaryGhostButton}
                onPress={() => handleConnect(item)}
                disabled={pendingId === item.id}
              >
                <Text style={styles.primaryGhostButtonText}>
                  {pendingId === item.id ? 'Učitavanje' : 'Poveži se'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    wrapper: {
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    header: {
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text_primary,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
    },
    card: {
      width: '48%',
      backgroundColor: colors.transparent,
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      gap: 6,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.secondary,
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
    name: {
      fontWeight: '800',
      color: colors.text_primary,
      textAlign: 'center',
    },
    subtitle: {
      color: colors.text_secondary,
      textAlign: 'center',
      fontSize: 12,
    },
    primaryGhostButton: {
      marginTop: 4,
      height: 36,
      width: '100%',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryGhostButtonText: {
      color: colors.primary,
      fontWeight: '800',
      fontSize: 12,
    },
    loader: {
      paddingVertical: 12,
    },
  });
