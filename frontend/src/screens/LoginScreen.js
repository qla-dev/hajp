import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard, LayoutAnimation, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { login } from '../api';
import FormTextInput from '../components/FormTextInput';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const keyboardOffset = Platform.select({ ios: -20, android: 0 }); // tweak this value to move content when keyboard shows

  useEffect(() => {
    const animate = () =>
      LayoutAnimation.configureNext({
        duration: 120,
        update: { type: LayoutAnimation.Types.easeInEaseOut },
        create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
        delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
      });
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', animate);
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', animate);
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const onLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await login({ email, password });
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e) {
      alert('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardOffset}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Prijava</Text>
        <Text style={styles.subtitle}>Dobrodošao nazad u Hajp!</Text>

        <FormTextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <FormTextInput
          placeholder="Lozinka"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          style={styles.input}
        />

        <TouchableOpacity onPress={onLogin} style={[styles.loginButton, loading && styles.loginButtonDisabled]} disabled={loading}>
          {loading && <ActivityIndicator size="small" color={colors.textLight} style={styles.loginSpinner} />}
          <Text style={styles.loginButtonText}>{loading ? 'Prijava' : 'Prijavi se'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
          <Text style={styles.registerLinkText}>
            Nemaš račun? <Text style={styles.registerLinkBold}>Registruj se</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.socialBlock}>
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>ili nastavi sa</Text>
            <View style={styles.divider} />
          </View>
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton} onPress={() => alert('Google prijava uskoro')}>
              <Ionicons name="logo-google" size={22} color="#DB4437" />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={() => alert('Apple prijava uskoro')}>
              <Ionicons name="logo-apple" size={22} color={colors.text_primary} />
              <Text style={styles.socialText}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
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
      paddingHorizontal: 24,
      justifyContent: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text_primary,
      marginBottom: 8,
      textAlign: 'center',
      marginTop: 30,
    },
    subtitle: {
      fontSize: 16,
      color: colors.text_secondary,
      marginBottom: 32,
      textAlign: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      fontSize: 16,
      color: colors.text_primary,
    },
    loginButton: {
      backgroundColor: colors.primary,
      padding: 18,
      borderRadius: 30,
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loginButtonDisabled: {
      opacity: 0.6,
    },
    loginSpinner: {
      marginRight: 8,
    },
    loginButtonText: {
      color: colors.textLight,
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '700',
    },
    registerLink: {
      marginTop: 20,
      padding: 12,
    },
    registerLinkText: {
      textAlign: 'center',
      fontSize: 14,
      color: colors.text_secondary,
    },
    registerLinkBold: {
      fontWeight: '700',
      color: colors.primary,
    },
    socialBlock: {
      marginTop: 16,
      paddingBottom: 16,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      marginHorizontal: 10,
      color: colors.text_secondary,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    socialRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
      marginTop: 20,
    },
    socialButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    socialText: {
      marginLeft: 8,
      fontWeight: '700',
      color: colors.text_primary,
    },
  });
