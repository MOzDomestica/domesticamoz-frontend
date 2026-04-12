import { supabase } from '@/constants/supabase';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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

  // Etapa 1
  const [nome, setNome] = useState('');
  const [provincia, setProvincia] = useState('');
  const [distrito, setDistrito] = useState('');
  const [bairro, setBairro] = useState('');
  const [idiomas, setIdiomas] = useState<string[]>([]);

  // Etapa 2
  const [servicos, setServicos] = useState<string[]>([]);
  const [experiencia, setExperiencia] = useState('');
  const [tipoTitulo, setTipoTitulo] = useState('');

  // Etapa 3
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

  // Etapa 4
  const [deslocacao, setDeslocacao] = useState(false);
  const [areaDeslocacao, setAreaDeslocacao] = useState('');
  const [aceitaAnimais, setAceitaAnimais] = useState<'sim' | 'nao' | 'negociar'>('negociar');
  const [detergenteRoupa, setDetergenteRoupa] = useState<'empregador' | 'proprio' | 'negociar'>('negociar');
  const [detergenteLimpeza, setDetergenteLimpeza] = useState<'empregador' | 'proprio' | 'negociar'>('empregador');
  const [disponibilidade, setDisponibilidade] = useState<'imediata' | '1semana' | '1mes'>('imediata');
  const [condicaoSaude, setCondicaoSaude] = useState<'nenhuma' | 'prefiro_nao' | 'sim'>('nenhuma');
  const [descricaoSaude, setDescricaoSaude] = useState('');

  const toggleItem = (item: string, lista: string[], setLista: (v: string[]) => void) => {
    setLista(lista.includes(item) ? lista.filter(i => i !== item) : [...lista, item]);
  };

  const guardarPerfil = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Erro', 'Sessão expirada. Por favor entre novamente.');
        router.push('/(tabs)/explore');
        return;
      }

      await supabase.from('utilizadores').update({
        nome_completo: nome,
        actualizado_em: new Date().toISOString(),
      }).eq('id', user.id);

      const { error } = await supabase.from('perfis_trabalhadoras').upsert({
        utilizador_id: user.id,
        tipo_trabalhadora: tipoTitulo,
        regime_trabalho: regime,
        hora_entrada: horarioEntrada || null,
        hora_saida: horarioSaida || null,
        salario_minimo: salarioMin ? parseInt(salarioMin) : null,
        salario_maximo: salarioMax ? parseInt(salarioMax) : null,
        quarto_individual: quartoIndividual,
        refeicoes_opcao: refeicoes,
        aceita_animais: aceitaAnimais === 'sim' ? true : aceitaAnimais === 'nao' ? false : null,
        detergente_limpeza_opcao: detergenteLimpeza,
        detergente_roupa_opcao: detergenteRoupa,
        idiomas: idiomas,
        actualizado_em: new Date().toISOString(),
      });

      if (error) {
        Alert.alert('Erro', 'Não foi possível guardar o perfil: ' + error.message);
      } else {
        Alert.alert('✅ Perfil guardado!', 'O seu perfil está visível para empregadores.', [
          { text: 'Ver matches', onPress: () => router.push('/(tabs)/match') }
        ]);
      }
    } catch (e) {
      Alert.alert('Erro', 'Sem ligação ao servidor');
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f0' }}>

      {/* BARRA DE PROGRESSO */}
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

        {/* ── ETAPA 1: INFO PESSOAL ── */}
        {etapa === 1 && (
          <View>
            <Text style={styles.etapaTitulo}>Informação pessoal</Text>
            <Text style={styles.etapaDesc}>Diga-nos quem é e onde está</Text>

            <Text style={styles.label}>Nome completo</Text>
            <TextInput style={styles.input} placeholder="Ex: Ana Maria Cossa" value={nome} onChangeText={setNome} />

            <Text style={styles.label}>Província</Text>
            <TextInput style={styles.input} placeholder="Ex: Maputo" value={provincia} onChangeText={setProvincia} />

            <Text style={styles.label}>Distrito</Text>
            <TextInput style={styles.input} placeholder="Ex: KaMpfumu" value={distrito} onChangeText={setDistrito} />

            <Text style={styles.label}>Bairro</Text>
            <TextInput style={styles.input} placeholder="Ex: Maxaquene" value={bairro} onChangeText={setBairro} />

            <Text style={styles.label}>Idiomas que fala</Text>
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

        {/* ── ETAPA 2: SERVIÇOS ── */}
        {etapa === 2 && (
          <View>
            <Text style={styles.etapaTitulo}>Serviços e experiência</Text>
            <Text style={styles.etapaDesc}>O que sabe fazer e como se apresenta</Text>

            <Text style={styles.label}>Título do seu perfil</Text>
            <Text style={styles.labelDesc}>Este título aparece no topo do seu perfil</Text>
            <View style={styles.chipGrid}>
              {TITULOS.map(t => (
                <TouchableOpacity key={t} style={[styles.chip, tipoTitulo === t && styles.chipActive]}
                  onPress={() => setTipoTitulo(t)}>
                  <Text style={[styles.chipText, tipoTitulo === t && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Serviços que oferece</Text>
            <Text style={styles.labelDesc}>Seleccione todos os que se aplicam</Text>
            <View style={styles.chipGrid}>
              {SERVICOS_OPCOES.map(s => (
                <TouchableOpacity key={s} style={[styles.chip, servicos.includes(s) && styles.chipActive]}
                  onPress={() => toggleItem(s, servicos, setServicos)}>
                  <Text style={[styles.chipText, servicos.includes(s) && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Anos de experiência</Text>
            <View style={styles.chipGrid}>
              {['Menos de 1 ano', '1-2 anos', '3-5 anos', '6-10 anos', 'Mais de 10 anos'].map(e => (
                <TouchableOpacity key={e} style={[styles.chip, experiencia === e && styles.chipActive]}
                  onPress={() => setExperiencia(e)}>
                  <Text style={[styles.chipText, experiencia === e && styles.chipTextActive]}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── ETAPA 3: REGIME ── */}
        {etapa === 3 && (
          <View>
            <Text style={styles.etapaTitulo}>Regime e condições</Text>
            <Text style={styles.etapaDesc}>Como prefere trabalhar e quanto espera ganhar</Text>

            <Text style={styles.label}>Regime de trabalho</Text>
            {[
              { val: 'nao_residente', titulo: 'Não residente', desc: 'Entra e sai no mesmo dia' },
              { val: 'residente', titulo: 'Residente', desc: 'Dorme na casa do empregador' },
              { val: 'ambos', titulo: 'Aceito os dois', desc: 'Flexível conforme oportunidade' },
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

            <Text style={[styles.label, { marginTop: 16 }]}>Tipo de horário</Text>
            <View style={styles.toggleRow}>
              {(['fixo', 'flexivel'] as const).map(h => (
                <TouchableOpacity key={h} style={[styles.toggleBtn, horarioTipo === h && styles.toggleBtnActive]}
                  onPress={() => setHorarioTipo(h)}>
                  <Text style={[styles.toggleText, horarioTipo === h && styles.toggleTextActive]}>
                    {h === 'fixo' ? 'Horário fixo' : 'Horário flexível'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {horarioTipo === 'fixo' && (
              <View style={styles.horarioRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Entrada</Text>
                  <TextInput style={styles.input} placeholder="07:00" value={horarioEntrada} onChangeText={setHorarioEntrada} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Saída</Text>
                  <TextInput style={styles.input} placeholder="17:00" value={horarioSaida} onChangeText={setHorarioSaida} />
                </View>
              </View>
            )}

            {horarioTipo === 'flexivel' && (
              <View style={styles.notaInfo}>
                <Text style={styles.notaInfoTexto}>💡 O horário será combinado directamente com o empregador.</Text>
              </View>
            )}

            <Text style={[styles.label, { marginTop: 16 }]}>Salário esperado (MZN/mês)</Text>
            <View style={styles.horarioRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Mínimo</Text>
                <TextInput style={styles.input} placeholder="3500" keyboardType="numeric" value={salarioMin} onChangeText={setSalarioMin} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Máximo</Text>
                <TextInput style={styles.input} placeholder="6000" keyboardType="numeric" value={salarioMax} onChangeText={setSalarioMax} />
              </View>
            </View>
            <TouchableOpacity style={styles.checkRow} onPress={() => setSalarioNegociavel(!salarioNegociavel)}>
              <View style={[styles.checkbox, salarioNegociavel && styles.checkboxActive]}>
                {salarioNegociavel && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkLabel}>Salário negociável</Text>
            </TouchableOpacity>

            {(regime === 'residente' || regime === 'ambos') && (
              <View style={styles.cardGreen}>
                <Text style={styles.sectionLabelGreen}>Condições como residente</Text>
                <TouchableOpacity style={styles.checkRow} onPress={() => setQuartoIndividual(!quartoIndividual)}>
                  <View style={[styles.checkbox, quartoIndividual && styles.checkboxActive]}>
                    {quartoIndividual && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkLabel}>Exige quarto individual</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.checkRow} onPress={() => setSaidaFimSemana(!saidaFimSemana)}>
                  <View style={[styles.checkbox, saidaFimSemana && styles.checkboxActive]}>
                    {saidaFimSemana && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkLabel}>Saída ao fim de semana</Text>
                </TouchableOpacity>
                <Text style={[styles.label, { marginTop: 12 }]}>Refeições</Text>
                <View style={styles.chipGrid}>
                  {[
                    { val: 'todas', label: 'Todas incluídas' },
                    { val: 'negociar', label: 'A negociar' },
                    { val: 'nenhuma', label: 'Nenhuma' },
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

        {/* ── ETAPA 4: CONDIÇÕES GERAIS ── */}
        {etapa === 4 && (
          <View>
            <Text style={styles.etapaTitulo}>Condições gerais</Text>
            <Text style={styles.etapaDesc}>Últimos detalhes para completar o seu perfil</Text>

            <Text style={styles.label}>Deslocação</Text>
            <TouchableOpacity style={styles.checkRow} onPress={() => setDeslocacao(!deslocacao)}>
              <View style={[styles.checkbox, deslocacao && styles.checkboxActive]}>
                {deslocacao && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkLabel}>Aceito deslocar-me para outras zonas</Text>
            </TouchableOpacity>
            {deslocacao && (
              <TextInput style={styles.input} placeholder="Ex: Toda a cidade, só Sommerschield..." value={areaDeslocacao} onChangeText={setAreaDeslocacao} />
            )}

            <Text style={[styles.label, { marginTop: 16 }]}>Animais em casa</Text>
            <View style={styles.chipGrid}>
              {[{ val: 'sim', label: 'Aceito' }, { val: 'nao', label: 'Não aceito' }, { val: 'negociar', label: 'Depende' }].map(op => (
                <TouchableOpacity key={op.val} style={[styles.chip, aceitaAnimais === op.val && styles.chipActive]}
                  onPress={() => setAceitaAnimais(op.val as any)}>
                  <Text style={[styles.chipText, aceitaAnimais === op.val && styles.chipTextActive]}>{op.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>Detergente de limpeza</Text>
            <View style={styles.chipGrid}>
              {[{ val: 'empregador', label: 'Usa os do empregador' }, { val: 'proprio', label: 'Traz o próprio' }, { val: 'negociar', label: 'A negociar' }].map(op => (
                <TouchableOpacity key={op.val} style={[styles.chip, detergenteLimpeza === op.val && styles.chipActive]}
                  onPress={() => setDetergenteLimpeza(op.val as any)}>
                  <Text style={[styles.chipText, detergenteLimpeza === op.val && styles.chipTextActive]}>{op.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>Detergente de roupa</Text>
            <View style={styles.chipGrid}>
              {[{ val: 'empregador', label: 'Usa os do empregador' }, { val: 'proprio', label: 'Traz o próprio' }, { val: 'negociar', label: 'A negociar' }].map(op => (
                <TouchableOpacity key={op.val} style={[styles.chip, detergenteRoupa === op.val && styles.chipActive]}
                  onPress={() => setDetergenteRoupa(op.val as any)}>
                  <Text style={[styles.chipText, detergenteRoupa === op.val && styles.chipTextActive]}>{op.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>Disponibilidade para começar</Text>
            <View style={styles.chipGrid}>
              {[{ val: 'imediata', label: 'Imediata' }, { val: '1semana', label: 'Em 1 semana' }, { val: '1mes', label: 'Em 1 mês' }].map(op => (
                <TouchableOpacity key={op.val} style={[styles.chip, disponibilidade === op.val && styles.chipActive]}
                  onPress={() => setDisponibilidade(op.val as any)}>
                  <Text style={[styles.chipText, disponibilidade === op.val && styles.chipTextActive]}>{op.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* CONDIÇÃO DE SAÚDE */}
            <View style={styles.saudeCard}>
              <Text style={styles.saudeTitulo}>🏥 Condição de saúde</Text>
              <Text style={styles.saudeDesc}>Tem alguma condição de saúde que considera relevante partilhar com o empregador? Esta informação é completamente opcional e confidencial.</Text>
              {[
                { val: 'nenhuma', label: '✅ Não tenho nenhuma condição relevante' },
                { val: 'prefiro_nao', label: '🔒 Prefiro não responder' },
                { val: 'sim', label: '💬 Sim, quero partilhar' },
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
                  placeholder="Descreva brevemente a sua condição de saúde..."
                  value={descricaoSaude}
                  onChangeText={setDescricaoSaude}
                  multiline
                />
              )}
              <Text style={styles.saudeNota}>🔒 Esta informação só é partilhada com o empregador após um match.</Text>
            </View>

            <View style={styles.nota}>
              <Text style={styles.notaTexto}>✅ O seu perfil ficará visível para empregadores assim que guardar.</Text>
            </View>
          </View>
        )}

        {/* NAVEGAÇÃO */}
        <View style={styles.navRow}>
          {etapa > 1 && (
            <TouchableOpacity style={styles.btnVoltar} onPress={() => setEtapa(etapa - 1)}>
              <Text style={styles.btnVoltarText}>← Anterior</Text>
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
              {loading ? 'A guardar...' : etapa === 4 ? '✓ Guardar perfil' : 'Seguinte >'}
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
  progressDotActive: { backgroundColor: '#1D9E75' },
  progressNum: { fontSize: 13, fontWeight: 'bold', color: '#aaa' },
  progressNumActive: { color: '#fff' },
  progressLine: { flex: 1, height: 2, backgroundColor: '#e0e0e0', marginHorizontal: 4 },
  progressLineActive: { backgroundColor: '#1D9E75' },
  etapaTitulo: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  etapaDesc: { fontSize: 14, color: '#888', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 4 },
  labelDesc: { fontSize: 12, color: '#aaa', marginBottom: 8, marginTop: -4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 14, backgroundColor: '#fff', marginBottom: 12 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0ea', borderWidth: 1, borderColor: '#e0e0da' },
  chipActive: { backgroundColor: '#1D9E75', borderColor: '#1D9E75' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  radioCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 12, backgroundColor: '#fff', marginBottom: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  radioCardActive: { backgroundColor: '#e8f5f0', borderColor: '#1D9E75' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  radioActive: { borderColor: '#1D9E75' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1D9E75' },
  radioTitulo: { fontSize: 15, fontWeight: '600', color: '#333' },
  radioTituloActive: { color: '#1D9E75' },
  radioDesc: { fontSize: 12, color: '#888', marginTop: 2 },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  toggleBtn: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#fff' },
  toggleBtnActive: { backgroundColor: '#1D9E75', borderColor: '#1D9E75' },
  toggleText: { fontSize: 13, color: '#555', fontWeight: '600' },
  toggleTextActive: { color: '#fff' },
  horarioRow: { flexDirection: 'row', gap: 12 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: '#1D9E75', borderColor: '#1D9E75' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  checkLabel: { fontSize: 14, color: '#444' },
  cardGreen: { backgroundColor: '#e8f5f0', borderRadius: 16, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#b2dfcf' },
  sectionLabelGreen: { fontSize: 13, fontWeight: '700', color: '#1D9E75', marginBottom: 12 },
  notaInfo: { backgroundColor: '#EBF4FF', borderRadius: 10, padding: 12, marginBottom: 8 },
  notaInfoTexto: { fontSize: 13, color: '#185FA5' },
  nota: { backgroundColor: '#e8f5f0', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#b2dfcf' },
  notaTexto: { fontSize: 13, color: '#1D9E75', lineHeight: 20 },
  navRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  btnVoltar: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#fff' },
  btnVoltarText: { fontSize: 15, color: '#555', fontWeight: '600' },
  btnAvancar: { flex: 2, padding: 14, borderRadius: 12, backgroundColor: '#1D9E75', alignItems: 'center' },
  btnDisabled: { backgroundColor: '#aaa' },
  btnAvancarText: { fontSize: 15, color: '#fff', fontWeight: '700' },
  saudeCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e0e0da' },
  saudeTitulo: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 8 },
  saudeDesc: { fontSize: 13, color: '#888', marginBottom: 12, lineHeight: 20 },
  saudeOpcao: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, marginBottom: 6, backgroundColor: '#f9f9f7' },
  saudeOpcaoActive: { backgroundColor: '#e8f5f0' },
  saudeOpcaoText: { fontSize: 14, color: '#444', flex: 1 },
  saudeOpcaoTextActive: { color: '#1D9E75', fontWeight: '600' },
  saudeNota: { fontSize: 12, color: '#aaa', marginTop: 8, fontStyle: 'italic' },
});