import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import VibeChip from '../components/VibeChip';
import { vibeOptions as fallbackVibes } from '../data/vibes';
import { fetchRoomVibes } from '../api';

const normalizeVibes = (items = []) =>
  items
    .map((item) => {
      const key = item.slug || item.key;
      const name = item.name || item.label || key;
      if (!key || !name) return null;
      return {
        key,
        label: name,
        icon: item.icon || 'leaf-outline',
        description: item.description || item.subtitle || '',
      };
    })
    .filter(Boolean);

export default function RoomVibeSelection({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [vibes, setVibes] = useState(() => normalizeVibes(fallbackVibes));
  const [loading, setLoading] = useState(false);
  const selectedVibeKey = useMemo(() => route.params?.selectedVibe || vibes[0]?.key, [route.params?.selectedVibe, vibes]);
  const onSelect = route.params?.onSelect;

  const loadVibes = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchRoomVibes();
      const list = normalizeVibes(data?.data || data || []);
      if (list.length) {
        setVibes(list);
      }
    } catch {
      // keep fallback vibes
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVibes();
  }, [loadVibes]);

  const handleSelect = (option) => {
    onSelect?.(option.key);
    navigation.goBack();
  };

  const contentContainerStyle = [styles.content, styles.emptyContainer];

  return (
    <View style={styles.container}>
      {loading && !vibes.length ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={contentContainerStyle} showsVerticalScrollIndicator={false}>
          {vibes.map((option) => (
            <VibeChip
              key={option.key}
              option={option}
              active={option.key === selectedVibeKey}
              onPress={() => handleSelect(option)}
              style={styles.vibeChip}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
      paddingTop: 110,
      gap: 12,
    },
    vibeChip: {
      minHeight: 80,
    },
    emptyContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingBottom: 40,
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
