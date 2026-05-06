import { getLingua, t } from '@/constants/i18n';
import { supabase } from '@/constants/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function VerifyScreen() {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setLinguaActual] = useState('pt');
  const router = useRouter();
  const { phone } = useLocalSearchParams();

  useFocusEffect(
    useCallback(() => {
      getLingua().then(l => setLinguaActual(l));
    }, [])
  );

  const verificarCodigo = async () => {
    if (codigo.length < 6) {
      Alert.alert(t('erro'), t('introduza_codigo_6'));
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
        Alert.alert(t('erro'), error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
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
      Alert.alert(t('erro'), t('sem_ligacao'));
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
        <Text style={styles.backText}>← {t('voltar')}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{t('verificar_codigo')}</Text>
      <Text style={styles.subtitle}>{t('introduza_codigo_enviado')} {phone}</Text>

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
        <Text style={styles.btnText}>{loading ? t('carregando') : t('confirmar')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={saltarModeTeste}>
        <Text style={styles.btnSkip}>{t('saltar_modo_teste')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 60, left: 24 },
  backText: { color: '#1F8A70', fontSize: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F8A70', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#888780', marginBottom: 32 },
  input: { borderWidth: 1, borderColor: '#D3D1C7', borderRadius: 12, padding: 16, fontSize: 24, marginBottom: 16, textAlign: 'center', letterSpacing: 8 },
  btn: { backgroundColor: '#1F8A70', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  btnDisabled: { backgroundColor: '#aaa' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  btnSkip: { color: '#888780', textAlign: 'center', marginTop: 8, fontSize: 14 },
});