import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Purchases from 'react-native-purchases';
import { PurchasesUI } from 'react-native-purchases-ui';
import { subscriptionStatus, subscribeWithPayload } from '../api';
import { darkColors } from '../theme/colors';
import AvatarHeroAnimated from '../components/AvatarHeroAnimated';

const perks = [
  'Brze sobe i hajpovi',
  'Uklonjeni oglasi',
  'Podrška i novi efekti na profilu',
];

const SECTION_GAP = 16;
const COVER_HEIGHT = 340;
const ENTITLEMENT = 'HAJP Pro';
const RC_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_KEY ||
  process.env.REACT_NATIVE_REVENUECAT_KEY ||
  process.env.REVENUECAT_API_KEY ||
  'test_KzksKLtfOUUVRongbTsIDFVdBRH';

export default function SubscriptionScreen() {
  const [selectedPlan, setSelectedPlan] = useState('daily');
  const [discountActive, setDiscountActive] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [rcPackages, setRcPackages] = useState([]);
  const [loadingOfferings, setLoadingOfferings] = useState(false);
  const [processingPurchase, setProcessingPurchase] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [rcError, setRcError] = useState(null);
  const colors = darkColors;
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    subscriptionStatus()
      .then(({ data }) => setSubscription(data.subscription))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!RC_API_KEY) return;

    const setup = async () => {
      try {
        Purchases.configure({ apiKey: RC_API_KEY, observerMode: false });
        await refreshOfferings();
        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info);
      } catch (error) {
        setRcError(error);
      }
    };

    setup();

    const remove = Purchases.addCustomerInfoUpdateListener((info) => setCustomerInfo(info));
    return () => remove?.();
  }, []);

  const refreshOfferings = useCallback(async () => {
    setLoadingOfferings(true);
    setRcError(null);
    try {
      const offerings = await Purchases.getOfferings();
      const available = offerings?.current?.availablePackages || [];
      setRcPackages(available);
      return available;
    } catch (error) {
      setRcError(error);
      setRcPackages([]);
      return [];
    } finally {
      setLoadingOfferings(false);
    }
  }, []);

  const selectPackageForPlan = useCallback((packages, planKey) => {
    if (!packages.length) return null;
    const key = (planKey || '').toLowerCase();
    if (key === 'daily') {
      return (
        packages.find(
          (pkg) =>
            pkg.identifier?.toLowerCase().includes('day') ||
            pkg.product?.identifier?.toLowerCase().includes('day'),
        ) ||
        packages.find((pkg) => pkg.packageType === Purchases.PACKAGE_TYPE.WEEKLY) ||
        packages[0]
      );
    }
    if (key === 'yearly') {
      return (
        packages.find(
          (pkg) =>
            pkg.identifier?.toLowerCase().includes('year') ||
            pkg.product?.identifier?.toLowerCase().includes('year'),
        ) ||
        packages.find((pkg) => pkg.packageType === Purchases.PACKAGE_TYPE.ANNUAL) ||
        packages[0]
      );
    }
    return (
      packages.find(
        (pkg) =>
          pkg.identifier?.toLowerCase().includes('month') ||
          pkg.product?.identifier?.toLowerCase().includes('month'),
      ) || packages.find((pkg) => pkg.packageType === Purchases.PACKAGE_TYPE.MONTHLY)
    ) || packages[0];
  }, []);

  const pickPackageForPlan = useCallback(
    (planKey) => selectPackageForPlan(rcPackages, planKey),
    [rcPackages, selectPackageForPlan],
  );

  const handleSubscribe = useCallback(async () => {
    let rcPackage = pickPackageForPlan(selectedPlan);
    if (!rcPackage) {
      // Refresh offerings once more to try to pick up newly configured products.
      const refreshed = await refreshOfferings();
      rcPackage = selectPackageForPlan(refreshed || [], selectedPlan);
    }
    const planDays = selectedPlan === 'daily' ? 1 : selectedPlan === 'yearly' ? 365 : 30;

    setProcessingPurchase(true);
    setRcError(null);
    try {
      if (!rcPackage) {
        const fallbackExpires = new Date(Date.now() + planDays * 24 * 60 * 60 * 1000).toISOString();
        await subscribeWithPayload({ plan: selectedPlan, expires_at: fallbackExpires, duration_days: planDays });
        await refreshBackendSubscription();
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const purchaseResult = await Purchases.purchasePackage(rcPackage);
        const entitlement =
          purchaseResult?.customerInfo?.entitlements?.active &&
          Object.values(purchaseResult.customerInfo.entitlements.active)[0];
        const expiresAt =
          entitlement?.expirationDate ||
          new Date(Date.now() + planDays * 24 * 60 * 60 * 1000).toISOString();
        if (expiresAt) {
          setSubscription({ expires_at: expiresAt });
        }
        setCustomerInfo(purchaseResult?.customerInfo);
        await refreshOfferings();
        await syncBackendSubscription({ plan: selectedPlan, expiresAt, durationDays: planDays });
      }
    } catch (error) {
      setRcError(error);
    } finally {
      setProcessingPurchase(false);
    }
  }, [
    pickPackageForPlan,
    refreshOfferings,
    refreshBackendSubscription,
    selectedPlan,
    selectPackageForPlan,
    syncBackendSubscription,
  ]);

  const handleRestore = useCallback(async () => {
    setProcessingPurchase(true);
    setRcError(null);
    try {
      await Purchases.restorePurchases();
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      const entitlement =
        info?.entitlements?.active && info.entitlements.active[ENTITLEMENT];
      const planDays = selectedPlan === 'daily' ? 1 : selectedPlan === 'yearly' ? 365 : 30;
      const expiresAt =
        entitlement?.expirationDate ||
        new Date(Date.now() + planDays * 24 * 60 * 60 * 1000).toISOString();
      if (expiresAt) {
        setSubscription({ expires_at: expiresAt });
        await syncBackendSubscription({ plan: selectedPlan, expiresAt, durationDays: planDays });
      }
    } catch (error) {
      setRcError(error);
    } finally {
      setProcessingPurchase(false);
    }
  }, [selectedPlan, syncBackendSubscription]);

  const handlePaywall = useCallback(async () => {
    if (!PurchasesUI?.presentPaywall) {
      setRcError(new Error('Paywall nije podržan u ovom buildu.'));
      return;
    }
    try {
      setProcessingPurchase(true);
      if (!rcPackages.length) {
        await refreshOfferings();
      }
      const result = await PurchasesUI.presentPaywall({
        offeringIdentifier: undefined, // use current offering
      });
      setCustomerInfo(result?.customerInfo || customerInfo);
      const entitlement =
        result?.customerInfo?.entitlements?.active &&
        result.customerInfo.entitlements.active[ENTITLEMENT];
      const planDays = selectedPlan === 'daily' ? 1 : selectedPlan === 'yearly' ? 365 : 30;
      const expiresAt =
        entitlement?.expirationDate ||
        new Date(Date.now() + planDays * 24 * 60 * 60 * 1000).toISOString();
      if (expiresAt) {
        setSubscription({ expires_at: expiresAt });
        await syncBackendSubscription({ plan: selectedPlan, expiresAt, durationDays: planDays });
      }
    } catch (error) {
      setRcError(error);
    } finally {
      setProcessingPurchase(false);
    }
  }, [customerInfo, rcPackages.length, refreshOfferings, selectedPlan, syncBackendSubscription]);

  const handleCustomerCenter = useCallback(async () => {
    if (!PurchasesUI.presentCustomerCenter) return;
    try {
      await PurchasesUI.presentCustomerCenter();
    } catch (error) {
      setRcError(error);
    }
  }, []);

  const priceText = useMemo(() => (discountActive ? '33,99 €' : '37,99 €'), [discountActive]);

  const activeEntitlement = customerInfo?.entitlements?.active || {};
  const hajpPro = activeEntitlement[ENTITLEMENT];

  const heroCopy = useMemo(() => {
    const expiresAt = subscription?.expires_at || hajpPro?.expirationDate;
    if (!expiresAt) {
      return 'Uključi premium i dobiješ kompletan pristup';
    }
    const expires = new Date(expiresAt);
    if (isNaN(expires.getTime())) {
      return 'Uključi premium i dobiješ kompletan pristup';
    }
    const formatted = expires.toLocaleDateString('bs-BA');
    const today = new Date();
    const diff = expires.getTime() - today.getTime();
    const days = Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
    return {
      text: `Pristup traje do ${formatted}`,
      days,
    };
  }, [hajpPro, subscription]);

  const refreshBackendSubscription = useCallback(async () => {
    try {
      const { data } = await subscriptionStatus();
      setSubscription(data.subscription);
    } catch (error) {
      console.warn('Failed to refresh backend subscription', error);
    }
  }, []);

  const syncBackendSubscription = useCallback(async ({ plan, expiresAt, durationDays }) => {
    try {
      await subscribeWithPayload({
        plan,
        expires_at: expiresAt,
        duration_days: durationDays,
      });
      await refreshBackendSubscription();
    } catch (error) {
      console.warn('Failed to sync subscription to backend', error);
    }
  }, [refreshBackendSubscription]);

  return (
    <View style={styles.container}>
      <AvatarHeroAnimated fixed height={COVER_HEIGHT}>
        <View style={styles.heroContent}>
          <Ionicons name="diamond" size={28} color={colors.primary} />
          <Text style={styles.heroTitle}>Pretplati se na Premium</Text>
          <Text style={styles.heroSubtitle}>
            30 novih lica u pozadini, postojani hajpovi i ekstra avatari.
          </Text>
        </View>
      </AvatarHeroAnimated>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.cancellationText}>
          <Text style={styles.cancellationCopy}>
            Pretplatu možeš otkazati u bilo kom trenutku u postavkama.
          </Text>
          <Text style={styles.cancellationCopy}>
            Plaćanje se vrši automatski preko App Store ili Play Store računa.
          </Text>
        </View>

        <View style={styles.perks}>
          {perks.map((perk, idx) => (
            <View key={perk} style={[styles.perkRow, idx === perks.length - 1 && styles.perkRowLast]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.perkText}>{perk}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statusBadge}>
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
              {discountActive ? 'Božićni popust primijenjen' : 'Uključi popust'}
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
          {['daily', 'monthly', 'yearly'].map((planKey) => {
            const rcPackage = pickPackageForPlan(planKey);
            const price =
              rcPackage?.product?.priceString ||
              (planKey === 'daily' ? '0,99 €' : planKey === 'yearly' ? priceText : '3,99 €');
            const label =
              planKey === 'daily'
                ? 'Dnevno'
                : planKey === 'monthly'
                ? 'Mjesečno'
                : 'Godišnje';
            const subText =
              planKey === 'daily'
                ? '24h pristup'
                : planKey === 'monthly'
                ? 'Otkazivanje u bilo kojem trenutku'
                : 'Ušteda naspram mjesečne';
            return (
              <TouchableOpacity
                key={planKey}
                style={[styles.plan, selectedPlan === planKey && styles.planSelected]}
                activeOpacity={0.9}
                onPress={() => setSelectedPlan(planKey)}
                disabled={loadingOfferings}
              >
                {planKey === 'yearly' && discountActive ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Uštedi</Text>
                  </View>
                ) : null}
                <View style={styles.planHeader}>
                  <View style={styles.planColumn}>
                    <Text style={styles.planLabel}>{label}</Text>
                    <Text style={styles.planSubtext}>{subText}</Text>
                  </View>
                  <View style={styles.priceColumn}>
                    <Text style={styles.planPrice}>{price}</Text>
                  </View>
                </View>
                {rcPackage?.product?.description ? (
                  <Text style={styles.planSubtext}>{rcPackage.product.description}</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleSubscribe}
          activeOpacity={0.85}
          disabled={processingPurchase}
        >
          <Text style={styles.ctaText}>
            <Ionicons name="diamond" size={18} color="#fff" /> {processingPurchase ? 'Obrada...' : 'Pretplati se'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ctaButton, { backgroundColor: colors.secondary, marginTop: 12 }]}
          onPress={handleRestore}
          activeOpacity={0.85}
          disabled={processingPurchase}
        >
          <Text style={styles.ctaText}>Vrati kupovine</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ctaButton, { backgroundColor: colors.border, marginTop: 12 }]}
          onPress={handlePaywall}
          activeOpacity={0.85}
          disabled={processingPurchase}
        >
          <Text style={styles.ctaText}>Prikaži RevenueCat Paywall</Text>
        </TouchableOpacity>



        {hajpPro ? (
          <Text style={[styles.linkText, { textAlign: 'center', marginTop: 8 }]}>
            HAJP Pro aktivan do {new Date(hajpPro.expirationDate).toLocaleDateString('bs-BA')}
          </Text>
        ) : null}
        {rcError ? (
          <Text style={{ color: 'red', marginTop: 8, textAlign: 'center' }}>
            {String(rcError?.message || rcError)}
          </Text>
        ) : null}

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
      backgroundColor: colors.backgroundDark,
      position: 'relative',
    },
    scrollView: {
      flex: 1,
      marginTop: COVER_HEIGHT,
    },
    content: {
      paddingHorizontal: 20,
      paddingVertical: SECTION_GAP,
      flexGrow: 1,
      justifyContent: 'flex-end',
      minHeight: '100%',
    },
    heroContent: {
      alignItems: 'center',
      gap: 8,
      paddingTop: 8,
      paddingBottom: 12,
    },
    heroChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: 'rgba(0,0,0,0.25)',
      borderRadius: 12,
      borderWidth: 1,
    },
    heroChipText: {
      color: colors.textLight,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },
    heroTitle: {
      color: colors.primary,
      fontSize: 26,
      fontWeight: '800',
    },
    heroSubtitle: {
      color: colors.text_secondary,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: 20,
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
    },
    statusBadgeContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
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
      textAlign: 'center',
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
