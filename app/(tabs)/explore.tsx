import { supabase } from '@/constants/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CODIGOS_VALIDOS = [
  'MOZDOM2026',
  'TESTE123',
  'AMIGO001',
  'AMIGO002',
  'AMIGO003',
  'AMIGO004',
  'AMIGO005',
];

export default function LoginScreen() {
  const [telefone, setTelefone] = useState('');
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const entrar = async () => {
    if (telefone.length < 9) {
      Alert.alert('Erro', 'Introduza um número válido');
      return;
    }
    if (!codigo.trim()) {
      Alert.alert('Erro', 'Introduza o seu código de convite');
      return;
    }

    const codigoUpper = codigo.trim().toUpperCase();
    if (!CODIGOS_VALIDOS.includes(codigoUpper)) {
      Alert.alert('❌ Código inválido', 'Este código de convite não é válido. Peça um código a um amigo.');
      return;
    }

    setLoading(true);
    try {
      const numeroCompleto = '+258' + telefone;

      // Tentar fazer login — se o utilizador já existe
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        phone: numeroCompleto,
        password: codigoUpper,
      });

      if (signInData?.user) {
        // Login bem sucedido
        await AsyncStorage.setItem('codigo_convite_valido', 'true');
        await AsyncStorage.setItem('codigo_convite_usado', codigoUpper);
        router.replace('/');
        return;
      }

      // Se não existe, criar conta nova
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        phone: numeroCompleto,
        password: codigoUpper,
      });

      if (signUpError) {
        Alert.alert('Erro', signUpError.message);
        return;
      }

      if (signUpData?.user) {
        await AsyncStorage.setItem('codigo_convite_valido', 'true');
        await AsyncStorage.setItem('codigo_convite_usado', codigoUpper);
        router.replace('/');
      }
    } catch (e) {
      Alert.alert('Erro', 'Sem ligação ao servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Entrar</Text>
      <Text style={styles.subtitle}>Introduza o seu número e código de convite</Text>

      <View style={styles.phoneRow}>
        <View style={styles.prefixBox}>
          <Text style={styles.prefixText}>🇲🇿 +258</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="84 XXX XXXX"
          keyboardType="phone-pad"
          maxLength={9}
          value={telefone}
          onChangeText={setTelefone}
        />
      </View>

      <TextInput
        style={styles.inputCodigo}
        placeholder="Código de convite (ex: MOZDOM2026)"
        value={codigo}
        onChangeText={setCodigo}
        autoCapitalize="characters"
        autoCorrect={false}
      />

      <View style={styles.notaBox}>
        <Text style={styles.notaTexto}>
          🔐 Durante a fase de testes, use o código de convite que recebeu em vez de SMS.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={entrar}
        disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'A entrar...' : 'Entrar'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 60, left: 24 },
  backText: { color: '#1D9E75', fontSize: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1D9E75', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#888780', marginBottom: 32 },
  phoneRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  prefixBox: { backgroundColor: '#f0f0ea', borderRadius: 12, padding: 16, justifyContent: 'center' },
  prefixText: { fontSize: 15, color: '#333', fontWeight: '600' },
  input: { flex: 1, borderWidth: 1, borderColor: '#D3D1C7', borderRadius: 12, padding: 16, fontSize: 16 },
  inputCodigo: { borderWidth: 1, borderColor: '#D3D1C7', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16, textAlign: 'center', letterSpacing: 2 },
  notaBox: { backgroundColor: '#e8f5f0', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#b2dfcf' },
  notaTexto: { fontSize: 13, color: '#1D9E75', lineHeight: 20, textAlign: 'center' },
  btn: { backgroundColor: '#1D9E75', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#aaa' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});