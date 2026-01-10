import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, ImageBackground, Image } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { SvgUri } from 'react-native-svg';
import { Asset } from 'expo-asset';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { Ionicons } from '@expo/vector-icons';
import { baseURL } from '../api';

const coinAsset = require('../../assets/svg/coin.svg');
const coinAssetUri = Asset.fromModule(coinAsset).uri;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CIRCLE_SIZE = 100;
const STROKE_WIDTH = 8;
const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1440&q=80';

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
  roomCover,
  roomIcon,
  previewMembers = [],
  memberCount = 0,
  mutualMember = null,
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

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
  const containerProps = onCardPress ? { activeOpacity: 0.92, onPress: onCardPress } : {};

  const isCompleted = badgeLabel === 'Isplaćeno' || badgeLabel === 'Isplati odmah';
  const badgeColor = isCompleted ? colors.secondary : colors.primary;

  // Calculate percentages for vibes
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

  const coverUri = roomCover ? `${baseURL.replace(/\/$/, '')}${roomCover}` : FALLBACK_COVER;
  const hasPreviewMembers = previewMembers.length > 0;

  const getMemberDisplayName = (member) => {
    if (!member) return 'Član';
    const base = member.name || member.username || 'Član';
    return base.split(' ')[0] || base;
  };

  const memberLabel = useMemo(() => {
    const displayed = [];

    if (mutualMember?.name || mutualMember?.username) {
      const mutualName = getMemberDisplayName(mutualMember);
      const usernameSuffix = !mutualMember.name && mutualMember.username ? ` (@${mutualMember.username})` : '';
      displayed.push(`${mutualName}${usernameSuffix}`);
    }

    const firstOther = previewMembers.find(
      (member) => !mutualMember || member?.id !== mutualMember.id,
    );
    if (firstOther) {
      displayed.push(getMemberDisplayName(firstOther));
    }

    const tailCount = Math.max(memberCount - displayed.length, 0);

    if (displayed.length) {
      const names = displayed.join(', ');
      const tail = tailCount > 0 ? ` i još ${tailCount} članova` : '';
      return `${names}${tail}`;
    }

    return `${memberCount} članova`;
  }, [mutualMember, previewMembers, memberCount]);

  const resolveAvatar = (photo) => {
    if (!photo) return null;
    if (/^https?:\/\//i.test(photo)) return photo;
    const cleanBase = (baseURL || '').replace(/\/+$/, '');
    const cleanPath = photo.replace(/^\/+/, '');
    return `${cleanBase}/${cleanPath}`;
  };

  const renderAvatar = (member, index) => {
    const uri = resolveAvatar(member?.profile_photo);
    const rawLabel = member?.name || member?.username || 'Član';
    const label = rawLabel.split(' ')[0] || rawLabel;
    const initials = label
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');

    return uri ? (
      <Image
        key={`${member?.id || label}-${index}`}
        source={{ uri }}
        style={[styles.avatar, { zIndex: previewMembers.length - index }]}
      />
    ) : (
      <View
        key={`${member?.id || label}-${index}`}
        style={[styles.avatar, styles.avatarFallback, { zIndex: previewMembers.length - index }]}
      >
        <Text style={styles.avatarFallbackText}>{initials}</Text>
      </View>
    );
  };

  return (
    <Container
      {...containerProps}
      style={[styles.card, style]}
    >
      {/* COVER IMAGE with overlay and badges */}
      <ImageBackground 
        source={{ uri: coverUri }} 
        style={styles.cover}
        imageStyle={styles.coverImage}
      >
        <View style={styles.overlay} />
        
        {/* Room Icon Badge */}
        {roomIcon && (
          <View style={styles.vibeBadge}>
            <Ionicons name={roomIcon} size={28} color={accent} />
          </View>
        )}

        {/* Top Row with Status Badge */}
        <View style={styles.topRow}>
          <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
            <Text style={styles.statusBadgeText}>{badgeLabel || 'U progresu'}</Text>
          </View>
          
          <View style={[styles.coinBadge, { borderColor: badgeColor, backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <Text style={[styles.coinBadgeText, { color: '#fff' }]}>{progressLabel}</Text>
            <SvgUri width={10} height={10} uri={coinAssetUri} />
          </View>
        </View>
      </ImageBackground>

      {/* INFO BLOCK */}
      <View style={styles.infoBlock}>
        {/* Room Name */}
        <Text style={styles.roomName} numberOfLines={1}>
          {roomName || 'Neimenovana soba'}
        </Text>

        {/* Question */}
        <Text style={styles.question} numberOfLines={3}>
          {question || 'Nema novih anketa za sobu'}
        </Text>

        {/* HERO SECTION: Circle + Vibes */}
        <View style={styles.heroRow}>
          {/* Progress Circle */}
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

          {/* VIBES - Segmented bar */}
          <View style={styles.vibesContainer}>
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

            <View style={styles.legendContainer}>
              {vibeData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>
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

        {/* ACTIONS */}
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
          <Text style={styles.placeholder}>
            Nema novih anketa za sobu
          </Text>
        )}
      </View>

      {/* AVATAR STACK at bottom - matching RoomCard */}
      <View style={styles.bottomRow}>
        <View style={styles.memberRow}>
          {hasPreviewMembers && (
            <View style={styles.avatarStack}>
              {previewMembers.map((member, idx) => renderAvatar(member, idx))}
            </View>
          )}
          <Text style={styles.memberText}>{memberLabel}</Text>
        </View>
      </View>
    </Container>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      width: '100%',
      marginBottom: 16,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: colors.transparent,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 5,
    },
    cover: {
      height: 90,
      justifyContent: 'space-between',
    },
    coverImage: {
      resizeMode: 'cover',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    vibeBadge: {
      position: 'absolute',
      left: 12,
      bottom: -28,
      width: 64,
      height: 64,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 5,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    statusBadgeText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 12,
    },
    coinBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1.5,
    },
    coinBadgeText: {
      fontSize: 12,
      fontWeight: '700',
    },
    infoBlock: {
      paddingHorizontal: 16,
      paddingBottom: 0,
      paddingTop: 48,
      position: 'relative',
    },
    roomName: {
      fontSize: 18,
      fontWeight: '900',
      color: colors.text_primary,
      marginBottom: 8,
    },
    question: {
      fontSize: 16,
      fontWeight: '700',
      lineHeight: 24,
      color: colors.text_primary,
      marginBottom: 16,
    },
    heroRow: {
      flexDirection: 'row',
      gap: 20,
      alignItems: 'center',
      marginBottom: 16,
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
      color: colors.text_secondary,
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
      color: colors.text_secondary,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    memberText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text_secondary,
    },
    avatarStack: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 4,
      marginRight: 0,
    },
    avatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.background,
      marginLeft: -8,
    },
    avatarFallback: {
      backgroundColor: colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarFallbackText: {
      color: colors.textLight,
      fontWeight: '800',
      fontSize: 12,
    },
  });