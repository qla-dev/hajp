import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme/darkMode';

const connections = [
  { name: 'Maja Džubur', title: 'Talent Research Intern @Popcorn Recruiters', date: 'December 1, 2025', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=60' },
  { name: 'Selma Imamović', title: 'Master of Management and Communication', date: 'December 1, 2025', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=60' },
  { name: 'Naida Rizvan', title: 'Software Engineer', date: 'December 1, 2025', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=60' },
  { name: 'Sara Rustja', title: 'Product Manager', date: 'November 30, 2025', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=60' },
];

export default function FriendsConnectionsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <FlatList
        data={connections}
        keyExtractor={(item) => item.name}
        ListHeaderComponent={
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={colors.text_primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Prijatelji</Text>
            <View style={{ width: 24 }} />
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.subtitle}>{item.title}</Text>
              <Text style={styles.meta}>Povezano {item.date}</Text>
            </View>
            <TouchableOpacity style={styles.messageButton}>
              <Ionicons name="paper-plane" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    backButton: {
      padding: 4,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text_primary,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      gap: 12,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.secondary,
    },
    info: {
      flex: 1,
      gap: 2,
    },
    name: {
      fontWeight: '800',
      color: colors.text_primary,
    },
    subtitle: {
      color: colors.text_secondary,
    },
    meta: {
      color: colors.text_secondary,
      fontSize: 12,
    },
    messageButton: {
      padding: 8,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
    },
  });

