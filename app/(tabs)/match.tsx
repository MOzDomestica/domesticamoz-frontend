import { encontrarMatches } from '@/constants/constants/matching';
import { getLingua, t } from '@/constants/i18n';
import { supabase } from '@/constants/supabase';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Match {
  id: string;
  score_compatibilidade: number;
  estado: string;
  perfis_trabalhadoras: {
    id: string;
    tipo_trabalhadora: string;
    anos_experiencia: number;
    regime_trabalho: string;
    salario_minimo: number | null;
    salario_maximo: number | null;
    avaliacao_media: number | null;
    total_avaliacoes: number | null;
    idiomas: string[];
    descricao: string | null;
    utilizadores: { id: string; nome_completo: string; numero_telemovel: string } | null;
  };
  anuncios_empregadores: {
    id: string;
    descricao_interna: string;
    tipo_trabalhadora: string;
  };
}

export default function MatchesScreen() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculando, setCalculando] = useState(false);
  const [anuncioId, setAnuncioId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [, setLinguaActual] = useState('pt');

  useFocusEffect(
    useCallback(() => {
      getLingua().then(l => setLinguaActual(l));
    }, [])
  );

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);
    setErro(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: anuncios } = await supabase
        .from('anuncios_empregadores')
        .select('id')
        .eq('utilizador_id', user.id)
        .eq('estado', 'activo')
        .order('criado_em', { ascending: false })
        .limit(1);

      if (!anuncios || anuncios.length === 0) {
        setErro(t('sem_anuncios'));
        setLoading(false);
        return;
      }

      const idAnuncio = anuncios[0].id;
      setAnuncioId(idAnuncio);
      await carregarMatches(idAnuncio);
    } catch (e) {
      setErro(t('erro_carregar'));
    } finally {
      setLoading(false);
    }
  }

  async function carregarMatches(idAnuncio: string) {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        perfis_trabalhadoras (
          id, tipo_trabalhadora, anos_experiencia, regime_trabalho,
          salario_minimo, salario_maximo, avaliacao_media, total_avaliacoes,
          idiomas, descricao,
          utilizadores ( id, nome_completo, numero_telemovel )
        ),
        anuncios_empregadores (
          id, descricao_interna, tipo_trabalhadora
        )
      `)
      .eq('anuncio_id', idAnuncio)
      .order('score_compatibilidade', { ascending: false });

    if (error) {
      Alert.alert(t('erro'), error.message);
      return;
    }
    if (data) setMatches(data as Match[]);
  }

  async function calcularNovosMatches() {
    if (!anuncioId) return;
    setCalculando(true);
    setErro(null);
    try {
      await encontrarMatches(anuncioId);
      await carregarMatches(anuncioId);
    } catch (e: any) {
      Alert.alert(t('erro'), e?.message ?? JSON.stringify(e));
      setErro(t('erro_calcular_matches'));
    } finally {
      setCalculando(false);
    }
  }

  async function contactar(match: Match) {
    if (!userId) return;
    try {
      const trabalhadoraUserId = match.perfis_trabalhadoras?.utilizadores?.id;
      if (!trabalhadoraUserId) {
        Alert.alert(t('erro'), t('erro_encontrar_trabalhadora'));
        return;
      }

      const { data: conversaExistente } = await supabase
        .from('conversas')
        .select('id')
        .eq('match_id', match.id)
        .single();

      let conversaId: string;

      if (conversaExistente) {
        conversaId = conversaExistente.id;
      } else {
        const { data: novaConversa, error } = await supabase
          .from('conversas')
          .insert({
            match_id: match.id,
            trabalhadora_id: trabalhadoraUserId,
            empregador_id: userId,
          })
          .select('id')
          .single();

        if (error || !novaConversa) {
          Alert.alert(t('erro'), error?.message ?? t('erro_criar_conversa'));
          return;
        }

        conversaId = novaConversa.id;

        await supabase
          .from('matches')
          .update({ estado: 'contactado' })
          .eq('id', match.id);
      }

      router.push(`/(tabs)/messages?conversa_id=${conversaId}` as any);
    } catch (e: any) {
      Alert.alert(t('erro'), e?.message ?? t('erro_contactar'));
    }
  }

  function corScore(score: number) {
    if (score >= 80) return '#1D9E75';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  }

  function labelScore(score: number) {
    if (score >= 80) return t('excelente');
    if (score >= 60) return t('bom');
    return t('razoavel');
  }

  function iniciaisNome(nome: string | undefined) {
    if (!nome) return '?';
    return nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  function formatSalario(min: number | null, max: number | null) {
    if (!min && !max) return t('a_negociar');
    if (min && max) return `${min.toLocaleString()} – ${max.toLocaleString()} MZN`;
    if (min) return `${t('a_partir_de')} ${min.toLocaleString()} MZN`;
    return `${t('ate')} ${max!.toLocaleString()} MZN`;
  }

  if (loading) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1D9E75" />
        <Text style={styles.loadingText}>{t('carregando')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>{t('matches')}</Text>
      <Text style={styles.subtitulo}>{t('matches_desc')}</Text>

      <TouchableOpacity
        style={[styles.btnCalcular, calculando && styles.btnDisabled]}
        onPress={calcularNovosMatches}
        disabled={calculando || !anuncioId}>
        {calculando
          ? <ActivityIndicator size="small" color="#fff" />
          : <Text style={styles.btnCalcularText}>🔍 {t('procurar_matches')}</Text>
        }
      </TouchableOpacity>

      {erro && (
        <View style={styles.erroBox}>
          <Text style={styles.erroText}>{erro}</Text>
        </View>
      )}

      {matches.length === 0 && !erro && (
        <View style={styles.vazio}>
          <Text style={styles.vazioBig}>🔍</Text>
          <Text style={styles.vazioText}>{t('sem_matches')}</Text>
          <Text style={styles.vazioSub}>{t('sem_matches_desc')}</Text>
        </View>
      )}

      {matches.map((match) => {
        const trabalhadora = match.perfis_trabalhadoras;
        const nome = trabalhadora?.utilizadores?.nome_completo ?? 'Trabalhadora';
        const score = match.score_compatibilidade ?? 0;
        return (
          <TouchableOpacity
            key={match.id}
            style={styles.card}
            onPress={() => router.push(`/worker/${trabalhadora?.id}` as any)}>

            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{iniciaisNome(nome)}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardNome}>{nome}</Text>
                <Text style={styles.cardTipo}>{trabalhadora?.tipo_trabalhadora?.replace(/_/g, ' ')}</Text>
                <Text style={styles.cardRegime}>
                  {trabalhadora?.regime_trabalho === 'residente'
                    ? '🏠 ' + t('residente')
                    : trabalhadora?.regime_trabalho === 'ambos'
                    ? '🔄 ' + t('ambos')
                    : '🚶 ' + t('nao_residente')}
                </Text>
              </View>
              <View style={[styles.scoreBadge, { backgroundColor: corScore(score) }]}>
                <Text style={styles.scoreNum}>{Math.round(score)}%</Text>
                <Text style={styles.scoreLabel}>{labelScore(score)}</Text>
              </View>
            </View>

            <View style={styles.cardDetalhes}>
              <View style={styles.detalheItem}>
                <Text style={styles.detalheIcon}>⭐</Text>
                <Text style={styles.detalheTexto}>
                  {trabalhadora?.avaliacao_media
                    ? `${trabalhadora.avaliacao_media} (${trabalhadora.total_avaliacoes} ${t('avaliacoes')})`
                    : t('sem_avaliacoes')}
                </Text>
              </View>
              <View style={styles.detalheItem}>
                <Text style={styles.detalheIcon}>💼</Text>
                <Text style={styles.detalheTexto}>{trabalhadora?.anos_experiencia ?? 0} {t('anos_exp')}</Text>
              </View>
              <View style={styles.detalheItem}>
                <Text style={styles.detalheIcon}>💰</Text>
                <Text style={styles.detalheTexto}>
                  {formatSalario(trabalhadora?.salario_minimo ?? null, trabalhadora?.salario_maximo ?? null)}
                </Text>
              </View>
            </View>

            {trabalhadora?.descricao && (
              <Text style={styles.descricao} numberOfLines={2}>{trabalhadora.descricao}</Text>
            )}

            <View style={styles.barraFundo}>
              <View style={[styles.barraPreenchida, {
                width: `${score}%` as any,
                backgroundColor: corScore(score)
              }]} />
            </View>
            <Text style={styles.barraTexto}>{t('compatibilidade')}: {Math.round(score)}%</Text>

            <View style={styles.cardBtns}>
              <TouchableOpacity style={styles.btnRecusar}>
                <Text style={styles.btnRecusarText}>✕ {t('recusar')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnContactar}
                onPress={(e) => {
                  e.stopPropagation();
                  contactar(match);
                }}>
                <Text style={styles.btnContactarText}>💬 {t('contactar')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );
      })}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f0' },
  content: { padding: 20, paddingTop: 60 },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#888', fontSize: 14 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  subtitulo: { fontSize: 14, color: '#888', marginBottom: 20 },
  btnCalcular: { backgroundColor: '#1D9E75', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 20 },
  btnDisabled: { backgroundColor: '#aaa' },
  btnCalcularText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  erroBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 16 },
  erroText: { color: '#EF4444', fontSize: 14 },
  vazio: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  vazioBig: { fontSize: 48 },
  vazioText: { fontSize: 18, fontWeight: '600', color: '#444' },
  vazioSub: { fontSize: 14, color: '#aaa', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#1D9E75', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: 16, fontWeight: '700', color: '#222' },
  cardTipo: { fontSize: 13, color: '#666', textTransform: 'capitalize', marginTop: 2 },
  cardRegime: { fontSize: 12, color: '#888', marginTop: 2 },
  scoreBadge: { borderRadius: 10, padding: 8, alignItems: 'center', minWidth: 60 },
  scoreNum: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  scoreLabel: { color: '#fff', fontSize: 11, fontWeight: '600' },
  cardDetalhes: { flexDirection: 'row', gap: 12, marginBottom: 10, flexWrap: 'wrap' },
  detalheItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detalheIcon: { fontSize: 13 },
  detalheTexto: { fontSize: 12, color: '#666' },
  descricao: { fontSize: 13, color: '#888', marginBottom: 10, lineHeight: 18 },
  barraFundo: { height: 6, backgroundColor: '#e0e0e0', borderRadius: 3, marginBottom: 4, overflow: 'hidden' },
  barraPreenchida: { height: 6, borderRadius: 3 },
  barraTexto: { fontSize: 11, color: '#aaa', marginBottom: 12 },
  cardBtns: { flexDirection: 'row', gap: 8 },
  btnRecusar: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  btnRecusarText: { fontSize: 13, color: '#888', fontWeight: '600' },
  btnContactar: { flex: 2, padding: 10, borderRadius: 10, backgroundColor: '#1D9E75', alignItems: 'center' },
  btnContactarText: { fontSize: 13, color: '#fff', fontWeight: '700' },
});