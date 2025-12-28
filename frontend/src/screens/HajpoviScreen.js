import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { fetchMyVotes, fetchShareMessages, getCurrentUser } from '../api';
import { useMenuRefresh } from '../context/menuRefreshContext';
import BottomCTA from '../components/BottomCTA';
import MenuTab from '../components/MenuTab';

const TAB_ANKETE = 'ankete';
const TAB_LINK = 'link';

export default function HajpoviScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState(TAB_ANKETE);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const loadUser = useCallback(async () => {
    try {
      const current = await getCurrentUser();
      setUser(current || null);
      return current;
    } catch (error) {
      console.error('Greška pri učitavanju korisnika:', error);
      setUser(null);
      return null;
    }
  }, []);

  const loadVotes = useCallback(async () => {
    try {
      const { data } = await fetchMyVotes();
      setVotes(data || []);
    } catch (error) {
      setVotes([]);
      console.error('Greška pri učitavanju hajpova:', error);
    }
  }, []);

  const loadMessages = useCallback(
    async (targetUser) => {
      try {
        const resolvedUser = targetUser || (await loadUser());
        if (resolvedUser) {
          const { data } = await fetchShareMessages(resolvedUser.id);
          setMessages(data?.messages || []);
        } else {
          setMessages([]);
        }
      } catch (error) {
        setMessages([]);
        console.error('Greška pri učitavanju poruka:', error);
      }
    },
    [loadUser],
  );

  const loadCurrentTab = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === TAB_ANKETE) {
        await loadVotes();
      } else {
        await loadMessages();
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, loadMessages, loadVotes]);

  useEffect(() => {
    loadCurrentTab();
  }, [loadCurrentTab]);

  const { registerMenuRefresh } = useMenuRefresh();
  useEffect(() => {
    const unsubscribe = registerMenuRefresh('Inbox', () => {
      loadCurrentTab();
    });
    return unsubscribe;
  }, [loadCurrentTab, registerMenuRefresh]);

  const renderVote = ({ item }) => {
    const voterSex = item?.user?.sex;
    const fromText = voterSex ? `Od: ${voterSex}` : 'Od: korisnika';
    const ts = item.created_at
      ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <View style={styles.messageCard}>
        <Ionicons
          name="flame"
          size={40}
          color={voterSex === 'boy' ? '#60a5fa' : '#f472b6'}
          style={styles.messageIcon}
        />
        <View style={styles.messageContent}>
          <Text style={styles.messageText} numberOfLines={1}>
            {item?.question?.question || 'Pitanje'}
          </Text>
          <Text style={styles.messageMetadata}>{fromText}</Text>
        </View>
        <Text style={styles.messageTime}>{ts}</Text>
      </View>
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
        <Ionicons name="flame" size={40} color="#f472b6" style={styles.messageIcon} />
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
    if (loading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Učitavanje</Text>
        </View>
      );
    }

    if (activeTab === TAB_ANKETE) {
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
        />
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
        <BottomCTA label="Vidi ko te hajpa" iconName="diamond-outline" onPress={() => navigation.navigate('Subscription')} fixed />
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
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    messageIcon: {
      marginRight: 12,
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
    messageTime: {
      fontSize: 12,
      color: colors.text_secondary,
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
