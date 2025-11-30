import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { useThemedStyles } from '../theme/darkMode';

export default function ShareScreen() {
  const styles = useThemedStyles(createStyles);

  return (
    <ScrollView style={styles.container} contentInsetAdjustmentBehavior="always">
      <View style={styles.cardCarousel}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=60' }}
          style={styles.bigCard}
          imageStyle={{ borderRadius: 24 }}
        >
          <View style={styles.cardOverlay}>
            <View style={styles.avatar} />
            <Text style={styles.cardTitle}>pošalji mi anonimnu poruku!</Text>
            <View style={styles.cardDots}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.stepCard}>
        <Text style={styles.stepTitle}>Korak 1: Kopiraj svoj link</Text>
        <Text style={styles.linkLabel}>ngl.link/korisnik</Text>
        <TouchableOpacity style={styles.copyButton}>
          <Text style={styles.copyText}>🔗 kopiraj link</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stepCard}>
        <Text style={styles.stepTitle}>Korak 2: Podijeli link u story</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Podijeli!</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    cardCarousel: {
      padding: 16,
    },
    bigCard: {
      height: 220,
      borderRadius: 24,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
      justifyContent: 'center',
    },
    cardOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.surface,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: colors.background,
    },
    cardTitle: {
      color: colors.textLight,
      fontSize: 20,
      fontWeight: '800',
      textAlign: 'center',
    },
    cardDots: {
      flexDirection: 'row',
      marginTop: 12,
      gap: 6,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    dotActive: {
      backgroundColor: colors.primary,
    },
    stepCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    stepTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text_primary,
      marginBottom: 12,
    },
    linkLabel: {
      fontSize: 14,
      color: colors.text_secondary,
      marginBottom: 12,
    },
    copyButton: {
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: 20,
      paddingVertical: 12,
      alignItems: 'center',
    },
    copyText: {
      color: colors.primary,
      fontWeight: '800',
      fontSize: 15,
    },
    shareButton: {
      marginTop: 12,
      borderRadius: 22,
      paddingVertical: 14,
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    shareButtonText: {
      color: colors.textLight,
      fontWeight: '800',
      fontSize: 16,
    },
  });
