import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { getInbox, getCurrentUser } from '../api';

export default function AnonymousInboxScreen() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

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
      console.error('Greška pri učitavanju sandučića:', error);
    }
    setLoading(false);
  };

  const renderMessage = ({ item }) => {
    const metadata = item.metadata || {};
    const from = metadata.gender ? `Od: ${metadata.gender}` : 'Anonimno';
    const ts = item.created_at
      ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Upravo sada';

    return (
      <TouchableOpacity style={styles.messageCard}>
        <View style={styles.messageIcon}>
          <Text style={styles.flameEmoji}>🔥</Text>
        </View>
        <View style={styles.messageContent}>
          <Text style={styles.messageText} numberOfLines={1}>
            {item.message}
          </Text>
          <Text style={styles.messageMetadata}>{from}</Text>
        </View>
        <Text style={styles.messageTime}>{ts}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Učitavam poruke...</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>Još nema poruka</Text>
          <Text style={styles.emptySubtext}>Podijeli svoj link da dobiješ anonimne poruke!</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
        />
      )}

      <View style={styles.bottomCTA}>
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaIcon}>👀</Text>
          <Text style={styles.ctaText}>Vidi ko te lajka</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    messagesList: {
      padding: 16,
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
    },
    messageIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      borderWidth: 1,
      borderColor: colors.border,
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
      textAlign: 'center',
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
      backgroundColor: colors.primary,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 18,
      borderRadius: 30,
    },
    ctaIcon: {
      fontSize: 20,
      marginRight: 8,
      color: colors.textLight,
    },
    ctaText: {
      color: colors.textLight,
      fontSize: 16,
      fontWeight: '700',
    },
  });
