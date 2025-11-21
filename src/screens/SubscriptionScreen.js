import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import { subscriptionStatus, subscribe } from '../api';

export default function SubscriptionScreen() {
  const [sub, setSub] = useState(null);
  useEffect(() => { subscriptionStatus().then(({ data }) => setSub(data.subscription)).catch(() => {}); }, []);
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
      <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text_primary }}>Subscription</Text>
      <Text style={{ marginTop: 8, color: colors.text_secondary }}>{sub ? `Expires ${sub.expires_at}` : 'Not subscribed'}</Text>
      <TouchableOpacity onPress={() => subscribe().then(({ data }) => setSub(data.subscription))} style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 8, marginTop: 16 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>{sub ? 'Renew' : 'Subscribe'}</Text>
      </TouchableOpacity>
    </View>
  );
}