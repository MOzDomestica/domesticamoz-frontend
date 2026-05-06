import { supabase } from '@/constants/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const [nomeUtilizador, setNomeUtilizador] = useState('');
  const [tipoUtilizador, setTipoUtilizador] = useState('');
  const [telefone, setTelefone] = useState('');
  const [numeroBi, setNumeroBi] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [tituloPerfil, setTituloPerfil] = useState('');
  const [eliminando, setEliminando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      carregarPerfil();
    }, [])
  );

  const carregarPerfil = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: u } = await supabase
        .from('utilizadores')
        .select('nome_completo, tipo, numero_telemovel, numero_bi, foto_bi_url')
        .eq('id', user.id)
        .single();

      if (u) {
        setNomeUtilizador(u.nome_completo || '');
        setTipoUtilizador(u.tipo || '');
        setTelefone(u.numero_telemovel || '');
        setNumeroBi(u.numero_bi || '');
        setFotoPerfil(u.foto_bi_url || null);
      }

      if (u?.tipo === 'trabalhadora') {
        const { data: pt } = await supabase
          .from('perfis_trabalhadoras')
          .select('tipo_trabalhadora')
          .eq('utilizador_id', user.id)
          .single();

        if (pt?.tipo_trabalhadora) {
          const mapa: Record<string, string> = {
            empregada_domestica: 'Empregada Doméstica',
            cozinheira_fixa: 'Cozinheira',
            baba: 'Babá',
            diarista: 'Diarista',
            cozinheira_diarista: 'Empregada + Cozinheira',
          };
          setTituloPerfil(mapa[pt.tipo_trabalhadora] || pt.tipo_trabalhadora);
        }
      }
    } catch {}
  };

  const terminarSessao = () => {
    Alert.alert('Terminar sessão', 'Tem a certeza que quer sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair', style: 'destructive', onPress: async () => {
          await supabase.auth.signOut();
          await AsyncStorage.removeItem('tipoUser');
          router.replace('/');
        }
      },
    ]);
  };

  const limparDados = () => {
    Alert.alert('Limpar dados', 'Tem a certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpar', style: 'destructive', onPress: async () => {
          await AsyncStorage.clear();
          Alert.alert('Feito', 'Dados limpos. Reinicie a app.');
        }
      },
    ]);
  };

  const eliminarConta = () => {
    Alert.alert(
      '⚠️ Eliminar conta',
      'Esta acção é irreversível. A sua conta e todos os dados serão apagados permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive', onPress: async () => {
            setEliminando(true);
            try {
              // Chama a Edge Function que apaga tudo incluindo o auth.user
              // Isto liberta o número de telemóvel para uso futuro
              const { error } = await supabase.functions.invoke('delete-user');

              if (error) {
                Alert.alert('Erro', 'Não foi possível eliminar a conta. Tente novamente.');
                setEliminando(false);
                return;
              }
            } catch {
              Alert.alert('Erro', 'Sem ligação ao servidor.');
              setEliminando(false);
              return;
            }

            await supabase.auth.signOut();
            await AsyncStorage.clear();
            router.replace('/');
          }
        },
      ]
    );
  };

  const formatarTelefone = (tel: string) => {
    if (!tel) return '—';
    const num = tel.startsWith('258') ? tel.slice(3) : tel;
    return `+258 ${num.slice(0, 2)} ${num.slice(2, 5)} ${num.slice(5)}`;
  };

  const formatarBI = (bi: string) => {
    if (!bi || bi.startsWith('TEMP_')) return '—';
    return bi;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        {fotoPerfil ? (
          <Image source={{ uri: fotoPerfil }} style={styles.fotoPerfil} />
        ) : (
          <View style={styles.avatarGrande}>
            <Text style={styles.avatarLetra}>
              {nomeUtilizador ? nomeUtilizador[0].toUpperCase() : '?'}
            </Text>
          </View>
        )}
        <Text style={styles.nomeUtilizador}>{nomeUtilizador || 'Utilizador'}</Text>
        {tituloPerfil ? (
          <View style={styles.tipoBadge}>
            <Text style={styles.tipoBadgeText}>👩 {tituloPerfil}</Text>
          </View>
        ) : (
          <View style={[styles.tipoBadge, tipoUtilizador === 'empregador' && styles.tipoBadgeEmpregador]}>
            <Text style={[styles.tipoBadgeText, tipoUtilizador === 'empregador' && styles.tipoBadgeTextEmpregador]}>
              {tipoUtilizador === 'empregador' ? '🏠 Empregador' : '👩 Trabalhadora'}
            </Text>
          </View>
        )}
      </View>

      {/* DADOS PESSOAIS */}
      <Text style={styles.seccaoTitulo}>👤 DADOS PESSOAIS</Text>
      <View style={styles.card}>
        <View style={styles.dadoRow}>
          <Text style={styles.dadoLabel}>Número de telefone</Text>
          <Text style={styles.dadoValor}>{formatarTelefone(telefone)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.dadoRow}>
          <Text style={styles.dadoLabel}>Número de BI</Text>
          <Text style={styles.dadoValor}>{formatarBI(numeroBi)}</Text>
        </View>
      </View>

      {/* CONTA */}
      <Text style={styles.seccaoTituloDiscreta}>CONTA</Text>
      <View style={styles.cardDiscreta}>

        <TouchableOpacity style={styles.accaoCompacta} onPress={limparDados}>
          <Text style={styles.accaoCompactaTexto}>Limpar dados locais</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.accaoCompacta} onPress={terminarSessao}>
          <Text style={styles.accaoCompactaTexto}>Terminar sessão</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.accaoCompacta}
          onPress={eliminarConta}
          disabled={eliminando}>
          <Text style={[styles.accaoCompactaTexto, { color: '#EF4444' }]}>
            {eliminando ? 'A eliminar...' : 'Eliminar conta'}
          </Text>
        </TouchableOpacity>

      </View>

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#F9FAFB', padding: 20, paddingTop: 64 },
  header: { alignItems: 'center', marginBottom: 28, paddingTop: 8 },
  fotoPerfil: {
    width: 90, height: 90, borderRadius: 45,
    marginBottom: 14, borderWidth: 3, borderColor: '#1F8A70',
  },
  avatarGrande: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#1F8A70', alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#1F8A70', shadowOpacity: 0.25, shadowRadius: 10, elevation: 4,
  },
  avatarLetra: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  nomeUtilizador: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  tipoBadge: {
    backgroundColor: '#ECFDF5', paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#A7F3D0',
  },
  tipoBadgeEmpregador: { backgroundColor: '#EBF4FF', borderColor: '#BFDBFE' },
  tipoBadgeText: { fontSize: 14, fontWeight: '600', color: '#065F46' },
  tipoBadgeTextEmpregador: { color: '#1E40AF' },
  seccaoTitulo: {
    fontSize: 11, fontWeight: '700', color: '#9CA3AF',
    letterSpacing: 1, marginBottom: 8, marginTop: 8,
  },
  seccaoTituloDiscreta: {
    fontSize: 10, fontWeight: '600', color: '#C4C9D4',
    letterSpacing: 1, marginBottom: 6, marginTop: 20,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: '#E5E7EB',
    marginBottom: 8, overflow: 'hidden',
  },
  cardDiscreta: {
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#F3F4F6',
    marginBottom: 8, overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: '#F3F4F6' },
  dadoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16,
  },
  dadoLabel: { fontSize: 14, color: '#6B7280' },
  dadoValor: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  accaoCompacta: { paddingVertical: 11, paddingHorizontal: 16 },
  accaoCompactaTexto: { fontSize: 13, color: '#6B7280' },
});