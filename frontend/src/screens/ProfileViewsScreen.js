import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { fetchProfileViews, getCurrentUser } from '../api';
import BottomCTA from '../components/BottomCTA';
import Avatar from '../components/Avatar';
import PayBottomSheet from '../components/PayBottomSheet';

export default function ProfileViewsScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const paySheetRef = useRef(null);
  const revealPrice = 50;

  const loadViews = useCallback(async () => {
    setLoading(true);
    try {
      const current = await getCurrentUser();
      if (!current?.id) {
        setViews([]);
        return;
      }
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

  const handleOpenPaySheet = useCallback(() => {
    paySheetRef.current?.open();
  }, []);

  const handlePayWithCoins = useCallback(() => {
    setHasFullAccess(true);
    paySheetRef.current?.close();
  }, []);

  const handleActivatePremium = useCallback(() => {
    paySheetRef.current?.close();
    navigation.navigate('Subscription');
  }, [navigation]);

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

  const renderVisitor = ({ item, index }) => {
    const isHidden = !hasFullAccess && index > 2;
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

    return (
      <View style={styles.visitorRow}>
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
      </View>
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
      {!hasFullAccess && views.length > 3 && (
        <BottomCTA
          label="Vidi ko ti gleda profil"
          onPress={handleOpenPaySheet}
          iconName="eye-outline"
          fixed
          style={styles.bottomCta}
        />
      )}
      <PayBottomSheet
        ref={paySheetRef}
        title="Vidi ko ti gleda profil"
        subtitle="Izaberi nacin otkljucavanja"
        coinPrice={revealPrice}
        onPayWithCoins={handlePayWithCoins}
        onActivatePremium={handleActivatePremium}
      />
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
