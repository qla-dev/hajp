import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { fetchFriendSuggestions } from '../api';

export default function SuggestionsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchFriendSuggestions();
      setSuggestions(data?.data || []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const renderAvatar = (item) => {
    if (item.profile_photo) {
      return <Image source={{ uri: item.profile_photo }} style={styles.cardAvatar} />;
    }
    const initials = (item.name || item.username || 'Korisnik')
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
    return (
      <View style={[styles.cardAvatar, styles.avatarFallback]}>
        <Text style={styles.avatarFallbackText}>{initials}</Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentInsetAdjustmentBehavior="always"
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadSuggestions} tintColor={colors.primary} colors={[colors.primary]} />
      }
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Pozivnice</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Friends')}>
          <Text style={styles.sectionLink}>Prikaži sve +</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.promoCard}>
        <Text style={styles.promoTitle}>Zip - brza slagalica</Text>
        <Text style={styles.promoSubtitle}>Riječi za manje od 60s</Text>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Riješi</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mreža</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Friends')}>
          <Text style={styles.sectionLink}>Upravljaj mrežom +</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subheading}>Preporuke na osnovu aktivnosti</Text>

      {loading ? (
        <View style={styles.loaderRow}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsRow}
          snapToAlignment="start"
          snapToInterval={232}
          decelerationRate="fast"
          onMomentumScrollEnd={() => {
            Haptics.selectionAsync().catch(() => {});
          }}
        >
          {suggestions.map((item) => (
            <View key={item.id || item.username || item.name} style={styles.card}>
              <View style={styles.cardHeader}>
                {renderAvatar(item)}
                <TouchableOpacity>
                  <Text style={styles.closeIcon}>×</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cardName}>{item.name || item.username}</Text>
              {item.username ? <Text style={styles.cardSubtitle}>@{item.username}</Text> : null}
              <Text style={styles.cardMutual}>Preporučeno za tebe</Text>
              <TouchableOpacity style={styles.primaryGhostButton}>
                <Text style={styles.primaryGhostButtonText}>Poveži se</Text>
              </TouchableOpacity>
            </View>
          ))}
          {suggestions.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.cardName}>Nema preporuka</Text>
              <Text style={styles.cardMutual}>Osvježi da dobiješ nove prijedloge.</Text>
              <TouchableOpacity style={styles.primaryGhostButton} onPress={loadSuggestions}>
                <Text style={styles.primaryGhostButtonText}>Osvježi</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </ScrollView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text_primary,
    },
    sectionLink: {
      color: colors.primary,
      fontWeight: '700',
    },
    promoCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    promoTitle: {
      color: colors.text_primary,
      fontWeight: '800',
      fontSize: 16,
    },
    promoSubtitle: {
      color: colors.text_secondary,
      fontSize: 13,
    },
    secondaryButton: {
      alignSelf: 'flex-start',
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: {
      color: colors.text_primary,
      fontWeight: '700',
    },
    subheading: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 6,
      color: colors.text_primary,
      fontWeight: '700',
    },
    cardsRow: {
      paddingHorizontal: 16,
      gap: 12,
      paddingBottom: 12,
    },
    card: {
      width: 220,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    emptyCard: {
      width: 220,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardAvatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.secondary,
    },
    avatarFallback: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarFallbackText: {
      color: colors.textLight,
      fontWeight: '800',
      fontSize: 18,
    },
    cardName: {
      fontWeight: '800',
      color: colors.text_primary,
      fontSize: 16,
    },
    cardSubtitle: {
      color: colors.text_secondary,
    },
    cardMutual: {
      color: colors.text_secondary,
      fontSize: 12,
    },
    primaryGhostButton: {
      marginTop: 4,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: colors.primary,
      alignItems: 'center',
    },
    primaryGhostButtonText: {
      color: colors.primary,
      fontWeight: '800',
    },
    loaderRow: {
      paddingVertical: 30,
      alignItems: 'center',
    },
    closeIcon: {
      color: colors.text_secondary,
      fontSize: 18,
      fontWeight: '700',
    },
  });
