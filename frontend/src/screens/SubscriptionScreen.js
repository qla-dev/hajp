import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { subscriptionStatus, subscribe } from '../api';

const perks = [
  'Vidi ko te hajpa',
  'Do 2 imena sedmično',
  'Otključane anonimne poruke',
  'Prioritetna podrška',
];

export default function SubscriptionScreen({ navigation }) {
  const [sub, setSub] = useState(null);

  const formatDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  useEffect(() => {
    subscriptionStatus()
      .then(({ data }) => setSub(data.subscription))
      .catch(() => {});
  }, []);

  const handleSubscribe = async () => {
    try {
      const { data } = await subscribe();
      setSub(data.subscription);
    } catch (error) {
      // swallow for now; ideally show toast
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Pretplata</Text>
        <Text style={styles.subheaderText}>
          {sub
            ? `Pretplata je aktivna do ${formatDate(sub.expires_at) || '...'}`
            : 'Recurring billing. Otkaži kad god.'}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.badge}>
          <Ionicons name="diamond" size={18} color={colors.accent} />
          <Text style={styles.badgeText}>PREMIUM</Text>
        </View>

        <Text style={styles.title}>Vidi ko te hajpa</Text>
        <Text style={styles.subtitle}>Otkrij ko stoji iza hajpova i poruka.</Text>

        <View style={styles.perks}>
          {perks.map((item) => (
            <View key={item} style={styles.perkRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
              <Text style={styles.perkText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceValue}>6.99€</Text>
          <Text style={styles.priceUnit}>/ sedmično</Text>
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={handleSubscribe} activeOpacity={0.9}>
          <Text style={styles.ctaText}>{sub ? 'Obnovi' : 'Nastavi'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.laterButton} onPress={() => navigation?.goBack?.()}>
          <Text style={styles.laterText}>Možda kasnije</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0c0b18',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    color: colors.textLight,
    fontSize: 22,
    fontWeight: '800',
  },
  subheaderText: {
    color: '#cbd5f5',
    fontSize: 12,
    marginTop: 6,
  },
  card: {
    backgroundColor: '#101728',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    marginBottom: 8,
  },
  badgeText: {
    color: colors.accent,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  title: {
    color: colors.textLight,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: '#cbd5f5',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 18,
  },
  perks: {
    gap: 10,
    marginBottom: 20,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  perkText: {
    color: colors.textLight,
    fontSize: 15,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: 18,
  },
  priceValue: {
    color: colors.textLight,
    fontSize: 26,
    fontWeight: '800',
  },
  priceUnit: {
    color: '#d1d5db',
    fontSize: 14,
    marginLeft: 6,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  ctaText: {
    color: '#0c0b18',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  laterButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  laterText: {
    color: '#cbd5f5',
    fontSize: 14,
    fontWeight: '600',
  },
});
