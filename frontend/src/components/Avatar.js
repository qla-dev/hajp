import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated, Pressable, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { SvgUri, SvgXml } from 'react-native-svg';
import { useTheme } from '../theme/darkMode';
import { buildAvatarSvg } from '../utils/bigHeadAvatar';
import { baseURL } from '../api';

export const sizeMap = {
  xs: { photoSize: 64, avatarSize: 47, slotSize: 64, font: 12 },
  s: { photoSize: 36, avatarSize: 46, slotSize: 36, font: 12 },
  friendlist: { photoSize: 48, avatarSize: 64, slotSize: 48, font: 16 },
  m: { photoSize: 120, avatarSize: 158, slotSize: 120, font: 32 }, // current default
  suggestiongrid: { photoSize: 100, avatarSize: 132, slotSize: 100, font: 28 },
  suggestionslider: { photoSize: 80, avatarSize: 105, slotSize: 80, font: 24 },
  l: { photoSize: 158, avatarSize: 228, slotSize: 158, font: 40 },
  xl: { photoSize: 190, avatarSize: 250, slotSize: 190, font: 48 },
  hero: { photoSize: 180, avatarSize: 237, slotSize: 180, font: 38 },
  xxl: { photoSize: 230, avatarSize: 303, slotSize: 230, font: 56 },
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

const extractSvgFromDataUri = (uri) => {
  if (!uri || typeof uri !== 'string') return null;
  const match = uri.match(/^data:image\/svg\+xml;utf8,(.*)$/i);
  if (!match || !match[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};

const parseAvatarConfig = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return null;
};

const resolveAvatarUri = (value) => {
  if (!value) return null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('data:image/svg+xml')) return trimmed;
  if (trimmed.startsWith('<svg')) {
    try {
      return `data:image/svg+xml;utf8,${encodeURIComponent(trimmed)}`;
    } catch {
      return trimmed;
    }
  }
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const cleanBase = (baseURL || '').replace(/\/+$/, '');
  if (!cleanBase) return trimmed;
  const cleanPath = trimmed.replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
};

const pickFirstUri = (...candidates) => {
  for (const candidate of candidates) {
    const resolved = resolveAvatarUri(candidate);
    if (resolved) return resolved;
  }
  return null;
};

export default function Avatar({
  uri,
  name = '',
  size,
  variant = 'avatar-m',
  style,
  fallbackAvatar = true,
  avatarConfig,
  mode = 'auto', // 'avatar' | 'photo' | 'auto'
  user,
  profilePhoto,
  zoomModal = true,
  border = 0,
  flip = false,
  bgMode = 'default', // 'default' | 'random'
  onPress,
  svgOffset = 0,
}) {
  const { colors } = useTheme();
  const [imageError, setImageError] = useState(false);
  const [svgError, setSvgError] = useState(false);
  const [svgMarkup, setSvgMarkup] = useState(null);
  const zoomAnim = useRef(new Animated.Value(0)).current;
  const [showZoom, setShowZoom] = useState(false);
  const [assetReady, setAssetReady] = useState(false);

  const resolvedName = name || user?.name || user?.username || '';
  const configSource = avatarConfig ?? user?.avatar;
  const parsedConfig = useMemo(
    () => parseAvatarConfig(configSource) || parseAvatarConfig(uri),
    [configSource, uri],
  );
  const enforcedConfig = useMemo(() => {
    if (!parsedConfig) return null;
    const base = { ...parsedConfig, showBackground: true, backgroundShape: 'circle' };
    base.backgroundColor = 'purple';
    if (bgMode === 'random') {
      const seed = resolvedName || uri || JSON.stringify(parsedConfig) || Math.random().toString();
      const palette = ['red', 'orange', 'yellow', 'green', 'turqoise', 'blue', 'pink', 'purple'];
      const hash = seed.split('').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % palette.length, 0);
      base.backgroundColor = palette[hash] || 'purple';
    }
    return base;
  }, [bgMode, colors.profilePurple, parsedConfig, resolvedName, uri]);
  useEffect(() => {
    if (enforcedConfig) {
      // dev note: config ready
    }
  }, [bgMode, enforcedConfig, resolvedName, uri]);

  useEffect(() => {
    // dev note: sources resolved
  }, [contentMode, effectiveUri, enforcedConfig?.backgroundColor, parsedConfig, resolvedProfilePhoto, bgMode]);
  const builtFromConfig = useMemo(() => (enforcedConfig ? buildAvatarSvg(enforcedConfig) : null), [enforcedConfig]);
  const resolvedProfilePhoto = useMemo(
    () =>
      pickFirstUri(
        profilePhoto,
        user?.profile_photo,
        user?.profilePhoto,
        user?.profile_photo_url,
        user?.profilePhotoUrl,
        user?.profile_photo_uri,
        user?.profilePhotoUri,
        user?.photo,
        user?.image,
        user?.picture,
      ),
    [
      profilePhoto,
      user?.image,
      user?.photo,
      user?.picture,
      user?.profilePhoto,
      user?.profilePhotoUri,
      user?.profilePhotoUrl,
      user?.profile_photo,
      user?.profile_photo_uri,
      user?.profile_photo_url,
    ],
  );
  const resolvedPrimaryUri = useMemo(
    () =>
      pickFirstUri(
        uri,
        user?.avatar_url,
        user?.avatarUrl,
        user?.avatarUri,
        user?.avatar_svg_url,
        user?.avatar_svg,
        user?.avatarSvgUrl,
        user?.avatarSvg,
        user?.avatar_uri,
        configSource,
      ),
    [
      configSource,
      uri,
      user?.avatarUri,
      user?.avatarSvg,
      user?.avatarSvgUrl,
      user?.avatarUrl,
      user?.avatar_uri,
      user?.avatar_url,
      user?.avatar_svg,
      user?.avatar_svg_url,
    ],
  );
  const baseUri = resolvedProfilePhoto || builtFromConfig || resolvedPrimaryUri;
  const effectiveUri = fallbackAvatar ? baseUri : null;

  const variantKey = normalizeVariant(variant) || 'm';
  const sizeEntry = sizeMap[variantKey] || sizeMap.m;
  const contentMode = mode === 'auto' ? (isSvgUri(effectiveUri) ? 'avatar' : 'photo') : mode;
  const slotSize = size || sizeEntry.slotSize || sizeEntry.photoSize || sizeEntry.avatarSize;
  const contentSize  =
    size ||
    (contentMode === 'photo'
      ? sizeEntry.photoSize || sizeEntry.slotSize || sizeEntry.avatarSize
      : sizeEntry.avatarSize || sizeEntry.slotSize || sizeEntry.photoSize);
  const resolvedSize = contentSize || slotSize || sizeMap.m.avatarSize;
  const baseFont = size
    ? Math.max(Math.round(resolvedSize * 0.26), 12)
    : sizeEntry?.font || Math.max(Math.round(resolvedSize * 0.26), 12);
  const resolvedFont = baseFont || Math.max(Math.round(resolvedSize * 0.26), 16);
  const initials = useMemo(() => {
    if (!resolvedName) return '??';
    const parts = resolvedName.trim().split(/\s+/);
    const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '');
    return letters.join('') || '??';
  }, [resolvedName]);

  const initialsOnly = isInitialsPlaceholderUri(effectiveUri);
  const isSvg = !initialsOnly && isSvgUri(effectiveUri);
  const paletteColor = bgMode === 'random' ? colors.secondary : '#b794f4';
  const svgContentOffset = isSvg ? svgOffset : 0;

  const slotDimensionStyle = { width: slotSize, height: slotSize, borderRadius: slotSize / 2 };
  const contentDimensionStyle = { width: resolvedSize, height: resolvedSize, borderRadius: resolvedSize / 2 };
  const zoomSize = Math.max(resolvedSize * 1.8, resolvedSize + 120);
  const zoomFont = Math.max(Math.round(zoomSize * 0.26), resolvedFont);
  const borderStyle = border && contentMode !== 'avatar' ? { borderWidth: border, borderColor: '#fff' } : null;

  useEffect(() => {
    setImageError(false);
    setSvgError(false);
    setAssetReady(false);
  }, [effectiveUri]);

  useEffect(() => {
    if (!effectiveUri || !isSvg) {
      setSvgMarkup(null);
      return;
    }
    let cancelled = false;
    const loadSvg = async () => {
      const embedded = extractSvgFromDataUri(effectiveUri);
      if (embedded) {
        setSvgMarkup(embedded);
        setAssetReady(true);
        return;
      }
      try {
        const res = await fetch(effectiveUri);
        const text = await res.text();
        if (cancelled) return;
        setSvgMarkup(text);
        setAssetReady(true);
      } catch (error) {
        if (!cancelled) {
          setAssetReady(false);
          setSvgMarkup(null);
        }
      }
    };
    loadSvg();
    return () => {
      cancelled = true;
    };
  }, [colors.secondary, effectiveUri, isSvg, paletteColor]);

  const renderContent = (
    dimensionStyle = contentDimensionStyle,
    fontSize = resolvedFont,
    sizeForElement = resolvedSize,
    options = {},
  ) => {
    const { svgOffset = 0 } = options;
    const buildAssetStyle = (extraTransform = null) => {
      const transforms = [];
      if (flip) transforms.push({ scaleX: -1 });
      if (extraTransform) transforms.push(extraTransform);
      return [
        styles.base,
        dimensionStyle,
        transforms.length ? { transform: transforms } : null,
        assetReady ? null : styles.hidden,
        borderStyle,
      ];
    };
    const fallbackBg = contentMode === 'avatar' ? 'transparent' : colors.profilePurple;
    const fallbackTextColor = fallbackBg === 'transparent' ? colors.text_primary : colors.textLight;
    const fallbackNode = (
      <View style={[styles.fallback, dimensionStyle, borderStyle, { backgroundColor: fallbackBg }]}>
        <Text style={[styles.initials, { color: fallbackTextColor, fontSize }]}>{initials}</Text>
      </View>
    );

    if (effectiveUri && isSvg && !svgError) {
      const offsetTransform = svgOffset ? { translateY: svgOffset } : null;
      const svgStyle = buildAssetStyle(offsetTransform);
      const node = svgMarkup ? (
        <SvgXml xml={svgMarkup} width={sizeForElement} height={sizeForElement} style={svgStyle} />
      ) : (
        <SvgUri
          uri={effectiveUri}
          width={sizeForElement}
          height={sizeForElement}
          style={svgStyle}
          onLoad={() => setAssetReady(true)}
          onError={() => setSvgError(true)}
        />
      );
      return (
        <View style={[styles.stack, dimensionStyle]}>
          {fallbackNode}
          <View style={[styles.absoluteFill, { borderRadius: dimensionStyle.borderRadius }]}>{node}</View>
        </View>
      );
    }

    if (effectiveUri && !initialsOnly && !imageError) {
      const node = (
        <Image
          source={{ uri: effectiveUri }}
          style={buildAssetStyle()}
          onLoad={() => setAssetReady(true)}
          onLoadEnd={() => setAssetReady(true)}
          onError={() => setImageError(true)}
          resizeMode="cover"
        />
      );
      return (
        <View style={[styles.stack, dimensionStyle]}>
          {fallbackNode}
          <View style={[styles.absoluteFill, { borderRadius: dimensionStyle.borderRadius }]}>{node}</View>
        </View>
      );
    }

    return <View style={[styles.stack, dimensionStyle]}>{fallbackNode}</View>;
  };

  const canZoom = zoomModal && !!effectiveUri && !imageError && !svgError;
  const handlePress = useCallback(() => {
    onPress?.();
    if (!canZoom) return;
    setShowZoom(true);
    zoomAnim.setValue(0);
    Animated.spring(zoomAnim, {
      toValue: 1,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [canZoom, onPress, zoomAnim]);

  const handleCloseZoom = useCallback(() => {
    Animated.timing(zoomAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setShowZoom(false));
  }, [zoomAnim]);

  const Wrapper = canZoom || onPress ? Pressable : View;
  const zoomDimensionStyle = useMemo(
    () => ({ width: zoomSize, height: zoomSize, borderRadius: zoomSize / 2 }),
    [zoomSize],
  );
  const svgPreviewOffset = isSvg ? Math.round(zoomSize * -0.04) : 0;

  return (
    <>
      <Wrapper
        onPress={canZoom || onPress ? handlePress : undefined}
        style={[styles.slotWrapper, slotDimensionStyle, style]}
      >
        <View style={[styles.contentOverlay, contentDimensionStyle]}>
          {renderContent(contentDimensionStyle, resolvedFont, resolvedSize, { svgOffset: svgContentOffset })}
        </View>
      </Wrapper>

      {showZoom && canZoom && (
        <Modal transparent visible animationType="fade" onRequestClose={handleCloseZoom}>
          <Pressable style={styles.avatarOverlay} onPress={handleCloseZoom}>
            <BlurView intensity={35} tint={colors.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFillObject} />
            <Animated.View
              style={{
                opacity: zoomAnim,
                transform: [
                  {
                    scale: zoomAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.02] }),
                  },
                ],
              }}
            >
              {renderContent(zoomDimensionStyle, zoomFont, zoomSize, { svgOffset: svgPreviewOffset })}
            </Animated.View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  slotWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  contentOverlay: {
    position: 'relative',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'flex-end',
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
  stack: {
    position: 'relative',
    overflow: 'hidden',
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
  hidden: {
    opacity: 0,
  },
  avatarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
