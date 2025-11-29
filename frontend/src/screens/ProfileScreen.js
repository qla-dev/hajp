import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import colors from '../theme/colors';
import { getCurrentUser, logout, fetchMyVotes } from '../api';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [hypeCount, setHypeCount] = useState(0);
  const [recentHypes, setRecentHypes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Auth',
          state: { index: 0, routes: [{ name: 'Welcome' }] },
        },
      ],
    });
  };

  const confirmLogout = () => {
    Alert.alert('Odjava', 'Da li želite da se odjavite?', [
      { text: 'Otkaži', style: 'cancel' },
      { text: 'Odjavi me', style: 'destructive', onPress: handleLogout },
    ]);
  };

  const username = user?.name ? user.name.toLowerCase().replace(' ', '') : 'gost';

  return (
    <ScrollView
      style={styles.container}
      contentInsetAdjustmentBehavior="always"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
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
            <TouchableOpacity style={styles.editProfileButton}>
              <Text style={styles.editProfileText}>UREDI PROFIL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.userDetails}>
        <Text style={styles.userName}>{user?.name || 'Gost'}</Text>
        <Text style={styles.userHandle}>@{username}</Text>

        <View style={styles.userInfo}>
          <Text style={styles.userInfoItem}>🏫 Škola: {user?.school || 'Bez škole'}</Text>
          <Text style={styles.userInfoItem}>🎓 Razred: {user?.grade || 'Bez razreda'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.rowSpread}>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareButtonText}>Podijeli profil</Text>
          </TouchableOpacity>

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

      <View style={styles.actionsSection}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Subscription')}
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.actionButtonText, { color: colors.textLight }]}>Nadogradi na Premium</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={confirmLogout} style={[styles.actionButton, { backgroundColor: colors.error }]} >
          <Text style={[styles.actionButtonText, { color: colors.textLight }]}>Odjava</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileSection: {
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
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
    gap: 16,
  },
  statsColumn: {
    flex: 1,
    gap: 10,
  },
  statItemRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  statLabel: {
    fontSize: 13,
    color: '#7a7a7a',
  },
  editProfileButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
  },
  editProfileText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5a5a5a',
    letterSpacing: 0.4,
  },
  userDetails: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
    textAlign: 'left',
  },
  userHandle: {
    fontSize: 15,
    color: '#7a7a7a',
    marginTop: 4,
    textAlign: 'left',
  },
  userInfo: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  userInfoItem: {
    fontSize: 13,
    color: '#7a7a7a',
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  rowSpread: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  shareButton: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },
  coinsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d9d9d9',
  },
  coinsLabel: {
    fontSize: 11,
    color: '#7a7a7a',
    fontWeight: '600',
  },
  coinsAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
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
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
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
    color: '#f97316',
  },
  flameEmoji: {
    fontSize: 22,
  },
  flameText: {
    flex: 1,
    fontSize: 15,
    color: '#111',
    fontWeight: '600',
  },
  emptyHype: {
    fontSize: 14,
    color: '#7a7a7a',
  },
  actionsSection: {
    padding: 20,
    gap: 12,
    backgroundColor: '#fff',
  },
  actionButton: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: colors.text_primary,
  },
});
