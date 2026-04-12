import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const matchesTrabalhadoras = [
  { id: '1', nome: 'Maria João', tipo: 'Empregada Doméstica', zona: 'Sommerschield', avaliacao: '4.8', salario: '4000-6000' },
  { id: '2', nome: 'Ana Machava', tipo: 'Babá', zona: 'Polana', avaliacao: '4.5', salario: '3500-5000' },
  { id: '3', nome: 'Fátima Sitoe', tipo: 'Diarista', zona: 'Matola', avaliacao: '4.9', salario: '500-800/dia' },
];

const propostasRecebidas = [
  { id: '1', empregador: 'Carlos Machava', zona: 'Sommerschield', servicos: ['Limpeza geral', 'Cozinha'], salario: '4500', regime: 'Não residente', horario: '07:00-17:00' },
  { id: '2', empregador: 'Ana Ferrão', zona: 'Polana', servicos: ['Lavar roupa', 'Passar roupa'], salario: '3800', regime: 'Não residente', horario: '08:00-16:00' },
];

export default function MatchScreen() {
  const router = useRouter();
  const [tipoUser, setTipoUser] = useState<'trabalhadora' | 'empregador' | null>(null);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('tipoUser').then(val => {
        setTipoUser((val as any) || 'empregador');
      });
    }, [])
  );

  if (!tipoUser) return null;

  // VISTA DO EMPREGADOR
  if (tipoUser === 'empregador') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Os meus matches</Text>
        <Text style={styles.subtitle}>Trabalhadoras compatíveis com o seu anúncio</Text>

        {matchesTrabalhadoras.map(m => (
          <View key={m.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{m.nome[0]}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardNome}>{m.nome}</Text>
                <Text style={styles.cardTipo}>{m.tipo}</Text>
                <Text style={styles.cardZona}>📍 {m.zona}</Text>
              </View>
              <View style={styles.avaliacaoBox}>
                <Text style={styles.avaliacao}>⭐ {m.avaliacao}</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.salario}>💰 {m.salario} MZN</Text>
              <TouchableOpacity style={styles.btnVer} onPress={() => router.push('/(tabs)/worker')}>
                <Text style={styles.btnVerText}>Ver perfil</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  }

  // VISTA DA TRABALHADORA
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Propostas recebidas</Text>
      <Text style={styles.subtitle}>Empregadores interessados no seu perfil</Text>

      {propostasRecebidas.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitulo}>Ainda sem propostas</Text>
          <Text style={styles.emptyDesc}>Complete o seu perfil para aparecer nos resultados dos empregadores.</Text>
          <TouchableOpacity style={styles.btnPerfil} onPress={() => router.push('/(tabs)/profile')}>
            <Text style={styles.btnPerfilText}>Completar perfil</Text>
          </TouchableOpacity>
        </View>
      )}

      {propostasRecebidas.map(p => (
        <View key={p.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.avatarEmpregador}>
              <Text style={styles.avatarEmoji}>🏠</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNome}>{p.empregador}</Text>
              <Text style={styles.cardZona}>📍 {p.zona}</Text>
              <Text style={styles.cardTipo}>{p.regime} · {p.horario}</Text>
            </View>
          </View>

          <View style={styles.servicosRow}>
            {p.servicos.map(s => (
              <View key={s} style={styles.servicoChip}>
                <Text style={styles.servicoChipText}>{s}</Text>
              </View>
            ))}
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.salario}>💰 {p.salario} MZN/mês</Text>
            <TouchableOpacity style={styles.btnVer} onPress={() => router.push('/(tabs)/messages')}>
              <Text style={styles.btnVerText}>💬 Responder</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f5f5f5', padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1D9E75', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#888780', marginBottom: 24 },

  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#1D9E75', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarEmpregador: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#e8f5f0', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#b2dfcf' },
  avatarEmoji: { fontSize: 26 },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardTipo: { fontSize: 13, color: '#1D9E75', marginTop: 2 },
  cardZona: { fontSize: 12, color: '#888780', marginTop: 2 },
  avaliacaoBox: { alignItems: 'center' },
  avaliacao: { fontSize: 14, fontWeight: 'bold', color: '#333' },

  servicosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  servicoChip: { backgroundColor: '#f0f0ea', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  servicoChipText: { fontSize: 12, color: '#555' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 },
  salario: { fontSize: 13, color: '#555' },
  btnVer: { backgroundColor: '#1D9E75', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  btnVerText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  emptyBox: { backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center', marginTop: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitulo: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  btnPerfil: { backgroundColor: '#1D9E75', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  btnPerfilText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});