import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Text } from 'react-native';
import colors from '../theme/colors';
import HomeScreen from '../screens/HomeScreen';
import AnonymousInboxScreen from '../screens/AnonymousInboxScreen';
import ActivityScreen from '../screens/ActivityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BasicHeader from '../components/BasicHeader';

const Tab = createBottomTabNavigator();
const GasStack = createNativeStackNavigator();

const iconMap = {
  Inbox: { active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' },
  Gas: { active: 'flame', inactive: 'flame-outline' },
  Activity: { active: 'time', inactive: 'time-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

function GasStackNavigator() {
  return (
    <GasStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerTitle: () => <Text style={styles.gasHeaderTitle}>Gas</Text>,
        headerTitleAlign: 'center',
        headerTintColor: colors.textLight,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerBackground: () => <View style={styles.gasHeaderBackground} />,
      }}
    >
      <GasStack.Screen name="GasHome" component={HomeScreen} />
    </GasStack.Navigator>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: () => <BasicHeader title={route.name} />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text_secondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.surface,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 0.3,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = iconMap[route.name] || iconMap.Gas;
          const iconName = focused ? icons.active : icons.inactive;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inbox" component={AnonymousInboxScreen} />
      <Tab.Screen
        name="Gas"
        component={GasStackNavigator}
        options={{
          headerShown: false, // use stack header inside
        }}
      />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
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
});
