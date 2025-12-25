import React, { useMemo } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationLightTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
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
import AvatarGeneratorScreen from './src/screens/AvatarGeneratorScreen';
import SetupProfileScreen from './src/screens/SetupProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ShareScreen from './src/screens/ShareScreen';
import SendAnonymousMessageScreen from './src/screens/SendAnonymousMessageScreen';
import ShareLinkScreen from './src/screens/ShareLinkScreen';
import FriendsScreen from './src/screens/FriendsScreen';
import MainTabs from './src/navigation/MainTabs';
import { RoomSheetProvider } from './src/context/roomSheetContext';
import { ThemeProvider, useTheme } from './src/theme/darkMode';

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();
const headerCloseStyles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
});
function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, animation: 'default' }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="SetupProfile" component={SetupProfileScreen} />
    </AuthStack.Navigator>
  );
}

function MainStackNavigator() {
  const { colors } = useTheme();

  return (
    <MainStack.Navigator
      initialRouteName="MainTabs"
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerTitleAlign: 'center',
        headerTintColor: '#fff',
        headerTransparent: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: 'transparent' },
        headerTitleStyle: { color: '#fff' },
        headerBackTitleVisible: false,
        headerLeft: ({ canGoBack, tintColor }) =>
          canGoBack ? (
            <TouchableOpacity onPress={() => navigation.goBack()} style={headerCloseStyles.button}>
              <Ionicons name="close" size={26} color={tintColor} />
            </TouchableOpacity>
          ) : undefined,
        animation: 'default',
      })}
    >
      <MainStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <MainStack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{
          title: 'Pretplati se na Premium',
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
        }}
      />
      <MainStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
      <MainStack.Screen
        name="ProfileFriendsList"
        component={FriendsScreen}
        options={{
          title: 'Prijatelji',
          headerBackTitle: 'Nazad',
        }}
        initialParams={{ fromProfile: true, profileRouteName: 'Profile' }}
      />
      <MainStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: 'Uredi profil',
        }}
      />
      <MainStack.Screen
        name="AvatarGenerator"
        component={AvatarGeneratorScreen}
        options={{
          title: 'Kreiraj avatar',
        }}
      />
      <MainStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Podešavanja',
        }}
      />
      <MainStack.Screen
        name="Share"
        component={ShareScreen}
        options={{
          title: 'Podijeli',
        }}
      />
      <MainStack.Screen name="SendAnonymousMessage" component={SendAnonymousMessageScreen} options={{ title: 'Anonimna poruka' }} />
      <MainStack.Screen name="ShareLink" component={ShareLinkScreen} options={{ title: 'Link' }} />
      <MainStack.Screen name="CreatePoll" component={CreatePollScreen} options={{ title: 'Kreiraj anketu' }} />
      <MainStack.Screen name="PollDetail" component={PollDetailScreen} options={{ title: 'Detalji ankete' }} />
    </MainStack.Navigator>
  );
}

function AppContent() {
  const { colors, isDark } = useTheme();

  const navigationTheme = useMemo(() => {
    const base = isDark ? NavigationDarkTheme : NavigationLightTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text_primary,
        border: colors.border,
        notification: colors.accent,
      },
    };
  }, [colors, isDark]);

  return (
    <RoomSheetProvider>
      <GluestackUIProvider config={config}>
        <NavigationContainer theme={navigationTheme}>
          <RootStack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false, animation: 'default' }}>
            <RootStack.Screen name="Auth" component={AuthStackNavigator} />
            <RootStack.Screen name="Main" component={MainStackNavigator} />
          </RootStack.Navigator>
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </NavigationContainer>
      </GluestackUIProvider>
    </RoomSheetProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
