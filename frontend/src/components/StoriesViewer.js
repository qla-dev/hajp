import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/darkMode';

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;
const STORY_DURATION = 10000;

export default function StoriesViewer({ visible, stories = [], userName, onClose, initialIndex = 0 }) {
  const { colors } = useTheme();
  const listRef = useRef(null);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const startTimestampRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setActiveIndex(initialIndex);
    listRef.current?.scrollToIndex({ index: initialIndex, animated: false });
  }, [initialIndex, visible]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const updateProgress = useCallback(() => {
    const elapsed = Date.now() - startTimestampRef.current;
    setProgress(Math.min(1, elapsed / STORY_DURATION));
  }, []);

  const scheduleNext = useCallback(() => {
    clearTimer();
    setProgress(0);
    startTimestampRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      if (activeIndex + 1 >= stories.length) {
        onClose?.();
        return;
      }
      goToIndex(activeIndex + 1);
    }, STORY_DURATION);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(updateProgress, 100);
  }, [activeIndex, stories.length, onClose, goToIndex, updateProgress]);

  useEffect(() => {
    if (!visible || stories.length === 0) return;
    scheduleNext();
    return () => {
      clearTimer();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeIndex, scheduleNext, visible, stories.length]);

  const goToIndex = useCallback(
    (index) => {
      if (index < 0 || index >= stories.length) return;
      setActiveIndex(index);
      listRef.current?.scrollToIndex({ index, animated: true });
    },
    [stories.length],
  );

  const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
    const next = viewableItems[0]?.index;
    if (typeof next === 'number' && next !== activeIndex) {
      setActiveIndex(next);
    }
  }, [activeIndex]);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 95 }).current;

  const handleEdgePress = (direction) => {
    if (direction === 'left') {
      goToIndex(activeIndex - 1);
    } else {
      if (activeIndex + 1 >= stories.length) {
        onClose?.();
        return;
      }
      goToIndex(activeIndex + 1);
    }
  };

  const renderProgress = () => (
    <View style={styles.progressRow}>
      {stories.map((_, idx) => (
        <View
          key={idx}
          style={[
            styles.progressTrack,
            { borderColor: colors.border },
            idx < activeIndex && { backgroundColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              idx < activeIndex && { width: '100%', backgroundColor: colors.primary },
              idx === activeIndex && {
                width: `${Math.round(progress * 100)}%`,
                backgroundColor: '#fff',
              },
            ]}
          />
        </View>
      ))}
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Image source={{ uri: item?.media_url }} style={styles.media} resizeMode="cover" />
    </View>
  );

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.container, { backgroundColor: '#000' }]}>
        <FlatList
          ref={listRef}
          data={stories}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          keyExtractor={(item, index) => `${item?.id || item?.media_url}-${index}`}
          renderItem={renderItem}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({ length: WINDOW_WIDTH, offset: WINDOW_WIDTH * index, index })}
        />

        <View style={styles.overlay}>
          {renderProgress()}
          <View style={styles.topRow}>
            <Text style={[styles.username, { color: colors.text_primary }]} numberOfLines={1}>
              {userName || 'Priče'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.edgeRow}>
            <TouchableOpacity style={styles.edgeHitArea} onPress={() => handleEdgePress('left')} />
            <TouchableOpacity style={styles.edgeHitArea} onPress={() => handleEdgePress('right')} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  },
  media: {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressRow: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    borderWidth: 1,
    marginHorizontal: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: '0%',
  },
  currentProgress: {
    width: '100%',
    backgroundColor: '#fff',
  },
  edgeRow: {
    flex: 1,
    flexDirection: 'row',
  },
  edgeHitArea: {
    flex: 1,
  },
});
