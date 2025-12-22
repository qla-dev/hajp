import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { useThemedStyles } from '../theme/darkMode';
import { baseURL } from '../api';

const logoUri = `${baseURL}/img/logo.svg`;

export default function WelcomeScreen({ navigation }) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>DOBRODOŠLI U</Text>
        <View style={styles.logoContainer}>
          <SvgUri
            width={300}
            height={80}
            uri={logoUri}
            preserveAspectRatio="xMidYMid meet"
            style={styles.logoImage}
          />
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <View style={styles.phonePreview}>
              <Text style={styles.featureEmoji}>😊</Text>
              <Text style={styles.featureTitle}>NAJBOLJI OSMIJEH</Text>
            </View>
            <Text style={styles.featureDescription}>Odgovaraj na ankete{'\n'}o prijateljima</Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.phonePreview2}>
              <Text style={styles.featureEmoji}>🔥</Text>
            </View>
            <Text style={styles.featureDescription}>Dobij hajp kad te{'\n'}izaberu u anketi</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.startButton}>
          <Text style={styles.startButtonText}>Kreni</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginButton}>
          <Text style={styles.loginText}>Već imaš račun? <Text style={styles.loginLinkBold}>Prijavi se</Text></Text>
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
    content: {
      flex: 1,
      padding: 24,
      justifyContent: 'center',
    },
    welcomeText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text_primary,
      textAlign: 'center',
      letterSpacing: 1,
    },
    logoContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 40,
    },
    logoImage: {
      width: 220,
      height: 80,
    },
    featuresContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 20,
    },
    featureCard: {
      alignItems: 'center',
      flex: 1,
      marginHorizontal: 8,
    },
    phonePreview: {
      backgroundColor: colors.pollPurple,
      borderRadius: 20,
      padding: 20,
      width: 140,
      height: 180,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    phonePreview2: {
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 20,
      width: 140,
      height: 180,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 2,
      borderColor: colors.primary,
      borderStyle: 'solid',
    },
    featureEmoji: {
      fontSize: 48,
      color: colors.primary,
    },
    featureTitle: {
      color: colors.textLight,
      fontWeight: '700',
      fontSize: 12,
      marginTop: 8,
      textAlign: 'center',
    },
    featureDescription: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text_primary,
      textAlign: 'center',
      lineHeight: 20,
    },
    bottomContainer: {
      padding: 24,
      paddingBottom: 40,
    },
    startButton: {
      backgroundColor: colors.primary,
      padding: 18,
      borderRadius: 30,
      marginBottom: 16,
    },
    startButtonText: {
      color: colors.textLight,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '700',
    },
    loginButton: {
      padding: 12,
      marginBottom: 8,
    },
    loginText: {
      color: colors.text_primary,
      textAlign: 'center',
      fontSize: 14,
    },
    skipButton: {
      padding: 8,
    },
    skipText: {
      color: colors.text_secondary,
      textAlign: 'center',
      fontSize: 13,
    },
      loginLinkBold: {
      fontWeight: '700',
      color: colors.secondary,
    },
  });
