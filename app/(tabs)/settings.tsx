import { getLingua, setLingua, t } from '@/constants/i18n';
import { supabase } from '@/constants/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const [lingua, setLinguaState] = useState<'pt' | 'en'>('pt');
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      getLingua().then(l => setLinguaState(l));
    }, [])
  );

  const mudarLingua = async (novaLingua: 'pt' | 'en') => {
    await setLingua(novaLingua);
    setLinguaState(novaLingua);
    Alert.alert(
      novaLingua === 'pt' ? 'Língua alterada' : 'Language changed',
      novaLingua === 'pt'
        ? 'A app está agora em Português. Navegue para outro ecrã para ver as mudanças.'
        : 'The app is now in English. Navigate to another screen to see the changes.',
    );
  };

  const limparDados = async () => {
    Alert.alert(
      t('limpar_dados'),
      t('limpar_dados_confirmacao'),
      [
        { text: t('cancelar'), style: 'cancel' },
        {
          text: t('limpar_tudo'), style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert(t('sucesso'), t('dados_limpos'));
          }
        },
      ]
    );
  };

  const logout = async () => {
    Alert.alert(
      t('terminar_sessao'),
      t('terminar_sessao_confirmacao'),
      [
        { text: t('cancelar'), style: 'cancel' },
        {
          text: t('sair'), style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            await AsyncStorage.clear();
            router.replace('/(tabs)/explore' as any);
          }
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>{t('definicoes')}</Text>

      <View style={styles.seccao}>
        <Text style={styles.seccaoTitulo}>🌍 {t('lingua_app').toUpperCase()}</Text>

        <TouchableOpacity
          style={[styles.opcao, lingua === 'pt' && styles.opcaoActiva]}
          onPress={() => mudarLingua('pt')}>
          <View style={styles.opcaoInfo}>
            <Text style={styles.opcaoBandeira}>🇲🇿</Text>
            <View>
              <Text style={[styles.opcaoTitulo, lingua === 'pt' && styles.opcaoTituloActivo]}>Português</Text>
              <Text style={styles.opcaoDesc}>{t('lingua_padrao')}</Text>
            </View>
          </View>
          {lingua === 'pt' && <Text style={styles.check}>✓</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.opcao, lingua === 'en' && styles.opcaoActiva]}
          onPress={() => mudarLingua('en')}>
          <View style={styles.opcaoInfo}>
            <Text style={styles.opcaoBandeira}>🇬🇧</Text>
            <View>
              <Text style={[styles.opcaoTitulo, lingua === 'en' && styles.opcaoTituloActivo]}>English</Text>
              <Text style={styles.opcaoDesc}>{t('lingua_expats')}</Text>
            </View>
          </View>
          {lingua === 'en' && <Text style={styles.check}>✓</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.seccao}>
        <Text style={styles.seccaoTitulo}>👤 {t('conta').toUpperCase()}</Text>

        <TouchableOpacity style={styles.opcaoPerigo} onPress={limparDados}>
          <Text style={styles.opcaoPerigoTexto}>🗑️ {t('limpar_dados')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.opcaoPerigo, { marginTop: 8 }]} onPress={logout}>
          <Text style={styles.opcaoPerigoTexto}>🚪 {t('terminar_sessao')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.seccao}>
        <Text style={styles.seccaoTitulo}>ℹ️ {t('sobre').toUpperCase()}</Text>
        <View style={styles.sobreCard}>
          <Text style={styles.sobreNome}>{t('app_nome')}</Text>
          <Text style={styles.sobreVersao}>{t('versao')}</Text>
          <Text style={styles.sobreDesc}>{t('descricao_app')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f5f5f0', padding: 24, paddingTop: 60 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#222', marginBottom: 24 },
  seccao: { marginBottom: 24 },
  seccaoTitulo: { fontSize: 13, fontWeight: '700', color: '#aaa', letterSpacing: 1, marginBottom: 12 },
  opcao: { backgroundColor: '#fff', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, borderWidth: 1, borderColor: '#e0e0da' },
  opcaoActiva: { backgroundColor: '#e8f5f0', borderColor: '#1D9E75' },
  opcaoInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  opcaoBandeira: { fontSize: 28 },
  opcaoTitulo: { fontSize: 15, fontWeight: '600', color: '#333' },
  opcaoTituloActivo: { color: '#1D9E75' },
  opcaoDesc: { fontSize: 12, color: '#888', marginTop: 2 },
  check: { fontSize: 18, color: '#1D9E75', fontWeight: 'bold' },
  opcaoPerigo: { backgroundColor: '#fff0f0', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#ffcdd2' },
  opcaoPerigoTexto: { fontSize: 15, color: '#c0392b', fontWeight: '600' },
  sobreCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e0e0da' },
  sobreNome: { fontSize: 18, fontWeight: 'bold', color: '#1D9E75', marginBottom: 4 },
  sobreVersao: { fontSize: 12, color: '#aaa', marginBottom: 8 },
  sobreDesc: { fontSize: 13, color: '#555', textAlign: 'center', lineHeight: 20 },
});