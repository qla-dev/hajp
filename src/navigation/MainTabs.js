import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import colors from '../theme/colors';
import HomeScreen from '../screens/HomeScreen';
import AnonymousInboxScreen from '../screens/AnonymousInboxScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.surface,
          paddingBottom: 10,
          paddingTop: 6,
          height: 64,
        },
        tabBarActiveTintColor: colors.text_primary,
        tabBarInactiveTintColor: colors.text_secondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: 0.3,
        },
      }}
    >
      <Tab.Screen
        name="Inbox"
        component={AnonymousInboxScreen}
        options={{
          tabBarBadge: 12, // TODO: wire to unread count
          tabBarBadgeStyle: { backgroundColor: colors.primary, color: colors.textLight },
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, color }}>📥</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Gas"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, color }}>🔥</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, color }}>👤</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
