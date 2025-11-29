import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import colors from '../theme/colors';

export default function EditProfileScreen({ navigation, route }) {
  const user = route.params?.user || {};

  return (
    <ScrollView style={styles.container} contentInsetAdjustmentBehavior="always">
      <View style={styles.avatarWrapper}>
        <Image
          source={{
            uri:
              user.profile_photo ||
              'https://ui-avatars.com/api/?name=' +
                (user.name || 'Korisnik') +
                '&size=200&background=' +
                encodeURIComponent(colors.profilePurple.replace('#', '')) +
                '&color=ffffff',
          }}
          style={styles.avatar}
        />
        <View style={styles.cameraBadge}>
          <Text style={styles.cameraIcon}>📷</Text>
        </View>
      </View>

      <View style={styles.formSection}>
        <InputRow label="Ime" value={user.first_name || user.name?.split(' ')[0] || ''} />
        <InputRow label="Prezime" value={user.last_name || ''} />
        <InputRow label="Korisničko ime" value={user.username || user.email?.split('@')[0] || ''} />
        <InputRow label="Pol" value={user.sex || 'Nedefinisano'} />
      </View>

      <Text style={styles.sectionLabel}>Škola</Text>
      <View style={styles.formSection}>
        <InputRow label="Škola" value={user.school || ''} />
        <InputRow label="Razred" value={user.grade || ''} />
      </View>

      <Text style={styles.sectionLabel}>Podešavanja naloga</Text>
      <View style={styles.formSection}>
        <TouchableOpacity style={styles.listRow}>
          <Text style={styles.listRowText}>Vrati kupovine</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listRow}>
          <Text style={styles.listRowText}>Upravljaj nalogom</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function InputRow({ label, value }) {
  return (
    <View style={styles.inputRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput value={value} editable={false} style={styles.input} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  avatarWrapper: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e5e5e5',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 12,
    right: 20,
  },
  cameraIcon: {
    fontSize: 20,
  },
  formSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e5e5',
  },
  inputRow: {
    marginVertical: 6,
  },
  inputLabel: {
    fontSize: 12,
    color: '#7a7a7a',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text_primary,
  },
  sectionLabel: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
    fontSize: 13,
    color: '#7a7a7a',
    fontWeight: '700',
  },
  listRow: {
    paddingVertical: 12,
  },
  listRowText: {
    fontSize: 14,
    color: colors.text_primary,
    fontWeight: '600',
  },
});
