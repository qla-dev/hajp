import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/darkMode';
import Story from './Story';

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;

export default function StoriesViewer({ visible, stories = [], userName, onClose, initialIndex = 0 }) {
  const scrollRef = useRef(null);
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    if (!visible) return;
    setActiveIndex(initialIndex);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: initialIndex * WINDOW_WIDTH, animated: false });
    });
  }, [initialIndex, visible]);

  const handleMomentumEnd = (event) => {
    const offset = event.nativeEvent.contentOffset.x || 0;
    const nextIndex = Math.round(offset / WINDOW_WIDTH);
    setActiveIndex(nextIndex);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.backdrop, { backgroundColor: colors.background + 'ee' }]}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text_primary }]} numberOfLines={1}>
              {userName || 'Priče'}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.text_secondary }]}>
              {stories.length > 0 ? `${activeIndex + 1} / ${stories.length}` : 'Nema priča za prikaz'}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text_primary} />
          </TouchableOpacity>
        </View>

        {stories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ color: colors.text_secondary }}>Trenutno nema dostupnih priča.</Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumEnd}
            contentContainerStyle={styles.scrollContent}
          >
            {stories.map((story, index) => (
              <View key={`${story.id ?? story.media_url}-${index}`} style={styles.slide}>
                <Story story={story} style={styles.story} />
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
    borderRadius: 18,
  },
  emptyState: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#fff5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  slide: {
    width: WINDOW_WIDTH - 32,
    height: WINDOW_HEIGHT * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  story: {
    width: '100%',
    height: '100%',
  },
});
