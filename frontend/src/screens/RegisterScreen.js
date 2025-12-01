import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Keyboard, LayoutAnimation, UIManager, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { register } from '../api';
import FormTextInput from '../components/FormTextInput';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const genderOptions = [
  { key: 'girl', label: 'Žensko', icon: 'female-outline' },
  { key: 'boy', label: 'Muško', icon: 'male-outline' },
];
const years = Array.from({ length: 35 }, (_, i) => 16 + i); // 16 through 50

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('girl');
  const [year, setYear] = useState(18);
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const keyboardOffset = Platform.select({ ios: 0, android: 0 }); // keep zero to avoid extra padding when keyboard opens

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

  const onRegister = async () => {
    if (!name || !username || !email || !password || !gender || !year) {
      alert('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await register({ name, username, email, password, gender, year });
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e) {
      alert('Registration failed. Please try again.');
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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.title}>Kreiraj račun</Text>
          <Text style={styles.subtitle}>Pridruži se Hajpu, glasaj i budi dio zajednice!</Text>

        <FormTextInput
          placeholder="Ime i prezime"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          style={styles.input}
        />

        <FormTextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          style={styles.input}
        />

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

          <View style={styles.genderRow}>
            {genderOptions.map((item) => {
              const active = gender === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => setGender(item.key)}
                  style={[styles.genderButton, active && styles.genderButtonActive]}
                >
                  <View style={[styles.genderBadge, active && styles.genderBadgeActive]}>
                    <Ionicons name={item.icon} size={16} color={active ? colors.textLight : colors.text_primary} />
                  </View>
                  <Text style={[styles.genderText, active && styles.genderTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.ageBlock}>
          <Text style={[styles.label, styles.ageLabel]}>Godine</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearScroll} contentContainerStyle={styles.yearRow}>
            {years.map((y) => {
              const active = year === y;
              return (
                <TouchableOpacity key={y} onPress={() => setYear(y)} style={[styles.yearChip, active && styles.yearChipActive]}>
                  <Text style={[styles.yearText, active && styles.yearTextActive]}>{y}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.content}>
          <TouchableOpacity onPress={onRegister} style={[styles.registerButton, loading && styles.registerButtonDisabled]} disabled={loading}>
            {loading && <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />}
            <Text style={styles.registerButtonText}>{loading ? 'Kreiranje računa' : 'Kreiraj račun'}</Text>
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
                <Ionicons name="logo-apple" size={22} color={colors.text_primary} />
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
    label: {
      marginBottom: 8,
      marginTop: 4,
      color: colors.text_secondary,
      fontWeight: '600',
    },
    genderRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    genderButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 12,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    genderButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
    genderBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.border,
    },
    genderBadgeActive: {
      backgroundColor: colors.primary,
    },
    genderText: {
      fontWeight: '700',
      color: colors.text_primary,
    },
    genderTextActive: {
      color: colors.primary,
    },
    ageBlock: {
      width: '100%',
      paddingHorizontal: 0,
      marginBottom: 16,
    },
    ageLabel: {
      paddingHorizontal: 24,
    },
    yearScroll: {
      width: '100%',
    },
    yearRow: {
      paddingVertical: 6,
      paddingLeft: 24,
      paddingRight: 0,
      gap: 6,
    },
    yearChip: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginRight: 6,
      backgroundColor: colors.surface,
    },
    yearChipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
    yearText: {
      fontWeight: '700',
      color: colors.text_primary,
    },
    yearTextActive: {
      color: colors.primary,
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
