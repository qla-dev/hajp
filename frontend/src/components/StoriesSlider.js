import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import InstaStory from 'react-native-insta-story';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { baseURL, fetchStoryUsers } from '../api';

const STORY_DURATION = 8;

const computeInitials = (value) => {
  if (!value) return '??';
  const parts = value.toString().trim().split(/\s+/);
  const letters = parts.slice(0, 2).map((part) => (part?.[0] ?? '').toUpperCase());
  return letters.join('') || '??';
};

const paletteColors = ['red', 'orange', 'yellow', 'green', 'turqoise', 'blue', 'pink', 'purple'];

const pickBackgroundColor = (name) => {
  if (!name) return '#b794f4';
  let hash = 0;
  for (const ch of name) {
    hash = (hash * 31 + ch.charCodeAt(0)) % paletteColors.length;
  }
  return paletteColors[hash] || '#b794f4';
};

const FALLBACK_AVATAR = (name) => {
  const initials = computeInitials(name);
  const backgroundColor = pickBackgroundColor(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><circle cx="60" cy="60" r="60" fill="${backgroundColor}" /><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" fill="#fff" font-weight="700">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
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
          const normalizedUserImage =
            normalizeUrl(user?.user_image ?? user?.profile_photo ?? user?.avatar) || FALLBACK_AVATAR(userName);
          console.log('StoriesSlider user', {
            user_id: user?.user_id ?? user?.id,
            user_name: userName,
            user_image: normalizedUserImage,
          });

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
    const logPayload = storyData
      .flatMap((user) =>
        user.stories.map((story) => ({
          user: user.user_name,
          image: story.story_image,
        })),
      )
      .slice(0, 10);
    console.log('StoriesSlider images', logPayload);
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
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
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
      paddingHorizontal: 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
      paddingHorizontal: 16,
      paddingBottom: 12,
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
