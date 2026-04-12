import { getLingua, setLingua } from '@/constants/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const [lingua, setLinguaState] = useState<'pt' | 'en'>('pt');

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
      'Limpar dados',
      'Tem a certeza que quer limpar todos os dados locais?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar', style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Feito', 'Dados limpos. Reinicie a app.');
          }
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>
        {lingua === 'pt' ? 'Definições' : 'Settings'}
      </Text>

      {/* LÍNGUA */}
      <View style={styles.seccao}>
        <Text style={styles.seccaoTitulo}>
          {lingua === 'pt' ? '🌍 Língua da app' : '🌍 App language'}
        </Text>

        <TouchableOpacity
          style={[styles.opcao, lingua === 'pt' && styles.opcaoActiva]}
          onPress={() => mudarLingua('pt')}>
          <View style={styles.opcaoInfo}>
            <Text style={styles.opcaoBandeira}>🇲🇿</Text>
            <View>
              <Text style={[styles.opcaoTitulo, lingua === 'pt' && styles.opcaoTituloActivo]}>Português</Text>
              <Text style={styles.opcaoDesc}>Língua padrão</Text>
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
              <Text style={styles.opcaoDesc}>For expats and foreigners</Text>
            </View>
          </View>
          {lingua === 'en' && <Text style={styles.check}>✓</Text>}
        </TouchableOpacity>
      </View>

      {/* CONTA */}
      <View style={styles.seccao}>
        <Text style={styles.seccaoTitulo}>
          {lingua === 'pt' ? '👤 Conta' : '👤 Account'}
        </Text>

        <TouchableOpacity style={styles.opcaoPerigo} onPress={limparDados}>
          <Text style={styles.opcaoPerigoTexto}>
            {lingua === 'pt' ? '🗑️ Limpar dados locais' : '🗑️ Clear local data'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* SOBRE */}
      <View style={styles.seccao}>
        <Text style={styles.seccaoTitulo}>
          {lingua === 'pt' ? 'ℹ️ Sobre' : 'ℹ️ About'}
        </Text>
        <View style={styles.sobreCard}>
          <Text style={styles.sobreNome}>DomésticaMoz</Text>
          <Text style={styles.sobreVersao}>Versão 1.0.0 — Fase de teste</Text>
          <Text style={styles.sobreDesc}>
            {lingua === 'pt'
              ? 'Plataforma de emprego doméstico de confiança em Moçambique.'
              : 'Trusted domestic employment platform in Mozambique.'}
          </Text>
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