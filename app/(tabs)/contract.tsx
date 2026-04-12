import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Estado = 'pendente' | 'activo' | 'terminado';
type Resposta = 'pendente' | 'aceito' | 'recusado';

export default function ContractScreen() {
  const router = useRouter();

  // Simulação — futuramente vem da base de dados
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

  // Quando os dois aceitam → contrato activo
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
    if (estadoContrato === 'activo') return { texto: '✅ Contrato activo', cor: '#e8f5f0', corTexto: '#1D9E75', corBorda: '#b2dfcf' };
    if (estadoContrato === 'terminado') return { texto: '🔴 Contrato terminado', cor: '#fff0f0', corTexto: '#c0392b', corBorda: '#ffcdd2' };
    return { texto: '⏳ Aguarda confirmação', cor: '#fef9e7', corTexto: '#b45309', corBorda: '#fde68a' };
  };

  const badge = badgeEstado();

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* HEADER */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>
      <Text style={styles.titulo}>Contrato de Trabalho</Text>
      <Text style={styles.subtitulo}>Emprego Doméstico · DomésticaMoz</Text>

      {/* ESTADO */}
      <View style={[styles.badgeEstado, { backgroundColor: badge.cor, borderColor: badge.corBorda }]}>
        <Text style={[styles.badgeEstadoTexto, { color: badge.corTexto }]}>{badge.texto}</Text>
      </View>

      {/* PARTES */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>PARTES ENVOLVIDAS</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Empregador</Text>
          <Text style={styles.rowValue}>{contrato.empregador}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Trabalhadora</Text>
          <Text style={styles.rowValue}>{contrato.trabalhadora}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Data de início</Text>
          <Text style={styles.rowValue}>{contrato.dataInicio}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Localização</Text>
          <Text style={styles.rowValue}>{contrato.localizacao}</Text>
        </View>
      </View>

      {/* SERVIÇOS */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>SERVIÇOS INCLUÍDOS</Text>
        <View style={styles.chipGrid}>
          {contrato.servicos.map(s => (
            <View key={s} style={styles.chip}>
              <Text style={styles.chipText}>✓ {s}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CONDIÇÕES */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>CONDIÇÕES DE TRABALHO</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Regime</Text>
          <Text style={styles.rowValue}>{contrato.regime}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Horário</Text>
          <Text style={styles.rowValue}>{contrato.horario}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Dias</Text>
          <Text style={styles.rowValue}>{contrato.dias}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Salário</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.rowValue}>{contrato.salario}</Text>
            {contrato.salarioNegociavel && (
              <View style={styles.badgeNegociar}><Text style={styles.badgeNegociarText}>Negociar</Text></View>
            )}
          </View>
        </View>
      </View>

      {/* CONDIÇÕES GERAIS */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>CONDIÇÕES GERAIS</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Detergente limpeza</Text>
          <Text style={styles.rowValue}>{contrato.detergentelimpeza}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Detergente roupa</Text>
          <View style={styles.badgeNegociar}><Text style={styles.badgeNegociarText}>{contrato.detergenteRoupa}</Text></View>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Animais em casa</Text>
          <Text style={styles.rowValue}>{contrato.animais}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Refeições</Text>
          <Text style={styles.rowValue}>{contrato.refeicoes}</Text>
        </View>
      </View>

      {/* CONFIRMAÇÃO — só se pendente */}
      {estadoContrato === 'pendente' && (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>CONFIRMAÇÃO DAS PARTES</Text>
          <Text style={styles.confirmDesc}>Ambas as partes devem confirmar para o contrato ficar activo.</Text>

          {/* Empregador */}
          <View style={styles.confirmRow}>
            <View style={styles.confirmInfo}>
              <Text style={styles.confirmNome}>👔 {contrato.empregador}</Text>
              <Text style={[styles.confirmEstado,
                respostaEmpregador === 'aceito' ? styles.confirmAceito :
                respostaEmpregador === 'recusado' ? styles.confirmRecusado :
                styles.confirmPendente]}>
                {respostaEmpregador === 'aceito' ? '✅ Confirmou' :
                 respostaEmpregador === 'recusado' ? '❌ Recusou' : '⏳ Pendente'}
              </Text>
            </View>
            {respostaEmpregador === 'pendente' && (
              <View style={styles.confirmBtns}>
                <TouchableOpacity style={styles.btnAceitar} onPress={() => responderEmpregador('aceito')}>
                  <Text style={styles.btnAceitarText}>Aceitar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnRecusar} onPress={() => responderEmpregador('recusado')}>
                  <Text style={styles.btnRecusarText}>Recusar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Trabalhadora */}
          <View style={styles.confirmRow}>
            <View style={styles.confirmInfo}>
              <Text style={styles.confirmNome}>👩 {contrato.trabalhadora}</Text>
              <Text style={[styles.confirmEstado,
                respostaTrabalhadora === 'aceito' ? styles.confirmAceito :
                respostaTrabalhadora === 'recusado' ? styles.confirmRecusado :
                styles.confirmPendente]}>
                {respostaTrabalhadora === 'aceito' ? '✅ Confirmou' :
                 respostaTrabalhadora === 'recusado' ? '❌ Recusou' : '⏳ Pendente'}
              </Text>
            </View>
            {respostaTrabalhadora === 'pendente' && (
              <View style={styles.confirmBtns}>
                <TouchableOpacity style={styles.btnAceitar} onPress={() => responderTrabalhadora('aceito')}>
                  <Text style={styles.btnAceitarText}>Aceitar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnRecusar} onPress={() => responderTrabalhadora('recusado')}>
                  <Text style={styles.btnRecusarText}>Recusar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {(respostaEmpregador === 'recusado' || respostaTrabalhadora === 'recusado') && (
            <View style={styles.notaRecusado}>
              <Text style={styles.notaRecusadoTexto}>❌ Uma das partes recusou. O contrato não foi activado. Ambos ficam livres para novos matches.</Text>
            </View>
          )}
        </View>
      )}

      {/* CONTRATO ACTIVO — botão terminar */}
      {estadoContrato === 'activo' && (
        <View style={styles.cardGreen}>
          <Text style={styles.sectionLabelGreen}>CONTRATO EM VIGOR</Text>
          <Text style={styles.confirmDesc}>O contrato está activo. Qualquer uma das partes pode marcar como terminado quando o trabalho acabar.</Text>
          <TouchableOpacity style={styles.btnTerminar} onPress={() => terminarContrato('Empregador')}>
            <Text style={styles.btnTerminarText}>Marcar como terminado (Empregador)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnTerminar, { marginTop: 8, backgroundColor: '#f0f0ea' }]} onPress={() => terminarContrato('Trabalhadora')}>
            <Text style={[styles.btnTerminarText, { color: '#555' }]}>Marcar como terminado (Trabalhadora)</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* CONTRATO TERMINADO — ir avaliar */}
      {estadoContrato === 'terminado' && (
        <View style={styles.cardTerminado}>
          <Text style={styles.sectionLabelTerminado}>CONTRATO TERMINADO</Text>
          <Text style={styles.confirmDesc}>Terminado por: {terminadoPor}. Para continuar a usar a app, ambas as partes devem fazer a sua avaliação.</Text>
          <View style={styles.notaAvaliar}>
            <Text style={styles.notaAvaliarTexto}>⚠️ A sua conta ficará bloqueada até efectuar a avaliação.</Text>
          </View>
          <TouchableOpacity style={styles.btnAvaliar} onPress={() => router.push('/(tabs)/review')}>
            <Text style={styles.btnAvaliarText}>⭐ Fazer avaliação agora</Text>
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
  backText: { color: '#1D9E75', fontSize: 16 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  subtitulo: { fontSize: 13, color: '#888', marginBottom: 16 },

  badgeEstado: { padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16, alignItems: 'center' },
  badgeEstadoTexto: { fontSize: 15, fontWeight: '700' },

  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 },
  cardGreen: { backgroundColor: '#e8f5f0', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#b2dfcf' },
  cardTerminado: { backgroundColor: '#fff0f0', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#ffcdd2' },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#aaa', letterSpacing: 1, marginBottom: 12 },
  sectionLabelGreen: { fontSize: 11, fontWeight: '700', color: '#1D9E75', letterSpacing: 1, marginBottom: 12 },
  sectionLabelTerminado: { fontSize: 11, fontWeight: '700', color: '#c0392b', letterSpacing: 1, marginBottom: 12 },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#f0f0ea' },
  rowLabel: { fontSize: 13, color: '#888' },
  rowValue: { fontSize: 13, fontWeight: '600', color: '#333' },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#e8f5f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  chipText: { fontSize: 13, color: '#1D9E75', fontWeight: '600' },

  badgeNegociar: { backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeNegociarText: { color: '#b45309', fontSize: 12, fontWeight: '600' },

  confirmDesc: { fontSize: 13, color: '#888', marginBottom: 16, lineHeight: 20 },
  confirmRow: { backgroundColor: '#f9f9f7', borderRadius: 12, padding: 12, marginBottom: 10 },
  confirmInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  confirmNome: { fontSize: 14, fontWeight: '600', color: '#333' },
  confirmEstado: { fontSize: 13, fontWeight: '600' },
  confirmAceito: { color: '#1D9E75' },
  confirmRecusado: { color: '#c0392b' },
  confirmPendente: { color: '#b45309' },
  confirmBtns: { flexDirection: 'row', gap: 8 },
  btnAceitar: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#1D9E75', alignItems: 'center' },
  btnAceitarText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  btnRecusar: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center', backgroundColor: '#fff' },
  btnRecusarText: { color: '#888', fontSize: 13, fontWeight: '600' },

  notaRecusado: { backgroundColor: '#fff0f0', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#ffcdd2' },
  notaRecusadoTexto: { fontSize: 13, color: '#c0392b', lineHeight: 20 },

  btnTerminar: { padding: 14, borderRadius: 12, backgroundColor: '#c0392b', alignItems: 'center', marginTop: 12 },
  btnTerminarText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  notaAvaliar: { backgroundColor: '#fef9e7', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#fde68a', marginBottom: 12 },
  notaAvaliarTexto: { fontSize: 13, color: '#b45309' },
  btnAvaliar: { padding: 14, borderRadius: 12, backgroundColor: '#1D9E75', alignItems: 'center' },
  btnAvaliarText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});