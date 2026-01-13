import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/darkMode';

const TILE_SIZE = 110;

export default function StoryUploadModal({
  visible,
  onClose,
  onCameraPress,
  onLibraryPress,
  gallery = [],
}) {
  const { colors } = useTheme();
  const samples = gallery.slice(0, 8);

  const renderPreview = ({ item }) => (
    <View style={[styles.preview, { borderColor: colors.border }]}>
      <Image source={{ uri: item?.media_url }} style={styles.previewImage} resizeMode="cover" />
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={[styles.backdrop, { backgroundColor: '#000000dd' }]}>
        <View style={[styles.card, { backgroundColor: '#000' }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text_primary }]}>Nova priča</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Ionicons name="close" size={24} color={colors.text_secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            <TouchableOpacity
              onPress={onCameraPress}
              style={[styles.tile, { borderColor: colors.border }]}
              activeOpacity={0.8}
            >
              <View style={[styles.tileContent, { backgroundColor: colors.secondary + '22' }]}>
                <Ionicons name="camera" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.tileLabel, { color: colors.text_primary }]}>Kamera</Text>
              <Text style={[styles.tileHint, { color: colors.text_secondary }]}>Snimi odmah</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onLibraryPress}
              style={[styles.tile, { borderColor: colors.border }]}
              activeOpacity={0.8}
            >
              <View style={[styles.tileContent, { backgroundColor: colors.primary + '22' }]}>
                <Ionicons name="images" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.tileLabel, { color: colors.text_primary }]}>Galerija</Text>
              <Text style={[styles.tileHint, { color: colors.text_secondary }]}>Izaberi foto</Text>
            </TouchableOpacity>
          </View>

          {!!samples.length && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.text_secondary }]}>Nedavni prizori</Text>
              <FlatList
                data={samples}
                renderItem={renderPreview}
                keyExtractor={(item, index) => `${item?.id || item?.media_url || index}-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.previewList}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tile: {
    width: TILE_SIZE,
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
  },
  tileContent: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  tileLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  tileHint: {
    fontSize: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  previewList: {
    paddingVertical: 4,
  },
  preview: {
    width: 90,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    marginRight: 12,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});
