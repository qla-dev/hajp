import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { SvgUri } from 'react-native-svg';
import { Asset } from 'expo-asset';
import { useTheme } from '../theme/darkMode';

const coinAsset = require('../../assets/svg/coin.svg');
const coinAssetUri = Asset.fromModule(coinAsset).uri;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CIRCLE_SIZE = 100;
const STROKE_WIDTH = 8;
const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function PollItem({
  roomName,
  question,
  emoji,
  answered = 0,
  total = 0,
  options = [],
  onSelect,
  loading,
  disabled,
  accentColor,
  onCardPress,
  style,
  badgeLabel,
}) {
  const { colors } = useTheme();

  const completion = total ? Math.min(answered / total, 1) : 0;
  const percentage = Math.round(completion * 100);
  const progressLabel = `${answered}/${total}`;

  const animatedProgress = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animatedProgress.setValue(0);
    Animated.timing(animatedProgress, {
      toValue: completion,
      duration: 1400,
      useNativeDriver: false,
    }).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, [completion]);

  const handleCirclePress = () => {
    animatedProgress.setValue(0);
    Animated.timing(animatedProgress, {
      toValue: completion,
      duration: 1400,
      useNativeDriver: false,
    }).start();
  };

  const accent = accentColor;
  const Container = onCardPress ? TouchableOpacity : View;
  const containerProps = onCardPress ? { activeOpacity: 0.9, onPress: onCardPress } : {};

  // Determine badge color based on status
  const isCompleted = badgeLabel === 'Isplaćeno' || badgeLabel === 'Isplati odmah';
  const badgeColor = isCompleted ? colors.secondary : colors.primary;

  // Calculate percentages that add up to 100%
  const vibe1 = percentage;
  const vibe2 = Math.min(percentage + 10, 100);
  const vibe3 = Math.max(percentage - 10, 0);
  const total_vibes = vibe1 + vibe2 + vibe3;
  
  const vibeData = [
    { 
      label: 'Good vibes', 
      emoji: '✨',
      color: '#FFD700',
      percent: total_vibes > 0 ? Math.round((vibe1 / total_vibes) * 100) : 33
    },
    { 
      label: 'Summer energy', 
      emoji: '🌈',
      color: '#FF6B9D',
      percent: total_vibes > 0 ? Math.round((vibe2 / total_vibes) * 100) : 33
    },
    { 
      label: 'Stay consistent', 
      emoji: '🔥',
      color: '#FF4500',
      percent: total_vibes > 0 ? Math.round((vibe3 / total_vibes) * 100) : 34
    },
  ];

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Container
      {...containerProps}
      style={[styles.card, { backgroundColor: colors.transparent, borderColor: accent }, style]}
    >
      {/* FLOATING HEADER with badge */}
      <View style={styles.floatingHeader}>
        <Text style={[styles.roomName, { color: colors.text_primary }]} numberOfLines={1}>
          {roomName || 'Neimenovana soba'}
        </Text>
        <View style={styles.badgeColumn}>
          <View style={[styles.badge, { borderColor: badgeColor, backgroundColor: 'transparent' }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>{progressLabel}</Text>
            <SvgUri width={10} height={10} uri={coinAssetUri} />
          </View>
          <Text style={[styles.statusLabel, { color: colors.text_secondary }]}>
            {badgeLabel || 'U progresu'}
          </Text>
        </View>
      </View>

      {/* QUESTION - Above everything, bigger */}
      <Text style={[styles.question, { color: colors.text_primary }]} numberOfLines={3}>
        {question || 'Nema novih anketa za sobu'}
      </Text>

      {/* HERO SECTION: Circle + Vibes in same row */}
      <View style={styles.heroRow}>
        <TouchableOpacity activeOpacity={0.85} onPress={handleCirclePress}>
          <Animated.View style={[styles.circleWrapper, { transform: [{ rotate }] }]}>
            <View style={[styles.circleGlow, { backgroundColor: accent, opacity: 0.15 }]} />
          </Animated.View>
          
          <View style={styles.circle}>
            <View style={styles.circleContent}>
              <Text style={styles.emoji}>{emoji || '😊'}</Text>
              <Text style={[styles.percentage, { color: accent }]}>{percentage}%</Text>
            </View>
            <View style={styles.svgWrapper}>
              <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
                <Defs>
                  <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={accent} stopOpacity="1" />
                    <Stop offset="100%" stopColor={accent} stopOpacity="0.6" />
                  </LinearGradient>
                </Defs>
                <Circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={RADIUS}
                  stroke={colors.surface}
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                />
                <AnimatedCircle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={RADIUS}
                  stroke="url(#progressGradient)"
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={animatedProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [CIRCUMFERENCE, 0],
                  })}
                  strokeLinecap="round"
                  rotation="-90"
                  originX={CIRCLE_SIZE / 2}
                  originY={CIRCLE_SIZE / 2}
                />
              </Svg>
            </View>
          </View>
        </TouchableOpacity>

        {/* VIBES - Single segmented bar */}
        <View style={styles.vibesContainer}>
          {/* Segmented Bar */}
          <View style={[styles.segmentedBar, { backgroundColor: colors.surface }]}>
            {vibeData.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.segment,
                  { 
                    width: `${item.percent}%`,
                    backgroundColor: item.color,
                  },
                  index === 0 && styles.segmentFirst,
                  index === vibeData.length - 1 && styles.segmentLast,
                ]}
              />
            ))}
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            {vibeData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={[styles.legendText, { color: colors.text_secondary }]}>
                  {item.emoji} {item.label}
                </Text>
                <Text style={[styles.legendPercent, { color: item.color }]}>
                  {item.percent}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ACTIONS - Side by side with different styles */}
      {options?.length ? (
        <View style={styles.actionsRow}>
          {loading ? (
            <ActivityIndicator color={accent} />
          ) : (
            <>
              {options[0] && (
                <TouchableOpacity
                  onPress={() => onSelect?.(options[0].value)}
                  disabled={disabled}
                  style={[styles.primaryButton, { backgroundColor: accent }]}
                >
                  <Text style={styles.primaryButtonText} numberOfLines={1}>
                    {options[0].label}
                  </Text>
                </TouchableOpacity>
              )}
              {options[1] && (
                <TouchableOpacity
                  onPress={() => onSelect?.(options[1].value)}
                  disabled={disabled}
                  style={[styles.secondaryButton, { borderColor: accent }]}
                >
                  <Text style={[styles.secondaryButtonText, { color: colors.text_primary }]} numberOfLines={1}>
                    {options[1].label}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      ) : (
        <Text style={[styles.placeholder, { color: colors.text_secondary }]}>
          Nema novih anketa za sobu
        </Text>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    gap: 20,
  },
  floatingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  roomName: {
    fontSize: 18,
    fontWeight: '900',
    flex: 1,
    marginRight: 12,
  },
  badgeColumn: {
    alignItems: 'flex-end',
    gap: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statusLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  question: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
  },
  heroRow: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  circleWrapper: {
    position: 'absolute',
    width: CIRCLE_SIZE + 20,
    height: CIRCLE_SIZE + 20,
    top: -10,
    left: -10,
  },
  circleGlow: {
    width: '100%',
    height: '100%',
    borderRadius: (CIRCLE_SIZE + 20) / 2,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    pointerEvents: 'none',
  },
  circleContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
    lineHeight: 32,
  },
  percentage: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  vibesContainer: {
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  segmentedBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  segment: {
    height: '100%',
  },
  segmentFirst: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  segmentLast: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  legendContainer: {
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  legendPercent: {
    fontSize: 11,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  placeholder: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});