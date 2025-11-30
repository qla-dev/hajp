import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import { THEME_MODES } from '../theme/colors';
import { logout } from '../api';

const THEME_OPTIONS = [
  { value: THEME_MODES.SYSTEM, label: 'Auto', description: 'Prati podešavanje sistema' },
  { value: THEME_MODES.LIGHT, label: 'Svijetli', description: 'Svijetli izgled aplikacije' },
  { value: THEME_MODES.DARK, label: 'Tamni', description: 'Tamni izgled aplikacije' },
];

export default function SettingsScreen({ navigation }) {
  const [reduceNotifications, setReduceNotifications] = useState(false);
  const [hideTopFlames, setHideTopFlames] = useState(false);
  const [breakEnabled, setBreakEnabled] = useState(false);

  const { colors, mode, setMode, systemScheme } = useTheme();
  const styles = useThemedStyles(createStyles);

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Auth',
          state: { index: 0, routes: [{ name: 'Welcome' }] },
        },
      ],
    });
  };

  const handleThemeChange = (value) => {
    setMode(value);
  };

  return (
    <ScrollView style={styles.container} contentInsetAdjustmentBehavior="always">
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Tema</Text>
        {THEME_OPTIONS.map((option) => (
          <ThemeOption
            key={option.value}
            option={option}
            selected={mode === option.value}
            onSelect={handleThemeChange}
            systemScheme={systemScheme}
            styles={styles}
            colors={colors}
          />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Podešavanja</Text>
        <SettingRow label="Smanji notifikacije" value={reduceNotifications} onValueChange={setReduceNotifications} styles={styles} colors={colors} />
        <SettingRow label="Sakrij top hajpove" value={hideTopFlames} onValueChange={setHideTopFlames} styles={styles} colors={colors} />
        <SettingRow label="Pauza od Hajpa" value={breakEnabled} onValueChange={setBreakEnabled} styles={styles} colors={colors} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Imena u anketama</Text>
        <TouchableOpacity style={styles.listRow}>
          <Text style={styles.listRowText}>Svi</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Prijatelji</Text>
        <TouchableOpacity style={styles.listRow}>
          <Text style={styles.listRowText}>Resetuj blok listu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listRow}>
          <Text style={styles.listRowText}>Resetuj hide listu</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.deleteButton}>
          <Text style={styles.deleteText}>Obriši nalog</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Odjava</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function SettingRow({ label, value, onValueChange, styles, colors }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={value ? colors.textLight : colors.surface}
      />
    </View>
  );
}

function ThemeOption({ option, selected, onSelect, systemScheme, styles, colors }) {
  const detail =
    option.value === THEME_MODES.SYSTEM && systemScheme
      ? `Prati uređaj (${systemScheme === THEME_MODES.DARK ? 'tamni' : 'svijetli'})`
      : option.description;

  return (
    <TouchableOpacity
      style={[styles.themeRow, selected && styles.themeRowActive]}
      onPress={() => onSelect(option.value)}
      activeOpacity={0.9}
    >
      <View style={styles.themeTextWrapper}>
        <Text style={styles.settingLabel}>{option.label}</Text>
        <Text style={styles.themeDescription}>{detail}</Text>
      </View>
      <Ionicons
        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
        size={22}
        color={selected ? colors.primary : colors.text_secondary}
      />
    </TouchableOpacity>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 0,
    },
    section: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderTopWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginTop: 12,
    },
    sectionLabel: {
      fontSize: 13,
      color: colors.text_secondary,
      fontWeight: '700',
      marginBottom: 8,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
    },
    settingLabel: {
      fontSize: 14,
      color: colors.text_primary,
    },
    listRow: {
      paddingVertical: 12,
    },
    listRowText: {
      fontSize: 14,
      color: colors.text_primary,
      fontWeight: '600',
    },
    deleteButton: {
      paddingVertical: 14,
      alignItems: 'center',
    },
    deleteText: {
      color: colors.error,
      fontWeight: '700',
      fontSize: 14,
    },
    logoutButton: {
      paddingVertical: 14,
      alignItems: 'center',
    },
    logoutText: {
      color: colors.error,
      fontWeight: '700',
      fontSize: 14,
    },
    themeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      gap: 12,
    },
    themeRowActive: {
      borderRadius: 10,
      backgroundColor: 'rgba(255, 107, 53, 0.07)',
      paddingHorizontal: 8,
    },
    themeTextWrapper: {
      flex: 1,
    },
    themeDescription: {
      color: colors.text_secondary,
      fontSize: 12,
      marginTop: 2,
    },
  });
