import { getLingua, t } from '@/constants/i18n';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ReviewScreen() {
  const router = useRouter();
  const [, setLinguaActual] = useState('pt');

  const [jaAvaliou] = useState(false);
  const [avaliacaoSubmetida, setAvaliacaoSubmetida] = useState(false);

  const [estrelasGeral, setEstrelasGeral] = useState(0);
  const [estrelasPontualidade, setEstrelasPontualidade] = useState(0);
  const [estrelasLimpeza, setEstrelasLimpeza] = useState(0);
  const [estrelasAtitude, setEstrelasAtitude] = useState(0);
  const [comentario, setComentario] = useState('');
  const [recomenda, setRecomenda] = useState('');

  useFocusEffect(
    useCallback(() => {
      getLingua().then(l => setLinguaActual(l));
    }, [])
  );

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

  if (jaAvaliou || avaliacaoSubmetida) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('voltar')}</Text>
        </TouchableOpacity>
        <View style={styles.cardGreen}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitulo}>{t('avaliacao_submetida')}</Text>
          <Text style={styles.successDesc}>{t('avaliacao_submetida_desc')}</Text>
          <TouchableOpacity style={styles.btnVoltar} onPress={() => router.push('/(tabs)/match')}>
            <Text style={styles.btnVoltarText}>{t('ver_novos_matches')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← {t('voltar')}</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>{t('avaliacao')}</Text>
      <Text style={styles.subtitulo}>{t('contrato_terminou')}</Text>

      <View style={styles.notaBloqueio}>
        <Text style={styles.notaBloqueioTexto}>⚠️ {t('conta_bloqueada_avaliacao')}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>{t('avaliacao_geral').toUpperCase()}</Text>
        <Text style={styles.avaliacaoDesc}>{t('avaliacao_geral_desc')}</Text>
        <Estrelas valor={estrelasGeral} onChange={setEstrelasGeral} />
        {estrelasGeral === 0 && <Text style={styles.erroEstrelas}>* {t('obrigatorio')}</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>{t('criterios_especificos').toUpperCase()}</Text>

        <Text style={styles.criterioLabel}>{t('pontualidade')}</Text>
        <Estrelas valor={estrelasPontualidade} onChange={setEstrelasPontualidade} />

        <Text style={[styles.criterioLabel, { marginTop: 16 }]}>{t('qualidade_trabalho')}</Text>
        <Estrelas valor={estrelasLimpeza} onChange={setEstrelasLimpeza} />

        <Text style={[styles.criterioLabel, { marginTop: 16 }]}>{t('atitude_comunicacao')}</Text>
        <Estrelas valor={estrelasAtitude} onChange={setEstrelasAtitude} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>{t('recomendacao').toUpperCase()}</Text>
        <Text style={styles.avaliacaoDesc}>{t('recomendacao_desc')}</Text>
        <View style={styles.chipGrid}>
          {[
            { val: 'sim', label: '👍 ' + t('sim_recomendo') },
            { val: 'nao', label: '👎 ' + t('nao_recomendo') },
            { val: 'talvez', label: '🤔 ' + t('talvez') },
          ].map(op => (
            <TouchableOpacity key={op.val}
              style={[styles.chip, recomenda === op.val && styles.chipActive]}
              onPress={() => setRecomenda(op.val)}>
              <Text style={[styles.chipText, recomenda === op.val && styles.chipTextActive]}>{op.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>{t('comentario_opcional').toUpperCase()}</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          placeholder={t('comentario_placeholder')}
          value={comentario}
          onChangeText={setComentario}
          multiline
        />
      </View>

      <View style={styles.nota}>
        <Text style={styles.notaTexto}>🔒 {t('nota_avaliacao_mutua')}</Text>
      </View>

      <TouchableOpacity
        style={[styles.btnSubmeter, estrelasGeral === 0 && styles.btnSubmeterDisabled]}
        onPress={submeter}
        disabled={estrelasGeral === 0}>
        <Text style={styles.btnSubmeterText}>⭐ {t('submeter_avaliacao')}</Text>
      </TouchableOpacity>

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
  chipActive: { backgroundColor: '#1F8A70', borderColor: '#1F8A70' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 14, backgroundColor: '#f9f9f7' },
  nota: { backgroundColor: '#fef9e7', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#fde68a' },
  notaTexto: { fontSize: 13, color: '#b45309', lineHeight: 20 },
  btnSubmeter: { padding: 16, borderRadius: 12, backgroundColor: '#1F8A70', alignItems: 'center', marginBottom: 12 },
  btnSubmeterDisabled: { backgroundColor: '#ccc' },
  btnSubmeterText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  successIcon: { fontSize: 48, marginBottom: 12 },
  successTitulo: { fontSize: 22, fontWeight: 'bold', color: '#1F8A70', marginBottom: 8 },
  successDesc: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  btnVoltar: { padding: 14, borderRadius: 12, backgroundColor: '#1F8A70', alignItems: 'center', width: '100%' },
  btnVoltarText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});