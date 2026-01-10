import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { SvgUri } from 'react-native-svg';
import { Asset } from 'expo-asset';
import { useTheme } from '../theme/darkMode';

const coinAsset = require('../../assets/svg/coin.svg');
const coinAssetUri = Asset.fromModule(coinAsset).uri;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CIRCLE_SIZE = 110;
const STROKE_WIDTH = 7;
const RADIUS = 44;
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

  useEffect(() => {
    animatedProgress.setValue(0);
    Animated.timing(animatedProgress, {
      toValue: completion,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [completion]);

  const handleCirclePress = () => {
    animatedProgress.setValue(0);
    Animated.timing(animatedProgress, {
      toValue: completion,
      duration: 900,
      useNativeDriver: false,
    }).start();
  };

  const accent = accentColor;
  const Container = onCardPress ? TouchableOpacity : View;
  const containerProps = onCardPress ? { activeOpacity: 0.9, onPress: onCardPress } : {};

  const vibeData = [
    { label: '✨ Good vibes only', v: percentage },
    { label: '🌈 Summer energy', v: Math.min(percentage + 10, 100) },
    { label: '🔥 Stay consistent', v: Math.max(percentage - 10, 0) },
  ];

  return (
    <Container
      {...containerProps}
      style={[styles.card, { backgroundColor: colors.transparent, borderColor: accent }, style]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.roomName, { color: colors.text_primary }]} numberOfLines={1}>
          {roomName || 'Neimenovana soba'}
        </Text>
        <View style={styles.badge}>
          <View style={styles.badgeCountRow}>
            <Text style={[styles.badgeValue, { color: accent }]}>{progressLabel}</Text>
            <SvgUri width={12} height={12} uri={coinAssetUri} />
          </View>
          <Text style={[styles.badgeLabel, { color: colors.text_secondary }]}>
            {badgeLabel || 'U progresu'}
          </Text>
        </View>
      </View>

      {/* Question */}
      <Text style={[styles.question, { color: colors.text_primary }]} numberOfLines={3}>
        {question || 'Nema novih anketa za sobu'}
      </Text>

      {/* Progress Circle + Vibes */}
      <View style={styles.detailRow}>
        {/* Progress Circle */}
        <View style={styles.circleContainer}>
          <TouchableOpacity activeOpacity={0.85} onPress={handleCirclePress}>
            <View style={styles.circle}>
              <View style={styles.circleContent}>
                <Text style={styles.emoji}>{emoji || '😊'}</Text>
                <Text style={[styles.percentage, { color: accent }]}>{percentage}%</Text>
              </View>
              <View style={styles.svgWrapper}>
                <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
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
                    stroke={accent}
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
        </View>

        {/* Vibes Column */}
        <View style={styles.vibesColumn}>
          {vibeData.map((item, index) => (
            <View key={index} style={styles.vibeItem}>
              <Text style={[styles.vibeLabel, { color: colors.text_primary }]}>
                {item.label}
              </Text>
              <View style={styles.vibeBarTrack}>
                <View
                  style={[styles.vibeBarFill, { width: `${item.v}%`, backgroundColor: accent }]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Options */}
      {options?.length ? (
        <View style={styles.optionsRow}>
          {loading ? (
            <ActivityIndicator color={accent} />
          ) : (
            options.slice(0, 2).map((option, index) => (
              <TouchableOpacity
                key={`${option.value ?? option.label}-${index}`}
                onPress={() => onSelect?.(option.value)}
                disabled={disabled}
                style={[styles.optionButton, { borderColor: accent }]}
              >
                <Text style={[styles.optionText, { color: colors.text_primary }]} numberOfLines={1}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))
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
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    marginRight: 10,
  },
  badge: {
    alignItems: 'flex-end',
  },
  badgeCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  badgeLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 120,
  },
  circleContainer: {
    marginRight: 16,
    marginTop: 10,
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
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  vibesColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  vibeItem: {
    gap: 4,
  },
  vibeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  vibeBarTrack: {
    width: '100%',
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  vibeBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  placeholder: {
    fontSize: 14,
    marginTop: 8,
  },
});