import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Keyboard, LayoutAnimation, UIManager, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SvgUri } from 'react-native-svg';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { register, baseURL } from '../api';
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [gender, setGender] = useState('girl');
  const [year, setYear] = useState(18);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const keyboardOffset = Platform.select({ ios: 0, android: 0 }); // keep zero to avoid extra padding when keyboard opens
  const logoUri = `${baseURL}/img/logo.svg`;

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

  const clearError = (key) => {
    setErrors((prev) => {
      if (!prev?.[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const onRegister = async () => {
    if (!name || !username || !email || !password || !confirmPassword || !gender || !year) {
      Alert.alert('Greška', 'Popuni sva polja.');
      return;
    }
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordPattern.test(password)) {
      Alert.alert('Greška', 'Lozinka mora imati najmanje 6 karaktera, jedno veliko slovo i jedan broj.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Greška', 'Lozinke se ne podudaraju.');
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const data = await register({
        name,
        username,
        email,
        password,
        password_confirmation: confirmPassword,
        sex: gender,
        year,
      });
      const message = data?.message || 'Uspješna registracija i prijava';
      Alert.alert('Registracija', message, [
        {
          text: 'Nastavi',
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'AvatarGenerator',
                  params: { authUserGender: gender, isSetup: 1 },
                },
              ],
            }),
        },
      ]);
    } catch (e) {
      const apiErrors = e?.response?.data?.errors || {};
      setErrors(apiErrors);
      const flattened = Object.values(apiErrors || {}).flat();
      const msg = flattened.length ? flattened.join('\n') : e?.response?.data?.message || 'Registracija nije uspjela. Pokušaj ponovo.';
      Alert.alert('Greška', msg);
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
          <View style={styles.subtitleRow}>
            <Text style={styles.subtitle}>Uskoči na </Text>
            <SvgUri style={styles.logoimg} width={72} height={20} uri={logoUri} preserveAspectRatio="xMidYMid meet" />
            <Text style={styles.subtitle}>i saznaj kome se dopadaš!</Text>
          </View>

        <FormTextInput
          placeholder="Username"
          value={username}
          onChangeText={(text) => {
            clearError('username');
            setUsername(text);
          }}
          autoCapitalize="none"
          style={styles.input}
        />
        {!!errors?.username && <Text style={styles.errorText}>{errors.username[0]}</Text>}

        <FormTextInput
          placeholder="Ime i prezime"
          value={name}
          onChangeText={(text) => {
            clearError('name');
            setName(text);
          }}
          autoCapitalize="words"
          style={styles.input}
        />
        {!!errors?.name && <Text style={styles.errorText}>{errors.name[0]}</Text>}

        <FormTextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            clearError('email');
            setEmail(text);
          }}
          autoCapitalize="none"
          keyboardType="email-address"
            style={styles.input}
          />
        {!!errors?.email && <Text style={styles.errorText}>{errors.email[0]}</Text>}

        <View style={styles.passwordWrapper}>
          <FormTextInput
            placeholder="Lozinka"
            value={password}
            onChangeText={(text) => {
              clearError('password');
              setPassword(text);
            }}
            secureTextEntry={!showPassword}
            style={[styles.input, styles.passwordInput]}
          />
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.eyeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.text_secondary} />
          </TouchableOpacity>
        </View>
        {!!errors?.password && <Text style={styles.errorText}>{errors.password[0]}</Text>}

        <View style={styles.passwordWrapper}>
          <FormTextInput
            placeholder="Ponovi lozinku"
            value={confirmPassword}
            onChangeText={(text) => {
              clearError('password');
              setConfirmPassword(text);
            }}
            secureTextEntry={!showConfirmPassword}
            style={[styles.input, styles.passwordInput]}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword((prev) => !prev)}
            style={styles.eyeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={colors.text_secondary} />
          </TouchableOpacity>
        </View>

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
            <View style={styles.registerButtonRow}>
              {loading && <ActivityIndicator size="small" color="#FFFFFF" style={styles.registerSpinner} />}
              <Text style={styles.registerButtonText}>{loading ? 'Kreiranje' : 'Kreiraj račun'}</Text>
            </View>
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
    subtitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0,
      marginBottom: 32,
    },
    subtitle: {
      fontSize: 16,
      color: colors.text_secondary,
      marginBottom: 0,
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
    passwordWrapper: {
      position: 'relative',
    },
    passwordInput: {
      paddingRight: 44,
    },
    eyeButton: {
      position: 'absolute',
      right: 12,
      top: 14,
      height: 24,
      width: 24,
      alignItems: 'center',
      justifyContent: 'center',
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
    registerButtonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    registerSpinner: {
      marginRight: 8,
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
      color: colors.secondary,
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
    errorText: {
      color: colors.error,
      marginTop: -10,
      marginBottom: 12,
      fontSize: 12,
    },
    logoimg: {
      marginBottom: 5,
      marginLeft: -2,
    },
  });
