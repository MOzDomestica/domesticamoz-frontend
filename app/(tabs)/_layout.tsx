import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>

      {/* BOTTOM NAV: Início | Matches | Mensagens | Minha Conta */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="match"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="heart.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Mensagens',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="message.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Minha Conta',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />

      {/* ECRÃS SEM SEPARADOR */}
      <Tabs.Screen name="login"         options={{ href: null }} />
      <Tabs.Screen name="register"      options={{ href: null }} />
      <Tabs.Screen name="employer"      options={{ href: null }} />
      <Tabs.Screen name="worker"        options={{ href: null }} />
      <Tabs.Screen name="explore"       options={{ href: null }} />
      <Tabs.Screen name="verify"        options={{ href: null }} />
      <Tabs.Screen name="contract"      options={{ href: null }} />
      <Tabs.Screen name="review"        options={{ href: null }} />
      <Tabs.Screen name="subscription"  options={{ href: null }} />
      <Tabs.Screen name="invite"        options={{ href: null }} />
      <Tabs.Screen name="profile"       options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}<Tabs.Screen name="login" options={{ href: null }} />