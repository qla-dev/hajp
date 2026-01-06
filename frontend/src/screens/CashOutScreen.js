import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { updateCoinBalance, getCachedCoinBalance } from '../utils/coinHeaderTracker';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { SvgUri } from 'react-native-svg';
import { Asset } from 'expo-asset';
const coinSoundAsset = require('../../assets/sounds/coins.mp3');
const applauseSoundAsset = require('../../assets/sounds/applause.mp3');

export default function CashOutScreen({ route, navigation }) {
  const { roomId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [celebrating, setCelebrating] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferCoins, setTransferCoins] = useState([]);
  const [coinBalance, setCoinBalance] = useState(getCachedCoinBalance() ?? null);
  const pulse = useRef(new Animated.Value(1)).current;
  const buttonRef = useRef(null);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [coinSvgUri, setCoinSvgUri] = useState(null);
  const confettiTimer = useRef(null);
  const confettiRef = useRef(null);
  const coinSoundRef = useRef(null);
  const applauseSoundRef = useRef(null);
  const handleConfettiComplete = () => setCelebrating(false);

  useEffect(() => () => clearTimeout(confettiTimer.current), []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      const parent = navigation.getParent();
      if (parent) {
        parent.setParams({ refreshRooms: Date.now() });
      }
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(coinSoundAsset, { shouldPlay: false });
        const { sound: applause } = await Audio.Sound.createAsync(applauseSoundAsset, { shouldPlay: false });
        const coinAsset = Asset.fromModule(require('../../assets/svg/coin.svg'));
        await coinAsset.downloadAsync();
        if (isMounted) {
          setCoinSvgUri(coinAsset.localUri || coinAsset.uri);
        }
        if (isMounted) {
          coinSoundRef.current = sound;
          applauseSoundRef.current = applause;
          // Kick off celebration on load
          Haptics.selectionAsync().catch(() => {});
          applause.replayAsync().then(() => fadeOutApplause()).catch(() => {});
          setCelebrating(true);
        } else {
          await sound.unloadAsync();
          await applause.unloadAsync();
        }
      } catch (loadError) {
        console.warn('Failed to load coin sound', loadError);
      }
    })();
    return () => {
      isMounted = false;
      coinSoundRef.current?.unloadAsync();
      applauseSoundRef.current?.unloadAsync();
      coinSoundRef.current = null;
      applauseSoundRef.current = null;
    };
  }, []);

  useEffect(() => {
    // Ensure header coin indicator shows current balance on entry
    fetchCoinBalance()
      .then(({ data }) => {
        const coins = data?.coins ?? 0;
        setCoinBalance(coins);
        updateCoinBalance(coins);
      })
      .catch(() => {
        setCoinBalance(null);
      });
  }, []);

  const playCoinSound = () => {
    coinSoundRef.current?.replayAsync().catch(() => {});
  };

  const fadeOutApplause = () => {
    const sound = applauseSoundRef.current;
    if (!sound) return;
    // Let it play at full volume for ~5s, then fade over ~1s
    setTimeout(() => {
      let volume = 1;
      const step = 0.12;
      const interval = setInterval(async () => {
        volume = Math.max(0, volume - step);
        try {
          await sound.setVolumeAsync(volume);
          if (volume <= 0) {
            clearInterval(interval);
            await sound.stopAsync();
            await sound.setVolumeAsync(1);
          }
        } catch {
          clearInterval(interval);
        }
      }, 120);
    }, 5000);
  };

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
    playCoinSound();
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
      const coins = data?.coins ?? 0;
      setCoinBalance(coins);
      updateCoinBalance(coins);
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
      <View style={styles.balanceRow}>
        {coinSvgUri ? (
          <SvgUri width={28} height={28} uri={coinSvgUri} />
        ) : (
          <View style={styles.balanceIconFallback}>
                <Text style={styles.balanceIconFallbackText}>ƒ,æ</Text>
              </View>
            )}
            <Text style={styles.balanceLabel}>
              Trenutno stanje: {coinBalance !== null ? coinBalance : '...'}
            </Text>
          </View>
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: pulse }] }]}>
            <TouchableOpacity
              ref={buttonRef}
              style={styles.button}
              onPress={handleCashout}
              disabled={loading}
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
            {coinSvgUri ? (
              <SvgUri width={24} height={24} uri={coinSvgUri} />
            ) : (
              <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.primary, fontWeight: '800' }}>₵</Text>
              </View>
            )}
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
            onAnimationEnd={handleConfettiComplete}
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
      zIndex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: 'transparent',
      zIndex: 2,
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
    balanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 10,
      marginBottom: 6,
    },
    balanceLabel: {
      fontSize: 14,
      color: colors.text_primary,
      fontWeight: '700',
    },
    balanceIconFallback: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    balanceIconFallbackText: {
      color: colors.textLight,
      fontWeight: '800',
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
      zIndex: 0,
    },
    transferCoin: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: 36,
      height: 36,
      borderRadius: 18,
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
