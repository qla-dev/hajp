import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../theme/darkMode';
import StoriesViewer from './StoriesViewer';
import { baseURL, fetchUserStories, uploadStory } from '../api';

const RING_THICKNESS = 6;
const UPLOAD_ICON_SIZE = 20;

export default function StoryRing({
  userId,
  userName,
  children,
  slotSize = 64,
  allowStoryUpload = false,
}) {
  const { colors } = useTheme();
  const [stories, setStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

  const normalizedStories = useMemo(() => {
    return (stories || []).map((story) => {
      const mediaUrl = story?.media_url;
      const absolute =
        mediaUrl && mediaUrl.startsWith('http')
          ? mediaUrl
          : mediaUrl && mediaUrl.startsWith('/')
          ? `${baseURL}${mediaUrl}`
          : mediaUrl;
      return {
        ...story,
        media_url: absolute,
      };
    });
  }, [stories]);

  const ringActive = normalizedStories.length > 0;
  const diameter = slotSize + (ringActive ? RING_THICKNESS * 2 : 0);

  const refreshStories = useCallback(async () => {
    if (!userId) {
      setStories([]);
      return;
    }
    setLoadingStories(true);
    try {
      const { data } = await fetchUserStories(userId);
      const incoming = data?.data || data || [];
      setStories(incoming);
    } catch (error) {
      setStories([]);
    } finally {
      setLoadingStories(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshStories();
  }, [refreshStories]);

  const openViewer = useCallback(
    (index = 0) => {
      if (!ringActive) return;
      setViewerIndex(index);
      setViewerVisible(true);
    },
    [ringActive],
  );

  const closeViewer = useCallback(() => setViewerVisible(false), []);

  const handleUploadStory = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Pristup odbijen', 'Dopusti pristup galeriji kako bi objavio priču.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
      });
      const canceled = result.canceled || result.cancelled;
      const asset = result.assets?.[0] || (canceled ? null : result);
      if (!asset || canceled) {
        return;
      }
      setUploading(true);
      await uploadStory(asset);
      await refreshStories();
    } catch (error) {
      Alert.alert('Greška', error?.message || 'Neuspjeh pri objavi priče.');
    } finally {
      setUploading(false);
    }
  }, [refreshStories]);

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.ring,
          {
            width: diameter,
            height: diameter,
            borderRadius: diameter / 2,
          },
        ]}
      >
        {ringActive ? (
          <LinearGradient
            colors={[colors.primary, colors.secondary, colors.primary]}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.gradient}
          >
            <View
              style={[
                styles.inner,
                {
                  width: slotSize,
                  height: slotSize,
                  borderRadius: slotSize / 2,
                },
              ]}
            >
              {children}
            </View>
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.inner,
              {
                width: slotSize,
                height: slotSize,
                borderRadius: slotSize / 2,
              },
            ]}
          >
            {children}
          </View>
        )}
        {loadingStories && (
          <View style={[styles.loadingOverlay, { width: slotSize, height: slotSize, borderRadius: slotSize / 2 }]}>
            <ActivityIndicator size="small" color={colors.textLight || colors.text_secondary} />
          </View>
        )}
      </View>

        {ringActive && (
          <TouchableOpacity
            onPress={() => openViewer(0)}
            style={[styles.storyHandle, { right: 0 }]}
            activeOpacity={0.8}
          >
            <View style={[styles.storyDot, { backgroundColor: colors.primary }]}>
              <Ionicons name="chevron-forward" size={12} color={colors.textLight} />
            </View>
          </TouchableOpacity>
        )}

      {allowStoryUpload && (
        <TouchableOpacity
          style={[styles.upload, { right: ringActive ? 6 : 0, backgroundColor: colors.secondary }]}
          onPress={handleUploadStory}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={colors.textLight} />
          ) : (
            <Ionicons name="add" size={UPLOAD_ICON_SIZE} color={colors.textLight} />
          )}
        </TouchableOpacity>
      )}

      <StoriesViewer
        visible={viewerVisible}
        stories={normalizedStories}
        userName={userName}
        initialIndex={viewerIndex}
        onClose={closeViewer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  storyHandle: {
    position: 'absolute',
    top: 4,
    padding: 2,
  },
  storyDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  upload: {
    position: 'absolute',
    bottom: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  loadingOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
