import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { fetchFriendSuggestions, addFriend, baseURL } from '../api';

export default function SuggestionSlider({
  title = 'Predlažemo ti',
  linkLabel,
  onLinkPress,
  showHeader = true,
  emptyTitle = 'Nema preporuka',
  emptySubtitle = 'Osvježi da dobiješ nove prijedloge.',
  onCardPress,
  refreshKey,
  skipNextHaptic = false,
  skipHapticRef,
  onClearSkip = () => {},
}) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  const [fadeValues] = useState({});
  const skipUntilRef = useRef(0);
  const hapticCooldownRef = useRef(0);
  const tapTriggeredRef = useRef(false);
  const draggingRef = useRef(false);

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
      return <Image source={{ uri }} style={styles.cardAvatar} />;
    }
    const label = item.name || item.username || 'Korisnik';
    const initials = label
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
    return (
      <View style={[styles.cardAvatar, styles.avatarFallback]}>
        <Text style={styles.avatarFallbackText}>{initials}</Text>
      </View>
    );
  };

  const loadSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchFriendSuggestions();
      setSuggestions(data?.data || []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions, refreshKey]);

  const handleConnect = async (item) => {
    if (!item.id || pendingId === item.id) return;

    if (!fadeValues[item.id]) {
      fadeValues[item.id] = new Animated.Value(1);
    }

    setPendingId(item.id);
    try {
      await addFriend(item.id);

      Animated.timing(fadeValues[item.id], {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setSuggestions((prev) => prev.filter((s) => s.id !== item.id));
        setPendingId(null);
      });
    } catch {
      setPendingId(null);
    }
  };

  const handleCardPress = (item) => {
    tapTriggeredRef.current = true;
    const now = Date.now();
    if (now - hapticCooldownRef.current > 500) {
      Haptics.selectionAsync().catch(() => {});
      hapticCooldownRef.current = now;
    }
    skipUntilRef.current = now + 1200;
    if (typeof onCardPress === 'function') {
      onCardPress(item);
      return;
    }

    const friendId = item.friend_id || item.id;
    if (!friendId) return;
    navigation.push('FriendProfile', {
      isMine: false,
      userId: friendId,
    });
  };

    return (
    <View>
      {showHeader && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {linkLabel && onLinkPress ? (
            <TouchableOpacity onPress={onLinkPress}>
              <Text style={styles.sectionLink}>{linkLabel}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {loading ? (
        <View style={styles.loaderRow}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsRow}
          snapToAlignment="start"
          snapToInterval={232}
          decelerationRate="fast"
          onScrollBeginDrag={() => {
            draggingRef.current = true;
          }}
          onMomentumScrollEnd={() => {
            if (skipHapticRef?.current) {
              skipHapticRef.current = false;
              onClearSkip();
              draggingRef.current = false;
              return;
            }
            if (tapTriggeredRef.current) {
              tapTriggeredRef.current = false;
              draggingRef.current = false;
              return;
            }
            if (skipNextHaptic) {
              onClearSkip();
              draggingRef.current = false;
              return;
            }
            if (!draggingRef.current) {
              return;
            }
            const now = Date.now();
            if (now < skipUntilRef.current) {
              draggingRef.current = false;
              return;
            }
            if (now - hapticCooldownRef.current > 500) {
              Haptics.selectionAsync().catch(() => {});
              hapticCooldownRef.current = now;
            }
            draggingRef.current = false;
          }}
        >
          {suggestions.map((item) => (
            <TouchableOpacity
              key={item.id || item.username || item.name}
              activeOpacity={0.9}
              onPress={() => handleCardPress(item)}
            >
              <Animated.View style={[styles.card, fadeValues[item.id] && { opacity: fadeValues[item.id] }]}>
                <View style={styles.cardHeader}>{renderAvatar(item)}</View>
                <Text style={styles.cardName}>{item.name || item.username}</Text>
                {item.username ? <Text style={styles.cardSubtitle}>@{item.username}</Text> : null}
                <Text style={styles.cardMutual}>Predloženi prijatelj</Text>
                <TouchableOpacity
                  style={styles.primaryGhostButton}
                  disabled={pendingId === item.id}
                  onPress={() => handleConnect(item)}
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

          {suggestions.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.cardName}>{emptyTitle}</Text>
              <Text style={styles.cardMutual}>{emptySubtitle}</Text>
              <TouchableOpacity style={styles.primaryGhostButton} onPress={loadSuggestions}>
                <Text style={styles.primaryGhostButtonText}>Osvježi</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingTop: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text_primary,
    },
    sectionLink: {
      color: colors.primary,
      fontWeight: '700',
    },
    cardsRow: {
      paddingHorizontal: 16,
      gap: 12,
      paddingBottom: 12,
    },
    card: {
      width: 220,
      backgroundColor: colors.transparent,
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    emptyCard: {
      width: 220,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardAvatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
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
    cardName: {
      fontWeight: '800',
      color: colors.text_primary,
      fontSize: 16,
    },
    cardSubtitle: {
      color: colors.text_secondary,
    },
    cardMutual: {
      color: colors.text_secondary,
      fontSize: 12,
    },
    primaryGhostButton: {
      marginTop: 4,
      height: 44,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryGhostButtonText: {
      color: colors.primary,
      fontWeight: '800',
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
    loaderRow: {
      paddingVertical: 30,
      alignItems: 'center',
    },
  });
