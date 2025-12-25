import React, { useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { useTheme } from '../theme/darkMode';

const sizeMap = {
  xs: { size: 64, font: 22 },
  s: { size: 88, font: 26 },
  m: { size: 120, font: 32 }, // current default
  l: { size: 150, font: 40 },
  xl: { size: 190, font: 48 },
};

const normalizeVariant = (variant) => {
  if (!variant) return null;
  return variant.replace(/^avatar-/, '').toLowerCase();
};

const isSvgUri = (uri) => {
  if (!uri) return false;
  const lowered = uri.toLowerCase();
  return lowered.includes('avataaars.io') || lowered.startsWith('data:image/svg') || lowered.includes('.svg');
};

export default function Avatar({ uri, name = '', size, variant = 'avatar-m', style }) {
  const { colors } = useTheme();
  const [imageError, setImageError] = useState(false);
  const [svgError, setSvgError] = useState(false);

  const variantKey = normalizeVariant(variant) || 'm';
  const resolvedSize = size || sizeMap[variantKey]?.size || sizeMap.m.size;
  const baseFont = size ? Math.max(Math.round(resolvedSize * 0.26), 12) : sizeMap[variantKey]?.font;
  const resolvedFont = baseFont || Math.max(Math.round(resolvedSize * 0.26), 16);

  const isSvg = isSvgUri(uri);
  const initials = useMemo(() => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '');
    return letters.join('') || '??';
  }, [name]);

  const dimensionStyle = { width: resolvedSize, height: resolvedSize, borderRadius: resolvedSize / 2 };

  if (uri && isSvg && !svgError) {
    return (
      <View style={[styles.wrapper, dimensionStyle, style, styles.clearBg]}>
        <SvgUri
          uri={uri}
          width={resolvedSize}
          height={resolvedSize}
          style={[styles.base, dimensionStyle]}
          onError={() => setSvgError(true)}
        />
      </View>
    );
  }

  if (uri && !imageError) {
    return (
      <View style={[styles.wrapper, dimensionStyle, style, styles.clearBg]}>
        <Image
          source={{ uri }}
          style={[styles.base, dimensionStyle]}
          onError={() => setImageError(true)}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={[styles.fallback, dimensionStyle, style, { backgroundColor: colors.profilePurple }]}>
      <Text style={[styles.initials, { color: colors.textLight, fontSize: resolvedFont }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  base: {
    backgroundColor: 'transparent',
  },
  clearBg: {
    backgroundColor: 'transparent',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '800',
  },
});
