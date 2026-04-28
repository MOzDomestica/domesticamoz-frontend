import { getLingua, t } from '@/constants/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SubscriptionScreen() {
  const router = useRouter();
  const [tipoUser, setTipoUser] = useState('');
  const [, setLinguaActual] = useState('pt');

  useEffect(() => {
    AsyncStorage.getItem('tipoUser').then(val => setTipoUser(val || 'trabalhadora'));
  }, []);

  useFocusEffect(
    useCallback(() => {
      getLingua().then(l => setLinguaActual(l));
    }, [])
  );

  const isEmpregador = tipoUser === 'empregador';
  const precoMensal = isEmpregador ? '299' : '50';
  const precoAnual = isEmpregador ? '2.499' : '399';
  const precoAnualMensal = isEmpregador ? '208' : '33';
  const poupanca = isEmpregador ? '30%' : '33%';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.icon}>⏰</Text>
      <Text style={styles.titulo}>{t('subscricao_necessaria')}</Text>
      <Text style={styles.desc}>
        {isEmpregador ? t('subscricao_desc_empregador') : t('subscricao_desc_trabalhadora')}
      </Text>

      <View style={styles.tipoBadge}>
        <Text style={styles.tipoBadgeText}>
          {isEmpregador ? '👔 ' + t('plano_empregador') : '👩 ' + t('plano_trabalhadora')}
        </Text>
      </View>

      <View style={styles.planoCard}>
        <Text style={styles.planoTitulo}>{t('plano_mensal')}</Text>
        <Text style={styles.planoPreco}>
          {precoMensal} MZN
          <Text style={styles.planoPeriodo}>/{t('mes')}</Text>
        </Text>
        <View style={styles.planoBeneficios}>
          {(isEmpregador ? [
            '✅ ' + t('matches_ilimitados'),
            '✅ ' + t('chat_trabalhadoras'),
            '✅ ' + t('sistema_contratos'),
            '✅ ' + t('avaliacoes_verificadas'),
            '✅ ' + t('suporte_prioritario'),
          ] : [
            '✅ ' + t('perfil_visivel_empregadores'),
            '✅ ' + t('receber_propostas'),
            '✅ ' + t('chat_empregadores'),
            '✅ ' + t('sistema_contratos'),
            '✅ ' + t('avaliacoes_verificadas'),
          ]).map(b => (
            <Text key={b} style={styles.beneficio}>{b}</Text>
          ))}
        </View>
        <TouchableOpacity style={styles.btnSubscrever}>
          <Text style={styles.btnSubscreverText}>{t('subscrever_por')} {precoMensal} MZN/{t('mes')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.planoCardAnual}>
        <View style={styles.badgeDesconto}>
          <Text style={styles.badgeDescontoText}>{t('poupa')} {poupanca}</Text>
        </View>
        <Text style={[styles.planoTitulo, { color: '#fff' }]}>{t('plano_anual')}</Text>
        <Text style={[styles.planoPreco, { color: '#fff' }]}>
          {precoAnual} MZN
          <Text style={[styles.planoPeriodo, { color: '#e0f0ea' }]}>/{t('ano')}</Text>
        </Text>
        <Text style={styles.planoEquivalente}>{t('equivale_a')} {precoAnualMensal} MZN/{t('mes')}</Text>
        <TouchableOpacity style={styles.btnSubscreverAnual}>
          <Text style={[styles.btnSubscreverText, { color: '#1D9E75' }]}>
            {t('subscrever_por')} {precoAnual} MZN/{t('ano')}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push('/')} style={styles.linkSair}>
        <Text style={styles.linkSairText}>{t('voltar_inicio')}</Text>
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