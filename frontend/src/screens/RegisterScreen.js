import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { register } from '../api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const onRegister = async () => {
    if (!name || !email || !password || !school || !grade) {
      alert('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, password, school, grade });
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e) {
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.title}>Kreiraj račun</Text>
          <Text style={styles.subtitle}>Pridruži se Hajpu i glasaj!</Text>

          <TextInput
            placeholder="Ime i prezime"
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
            placeholder="Lozinka"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            style={styles.input}
            placeholderTextColor={colors.text_secondary}
          />

          <TextInput
            placeholder="Škola"
            value={school}
            onChangeText={setSchool}
            style={styles.input}
            placeholderTextColor={colors.text_secondary}
          />

          <TextInput
            placeholder="Razred (npr. 2. razred)"
            value={grade}
            onChangeText={setGrade}
            style={styles.input}
            placeholderTextColor={colors.text_secondary}
          />

          <TouchableOpacity onPress={onRegister} style={[styles.registerButton, loading && styles.registerButtonDisabled]} disabled={loading}>
            <Text style={styles.registerButtonText}>{loading ? 'Kreiram račun...' : 'Kreiraj račun'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>
              Već imaš račun? <Text style={styles.loginLinkBold}>Prijavi se</Text>
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
                <Ionicons name="logo-apple" size={22} color="#000" />
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingVertical: 24,
    },
    content: {
      paddingHorizontal: 24,
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
    socialBlock: {
      marginTop: 16,
      marginBottom: 16,
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
