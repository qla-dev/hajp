import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { Ionicons } from '@expo/vector-icons';
import { SvgUri } from 'react-native-svg';
import { Asset } from 'expo-asset';
import { useTheme, useThemedStyles } from '../theme/darkMode';

const coinAsset = require('../../assets/svg/coin.svg');
const coinAssetDefaultUri = Asset.fromModule(coinAsset).uri;

const PayBottomSheet = React.forwardRef(
  (
    {
      title = 'Otkrij ko ti gleda profil',
      subtitle = 'Izaberi nacin otkljucavanja',
      coinPrice = 50,
      onPayWithCoins,
      onActivatePremium,
      onClose,
      modalHeight = 420,
      defaultOption = 'coins',
    },
    ref,
  ) => {
    const { colors } = useTheme();
    const styles = useThemedStyles((c, isDark) => createStyles(c, isDark));
    const [selectedOption, setSelectedOption] = useState(defaultOption);
    const [coinSvgUri, setCoinSvgUri] = useState(coinAssetDefaultUri || null);

    const priceLabel = useMemo(() => {
      const value = Number(coinPrice);
      if (!Number.isFinite(value)) return '...';
      return String(Math.max(0, Math.floor(value)));
    }, [coinPrice]);

    const handleConfirm = useCallback(() => {
      if (selectedOption === 'premium') {
        onActivatePremium?.();
      } else {
        onPayWithCoins?.(coinPrice);
      }
    }, [coinPrice, onActivatePremium, onPayWithCoins, selectedOption]);

    useEffect(() => {
      setSelectedOption(defaultOption);
    }, [defaultOption]);

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

    const handleClosed = useCallback(() => {
      setSelectedOption(defaultOption);
      onClose?.();
    }, [defaultOption, onClose]);

    const isCoins = selectedOption !== 'premium';
    const actionLabel = isCoins ? `Plati ${priceLabel} coinova` : 'Aktiviraj Premium';
    const coinUri = coinSvgUri || coinAssetDefaultUri;

    return (
      <Modalize
        ref={ref}
        snapPoint={modalHeight}
        modalHeight={modalHeight}
        handleStyle={styles.handle}
        modalStyle={styles.modal}
        overlayStyle={styles.overlay}
        panGestureEnabled
        adjustToContentHeight={false}
        scrollViewProps={{ contentContainerStyle: styles.scrollContent }}
        onClosed={handleClosed}
      >
        <View style={styles.content}>
          <View style={styles.body}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

            <View style={styles.optionList}>
              <TouchableOpacity
                style={[styles.optionCard, isCoins && styles.optionCardSelected]}
                activeOpacity={0.9}
                onPress={() => setSelectedOption('coins')}
              >
                <View style={styles.optionIcon}>
                  <View style={styles.coinStack}>
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
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Plati HAJP COINIMA</Text>
                  <Text style={styles.optionMeta}>{`${priceLabel} coinova`}</Text>
                </View>
                <Ionicons
                  name={isCoins ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={isCoins ? colors.primary : colors.text_secondary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionCard, !isCoins && styles.optionCardSelected]}
                activeOpacity={0.9}
                onPress={() => setSelectedOption('premium')}
              >
                <View style={styles.optionIcon}>
                  <View style={[styles.iconBadge, { backgroundColor: colors.primary }]}>
                    <Ionicons name="diamond" size={20} color={colors.textLight} />
                  </View>
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Aktiviraj Premium</Text>
                  <Text style={styles.optionMeta}>Otkljucaj sve profile</Text>
                </View>
                <Ionicons
                  name={!isCoins ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={!isCoins ? colors.primary : colors.text_secondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.submit} onPress={handleConfirm}>
            <Text style={styles.submitText}>{actionLabel}</Text>
          </TouchableOpacity>
        </View>
      </Modalize>
    );
  },
);

export default PayBottomSheet;

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    modal: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      backgroundColor: colors.surface,
      paddingBottom: 24,
      zIndex: 999999,
      elevation: 30,
    },
    overlay: {
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    handle: {
      backgroundColor: colors.text_secondary,
      width: 80,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 20,
      justifyContent: 'space-between',
    },
    scrollContent: {
      flexGrow: 1,
    },
    body: {
      gap: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text_primary,
    },
    subtitle: {
      fontSize: 14,
      color: colors.text_secondary,
    },
    optionList: {
      marginTop: 6,
      gap: 12,
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface,
    },
    optionCardSelected: {
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOpacity: 0.18,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
    optionIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.background,
    },
    iconBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionText: {
      flex: 1,
      gap: 4,
    },
    optionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text_primary,
    },
    optionMeta: {
      fontSize: 13,
      color: colors.text_secondary,
    },
    coinStack: {
      width: 40,
      height: 32,
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
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
    submit: {
      marginTop: 12,
      marginBottom: 4,
      backgroundColor: colors.primary,
      borderRadius: 30,
      paddingVertical: 18,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOpacity: 0.25,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    submitText: {
      color: colors.textLight,
      fontSize: 18,
      fontWeight: '700',
    },
  });
