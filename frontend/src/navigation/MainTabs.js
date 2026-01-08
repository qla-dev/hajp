import React, { useEffect, useMemo, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import RemixIcon from 'react-native-remix-icon';
import { SvgUri } from 'react-native-svg';
import { Asset } from 'expo-asset';
import { StyleSheet, Pressable, TouchableOpacity, Text, View } from 'react-native';
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
import RevealScreen from '../screens/RevealScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SuggestionsScreen from '../screens/SuggestionsScreen';
import FriendsScreen from '../screens/FriendsScreen';
import CashOutScreen from '../screens/CashOutScreen';
import NextPollCountdownScreen from '../screens/NextPollCountdownScreen';
import CreateRoomScreen from '../screens/CreateRoomScreen';
import RoomVibeSelection from '../screens/RoomVibeSelection';
import CoinHeaderIndicator from '../components/CoinHeaderIndicator';
import { baseURL, getCurrentUser } from '../api';
import { addProfileUpdatedListener } from '../utils/profileEvents';
import UserRoomsScreen from '../screens/UserRoomsScreen';
import { MenuRefreshProvider, useMenuRefresh } from '../context/menuRefreshContext';
import Avatar from '../components/Avatar';

const assetUri = (mod) => Asset.fromModule(mod).uri;
const logoUri = assetUri(require('../../assets/svg/logo.svg'));
const logoWhiteUri = assetUri(require('../../assets/svg/logo-white.svg'));
const customTabIconUriMap = {
  Hajp: {
    active: assetUri(require('../../assets/svg/nav-icons/home-active.svg')),
    inactive: assetUri(require('../../assets/svg/nav-icons/home.svg')),
  },
  Friends: {
    active: assetUri(require('../../assets/svg/nav-icons/users-active.svg')),
    inactive: assetUri(require('../../assets/svg/nav-icons/users.svg')),
  },
  Rank: {
    active: assetUri(require('../../assets/svg/nav-icons/live-active.svg')),
    inactive: assetUri(require('../../assets/svg/nav-icons/live.svg')),
  },
  Inbox: {
    active: assetUri(require('../../assets/svg/nav-icons/hajpovi-active.svg')),
    inactive: assetUri(require('../../assets/svg/nav-icons/hajpovi.svg')),
  },
};
const POLLING_LOGO_STYLE = { width: 70, height: 38 };
const POLLING_LOGO_CONTAINER_STYLE = {
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 12,
};

const AppHeaderLogo = ({ color = '#fff' }) => (
  <View style={POLLING_LOGO_CONTAINER_STYLE}>
    <SvgUri
      width={POLLING_LOGO_STYLE.width}
      height={POLLING_LOGO_STYLE.height}
      uri={logoUri}
      preserveAspectRatio="xMidYMid meet"
      fill={color}
      style={[
        POLLING_LOGO_STYLE,
        {
          tintColor: color,
          color,
          borderRadius: 12,
          paddingVertical: 4,
        },
      ]}
    />
  </View>
);

const Tab = createBottomTabNavigator();
const HajpStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const HajpoviStack = createNativeStackNavigator();
const FriendsStack = createNativeStackNavigator();

const headerLabelMap = {
  Hajp: 'Hajp',
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

const profileFriendsListOptions = ({ route }) => {
  const mode = route?.params?.mode;
  const title =
    mode === 'group-invite'
      ? 'Pozovi prijatelja'
      : mode === 'blocked'
      ? 'Blokirani kontakti'
      : 'Prijatelji';
  return {
    title,
    headerBackTitle: 'Nazad',
    gestureEnabled: false,
  };
};

const iconTransformMap = {
  Hajp: { transform: [{ scaleY: 1 }] },
};

const PROFILE_ICON_SIZE = 26;


function HajpStackNavigator() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

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
          headerTitle: '',
          headerLeft: () => <AppHeaderLogo color={colors.text_primary} />,
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
          headerTitle: () => (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 8 }}>
              <SvgUri
                width={70}
                height={38}
                uri={logoWhiteUri}
                preserveAspectRatio="xMidYMid meet"
              />
            </View>
          ),
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
            <View style={styles.headerRightSlot}>
              <CoinHeaderIndicator
                onPress={() => navigation.getParent()?.navigate('Profile', { screen: 'ProfileHome' })}
              />
            </View>
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
      name="FriendProfile"
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
    <RankStack.Screen
      name="ProfileFriendsList"
      component={FriendsScreen}
      options={profileFriendsListOptions}
      initialParams={{ fromProfile: true, profileRouteName: 'FriendProfile' }}
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
                onPress={() => navigation.navigate('UserRooms')}
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
        name="UserRooms"
        component={UserRoomsScreen}
        options={{
          title: 'Moje sobe',
          headerBackTitle: 'Nazad',
        }}
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
        options={({ navigation }) => ({
          title: 'Pregledi profila',
          headerBackTitle: 'Nazad',
          headerRight: () => (
            <View style={styles.headerRightSlot}>
              <CoinHeaderIndicator
                onPress={() => navigation.getParent()?.navigate('Profile', { screen: 'ProfileHome' })}
              />
            </View>
          ),
        })}
      />
      <ProfileStack.Screen
        name="Reveal"
        component={RevealScreen}
        options={({ navigation }) => ({
          title: 'Otkrij',
          headerBackTitle: 'Nazad',
          headerRight: () => (
            <View style={styles.headerRightSlot}>
              <CoinHeaderIndicator
                onPress={() => navigation.getParent()?.navigate('Profile', { screen: 'ProfileHome' })}
              />
            </View>
          ),
        })}
      />
      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Podešavanja',
          headerBackTitle: 'Nazad',
        }}
      />
      <ProfileStack.Screen
        name="ProfileFriendsList"
        component={FriendsScreen}
        options={profileFriendsListOptions}
        initialParams={{ fromProfile: true, profileRouteName: 'ProfileFriends' }}
      />
    </ProfileStack.Navigator>
  );
}

function HajpoviStackNavigator() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

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
      <HajpoviStack.Screen
        name="FriendProfile"
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
      <HajpoviStack.Screen
        name="ProfileFriendsList"
        component={FriendsScreen}
        options={profileFriendsListOptions}
        initialParams={{ fromProfile: true, profileRouteName: 'FriendProfile' }}
      />
      <HajpoviStack.Screen
        name="Reveal"
        component={RevealScreen}
        options={({ navigation }) => ({
          title: 'Otkrij',
          headerBackTitle: 'Nazad',
          headerRight: () => (
            <View style={styles.headerRightSlot}>
              <CoinHeaderIndicator
                onPress={() => navigation.getParent()?.navigate('Profile', { screen: 'ProfileHome' })}
              />
            </View>
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
        options={({ route, navigation }) => {
          const mode = route?.params?.mode;
          const title =
            mode === 'requests'
              ? 'Zahtjevi za povezivanje'
              : mode === 'group-invite'
              ? 'Pozovi prijatelje u grupu'
              : mode === 'blocked'
              ? 'Blokirani kontakti'
              : 'Prijatelji';
          const onBack = () => {
            console.log('[FriendsList back] mode:', mode, 'canGoBack:', navigation.canGoBack());
            if (mode === 'group-invite') {
              console.log('[FriendsList back] force navigate to Profile > UserRooms');
              navigation.getParent()?.navigate('Profile', { screen: 'UserRooms' });
              return;
            }
            if (navigation.canGoBack()) {
              navigation.goBack();
              return;
            }
            if (mode === 'requests') {
              console.log('[FriendsList back] fallback to Friends > Suggestions (requests)');
              navigation.getParent()?.navigate('Friends', { screen: 'Suggestions' });
            } else {
              console.log('[FriendsList back] fallback to Friends > Suggestions (default)');
              navigation.getParent()?.navigate('Friends', { screen: 'Suggestions' });
            }
          };
          const useCustomBack = mode === 'requests' || mode === 'group-invite';
          return {
            title,
            headerBackVisible: !useCustomBack,
            headerBackTitle: useCustomBack ? undefined : 'Nazad',
            headerLeft: useCustomBack
              ? () => (
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={onBack}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="chevron-back" size={22} color={colors.text_primary} />
                    <Text style={styles.backLabel}>Nazad</Text>
                  </TouchableOpacity>
                )
              : undefined,
          };
        }}
      />
      <FriendsStack.Screen
        name="ProfileFriendsList"
        component={FriendsScreen}
        options={profileFriendsListOptions}
        initialParams={{ fromProfile: true, profileRouteName: 'FriendProfile' }}
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
  return (
    <MenuRefreshProvider>
      <MainTabsContent />
    </MenuRefreshProvider>
  );
}

function MainTabsContent() {
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
  const { triggerMenuRefresh } = useMenuRefresh();

  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!isMounted) return;
        setProfileUser(user);
        const photoUri = resolveAvatar(user?.profile_photo);
        setProfileAvatarUri(photoUri || user?.avatar || null);
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
      const photoUri = resolveAvatar(user?.profile_photo);
      setProfileAvatarUri(photoUri || user?.avatar || null);
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
        (focused === 'ProfileFriends' || focused === 'ProfileFriendsList' || focused === 'ProfileViews' || focused === 'Reveal' || focused === 'CreateRoom' || focused === 'RoomVibeSelection' || focused === 'Settings')
      ) {
        hideTabBar = true;
        }
        if (route.name === 'Friends' && (focused === 'FriendProfile' || focused === 'ProfileFriendsList')) {
          hideTabBar = true;
        }
        if (route.name === 'Friends' && focused === 'FriendsList') {
          hideTabBar = true;
        }
        if (
          route.name === 'Rank' &&
          (focused === 'ProfileFriendsList' || focused === 'FriendProfile' || focused === 'Ranking')
        ) {
          hideTabBar = true;
        }
        if (
          route.name === 'Inbox' &&
          (focused === 'FriendProfile' || focused === 'ProfileFriendsList' || focused === 'Reveal')
        ) {
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
              return (
                <Avatar
                  uri={profileAvatarUri}
                  user={profileUser}
                  profilePhoto={profileUser?.profile_photo}
                  avatarConfig={profileUser?.avatar}
                  name={profileInitials}
                  variant="avatar-xs"
                  zoomModal={false}
                  mode="auto"
                  style={[
                    tabStyles.profileIconContainer,
                    {
                      borderColor,
                      backgroundColor: profileAvatarUri || profileUser?.avatar ? 'transparent' : colors.secondary,
                    },
                  ]}
                />
              );
            }

            const baseSize = Math.max(size - 3, 18);
            const customIconUris = customTabIconUriMap[route.name];
            if (customIconUris) {
              const iconUri = isFocused ? customIconUris.active : customIconUris.inactive;
              return <SvgUri uri={iconUri} width={baseSize} height={baseSize} color={color} fill={color} />;
            }

            const icons = iconMap[route.name] || iconMap.Hajp;
            const iconName = isFocused ? icons.active : icons.inactive;
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
      <Tab.Screen
        name="Hajp"
        component={HajpStackNavigator}
        options={{ headerShown: false }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (navigation.isFocused()) {
              e.preventDefault();
              triggerMenuRefresh('Hajp');
            }
          },
        })}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsStackNavigator}
        options={{ headerShown: false }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (navigation.isFocused()) {
              e.preventDefault();
              triggerMenuRefresh('Friends');
            } else {
              e.preventDefault();
              navigation.navigate('Friends', { screen: 'Suggestions' });
            }
          },
        })}
      />
      <Tab.Screen
        name="Rank"
        component={RankStackNavigator}
        options={{ headerShown: false }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (navigation.isFocused()) {
              e.preventDefault();
              triggerMenuRefresh('Rank');
            }
          },
        })}
      />
      <Tab.Screen
        name="Inbox"
        component={HajpoviStackNavigator}
        options={{ headerShown: false }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            const isFocused = navigation.isFocused();
            const isRootRoute =
              route?.state?.index == null || route.state.index <= 0;
            if (isFocused && isRootRoute) {
              e.preventDefault();
              triggerMenuRefresh('Inbox');
            }
          },
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{ headerShown: false }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (navigation.isFocused()) {
              e.preventDefault();
              triggerMenuRefresh('Profile');
            }
          },
        })}
      />
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
      fontSize: 17,
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
    headerRightSlot: {
      alignItems: 'flex-end',
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
      fontSize: 10,
      fontWeight: '700',
    },
  });

