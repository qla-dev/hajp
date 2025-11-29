import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { getInbox, getCurrentUser } from '../api';

export default function AnonymousInboxScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInbox();
  }, []);

  const loadInbox = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (user) {
        const { data } = await getInbox(user.id);
        setMessages(data?.messages || []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading inbox:', error);
    }
    setLoading(false);
  };

  const renderMessage = ({ item }) => {
    const metadata = item.metadata || {};
    const from = metadata.gender ? `From a ${metadata.gender}` : 'Anonymous';
    const ts = item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    return (
      <TouchableOpacity style={styles.messageCard}>
        <View style={styles.messageIcon}>
          <Text style={styles.flameEmoji}>💌</Text>
        </View>
        <View style={styles.messageContent}>
          <Text style={styles.messageText} numberOfLines={1}>
            {item.message}
          </Text>
          <Text style={styles.messageMetadata}>{from}</Text>
        </View>
        <Text style={styles.messageTime}>{ts || 'Just now'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Messages List */}
      {loading ? (
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>Share your link to receive anonymous messages!</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
        />
      )}

      {/* Bottom CTA */}
      <View style={styles.bottomCTA}>
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaIcon}>👀</Text>
          <Text style={styles.ctaText}>See who likes you</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  flameEmoji: {
    fontSize: 22,
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
  ctaIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  ctaText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '700',
  },
});
