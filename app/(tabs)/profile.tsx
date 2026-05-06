import { getLingua, t } from '@/constants/i18n';
import { supabase } from '@/constants/supabase';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const SERVICOS_OPCOES = [
  'Limpeza geral', 'Cozinha', 'Lavar roupa', 'Passar roupa',
  'Cuidar de crianças', 'Cuidar de idosos', 'Jardinagem', 'Condução',
];

const IDIOMAS_OPCOES = ['Português', 'Changana', 'Ronga', 'Sena', 'Ndau', 'Inglês'];

const TITULOS = [
  'Empregada doméstica', 'Cozinheira', 'Babá', 'Diarista',
  'Empregada + Cozinheira', 'Cuidadora de idosos',
];

export default function ProfileScreen() {
  const router = useRouter();
  const [etapa, setEtapa] = useState(1);
  const [loading, setLoading] = useState(false);
  const [, setLinguaActual] = useState('pt');

  const [nome, setNome] = useState('');
  const [provincia, setProvincia] = useState('');
  const [distrito, setDistrito] = useState('');
  const [bairro, setBairro] = useState('');
  const [idiomas, setIdiomas] = useState<string[]>([]);

  const [servicos, setServicos] = useState<string[]>([]);
  const [experiencia, setExperiencia] = useState('');
  const [tipoTitulo, setTipoTitulo] = useState('');

  const [regime, setRegime] = useState<'residente' | 'nao_residente' | 'ambos'>('nao_residente');
  const [horarioTipo, setHorarioTipo] = useState<'fixo' | 'flexivel'>('fixo');
  const [horarioEntrada, setHorarioEntrada] = useState('');
  const [horarioSaida, setHorarioSaida] = useState('');
  const [salarioMin, setSalarioMin] = useState('');
  const [salarioMax, setSalarioMax] = useState('');
  const [salarioNegociavel, setSalarioNegociavel] = useState(false);
  const [quartoIndividual, setQuartoIndividual] = useState(false);
  const [refeicoes, setRefeicoes] = useState<'todas' | 'negociar' | 'nenhuma'>('negociar');
  const [saidaFimSemana, setSaidaFimSemana] = useState(false);

  const [deslocacao, setDeslocacao] = useState(false);
  const [areaDeslocacao, setAreaDeslocacao] = useState('');
  const [aceitaAnimais, setAceitaAnimais] = useState<'sim' | 'nao' | 'negociar'>('negociar');
  const [detergenteRoupa, setDetergenteRoupa] = useState<'empregador' | 'proprio' | 'negociar'>('negociar');
  const [detergenteLimpeza, setDetergenteLimpeza] = useState<'empregador' | 'proprio' | 'negociar'>('empregador');
  const [disponibilidade, setDisponibilidade] = useState<'imediata' | '1semana' | '1mes'>('imediata');
  const [condicaoSaude, setCondicaoSaude] = useState<'nenhuma' | 'prefiro_nao' | 'sim'>('nenhuma');
  const [descricaoSaude, setDescricaoSaude] = useState('');

  useFocusEffect(
    useCallback(() => {
      getLingua().then(l => setLinguaActual(l));
    }, [])
  );

  const toggleItem = (item: string, lista: string[], setLista: (v: string[]) => void) => {
    setLista(lista.includes(item) ? lista.filter(i => i !== item) : [...lista, item]);
  };

  const mapearTitulo = (titulo: string) => {
    switch (titulo) {
      case 'Empregada doméstica': return 'empregada_domestica';
      case 'Cozinheira': return 'cozinheira_fixa';
      case 'Babá': return 'baba';
      case 'Diarista': return 'diarista';
      case 'Empregada + Cozinheira': return 'cozinheira_diarista';
      case 'Cuidadora de idosos': return 'empregada_domestica';
      default: return 'empregada_domestica';
    }
  };

  const mapearDetergente = (val: string) => {
    if (val === 'empregador') return 'fornece';
    if (val === 'proprio') return 'traz_seus';
    return 'negociar';
  };

  const mapearRefeicoes = (val: string) => {
    if (val === 'todas') return 'oferece';
    if (val === 'nenhuma') return 'nao_oferece';
    return 'negociar';
  };

  const guardarPerfil = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert(t('erro'), t('sessao_expirada'));
        router.push('/(tabs)/explore');
        return;
      }

      await supabase.from('utilizadores').update({
        nome_completo: nome,
        actualizado_em: new Date().toISOString(),
      }).eq('id', user.id);

      const { error } = await supabase.from('perfis_trabalhadoras').upsert({
        utilizador_id: user.id,
        tipo_trabalhadora: mapearTitulo(tipoTitulo),
        regime_trabalho: regime,
        hora_entrada: horarioEntrada || null,
        hora_saida: horarioSaida || null,
        salario_minimo: salarioMin ? parseInt(salarioMin) : null,
        salario_maximo: salarioMax ? parseInt(salarioMax) : null,
        quarto_individual: quartoIndividual,
        refeicoes_opcao: mapearRefeicoes(refeicoes),
        aceita_animais: aceitaAnimais === 'sim' ? true : aceitaAnimais === 'nao' ? false : null,
        detergente_limpeza_opcao: mapearDetergente(detergenteLimpeza),
        detergente_roupa_opcao: mapearDetergente(detergenteRoupa),
        idiomas: idiomas,
        actualizado_em: new Date().toISOString(),
      });

      if (error) {
        Alert.alert(t('erro'), t('erro_guardar_perfil') + error.message);
      } else {
        Alert.alert('✅ ' + t('perfil_guardado'), t('perfil_visivel'), [
          { text: t('ver_matches'), onPress: () => router.push('/(tabs)/match') }
        ]);
      }
    } catch (e) {
      Alert.alert(t('erro'), t('sem_ligacao'));
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f0' }}>
      <View style={styles.progressBar}>
        {[1, 2, 3, 4].map(n => (
          <View key={n} style={styles.progressStep}>
            <View style={[styles.progressDot, etapa >= n && styles.progressDotActive]}>
              <Text style={[styles.progressNum, etapa >= n && styles.progressNumActive]}>{n}</Text>
            </View>
            {n < 4 && <View style={[styles.progressLine, etapa > n && styles.progressLineActive]} />}
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.container}>

        {etapa === 1 && (
          <View>
            <Text style={styles.etapaTitulo}>{t('info_pessoal')}</Text>
            <Text style={styles.etapaDesc}>{t('info_pessoal_desc')}</Text>

            <Text style={styles.label}>{t('nome_completo')}</Text>
            <TextInput style={styles.input} placeholder="Ex: Ana Maria Cossa" value={nome} onChangeText={setNome} />

            <Text style={styles.label}>{t('provincia')}</Text>
            <TextInput style={styles.input} placeholder="Ex: Maputo" value={provincia} onChangeText={setProvincia} />

            <Text style={styles.label}>{t('distrito')}</Text>
            <TextInput style={styles.input} placeholder="Ex: KaMpfumu" value={distrito} onChangeText={setDistrito} />

            <Text style={styles.label}>{t('bairro')}</Text>
            <TextInput style={styles.input} placeholder="Ex: Maxaquene" value={bairro} onChangeText={setBairro} />

            <Text style={styles.label}>{t('idiomas_que_fala')}</Text>
            <View style={styles.chipGrid}>
              {IDIOMAS_OPCOES.map(i => (
                <TouchableOpacity key={i} style={[styles.chip, idiomas.includes(i) && styles.chipActive]}
                  onPress={() => toggleItem(i, idiomas, setIdiomas)}>
                  <Text style={[styles.chipText, idiomas.includes(i) && styles.chipTextActive]}>{i}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {etapa === 2 && (
          <View>
            <Text style={styles.etapaTitulo}>{t('servicos_experiencia')}</Text>
            <Text style={styles.etapaDesc}>{t('servicos_experiencia_desc')}</Text>

            <Text style={styles.label}>{t('titulo_perfil')}</Text>
            <Text style={styles.labelDesc}>{t('titulo_perfil_desc')}</Text>
            <View style={styles.chipGrid}>
              {TITULOS.map(titulo => (
                <TouchableOpacity key={titulo} style={[styles.chip, tipoTitulo === titulo && styles.chipActive]}
                  onPress={() => setTipoTitulo(titulo)}>
                  <Text style={[styles.chipText, tipoTitulo === titulo && styles.chipTextActive]}>{titulo}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t('servicos_oferece')}</Text>
            <Text style={styles.labelDesc}>{t('seleccione_todos')}</Text>
            <View style={styles.chipGrid}>
              {SERVICOS_OPCOES.map(s => (
                <TouchableOpacity key={s} style={[styles.chip, servicos.includes(s) && styles.chipActive]}
                  onPress={() => toggleItem(s, servicos, setServicos)}>
                  <Text style={[styles.chipText, servicos.includes(s) && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t('anos_experiencia')}</Text>
            <View style={styles.chipGrid}>
              {[t('menos_1_ano'), t('1_2_anos'), t('3_5_anos'), t('6_10_anos'), t('mais_10_anos')].map(e => (
                <TouchableOpacity key={e} style={[styles.chip, experiencia === e && styles.chipActive]}
                  onPress={() => setExperiencia(e)}>
                  <Text style={[styles.chipText, experiencia === e && styles.chipTextActive]}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {etapa === 3 && (
          <View>
            <Text style={styles.etapaTitulo}>{t('regime_condicoes')}</Text>
            <Text style={styles.etapaDesc}>{t('regime_condicoes_desc')}</Text>

            <Text style={styles.label}>{t('regime_trabalho')}</Text>
            {[
              { val: 'nao_residente', titulo: t('nao_residente'), desc: t('nao_residente_desc') },
              { val: 'residente', titulo: t('residente'), desc: t('residente_desc') },
              { val: 'ambos', titulo: t('aceito_ambos'), desc: t('aceito_ambos_desc') },
            ].map(op => (
              <TouchableOpacity key={op.val}
                style={[styles.radioCard, regime === op.val && styles.radioCardActive]}
                onPress={() => setRegime(op.val as any)}>
                <View style={[styles.radio, regime === op.val && styles.radioActive]}>
                  {regime === op.val && <View style={styles.radioDot} />}
                </View>
                <View>
                  <Text style={[styles.radioTitulo, regime === op.val && styles.radioTituloActive]}>{op.titulo}</Text>
                  <Text style={styles.radioDesc}>{op.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <Text style={[styles.label, { marginTop: 16 }]}>{t('tipo_horario')}</Text>
            <View style={styles.toggleRow}>
              {(['fixo', 'flexivel'] as const).map(h => (
                <TouchableOpacity key={h} style={[styles.toggleBtn, horarioTipo === h && styles.toggleBtnActive]}
                  onPress={() => setHorarioTipo(h)}>
                  <Text style={[styles.toggleText, horarioTipo === h && styles.toggleTextActive]}>
                    {h === 'fixo' ? t('horario_fixo') : t('horario_flexivel')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {horarioTipo === 'fixo' && (
              <View style={styles.horarioRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t('entrada')}</Text>
                  <TextInput style={styles.input} placeholder="07:00" value={horarioEntrada} onChangeText={setHorarioEntrada} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t('saida')}</Text>
                  <TextInput style={styles.input} placeholder="17:00" value={horarioSaida} onChangeText={setHorarioSaida} />
                </View>
              </View>
            )}

            {horarioTipo === 'flexivel' && (
              <View style={styles.notaInfo}>
                <Text style={styles.notaInfoTexto}>💡 {t('horario_flexivel_nota')}</Text>
              </View>
            )}

            <Text style={[styles.label, { marginTop: 16 }]}>{t('salario_esperado')}</Text>
            <View style={styles.horarioRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{t('minimo')}</Text>
                <TextInput style={styles.input} placeholder="3500" keyboardType="numeric" value={salarioMin} onChangeText={setSalarioMin} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{t('maximo')}</Text>
                <TextInput style={styles.input} placeholder="6000" keyboardType="numeric" value={salarioMax} onChangeText={setSalarioMax} />
              </View>
            </View>
            <TouchableOpacity style={styles.checkRow} onPress={() => setSalarioNegociavel(!salarioNegociavel)}>
              <View style={[styles.checkbox, salarioNegociavel && styles.checkboxActive]}>
                {salarioNegociavel && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkLabel}>{t('salario_negociavel')}</Text>
            </TouchableOpacity>

            {(regime === 'residente' || regime === 'ambos') && (
              <View style={styles.cardGreen}>
                <Text style={styles.sectionLabelGreen}>{t('condicoes_residente')}</Text>
                <TouchableOpacity style={styles.checkRow} onPress={() => setQuartoIndividual(!quartoIndividual)}>
                  <View style={[styles.checkbox, quartoIndividual && styles.checkboxActive]}>
                    {quartoIndividual && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkLabel}>{t('exige_quarto')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.checkRow} onPress={() => setSaidaFimSemana(!saidaFimSemana)}>
                  <View style={[styles.checkbox, saidaFimSemana && styles.checkboxActive]}>
                    {saidaFimSemana && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkLabel}>{t('saida_fim_semana')}</Text>
                </TouchableOpacity>
                <Text style={[styles.label, { marginTop: 12 }]}>{t('refeicoes')}</Text>
                <View style={styles.chipGrid}>
                  {[
                    { val: 'todas', label: t('refeicoes_todas') },
                    { val: 'negociar', label: t('a_negociar') },
                    { val: 'nenhuma', label: t('refeicoes_nenhuma') },
                  ].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, refeicoes === op.val && styles.chipActive]}
                      onPress={() => setRefeicoes(op.val as any)}>
                      <Text style={[styles.chipText, refeicoes === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {etapa === 4 && (
          <View>
            <Text style={styles.etapaTitulo}>{t('condicoes_gerais')}</Text>
            <Text style={styles.etapaDesc}>{t('condicoes_gerais_desc')}</Text>

            <Text style={styles.label}>{t('deslocacao')}</Text>
            <TouchableOpacity style={styles.checkRow} onPress={() => setDeslocacao(!deslocacao)}>
              <View style={[styles.checkbox, deslocacao && styles.checkboxActive]}>
                {deslocacao && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkLabel}>{t('aceito_deslocacao')}</Text>
            </TouchableOpacity>
            {deslocacao && (
              <TextInput style={styles.input} placeholder={t('area_deslocacao_placeholder')} value={areaDeslocacao} onChangeText={setAreaDeslocacao} />
            )}

            <Text style={[styles.label, { marginTop: 16 }]}>{t('animais')}</Text>
            <View style={styles.chipGrid}>
              {[
                { val: 'sim', label: t('aceito') },
                { val: 'nao', label: t('nao_aceito') },
                { val: 'negociar', label: t('depende') }
              ].map(op => (
                <TouchableOpacity key={op.val} style={[styles.chip, aceitaAnimais === op.val && styles.chipActive]}
                  onPress={() => setAceitaAnimais(op.val as any)}>
                  <Text style={[styles.chipText, aceitaAnimais === op.val && styles.chipTextActive]}>{op.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>{t('detergente_limpeza')}</Text>
            <View style={styles.chipGrid}>
              {[
                { val: 'empregador', label: t('usa_empregador') },
                { val: 'proprio', label: t('traz_proprio') },
                { val: 'negociar', label: t('a_negociar') }
              ].map(op => (
                <TouchableOpacity key={op.val} style={[styles.chip, detergenteLimpeza === op.val && styles.chipActive]}
                  onPress={() => setDetergenteLimpeza(op.val as any)}>
                  <Text style={[styles.chipText, detergenteLimpeza === op.val && styles.chipTextActive]}>{op.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>{t('detergente_roupa')}</Text>
            <View style={styles.chipGrid}>
              {[
                { val: 'empregador', label: t('usa_empregador') },
                { val: 'proprio', label: t('traz_proprio') },
                { val: 'negociar', label: t('a_negociar') }
              ].map(op => (
                <TouchableOpacity key={op.val} style={[styles.chip, detergenteRoupa === op.val && styles.chipActive]}
                  onPress={() => setDetergenteRoupa(op.val as any)}>
                  <Text style={[styles.chipText, detergenteRoupa === op.val && styles.chipTextActive]}>{op.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>{t('disponibilidade')}</Text>
            <View style={styles.chipGrid}>
              {[
                { val: 'imediata', label: t('imediata') },
                { val: '1semana', label: t('em_1_semana') },
                { val: '1mes', label: t('em_1_mes') }
              ].map(op => (
                <TouchableOpacity key={op.val} style={[styles.chip, disponibilidade === op.val && styles.chipActive]}
                  onPress={() => setDisponibilidade(op.val as any)}>
                  <Text style={[styles.chipText, disponibilidade === op.val && styles.chipTextActive]}>{op.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.saudeCard}>
              <Text style={styles.saudeTitulo}>🏥 {t('condicao_saude')}</Text>
              <Text style={styles.saudeDesc}>{t('condicao_saude_desc')}</Text>
              {[
                { val: 'nenhuma', label: '✅ ' + t('saude_nenhuma') },
                { val: 'prefiro_nao', label: '🔒 ' + t('saude_prefiro_nao') },
                { val: 'sim', label: '💬 ' + t('saude_sim') },
              ].map(op => (
                <TouchableOpacity key={op.val}
                  style={[styles.saudeOpcao, condicaoSaude === op.val && styles.saudeOpcaoActive]}
                  onPress={() => setCondicaoSaude(op.val as any)}>
                  <View style={[styles.radio, condicaoSaude === op.val && styles.radioActive]}>
                    {condicaoSaude === op.val && <View style={styles.radioDot} />}
                  </View>
                  <Text style={[styles.saudeOpcaoText, condicaoSaude === op.val && styles.saudeOpcaoTextActive]}>{op.label}</Text>
                </TouchableOpacity>
              ))}
              {condicaoSaude === 'sim' && (
                <TextInput
                  style={[styles.input, { marginTop: 8, height: 80, textAlignVertical: 'top' }]}
                  placeholder={t('saude_descricao_placeholder')}
                  value={descricaoSaude}
                  onChangeText={setDescricaoSaude}
                  multiline
                />
              )}
              <Text style={styles.saudeNota}>🔒 {t('saude_nota')}</Text>
            </View>

            <View style={styles.nota}>
              <Text style={styles.notaTexto}>✅ {t('perfil_visivel_nota')}</Text>
            </View>
          </View>
        )}

        <View style={styles.navRow}>
          {etapa > 1 && (
            <TouchableOpacity style={styles.btnVoltar} onPress={() => setEtapa(etapa - 1)}>
              <Text style={styles.btnVoltarText}>← {t('anterior')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.btnAvancar, etapa === 1 && { flex: 1 }, loading && styles.btnDisabled]}
            disabled={loading}
            onPress={() => {
              if (etapa < 4) setEtapa(etapa + 1);
              else guardarPerfil();
            }}>
            <Text style={styles.btnAvancarText}>
              {loading ? t('carregando') : etapa === 4 ? '✓ ' + t('guardar_perfil') : t('seguinte')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 16 },
  progressBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingBottom: 16, backgroundColor: '#fff', paddingHorizontal: 32 },
  progressStep: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  progressDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center' },
  progressDotActive: { backgroundColor: '#1F8A70' },
  progressNum: { fontSize: 13, fontWeight: 'bold', color: '#aaa' },
  progressNumActive: { color: '#fff' },
  progressLine: { flex: 1, height: 2, backgroundColor: '#e0e0e0', marginHorizontal: 4 },
  progressLineActive: { backgroundColor: '#1F8A70' },
  etapaTitulo: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  etapaDesc: { fontSize: 14, color: '#888', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 4 },
  labelDesc: { fontSize: 12, color: '#aaa', marginBottom: 8, marginTop: -4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 14, backgroundColor: '#fff', marginBottom: 12 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0ea', borderWidth: 1, borderColor: '#e0e0da' },
  chipActive: { backgroundColor: '#1F8A70', borderColor: '#1F8A70' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  radioCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 12, backgroundColor: '#fff', marginBottom: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  radioCardActive: { backgroundColor: '#e8f5f0', borderColor: '#1F8A70' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  radioActive: { borderColor: '#1F8A70' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1F8A70' },
  radioTitulo: { fontSize: 15, fontWeight: '600', color: '#333' },
  radioTituloActive: { color: '#1F8A70' },
  radioDesc: { fontSize: 12, color: '#888', marginTop: 2 },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  toggleBtn: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#fff' },
  toggleBtnActive: { backgroundColor: '#1F8A70', borderColor: '#1F8A70' },
  toggleText: { fontSize: 13, color: '#555', fontWeight: '600' },
  toggleTextActive: { color: '#fff' },
  horarioRow: { flexDirection: 'row', gap: 12 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: '#1F8A70', borderColor: '#1F8A70' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  checkLabel: { fontSize: 14, color: '#444' },
  cardGreen: { backgroundColor: '#e8f5f0', borderRadius: 16, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#b2dfcf' },
  sectionLabelGreen: { fontSize: 13, fontWeight: '700', color: '#1F8A70', marginBottom: 12 },
  notaInfo: { backgroundColor: '#EBF4FF', borderRadius: 10, padding: 12, marginBottom: 8 },
  notaInfoTexto: { fontSize: 13, color: '#185FA5' },
  nota: { backgroundColor: '#e8f5f0', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#b2dfcf' },
  notaTexto: { fontSize: 13, color: '#1F8A70', lineHeight: 20 },
  navRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  btnVoltar: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#fff' },
  btnVoltarText: { fontSize: 15, color: '#555', fontWeight: '600' },
  btnAvancar: { flex: 2, padding: 14, borderRadius: 12, backgroundColor: '#1F8A70', alignItems: 'center' },
  btnDisabled: { backgroundColor: '#aaa' },
  btnAvancarText: { fontSize: 15, color: '#fff', fontWeight: '700' },
  saudeCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e0e0da' },
  saudeTitulo: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 8 },
  saudeDesc: { fontSize: 13, color: '#888', marginBottom: 12, lineHeight: 20 },
  saudeOpcao: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, marginBottom: 6, backgroundColor: '#f9f9f7' },
  saudeOpcaoActive: { backgroundColor: '#e8f5f0' },
  saudeOpcaoText: { fontSize: 14, color: '#444', flex: 1 },
  saudeOpcaoTextActive: { color: '#1F8A70', fontWeight: '600' },
  saudeNota: { fontSize: 12, color: '#aaa', marginTop: 8, fontStyle: 'italic' },
});