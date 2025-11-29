import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import colors from '../theme/colors';

export default function SettingsScreen({ navigation }) {
  const [reduceNotifications, setReduceNotifications] = useState(false);
  const [hideTopFlames, setHideTopFlames] = useState(false);
  const [breakEnabled, setBreakEnabled] = useState(false);

  return (
    <ScrollView style={styles.container} contentInsetAdjustmentBehavior="always">
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Podešavanja</Text>
        <SettingRow label="Smanji notifikacije" value={reduceNotifications} onValueChange={setReduceNotifications} />
        <SettingRow label="Sakrij top hajpove" value={hideTopFlames} onValueChange={setHideTopFlames} />
        <SettingRow label="Pauza od Hajpa" value={breakEnabled} onValueChange={setBreakEnabled} />
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
    </ScrollView>
  );
}

function SettingRow({ label, value, onValueChange }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  section: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
  },
  sectionLabel: {
    fontSize: 13,
    color: '#7a7a7a',
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
});
