import './debug';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import ErrorBoundary from './src/components/ErrorBoundary';
import colors from './src/theme/colors';
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

const Stack = createNativeStackNavigator();

// Wrap each screen with error boundary and logging
const wrapScreen = (Component, name) => {
  return (props) => {
    console.log(`=== RENDERING SCREEN: ${name} ===`);
    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Debug: Log config to see what's being passed
console.log('=== GLUESTACK CONFIG ===');
console.log(JSON.stringify(config, null, 2).substring(0, 500));

export default function App() {
  console.log('=== APP RENDERING ===');
  
  return (
    <ErrorBoundary>
      <GluestackUIProvider config={config}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={wrapScreen(WelcomeScreen, 'Welcome')} />
            <Stack.Screen name="Login" component={wrapScreen(LoginScreen, 'Login')} />
            <Stack.Screen name="Register" component={wrapScreen(RegisterScreen, 'Register')} />
            <Stack.Screen name="Home" component={wrapScreen(HomeScreen, 'Home')} />
            <Stack.Screen name="CreatePoll" component={wrapScreen(CreatePollScreen, 'CreatePoll')} />
            <Stack.Screen name="PollDetail" component={wrapScreen(PollDetailScreen, 'PollDetail')} />
            <Stack.Screen name="Subscription" component={wrapScreen(SubscriptionScreen, 'Subscription')} />
            <Stack.Screen name="Profile" component={wrapScreen(ProfileScreen, 'Profile')} />
            <Stack.Screen name="AnonymousInbox" component={wrapScreen(AnonymousInboxScreen, 'AnonymousInbox')} />
            <Stack.Screen name="SendAnonymousMessage" component={wrapScreen(SendAnonymousMessageScreen, 'SendAnonymousMessage')} />
            <Stack.Screen name="ShareLink" component={wrapScreen(ShareLinkScreen, 'ShareLink')} />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </GluestackUIProvider>
    </ErrorBoundary>
  );
}

const styles = {};
