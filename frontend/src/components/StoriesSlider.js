import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import InstaStory from 'react-native-insta-story';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { baseURL, fetchStoryUsers } from '../api';
import { buildAvatarSvg } from '../utils/bigHeadAvatar';

const STORY_DURATION = 8;

const parseAvatarConfig = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  const target =
    start >= 0 && end >= start && end > start ? trimmed.slice(start, end + 1) : trimmed;
  try {
    return JSON.parse(target);
  } catch {
    return null;
  }
};

const pickAvatarConfig = (...candidates) => {
  for (const candidate of candidates) {
    const config = parseAvatarConfig(candidate);
    if (config) return config;
  }
  return null;
};

const buildAvatarFromConfig = (config) => {
  if (!config) return null;
  const enforcedConfig = { ...config, showBackground: true, backgroundShape: 'circle' };
  return buildAvatarSvg(enforcedConfig);
};

const getConfigAvatar = (user) =>
  buildAvatarFromConfig(
    pickAvatarConfig(
      user?.avatarConfig ?? user?.avatar,
      user?.avatar,
      user?.avatar_uri,
      user?.avatar_url,
      user?.avatarUrl,
      user?.avatarSvg,
      user?.avatar_svg,
      user?.avatarSvgUrl,
      user?.user_image,
      user?.profile_photo,
      user?.profilePhoto,
      user?.photo,
      user?.image,
      user?.picture,
    ),
  );

const resolveImageUrl = (user, normalizeUrl) => {
  const candidates = [
    user?.user_image,
    user?.profile_photo,
    user?.profilePhoto,
    user?.photo,
    user?.image,
    user?.avatar,
    user?.avatar_uri,
    user?.avatar_url,
    user?.avatarUrl,
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (parseAvatarConfig(candidate)) continue;
    const normalized = normalizeUrl(candidate);
    if (normalized) return normalized;
  }
  return null;
};

let cachedDefaultAvatar = null;
const getDefaultAvatar = () => {
  if (!cachedDefaultAvatar) {
    cachedDefaultAvatar = buildAvatarSvg();
  }
  return cachedDefaultAvatar;
};

export default function StoriesSlider({
  title = 'Priče',
  subtitle,
  showHeader = true,
  onUserPress,
  onActiveUserChange,
  onUsersLoaded,
  refreshKey,
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const normalizeUrl = useCallback(
    (value) => {
      if (!value) return null;
      const trimmed = value.toString().trim();
      if (!trimmed) return null;
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
      }
      if (trimmed.startsWith('/')) {
        return `${baseURL}${trimmed}`;
      }
      const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
      return `${baseURL}${normalizedPath}`;
    },
    [baseURL],
  );

  const formatStoryItems = useCallback(
    (incoming) => {
      if (!Array.isArray(incoming)) return [];
      return incoming
        .map((user) => {
          const stories =
            (user?.stories || [])
              .map((story, storyIndex) => {
                const imageUrl = normalizeUrl(story?.story_image ?? story?.media_url);
                if (!imageUrl) return null;
                return {
                  story_id: `${user?.user_id ?? user?.id}-${story?.story_id ?? story?.id ?? storyIndex}`,
                  story_image: imageUrl,
                  swipeText: story?.caption ?? undefined,
                  media_type: story?.media_type,
                };
              })
              .filter(Boolean) || [];

          if (!stories.length) return null;

          const userName = user?.user_name ?? user?.name ?? user?.username ?? 'Korisnik';
          const configurationAvatar = getConfigAvatar(user);
          const normalizedUserImage =
            resolveImageUrl(user, normalizeUrl) || configurationAvatar || getDefaultAvatar();

          return {
            user_id: user?.user_id ?? user?.id,
            user_name: userName,
            user_image: normalizedUserImage,
            stories,
          };
        })
        .filter(Boolean);
    },
    [normalizeUrl],
  );

  const storyData = useMemo(() => formatStoryItems(users), [formatStoryItems, users]);

  useEffect(() => {
    if (!storyData.length) return;
    const userImages = storyData.map((user) => {
      const image = user.user_image || '';
      return image.length > 50 ? `${image.slice(0, 50)}…` : image;
    });
    console.log('StoriesSlider user_images', userImages);
  }, [storyData]);

  useEffect(() => {
    if (!storyData.length) {
      return;
    }
    onActiveUserChange?.(storyData[0], 0);
  }, [storyData, onActiveUserChange]);

  const loadStoryUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchStoryUsers({ limit: 20 });
      const payload = data?.data || [];
      setUsers(payload);
      onUsersLoaded?.(payload);
    } catch (error) {
      console.error('Failed to load story users', error);
      setUsers([]);
      onUsersLoaded?.([]);
    } finally {
      setLoading(false);
    }
  }, [onUsersLoaded]);

  useEffect(() => {
    loadStoryUsers();
  }, [loadStoryUsers, refreshKey]);

  const handleStoryStart = useCallback(
    (item) => {
      if (!item) return;
      const nextIndex = storyData.findIndex((story) => story.user_id === item.user_id);
      if (nextIndex >= 0) {
        onActiveUserChange?.(item, nextIndex);
      }
      onUserPress?.(item, nextIndex);
    },
    [onActiveUserChange, onUserPress, storyData],
  );

  const renderPlaceholder = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Još nema priča</Text>
      <TouchableOpacity onPress={loadStoryUsers} style={styles.retryButton}>
        <Text style={styles.retryText}>Osvježi</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !storyData.length) {
    return (
      <View style={styles.loaderRow}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View>
      {showHeader && (
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
      )}
      {storyData.length ? (
        <View style={styles.storyWrapper}>
          <InstaStory
            data={storyData}
            duration={STORY_DURATION}
            avatarSize={64}
            showAvatarText
            unPressedBorderColor="#ccc"
            pressedBorderColor={colors.primary}
            onStart={handleStoryStart}
            style={styles.storyContainer}
          />
        </View>
      ) : (
        renderPlaceholder()
      )}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    headerRow: {

      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLeft: {
      flex: 1,
    },
    title: {
      color: colors.text_primary,
      fontSize: 16,
      fontWeight: '700',
    },
    subtitle: {
      color: colors.text_secondary,
    },
    storyWrapper: {

    },
    storyContainer: {
      width: '100%',
    },
    loaderRow: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    emptyState: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      alignItems: 'center',
    },
    emptyTitle: {
      color: colors.text_secondary,
      marginBottom: 8,
    },
    retryButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    retryText: {
      color: colors.primary,
      fontWeight: '700',
    },
  });
