import { supabase } from '@/constants/supabase';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const enviarCodigo = async () => {
    if (telefone.length < 9) {
      Alert.alert('Erro', 'Introduza um número válido');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: '+258' + telefone,
      });
      if (error) {
        Alert.alert('Erro', error.message);
      } else {
        router.push({ pathname: '/(tabs)/verify', params: { phone: '+258' + telefone } });
      }
    } catch (e) {
      Alert.alert('Erro', 'Sem ligação ao servidor');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Entrar</Text>
      <Text style={styles.subtitle}>Introduza o seu número de telemóvel</Text>
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
      <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={enviarCodigo} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'A enviar...' : 'Receber código SMS'}</Text>
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
  btn: { backgroundColor: '#1D9E75', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#aaa' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});