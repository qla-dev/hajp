import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import colors from '../theme/colors';
import HomeScreen from '../screens/HomeScreen';
import AnonymousInboxScreen from '../screens/AnonymousInboxScreen';
import ActivityScreen from '../screens/ActivityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BasicHeader from '../components/BasicHeader';

const Tab = createBottomTabNavigator();

const iconMap = {
  Inbox: { active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' },
  Gas: { active: 'flame', inactive: 'flame-outline' },
  Activity: { active: 'time', inactive: 'time-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

function GasHeader() {
  return (
    <SafeAreaView style={styles.gasHeaderSafe} pointerEvents="none">
      <View style={styles.gasHeaderBar}>
        <Ionicons name="flame" size={18} color={colors.textLight} style={styles.gasHeaderIcon} />
        <Ionicons name="flame" size={0} />{/* placeholder to keep height stable */}
      </View>
    </SafeAreaView>
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
        component={HomeScreen}
        options={{
          header: () => <GasHeader />,
        }}
      />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  gasHeaderSafe: {
    backgroundColor: 'transparent',
  },
  gasHeaderBar: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'transparent',
  },
  gasHeaderIcon: {
    color: colors.textLight,
  },
});
