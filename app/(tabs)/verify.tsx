import { supabase } from '@/constants/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function VerifyScreen() {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { phone } = useLocalSearchParams();

  const verificarCodigo = async () => {
    if (codigo.length < 6) {
      Alert.alert('Erro', 'Introduza o código de 6 dígitos');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone as string,
        token: codigo,
        type: 'sms',
      });

      if (error) {
        Alert.alert('Erro', error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        // Guardar sessão explicitamente
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      if (data.user) {
        const tipoUser = await AsyncStorage.getItem('tipoUser') || 'trabalhadora';
        await AsyncStorage.setItem('tipoUser', tipoUser);

        if (tipoUser === 'empregador') {
          router.push('/(tabs)/employer');
        } else {
          router.push('/(tabs)/profile');
        }
      }
    } catch (e) {
      Alert.alert('Erro', 'Sem ligação ao servidor');
    }
    setLoading(false);
  };

  const saltarModeTeste = async () => {
    const tipoUser = await AsyncStorage.getItem('tipoUser') || 'trabalhadora';
    if (tipoUser === 'empregador') {
      router.push('/(tabs)/employer');
    } else {
      router.push('/(tabs)/profile');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Verificar código</Text>
      <Text style={styles.subtitle}>Introduza o código de 6 dígitos enviado para {phone}</Text>

      <TextInput
        style={styles.input}
        placeholder="000000"
        keyboardType="number-pad"
        maxLength={6}
        value={codigo}
        onChangeText={setCodigo}
      />

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={verificarCodigo}
        disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'A verificar...' : 'Confirmar'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={saltarModeTeste}>
        <Text style={styles.btnSkip}>Saltar (modo teste)</Text>
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
  input: { borderWidth: 1, borderColor: '#D3D1C7', borderRadius: 12, padding: 16, fontSize: 24, marginBottom: 16, textAlign: 'center', letterSpacing: 8 },
  btn: { backgroundColor: '#1D9E75', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  btnDisabled: { backgroundColor: '#aaa' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  btnSkip: { color: '#888780', textAlign: 'center', marginTop: 8, fontSize: 14 },
});