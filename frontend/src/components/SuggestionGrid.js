import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import * as Haptics from 'expo-haptics';
import { fetchFriendSuggestions, addFriend, baseURL } from '../api';

export default function SuggestionGrid({ title = 'Još preporuka', refreshKey, onCardPress }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  const [fadeValues] = useState({});
  const navigation = useNavigation();
  const hapticCooldownRef = useRef(0);

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
    if (!fadeValues[item.id]) {
      fadeValues[item.id] = new Animated.Value(1);
    }
    setPendingId(item.id);
    try {
      await addFriend(item.id);
      Animated.timing(fadeValues[item.id], {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }).start(() => {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setPendingId(null);
      });
    } catch {
      setPendingId(null);
    }
  };

  const handleCardPress = (item) => {
    const now = Date.now();
    if (now - hapticCooldownRef.current > 500) {
      Haptics.selectionAsync().catch(() => {});
      hapticCooldownRef.current = now;
    }
    if (typeof onCardPress === 'function') {
      onCardPress(item);
      return;
    }
    const friendId = item.friend_id || item.id;
    if (!friendId) return;
    navigation.navigate('FriendProfile', {
      isMine: false,
      userId: friendId,
    });
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
            <TouchableOpacity
              key={item.id || item.username || item.name}
              activeOpacity={0.8}
              onPress={() => handleCardPress(item)}
              style={styles.cardWrapper}
            >
              <Animated.View style={[styles.card, fadeValues[item.id] && { opacity: fadeValues[item.id] }]}>
                {renderAvatar(item)}
                <Text style={styles.name}>{item.name || item.username}</Text>
                {item.username ? <Text style={styles.subtitle}>@{item.username}</Text> : null}
                <TouchableOpacity
                  style={styles.primaryGhostButton}
                  onPress={() => handleConnect(item)}
                  disabled={pendingId === item.id}
                >
                  <View style={styles.connectRow}>
                    {pendingId === item.id && (
                      <ActivityIndicator size="small" color={colors.primary} style={styles.connectSpinner} />
                    )}
                    <Text style={styles.primaryGhostButtonText}>
                      {pendingId === item.id ? 'Povezivanje' : 'Poveži se'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </TouchableOpacity>
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
      marginHorizontal: -2,
    },
    card: {
      width: '100%',
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
    connectRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      columnGap: 6,
    },
    connectSpinner: {
      marginRight: 4,
    },
    loader: {
      paddingVertical: 12,
    },
    cardWrapper: {
      width: '49%',
      paddingHorizontal: 2,
      marginBottom: 10,
    },
  });
