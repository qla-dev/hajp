import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Pressable, TouchableOpacity, Text } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import RoomsScreen from '../screens/RoomsScreen';
import PollingScreen from '../screens/PollingScreen';
import HajpoviScreen from '../screens/HajpoviScreen';
import RankRoomsScreen from '../screens/RankRoomsScreen';
import RankingScreen from '../screens/RankingScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const HajpStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const HajpoviStack = createNativeStackNavigator();

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
  const { colors } = useTheme();

  return (
    <HajpStack.Navigator
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerTintColor: colors.text_primary,
        headerStyle: { backgroundColor: 'transparent' },
      }}
    >
      <HajpStack.Screen name="Rooms" component={RoomsScreen} options={{ title: 'Sobe' }} />
      <HajpStack.Screen
        name="Polling"
        component={PollingScreen}
        options={{
          title: 'Hajp',
          headerTintColor: colors.textLight,
          headerStyle: {
            backgroundColor: 'transparent',
            borderBottomColor: 'rgba(255,255,255,0.7)',
            borderBottomWidth: 1,
          },
        }}
      />
    </HajpStack.Navigator>
  );
}

const RankStack = createNativeStackNavigator();

function RankStackNavigator() {
  const { colors } = useTheme();

  return (
    <RankStack.Navigator
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerTintColor: colors.text_primary,
        headerStyle: { backgroundColor: 'transparent' },
      }}
    >
      <RankStack.Screen name="RankRooms" component={RankRoomsScreen} options={{ title: 'Sobe' }} />
      <RankStack.Screen name="Ranking" component={RankingScreen} options={{ title: 'Ranking' }} />
    </RankStack.Navigator>
  );
}

function ProfileStackNavigator() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerTintColor: colors.text_primary,
        headerStyle: { backgroundColor: 'transparent' },
      }}
    >
      <ProfileStack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: headerLabelMap.Profile,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Rank', { screen: 'RankRooms' })}
              style={styles.glassButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.glassButtonLabel}>Sobe</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={[styles.glassButton, styles.gearButton]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="settings-outline" size={20} color={colors.text_primary} />
            </TouchableOpacity>
          ),
        })}
      />
    </ProfileStack.Navigator>
  );
}

function HajpoviStackNavigator() {
  const { colors } = useTheme();

  return (
    <HajpoviStack.Navigator
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerTintColor: colors.text_primary,
        headerStyle: { backgroundColor: 'transparent' },
      }}
    >
      <HajpoviStack.Screen name="Hajpovi" component={HajpoviScreen} options={{ title: headerLabelMap.Inbox }} />
    </HajpoviStack.Navigator>
  );
}

export default function MainTabs() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const focused = getFocusedRouteNameFromRoute(route) ?? '';
        const hideTabBar = route.name === 'Hajp' && focused === 'Polling';

        return {
          headerTitle: headerLabelMap[route.name] || route.name,
          headerTransparent: true,
          headerShadowVisible: false,
          headerTitleAlign: 'center',
          headerTintColor: colors.text_primary,
          headerStyle: { backgroundColor: 'transparent' },
          headerShown: true,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.text_secondary,
          tabBarStyle: hideTabBar
            ? { display: 'none' }
            : {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
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
      <Tab.Screen name="Inbox" component={HajpoviStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

function HapticTabButton({ children, onPress, onLongPress, accessibilityState, style, ...rest }) {
  const styles = useThemedStyles(createStyles);

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

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    tabButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    glassButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 14,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.4)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.2 : 0.08,
      shadowRadius: 2,
    },
    gearButton: {
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    glassButtonLabel: {
      color: colors.text_primary,
      fontSize: 15,
      fontWeight: '700',
    },
  });
