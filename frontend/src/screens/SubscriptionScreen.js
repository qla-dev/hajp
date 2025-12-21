import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { subscriptionStatus, subscribe } from '../api';
import * as Haptics from 'expo-haptics';

const perks = [
  'Brže učitavanje soba i hajpova',
  'Uklonjeni oglasi i prekidi',
  'Podrška i novi efekti na profilu',
];
const SECTION_GAP = 16;

const plans = [
  {
    key: 'monthly',
    label: 'Mjesečno',
    price: '3,99 €',
    subText: 'Otkaži kad god želiš',
  },
  {
    key: 'yearly',
    label: 'Godišnje',
    price: '33,99 €',
    subText: 'Ekvivalent 3,16 €/mj',
    badge: 'Uštedi 15%',
  },
];

export default function SubscriptionScreen() {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [discountActive, setDiscountActive] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  useEffect(() => {
    subscriptionStatus()
      .then(({ data }) => setSubscription(data.subscription))
      .catch(() => {});
  }, []);

  const handleSubscribe = useCallback(async () => {
    try {
      await subscribe();
    } catch {
      // ignore
    }
  }, []);

  const priceText = useMemo(
    () => (discountActive ? '33,99 €' : '37,99 €'),
    [discountActive],
  );

  const heroCopy = useMemo(() => {
    if (!subscription?.expires_at) {
      return 'Uključi premium i dobiješ kompletan pristup';
    }
    const expires = new Date(subscription.expires_at);
    const formatted = expires.toLocaleDateString('bs-BA');
    const today = new Date();
    const diff = expires - today;
    const days = Math.max(Math.round(diff / (1000 * 60 * 60 * 24)), 0);
    return {
      text: `Pristup traje do ${formatted}`,
      days,
    };
  }, [subscription]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.hero}>
          <Ionicons name="diamond" size={28} color={colors.primary} />
          <Text style={styles.heroTitle}>Pretplati se na Premium</Text>
        </View>
             <View style={styles.cancellationText}>
          <Text style={styles.cancellationCopy}>
            Pretplatu možeš otkazati u bilo kom trenutku u postavkama.
          </Text>
          <Text style={styles.cancellationCopy}>
            Plaćanje se vrši automatski preko App Store računa.
          </Text>
        </View>

        <View style={styles.perks}>
          {perks.map((perk, idx) => (
            <View
              key={perk}
              style={[
                styles.perkRow,
                idx === perks.length - 1 && styles.perkRowLast,
              ]}
            >
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.perkText}>{perk}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statusBadge}>
          <View style={styles.statusBadgeGlow} />
          <View style={styles.statusBadgeContent}>
            <Text style={styles.statusBadgeText}>{typeof heroCopy === 'string' ? heroCopy : heroCopy.text}</Text>
            {heroCopy?.days != null && (
              <View style={styles.statusBadgeDays}>
                <Text style={styles.statusBadgeDaysNumber}>{heroCopy.days}</Text>
                <Text style={styles.statusBadgeDaysLabel}>dana</Text>
              </View>
            )}
          </View>
        </View>
          

        <View style={styles.discountCard}>
          <View style={styles.discountTopRow}>
            <Text style={styles.discountLabel}>
              {discountActive ? '🎄 Božićni popust primijenjen' : '🎁 Uključi Božićni popust'}
            </Text>
            <TouchableOpacity
              style={[styles.switchTrack, discountActive && styles.switchTrackActive]}
              activeOpacity={0.9}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDiscountActive((prev) => !prev);
              }}
            >
              <View style={[styles.switchThumb, discountActive && styles.switchThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.planList}>
          {plans.map((plan) => {
            const isYearly = plan.key === 'yearly';
            const price = isYearly ? priceText : plan.price;
            return (
              <TouchableOpacity
                key={plan.key}
                style={[
                  styles.plan,
                  selectedPlan === plan.key && styles.planSelected,
                ]}
                activeOpacity={0.9}
                onPress={() => setSelectedPlan(plan.key)}
              >
                {isYearly && discountActive && plan.badge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{plan.badge}</Text>
                  </View>
                ) : null}
                <View style={styles.planHeader}>
                  <View style={styles.planColumn}>
                    <Text style={styles.planLabel}>{plan.label}</Text>
                    <Text style={styles.planSubtext}>{plan.subText}</Text>
                  </View>
                  <View style={styles.priceColumn}>
                    <Text style={styles.planPrice}>{price}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

 

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleSubscribe}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>
            <Ionicons name="diamond" size={18} color="#fff" /> {'   '}Pretplati se
          </Text>
        </TouchableOpacity>

        <View style={styles.footerLinks}>
          <Text style={styles.linkText}>Pravila privatnosti</Text>
          <Text style={styles.linkText}>Uslovi korištenja</Text>
          <Text style={styles.linkText}>Kontakt</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0B0D12',
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingVertical: 0,
      flexGrow: 1,
      justifyContent: 'flex-end',
      minHeight: '100%',
    },
    hero: {
      borderRadius: 26,
      padding: 22,
      alignItems: 'center',
      gap: 6,
      paddingBottom: SECTION_GAP,
    },
    heroTitle: {
      color: colors.primary,
      fontSize: 26,
      fontWeight: '800',
    },
    heroText: {
      marginTop: 4,
      color: '#c5c8e0',
      fontSize: 14,
      textAlign: 'center',
    },
    perks: {
      borderRadius: 20,
      paddingTop: 16,
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,

    },
    perkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    perkRowLast: {
      marginBottom: 0,
    },
    perkText: {
      color: colors.textLight,
      fontSize: 15,
      fontWeight: '600',
      marginLeft: 10,
    },
    statusBadge: {
      alignSelf: 'stretch',
      backgroundColor: colors.secondary,
      borderRadius: 22,
      paddingVertical: 16,
      paddingHorizontal: 16,
      marginTop: SECTION_GAP,
      overflow: 'hidden',
      position: 'relative',
    },

    statusBadgeContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      position: 'relative',
    },
    statusBadgeText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '700',
      maxWidth: '70%',
    },
    statusBadgeDays: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 6,
      borderRadius: 12,
      backgroundColor: '#fff',
      minWidth: 60,
    },
    statusBadgeDaysNumber: {
      color: colors.secondary,
      fontSize: 22,
      fontWeight: '800',
    },
    statusBadgeDaysLabel: {
      color: colors.secondary,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    discountCard: {
      backgroundColor: colors.transparent,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginVertical: SECTION_GAP,
    },
    discountTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    switchTrack: {
      width: 52,
      height: 28,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.18)',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    switchTrackActive: {
      backgroundColor: colors.primary,
    },
    switchThumb: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#fff',
      alignSelf: 'flex-start',
    },
    switchThumbActive: {
      alignSelf: 'flex-end',
    },
    discountLabel: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '600',
    },
    planList: {
      gap: 12,
    },
    plan: {
      borderRadius: 22,
      padding: 18,
      position: 'relative',
      borderWidth: 1,
      borderColor: colors.border,
    },
    planSelected: {
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 18,
      elevation: 10,
    },
    badge: {
      position: 'absolute',
      top: 0,
      marginTop: -10,
      right: 16,
      backgroundColor: colors.secondary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    badgeText: {
      color: 'white',
      fontSize: 11,
      fontWeight: '700',
    },
    planHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    planColumn: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    priceColumn: {
      width: 110,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    planLabel: {
      color: colors.secondary,
      fontSize: 18,
      fontWeight: '700',
    },
    planPrice: {
      color: '#fff',
      fontSize: 24,
      fontWeight: '800',
    },
    planSubtext: {
      color: '#a9adc6',
      fontSize: 13,
    },
    cancellationText: {
      gap: 4,
      marginBottom: SECTION_GAP,
    },
    cancellationCopy: {
      color: '#a9adc6',
      fontSize: 12,
      textAlign: 'center',
    },
    ctaButton: {
      backgroundColor: colors.primary,
      borderRadius: 999,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: SECTION_GAP,
      shadowColor: colors.primary,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.45,
      elevation: 12,
    },
    ctaText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '800',
    },
    footerLinks: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16,
      marginTop: SECTION_GAP,
      marginBottom: 20,
    },
    linkText: {
      color: colors.primary,
      fontSize: 12,
      textDecorationLine: 'underline',
    },
  });
