import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import SuggestionSlider from '../components/SuggestionSlider';
import RoomSuggestions from '../components/RoomSuggestions';
import SuggestionGrid from '../components/SuggestionGrid';

export default function SuggestionsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [skipSliderHaptic, setSkipSliderHaptic] = useState(false);
  const skipSliderHapticRef = useRef(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setRefreshing(false);
  }, []);

  const handleGridCardPress = useCallback(
    (item) => {
      skipSliderHapticRef.current = true;
      setSkipSliderHaptic(true);
      const friendId = item.friend_id || item.id;
      if (!friendId) return;
      navigation.push('FriendProfile', {
        isMine: false,
        userId: friendId,
      });
    },
    [navigation],
  );

  return (
    <ScrollView
      style={styles.container}
      contentInsetAdjustmentBehavior="always"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <SuggestionSlider
        linkLabel="Pogledaj sve"
        onLinkPress={() => navigation.navigate('Friends', { screen: 'Suggestions' })}
        refreshKey={refreshKey}
        skipNextHaptic={skipSliderHaptic}
        skipHapticRef={skipSliderHapticRef}
        onClearSkip={() => setSkipSliderHaptic(false)}
      />

      <RoomSuggestions refreshKey={refreshKey} onRoomPress={(room) => console.log('Open room', room?.name)} />

      <SuggestionGrid refreshKey={refreshKey} onCardPress={handleGridCardPress} />
    </ScrollView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingBottom: 16,
    },
  });
