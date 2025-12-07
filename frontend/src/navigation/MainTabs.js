import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Pressable, TouchableOpacity, Text, View, registerCallableModule } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import RoomsScreen from '../screens/RoomsScreen';
import PollingScreen from '../screens/PollingScreen';
import HajpoviScreen from '../screens/HajpoviScreen';
import RankRoomsScreen from '../screens/RankRoomsScreen';
import RankingScreen from '../screens/RankingScreen';
import LiveScreen from '../screens/LiveScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProfileViewsScreen from '../screens/ProfileViewsScreen';
import SuggestionsScreen from '../screens/SuggestionsScreen';
import FriendsScreen from '../screens/FriendsScreen';
import CashOutScreen from '../screens/CashOutScreen';
import NextPollCountdownScreen from '../screens/NextPollCountdownScreen';
import CreateRoomScreen from '../screens/CreateRoomScreen';

const Tab = createBottomTabNavigator();
const HajpStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const HajpoviStack = createNativeStackNavigator();
const FriendsStack = createNativeStackNavigator();

const headerLabelMap = {
  Hajp: 'Ankete',
  Inbox: 'Hajpovi',
  Rank: 'Uživo',
  Friends: 'Mreža',
  Profile: 'Profil',
};

const iconMap = {
  Hajp: { active: 'home', inactive: 'home-outline' },
  Friends: { active: 'planet', inactive: 'planet-outline' },
  Rank: { active: 'radio', inactive: 'radio-outline' },
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
      <HajpStack.Screen name="Rooms" component={RoomsScreen} options={{ title: 'Ankete' }} />
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
      <HajpStack.Screen
        name="CashOut"
        component={CashOutScreen}
        options={{
          title: 'Isplata',
          headerBackTitle: 'Nazad',
        }}
      />
      <HajpStack.Screen
        name="NextPollCountdown"
        component={NextPollCountdownScreen}
        options={{
          title: 'Čekanje',
          headerBackTitle: 'Nazad',
        }}
      />
    </HajpStack.Navigator>
  );
}

const RankStack = createNativeStackNavigator();

function RankStackNavigator() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

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
    <RankStack.Screen name="Live" component={LiveScreen} options={{ title: 'Uživo' }} />
    <RankStack.Screen
      name="LiveFriendProfile"
      component={ProfileScreen}
      options={({ navigation }) => ({
        title: 'Profil',
        headerBackVisible: false,
        headerLeft: () => (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text_primary} />
            <Text style={styles.backLabel}>Nazad</Text>
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity
            style={styles.glassButton}
            onPress={() => {
              alert('Opcije otvorene');
            }}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.text_primary} />
          </TouchableOpacity>
        ),
      })}
    />
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
        gestureResponseDistance: { horizontal: 260 },
      }}
    >
      <ProfileStack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: headerLabelMap.Profile,
          gestureEnabled: false,
          headerLeft: () => (
            <View style={styles.headerLeftGroup}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Rank', { screen: 'RankRooms' })}
                style={[styles.glassButton, styles.headerButton]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.glassButtonLabel}>Sobe</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateRoom')}
                style={[styles.headerAddButton, styles.headerButtonSpacing]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="add" size={20} color={colors.text_primary} />
              </TouchableOpacity>
            </View>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ProfileViews')}
                style={[styles.glassButton, styles.eyeButton]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="eye-outline" size={20} color={colors.text_primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings')}
                style={[styles.glassButton, styles.gearButton, styles.headerButtonSpacing, styles.headerButton]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="settings-outline" size={20} color={colors.text_primary} />
              </TouchableOpacity>
            </View>
          ),
        })}
      />
      <ProfileStack.Screen
        name="CreateRoom"
        component={CreateRoomScreen}
        options={{
          title: 'Dodaj sobu',
          headerBackTitle: 'Nazad',
        }}
      />
      <ProfileStack.Screen
        name="ProfileFriends"
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: 'Profil',
          gestureEnabled: false,
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text_primary} />
              <Text style={styles.backLabel}>Nazad</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.glassButton}
              onPress={() => {
                // simple native modal for now
                alert('Opcije otvorene');
              }}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.text_primary} />
            </TouchableOpacity>
          ),
        })}
      />
      <ProfileStack.Screen
        name="ProfileViews"
        component={ProfileViewsScreen}
        options={{
          title: 'Pregledi profila',
          headerBackTitle: 'Nazad',
        }}
      />
      <ProfileStack.Screen
        name="ProfileFriendsList"
        component={FriendsScreen}
        options={{
          title: 'Prijatelji',
          headerBackTitle: 'Nazad',
          gestureEnabled: false,
        }}
        initialParams={{ fromProfile: true }}
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

function FriendsStackNavigator() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <FriendsStack.Navigator
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerTintColor: colors.text_primary,
        headerStyle: { backgroundColor: 'transparent' },
        headerBackTitleVisible: true,
      }}
    >
      <FriendsStack.Screen
        name="Suggestions"
        component={SuggestionsScreen}
        options={{
          title: 'Mreža',
          headerBackVisible: false,
        }}
      />
      <FriendsStack.Screen
        name="FriendsList"
        component={FriendsScreen}
        options={({ route }) => {
          const mode = route?.params?.mode;
          const title = mode === 'requests' ? 'Zahtjevi za povezivanje' : 'Prijatelji';
          return {
            title,
            headerBackVisible: true,
            headerBackTitle: 'Nazad',
          };
        }}
      />
      <FriendsStack.Screen
        name="FriendProfile"
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: 'Profil',
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.canGoBack() && navigation.goBack()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text_primary} />
              <Text style={styles.backLabel}>Nazad</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.glassButton}
              onPress={() => {
                alert('Opcije otvorene');
              }}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.text_primary} />
            </TouchableOpacity>
          ),
        })}
      />
    </FriendsStack.Navigator>
  );
}

export default function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const focused = getFocusedRouteNameFromRoute(route) ?? '';

        let hideTabBar = false;

        // Hide tab bar only on Hajp > Polling, and Profile > ProfileFriends
        if (route.name === 'Hajp' && ['Polling', 'CashOut', 'NextPollCountdown'].includes(focused)) {
          hideTabBar = true;
        }
        if (
          route.name === 'Profile' &&
        (focused === 'ProfileFriends' || focused === 'ProfileFriendsList' || focused === 'ProfileViews' || focused === 'CreateRoom')
        ) {
          hideTabBar = true;
        }
        if (route.name === 'Friends' && focused === 'FriendProfile') {
          hideTabBar = true;
        }

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
                position: 'relative',
                zIndex: 0,
                elevation: 0,
                shadowOpacity: 0,
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
              // Bigger size only for Friends
  const customSize = route.name === "hue" ? size + 9 : size;

  // Thicker stroke only for Friends
  const stroke = route.name === "hue" ? 5.2 : 5.3;
            return <Ionicons  name={iconName}
      size={customSize}
      color={color}
      strokeWidth={stroke} />;
          },
        };
      }}
    >
      <Tab.Screen name="Hajp" component={HajpStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen
        name="Friends"
        component={FriendsStackNavigator}
        options={{ headerShown: false }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Friends', { screen: 'Suggestions' });
          },
        })}
      />
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
      borderWidth: 1,
      borderColor: 'transparent',
    },
    gearButton: {
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    glassButtonLabel: {
      color: colors.text_primary,
      fontSize: 15,
      fontWeight: '500',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 4,
      paddingVertical: 4,
    },
    backLabel: {
      marginLeft: 2,
      color: colors.text_primary,
      fontSize: 17,
      fontWeight: '500',
    },
    headerLeftGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: 2,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: 6,
    },
    eyeButton: {
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    headerButton: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    headerButtonSpacing: {
      marginLeft: 6,
    },
    headerAddButton: {
      borderWidth: 0,
      paddingHorizontal: 10,
      paddingLeft: 5,
      paddingVertical: 6,
    },
  });

