import React, { useEffect, useMemo, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar, { sizeMap as avatarSizeMap } from './Avatar';
import defaultConfig from '../../assets/json/avatar/avatarDefaultConfig.json';
import optionGroupsData from '../../assets/json/avatar/avatarOptionGroups.json';
import { useTheme } from '../theme/darkMode';

const ROW_COUNT = 6;
const COLUMNS = 5;
const TOTAL_AVATARS = ROW_COUNT * COLUMNS;
const HERO_SIZE = avatarSizeMap.hero?.size || 140;
const AVATAR_SIZE = Math.round(HERO_SIZE * 0.32); // use hero token scaled to fit the grid
const ROW_GAP = 8;

const optionMap = optionGroupsData.reduce((acc, group) => {
  acc[group.key] = group.options.map((option) => option.value);
  return acc;
}, {});

const buildAvatarParams = (config) =>
  new URLSearchParams({
    avatarStyle: 'Circle',
    topType: config.topType,
    accessoriesType: config.accessoriesType,
    hairColor: config.hairColor,
    facialHairType: config.facialHairType,
    clotheType: config.clotheType,
    clotheColor: config.clotheColor,
    eyeType: config.eyeType,
    eyebrowType: config.eyebrowType,
    mouthType: config.mouthType,
    skinColor: config.skinColor,
  });

const buildAvatarSvgUrl = (config) => `https://avataaars.io/?${buildAvatarParams(config).toString()}`;

const pickRandom = (items = []) => {
  if (!items.length) return null;
  const idx = Math.floor(Math.random() * items.length);
  return items[idx];
};

const generateRandomConfig = () => {
  const config = { ...defaultConfig };
  Object.keys(optionMap).forEach((key) => {
    const options = optionMap[key];
    if (options?.length) {
      config[key] = pickRandom(options) || config[key];
    }
  });
  return config;
};

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

export default function AvatarHeroAnimated({ children, style, height = 340, fixed = false }) {
  const { colors } = useTheme();
  const avatars = useMemo(
    () => new Array(TOTAL_AVATARS).fill(0).map(() => buildAvatarSvgUrl(generateRandomConfig())),
    [],
  );

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
        { height, backgroundColor: colors.backgroundDark },
        style,
      ]}
    >
      <View style={styles.grid}>
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
          buildGradientColor(colors.backgroundDark, 0.7),
          buildGradientColor(colors.backgroundDark, 0.3),
          buildGradientColor(colors.backgroundDark, 0),
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
    paddingHorizontal: 16,
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
    opacity: 0.7,
  },
  fixedContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
