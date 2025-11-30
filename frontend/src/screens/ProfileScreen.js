import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { getCurrentUser, fetchMyVotes } from '../api';
import BottomCTA from '../components/BottomCTA';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [hypeCount, setHypeCount] = useState(0);
  const [recentHypes, setRecentHypes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const loadData = async () => {
    const current = await getCurrentUser();
    setUser(current);
    try {
      const { data } = await fetchMyVotes();
      setHypeCount(data?.length || 0);
      setRecentHypes((data || []).slice(0, 3));
    } catch {
      setHypeCount(0);
      setRecentHypes([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const username = user?.name ? user.name.toLowerCase().replace(' ', '') : 'gost';

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        contentInsetAdjustmentBehavior="always"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        <View style={styles.profileSection}>
          <View style={styles.profileRow}>
            <Image
              source={{
                uri:
                  user?.profile_photo ||
                  'https://ui-avatars.com/api/?name=' +
                    (user?.name || 'Korisnik') +
                    '&size=200&background=' +
                    encodeURIComponent(colors.profilePurple.replace('#', '')) +
                    '&color=ffffff',
              }}
              style={styles.profileImage}
            />

            <View style={styles.statsColumn}>
              <Text style={styles.userName}>{user?.name || 'Gost'}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItemRow}>
                  <Text style={styles.statNumber}>176</Text>
                  <Text style={styles.statLabel}>prijatelja</Text>
                </View>
                <View style={styles.statItemRow}>
                  <Text style={styles.statNumber}>{hypeCount}</Text>
                  <Text style={styles.statLabel}>hajpova</Text>
                </View>
              </View>

              <View style={styles.coinsBox}>
                <View>
                  <Text style={styles.coinsLabel}>NOVČIĆI</Text>
                  <Text style={styles.coinsAmount}>58</Text>
                </View>
                <TouchableOpacity style={styles.shopButton}>
                  <Text style={styles.shopButtonText}>SHOP</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
             <View style={styles.userDetails}>
          <View style={styles.userInfo}>
            <Text style={styles.userInfoItem}>🔥 Škola: {user?.school || 'Bez škole'}</Text>
            <Text style={styles.userInfoItem}>🎓 Razred: {user?.grade || 'Bez razreda'}</Text>
          </View>
        </View>

        <View style={styles.section2}>
          <View style={styles.rowSpread}>
            <TouchableOpacity style={styles.shareButton} onPress={() => navigation.navigate('EditProfile')}>
              <Text style={styles.shareButtonText}>Uredi profil</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton} onPress={() => navigation.navigate('Share')}>
              <Text style={styles.shareButtonText}>Podijeli profil</Text>
            </TouchableOpacity>
          </View>
        </View>

   

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top hajpovi</Text>
          {recentHypes.length === 0 ? (
            <Text style={styles.emptyHype}>Još nema hajpova</Text>
          ) : (
            recentHypes.map((item, idx) => (
              <View key={item.id || idx} style={styles.flameItem}>
                <Text style={styles.flameNumber}>{idx + 1}</Text>
                <Text style={styles.flameEmoji}>🔥</Text>
                <Text style={styles.flameText} numberOfLines={1}>
                  {item?.question?.question || 'Hajp'}
                </Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>

      <BottomCTA label="Nadogradi na Premium" iconName="diamond-outline" onPress={() => navigation.navigate('Subscription')} fixed />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      paddingBottom: 90,
    },
    profileSection: {
      paddingVertical: 20,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
      paddingHorizontal: 20,
    },
    profileImage: {
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: colors.surface,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statsColumn: {
      flex: 1,
      gap: 12,
    },
    statItemRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 6,
    },
    statNumber: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text_primary,
    },
    statLabel: {
      fontSize: 13,
      color: colors.text_secondary,
    },
    coinsBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    coinsLabel: {
      fontSize: 11,
      color: colors.text_secondary,
      fontWeight: '600',
    },
    coinsAmount: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text_primary,
    },
    shopButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 14,
    },
    shopButtonText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textLight,
    },
    shareButton: {
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 18,
      flex: 1,
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    shareButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text_primary,
    },
    userDetails: {
      paddingHorizontal: 24,
      paddingVertical: 20,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    userName: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text_primary,
      textAlign: 'left',
    },
    userHandle: {
      fontSize: 15,
      color: colors.text_secondary,
      marginTop: 4,
      textAlign: 'left',
    },
    userInfo: {
      flexDirection: 'row',
      marginTop: 0,
      gap: 12,
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    userInfoItem: {
      fontSize: 13,
      color: colors.text_secondary,
    },
    section: {
      padding: 16,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.transparent,
    },
    section2: {
      padding: 16,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowSpread: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text_primary,
      marginBottom: 12,
    },
    flameItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      gap: 12,
    },
    flameNumber: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
    },
    flameEmoji: {
      fontSize: 22,
    },
    flameText: {
      flex: 1,
      fontSize: 15,
      color: colors.text_primary,
      fontWeight: '600',
    },
    emptyHype: {
      fontSize: 14,
      color: colors.text_secondary,
    },
  });
