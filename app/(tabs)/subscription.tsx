import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SubscriptionScreen() {
  const router = useRouter();
  const [tipoUser, setTipoUser] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('tipoUser').then(val => setTipoUser(val || 'trabalhadora'));
  }, []);

  const isEmpregador = tipoUser === 'empregador';
  const precoMensal = isEmpregador ? '299' : '50';
  const precoAnual = isEmpregador ? '2.499' : '399';
  const precoAnualMensal = isEmpregador ? '208' : '33';
  const poupanca = isEmpregador ? '30%' : '33%';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.icon}>⏰</Text>
      <Text style={styles.titulo}>Subscrição necessária</Text>
      <Text style={styles.desc}>
        {isEmpregador
          ? 'Para continuar a encontrar trabalhadoras de confiança, subscreva um plano DomésticaMoz.'
          : 'Para continuar a receber propostas de emprego, subscreva um plano DomésticaMoz.'}
      </Text>

      <View style={styles.tipoBadge}>
        <Text style={styles.tipoBadgeText}>
          {isEmpregador ? '👔 Plano Empregador' : '👩 Plano Trabalhadora'}
        </Text>
      </View>

      {/* PLANO MENSAL */}
      <View style={styles.planoCard}>
        <Text style={styles.planoTitulo}>Plano Mensal</Text>
        <Text style={styles.planoPreco}>
          {precoMensal} MZN
          <Text style={styles.planoPeriodo}>/mês</Text>
        </Text>
        <View style={styles.planoBeneficios}>
          {(isEmpregador ? [
            '✅ Matches ilimitados',
            '✅ Chat com trabalhadoras',
            '✅ Sistema de contratos',
            '✅ Avaliações verificadas',
            '✅ Suporte prioritário',
          ] : [
            '✅ Perfil visível para empregadores',
            '✅ Receber propostas de emprego',
            '✅ Chat com empregadores',
            '✅ Sistema de contratos',
            '✅ Avaliações verificadas',
          ]).map(b => (
            <Text key={b} style={styles.beneficio}>{b}</Text>
          ))}
        </View>
        <TouchableOpacity style={styles.btnSubscrever}>
          <Text style={styles.btnSubscreverText}>Subscrever por {precoMensal} MZN/mês</Text>
        </TouchableOpacity>
      </View>

      {/* PLANO ANUAL */}
      <View style={styles.planoCardAnual}>
        <View style={styles.badgeDesconto}>
          <Text style={styles.badgeDescontoText}>Poupa {poupanca}</Text>
        </View>
        <Text style={[styles.planoTitulo, { color: '#fff' }]}>Plano Anual</Text>
        <Text style={[styles.planoPreco, { color: '#fff' }]}>
          {precoAnual} MZN
          <Text style={[styles.planoPeriodo, { color: '#e0f0ea' }]}>/ano</Text>
        </Text>
        <Text style={styles.planoEquivalente}>Equivale a {precoAnualMensal} MZN/mês</Text>
        <TouchableOpacity style={styles.btnSubscreverAnual}>
          <Text style={[styles.btnSubscreverText, { color: '#1D9E75' }]}>
            Subscrever por {precoAnual} MZN/ano
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push('/')} style={styles.linkSair}>
        <Text style={styles.linkSairText}>Voltar ao início</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f5f5f0', padding: 24, paddingTop: 80, alignItems: 'center' },
  icon: { fontSize: 64, marginBottom: 16 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 12, textAlign: 'center' },
  desc: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  tipoBadge: { backgroundColor: '#e8f5f0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 24, borderWidth: 1, borderColor: '#b2dfcf' },
  tipoBadgeText: { color: '#1D9E75', fontSize: 14, fontWeight: '700' },
  planoCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', marginBottom: 16, borderWidth: 1, borderColor: '#e0e0da' },
  planoCardAnual: { backgroundColor: '#1D9E75', borderRadius: 20, padding: 24, width: '100%', marginBottom: 24, position: 'relative' },
  badgeDesconto: { position: 'absolute', top: -12, right: 20, backgroundColor: '#f59e0b', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeDescontoText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  planoTitulo: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  planoPreco: { fontSize: 36, fontWeight: 'bold', color: '#1D9E75', marginBottom: 16 },
  planoPeriodo: { fontSize: 16, color: '#888', fontWeight: 'normal' },
  planoEquivalente: { fontSize: 13, color: '#fff', marginBottom: 16, opacity: 0.8 },
  planoBeneficios: { marginBottom: 20, gap: 8 },
  beneficio: { fontSize: 14, color: '#555' },
  btnSubscrever: { backgroundColor: '#1D9E75', padding: 14, borderRadius: 12, alignItems: 'center' },
  btnSubscreverAnual: { backgroundColor: '#fff', padding: 14, borderRadius: 12, alignItems: 'center' },
  btnSubscreverText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  linkSair: { marginTop: 8 },
  linkSairText: { color: '#888', fontSize: 14 },
});