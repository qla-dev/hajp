import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import colors from '../theme/colors';
import { getCurrentUser, logout } from '../api';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Auth',
          state: {
            index: 0,
            routes: [{ name: 'Welcome' }],
          },
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <Image
          source={{
            uri:
              user?.profile_photo ||
              'https://ui-avatars.com/api/?name=' +
                (user?.name || 'Korisnik') +
                '&size=200&background=FF6B35&color=fff',
          }}
          style={styles.profileImage}
        />

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>176</Text>
            <Text style={styles.statLabel}>prijatelja</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>328</Text>
            <Text style={styles.statLabel}>hajpova</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editProfileButton}>
          <Text style={styles.editProfileText}>UREDI PROFIL</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.userDetails}>
        <Text style={styles.userName}>{user?.name || 'Gost'}</Text>
        <Text style={styles.userHandle}>@{user?.name?.toLowerCase().replace(' ', '') || 'gost'}</Text>

        <View style={styles.userInfo}>
          <Text style={styles.userInfoItem}>🏫 {user?.school || 'Bez škole'}</Text>
          <Text style={styles.userInfoItem}>🎓 {user?.grade || 'Bez razreda'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Podijeli profil 🔗</Text>
        </TouchableOpacity>

        <View style={styles.coinsContainer}>
          <Text style={styles.coinsLabel}>NOVČIĆI</Text>
          <View style={styles.coinsBox}>
            <Text style={styles.coinsAmount}>58</Text>
            <TouchableOpacity style={styles.shopButton}>
              <Text style={styles.shopButtonText}>PRODAVNICA</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top hajpovi</Text>
        <View style={styles.flameItem}>
          <Text style={styles.flameNumber}>1</Text>
          <Text style={styles.flameEmoji}>🔥</Text>
          <Text style={styles.flameText}>Najnezaboravnije ime</Text>
        </View>
        <View style={styles.flameItem}>
          <Text style={styles.flameNumber}>2</Text>
          <Text style={styles.flameEmoji}>⭐</Text>
          <Text style={styles.flameText}>Odrast će, preseliti u LA i uspjeti</Text>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity onPress={() => navigation.navigate('AnonymousInbox')} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Anonimni sandučić</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Subscription')}
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.actionButtonText, { color: colors.textLight }]}>Nadogradi na Premium</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={confirmLogout} style={[styles.actionButton, { backgroundColor: colors.error }]}>
          <Text style={[styles.actionButtonText, { color: colors.textLight }]}>Odjava</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
});
