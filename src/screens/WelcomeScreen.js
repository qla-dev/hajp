import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 32, fontWeight: '600', color: colors.text_primary }}>Hajp</Text>
      <Text style={{ marginTop: 8, color: colors.text_secondary }}>Answer polls about friends. Share anonymous links.</Text>
      <View style={{ height: 24 }} />
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 8 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '500' }}>Login</Text>
      </TouchableOpacity>
      <View style={{ height: 12 }} />
      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ backgroundColor: colors.secondary, padding: 16, borderRadius: 8 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '500' }}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}