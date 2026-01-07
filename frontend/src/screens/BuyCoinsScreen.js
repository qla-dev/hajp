import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SvgUri } from 'react-native-svg';
import { Asset } from 'expo-asset';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { darkColors } from '../theme/colors';
import AvatarHeroAnimated from '../components/AvatarHeroAnimated';
import { addCoins } from '../api';
import { updateCoinBalance } from '../utils/coinHeaderTracker';

const coinAsset = require('../../assets/svg/coin.svg');
const coinAssetDefaultUri = Asset.fromModule(coinAsset).uri;

const COIN_BUNDLES = [
  { key: '100', amount: 100, price: '1.99 KM', label: 'Start paket' },
  { key: '300', amount: 300, price: '4.99 KM', label: 'Najbolja ponuda', badge: 'Top' },
  { key: '500', amount: 500, price: '6.99 KM', label: 'Za vise otkrivanja' },
];

const BENEFITS = [
  'Otkrij ko ti gleda profil odmah.',
  'Coine mozes koristiti na vise ekrana.',
  'Dopuna se aktivira odmah nakon kupovine.',
];

const INFO_LINES = [
  'Kupovinu HAJP COINA mozes ponoviti u bilo kom trenutku.',
  'Placanje se vrsi automatski preko App Store ili Play Store racuna.',
];

const SECTION_GAP = 16;
const COVER_HEIGHT = 280;
const CTA_HEIGHT = 84;

export default function BuyCoinsScreen() {
  const [selectedBundle, setSelectedBundle] = useState(COIN_BUNDLES[1]?.key || '300');
  const [processing, setProcessing] = useState(false);
  const [coinSvgUri, setCoinSvgUri] = useState(coinAssetDefaultUri || null);
  const navigation = useNavigation();
  const colors = darkColors;
  const styles = useMemo(() => createStyles(colors), [colors]);

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

  const selectedConfig = useMemo(
    () => COIN_BUNDLES.find((bundle) => bundle.key === selectedBundle) || COIN_BUNDLES[0],
    [selectedBundle],
  );

  const handleBuy = useCallback(async () => {
    if (processing) return;
    setProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    try {
      const { data } = await addCoins({ amount: selectedConfig.amount });
      if (typeof data?.coins === 'number') {
        updateCoinBalance(data.coins);
      }
      Alert.alert(
        'Hej, čestitamo ti!',
        `Upravo si nadokupino svoj račun sa ${selectedConfig.amount} HAJP COINA.`,
        [
          {
            text: 'Uredu',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      const message = error?.response?.data?.message || 'Nismo mogli kupiti coine.';
      Alert.alert('Greska', message);
    } finally {
      setProcessing(false);
    }
  }, [processing, selectedConfig.amount]);

  const coinUri = coinSvgUri || coinAssetDefaultUri;

  const renderCoinStack = (variant) => {
    const stackStyles = [styles.coinStack];
    if (variant === 'row') stackStyles.push(styles.coinStackRow);
    if (variant === 'hero') stackStyles.push(styles.coinStackHero);
    if (variant === 'cta') stackStyles.push(styles.coinStackCta);

    return (
      <View style={stackStyles}>
        {coinUri ? (
          <>
            <SvgUri width={22} height={22} uri={coinUri} style={[styles.coin, styles.coinBack]} />
            <SvgUri width={22} height={22} uri={coinUri} style={[styles.coin, styles.coinMid]} />
            <SvgUri width={22} height={22} uri={coinUri} style={[styles.coin, styles.coinFront]} />
          </>
        ) : (
          <View style={[styles.coinFallback, { borderColor: colors.border }]} />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AvatarHeroAnimated fixed height={COVER_HEIGHT} colorsOverride={colors}>
        <View style={styles.heroContent}>
          <View style={styles.heroIconWrap}>{renderCoinStack('hero')}</View>
          <Text style={styles.heroTitle}>Kupi HAJP coine</Text>
          <Text style={styles.heroSubtitle}>Izaberi paket HAJP COINA i otkrij vise profila.</Text>
        </View>
      </AvatarHeroAnimated>
      <StatusBar style="light" />
      <View style={styles.body}>
        <View style={styles.infoBlock}>
          {INFO_LINES.map((line) => (
            <Text key={line} style={styles.infoText}>
              {line}
            </Text>
          ))}
        </View>

        <View style={styles.perks}>
          {BENEFITS.map((benefit, idx) => (
            <View
              key={benefit}
              style={[styles.perkRow, idx === BENEFITS.length - 1 && styles.perkRowLast]}
            >
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.perkText}>{benefit}</Text>
            </View>
          ))}
        </View>

        <View style={styles.planList}>
          {COIN_BUNDLES.map((bundle) => (
            <TouchableOpacity
              key={bundle.key}
              style={[styles.plan, selectedBundle === bundle.key && styles.planSelected]}
              activeOpacity={0.9}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setSelectedBundle(bundle.key);
              }}
            >
              {bundle.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{bundle.badge}</Text>
                </View>
              ) : null}
              <View style={styles.planHeader}>
                <View style={styles.planColumn}>
                  <View style={styles.planTitleRow}>
                    {renderCoinStack('row')}
                    <View style={styles.planTextBlock}>
                      <Text style={styles.planLabel}>{`${bundle.amount} HAJP COINA`}</Text>
                      <Text style={styles.planSubtext}>{bundle.label}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.priceColumn}>
                  <Text style={styles.planPrice}>{bundle.price}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.fixedCta}>
        <TouchableOpacity
          style={[styles.ctaButton, processing && styles.ctaButtonDisabled]}
          onPress={handleBuy}
          activeOpacity={0.85}
          disabled={processing}
        >
          <View style={styles.ctaContent}>
            {renderCoinStack('cta')}
            <Text style={styles.ctaText}>
              {processing ? 'Obrada...' : `Kupi ${selectedConfig.amount} HAJP COINA`}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
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
    body: {
      flex: 1,
      marginTop: COVER_HEIGHT,
      paddingHorizontal: 20,
      paddingTop: SECTION_GAP,
      paddingBottom: CTA_HEIGHT + 12,
      gap: SECTION_GAP,
    },
    heroContent: {
      alignItems: 'center',
      gap: 8,
      paddingTop: 8,
      paddingBottom: 12,
    },
    heroIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(0,0,0,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
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
    infoBlock: {
      gap: 4,
      alignItems: 'center',
    },
    infoText: {
      color: '#a9adc6',
      fontSize: 12,
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
    },
    planColumn: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    planTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    planTextBlock: {
      gap: 4,
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
    fixedCta: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 20,
      paddingBottom: 24,
      paddingTop: 10,
      backgroundColor: 'rgba(0,0,0,0.18)',
    },
    ctaButton: {
      backgroundColor: colors.primary,
      borderRadius: 999,
      paddingVertical: 16,
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.45,
      elevation: 12,
    },
    ctaButtonDisabled: {
      opacity: 0.7,
    },
    ctaContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '800',
      textAlign: 'center',
    },
    coinStack: {
      width: 40,
      height: 32,
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
    },
    coinStackRow: {
      marginRight: 12,
    },
    coinStackHero: {
      transform: [{ scale: 1.4 }],
    },
    coinStackCta: {
      transform: [{ scale: 1.1 }],
      marginRight: 10,
    },
    coin: {
      position: 'absolute',
    },
    coinBack: {
      left: 2,
      top: 8,
      opacity: 0.5,
    },
    coinMid: {
      left: 8,
      top: 4,
      opacity: 0.75,
    },
    coinFront: {
      left: 14,
      top: 0,
    },
    coinFallback: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      backgroundColor: colors.surface,
    },
  });
