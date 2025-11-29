import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import PollDetailScreen from './src/screens/PollDetailScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import AnonymousInboxScreen from './src/screens/AnonymousInboxScreen';
import CreatePollScreen from './src/screens/CreatePollScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SendAnonymousMessageScreen from './src/screens/SendAnonymousMessageScreen';
import ShareLinkScreen from './src/screens/ShareLinkScreen';
import ActivityScreen from './src/screens/ActivityScreen';
import MainTabs from './src/navigation/MainTabs';
import BasicHeader from './src/components/BasicHeader';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GluestackUIProvider config={config}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{
            headerShown: false,
            animation: 'default',
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ header: () => <BasicHeader title="Home" /> }} />
          <Stack.Screen name="Activity" component={ActivityScreen} options={{ header: () => <BasicHeader title="Activity" /> }} />
          <Stack.Screen name="CreatePoll" component={CreatePollScreen} />
          <Stack.Screen name="PollDetail" component={PollDetailScreen} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ header: () => <BasicHeader title="Subscription" /> }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ header: () => <BasicHeader title="Profile" /> }} />
          <Stack.Screen name="AnonymousInbox" component={AnonymousInboxScreen} options={{ header: () => <BasicHeader title="Inbox" /> }} />
          <Stack.Screen name="SendAnonymousMessage" component={SendAnonymousMessageScreen} options={{ header: () => <BasicHeader title="Send Message" /> }} />
          <Stack.Screen name="ShareLink" component={ShareLinkScreen} options={{ header: () => <BasicHeader title="Share Link" /> }} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </GluestackUIProvider>
  );
}
