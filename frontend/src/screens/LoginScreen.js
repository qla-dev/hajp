import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import colors from '../theme/colors';
import { login } from '../api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await login({ email, password });
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (e) {
      alert('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.title}>Log In</Text>
        <Text style={styles.subtitle}>Welcome back to Gas!</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          placeholderTextColor={colors.text_secondary}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          style={styles.input}
          placeholderTextColor={colors.text_secondary}
        />

        <TouchableOpacity onPress={onLogin} style={[styles.loginButton, loading && styles.loginButtonDisabled]} disabled={loading}>
          <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
          <Text style={styles.registerLinkText}>
            Don't have an account? <Text style={styles.registerLinkBold}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text_primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text_secondary,
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.surface,
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
  },
  loginButtonDisabled: {
    opacity: 0.6,
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
});
