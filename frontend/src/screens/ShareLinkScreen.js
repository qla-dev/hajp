import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { getCurrentUser, getInbox } from '../api';

export default function ShareLinkScreen() {
  const [link, setLink] = useState('');

  useEffect(() => {
    const load = async () => {
      const user = await getCurrentUser();
      if (!user) return;
      try {
        const { data } = await getInbox(user.id);
        setLink(data?.share_link || '');
      } catch (error) {
        console.error('Failed to load share link', error);
      }
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share Your Link</Text>
      <Text style={styles.link}>{link || 'No link yet'}</Text>
      <TouchableOpacity style={styles.shareButton}>
        <Text style={styles.shareButtonText}>Share</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text_primary,
    marginBottom: 12,
  },
  link: {
    fontSize: 16,
    color: colors.text_primary,
    marginBottom: 16,
  },
  shareButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
  },
  shareButtonText: {
    color: colors.textLight,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
  },
});
