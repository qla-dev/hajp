import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import PollDetailScreen from './src/screens/PollDetailScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import CreatePollScreen from './src/screens/CreatePollScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SendAnonymousMessageScreen from './src/screens/SendAnonymousMessageScreen';
import ShareLinkScreen from './src/screens/ShareLinkScreen';
import MainTabs from './src/navigation/MainTabs';
import BasicHeader from './src/components/BasicHeader';
import colors from './src/theme/colors';

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, animation: 'default' }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainStackNavigator() {
  return (
    <MainStack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerTintColor: '#ff0000ff',
        headerTitleStyle: { backgroundColor:'transparent', color: '#ff0000ff', fontWeight: '700', fontSize: 18 },
        animation: 'default',
      }}
    >
      <MainStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <MainStack.Screen name="Subscription" component={SubscriptionScreen} />
      <MainStack.Screen name="Profile" component={ProfileScreen} />
      <MainStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: 'Uredi profil',
          headerBackTitle: 'Sobe',
          headerTintColor: colors.text_primary,
          headerTitleStyle: { color: colors.text_primary, fontWeight: '700' },
          headerTransparent: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: 'transparent' },
        }}
      />
      <MainStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Podešavanja',
          headerBackTitle: 'Sobe',
          headerTintColor: colors.text_primary,
          headerTitleStyle: { color: colors.text_primary, fontWeight: '700' },
          headerTransparent: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: 'transparent' },
       }}
      />
      <MainStack.Screen name="SendAnonymousMessage" component={SendAnonymousMessageScreen} />
      <MainStack.Screen name="ShareLink" component={ShareLinkScreen} />
      <MainStack.Screen name="CreatePoll" component={CreatePollScreen} options={{ headerShown: false }} />
      <MainStack.Screen name="PollDetail" component={PollDetailScreen} options={{ headerShown: false }} />
    </MainStack.Navigator>
  );
}

export default function App() {
  return (
    <GluestackUIProvider config={config}>
      <NavigationContainer>
        <RootStack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false, animation: 'default' }}>
          <RootStack.Screen name="Auth" component={AuthStackNavigator} />
          <RootStack.Screen name="Main" component={MainStackNavigator} />
        </RootStack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </GluestackUIProvider>
  );
}

const styles = StyleSheet.create({
  gasHeaderBackground: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomColor: 'rgba(0,0,0,0.05)',
    borderBottomWidth: 1,
  },
});
