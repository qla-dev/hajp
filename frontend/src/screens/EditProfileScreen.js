import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';
import FormTextInput from '../components/FormTextInput';

export default function EditProfileScreen({ navigation, route }) {
  const user = route.params?.user || {};
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const avatarTextColor = encodeURIComponent(colors.textLight.replace('#', ''));

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
                '&color=' +
                avatarTextColor,
          }}
          style={styles.avatar}
        />
        <View style={styles.cameraBadge}>
          <Text style={styles.cameraIcon}>📸</Text>
        </View>
      </View>

      <View style={styles.formSection}>
        <InputRow label="Ime" value={user.first_name || user.name?.split(' ')[0] || ''} styles={styles} colors={colors} />
        <InputRow label="Prezime" value={user.last_name || ''} styles={styles} colors={colors} />
        <InputRow label="Korisničko ime" value={user.username || user.email?.split('@')[0] || ''} styles={styles} colors={colors} />
        <InputRow label="Pol" value={user.sex || 'Nedefinisano'} styles={styles} colors={colors} />
      </View>

      <Text style={styles.sectionLabel}>Škola</Text>
      <View style={styles.formSection}>
        <InputRow label="Škola" value={user.school || ''} styles={styles} colors={colors} />
        <InputRow label="Razred" value={user.grade || ''} styles={styles} colors={colors} />
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

function InputRow({ label, value, styles, colors }) {
  return (
    <View style={styles.inputRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <FormTextInput value={value} editable={false} style={styles.input} />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    avatarWrapper: {
      alignItems: 'center',
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderColor: colors.border,
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
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    inputRow: {
      marginVertical: 6,
    },
    inputLabel: {
      fontSize: 12,
      color: colors.text_secondary,
      marginBottom: 4,
    },
    input: {
      backgroundColor: colors.backgroundDark,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      fontSize: 14,
      color: colors.text_primary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionLabel: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 6,
      fontSize: 13,
      color: colors.text_secondary,
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
