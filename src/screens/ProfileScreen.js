import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import colors from '../theme/colors';
import { getCurrentUser, logout } from '../api';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Gas')}>
          <Text style={styles.headerTab}>
            Gas <Text style={styles.badge}>8</Text>
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <Text style={styles.headerTab}>About</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <Image
          source={{
            uri:
              user?.profile_photo ||
              'https://ui-avatars.com/api/?name=' +
                (user?.name || 'User') +
                '&size=200&background=FF6B35&color=fff',
          }}
          style={styles.profileImage}
        />

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>176</Text>
            <Text style={styles.statLabel}>friends</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>328</Text>
            <Text style={styles.statLabel}>flames</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editProfileButton}>
          <Text style={styles.editProfileText}>EDIT PROFILE</Text>
        </TouchableOpacity>
      </View>

      {/* User Details */}
      <View style={styles.userDetails}>
        <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
        <Text style={styles.userHandle}>@{user?.name?.toLowerCase().replace(' ', '') || 'guest'}</Text>

        <View style={styles.userInfo}>
          <Text style={styles.userInfoItem}>🏫 {user?.school || 'No School'}</Text>
          <Text style={styles.userInfoItem}>🎓 {user?.grade || 'No Grade'}</Text>
        </View>
      </View>

      {/* Share Profile */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Share Profile 🔗</Text>
        </TouchableOpacity>

        <View style={styles.coinsContainer}>
          <Text style={styles.coinsLabel}>COINS</Text>
          <View style={styles.coinsBox}>
            <Text style={styles.coinsAmount}>58</Text>
            <TouchableOpacity style={styles.shopButton}>
              <Text style={styles.shopButtonText}>SHOP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Top Flames */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Flames</Text>
        <View style={styles.flameItem}>
          <Text style={styles.flameNumber}>1</Text>
          <Text style={styles.flameEmoji}>🔥</Text>
          <Text style={styles.flameText}>Most unforgettable name</Text>
        </View>
        <View style={styles.flameItem}>
          <Text style={styles.flameNumber}>2</Text>
          <Text style={styles.flameEmoji}>⭐</Text>
          <Text style={styles.flameText}>Will grow up, move to LA, and make it big</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity onPress={() => navigation.navigate('AnonymousInbox')} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>View Anonymous Inbox</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Subscription')}
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.actionButtonText, { color: colors.textLight }]}>Upgrade to Premium</Text>
        </TouchableOpacity>

        {user && (
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.actionButton, { backgroundColor: colors.error }]}
          >
            <Text style={[styles.actionButtonText, { color: colors.textLight }]}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  headerTab: {
    paddingVertical: 8,
  },
  headerTabText: {
    fontSize: 16,
    color: colors.text_secondary,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    color: colors.text_primary,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: colors.primary,
    color: colors.textLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '700',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text_primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text_secondary,
  },
  editProfileButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  editProfileText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text_secondary,
    letterSpacing: 0.5,
  },
  userDetails: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text_primary,
  },
  userHandle: {
    fontSize: 16,
    color: colors.text_secondary,
    marginTop: 4,
  },
  userInfo: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  userInfoItem: {
    fontSize: 14,
    color: colors.text_secondary,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  shareButton: {
    borderWidth: 1,
    borderColor: colors.surface,
    padding: 14,
    borderRadius: 25,
    marginBottom: 16,
  },
  shareButtonText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: colors.text_primary,
  },
  coinsContainer: {
    alignItems: 'flex-end',
  },
  coinsLabel: {
    fontSize: 11,
    color: colors.text_secondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  coinsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinsAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text_primary,
  },
  shopButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shopButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text_primary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text_primary,
    marginBottom: 16,
  },
  flameItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  flameNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textLight,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    textAlign: 'center',
    lineHeight: 32,
  },
  flameEmoji: {
    fontSize: 24,
  },
  flameText: {
    flex: 1,
    fontSize: 15,
    color: colors.text_primary,
    fontWeight: '500',
  },
  actionsSection: {
    padding: 20,
    gap: 12,
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.text_secondary,
  },
});
