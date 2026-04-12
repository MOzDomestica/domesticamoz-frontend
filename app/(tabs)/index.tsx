import { formatarDiasRestantes, verificarSubscricao } from '@/constants/subscription';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null);
  const [subscricaoExpirada, setSubscricaoExpirada] = useState(false);

  useEffect(() => {
    const checar = async () => {
      const codigoValido = await AsyncStorage.getItem('codigo_convite_valido');
      if (!codigoValido) {
        router.replace('/(tabs)/invite');
        return;
      }
      const { diasRestantes, expirada } = await verificarSubscricao();
      setDiasRestantes(diasRestantes);
      setSubscricaoExpirada(expirada);
      if (expirada) {
        router.replace('/(tabs)/subscription');
      }
    };
    checar();
  }, []);

  const entrar = async (tipo: 'trabalhadora' | 'empregador') => {
    await AsyncStorage.removeItem('tipoUser');
    await AsyncStorage.setItem('tipoUser', tipo);
    router.push({ pathname: '/(tabs)/register', params: { tipo } });
  };

  return (
    <View style={styles.container}>

      {/* TOPO COM COR */}
      <View style={styles.topo}>
        <Text style={styles.ilustracao}>🏠</Text>
        <Text style={styles.logo}>DomésticaMoz</Text>
        <Text style={styles.tagline}>Emprego doméstico de confiança</Text>
      </View>

      {/* AVISO TRIAL */}
      {diasRestantes !== null && diasRestantes <= 7 && !subscricaoExpirada && (
        <View style={styles.avisoTrial}>
          <Text style={styles.avisoTrialText}>
            ⚠️ {formatarDiasRestantes(diasRestantes)} do período de teste
          </Text>
        </View>
      )}

      {/* BOTÕES */}
      <View style={styles.botoesContainer}>
        <Text style={styles.botoesTitle}>Como quer usar a app?</Text>

        <TouchableOpacity style={styles.btnTrabalhadora} onPress={() => entrar('trabalhadora')}>
          <Text style={styles.btnIcon}>👩</Text>
          <View style={styles.btnInfo}>
            <Text style={styles.btnTitulo}>Sou Trabalhadora</Text>
            <Text style={styles.btnDesc}>Encontre emprego doméstico de confiança</Text>
          </View>
          <Text style={styles.btnSeta}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnEmpregador} onPress={() => entrar('empregador')}>
          <Text style={styles.btnIcon}>🏠</Text>
          <View style={styles.btnInfo}>
            <Text style={[styles.btnTitulo, { color: '#185FA5' }]}>Sou Empregador</Text>
            <Text style={styles.btnDesc}>Encontre a trabalhadora ideal para si</Text>
          </View>
          <Text style={[styles.btnSeta, { color: '#185FA5' }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(tabs)/explore')} style={styles.linkEntrar}>
          <Text style={styles.linkEntrarText}>Já tenho conta? </Text>
<Text style={styles.linkEntrarDestaque}>Entrar</Text>
        </TouchableOpacity>
      </View>

      {/* RODAPÉ */}
      <Text style={styles.rodape}>🔒 Plataforma segura e verificada</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f0' },

  topo: { backgroundColor: '#1D9E75', paddingTop: 80, paddingBottom: 40, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  ilustracao: { fontSize: 64, marginBottom: 12 },
  logo: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  tagline: { fontSize: 15, color: '#e0f0ea', textAlign: 'center' },

  avisoTrial: { backgroundColor: '#fef3c7', margin: 20, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#fde68a' },
  avisoTrialText: { color: '#b45309', fontSize: 13, fontWeight: '600', textAlign: 'center' },

  botoesContainer: { padding: 24, flex: 1, justifyContent: 'center' },
  botoesTitle: { fontSize: 16, fontWeight: '600', color: '#888', marginBottom: 16, textAlign: 'center' },

  btnTrabalhadora: { backgroundColor: '#fff', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#b2dfcf', elevation: 2 },
  btnEmpregador: { backgroundColor: '#EBF4FF', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#bfdbf7', elevation: 2 },
  btnIcon: { fontSize: 32, marginRight: 14 },
  btnInfo: { flex: 1 },
  btnTitulo: { fontSize: 16, fontWeight: 'bold', color: '#1D9E75', marginBottom: 4 },
  btnDesc: { fontSize: 13, color: '#888' },
  btnSeta: { fontSize: 28, color: '#1D9E75', fontWeight: 'bold' },

  linkEntrar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  linkEntrarText: { color: '#888', fontSize: 14 },
  linkEntrarDestaque: { color: '#1D9E75', fontSize: 14, fontWeight: '700' },

  rodape: { textAlign: 'center', color: '#aaa', fontSize: 12, paddingBottom: 16 },
});