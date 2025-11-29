import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import MainTabs from './src/navigation/MainTabs';

export default function App() {
  return (
    <GluestackUIProvider config={config}>
      <NavigationContainer>
        <MainTabs />
        <StatusBar style="auto" />
      </NavigationContainer>
    </GluestackUIProvider>
  );
}
