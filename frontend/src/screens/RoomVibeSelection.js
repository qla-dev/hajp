import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import VibeChip from '../components/VibeChip';
import { vibeOptions } from '../data/vibes';

export default function RoomVibeSelection({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const selectedVibeKey = route.params?.selectedVibe || vibeOptions[0].key;
  const onSelect = route.params?.onSelect;

  const handleSelect = (option) => {
    onSelect?.(option.key);
    navigation.goBack();
  };

  const contentContainerStyle = [styles.content, styles.emptyContainer];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={contentContainerStyle} showsVerticalScrollIndicator={false}>
        {vibeOptions.map((option) => (
          <VibeChip
            key={option.key}
            option={option}
            active={option.key === selectedVibeKey}
            onPress={() => handleSelect(option)}
            style={styles.vibeChip}
          />
        ))}
      </ScrollView>
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
  });
