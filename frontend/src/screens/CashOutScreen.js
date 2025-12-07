import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { postRoomCashout } from '../api';
import LottieView from 'lottie-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

export default function CashOutScreen({ route, navigation }) {
  const { roomId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [celebrating, setCelebrating] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;
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
      const { data } = await postRoomCashout(roomId);
      setCelebrating(true);
      confettiTimer.current = setTimeout(() => {
        navigation.replace('NextPollCountdown', {
          roomId,
          pollId: data?.cashout?.poll_id,
          nextPollAt: data?.next_poll_at,
        });
      }, 5000);
    } catch (err) {
      setErrorMessage(err?.response?.data?.message ?? 'Greška pri isplati.');
    } finally {
      setLoading(false);
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
            <TouchableOpacity style={styles.button} onPress={handleCashout} disabled={loading || celebrating}>
              {loading ? (
                <ActivityIndicator color={colors.text_primary} />
              ) : (
                <Text style={styles.buttonText}>Isplata · 10 coinova</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
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
  });
