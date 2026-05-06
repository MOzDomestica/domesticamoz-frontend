import { getLingua, setLingua } from '@/constants/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const textos = {
  pt: {
    tagline: 'Emprego doméstico de confiança',
    criarConta: 'Criar conta',
    entrar: 'Entrar',
    segura: '🔒 Plataforma segura e verificada',
    faseTeste: 'Fase de teste',
  },
  en: {
    tagline: 'Trusted domestic employment',
    criarConta: 'Create account',
    entrar: 'Sign in',
    segura: '🔒 Safe and verified platform',
    faseTeste: 'Trial phase',
  },
};

export default function HomeScreen() {
  const router = useRouter();
  const [lingua, setLinguaState] = useState<'pt' | 'en'>('pt');

  useEffect(() => {
    getLingua().then(l => setLinguaState(l));
    AsyncStorage.getItem('codigo_convite_valido').then(v => {
      if (!v) router.replace('/(tabs)/invite');
    });
  }, []);

  const trocarLingua = async () => {
    const nova = lingua === 'pt' ? 'en' : 'pt';
    await setLingua(nova);
    setLinguaState(nova);
  };

  const tx = textos[lingua];

  return (
    <View style={styles.container}>

      {/* BOTÃO DE LÍNGUA */}
      <TouchableOpacity style={styles.linguaBtn} onPress={trocarLingua}>
        <Text style={styles.linguaText}>
          {lingua === 'pt' ? '🇲🇿 PT' : '🇬🇧 EN'}
        </Text>
      </TouchableOpacity>

      {/* LOGO */}
      <View style={styles.topo}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetra}>D</Text>
        </View>
        <Text style={styles.logo}>DomésticaMoz</Text>
        <Text style={styles.tagline}>{tx.tagline}</Text>
      </View>

      {/* BOTÕES */}
      <View style={styles.botoes}>
        <TouchableOpacity
          style={styles.btnPrimario}
          onPress={() => router.push('/(tabs)/register')}>
          <Text style={styles.btnPrimarioText}>{tx.criarConta}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecundario}
          onPress={() => router.push('/(tabs)/login')}>
          <Text style={styles.btnSecundarioText}>{tx.entrar}</Text>
        </TouchableOpacity>
      </View>

      {/* RODAPÉ COM SOBRE */}
      <View style={styles.rodapeContainer}>
        <Text style={styles.rodape}>{tx.segura}</Text>
        <View style={styles.sobreRow}>
          <Text style={styles.sobreTexto}>DomésticaMoz v1.0.0</Text>
          <Text style={styles.sobrePonto}>·</Text>
          <Text style={styles.sobreTexto}>{tx.faseTeste}</Text>
          <Text style={styles.sobrePonto}>·</Text>
          <Text style={styles.sobreTexto}>Moçambique</Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#F9FAFB',
    justifyContent: 'space-between',
    padding: 24, paddingTop: 120, paddingBottom: 40,
  },
  linguaBtn: {
    position: 'absolute', top: 56, right: 24,
    backgroundColor: '#fff', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  linguaText: { fontSize: 13, fontWeight: '700', color: '#1F2937' },
  topo: { alignItems: 'center' },
  logoCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#1F8A70', alignItems: 'center', justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#1F8A70', shadowOpacity: 0.3, shadowRadius: 14, elevation: 6,
  },
  logoLetra: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  logo: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  tagline: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
  botoes: { gap: 14 },
  btnPrimario: {
    backgroundColor: '#1F8A70', padding: 17, borderRadius: 16, alignItems: 'center',
    shadowColor: '#1F8A70', shadowOpacity: 0.25, shadowRadius: 10, elevation: 4,
  },
  btnPrimarioText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  btnSecundario: {
    backgroundColor: '#fff', padding: 17, borderRadius: 16,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#1F8A70',
  },
  btnSecundarioText: { color: '#1F8A70', fontSize: 17, fontWeight: '700' },
  rodapeContainer: { alignItems: 'center', gap: 6 },
  rodape: { color: '#9CA3AF', fontSize: 13 },
  sobreRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sobreTexto: { fontSize: 12, color: '#C4C9D4' },
  sobrePonto: { fontSize: 12, color: '#C4C9D4' },
});