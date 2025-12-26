import React, { useEffect, useMemo, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar, { sizeMap as avatarSizeMap } from './Avatar';
import { useTheme } from '../theme/darkMode';
import { buildAvatarSvg, generateRandomConfig } from '../utils/bigHeadAvatar';

const ROW_COUNT = 5;
const COLUMNS = 6;
const TOTAL_AVATARS = ROW_COUNT * COLUMNS;
const HERO_SIZE = avatarSizeMap.hero?.size || 140;
const AVATAR_SIZE = Math.round(HERO_SIZE * 0.40); // use hero token scaled to fit the grid
const ROW_GAP = 0;
const EDGE_OVERFLOW = Math.round(AVATAR_SIZE*0.7);

const buildGradientColor = (hex, opacity) => {
  if (!hex || typeof hex !== 'string') {
    return `rgba(0,0,0,${opacity})`;
  }
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    return `rgba(0,0,0,${opacity})`;
  }
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default function AvatarHeroAnimated({
  children,
  style,
  height = 340,
  fixed = false,
  colorsOverride,
}) {
  const { colors: themeColors } = useTheme();
  const colors = colorsOverride || themeColors;
  const avatars = useMemo(() => {
    const pickFrom = (arr) => arr.splice(Math.floor(Math.random() * arr.length), 1)[0];

    // Build a gender sequence that alternates M/F down each column (row major)
    const genderSequence = new Array(TOTAL_AVATARS).fill(null).map((_, idx) => {
      // row-major index -> row, col
      const row = idx % ROW_COUNT;
      // alternate by row so within a column we get M/F/M/F...
      return row % 2 === 0 ? 'male' : 'female';
    });

    const femaleIndices = genderSequence
      .map((g, idx) => ({ g, idx }))
      .filter(({ g }) => g === 'female')
      .map(({ idx }) => idx);
    const maleIndices = genderSequence
      .map((g, idx) => ({ g, idx }))
      .filter(({ g }) => g === 'male')
      .map(({ idx }) => idx);

    const hijabIndex = pickFrom([...femaleIndices]);

    const remainingPool = Array.from({ length: TOTAL_AVATARS }, (_, i) => i).filter((i) => i !== hijabIndex);
    const maskIndex = pickFrom(remainingPool);
    const capIndices = [pickFrom(remainingPool), pickFrom(remainingPool)];

    const items = [];
    for (let i = 0; i < TOTAL_AVATARS; i += 1) {
      const gender = genderSequence[i] === 'female' ? 'female' : 'male';
      const base = generateRandomConfig({ gender, circleBg: true });

      const hat =
        i === hijabIndex ? 'hijab' : capIndices.includes(i) ? 'beanie' : 'none';

      const finalConfig = {
        ...base,
        hat,
        faceMask: i === maskIndex,
      };

      items.push(buildAvatarSvg(finalConfig));
    }
    return items;
  }, []);

  const columns = useMemo(
    () =>
      new Array(COLUMNS).fill(0).map((_, colIdx) =>
        new Array(ROW_COUNT).fill(0).map((__, rowIdx) => avatars[rowIdx * COLUMNS + colIdx]),
      ),
    [avatars],
  );

  const animatedValues = useRef(new Array(COLUMNS).fill(0).map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = animatedValues.map((value, index) => {
      const direction = index % 2 === 0 ? -1 : 1; // alternate up/down per column
      const amplitude = 12 + index * 2;
      const duration = 8000 + index * 400; // slightly faster
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: direction * amplitude,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: -direction * amplitude,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        { resetBeforeIteration: true },
      );
      animation.start();
      return animation;
    });

    return () => {
      animations.forEach((animation) => animation?.stop?.());
      animatedValues.forEach((value) => value.stopAnimation());
    };
  }, [animatedValues]);

  return (
    <View
      style={[
        styles.container,
        fixed && styles.fixedContainer,
        { height },
        style,
      ]}
    >
      <View style={[styles.grid, { marginHorizontal: -EDGE_OVERFLOW, paddingHorizontal: 16 + EDGE_OVERFLOW }]}>
        {columns.map((column, colIdx) => (
          <Animated.View
            key={`col-${colIdx}`}
            style={[
              styles.column,
              { transform: [{ translateY: animatedValues[colIdx] || 0 }] },
            ]}
          >
            {column.map((uri, rowIdx) => (
              <View
                key={`avatar-${rowIdx}-${colIdx}`}
                style={[
                  styles.avatarWrapper,
                  { width: AVATAR_SIZE, marginTop: rowIdx === 0 ? 0 : ROW_GAP },
                ]}
              >
                <Avatar uri={uri} size={AVATAR_SIZE} />
              </View>
            ))}
          </Animated.View>
        ))}
      </View>

      <LinearGradient
        colors={[
          buildGradientColor(colors.background, 0),
          buildGradientColor(colors.background, 0.7),
          buildGradientColor(colors.background, 1),
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      />

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 26,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    left: -EDGE_OVERFLOW,
    right: -EDGE_OVERFLOW,
    paddingHorizontal: 18 + EDGE_OVERFLOW,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flexDirection: 'column',
    alignItems: 'center',
    width: AVATAR_SIZE,
  },
  avatarWrapper: {
    height: AVATAR_SIZE,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  fixedContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
