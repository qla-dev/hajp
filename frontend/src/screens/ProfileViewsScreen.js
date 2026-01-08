import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { SvgUri } from 'react-native-svg';
import { Asset } from 'expo-asset';
import * as Haptics from 'expo-haptics';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { fetchProfileViews, getCurrentUser, payProfileView } from '../api';
import BottomCTA from '../components/BottomCTA';
import Avatar from '../components/Avatar';
import { usePaySheet } from '../context/paySheetContext';
import { updateCoinBalance } from '../utils/coinHeaderTracker';

const connectSoundAsset = require('../../assets/sounds/connect.mp3');
const coinAsset = require('../../assets/svg/coin.svg');
const coinAssetDefaultUri = Asset.fromModule(coinAsset).uri;

export default function ProfileViewsScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const { openPaySheet, closePaySheet } = usePaySheet();
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState(null);
  const [paying, setPaying] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [coinSvgUri, setCoinSvgUri] = useState(coinAssetDefaultUri || null);
  const revealPrice = 50;
  const revealSoundRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(connectSoundAsset, { shouldPlay: false });
        if (mounted) {
          revealSoundRef.current = sound;
        } else {
          await sound.unloadAsync();
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
      revealSoundRef.current?.unloadAsync();
      revealSoundRef.current = null;
    };
  }, []);

  const playRevealSound = useCallback(() => {
    revealSoundRef.current?.replayAsync().catch(() => {});
  }, []);

  const handleOpenProfile = useCallback(
    (targetUserId) => {
      if (!targetUserId) return;
      Haptics.selectionAsync().catch(() => {});
      navigation.navigate('ProfileFriends', {
        isMine: false,
        userId: targetUserId,
      });
    },
    [navigation],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const asset = Asset.fromModule(coinAsset);
        await asset.downloadAsync();
        if (mounted) {
          setCoinSvgUri(asset.localUri || asset.uri || coinAssetDefaultUri || null);
        }
      } catch {
        if (mounted) setCoinSvgUri(coinAssetDefaultUri || null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const loadViews = useCallback(async () => {
    setLoading(true);
    try {
      const current = await getCurrentUser();
      if (!current?.id) {
        setViews([]);
        setCurrentUserId(null);
        return;
      }
      setCurrentUserId(current.id);
      const { data } = await fetchProfileViews(current.id);
      setViews(data?.data || data || []);
    } catch {
      setViews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadViews();
    }, [loadViews]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadViews();
    setRefreshing(false);
  }, [loadViews]);

  const handleOpenPaySheet = useCallback((view) => {
    setSelectedView(view || null);
    Haptics.selectionAsync().catch(() => {});
    openPaySheet({
      title: 'Otkrij ko ti gleda profil',
      subtitle: 'Izaberi način otključavanja željenog korisnika',
      coinPrice: revealPrice,
      onPayWithCoins: (priceOverride) => handlePayWithCoins(priceOverride, view),
      onActivatePremium: handleActivatePremium,
      onClose: () => setSelectedView(null),
    });
  }, [handleActivatePremium, handlePayWithCoins, openPaySheet, revealPrice]);

  const handlePayWithCoins = useCallback(async (priceOverride, viewOverride) => {
    const targetView = viewOverride || selectedView;
    if (!targetView?.visitor_id) {
      Alert.alert('Greska', 'Nismo mogli pronaci profil koji otkljucavas.');
      return;
    }
    if (paying) return;
    let userId = currentUserId;
    if (!userId) {
      try {
        const current = await getCurrentUser();
        userId = current?.id || null;
        if (userId) {
          setCurrentUserId(userId);
        }
      } catch {
        userId = null;
      }
    }
    if (!userId) {
      Alert.alert('Greska', 'Nismo mogli potvrditi korisnika.');
      return;
    }
    const normalizedPrice = Number(priceOverride);
    const amount = Number.isFinite(normalizedPrice)
      ? Math.max(1, Math.floor(normalizedPrice))
      : revealPrice;
    setPaying(true);
    try {
      const { data } = await payProfileView(userId, {
        visitor_id: targetView.visitor_id,
        amount,
      });
      setViews((prev) =>
        prev.map((view) =>
          view.visitor_id === targetView.visitor_id ? { ...view, seen: 1 } : view,
        ),
      );
      if (typeof data?.coins === 'number') {
        updateCoinBalance(data.coins);
      }
      playRevealSound();
      closePaySheet();
    } catch (error) {
      const message = error?.response?.data?.message || 'Nismo mogli otkriti profil.';
      const status = error?.response?.status;
      if (status === 422 && typeof message === 'string' && message.toLowerCase().includes('coin')) {
        closePaySheet();
        navigation.navigate('BuyCoins');
        return;
      }
      Alert.alert('Greska', message);
    } finally {
      setPaying(false);
    }
  }, [closePaySheet, currentUserId, navigation, paying, playRevealSound, revealPrice, selectedView]);

  const handleActivatePremium = useCallback(() => {
    closePaySheet();
    navigation.navigate('Subscription');
  }, [closePaySheet, navigation]);

  const formatViewedAt = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    const hours = String(parsed.getHours()).padStart(2, '0');
    const minutes = String(parsed.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} · ${hours}:${minutes}`;
  };

  const renderVisitor = ({ item }) => {
    const isHidden = Number(item?.seen ?? 0) === 0;
    const label = item.name || item.username || 'Korisnik';
    const username = item.username ? `@${item.username}` : null;
    const viewedAt = formatViewedAt(item.viewed_at);
    const genderLabel = item.sex
      ? item.sex.toLowerCase().includes('female')
        ? 'žena'
        : 'muškarac'
      : 'osoba';
    const roomLabel = item.room_name;
    const hasRoom = Boolean(roomLabel);
    const truncatedRoom = hasRoom && roomLabel.length > 12 ? `${roomLabel.slice(0, 12)}…` : roomLabel;
    const genderColor = genderLabel === 'žena' ? '#f472b6' : '#60a5fa';

    const coinUri = coinSvgUri || coinAssetDefaultUri;
    const canOpenProfile = !isHidden && Boolean(item?.visitor_id);
    const RowComponent = canOpenProfile ? TouchableOpacity : View;
    const rowProps = canOpenProfile
      ? { onPress: () => handleOpenProfile(item.visitor_id), activeOpacity: 0.7 }
      : {};

    return (
      <RowComponent style={styles.visitorRow} {...rowProps}>
        <View style={styles.avatarWrapper}>
          <Avatar
            user={item}
            name={label}
            variant="friendlist"
            zoomModal={false}
          />
          {isHidden && (
            <BlurView intensity={15} tint="default" style={styles.avatarBlur} pointerEvents="none" />
          )}
        </View>
        <View style={styles.visitorInfo}>
          <View style={styles.hiddenLabelRow}>
            {isHidden ? (
              <>
                <Text style={styles.visitorName}>Neko</Text>
                <View style={styles.genderIconInline}>
                  <Ionicons
                    name="flame"
                    size={16}
                    color={genderColor}
                  />
                </View>
                {hasRoom ? (
                  <Text style={styles.visitorName}>{`iz sobe ${truncatedRoom}`}</Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.visitorName}>{label}</Text>
            )}
          </View>
          {!isHidden && username ? <Text style={styles.visitorUsername}>{username}</Text> : null}
          {viewedAt ? <Text style={styles.visitorMeta}>{`Pregledano ${viewedAt}`}</Text> : null}
        </View>
        {isHidden ? (
          <TouchableOpacity
            style={styles.revealButton}
            onPress={() => handleOpenPaySheet(item)}
            disabled={paying && selectedView?.visitor_id === item.visitor_id}
          >
            {paying && selectedView?.visitor_id === item.visitor_id ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <View style={styles.revealButtonContent}>
                {coinUri ? (
                  <SvgUri width={16} height={16} uri={coinUri} />
                ) : (
                  <Ionicons name="cash-outline" size={16} color={colors.primary} />
                )}
                <Text style={styles.revealButtonText}>{revealPrice}</Text>
              </View>
            )}
          </TouchableOpacity>
        ) : null}
      </RowComponent>
    );
  };

  const listEmptyComponent = () => (
    <View style={styles.emptyRow}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <>
          <Text style={styles.emptyTitle}>Još nema pregleda</Text>
          <Text style={styles.emptySubtitle}>Kada neko pogleda tvoj profil, pojaviće se ovde.</Text>
        </>
      )}
    </View>
  );

  const listContentStyle = [
    styles.listContent,
    views.length === 0 && styles.emptyContainer,
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={views}
        keyExtractor={(item, index) => String(item.visitor_id || item.id || index)}
        renderItem={renderVisitor}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={listContentStyle}
        contentInsetAdjustmentBehavior="always"
        ListEmptyComponent={listEmptyComponent}
      />
      {views.some((item) => Number(item?.seen ?? 0) === 0) && (
        <BottomCTA
          label="Vidi sve u zadnjih mjesec dana"
          onPress={() => navigation.navigate('Subscription')}
          iconName="eye-outline"
          fixed
          style={styles.bottomCta}
        />
      )}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.transparent,
    },
    listContent: {
      paddingHorizontal: 15,
      paddingTop: 10,
      paddingBottom: 75,
    },
    bottomCta: {
      paddingHorizontal: 15,
      paddingBottom: 50,
    },
    emptyContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingBottom: 40,
    },
    visitorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
      padding: 16,
      borderRadius: 20,
      backgroundColor: colors.transparent,
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatarWrapper: {
      position: 'relative',
      borderRadius: 999,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarBlur: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 999,
      backgroundColor: 'transparent',
    },
    visitorInfo: {
      flex: 1,
      gap: 2,
    },
    hiddenLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    genderIconInline: {
      marginHorizontal: 2,
      paddingHorizontal: 2,
      lineHeight: 18,
    },
    visitorName: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text_primary,
    },
    visitorUsername: {
      fontSize: 13,
      color: colors.text_secondary,
    },
    visitorMeta: {
      fontSize: 12,
      color: colors.text_secondary,
    },
    revealButton: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    revealButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    revealButtonText: {
      color: colors.primary,
      fontWeight: '700',
    },
    emptyRow: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
      gap: 6,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text_primary,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.text_secondary,
      textAlign: 'center',
    },
  });
