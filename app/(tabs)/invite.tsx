import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Códigos de convite válidos — mude estes códigos conforme quiser
const CODIGOS_VALIDOS = [
  'MOZDOM2026',
  'TESTE123',
  'AMIGO001',
  'AMIGO002',
  'AMIGO003',
  'AMIGO004',
  'AMIGO005',
];

export default function InviteScreen() {
  const router = useRouter();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);

  const verificarCodigo = async () => {
    if (!codigo.trim()) {
      Alert.alert('Erro', 'Introduza um código de convite');
      return;
    }

    setLoading(true);
    const codigoUpper = codigo.trim().toUpperCase();

    if (CODIGOS_VALIDOS.includes(codigoUpper)) {
      await AsyncStorage.setItem('codigo_convite_valido', 'true');
      await AsyncStorage.setItem('codigo_convite_usado', codigoUpper);
      Alert.alert('✅ Código válido!', 'Bem-vindo à DomésticaMoz! Pode criar a sua conta.', [
        { text: 'Continuar', onPress: () => router.replace('/') }
      ]);
    } else {
      Alert.alert('❌ Código inválido', 'Este código de convite não existe ou já foi usado. Peça um código a um amigo ou aguarde o lançamento oficial.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>DomésticaMoz</Text>
      <Text style={styles.icon}>🔐</Text>
      <Text style={styles.titulo}>Acesso por convite</Text>
      <Text style={styles.desc}>
        A DomésticaMoz está em fase de teste. Para aceder precisa de um código de convite.
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ex: MOZDOM2026"
          value={codigo}
          onChangeText={setCodigo}
          autoCapitalize="characters"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={verificarCodigo}
        disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'A verificar...' : 'Entrar com código'}</Text>
      </TouchableOpacity>

      <View style={styles.notaBox}>
        <Text style={styles.notaTexto}>
          💡 Não tem código? Partilhe a app com amigos e peça-lhes que lhe enviem o seu código de convite.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { fontSize: 28, fontWeight: 'bold', color: '#1D9E75', marginBottom: 24 },
  icon: { fontSize: 48, marginBottom: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 12, textAlign: 'center' },
  desc: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  inputContainer: { width: '100%', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#D3D1C7', borderRadius: 12, padding: 16, fontSize: 20, textAlign: 'center', letterSpacing: 4, backgroundColor: '#f9f9f7' },
  btn: { backgroundColor: '#1D9E75', padding: 16, borderRadius: 12, alignItems: 'center', width: '100%', marginBottom: 24 },
  btnDisabled: { backgroundColor: '#aaa' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  notaBox: { backgroundColor: '#e8f5f0', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#b2dfcf' },
  notaTexto: { fontSize: 13, color: '#1D9E75', lineHeight: 20, textAlign: 'center' },
});