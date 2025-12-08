import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  UIManager,
  findNodeHandle,
  Easing,
  Dimensions,
} from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { postRoomCashout, fetchCoinBalance } from '../api';
import LottieView from 'lottie-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { updateCoinBalance } from '../utils/coinHeaderTracker';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function CashOutScreen({ route, navigation }) {
  const { roomId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [celebrating, setCelebrating] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferCoins, setTransferCoins] = useState([]);
  const pulse = useRef(new Animated.Value(1)).current;
  const buttonRef = useRef(null);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const confettiTimer = useRef(null);
  const confettiRef = useRef(null);

  useEffect(() => () => clearTimeout(confettiTimer.current), []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const handleCashout = async () => {
    if (!roomId) return;
    setLoading(true);
    setErrorMessage('');
    try {
      await Haptics.selectionAsync();
      const { data } = await postRoomCashout(roomId);
      setCelebrating(true);
      const animationPromise = animateCoinTransfer();
      const refreshPromise = refreshCoinTotals();
      await Promise.allSettled([animationPromise, refreshPromise]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      confettiTimer.current = setTimeout(() => {
        navigation.replace('NextPollCountdown', {
          roomId,
          pollId: data?.cashout?.poll_id,
          nextPollAt: data?.next_poll_at,
        });
      }, 2000);
    } catch (err) {
      setErrorMessage(err?.response?.data?.message ?? 'Greška pri isplati.');
    } finally {
      setLoading(false);
    }
  };

  const measureButton = () =>
    new Promise((resolve) => {
      const node = findNodeHandle(buttonRef.current);
      if (!node) return resolve(null);
      UIManager.measure(node, (_x, _y, width, height, pageX, pageY) => {
        resolve({ width, height, pageX, pageY });
      });
    });

  const animateCoinTransfer = async () => {
    const buttonLayout = await measureButton();
    if (!buttonLayout) return;
    const coinSize = 26;
    const startX = buttonLayout.pageX + buttonLayout.width / 2 - coinSize / 2;
    const startY = buttonLayout.pageY + buttonLayout.height / 2 - coinSize / 2;
    const horizontalInset = 12;
    const verticalInset = 20;
    const screenWidth = Dimensions.get('window').width;
    const endX = screenWidth - coinSize - horizontalInset;
    const endY = verticalInset;
    const coins = Array.from({ length: 10 }, (_, index) => ({
      id: `${Date.now()}-${index}`,
      anim: new Animated.ValueXY({ x: startX, y: startY }),
      fade: new Animated.Value(1),
      target: {
        x: endX + (index % 2 === 0 ? 4 : -4) * (index / 2),
        y: endY - index * 1.5,
      },
    }));
    setTransferCoins(coins);
    setShowTransfer(true);
    await Promise.all(
      coins.map(
        ({ anim, fade, target }, index) =>
          new Promise((resolve) => {
            Animated.parallel([
              Animated.timing(anim, {
                toValue: target,
                duration: 1500,
                delay: index * 80,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
              }),
              Animated.sequence([
                Animated.delay(index * 80 + 1000),
                Animated.timing(fade, {
                  toValue: 0,
                  duration: 400,
                  useNativeDriver: false,
                }),
              ]),
            ]).start(() => resolve());
          }),
      ),
    );
    setTimeout(() => {
      setShowTransfer(false);
      setTransferCoins([]);
    }, 300);
  };

  const refreshCoinTotals = async () => {
    try {
      const { data } = await fetchCoinBalance();
      updateCoinBalance(data?.coins ?? 0);
    } catch (refreshErr) {
      console.warn('Failed to refresh coins after cashout', refreshErr);
    }
  };

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.animationWrapper}>
          <LottieView
            source={{ uri: 'https://cdn.lordicon.com/jvucoldz.json' }}
            autoPlay
            loop
            style={styles.lottie}
            colorFilters={[{ keypath: '**', color: colors.primary }]}
          />
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Čestitamo!</Text>
          <Text style={styles.subtitle}>Možete podići 10 coinova za zadnju anketu.</Text>
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: pulse }] }]}>
            <TouchableOpacity
              ref={buttonRef}
              style={styles.button}
              onPress={handleCashout}
              disabled={loading || celebrating}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Isplata · 10 coinova</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
      {showTransfer &&
        transferCoins.map((coin) => (
          <Animated.View
            key={coin.id}
            style={[
              styles.transferCoin,
              {
                transform: coin.anim.getTranslateTransform(),
                opacity: coin.fade,
              },
            ]}
            pointerEvents="none"
          >
            <Ionicons name="logo-bitcoin" size={18} color={colors.primary} />
          </Animated.View>
        ))}
      {celebrating && (
        <View style={styles.confettiWrapper} pointerEvents="none">
          <ConfettiCannon
            count={120}
            origin={{ x: 0, y: 0 }}
            colors={[colors.primary, colors.secondary]}
            fadeOut
            autoStart
            fallSpeed={8000}
            ref={confettiRef}
          />
        </View>
      )}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: colors.background,
      position: 'relative',
    },
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      alignItems: 'center',
      padding: 28,
      borderRadius: 24,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: 'rgba(0,0,0,0.15)',
      shadowOpacity: 0.05,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
    animationWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      padding: 16,
      backgroundColor: 'transparent',
    },
    lottie: {
      width: 180,
      height: 180,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text_primary,
    },
    subtitle: {
      fontSize: 16,
      textAlign: 'center',
      color: colors.text_secondary,
      lineHeight: 22,
    },
    buttonWrapper: {
      marginTop: 12,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 30,
      paddingHorizontal: 36,
      paddingVertical: 16,
      minWidth: 220,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textLight,
    },
    error: {
      color: colors.error,
      fontSize: 14,
      textAlign: 'center',
    },
    confettiWrapper: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 20,
    },
    transferCoin: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOpacity: 0.35,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
      zIndex: 35,
    },
  });
