import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import colors from '../theme/colors';
import RoomsScreen from '../screens/RoomsScreen';
import PollingScreen from '../screens/PollingScreen';
import HajpoviScreen from '../screens/HajpoviScreen';
import RankRoomsScreen from '../screens/RankRoomsScreen';
import RankingScreen from '../screens/RankingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BasicHeader from '../components/BasicHeader';

const Tab = createBottomTabNavigator();
const HajpStack = createNativeStackNavigator();

const headerLabelMap = {
  Hajp: 'Sobe',
  Inbox: 'Hajpovi',
  Rank: 'Rank',
  Profile: 'Profil',
};

const iconMap = {
  Hajp: { active: 'home', inactive: 'home-outline' },
  Rank: { active: 'trophy', inactive: 'trophy-outline' },
  Inbox: { active: 'flame', inactive: 'flame-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

function HajpStackNavigator() {
  return (
    <HajpStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
      }}
    >
      <HajpStack.Screen
        name="Rooms"
        component={RoomsScreen}
        options={{ header: () => <BasicHeader title="Sobe" /> }}
      />
      <HajpStack.Screen
        name="Polling"
        component={PollingScreen}
        options={{
          headerTransparent: true,
          headerTitle: () => <Text style={styles.gasHeaderTitle}>Hajp</Text>,
          headerTitleAlign: 'center',
          headerTintColor: colors.textLight,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: 'transparent' },
          headerBackground: () => <View style={styles.gasHeaderBackground} />,
          headerBackTitle: 'Sobe',
          headerBackTitleVisible: true,
        }}
      />
    </HajpStack.Navigator>
  );
}

const RankStack = createNativeStackNavigator();

function RankStackNavigator() {
  return (
    <RankStack.Navigator screenOptions={{ headerShown: true, headerTitleAlign: 'center' }}>
      <RankStack.Screen
        name="RankRooms"
        component={RankRoomsScreen}
        options={{ header: () => <BasicHeader title="Sobe" /> }}
      />
      <RankStack.Screen
        name="Ranking"
        component={RankingScreen}
        options={{ header: () => <BasicHeader title="Ranking" /> }}
      />
    </RankStack.Navigator>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const focused = getFocusedRouteNameFromRoute(route) ?? '';
        const hideTabBar = route.name === 'Hajp' && focused === 'Polling';

        return {
          header: () => <BasicHeader title={headerLabelMap[route.name] || route.name} />,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.text_secondary,
          tabBarStyle: hideTabBar
            ? { display: 'none' }
            : {
                backgroundColor: colors.background,
                borderTopColor: colors.surface,
                borderTopWidth: 1,
                height: 86,
                paddingBottom: 24,
                paddingTop: 6,
              },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.3,
          },
          tabBarLabel: headerLabelMap[route.name] || route.name,
          tabBarButton: (props) => <HapticTabButton {...props} />,
          tabBarIcon: ({ focused: isFocused, color, size }) => {
            const icons = iconMap[route.name] || iconMap.Hajp;
            const iconName = isFocused ? icons.active : icons.inactive;
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        };
      }}
    >
      <Tab.Screen name="Hajp" component={HajpStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Rank" component={RankStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Inbox" component={HajpoviScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function HapticTabButton({ children, onPress, onLongPress, accessibilityState, style, ...rest }) {
  const handlePress = async () => {
    Haptics.selectionAsync().catch(() => {});
    onPress?.();
  };
  const handleLongPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onLongPress?.();
  };

  return (
    <Pressable
      {...rest}
      onPress={handlePress}
      onLongPress={handleLongPress}
      accessibilityState={accessibilityState}
      style={[style, styles.tabButton]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gasHeaderBackground: {
    flex: 1,
    backgroundColor: 'transparent',
    borderBottomColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1,
  },
  gasHeaderTitle: {
    color: colors.textLight,
    fontWeight: '700',
    fontSize: 18,
    marginTop: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
