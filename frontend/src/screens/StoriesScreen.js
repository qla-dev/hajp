import React from 'react';
import { View, StyleSheet } from 'react-native';
import InstaStory from 'react-native-insta-story';
import { useTheme, useThemedStyles } from '../theme/darkMode';

const storyData = [
  {
    user_id: '1',
    user_name: 'Ahmet Çağlar Durmuş',
    user_image:
      'https://pbs.twimg.com/profile_images/1222140802475773952/61OmyINj.jpg',
    stories: [
      {
        story_id: '1-1',
        story_image:
          'https://image.freepik.com/free-vector/universe-mobile-wallpaper-with-planets_79603-600.jpg',
        swipeText: 'Custom swipe text for this story',
        onPress: () => console.log('story 1 swiped'),
      },
      {
        story_id: '1-2',
        story_image:
          'https://image.freepik.com/free-vector/mobile-wallpaper-with-fluid-shapes_79603-601.jpg',
      },
    ],
  },
  {
    user_id: '2',
    user_name: 'Test User',
    user_image:
      'https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80',
    stories: [
      {
        story_id: '2-1',
        story_image:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjORKvjcbMRGYPR3QIs3MofoWkD4wHzRd_eg&usqp=CAU',
        swipeText: 'Custom swipe text for this story',
        onPress: () => console.log('story 1 swiped'),
      },
      {
        story_id: '2-2',
        story_image:
          'https://files.oyebesmartest.com/uploads/preview/vivo-u20-mobile-wallpaper-full-hd-(1)qm6qyz9v60.jpg',
        swipeText: 'Custom swipe text for this story',
        onPress: () => console.log('story 2 swiped'),
        customProps: { location: 'Belgrade' },
      },
    ],
  },
  {
    user_id: '3',
    user_name: 'Creative Pilot',
    user_image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=500&q=60',
    stories: [
      {
        story_id: '3-1',
        story_image:
          'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=800&q=60',
        swipeText: 'See how this demo works',
      },
    ],
  },
];

export default function StoriesScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <InstaStory
        data={storyData}
        duration={8}
        avatarSize={72}
        showAvatarText
        unPressedBorderColor="#ccc"
        pressedBorderColor={colors.primary}
        onStorySeen={({ story }) => console.log('story seen', story?.story_id)}
        onStart={(item) => console.log('started story for', item?.user_name)}
        style={styles.storyWrapper}
      />
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 100,
    },
    storyWrapper: {
      flex: 1,
    },
  });
