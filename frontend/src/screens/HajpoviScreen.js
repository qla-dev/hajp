import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { SvgUri } from 'react-native-svg';
import { Asset } from 'expo-asset';
import * as Haptics from 'expo-haptics';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { fetchMyVotes, fetchShareMessages, getCurrentUser } from '../api';
import { useMenuRefresh } from '../context/menuRefreshContext';
import { usePaySheet } from '../context/paySheetContext';
import Avatar from '../components/Avatar';
import BottomCTA from '../components/BottomCTA';
import MenuTab from '../components/MenuTab';

const TAB_ANKETE = 'ankete';
const TAB_LINK = 'link';
const PAGE_LIMIT = 10;
const coinAsset = require('../../assets/svg/coin.svg');
const hajpoviActiveIcon = require('../../assets/svg/nav-icons/hajpovi.svg');
const coinAssetDefaultUri = Asset.fromModule(coinAsset).uri;
const hajpoviActiveIconUri = Asset.fromModule(hajpoviActiveIcon).uri;
const resolveHasMore = (payload, items) => {
  const meta = payload?.meta || payload?.pagination || payload?.paging || {};
  if (typeof meta?.has_more === 'boolean') return meta.has_more;
  if (typeof meta?.hasMore === 'boolean') return meta.hasMore;
  if (typeof meta?.next_page_url === 'string') return Boolean(meta.next_page_url);
  return items.length >= PAGE_LIMIT;
};

export default function HajpoviScreen({ navigation }) {
  const { openPaySheet, closePaySheet } = usePaySheet();
  const [activeTab, setActiveTab] = useState(TAB_ANKETE);
  const [loadingVotes, setLoadingVotes] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingMoreVotes, setLoadingMoreVotes] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [votes, setVotes] = useState([]);
  const [votesPage, setVotesPage] = useState(1);
  const [votesHasMore, setVotesHasMore] = useState(true);
  const [messages, setMessages] = useState([]);
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesHasMore, setMessagesHasMore] = useState(true);
  const [selectedVote, setSelectedVote] = useState(null);
  const [coinSvgUri, setCoinSvgUri] = useState(coinAssetDefaultUri || null);
  const [currentUser, setCurrentUser] = useState(null);
  const revealPrice = 50;
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const handleOpenProfile = useCallback(
    (targetUserId) => {
      if (!targetUserId) return;
      Haptics.selectionAsync().catch(() => {});
      navigation.navigate('FriendProfile', {
        isMine: false,
        userId: targetUserId,
      });
    },
    [navigation],
  );

  const loadUser = useCallback(async () => {
    if (currentUser?.id) return currentUser;
    try {
      const current = await getCurrentUser();
      setCurrentUser(current);
      return current;
    } catch (error) {
      console.error('Greska pri ucitavanju korisnika:', error);
      return null;
    }
  }, [currentUser]);

  const loadVotesPage = useCallback(async (page = 1, append = false) => {
    if (append) {
      setLoadingMoreVotes(true);
    } else {
      setLoadingVotes(true);
      setVotesHasMore(true);
    }
    try {
      const { data: payload } = await fetchMyVotes(null, { page, limit: PAGE_LIMIT });
      const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      const hasMore = resolveHasMore(payload, list);
      setVotes((prev) => (append ? [...prev, ...list] : list));
      setVotesPage(page);
      setVotesHasMore(hasMore);
    } catch (error) {
      if (!append) {
        setVotes([]);
        setVotesHasMore(false);
      }
      console.error('Greska pri ucitavanju hajpova:', error);
    } finally {
      if (append) {
        setLoadingMoreVotes(false);
      } else {
        setLoadingVotes(false);
      }
    }
  }, []);

  const loadMessagesPage = useCallback(
    async (page = 1, append = false, targetUser) => {
      if (append) {
        setLoadingMoreMessages(true);
      } else {
        setLoadingMessages(true);
        setMessagesHasMore(true);
      }
      try {
        const resolvedUser = targetUser || (await loadUser());
        if (!resolvedUser?.id) {
          if (!append) setMessages([]);
          setMessagesHasMore(false);
          return;
        }
        const { data: payload } = await fetchShareMessages(resolvedUser.id, { page, limit: PAGE_LIMIT });
        const list = Array.isArray(payload?.messages)
          ? payload.messages
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        const hasMore = resolveHasMore(payload, list);
        setMessages((prev) => (append ? [...prev, ...list] : list));
        setMessagesPage(page);
        setMessagesHasMore(hasMore);
      } catch (error) {
        if (!append) {
          setMessages([]);
          setMessagesHasMore(false);
        }
        console.error('Greska pri ucitavanju poruka:', error);
      } finally {
        if (append) {
          setLoadingMoreMessages(false);
        } else {
          setLoadingMessages(false);
        }
      }
    },
    [loadUser],
  );

  const loadCurrentTab = useCallback(async () => {
    if (activeTab === TAB_ANKETE) {
      await loadVotesPage(1, false);
    } else {
      await loadMessagesPage(1, false);
    }
  }, [activeTab, loadMessagesPage, loadVotesPage]);

  const handleLoadMoreVotes = useCallback(() => {
    if (loadingVotes || loadingMoreVotes || !votesHasMore) return;
    loadVotesPage(votesPage + 1, true);
  }, [loadingMoreVotes, loadingVotes, loadVotesPage, votesHasMore, votesPage]);

  const handleLoadMoreMessages = useCallback(() => {
    if (loadingMessages || loadingMoreMessages || !messagesHasMore) return;
    loadMessagesPage(messagesPage + 1, true);
  }, [loadingMessages, loadingMoreMessages, loadMessagesPage, messagesHasMore, messagesPage]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const asset = Asset.fromModule(coinAsset);
        await asset.downloadAsync();
        if (mounted) {
          setCoinSvgUri(asset.localUri || asset.uri || coinAssetDefaultUri || null);
        }
      } catch {
        if (mounted) setCoinSvgUri(coinAssetDefaultUri || null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    loadCurrentTab();
  }, [loadCurrentTab]);

  useFocusEffect(
    useCallback(() => {
      loadCurrentTab();
    }, [loadCurrentTab]),
  );

  const { registerMenuRefresh } = useMenuRefresh();
  useEffect(() => {
    const unsubscribe = registerMenuRefresh('Inbox', () => {
      loadCurrentTab();
    });
    return unsubscribe;
  }, [loadCurrentTab, registerMenuRefresh]);

  const handlePayWithCoins = useCallback(
    (priceOverride, voteOverride) => {
      const targetVote = voteOverride || selectedVote;
      if (!targetVote?.id) return;
      closePaySheet();
      navigation.navigate('Reveal', {
        type: 'vote',
        voteId: targetVote.id,
        coinPrice: priceOverride ?? revealPrice,
        targetUserId: targetVote?.user?.id || targetVote?.user_id || null,
        targetUser: targetVote?.user || null,
        targetGender: targetVote?.user?.sex || null,
        title: 'Otkrij ko te hajpa',
        subtitle: targetVote?.question?.question
          ? `Pitanje: ${targetVote.question.question}`
          : undefined,
      });
    },
    [closePaySheet, navigation, revealPrice, selectedVote],
  );

  const handleActivatePremium = useCallback(() => {
    closePaySheet();
    navigation.navigate('Subscription');
  }, [closePaySheet, navigation]);

  const handleOpenPaySheet = useCallback(
    (vote) => {
      setSelectedVote(vote || null);
      Haptics.selectionAsync().catch(() => {});
      openPaySheet({
        title: 'Otkrij ko te hajpa',
        subtitle: 'Izaberi nacin otkljucavanja zeljenog korisnika',
        coinPrice: revealPrice,
        onPayWithCoins: (priceOverride) => handlePayWithCoins(priceOverride, vote),
        onActivatePremium: handleActivatePremium,
        onClose: () => setSelectedVote(null),
      });
    },
    [handleActivatePremium, handlePayWithCoins, openPaySheet, revealPrice],
  );

  const renderVote = ({ item }) => {
    const isHidden = Number(item?.seen ?? 0) === 0;
    const voter = item?.user;
    const voterName = voter?.name || voter?.username || 'Korisnik';
    const voterSex = voter?.sex;
    const fromText = isHidden ? 'Od: korisnika' : `Od: ${voterName}`;
    const ts = item.created_at
      ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';
    const genderColor = voterSex === 'boy' ? '#60a5fa' : '#f472b6';
    const coinUri = coinSvgUri || coinAssetDefaultUri;
    const voterId = voter?.id || item?.user_id;
    const canOpenProfile = !isHidden && Boolean(voterId);
    const canOpenPaySheet = isHidden && Boolean(item?.id);
    const CardComponent = canOpenProfile || canOpenPaySheet ? TouchableOpacity : View;
    const cardProps = canOpenProfile
      ? { onPress: () => handleOpenProfile(voterId), activeOpacity: 0.7 }
      : canOpenPaySheet
      ? { onPress: () => handleOpenPaySheet(item), activeOpacity: 0.7 }
      : {};

    return (
      <CardComponent style={styles.messageCard} {...cardProps}>
        <View style={styles.messageIcon}>
          {isHidden ? (
            <SvgUri
              width={40}
              height={40}
              uri={hajpoviActiveIconUri}
              color={genderColor}
              fill={genderColor}
            />
          ) : (
            <View style={styles.avatarWrapper}>
              <Avatar user={voter} name={voterName} variant="friendlist" zoomModal={false} />
            </View>
          )}
        </View>
        <View style={styles.messageContent}>
          <Text style={styles.messageText} numberOfLines={1}>
            {item?.question?.question || 'Pitanje'}
          </Text>
          <Text style={styles.messageMetadata}>{fromText}</Text>
        </View>
        <View style={styles.messageRight}>
          <Text style={styles.messageTime}>{ts}</Text>
          {isHidden ? (
            <TouchableOpacity
              style={styles.revealButton}
              onPress={() => handleOpenPaySheet(item)}
            >
              <View style={styles.revealButtonContent}>
                {coinUri ? (
                  <SvgUri width={16} height={16} uri={coinUri} />
                ) : (
                  <Ionicons name="cash-outline" size={16} color={colors.primary} />
                )}
                <Text style={styles.revealButtonText}>{revealPrice}</Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
      </CardComponent>
    );
  };

  const renderMessage = ({ item }) => {
    const questionLabel = item.question || item.style?.question || 'Anonimna poruka';
    const from = `Pitanje: ${questionLabel}`;
    const ts = item.created_at
      ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Upravo sada';

    return (
      <View style={styles.messageCard}>
        <View style={styles.messageIcon}>
          <Ionicons name="flame" size={40} color="#f472b6" />
        </View>
        <View style={styles.messageContent}>
          <Text style={styles.messageText} numberOfLines={1}>
            {item.message}
          </Text>
          <Text style={styles.messageMetadata}>{from}</Text>
        </View>
        <Text style={styles.messageTime}>{ts}</Text>
      </View>
    );
  };

  const renderContent = () => {
    if (activeTab === TAB_ANKETE) {
      if (loadingVotes) {
        return (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Učitavanje</Text>
          </View>
        );
      }

      if (!votes.length) {
        return (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>Još uvijek nemaš hajpova kroz ankete</Text>
            <Text style={styles.emptySubtext}>Kad god te neko izhajpa u anketi, pojaviće se ovdje.</Text>
          </View>
        );
      }

      return (
        <FlatList
          data={votes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderVote}
          contentContainerStyle={styles.messagesList}
          onEndReached={handleLoadMoreVotes}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={loadingVotes}
              onRefresh={() => loadVotesPage(1, false)}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListFooterComponent={
            loadingMoreVotes ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
            ) : null
          }
        />
      );
    }

    if (loadingMessages) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Učitavanje</Text>
        </View>
      );
    }

    if (!messages.length) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>Još uvijek nemaš hajpova kroz share link</Text>
          <Text style={styles.emptySubtext}>Podijeli svoj link da dobiješ hajpove!</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onEndReached={handleLoadMoreMessages}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={loadingMessages}
            onRefresh={() => loadMessagesPage(1, false)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListFooterComponent={
          loadingMoreMessages ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
          ) : null
        }
      />
    );
  };


  return (
    <View style={styles.container}>
      <MenuTab
        items={[
          { key: TAB_ANKETE, label: 'Ankete' },
          { key: TAB_LINK, label: 'Share link' },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
        topPadding={100}
        horizontalPadding={16}
        variant="menu-tab-s"
        color="secondary"
      />

      {renderContent()}

      {activeTab === TAB_ANKETE && (
        <BottomCTA label="Vidi ko te hajpa" iconName="flame" onPress={() => navigation.navigate('Subscription')} fixed />
      )}
    </View>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    messagesList: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    messageCard: {
      flexDirection: 'row',
      backgroundColor: colors.transparent,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      alignItems: 'center',
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    messageIcon: {
      width: 48,
      height: 48,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 24,
    },
    avatarWrapper: {
      width: 48,
      height: 48,
      borderRadius: 24,
      overflow: 'hidden',
    },
    messageContent: {
      flex: 1,
    },
    messageText: {
      fontSize: 15,
      color: colors.text_primary,
      fontWeight: '700',
      marginBottom: 4,
    },
    messageMetadata: {
      fontSize: 13,
      color: colors.text_secondary,
    },
    messageRight: {
      alignItems: 'flex-end',
      gap: 6,
    },
    messageTime: {
      fontSize: 12,
      color: colors.text_secondary,
    },
    revealButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 54,
    },
    revealButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    revealButtonText: {
      color: colors.primary,
      fontWeight: '700',
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    loadingText: {
      fontSize: 16,
      color: colors.text_secondary,
      marginTop: 12,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text_primary,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.text_secondary,
      textAlign: 'center',
    },
  });
