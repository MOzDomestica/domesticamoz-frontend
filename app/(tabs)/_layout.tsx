import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getTotalNaoLidas } from '@/constants/notifications';
import { supabase } from '@/constants/supabase';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function BadgeSino({ color }: { color: string }) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      const n = await getTotalNaoLidas();
      setTotal(n);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
      <IconSymbol size={28} name="bell.fill" color={color} />
      {total > 0 && (
        <View style={{
          position: 'absolute', top: -2, right: -2,
          backgroundColor: '#c0392b', borderRadius: 8,
          minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
          paddingHorizontal: 3,
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
            {total > 9 ? '9+' : total}
          </Text>
        </View>
      )}
    </View>
  );
}

function BadgeMatches({ color }: { color: string }) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    verificarMatches();
    const interval = setInterval(verificarMatches, 10000);
    return () => clearInterval(interval);
  }, []);

  async function verificarMatches() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: anuncios } = await supabase
        .from('anuncios_empregadores')
        .select('id')
        .eq('utilizador_id', user.id)
        .eq('estado', 'activo')
        .limit(1);

      if (!anuncios || anuncios.length === 0) {
        const { data: perfil } = await supabase
          .from('perfis_trabalhadoras')
          .select('id')
          .eq('utilizador_id', user.id)
          .single();

        if (!perfil) return;

        const { count } = await supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .eq('perfil_trabalhadora_id', perfil.id)
          .eq('estado', 'pendente');

        setTotal(count ?? 0);
        return;
      }

      const { count } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('anuncio_id', anuncios[0].id)
        .eq('estado', 'pendente');

      setTotal(count ?? 0);
    } catch (e) {
      // silencioso
    }
  }

  return (
    <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
      <IconSymbol size={28} name="heart.fill" color={color} />
      {total > 0 && (
        <View style={{
          position: 'absolute', top: -2, right: -2,
          backgroundColor: '#1D9E75', borderRadius: 8,
          minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
          paddingHorizontal: 3,
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
            {total > 9 ? '9+' : total}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="match"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color }) => <BadgeMatches color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Mensagens',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="message.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Avisos',
          tabBarIcon: ({ color }) => <BadgeSino color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Definições',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
      <Tabs.Screen name="employer" options={{ href: null }} />
      <Tabs.Screen name="worker" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="register" options={{ href: null }} />
      <Tabs.Screen name="verify" options={{ href: null }} />
      <Tabs.Screen name="contract" options={{ href: null }} />
      <Tabs.Screen name="review" options={{ href: null }} />
      <Tabs.Screen name="subscription" options={{ href: null }} />
      <Tabs.Screen name="invite" options={{ href: null }} />
    </Tabs>
  );
}