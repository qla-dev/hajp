import React, { useEffect, useMemo, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import RemixIcon from 'react-native-remix-icon';
import { StyleSheet, Pressable, TouchableOpacity, Text, View, Image } from 'react-native';
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
import RoomVibeSelection from '../screens/RoomVibeSelection';
import CoinHeaderIndicator from '../components/CoinHeaderIndicator';
import { baseURL, getCurrentUser } from '../api';
import { addProfileUpdatedListener } from '../utils/profileEvents';

const Tab = createBottomTabNavigator();
const HajpStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const HajpoviStack = createNativeStackNavigator();
const FriendsStack = createNativeStackNavigator();

const headerLabelMap = {
  Hajp: 'Hajpaj',
  Inbox: 'Hajpovi',
  Rank: 'Uživo',
  Friends: 'Mreža',
  Profile: 'Profil',
};

const iconMap = {
  Hajp: { active: 'home-line', inactive: 'home-line' },
  Friends: { active: 'group-line', inactive: 'group-line' },
  Rank: { active: 'broadcast-fill', inactive: 'broadcast-line' },
  Inbox: { active: 'fire-line', inactive: 'fire-line' },
  Profile: { active: 'user-line', inactive: 'user-line' },
};

const iconTransformMap = {
  Hajp: { transform: [{ scaleY: 1 }] },
};

const PROFILE_ICON_SIZE = 26;


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
        <HajpStack.Screen
        name="Rooms"
        component={RoomsScreen}
        options={({ navigation }) => ({
          title: 'Hajpaj',
          headerRight: () => (
            <CoinHeaderIndicator
              onPress={() => navigation.getParent()?.navigate('Profile', { screen: 'ProfileHome' })}
            />
          ),
        })}
      />
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
        options={({ navigation }) => ({
          title: 'Isplata',
          headerBackTitle: 'Nazad',
          headerRight: () => (
            <CoinHeaderIndicator
              onPress={() => navigation.getParent()?.navigate('Profile', { screen: 'ProfileHome' })}
            />
          ),
        })}
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
    <RankStack.Screen
      name="Live"
      component={LiveScreen}
      options={({ navigation }) => ({
        title: 'Uživo',
        headerRight: () => (
          <CoinHeaderIndicator
            onPress={() => navigation.getParent()?.navigate('Profile', { screen: 'ProfileHome' })}
          />
        ),
      })}
    />
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
        name="RoomVibeSelection"
        component={RoomVibeSelection}
        options={{
          title: 'Odaberi vibe',
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
      <HajpoviStack.Screen
        name="Hajpovi"
        component={HajpoviScreen}
        options={({ navigation }) => ({
          title: headerLabelMap.Inbox,
          headerRight: () => (
            <CoinHeaderIndicator
              onPress={() => navigation.getParent()?.navigate('Profile', { screen: 'ProfileHome' })}
            />
          ),
        })}
      />
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
        options={({ navigation }) => ({
          title: 'Mreža',
          headerBackVisible: false,
          headerRight: () => (
            <CoinHeaderIndicator
              onPress={() => navigation.getParent()?.navigate('Profile', { screen: 'ProfileHome' })}
            />
          ),
        })}
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
  const tabStyles = useThemedStyles(createStyles);
  const [profileUser, setProfileUser] = useState(null);
  const [profileAvatarUri, setProfileAvatarUri] = useState(null);
  const profileInitials = useMemo(() => {
    const label = (profileUser?.name || profileUser?.username || 'Korisnik').trim() || 'Korisnik';
    return label
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }, [profileUser?.name, profileUser?.username]);

  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!isMounted) return;
        setProfileUser(user);
        setProfileAvatarUri(resolveAvatar(user?.profile_photo));
      } catch {
        if (!isMounted) return;
        setProfileUser(null);
        setProfileAvatarUri(null);
      }
    };
    loadUser();
    const unsubscribe = addProfileUpdatedListener((user) => {
      if (!isMounted) return;
      setProfileUser(user);
      setProfileAvatarUri(resolveAvatar(user?.profile_photo));
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const tabBarBorderColor = colors.borderLight || colors.border;

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
        (focused === 'ProfileFriends' || focused === 'ProfileFriendsList' || focused === 'ProfileViews' || focused === 'CreateRoom' || focused === 'RoomVibeSelection')
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
                borderTopColor: tabBarBorderColor,
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
            if (route.name === 'Profile') {
              const borderColor = isFocused ? colors.primary : colors.border;
              const containerStyle = [
                tabStyles.profileIconContainer,
                { borderColor, backgroundColor: profileAvatarUri ? colors.surface : colors.secondary },
              ];
              return (
                <View style={containerStyle}>
                  {profileAvatarUri ? (
                    <Image source={{ uri: profileAvatarUri }} style={tabStyles.profileIconImage} />
                  ) : (
                    <Text style={tabStyles.profileIconInitials}>{profileInitials}</Text>
                  )}
                </View>
              );
            }

            const icons = iconMap[route.name] || iconMap.Hajp;
            const iconName = isFocused ? icons.active : icons.inactive;
            const baseSize = route.name === 'Hajp' ? Math.max(size - 1, 16) : size;
            const iconStyle = iconTransformMap[route.name];
            return (
              <RemixIcon
                name={iconName}
                size={baseSize}
                color={color}
                style={iconStyle}
              />
            );
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

const resolveAvatar = (photo) => {
  if (!photo) return null;
  if (/^https?:\/\//i.test(photo)) return photo;
  const cleanBase = (baseURL || '').replace(/\/+$/, '');
  const cleanPath = photo?.replace(/^\/+/, '') || '';
  return `${cleanBase}/${cleanPath}`;
};

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
    profileIconContainer: {
      width: PROFILE_ICON_SIZE,
      height: PROFILE_ICON_SIZE,
      borderRadius: PROFILE_ICON_SIZE / 2,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    profileIconImage: {
      width: '100%',
      height: '100%',
      borderRadius: PROFILE_ICON_SIZE / 2,
      resizeMode: 'cover',
    },
    profileIconInitials: {
      color: colors.textLight,
      fontSize: 12,
      fontWeight: '700',
    },
  });

