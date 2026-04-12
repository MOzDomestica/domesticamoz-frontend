import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ReviewScreen() {
  const router = useRouter();

  // Simulação — futuramente vem da base de dados
  const [jaAvaliou] = useState(false); // false = ainda não avaliou
  const [avaliacaoSubmetida, setAvaliacaoSubmetida] = useState(false);

  // Avaliação do empregador sobre a trabalhadora
  const [estrelasGeral, setEstrelasGeral] = useState(0);
  const [estrelasPontualidade, setEstrelasPontualidade] = useState(0);
  const [estrelasLimpeza, setEstrelasLimpeza] = useState(0);
  const [estrelasAtitude, setEstrelasAtitude] = useState(0);
  const [comentario, setComentario] = useState('');
  const [recomenda, setRecomenda] = useState('');

  const Estrelas = ({ valor, onChange }: { valor: number; onChange: (n: number) => void }) => (
    <View style={styles.estrelasRow}>
      {[1, 2, 3, 4, 5].map(n => (
        <TouchableOpacity key={n} onPress={() => onChange(n)}>
          <Text style={[styles.estrela, n <= valor && styles.estrelaActiva]}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const submeter = () => {
    if (estrelasGeral === 0) return;
    setAvaliacaoSubmetida(true);
  };

  // Já avaliou — mostrar avaliação submetida
  if (jaAvaliou || avaliacaoSubmetida) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <View style={styles.cardGreen}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitulo}>Avaliação submetida!</Text>
          <Text style={styles.successDesc}>Obrigado pela sua avaliação. A sua conta está desbloqueada e pode continuar a usar a DomésticaMoz.</Text>
          <TouchableOpacity style={styles.btnVoltar} onPress={() => router.push('/(tabs)/match')}>
            <Text style={styles.btnVoltarText}>Ver novos matches →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>Avaliação</Text>
      <Text style={styles.subtitulo}>O seu contrato com Ana Maria Cossa terminou</Text>

      {/* AVISO BLOQUEIO */}
      <View style={styles.notaBloqueio}>
        <Text style={styles.notaBloqueioTexto}>⚠️ A sua conta está temporariamente bloqueada. Complete a avaliação para continuar a usar a app.</Text>
      </View>

      {/* AVALIAÇÃO GERAL */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>AVALIAÇÃO GERAL</Text>
        <Text style={styles.avaliacaoDesc}>Como foi a experiência geral com Ana Maria Cossa?</Text>
        <Estrelas valor={estrelasGeral} onChange={setEstrelasGeral} />
        {estrelasGeral === 0 && <Text style={styles.erroEstrelas}>* Obrigatório</Text>}
      </View>

      {/* CRITÉRIOS */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>CRITÉRIOS ESPECÍFICOS</Text>

        <Text style={styles.criterioLabel}>Pontualidade</Text>
        <Estrelas valor={estrelasPontualidade} onChange={setEstrelasPontualidade} />

        <Text style={[styles.criterioLabel, { marginTop: 16 }]}>Qualidade do trabalho</Text>
        <Estrelas valor={estrelasLimpeza} onChange={setEstrelasLimpeza} />

        <Text style={[styles.criterioLabel, { marginTop: 16 }]}>Atitude e comunicação</Text>
        <Estrelas valor={estrelasAtitude} onChange={setEstrelasAtitude} />
      </View>

      {/* RECOMENDAÇÃO */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>RECOMENDAÇÃO</Text>
        <Text style={styles.avaliacaoDesc}>Recomendaria esta trabalhadora a outros empregadores?</Text>
        <View style={styles.chipGrid}>
          {[
            { val: 'sim', label: '👍 Sim, recomendo' },
            { val: 'nao', label: '👎 Não recomendo' },
            { val: 'talvez', label: '🤔 Talvez' },
          ].map(op => (
            <TouchableOpacity key={op.val}
              style={[styles.chip, recomenda === op.val && styles.chipActive]}
              onPress={() => setRecomenda(op.val)}>
              <Text style={[styles.chipText, recomenda === op.val && styles.chipTextActive]}>{op.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* COMENTÁRIO */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>COMENTÁRIO (opcional)</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          placeholder="Partilhe a sua experiência para ajudar outros empregadores..."
          value={comentario}
          onChangeText={setComentario}
          multiline
        />
      </View>

      {/* NOTA */}
      <View style={styles.nota}>
        <Text style={styles.notaTexto}>🔒 A avaliação só fica visível após a outra parte também avaliar — para garantir imparcialidade.</Text>
      </View>

      {/* BOTÃO SUBMETER */}
      <TouchableOpacity
        style={[styles.btnSubmeter, estrelasGeral === 0 && styles.btnSubmeterDisabled]}
        onPress={submeter}
        disabled={estrelasGeral === 0}>
        <Text style={styles.btnSubmeterText}>⭐ Submeter avaliação</Text>
      </TouchableOpacity>

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

  notaBloqueio: { backgroundColor: '#fff0f0', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#ffcdd2' },
  notaBloqueioTexto: { fontSize: 13, color: '#c0392b', lineHeight: 20 },

  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 },
  cardGreen: { backgroundColor: '#e8f5f0', borderRadius: 16, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: '#b2dfcf', alignItems: 'center' },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#aaa', letterSpacing: 1, marginBottom: 12 },
  avaliacaoDesc: { fontSize: 14, color: '#555', marginBottom: 12 },
  criterioLabel: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8 },

  estrelasRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  estrela: { fontSize: 36, color: '#e0e0e0' },
  estrelaActiva: { color: '#f59e0b' },
  erroEstrelas: { fontSize: 12, color: '#c0392b', marginTop: 4 },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0ea', borderWidth: 1, borderColor: '#e0e0da' },
  chipActive: { backgroundColor: '#1D9E75', borderColor: '#1D9E75' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: '600' },

  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 14, backgroundColor: '#f9f9f7' },

  nota: { backgroundColor: '#fef9e7', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#fde68a' },
  notaTexto: { fontSize: 13, color: '#b45309', lineHeight: 20 },

  btnSubmeter: { padding: 16, borderRadius: 12, backgroundColor: '#1D9E75', alignItems: 'center', marginBottom: 12 },
  btnSubmeterDisabled: { backgroundColor: '#ccc' },
  btnSubmeterText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  successIcon: { fontSize: 48, marginBottom: 12 },
  successTitulo: { fontSize: 22, fontWeight: 'bold', color: '#1D9E75', marginBottom: 8 },
  successDesc: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  btnVoltar: { padding: 14, borderRadius: 12, backgroundColor: '#1D9E75', alignItems: 'center', width: '100%' },
  btnVoltarText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});