import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SvgUri, SvgXml } from 'react-native-svg';
import { useTheme } from '../theme/darkMode';

const sizeMap = {
  xs: { size: 64, font: 22 },
  s: { size: 88, font: 26 },
  m: { size: 120, font: 32 }, // current default
  l: { size: 150, font: 40 },
  xl: { size: 190, font: 48 },
  xxl: { size: 230, font: 56 },
};

const normalizeVariant = (variant) => {
  if (!variant) return null;
  return variant.replace(/^avatar-/, '').toLowerCase();
};

const isInitialsPlaceholderUri = (uri) => {
  if (!uri) return false;
  return uri.includes('ui-avatars.com/api/');
};

const isSvgUri = (uri) => {
  if (!uri) return false;
  const lowered = uri.toLowerCase();
  return lowered.includes('avataaars.io') || lowered.startsWith('data:image/svg') || lowered.includes('.svg');
};

const applyPaletteOverride = (svgMarkup, color) => {
  if (!svgMarkup || !color) return svgMarkup;
  const paletteId = 'Color/Palette/Blue-01';
  const regex = new RegExp(`(<g[^>]*id="${paletteId}"[^>]*)(>)`);
  if (regex.test(svgMarkup)) {
    return svgMarkup.replace(regex, `$1 fill="${color}"$2`);
  }
  // Fallback: replace the default blue hex value used by that palette
  return svgMarkup.replace(/#65C9FF/gi, color);
};

export default function Avatar({ uri, name = '', size, variant = 'avatar-m', style }) {
  const { colors } = useTheme();
  const [imageError, setImageError] = useState(false);
  const [svgError, setSvgError] = useState(false);
  const [svgMarkup, setSvgMarkup] = useState(null);

  const variantKey = normalizeVariant(variant) || 'm';
  const resolvedSize = size || sizeMap[variantKey]?.size || sizeMap.m.size;
  const baseFont = size ? Math.max(Math.round(resolvedSize * 0.26), 12) : sizeMap[variantKey]?.font;
  const resolvedFont = baseFont || Math.max(Math.round(resolvedSize * 0.26), 16);
  const initials = useMemo(() => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '');
    return letters.join('') || '??';
  }, [name]);

  const initialsOnly = isInitialsPlaceholderUri(uri);
  const isSvg = !initialsOnly && isSvgUri(uri);

  const dimensionStyle = { width: resolvedSize, height: resolvedSize, borderRadius: resolvedSize / 2 };

  useEffect(() => {
    if (!uri || !isSvg) {
      setSvgMarkup(null);
      return;
    }
    let cancelled = false;
    const loadSvg = async () => {
      try {
        const res = await fetch(uri);
        const text = await res.text();
        if (cancelled) return;
        setSvgMarkup(applyPaletteOverride(text, colors.secondary));
      } catch (error) {
        if (!cancelled) {
          setSvgMarkup(null);
        }
      }
    };
    loadSvg();
    return () => {
      cancelled = true;
    };
  }, [colors.secondary, isSvg, uri]);

  if (uri && isSvg && !svgError) {
    return (
      <View style={[styles.wrapper, dimensionStyle, style, styles.clearBg]}>
        {svgMarkup ? (
          <SvgXml xml={svgMarkup} width={resolvedSize} height={resolvedSize} style={[styles.base, dimensionStyle]} />
        ) : (
          <SvgUri
            uri={uri}
            width={resolvedSize}
            height={resolvedSize}
            style={[styles.base, dimensionStyle]}
            onError={() => setSvgError(true)}
          />
        )}
      </View>
    );
  }

  if (uri && !initialsOnly && !imageError) {
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
