import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { SvgUri } from 'react-native-svg';
import { Asset } from 'expo-asset';
import { useTheme } from '../theme/darkMode';

const coinAsset = require('../../assets/svg/coin.svg');
const coinAssetUri = Asset.fromModule(coinAsset).uri;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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

  const accent = accentColor;
  const Container = onCardPress ? TouchableOpacity : View;
  const containerProps = onCardPress ? { activeOpacity: 0.9, onPress: onCardPress } : {};

  const size = 90;
  const strokeWidth = 6;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  return (
    <Container
      {...containerProps}
      style={[styles.card, { backgroundColor: colors.transparent, borderColor: accent }, style]}
    >
      {/* Header */}
      <View style={styles.row}>
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

      {/* Progress + vibes */}
      <View style={styles.detailRow}>
        <View style={styles.circleColumn}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              animatedProgress.setValue(0);
              Animated.timing(animatedProgress, {
                toValue: completion,
                duration: 900,
                useNativeDriver: false,
              }).start();
            }}
            style={styles.circleWrapper}
          >
            <Svg width={size} height={size}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={colors.surface}
                strokeWidth={strokeWidth}
                fill="none"
              />
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={accent}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={animatedProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [circumference, 0],
                })}
                strokeLinecap="round"
                rotation="-90"
                originX={size / 2}
                originY={size / 2}
              />
            </Svg>

            <View style={styles.circleEmojiWrapper}>
              <Text style={styles.circleEmoji}>{emoji || '😊'}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.circlePercentageWrapper}>
            <Text style={[styles.circleValue, { color: accent }]}>{percentage}%</Text>
          </View>
        </View>

        <View style={styles.vibesColumn}>
          {[
            { label: '✨ Good vibes only', v: percentage },
            { label: '🌈 Summer energy', v: Math.min(percentage + 10, 100) },
            { label: '🔥 Stay consistent', v: Math.max(percentage - 10, 0) },
          ].map((item, i) => (
            <View key={i} style={styles.vibeItem}>
              <Text style={[styles.vibeLine, { color: colors.text_primary }]}>
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
        <View style={styles.buttonsRow}>
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
  row: {
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
  },
  circleWrapper: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  circleColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  circleWrapper: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleEmojiWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circlePercentageWrapper: {
    marginTop: 6,
    alignItems: 'center',
  },
  circleEmoji: {
    fontSize: 22,
  },
  circleValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  vibesColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  vibeItem: {
    gap: 4,
  },
  vibeLine: {
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
  buttonsRow: {
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
