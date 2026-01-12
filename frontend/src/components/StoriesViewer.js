import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Story from './Story';
import { useTheme } from '../theme/darkMode';

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;
const STORY_DURATION = 10000;

export default function StoriesViewer({ visible, stories = [], userName, onClose, initialIndex = 0 }) {
  const { colors } = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressAnimationRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    if (!visible) return;
    setActiveIndex(initialIndex);
    progressAnim.setValue(0);
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: initialIndex * WINDOW_WIDTH, animated: false });
      scrollX.setValue(initialIndex * WINDOW_WIDTH);
    });
  }, [initialIndex, scrollX, visible, progressAnim]);

  const goToNext = useCallback(() => {
    if (!visible) return;
    if (activeIndex + 1 >= stories.length) {
      onClose?.();
      return;
    }
    const next = activeIndex + 1;
    flatListRef.current?.scrollToIndex({ index: next, animated: true });
    setActiveIndex(next);
  }, [activeIndex, stories.length, onClose, visible]);

  const startTimer = useCallback(() => {
    progressAnimationRef.current?.stop();
    progressAnim.setValue(0);
    const animation = Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });
    progressAnimationRef.current = animation;
    animation.start(({ finished }) => {
      if (finished) {
        goToNext();
      }
    });
  }, [goToNext, progressAnim]);

  useEffect(() => {
    if (!visible || stories.length === 0) return;
    startTimer();
    return () => {
      progressAnimationRef.current?.stop();
    };
  }, [activeIndex, stories.length, startTimer, visible]);

  useEffect(() => {
    if (!visible) {
      progressAnimationRef.current?.stop();
    }
  }, [visible]);

  const handleMomentumEnd = useCallback(
    (event) => {
      const offset = event.nativeEvent.contentOffset.x || 0;
      const nextIndex = Math.round(offset / WINDOW_WIDTH);
      if (nextIndex !== activeIndex) {
        setActiveIndex(nextIndex);
      }
    },
    [activeIndex],
  );

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true },
  );

  const progressWidth = useMemo(
    () => progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
    [progressAnim],
  );

  const renderProgress = () => (
    <View style={styles.progressRow}>
      {stories.map((_, idx) => {
        const isActive = idx === activeIndex;
        const isPast = idx < activeIndex;
        return (
          <View key={idx} style={[styles.progressTrack, { borderColor: colors.border }]}>
            {isActive ? (
              <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: colors.primary }]} />
            ) : (
              <View
                style={[
                  styles.progressFill,
                  isPast ? styles.progressComplete : styles.progressEmpty,
                  { backgroundColor: colors.primary },
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );

  const renderItem = useCallback(
    ({ item, index }) => {
      const inputRange = [(index - 1) * WINDOW_WIDTH, index * WINDOW_WIDTH, (index + 1) * WINDOW_WIDTH];
      const rotateY = scrollX.interpolate({
        inputRange,
        outputRange: ['65deg', '0deg', '-65deg'],
        extrapolate: 'clamp',
      });
      const preTranslate = scrollX.interpolate({
        inputRange,
        outputRange: [WINDOW_WIDTH / 2, 0, -WINDOW_WIDTH / 2],
        extrapolate: 'clamp',
      });
      const postTranslate = scrollX.interpolate({
        inputRange,
        outputRange: [-WINDOW_WIDTH / 2, 0, WINDOW_WIDTH / 2],
        extrapolate: 'clamp',
      });
      const animatedStyle = {
        transform: [
          { perspective: 1400 },
          { translateX: preTranslate },
          { rotateY },
          { translateX: postTranslate },
        ],
      };
      return (
        <Animated.View style={[styles.slide, animatedStyle]}>
          <Story story={item} style={styles.story} />
        </Animated.View>
      );
    },
    [scrollX],
  );

  const getItemLayout = useCallback((_, index) => {
    return { length: WINDOW_WIDTH, offset: WINDOW_WIDTH * index, index };
  }, []);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose} statusBarTranslucent>
        <View style={[styles.container, { backgroundColor: '#000' }]}>
        <Animated.FlatList
          ref={flatListRef}
          data={stories}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleMomentumEnd}
          onScroll={handleScroll}
          keyExtractor={(item, index) => `${item?.id || item?.media_url || index}-${index}`}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          contentContainerStyle={stories.length === 0 ? styles.emptyContainer : undefined}
        />

        {renderProgress()}

        <View style={styles.topBar}>
          <Text style={[styles.username, { color: colors.text_primary }]} numberOfLines={1}>
            {userName || 'Priče'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text_primary} />
          </TouchableOpacity>
        </View>

        {stories.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.text_secondary }]}>Trenutno nema priča.</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  slide: {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  story: {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  },
  progressRow: {
    position: 'absolute',
    top: 18,
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
    overflow: 'hidden',
    marginHorizontal: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressComplete: {
    width: '100%',
    opacity: 0.5,
  },
  progressEmpty: {
    width: '0%',
    opacity: 0.05,
  },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    position: 'absolute',
    alignSelf: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
