import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Audio } from 'expo-av';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import { SvgUri } from 'react-native-svg';
import { Asset } from 'expo-asset';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { fetchUserProfile, getCurrentUser, payProfileView, payVote } from '../api';
import { updateCoinBalance } from '../utils/coinHeaderTracker';
import Avatar from '../components/Avatar';
import BottomCTA from '../components/BottomCTA';
import { generateRandomConfig } from '../utils/bigHeadAvatar';

const shuffleSoundAsset = require('../../assets/sounds/shuffle.mp3');
const drumsSoundAsset = require('../../assets/sounds/drums.mp3');
const connectSoundAsset = require('../../assets/sounds/connect.mp3');
const coinAsset = require('../../assets/svg/coin.svg');
const coinAssetDefaultUri = Asset.fromModule(coinAsset).uri;

const SHUFFLE_STEPS = 10;
const SHUFFLE_START_DELAY = 240;
const SHUFFLE_END_DELAY = 60;
const AVATAR_SIZE = 180;
const HAIR_BLOCKED_WITH_HAT = new Set(['long', 'bob']);
const HAT_BLOCKING_VALUES = new Set(['beanie', 'turban']);
const HAIR_FALLBACK = 'pixie';
const BODY_FEMALE_VALUE = 'breasts';
const BODY_MALE_VALUE = 'chest';

const normalizeGender = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'girl' || normalized === 'female' || normalized === 'woman') return 'female';
  if (normalized === 'boy' || normalized === 'male' || normalized === 'man') return 'male';
  return undefined;
};

const sanitizeHairHatForHat = (cfg = {}) => {
  if (cfg.hat === 'hijab') {
    return { ...cfg, hair: HAIR_FALLBACK };
  }
  if (HAIR_BLOCKED_WITH_HAT.has(cfg.hair) && HAT_BLOCKING_VALUES.has(cfg.hat)) {
    return { ...cfg, hair: HAIR_FALLBACK };
  }
  return cfg;
};

const sanitizeHairHatForHair = (cfg = {}) => {
  if (cfg.hat === 'hijab' && cfg.hair !== HAIR_FALLBACK) {
    return { ...cfg, hair: HAIR_FALLBACK };
  }
  if (HAIR_BLOCKED_WITH_HAT.has(cfg.hair) && HAT_BLOCKING_VALUES.has(cfg.hat)) {
    return { ...cfg, hat: 'none' };
  }
  return cfg;
};

const applyBodyMouth = (cfg = {}) => {
  if (cfg.body === BODY_FEMALE_VALUE && cfg.mouth !== 'lips') {
    return { ...cfg, mouth: 'lips' };
  }
  if (cfg.body === BODY_MALE_VALUE && cfg.mouth !== 'openSmile') {
    return { ...cfg, mouth: 'openSmile' };
  }
  return cfg;
};

const applyGenderLashes = (cfg = {}) => {
  if (cfg.body === BODY_FEMALE_VALUE && cfg.lashes !== true) {
    return { ...cfg, lashes: true };
  }
  if (cfg.body === BODY_MALE_VALUE && cfg.lashes !== false) {
    return { ...cfg, lashes: false };
  }
  return cfg;
};

const applyAvatarRules = (cfg = {}) =>
  applyGenderLashes(applyBodyMouth(sanitizeHairHatForHair(sanitizeHairHatForHat(cfg))));

const buildRandomConfig = (gender) =>
  applyAvatarRules(generateRandomConfig({ gender, circleBg: true }));

export default function RevealScreen({ route, navigation }) {
  const params = route?.params || {};
  const revealType = params.type || 'vote';
  const targetUserId = params.targetUserId || null;
  const voteId = params.voteId || null;
  const visitorId = params.visitorId || null;
  const coinPrice = params.coinPrice ?? 50;
  const initialUser = params.targetUser || null;
  const [revealedUser, setRevealedUser] = useState(initialUser);
  const [randomConfig, setRandomConfig] = useState(() =>
    buildRandomConfig(normalizeGender(params.targetGender || initialUser?.sex)),
  );
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [coinSvgUri, setCoinSvgUri] = useState(coinAssetDefaultUri || null);
  const [celebrating, setCelebrating] = useState(false);
  const shuffleScale = useRef(new Animated.Value(1)).current;
  const shuffleSoundRef = useRef(null);
  const drumsSoundRef = useRef(null);
  const connectSoundRef = useRef(null);
  const redirectTimerRef = useRef(null);
  const isMountedRef = useRef(true);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const titleText = params.title || (revealType === 'profile_view' ? 'Otkrij ko ti gleda profil' : 'Otkrij ko te hajpa');
  const subtitleText = params.subtitle || 'Potvrdi otkrivanje korisnika.';
  const priceLabel = useMemo(() => {
    const value = Number(coinPrice);
    if (!Number.isFinite(value)) return '...';
    return String(Math.max(0, Math.floor(value)));
  }, [coinPrice]);
  const coinUri = coinSvgUri || coinAssetDefaultUri;
  const ctaLabel =
    loading || isShuffling ? 'Obrada...' : `Otkrij za ${priceLabel} HAJP TOKENA`;
  const ctaDisabled = loading || isShuffling || revealed;
  const revealedIdentity = useMemo(() => {
    const source = revealedUser || initialUser || null;
    const name = source?.name || 'Korisnik';
    const rawUsername = source?.username || null;
    return {
      name,
      username: rawUsername ? `@${rawUsername}` : null,
    };
  }, [initialUser, revealedUser]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTimeout(redirectTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { sound: shuffleSound } = await Audio.Sound.createAsync(shuffleSoundAsset, { shouldPlay: false });
        const { sound: drumsSound } = await Audio.Sound.createAsync(drumsSoundAsset, { shouldPlay: false });
        const { sound: connectSound } = await Audio.Sound.createAsync(connectSoundAsset, { shouldPlay: false });
        if (mounted) {
          shuffleSoundRef.current = shuffleSound;
          drumsSoundRef.current = drumsSound;
          connectSoundRef.current = connectSound;
        } else {
          await shuffleSound.unloadAsync();
          await drumsSound.unloadAsync();
          await connectSound.unloadAsync();
        }
      } catch {
        // ignore audio load errors
      }
    })();
    return () => {
      mounted = false;
      shuffleSoundRef.current?.unloadAsync();
      drumsSoundRef.current?.unloadAsync();
      connectSoundRef.current?.unloadAsync();
      shuffleSoundRef.current = null;
      drumsSoundRef.current = null;
      connectSoundRef.current = null;
    };
  }, []);

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

  const playShuffleSound = useCallback(() => {
    shuffleSoundRef.current?.replayAsync().catch(() => {});
  }, []);

  const playDrumsSound = useCallback(() => {
    drumsSoundRef.current?.replayAsync().catch(() => {});
  }, []);

  const playConnectSound = useCallback(() => {
    connectSoundRef.current?.replayAsync().catch(() => {});
  }, []);

  const bumpAvatar = useCallback(() => {
    shuffleScale.stopAnimation();
    shuffleScale.setValue(0.96);
    Animated.spring(shuffleScale, {
      toValue: 1,
      friction: 6,
      tension: 140,
      useNativeDriver: true,
    }).start();
  }, [shuffleScale]);

  const loadTargetUser = useCallback(async () => {
    if (!targetUserId) return initialUser || null;
    if (initialUser?.id === targetUserId) return initialUser;
    try {
      const { data } = await fetchUserProfile(targetUserId);
      return data?.data || data || initialUser || null;
    } catch {
      return initialUser || null;
    }
  }, [initialUser, targetUserId]);

  const runShuffleSequence = useCallback(async () => {
    const resolvedGender = normalizeGender(params.targetGender || revealedUser?.sex || initialUser?.sex);
    const delayStep =
      SHUFFLE_STEPS > 1 ? (SHUFFLE_START_DELAY - SHUFFLE_END_DELAY) / (SHUFFLE_STEPS - 1) : 0;
    setIsShuffling(true);
    playDrumsSound();
    for (let index = 0; index < SHUFFLE_STEPS; index += 1) {
      if (!isMountedRef.current) return;
      setRandomConfig(buildRandomConfig(resolvedGender));
      playShuffleSound();
      bumpAvatar();
      const delay = Math.max(
        SHUFFLE_END_DELAY,
        Math.round(SHUFFLE_START_DELAY - delayStep * index),
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    if (isMountedRef.current) {
      setIsShuffling(false);
    }
  }, [bumpAvatar, initialUser?.sex, params.targetGender, playDrumsSound, playShuffleSound, revealedUser?.sex]);

  const handleReveal = useCallback(async () => {
    if (loading || revealed || isShuffling) return;
    setLoading(true);
    setErrorMessage('');
    try {
      Haptics.selectionAsync().catch(() => {});
      const current = await getCurrentUser();
      const userId = current?.id;
      if (!userId) {
        setErrorMessage('Nismo mogli potvrditi korisnika.');
        return;
      }
      const normalizedPrice = Number(coinPrice);
      const amount = Number.isFinite(normalizedPrice)
        ? Math.max(1, Math.floor(normalizedPrice))
        : 1;
      let response;
      if (revealType === 'profile_view') {
        const targetId = visitorId || targetUserId;
        if (!targetId) {
          setErrorMessage('Nismo mogli pronaci profil.');
          return;
        }
        response = await payProfileView(userId, { visitor_id: targetId, amount });
      } else {
        if (!voteId) {
          setErrorMessage('Nismo mogli pronaci hajp.');
          return;
        }
        response = await payVote(userId, { vote_id: voteId, amount });
      }
      const data = response?.data;
      if (typeof data?.coins === 'number') {
        updateCoinBalance(data.coins);
      }
      const resolvedUser = await loadTargetUser();
      if (resolvedUser) {
        setRevealedUser(resolvedUser);
      }
      await runShuffleSequence();
      if (!isMountedRef.current) return;
      setRevealed(true);
      setCelebrating(true);
      playConnectSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      redirectTimerRef.current = setTimeout(() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }, 6000);
    } catch (error) {
      const message = error?.response?.data?.message || 'Nismo mogli otkriti korisnika.';
      const status = error?.response?.status;
      if (status === 422 && typeof message === 'string' && message.toLowerCase().includes('coin')) {
        navigation.navigate('BuyCoins');
        return;
      }
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, [
    coinPrice,
    isShuffling,
    loadTargetUser,
    loading,
    navigation,
    playConnectSound,
    revealType,
    revealed,
    runShuffleSequence,
    targetUserId,
    visitorId,
    voteId,
  ]);

  const displayRandom = isShuffling || !revealedUser;
  const showBlur = !revealed && !isShuffling;
  const avatarNode = displayRandom ? (
    <Avatar
      avatarConfig={randomConfig}
      name="Korisnik"
      size={AVATAR_SIZE}
      variant="avatar-xl"
      zoomModal={false}
      bgMode="random"
    />
  ) : (
    <Avatar
      user={revealedUser}
      name={revealedUser?.name || revealedUser?.username || 'Korisnik'}
      size={AVATAR_SIZE}
      variant="avatar-xl"
      zoomModal={false}
    />
  );
  const coinStackNode = (
    <View style={[styles.coinStack, styles.coinStackCta]}>
      {coinUri ? (
        <>
          <SvgUri width={22} height={22} uri={coinUri} style={[styles.coin, styles.coinBack]} />
          <SvgUri width={22} height={22} uri={coinUri} style={[styles.coin, styles.coinMid]} />
          <SvgUri width={22} height={22} uri={coinUri} style={[styles.coin, styles.coinFront]} />
        </>
      ) : (
        <View style={styles.coinFallback} />
      )}
    </View>
  );

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        {revealed ? (
          <View style={styles.revealIdentity}>
            <Text style={styles.revealName}>{revealedIdentity.name}</Text>
            {revealedIdentity.username ? (
              <Text style={styles.revealUsername}>{revealedIdentity.username}</Text>
            ) : null}
          </View>
        ) : null}
        <Animated.View style={[styles.avatarShell, { transform: [{ scale: shuffleScale }] }]}>
          {avatarNode}
          {showBlur ? (
            <BlurView intensity={20} tint="default" style={styles.avatarBlur} pointerEvents="none" />
          ) : null}
        </Animated.View>

        <View style={styles.card}>
          <Text style={styles.title}>{titleText}</Text>
          {subtitleText ? <Text style={styles.subtitle}>{subtitleText}</Text> : null}
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        </View>
      </View>

      <BottomCTA
        label={ctaLabel}
        onPress={handleReveal}
        fixed
        disabled={ctaDisabled}
        leading={coinStackNode}
        style={styles.bottomCta}
      />

      {celebrating && (
        <View style={styles.confettiWrapper} pointerEvents="none">
          <ConfettiCannon
            count={120}
            origin={{ x: 0, y: 0 }}
            colors={[colors.primary, colors.secondary]}
            fadeOut
            autoStart
            fallSpeed={8000}
            onAnimationEnd={() => setCelebrating(false)}
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
    },
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingBottom: 24,
      gap: 18,
    },
    avatarShell: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    avatarBlur: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 999,
    },
    card: {
      alignItems: 'center',
      padding: 24,
      borderRadius: 24,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: 'rgba(0,0,0,0.15)',
      shadowOpacity: 0.05,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
      width: '100%',
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text_primary,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: colors.text_secondary,
      textAlign: 'center',
      marginTop: 6,
    },
    bottomCta: {
      paddingHorizontal: 24,
      paddingBottom: 24,
    },
    coinStack: {
      width: 40,
      height: 32,
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
    },
    coinStackCta: {
      transform: [{ scale: 1.1 }],
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
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    revealIdentity: {
      alignItems: 'center',
      gap: 2,
    },
    revealName: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text_primary,
    },
    revealUsername: {
      fontSize: 14,
      color: colors.text_secondary,
      fontWeight: '600',
    },
    error: {
      color: colors.error,
      fontSize: 13,
      textAlign: 'center',
      marginTop: 8,
    },
    confettiWrapper: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 0,
    },
  });
