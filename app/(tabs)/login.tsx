import { supabase } from '@/constants/supabase';
import { Palette, Radius, Shadows, Spacing } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [telefone, setTelefone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarPass, setMostrarPass] = useState(false);

  const entrar = async () => {
    if (telefone.length < 9) {
      Alert.alert('Erro', 'Introduza um número válido com 9 dígitos');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'A palavra-passe deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const numero = `258${telefone.replace(/\D/g, '')}`;
      const email = `${numero}@domesticamoz.app`;

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data?.user) {
        Alert.alert('❌ Erro', 'Número ou palavra-passe incorrectos. Verifique os seus dados.');
        return;
      }

      const { data: utilizador } = await supabase
        .from('utilizadores')
        .select('tipo')
        .eq('id', data.user.id)
        .single();

      await AsyncStorage.setItem('tipoUser', utilizador?.tipo ?? 'trabalhadora');
      await AsyncStorage.setItem('codigo_convite_valido', 'true');
      router.replace('/(tabs)/settings');

    } catch {
      Alert.alert('Erro', 'Sem ligação ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>

        <View style={styles.headerSection}>
          <View style={styles.iconeBadge}>
            <Text style={styles.icone}>👋</Text>
          </View>
          <Text style={styles.titulo}>Bem-vindo de volta</Text>
          <Text style={styles.subtitulo}>Entre com o seu número e palavra-passe</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Número de telemóvel</Text>
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

          <Text style={styles.label}>Palavra-passe</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!mostrarPass}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.olhoBtn}
              onPress={() => setMostrarPass(!mostrarPass)}>
              <Text style={styles.olhoText}>{mostrarPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 16 }} />

          <View style={styles.notaBox}>
            <Text style={styles.notaTexto}>
              🔐 A sua palavra-passe é o código de convite seguido do número completo. Ex: MOZDOM2026258841234567
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.btnEntrar, loading && styles.btnDisabled]}
            onPress={entrar}
            disabled={loading}>
            <Text style={styles.btnEntrarTexto}>
              {loading ? 'A entrar...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/register')}
            style={styles.linkCriar}>
            <Text style={styles.linkCriarTexto}>Não tem conta? </Text>
            <Text style={styles.linkCriarDestaque}>Criar conta</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Palette.fundo,
    padding: Spacing.lg,
    paddingTop: 60,
  },
  backBtn: { marginBottom: Spacing.xl },
  backText: { color: Palette.verde, fontSize: 16, fontWeight: '600' },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconeBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Palette.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  icone: { fontSize: 36 },
  titulo: {
    fontSize: 26,
    fontWeight: '700',
    color: Palette.textoPrincipal,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitulo: {
    fontSize: 15,
    color: Palette.textoSecundario,
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: Palette.branco,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.textoPrincipal,
    marginBottom: 8,
    marginTop: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Palette.borda,
    borderRadius: Radius.md,
    backgroundColor: Palette.branco,
    paddingRight: 8,
    marginBottom: 4,
  },
  prefixBox: {
    backgroundColor: Palette.cinzaClaro,
    borderRadius: Radius.md,
    padding: 14,
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Palette.borda,
  },
  prefixText: { fontSize: 14, color: Palette.textoPrincipal, fontWeight: '600' },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Palette.borda,
    borderRadius: Radius.md,
    padding: 14,
    fontSize: 16,
    color: Palette.textoPrincipal,
    backgroundColor: Palette.branco,
    marginBottom: Spacing.md,
  },
  olhoBtn: { padding: 10 },
  olhoText: { fontSize: 18 },
  notaBox: {
    backgroundColor: Palette.verdeClaro,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.verdeMedio,
  },
  notaTexto: {
    fontSize: 12,
    color: Palette.verde,
    lineHeight: 18,
  },
  btnEntrar: {
    backgroundColor: Palette.verde,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  btnDisabled: { backgroundColor: Palette.cinzaMedio },
  btnEntrarTexto: {
    color: Palette.branco,
    fontSize: 16,
    fontWeight: '700',
  },
  linkCriar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkCriarTexto: { color: Palette.textoSecundario, fontSize: 14 },
  linkCriarDestaque: { color: Palette.verde, fontSize: 14, fontWeight: '700' },
});