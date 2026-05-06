import { getLingua, t } from '@/constants/i18n';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Estado = 'pendente' | 'activo' | 'terminado';
type Resposta = 'pendente' | 'aceito' | 'recusado';

export default function ContractScreen() {
  const router = useRouter();
  const [, setLinguaActual] = useState('pt');

  useFocusEffect(
    useCallback(() => {
      getLingua().then(l => setLinguaActual(l));
    }, [])
  );

  const contrato = {
    trabalhadora: 'Ana Maria Cossa',
    empregador: 'Carlos Machava',
    servicos: ['Limpeza geral', 'Cozinha', 'Lavar roupa'],
    regime: 'Não residente',
    horario: '07:00 – 17:00',
    dias: 'Segunda a Sexta',
    salario: '4.500 MZN/mês',
    salarioNegociavel: false,
    dataInicio: '15/04/2026',
    quartoIndividual: false,
    refeicoes: 'Não aplicável',
    detergentelimpeza: 'Fornecido pelo empregador',
    detergenteRoupa: 'A negociar',
    animais: 'Não',
    localizacao: 'Sommerschield, Maputo',
  };

  const [estadoContrato, setEstadoContrato] = useState<Estado>('pendente');
  const [respostaEmpregador, setRespostaEmpregador] = useState<Resposta>('pendente');
  const [respostaTrabalhadora, setRespostaTrabalhadora] = useState<Resposta>('pendente');
  const [terminadoPor, setTerminadoPor] = useState('');

  const verificarAtivacao = (re: Resposta, rt: Resposta) => {
    if (re === 'aceito' && rt === 'aceito') setEstadoContrato('activo');
    else if (re === 'recusado' || rt === 'recusado') setEstadoContrato('pendente');
  };

  const responderEmpregador = (resp: Resposta) => {
    setRespostaEmpregador(resp);
    verificarAtivacao(resp, respostaTrabalhadora);
  };

  const responderTrabalhadora = (resp: Resposta) => {
    setRespostaTrabalhadora(resp);
    verificarAtivacao(respostaEmpregador, resp);
  };

  const terminarContrato = (quem: string) => {
    setTerminadoPor(quem);
    setEstadoContrato('terminado');
  };

  const badgeEstado = () => {
    if (estadoContrato === 'activo') return { texto: '✅ ' + t('contrato_activo'), cor: '#e8f5f0', corTexto: '#1F8A70', corBorda: '#b2dfcf' };
    if (estadoContrato === 'terminado') return { texto: '🔴 ' + t('contrato_terminado'), cor: '#fff0f0', corTexto: '#c0392b', corBorda: '#ffcdd2' };
    return { texto: '⏳ ' + t('aguarda_confirmacao'), cor: '#fef9e7', corTexto: '#b45309', corBorda: '#fde68a' };
  };

  const badge = badgeEstado();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← {t('voltar')}</Text>
      </TouchableOpacity>
      <Text style={styles.titulo}>{t('contrato_trabalho')}</Text>
      <Text style={styles.subtitulo}>{t('emprego_domestico')} · DomésticaMoz</Text>

      <View style={[styles.badgeEstado, { backgroundColor: badge.cor, borderColor: badge.corBorda }]}>
        <Text style={[styles.badgeEstadoTexto, { color: badge.corTexto }]}>{badge.texto}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>{t('partes_envolvidas').toUpperCase()}</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('empregador')}</Text>
          <Text style={styles.rowValue}>{contrato.empregador}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('trabalhadora')}</Text>
          <Text style={styles.rowValue}>{contrato.trabalhadora}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('data_inicio')}</Text>
          <Text style={styles.rowValue}>{contrato.dataInicio}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('localizacao')}</Text>
          <Text style={styles.rowValue}>{contrato.localizacao}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>{t('servicos_incluidos').toUpperCase()}</Text>
        <View style={styles.chipGrid}>
          {contrato.servicos.map(s => (
            <View key={s} style={styles.chip}>
              <Text style={styles.chipText}>✓ {s}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>{t('condicoes_trabalho').toUpperCase()}</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('regime_trabalho')}</Text>
          <Text style={styles.rowValue}>{contrato.regime}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('horario')}</Text>
          <Text style={styles.rowValue}>{contrato.horario}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('dias_trabalhados')}</Text>
          <Text style={styles.rowValue}>{contrato.dias}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('salario')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.rowValue}>{contrato.salario}</Text>
            {contrato.salarioNegociavel && (
              <View style={styles.badgeNegociar}><Text style={styles.badgeNegociarText}>{t('negociar')}</Text></View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>{t('condicoes_gerais').toUpperCase()}</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('detergente_limpeza')}</Text>
          <Text style={styles.rowValue}>{contrato.detergentelimpeza}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('detergente_roupa')}</Text>
          <View style={styles.badgeNegociar}><Text style={styles.badgeNegociarText}>{contrato.detergenteRoupa}</Text></View>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('animais_casa')}</Text>
          <Text style={styles.rowValue}>{contrato.animais}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('refeicoes')}</Text>
          <Text style={styles.rowValue}>{contrato.refeicoes}</Text>
        </View>
      </View>

      {estadoContrato === 'pendente' && (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{t('confirmacao_partes').toUpperCase()}</Text>
          <Text style={styles.confirmDesc}>{t('confirmacao_desc')}</Text>

          <View style={styles.confirmRow}>
            <View style={styles.confirmInfo}>
              <Text style={styles.confirmNome}>👔 {contrato.empregador}</Text>
              <Text style={[styles.confirmEstado,
                respostaEmpregador === 'aceito' ? styles.confirmAceito :
                respostaEmpregador === 'recusado' ? styles.confirmRecusado :
                styles.confirmPendente]}>
                {respostaEmpregador === 'aceito' ? '✅ ' + t('confirmou') :
                 respostaEmpregador === 'recusado' ? '❌ ' + t('recusou') : '⏳ ' + t('pendente')}
              </Text>
            </View>
            {respostaEmpregador === 'pendente' && (
              <View style={styles.confirmBtns}>
                <TouchableOpacity style={styles.btnAceitar} onPress={() => responderEmpregador('aceito')}>
                  <Text style={styles.btnAceitarText}>{t('aceitar')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnRecusar} onPress={() => responderEmpregador('recusado')}>
                  <Text style={styles.btnRecusarText}>{t('recusar')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.confirmRow}>
            <View style={styles.confirmInfo}>
              <Text style={styles.confirmNome}>👩 {contrato.trabalhadora}</Text>
              <Text style={[styles.confirmEstado,
                respostaTrabalhadora === 'aceito' ? styles.confirmAceito :
                respostaTrabalhadora === 'recusado' ? styles.confirmRecusado :
                styles.confirmPendente]}>
                {respostaTrabalhadora === 'aceito' ? '✅ ' + t('confirmou') :
                 respostaTrabalhadora === 'recusado' ? '❌ ' + t('recusou') : '⏳ ' + t('pendente')}
              </Text>
            </View>
            {respostaTrabalhadora === 'pendente' && (
              <View style={styles.confirmBtns}>
                <TouchableOpacity style={styles.btnAceitar} onPress={() => responderTrabalhadora('aceito')}>
                  <Text style={styles.btnAceitarText}>{t('aceitar')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnRecusar} onPress={() => responderTrabalhadora('recusado')}>
                  <Text style={styles.btnRecusarText}>{t('recusar')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {(respostaEmpregador === 'recusado' || respostaTrabalhadora === 'recusado') && (
            <View style={styles.notaRecusado}>
              <Text style={styles.notaRecusadoTexto}>❌ {t('contrato_recusado_desc')}</Text>
            </View>
          )}
        </View>
      )}

      {estadoContrato === 'activo' && (
        <View style={styles.cardGreen}>
          <Text style={styles.sectionLabelGreen}>{t('contrato_em_vigor').toUpperCase()}</Text>
          <Text style={styles.confirmDesc}>{t('contrato_em_vigor_desc')}</Text>
          <TouchableOpacity style={styles.btnTerminar} onPress={() => terminarContrato(t('empregador'))}>
            <Text style={styles.btnTerminarText}>{t('marcar_terminado_empregador')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnTerminar, { marginTop: 8, backgroundColor: '#f0f0ea' }]} onPress={() => terminarContrato(t('trabalhadora'))}>
            <Text style={[styles.btnTerminarText, { color: '#555' }]}>{t('marcar_terminado_trabalhadora')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {estadoContrato === 'terminado' && (
        <View style={styles.cardTerminado}>
          <Text style={styles.sectionLabelTerminado}>{t('contrato_terminado').toUpperCase()}</Text>
          <Text style={styles.confirmDesc}>{t('terminado_por')}: {terminadoPor}. {t('contrato_terminado_desc')}</Text>
          <View style={styles.notaAvaliar}>
            <Text style={styles.notaAvaliarTexto}>⚠️ {t('conta_bloqueada_avaliacao')}</Text>
          </View>
          <TouchableOpacity style={styles.btnAvaliar} onPress={() => router.push('/(tabs)/review')}>
            <Text style={styles.btnAvaliarText}>⭐ {t('fazer_avaliacao')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f5f5f0', padding: 20, paddingTop: 60 },
  backBtn: { marginBottom: 16 },
  backText: { color: '#1F8A70', fontSize: 16 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  subtitulo: { fontSize: 13, color: '#888', marginBottom: 16 },
  badgeEstado: { padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16, alignItems: 'center' },
  badgeEstadoTexto: { fontSize: 15, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 },
  cardGreen: { backgroundColor: '#e8f5f0', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#b2dfcf' },
  cardTerminado: { backgroundColor: '#fff0f0', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#ffcdd2' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#aaa', letterSpacing: 1, marginBottom: 12 },
  sectionLabelGreen: { fontSize: 11, fontWeight: '700', color: '#1F8A70', letterSpacing: 1, marginBottom: 12 },
  sectionLabelTerminado: { fontSize: 11, fontWeight: '700', color: '#c0392b', letterSpacing: 1, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#f0f0ea' },
  rowLabel: { fontSize: 13, color: '#888' },
  rowValue: { fontSize: 13, fontWeight: '600', color: '#333' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#e8f5f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  chipText: { fontSize: 13, color: '#1F8A70', fontWeight: '600' },
  badgeNegociar: { backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeNegociarText: { color: '#b45309', fontSize: 12, fontWeight: '600' },
  confirmDesc: { fontSize: 13, color: '#888', marginBottom: 16, lineHeight: 20 },
  confirmRow: { backgroundColor: '#f9f9f7', borderRadius: 12, padding: 12, marginBottom: 10 },
  confirmInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  confirmNome: { fontSize: 14, fontWeight: '600', color: '#333' },
  confirmEstado: { fontSize: 13, fontWeight: '600' },
  confirmAceito: { color: '#1F8A70' },
  confirmRecusado: { color: '#c0392b' },
  confirmPendente: { color: '#b45309' },
  confirmBtns: { flexDirection: 'row', gap: 8 },
  btnAceitar: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#1F8A70', alignItems: 'center' },
  btnAceitarText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  btnRecusar: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center', backgroundColor: '#fff' },
  btnRecusarText: { color: '#888', fontSize: 13, fontWeight: '600' },
  notaRecusado: { backgroundColor: '#fff0f0', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#ffcdd2' },
  notaRecusadoTexto: { fontSize: 13, color: '#c0392b', lineHeight: 20 },
  btnTerminar: { padding: 14, borderRadius: 12, backgroundColor: '#c0392b', alignItems: 'center', marginTop: 12 },
  btnTerminarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  notaAvaliar: { backgroundColor: '#fef9e7', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#fde68a', marginBottom: 12 },
  notaAvaliarTexto: { fontSize: 13, color: '#b45309' },
  btnAvaliar: { padding: 14, borderRadius: 12, backgroundColor: '#1F8A70', alignItems: 'center' },
  btnAvaliarText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});