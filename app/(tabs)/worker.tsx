import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WorkerScreen() {
  const router = useRouter();
  const [regime, setRegime] = useState<'residente' | 'nao_residente'>('residente');

  const worker = {
    iniciais: 'AC',
    nome: 'Ana Maria Cossa',
    verificada: true,
    provincia: 'Maputo',
    distrito: 'KaMpfumu',
    bairro: 'Maxaquene',
    estrelas: 4.8,
    totalAvaliacoes: 14,
    tipo: 'Empregada doméstica',
    horario: 'Horário fixo · Mensal',
    servicos: ['Limpeza geral', 'Cozinha', 'Lavar roupa', 'Passar roupa'],
    naoResidente: {
      salarioMin: 4000,
      salarioMax: 6000,
      salarioNegociavel: true,
      horarioEntrada: '07:00',
      horarioSaida: '17:00',
      diasTrabalhados: 'Segunda a Sexta',
      transporte: 'Negociar',
    },
    residente: {
      quartoIndividual: true,
      refeicoes: 'Todas incluídas (3/dia)',
      diasFolga: 'Sábado tarde + Domingo',
      saidaFimSemana: true,
      salarioMin: 3500,
      salarioMax: 5000,
      salarioNegociavel: false,
    },
    localizacao: {
      provincia: 'Maputo',
      distrito: 'KaMpfumu',
      bairro: 'Maxaquene',
      deslocacao: true,
      areaDeslocacao: 'Toda a cidade',
    },
    condicoes: {
      detergenteUsoDoEmpregador: true,
      detergenteRoupa: 'Negociar',
      aceitaAnimais: true,
      experiencia: '6 anos',
      idiomas: ['Português', 'Changana'],
    },
  };

  const estrelasFull = Math.floor(worker.estrelas);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>

      {/* HEADER */}
      <View style={styles.card}>
        <View style={styles.headerTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{worker.iniciais}</Text>
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.nome}>{worker.nome}</Text>
              {worker.verificada && (
                <View style={styles.badgeVerificada}>
                  <Text style={styles.badgeVerificadaText}>Verificada</Text>
                </View>
              )}
            </View>
            <Text style={styles.localizacao}>{worker.provincia} · {worker.bairro} · {worker.distrito}</Text>
            <Text style={styles.estrelas}>{'★'.repeat(estrelasFull)}{'☆'.repeat(5 - estrelasFull)}</Text>
            <Text style={styles.avaliacoes}>{worker.estrelas} · {worker.totalAvaliacoes} avaliações</Text>
          </View>
        </View>

        <View style={styles.tagsRow}>
          <View style={styles.tagTipo}>
            <Text style={styles.tagTipoText}>{worker.tipo}</Text>
          </View>
          <Text style={styles.horarioText}>{worker.horario}</Text>
        </View>

        <View style={styles.tagsRow}>
          {worker.servicos.map(s => (
            <View key={s} style={styles.tag}>
              <Text style={styles.tagText}>{s}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* REGIME */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>REGIME DE TRABALHO</Text>

        <TouchableOpacity
          style={[styles.radioRow, regime === 'nao_residente' && styles.radioRowActive]}
          onPress={() => setRegime('nao_residente')}>
          <View style={[styles.radio, regime === 'nao_residente' && styles.radioSelecionado]}>
            {regime === 'nao_residente' && <View style={styles.radioDot} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.radioTitulo, regime === 'nao_residente' && styles.radioTituloActive]}>Não residente</Text>
            <Text style={styles.radioDesc}>Entra e sai no mesmo dia. Horário definido.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.radioRow, regime === 'residente' && styles.radioRowActive]}
          onPress={() => setRegime('residente')}>
          <View style={[styles.radio, regime === 'residente' && styles.radioSelecionado]}>
            {regime === 'residente' && <View style={styles.radioDot} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.radioTitulo, regime === 'residente' && styles.radioTituloActive]}>Residente</Text>
            <Text style={[styles.radioDesc, regime === 'residente' && styles.radioDescActive]}>Dorme na casa do empregador. Quarto próprio necessário.</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* CONDIÇÕES RESIDENTE */}
      {regime === 'residente' && (
        <View style={styles.cardGreen}>
          <Text style={styles.sectionLabelGreen}>Condições como residente</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Quarto próprio</Text>
            <Text style={styles.rowValue}>{worker.residente.quartoIndividual ? 'Exige quarto individual' : 'Não exige'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Refeições</Text>
            <Text style={styles.rowValue}>{worker.residente.refeicoes}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Dias de folga</Text>
            <Text style={styles.rowValue}>{worker.residente.diasFolga}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Saída ao fim de semana</Text>
            <Text style={styles.rowValue}>{worker.residente.saidaFimSemana ? 'Sim, regresso domingo' : 'Não'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Salário esperado</Text>
            <View style={styles.salarioRow}>
              <Text style={styles.rowValue}>{worker.residente.salarioMin.toLocaleString()} – {worker.residente.salarioMax.toLocaleString()} MZN</Text>
              {worker.residente.salarioNegociavel && (
                <View style={styles.badgeNegociar}><Text style={styles.badgeNegociarText}>Negociar</Text></View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* CONDIÇÕES NÃO RESIDENTE */}
      {regime === 'nao_residente' && (
        <View style={styles.cardBlue}>
          <Text style={styles.sectionLabelBlue}>Condições como não residente</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Horário</Text>
            <Text style={styles.rowValue}>{worker.naoResidente.horarioEntrada} – {worker.naoResidente.horarioSaida}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Dias trabalhados</Text>
            <Text style={styles.rowValue}>{worker.naoResidente.diasTrabalhados}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Transporte</Text>
            <View style={styles.badgeNegociar}><Text style={styles.badgeNegociarText}>{worker.naoResidente.transporte}</Text></View>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Salário esperado</Text>
            <View style={styles.salarioRow}>
              <Text style={styles.rowValue}>{worker.naoResidente.salarioMin.toLocaleString()} – {worker.naoResidente.salarioMax.toLocaleString()} MZN</Text>
              {worker.naoResidente.salarioNegociavel && (
                <View style={styles.badgeNegociar}><Text style={styles.badgeNegociarText}>Negociar</Text></View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* LOCALIZAÇÃO */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>LOCALIZAÇÃO E DISPONIBILIDADE</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Província</Text>
          <Text style={styles.rowValue}>{worker.localizacao.provincia}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Distrito</Text>
          <Text style={styles.rowValue}>{worker.localizacao.distrito}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Bairro</Text>
          <Text style={styles.rowValue}>{worker.localizacao.bairro}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Deslocação</Text>
          <Text style={styles.rowValue}>{worker.localizacao.deslocacao ? `Sim, ${worker.localizacao.areaDeslocacao}` : 'Não se desloca'}</Text>
        </View>
      </View>

      {/* CONDIÇÕES GERAIS */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>CONDIÇÕES GERAIS</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Detergente limpeza</Text>
          <Text style={styles.rowValue}>{worker.condicoes.detergenteUsoDoEmpregador ? 'Usa os do empregador' : 'Traz o próprio'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Detergente roupa</Text>
          <View style={styles.badgeNegociar}><Text style={styles.badgeNegociarText}>{worker.condicoes.detergenteRoupa}</Text></View>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Animais em casa</Text>
          <Text style={styles.rowValue}>{worker.condicoes.aceitaAnimais ? 'Aceita' : 'Não aceita'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Experiência</Text>
          <Text style={styles.rowValue}>{worker.condicoes.experiencia}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Idiomas</Text>
          <Text style={styles.rowValue}>{worker.condicoes.idiomas.join(', ')}</Text>
        </View>
      </View>

      {/* NOTA */}
      <View style={styles.nota}>
        <Text style={styles.notaTexto}>Para empregadas residentes: refeições e alojamento são sempre da responsabilidade do empregador — estes campos ficam automaticamente marcados como incluídos no match.</Text>
      </View>

      {/* BOTÕES */}
      <TouchableOpacity style={styles.btnPropor} onPress={() => router.push('/(tabs)/messages')}>
        <Text style={styles.btnProporText}>Propor entrevista</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnHistorico}>
        <Text style={styles.btnHistoricoText}>Ver histórico completo</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f5f5f0', padding: 20, paddingTop: 60 },
  backBtn: { marginBottom: 16 },
  backText: { color: '#1D9E75', fontSize: 16 },

  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 },
  cardGreen: { backgroundColor: '#e8f5f0', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#b2dfcf' },
  cardBlue: { backgroundColor: '#EBF4FF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#bfdbf7' },

  headerTop: { flexDirection: 'row', marginBottom: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#b2dfdb', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#1D9E75', fontSize: 18, fontWeight: 'bold' },
  headerInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  nome: { fontSize: 17, fontWeight: 'bold', color: '#222' },
  badgeVerificada: { backgroundColor: '#e8f5e9', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeVerificadaText: { color: '#1D9E75', fontSize: 12, fontWeight: '600' },
  localizacao: { fontSize: 12, color: '#888', marginTop: 2 },
  estrelas: { color: '#f59e0b', fontSize: 15, marginTop: 4 },
  avaliacoes: { fontSize: 12, color: '#888' },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8, alignItems: 'center' },
  tagTipo: { backgroundColor: '#e8f5e9', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  tagTipoText: { color: '#1D9E75', fontSize: 13, fontWeight: '600' },
  horarioText: { fontSize: 13, color: '#888' },
  tag: { backgroundColor: '#f0f0ea', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText: { fontSize: 12, color: '#555' },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#aaa', letterSpacing: 1, marginBottom: 12 },
  sectionLabelGreen: { fontSize: 13, fontWeight: '600', color: '#1D9E75', marginBottom: 12 },
  sectionLabelBlue: { fontSize: 13, fontWeight: '600', color: '#185FA5', marginBottom: 12 },

  radioRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 10, borderRadius: 12, marginBottom: 4 },
  radioRowActive: { backgroundColor: '#e8f5f0' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  radioSelecionado: { borderColor: '#1D9E75' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1D9E75' },
  radioTitulo: { fontSize: 15, fontWeight: '600', color: '#333' },
  radioTituloActive: { color: '#1D9E75' },
  radioDesc: { fontSize: 12, color: '#888', marginTop: 2 },
  radioDescActive: { color: '#1D9E75' },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#f0f0ea' },
  rowLabel: { fontSize: 13, color: '#888' },
  rowValue: { fontSize: 13, fontWeight: '600', color: '#333' },
  salarioRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  badgeNegociar: { backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeNegociarText: { color: '#b45309', fontSize: 12, fontWeight: '600' },

  nota: { backgroundColor: '#fef9e7', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#fde68a' },
  notaTexto: { fontSize: 13, color: '#92400e', lineHeight: 20 },

  btnPropor: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#333', alignItems: 'center', marginBottom: 12, backgroundColor: '#fff' },
  btnProporText: { fontSize: 16, color: '#333', fontWeight: '500' },
  btnHistorico: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#333', alignItems: 'center', backgroundColor: '#fff' },
  btnHistoricoText: { fontSize: 16, color: '#333', fontWeight: '500' },
});