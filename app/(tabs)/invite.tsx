import { getLingua, t } from '@/constants/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
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

export default function InviteScreen() {
  const router = useRouter();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setLinguaActual] = useState('pt');

  useFocusEffect(
    useCallback(() => {
      getLingua().then(l => setLinguaActual(l));
    }, [])
  );

  const verificarCodigo = async () => {
    if (!codigo.trim()) {
      Alert.alert(t('erro'), t('introduza_codigo'));
      return;
    }

    setLoading(true);
    const codigoUpper = codigo.trim().toUpperCase();

    if (CODIGOS_VALIDOS.includes(codigoUpper)) {
      await AsyncStorage.setItem('codigo_convite_valido', 'true');
      await AsyncStorage.setItem('codigo_convite_usado', codigoUpper);
      Alert.alert('✅ ' + t('codigo_valido'), t('bem_vindo'), [
        { text: t('seguinte'), onPress: () => router.replace('/') }
      ]);
    } else {
      Alert.alert('❌ ' + t('codigo_invalido'), t('codigo_invalido_desc'));
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>{t('app_nome')}</Text>
      <Text style={styles.icon}>🔐</Text>
      <Text style={styles.titulo}>{t('acesso_convite')}</Text>
      <Text style={styles.desc}>{t('acesso_convite_desc')}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={t('codigo_placeholder')}
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
        <Text style={styles.btnText}>{loading ? t('carregando') : t('entrar_codigo')}</Text>
      </TouchableOpacity>

      <View style={styles.notaBox}>
        <Text style={styles.notaTexto}>💡 {t('nao_tem_codigo')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { fontSize: 28, fontWeight: 'bold', color: '#1F8A70', marginBottom: 24 },
  icon: { fontSize: 48, marginBottom: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 12, textAlign: 'center' },
  desc: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  inputContainer: { width: '100%', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#D3D1C7', borderRadius: 12, padding: 16, fontSize: 20, textAlign: 'center', letterSpacing: 4, backgroundColor: '#f9f9f7' },
  btn: { backgroundColor: '#1F8A70', padding: 16, borderRadius: 12, alignItems: 'center', width: '100%', marginBottom: 24 },
  btnDisabled: { backgroundColor: '#aaa' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  notaBox: { backgroundColor: '#e8f5f0', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#b2dfcf' },
  notaTexto: { fontSize: 13, color: '#1F8A70', lineHeight: 20, textAlign: 'center' },
});