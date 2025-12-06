import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import SuggestionSlider from '../components/SuggestionSlider';

export default function SuggestionsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <ScrollView
      style={styles.container}
      contentInsetAdjustmentBehavior="always"
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Zahtjevi za povezivanje</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Friends', { screen: 'FriendsList', params: { mode: 'requests' } })}>
          <Text style={styles.sectionLink}>Prikaži sve +</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.promoCard}>
        <Text style={styles.promoTitle}>Zip - brza slagalica</Text>
        <Text style={styles.promoSubtitle}>Riješi za manje od 60s</Text>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Riješi</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mreža</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Friends', { screen: 'FriendsList' })}>
          <Text style={styles.sectionLink}>Upravljaj mrežom +</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subheading}>Preporuke na osnovu aktivnosti</Text>

      <SuggestionSlider
        linkLabel="Pogledajte sve"
        onLinkPress={() => navigation.navigate('Friends', { screen: 'FriendsList' })}
      />
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
  });
