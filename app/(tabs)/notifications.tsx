import { getLingua, t } from '@/constants/i18n';
import {
    Notificacao,
    formatarData,
    getIconeNotificacao,
    getNotificacoes,
    limparNotificacoes,
    marcarTodasLidas,
} from '@/constants/notifications';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotificationsScreen() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [, setLinguaActual] = useState('pt');

  useFocusEffect(
    useCallback(() => {
      carregarNotificacoes();
      getLingua().then(l => setLinguaActual(l));
    }, [])
  );

  const carregarNotificacoes = async () => {
    const lista = await getNotificacoes();
    setNotificacoes(lista);
    await marcarTodasLidas();
  };

  const limpar = async () => {
    await limparNotificacoes();
    setNotificacoes([]);
  };

  const adicionarExemplos = async () => {
    const { adicionarNotificacao } = await import('@/constants/notifications');
    await adicionarNotificacao('match', 'Novo match!', 'Ana Maria Cossa é compatível com o seu anúncio.');
    await adicionarNotificacao('mensagem', 'Nova mensagem', 'Maria João enviou-lhe uma mensagem.');
    await adicionarNotificacao('entrevista', 'Proposta de entrevista', 'Carlos Machava quer marcar uma entrevista consigo.');
    await adicionarNotificacao('subscricao', 'Subscrição a expirar', 'O seu período de teste expira em 3 dias.');
    carregarNotificacoes();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>{t('notificacoes')}</Text>
        {notificacoes.length > 0 && (
          <TouchableOpacity onPress={limpar}>
            <Text style={styles.limpar}>{t('limpar_tudo')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.lista}>
        {notificacoes.length === 0 ? (
          <View style={styles.vazio}>
            <Text style={styles.vazioIcone}>🔔</Text>
            <Text style={styles.vazioTitulo}>{t('sem_notificacoes')}</Text>
            <Text style={styles.vazioDesc}>{t('notificacoes_desc')}</Text>
            <TouchableOpacity style={styles.btnTeste} onPress={adicionarExemplos}>
              <Text style={styles.btnTesteText}>{t('ver_exemplos')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          notificacoes.map(n => (
            <View key={n.id} style={[styles.card, !n.lida && styles.cardNaoLido]}>
              <View style={styles.cardIcone}>
                <Text style={styles.icone}>{getIconeNotificacao(n.tipo)}</Text>
              </View>
              <View style={styles.cardInfo}>
                <View style={styles.cardTopo}>
                  <Text style={styles.cardTitulo}>{n.titulo}</Text>
                  <Text style={styles.cardData}>{formatarData(n.data)}</Text>
                </View>
                <Text style={styles.cardMensagem}>{n.mensagem}</Text>
              </View>
              {!n.lida && <View style={styles.ponto} />}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0ea' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#222' },
  limpar: { fontSize: 14, color: '#c0392b' },
  lista: { padding: 16 },
  vazio: { alignItems: 'center', paddingTop: 80 },
  vazioIcone: { fontSize: 56, marginBottom: 16 },
  vazioTitulo: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  vazioDesc: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24 },
  btnTeste: { backgroundColor: '#1F8A70', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  btnTesteText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardNaoLido: { backgroundColor: '#f0faf5', borderLeftWidth: 3, borderLeftColor: '#1F8A70' },
  cardIcone: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e8f5f0', alignItems: 'center', justifyContent: 'center' },
  icone: { fontSize: 20 },
  cardInfo: { flex: 1 },
  cardTopo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardTitulo: { fontSize: 14, fontWeight: '700', color: '#222' },
  cardData: { fontSize: 11, color: '#aaa' },
  cardMensagem: { fontSize: 13, color: '#555', lineHeight: 20 },
  ponto: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1F8A70', marginTop: 4 },
});