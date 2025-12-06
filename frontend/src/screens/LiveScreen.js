import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { getInbox, getCurrentUser } from '../api';
import RankRoomsScreen from './RankRoomsScreen';
import BottomCTA from '../components/BottomCTA';

const TAB_RANK = 'rank';
const TAB_ACTIVITY = 'activity';

export default function LiveScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState(TAB_ACTIVITY);
  const [loading, setLoading] = useState(true);
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

  const loadMessages = useCallback(async (targetUser) => {
    try {
      const resolvedUser = targetUser || (await loadUser());
      if (resolvedUser) {
        const { data } = await getInbox(resolvedUser.id);
        setMessages(data?.messages || []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      setMessages([]);
      console.error('Greška pri učitavanju aktivnosti:', error);
    }
  }, [loadUser]);

  useEffect(() => {
    let isMounted = true;
    if (activeTab === TAB_ACTIVITY) {
      (async () => {
        setLoading(true);
        const current = await loadUser();
        if (!isMounted) return;
        try {
          await loadMessages(current);
        } finally {
          isMounted && setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [activeTab, loadUser, loadMessages]);

  const renderActivity = ({ item }) => {
    const metadata = item.metadata || {};
    const from = metadata.gender ? `Od: ${metadata.gender}` : 'Anonimno';
    const ts = item.created_at
      ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <View style={styles.messageCard}>
        <Ionicons name="radio" size={40} color="#0ea5e9" style={styles.messageIcon} />
        <View style={styles.messageContent}>
          <Text style={styles.messageText} numberOfLines={1}>
            {item.message || 'Aktivnost'}
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

    if (activeTab === TAB_RANK) {
      return (
        <View style={styles.rankWrapper}>
          <RankRoomsScreen navigation={navigation} />
        </View>
      );
    }

    if (!messages.length) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>Još uvijek nema aktivnosti</Text>
          <Text style={styles.emptySubtext}>Aktivnost će se pojaviti čim se nešto dogodi.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderActivity}
        contentContainerStyle={styles.messagesList}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
    {[TAB_ACTIVITY, TAB_RANK].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
            disabled={activeTab === tab}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === TAB_RANK ? 'Rank' : 'Aktivnosti'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderContent()}

    </View>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    tabs: {
      flexDirection: 'row',
      padding: 16,
      paddingTop: 100,
      gap: 10,
    },
    tabButton: {
      flex: 1,
      backgroundColor: colors.surface,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    tabButtonActive: {
      borderColor: colors.primary,
      backgroundColor: isDark ? 'rgba(255, 107, 53, 0.12)' : '#eef2ff',
    },
    tabText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text_secondary,
    },
    tabTextActive: {
      color: colors.primary,
    },
    rankWrapper: {
      flex: 1,
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
