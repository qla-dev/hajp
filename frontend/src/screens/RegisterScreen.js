import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import colors from '../theme/colors';
import { register } from '../api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!name || !email || !password || !school || !grade) {
      alert('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, password, school, grade });
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (e) {
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Gas and start voting!</Text>

          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor={colors.text_secondary}
          />

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

          <TextInput
            placeholder="School"
            value={school}
            onChangeText={setSchool}
            style={styles.input}
            placeholderTextColor={colors.text_secondary}
          />

          <TextInput
            placeholder="Grade (e.g., 10th Grade)"
            value={grade}
            onChangeText={setGrade}
            style={styles.input}
            placeholderTextColor={colors.text_secondary}
          />

          <TouchableOpacity onPress={onRegister} style={[styles.registerButton, loading && styles.registerButtonDisabled]} disabled={loading}>
            <Text style={styles.registerButtonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginLinkBold}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
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
  registerButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 30,
    marginTop: 8,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: colors.textLight,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  loginLink: {
    marginTop: 20,
    padding: 12,
  },
  loginLinkText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.text_secondary,
  },
  loginLinkBold: {
    fontWeight: '700',
    color: colors.primary,
  },
});
