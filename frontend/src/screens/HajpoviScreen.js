import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import colors from '../theme/colors';
import { fetchMyVotes, getInbox, getCurrentUser } from '../api';

const TAB_ANKETE = 'ankete';
const TAB_LINK = 'link';

export default function HajpoviScreen() {
  const [activeTab, setActiveTab] = useState(TAB_ANKETE);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);

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
      console.error('Greška pri učitavanju poruka:', error);
    }
  }, [loadUser]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const current = await loadUser();
      if (!isMounted) return;
      try {
        if (activeTab === TAB_ANKETE) {
          await loadVotes();
        } else {
          await loadMessages(current);
        }
      } finally {
        isMounted && setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [activeTab, loadUser, loadVotes, loadMessages]);

  const renderVote = ({ item }) => {
    const voterSex = item?.user?.sex;
    const fromText = voterSex ? `Od: ${voterSex}` : 'Od: korisnika';
    const ts = item.created_at
      ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <View style={styles.messageCard}>
        <View style={[styles.messageIcon, voterSex === 'boy' ? styles.blueDot : styles.pinkDot]} />
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
    const metadata = item.metadata || {};
    const from = metadata.gender ? `Od: ${metadata.gender}` : 'Anonimno';
    const ts = item.created_at
      ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Upravo sada';

    return (
      <View style={styles.messageCard}>
        <View style={[styles.messageIcon, styles.pinkDot]} />
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
          <ActivityIndicator size="large" color={colors.text_secondary} />
          <Text style={styles.loadingText}>Učitavanje...</Text>
        </View>
      );
    }

    if (activeTab === TAB_ANKETE) {
      if (!votes.length) {
        return (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>Još nema hajpova</Text>
            <Text style={styles.emptySubtext}>Kad god te neko označi, pojaviće se ovdje.</Text>
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
          <Text style={styles.emptyText}>Još nema poruka</Text>
          <Text style={styles.emptySubtext}>Podijeli svoj link da dobiješ anonimne poruke!</Text>
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
      <View style={styles.tabs}>
        {[TAB_ANKETE, TAB_LINK].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === TAB_ANKETE ? 'Ankete' : 'Link'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderContent()}

      {activeTab === TAB_ANKETE && (
        <View style={styles.bottomCTA}>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaLock}>🔒</Text>
            <Text style={styles.ctaText}>Vidi ko te lajka</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surface,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderColor: colors.primary,
    backgroundColor: '#eef2ff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text_secondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  messagesList: {
    padding: 16,
  },
  messageCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  messageIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pinkDot: {
    backgroundColor: '#f472b6',
  },
  blueDot: {
    backgroundColor: '#60a5fa',
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
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text_secondary,
    textAlign: 'center',
  },
  bottomCTA: {
    padding: 20,
    paddingBottom: 30,
  },
  ctaButton: {
    backgroundColor: colors.text_primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderRadius: 30,
  },
  ctaLock: {
    fontSize: 18,
    marginRight: 8,
  },
  ctaText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '700',
  },
});
