import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Video } from 'expo-av';
import { useTheme } from '../theme/darkMode';

export default function Story({ story, style }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const isVideo = story?.media_type === 'video';

  const handleLoadStart = () => setLoading(true);
  const handleLoadEnd = () => setLoading(false);

  const renderMedia = () => {
    if (!story?.media_url) return null;
    if (isVideo) {
      return (
        <Video
          source={{ uri: story.media_url }}
          style={styles.media}
          resizeMode="cover"
          shouldPlay
          isLooping
          onReadyForDisplay={handleLoadEnd}
          onError={handleLoadEnd}
          onLoadStart={handleLoadStart}
        />
      );
    }
    return (
      <Image
        source={{ uri: story.media_url }}
        style={styles.media}
        resizeMode="cover"
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleLoadEnd}
      />
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.mediaWrapper}>
        {renderMedia()}
        {loading && (
          <View style={[styles.loader, { backgroundColor: colors.background + 'cc' }]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </View>
      {story?.caption ? (
        <View style={[styles.caption, { backgroundColor: colors.surface + 'ee' }]}>
          <Text style={[styles.captionText, { color: colors.text_primary }]} numberOfLines={2}>
            {story.caption}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  mediaWrapper: {
    width: '100%',
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  caption: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
  },
  captionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
