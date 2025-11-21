import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import colors from '../theme/colors';

export default function ProfileScreen({ navigation }) {
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={{ uri: 'https://placekitten.com/200/200' }} style={{ width: 64, height: 64, borderRadius: 32 }} />
        <View style={{ marginLeft: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>User</Text>
          <Text style={{ color: colors.text_secondary }}>School · Grade</Text>
        </View>
      </View>
      <TouchableOpacity onPress={()=> navigation.navigate('AnonymousInbox', { userId: 1 })} style={{ marginTop: 16, backgroundColor: colors.secondary, padding: 16, borderRadius: 8 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>Anonymous Inbox</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=> navigation.navigate('ShareLink')} style={{ marginTop: 12, backgroundColor: colors.primary_light, padding: 16, borderRadius: 8 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>Share Link</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=> navigation.navigate('Subscription')} style={{ marginTop: 12, backgroundColor: colors.primary, padding: 16, borderRadius: 8 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>Subscription</Text>
      </TouchableOpacity>
    </View>
  );
}