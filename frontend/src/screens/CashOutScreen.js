import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { postRoomCashout } from '../api';

export default function CashOutScreen({ route, navigation }) {
  const { roomId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const pulse = useRef(new Animated.Value(1)).current;
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

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
      navigation.replace('NextPollCountdown', {
        roomId,
        pollId: data?.cashout?.poll_id,
        nextPollAt: data?.next_poll_at,
      });
    } catch (err) {
      setErrorMessage(err?.response?.data?.message ?? 'Greška pri isplati.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="always"
    >
      <View style={styles.card}>
        <Text style={styles.title}>Čestitamo!</Text>
        <Text style={styles.subtitle}>Možete podići 10 coinova za zadnju anketu.</Text>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: pulse }] }]}>
          <TouchableOpacity style={styles.button} onPress={handleCashout} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={colors.text_primary} />
            ) : (
            <Text style={styles.buttonText}>Isplate · 10 coinova</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      paddingTop: 24,
      paddingHorizontal: 20,
      justifyContent: 'center',
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
  });
