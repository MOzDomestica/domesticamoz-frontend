import { supabase } from '@/constants/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';

const SERVICOS_OPCOES = [
  'Limpeza geral', 'Cozinha', 'Lavar roupa', 'Passar roupa',
  'Cuidar de crianças', 'Cuidar de idosos', 'Jardinagem', 'Condução',
];

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function EmployerScreen() {
  const router = useRouter();
  const [etapa, setEtapa] = useState(1);
  const [loading, setLoading] = useState(false);
  const [perfilGuardado, setPerfilGuardado] = useState(false);

  const [nome, setNome] = useState('');
  const [provincia, setProvincia] = useState('');
  const [distrito, setDistrito] = useState('');
  const [bairro, setBairro] = useState('');
  const [tipoResidencia, setTipoResidencia] = useState('');
  const [numeroPessoas, setNumeroPessoas] = useState('');
  const [numeroCriancas, setNumeroCriancas] = useState('');
  const [numeroIdosos, setNumeroIdosos] = useState('');

  const [servicos, setServicos] = useState<string[]>([]);
  const [tipoContrato, setTipoContrato] = useState('');
  const [regime, setRegime] = useState('');
  const [horarioTipo, setHorarioTipo] = useState('');
  const [horarioEntrada, setHorarioEntrada] = useState('');
  const [horarioSaida, setHorarioSaida] = useState('');
  const [diasTrabalhados, setDiasTrabalhados] = useState<string[]>([]);
  const [salarioMin, setSalarioMin] = useState('');
  const [salarioMax, setSalarioMax] = useState('');
  const [salarioNegociavel, setSalarioNegociavel] = useState(false);
  const [quartoDisponivel, setQuartoDisponivel] = useState(false);
  const [refeicoes, setRefeicoes] = useState('');
  const [saidaFimSemana, setSaidaFimSemana] = useState(false);

  const [temAnimais, setTemAnimais] = useState('');
  const [disponibilidade, setDisponibilidade] = useState('');
  const [notasExtras, setNotasExtras] = useState('');
  const [forneceDetergentelimpeza, setForneceDetergentelimpeza] = useState('');
  const [forneceDetergenteRoupa, setForneceDetergenteRoupa] = useState('');
  const [temFerro, setTemFerro] = useState('');
  const [tipoRoupa, setTipoRoupa] = useState('');
  const [forneceIngredientes, setForneceIngredientes] = useState('');
  const [temDietaEspecial, setTemDietaEspecial] = useState('');
  const [fazEventos, setFazEventos] = useState('');
  const [idadeCriancas, setIdadeCriancas] = useState('');
  const [precisaApoioEscolar, setPrecisaApoioEscolar] = useState('');
  const [levaPasseios, setLevaPasseios] = useState('');
  const [mobilidadeIdoso, setMobilidadeIdoso] = useState('');
  const [gestaomedicacao, setGestaomedicacao] = useState('');
  const [forneceFerramentas, setForneceFerramentas] = useState('');
  const [tamanhoJardim, setTamanhoJardim] = useState('');
  const [temViatura, setTemViatura] = useState('');
  const [pagaCombustivel, setPagaCombustivel] = useState('');

  const toggleItem = (item: string, lista: string[], setLista: (v: string[]) => void) => {
    setLista(lista.includes(item) ? lista.filter(i => i !== item) : [...lista, item]);
  };

  const tem = (s: string) => servicos.includes(s);

  const validarEtapa = () => {
    if (etapa === 1 && (!nome || !provincia || !distrito || !bairro)) {
      Alert.alert('Campos em falta', 'Preencha todos os campos obrigatórios.');
      return false;
    }
    if (etapa === 2 && servicos.length === 0) {
      Alert.alert('Serviços em falta', 'Selecione pelo menos um serviço.');
      return false;
    }
    return true;
  };

  const guardarPerfil = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/(tabs)/login'); return; }

      const { error } = await supabase.from('empregadores').upsert({
        user_id: user.id,
        nome, provincia, distrito, bairro,
        tipo_residencia: tipoResidencia,
        numero_pessoas: numeroPessoas,
        servicos, regime,
        horario_tipo: horarioTipo,
        horario_entrada: horarioEntrada,
        horario_saida: horarioSaida,
        dias_trabalhados: diasTrabalhados,
        salario_min: parseInt(salarioMin) || 0,
        salario_max: parseInt(salarioMax) || 0,
        salario_negociavel: salarioNegociavel,
        tem_animais: temAnimais,
        quarto_disponivel: quartoDisponivel,
        refeicoes,
        fornece_detergente_limpeza: forneceDetergentelimpeza,
        fornece_detergente_roupa: forneceDetergenteRoupa,
        disponibilidade,
        notas_extras: notasExtras,
      }, { onConflict: 'user_id' });

      if (error) { Alert.alert('Erro', error.message); return; }

      await AsyncStorage.setItem('perfilEmpregadorCompleto', 'true');
      setPerfilGuardado(true);
      Alert.alert('✅ Perfil guardado!', 'O seu perfil foi guardado com sucesso.');
    } catch {
      Alert.alert('Erro', 'Sem ligação ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const publicarVaga = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/(tabs)/login'); return; }

      const { error } = await supabase.from('empregadores').upsert({
        user_id: user.id,
        nome, provincia, distrito, bairro,
        tipo_residencia: tipoResidencia,
        numero_pessoas: numeroPessoas,
        servicos, regime,
        horario_tipo: horarioTipo,
        horario_entrada: horarioEntrada,
        horario_saida: horarioSaida,
        dias_trabalhados: diasTrabalhados,
        salario_min: parseInt(salarioMin) || 0,
        salario_max: parseInt(salarioMax) || 0,
        salario_negociavel: salarioNegociavel,
        tem_animais: temAnimais,
        quarto_disponivel: quartoDisponivel,
        refeicoes,
        fornece_detergente_limpeza: forneceDetergentelimpeza,
        fornece_detergente_roupa: forneceDetergenteRoupa,
        disponibilidade,
        notas_extras: notasExtras,
        vaga_publicada: true,
      }, { onConflict: 'user_id' });

      if (error) { Alert.alert('Erro', error.message); return; }

      Alert.alert(
        '🎉 Vaga publicada!',
        'A sua vaga está visível para trabalhadoras compatíveis.',
        [{ text: 'Ver matches', onPress: () => router.push('/(tabs)/match') }]
      );
    } catch {
      Alert.alert('Erro', 'Sem ligação ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>

      {/* BARRA DE PROGRESSO */}
      <View style={styles.progressBar}>
        {[1, 2, 3].map(n => (
          <View key={n} style={styles.progressStep}>
            <View style={[styles.progressDot, etapa >= n && styles.progressDotActive]}>
              <Text style={[styles.progressNum, etapa >= n && styles.progressNumActive]}>{n}</Text>
            </View>
            {n < 3 && (
              <View style={[styles.progressLine, etapa > n && styles.progressLineActive]} />
            )}
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.container}>

        {/* ── ETAPA 1: CASA ── */}
        {etapa === 1 && (
          <View>
            <Text style={styles.etapaTitulo}>Sobre a sua casa</Text>
            <Text style={styles.etapaDesc}>Diga-nos onde vive e como é a sua residência</Text>

            <Text style={styles.label}>O seu nome</Text>
            <TextInput style={styles.input} placeholder="Ex: Carlos Machava" value={nome} onChangeText={setNome} />

            <Text style={styles.label}>Província</Text>
            <TextInput style={styles.input} placeholder="Ex: Maputo" value={provincia} onChangeText={setProvincia} />

            <Text style={styles.label}>Distrito</Text>
            <TextInput style={styles.input} placeholder="Ex: KaMpfumu" value={distrito} onChangeText={setDistrito} />

            <Text style={styles.label}>Bairro</Text>
            <TextInput style={styles.input} placeholder="Ex: Sommerschield" value={bairro} onChangeText={setBairro} />

            <Text style={styles.label}>Tipo de residência</Text>
            <View style={styles.chipGrid}>
              {[
                { val: 'apartamento', label: '🏢 Apartamento' },
                { val: 'vivenda', label: '🏠 Vivenda' },
                { val: 'outro', label: '🏗️ Outro' },
              ].map(op => (
                <TouchableOpacity
                  key={op.val}
                  style={[styles.chip, tipoResidencia === op.val && styles.chipActive]}
                  onPress={() => setTipoResidencia(op.val)}>
                  <Text style={[styles.chipText, tipoResidencia === op.val && styles.chipTextActive]}>
                    {op.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Pessoas em casa</Text>
            <View style={styles.chipGrid}>
              {['1', '2', '3', '4', '5', '6+'].map(n => (
                <TouchableOpacity
                  key={n}
                  style={[styles.chipDia, numeroPessoas === n && styles.chipActive]}
                  onPress={() => setNumeroPessoas(n)}>
                  <Text style={[styles.chipText, numeroPessoas === n && styles.chipTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Crianças em casa</Text>
            <View style={styles.chipGrid}>
              {['0', '1', '2', '3', '4+'].map(n => (
                <TouchableOpacity
                  key={n}
                  style={[styles.chipDia, numeroCriancas === n && styles.chipActive]}
                  onPress={() => setNumeroCriancas(n)}>
                  <Text style={[styles.chipText, numeroCriancas === n && styles.chipTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Idosos em casa</Text>
            <View style={styles.chipGrid}>
              {['0', '1', '2', '3+'].map(n => (
                <TouchableOpacity
                  key={n}
                  style={[styles.chipDia, numeroIdosos === n && styles.chipActive]}
                  onPress={() => setNumeroIdosos(n)}>
                  <Text style={[styles.chipText, numeroIdosos === n && styles.chipTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── ETAPA 2: SERVIÇOS ── */}
        {etapa === 2 && (
          <View>
            <Text style={styles.etapaTitulo}>Serviços e condições</Text>
            <Text style={styles.etapaDesc}>O que precisa e como quer que trabalhe</Text>

            <Text style={styles.label}>Tipo de contrato</Text>
            <View style={styles.chipGrid}>
              {[
                { val: 'mensalista', label: '📅 Mensalista' },
                { val: 'diarista', label: '🗓️ Diarista' },
                { val: 'ocasional', label: '⚡ Ocasional' },
              ].map(op => (
                <TouchableOpacity
                  key={op.val}
                  style={[styles.chip, tipoContrato === op.val && styles.chipActive]}
                  onPress={() => setTipoContrato(op.val)}>
                  <Text style={[styles.chipText, tipoContrato === op.val && styles.chipTextActive]}>
                    {op.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Serviços que precisa</Text>
            <View style={styles.chipGrid}>
              {SERVICOS_OPCOES.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, servicos.includes(s) && styles.chipActive]}
                  onPress={() => toggleItem(s, servicos, setServicos)}>
                  <Text style={[styles.chipText, servicos.includes(s) && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Regime pretendido</Text>
            {[
              { val: 'nao_residente', titulo: 'Não residente', desc: 'Entra e sai no mesmo dia' },
              { val: 'residente', titulo: 'Residente', desc: 'Dorme na sua casa' },
              { val: 'ambos', titulo: 'Aceito os dois', desc: 'Flexível conforme candidata' },
            ].map(op => (
              <TouchableOpacity
                key={op.val}
                style={[styles.radioCard, regime === op.val && styles.radioCardActive]}
                onPress={() => setRegime(op.val)}>
                <View style={[styles.radio, regime === op.val && styles.radioActive]}>
                  {regime === op.val && <View style={styles.radioDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.radioTitulo, regime === op.val && styles.radioTituloActive]}>
                    {op.titulo}
                  </Text>
                  <Text style={styles.radioDesc}>{op.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <Text style={[styles.label, { marginTop: 16 }]}>Tipo de horário</Text>
            <View style={styles.toggleRow}>
              {[{ val: 'fixo', label: 'Horário fixo' }, { val: 'flexivel', label: 'Flexível' }].map(h => (
                <TouchableOpacity
                  key={h.val}
                  style={[styles.toggleBtn, horarioTipo === h.val && styles.toggleBtnActive]}
                  onPress={() => setHorarioTipo(h.val)}>
                  <Text style={[styles.toggleText, horarioTipo === h.val && styles.toggleTextActive]}>
                    {h.label}
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

            <Text style={[styles.label, { marginTop: 8 }]}>Dias de trabalho</Text>
            <View style={styles.chipGrid}>
              {DIAS.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.chipDia, diasTrabalhados.includes(d) && styles.chipActive]}
                  onPress={() => toggleItem(d, diasTrabalhados, setDiasTrabalhados)}>
                  <Text style={[styles.chipText, diasTrabalhados.includes(d) && styles.chipTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 8 }]}>Salário que oferece (MZN/mês)</Text>
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
              <View style={styles.cardDestaque}>
                <Text style={styles.sectionLabelDestaque}>Condições para residente</Text>
                <TouchableOpacity style={styles.checkRow} onPress={() => setQuartoDisponivel(!quartoDisponivel)}>
                  <View style={[styles.checkbox, quartoDisponivel && styles.checkboxActive]}>
                    {quartoDisponivel && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkLabel}>Tenho quarto individual disponível</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.checkRow} onPress={() => setSaidaFimSemana(!saidaFimSemana)}>
                  <View style={[styles.checkbox, saidaFimSemana && styles.checkboxActive]}>
                    {saidaFimSemana && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkLabel}>Permito saída ao fim de semana</Text>
                </TouchableOpacity>
                <Text style={[styles.label, { marginTop: 8 }]}>Refeições incluídas</Text>
                <View style={styles.chipGrid}>
                  {[
                    { val: 'todas', label: 'Todas (3/dia)' },
                    { val: 'negociar', label: 'A negociar' },
                    { val: 'nenhuma', label: 'Nenhuma' },
                  ].map(op => (
                    <TouchableOpacity
                      key={op.val}
                      style={[styles.chip, refeicoes === op.val && styles.chipActive]}
                      onPress={() => setRefeicoes(op.val)}>
                      <Text style={[styles.chipText, refeicoes === op.val && styles.chipTextActive]}>
                        {op.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── ETAPA 3: CONDIÇÕES ── */}
        {etapa === 3 && (
          <View>
            <Text style={styles.etapaTitulo}>Condições específicas</Text>
            <Text style={styles.etapaDesc}>Baseado nos serviços que escolheu</Text>

            {tem('Limpeza geral') && (
              <View style={styles.blocoServico}>
                <Text style={styles.blocoTitulo}>🧹 Limpeza geral</Text>
                <Text style={styles.label}>Fornece produtos de limpeza?</Text>
                <View style={styles.chipGrid}>
                  {[{ val: 'sim', label: 'Sim' }, { val: 'nao', label: 'Não' }, { val: 'negociar', label: 'A negociar' }].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, forneceDetergentelimpeza === op.val && styles.chipActive]} onPress={() => setForneceDetergentelimpeza(op.val)}>
                      <Text style={[styles.chipText, forneceDetergentelimpeza === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {tem('Lavar roupa') && (
              <View style={styles.blocoServico}>
                <Text style={styles.blocoTitulo}>👕 Lavar roupa</Text>
                <Text style={styles.label}>Fornece detergente?</Text>
                <View style={styles.chipGrid}>
                  {[{ val: 'sim', label: 'Sim' }, { val: 'nao', label: 'Não' }, { val: 'negociar', label: 'A negociar' }].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, forneceDetergenteRoupa === op.val && styles.chipActive]} onPress={() => setForneceDetergenteRoupa(op.val)}>
                      <Text style={[styles.chipText, forneceDetergenteRoupa === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {tem('Passar roupa') && (
              <View style={styles.blocoServico}>
                <Text style={styles.blocoTitulo}>🔥 Passar roupa</Text>
                <Text style={styles.label}>Tem ferro em casa?</Text>
                <View style={styles.chipGrid}>
                  {[{ val: 'sim', label: 'Sim' }, { val: 'nao', label: 'Não' }].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, temFerro === op.val && styles.chipActive]} onPress={() => setTemFerro(op.val)}>
                      <Text style={[styles.chipText, temFerro === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>Tipo de roupa</Text>
                <View style={styles.chipGrid}>
                  {[{ val: 'casual', label: 'Casual' }, { val: 'formal', label: 'Formal' }, { val: 'ambos', label: 'Ambos' }].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, tipoRoupa === op.val && styles.chipActive]} onPress={() => setTipoRoupa(op.val)}>
                      <Text style={[styles.chipText, tipoRoupa === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {tem('Cozinha') && (
              <View style={styles.blocoServico}>
                <Text style={styles.blocoTitulo}>🍳 Cozinha</Text>
                <Text style={styles.label}>Fornece ingredientes?</Text>
                <View style={styles.chipGrid}>
                  {[{ val: 'sim', label: 'Sim' }, { val: 'nao', label: 'Não' }, { val: 'negociar', label: 'A negociar' }].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, forneceIngredientes === op.val && styles.chipActive]} onPress={() => setForneceIngredientes(op.val)}>
                      <Text style={[styles.chipText, forneceIngredientes === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>Tem dieta especial em casa?</Text>
                <View style={styles.chipGrid}>
                  {[{ val: 'sim', label: 'Sim' }, { val: 'nao', label: 'Não' }].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, temDietaEspecial === op.val && styles.chipActive]} onPress={() => setTemDietaEspecial(op.val)}>
                      <Text style={[styles.chipText, temDietaEspecial === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {tem('Cuidar de crianças') && (
              <View style={styles.blocoServico}>
                <Text style={styles.blocoTitulo}>👶 Cuidar de crianças</Text>
                <Text style={styles.label}>Idades das crianças</Text>
                <View style={styles.chipGrid}>
                  {[{ val: '0-2', label: '0-2 anos' }, { val: '3-6', label: '3-6 anos' }, { val: '7-12', label: '7-12 anos' }, { val: '13+', label: '13+ anos' }].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, idadeCriancas === op.val && styles.chipActive]} onPress={() => setIdadeCriancas(op.val)}>
                      <Text style={[styles.chipText, idadeCriancas === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>Precisa de apoio escolar?</Text>
                <View style={styles.chipGrid}>
                  {[{ val: 'sim', label: 'Sim' }, { val: 'nao', label: 'Não' }].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, precisaApoioEscolar === op.val && styles.chipActive]} onPress={() => setPrecisaApoioEscolar(op.val)}>
                      <Text style={[styles.chipText, precisaApoioEscolar === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>Leva crianças a passeios?</Text>
                <View style={styles.chipGrid}>
                  {[{ val: 'sim', label: 'Sim' }, { val: 'nao', label: 'Não' }, { val: 'ocasional', label: 'Ocasionalmente' }].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, levaPasseios === op.val && styles.chipActive]} onPress={() => setLevaPasseios(op.val)}>
                      <Text style={[styles.chipText, levaPasseios === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {tem('Cuidar de idosos') && (
              <View style={styles.blocoServico}>
                <Text style={styles.blocoTitulo}>👴 Cuidar de idosos</Text>
                <Text style={styles.label}>Mobilidade do idoso</Text>
                <View style={styles.chipGrid}>
                  {[{ val: 'autonomo', label: 'Autónomo' }, { val: 'ajuda_parcial', label: 'Ajuda parcial' }, { val: 'dependente', label: 'Dependente' }].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, mobilidadeIdoso === op.val && styles.chipActive]} onPress={() => setMobilidadeIdoso(op.val)}>
                      <Text style={[styles.chipText, mobilidadeIdoso === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>Gestão de medicação?</Text>
                <View style={styles.chipGrid}>
                  {[{ val: 'sim', label: 'Sim' }, { val: 'nao', label: 'Não' }].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, gestaomedicacao === op.val && styles.chipActive]} onPress={() => setGestaomedicacao(op.val)}>
                      <Text style={[styles.chipText, gestaomedicacao === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {tem('Jardinagem') && (
              <View style={styles.blocoServico}>
                <Text style={styles.blocoTitulo}>🌿 Jardinagem</Text>
                <Text style={styles.label}>Fornece ferramentas?</Text>
                <View style={styles.chipGrid}>
                  {[{ val: 'sim', label: 'Sim' }, { val: 'nao', label: 'Não' }, { val: 'negociar', label: 'A negociar' }].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, forneceFerramentas === op.val && styles.chipActive]} onPress={() => setForneceFerramentas(op.val)}>
                      <Text style={[styles.chipText, forneceFerramentas === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>Tamanho do jardim</Text>
                <View style={styles.chipGrid}>
                  {[{ val: 'pequeno', label: 'Pequeno' }, { val: 'medio', label: 'Médio' }, { val: 'grande', label: 'Grande' }].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, tamanhoJardim === op.val && styles.chipActive]} onPress={() => setTamanhoJardim(op.val)}>
                      <Text style={[styles.chipText, tamanhoJardim === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {tem('Condução') && (
              <View style={styles.blocoServico}>
                <Text style={styles.blocoTitulo}>🚗 Condução</Text>
                <Text style={styles.label}>Tem viatura disponível?</Text>
                <View style={styles.chipGrid}>
                  {[{ val: 'sim', label: 'Sim' }, { val: 'nao', label: 'Não' }].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, temViatura === op.val && styles.chipActive]} onPress={() => setTemViatura(op.val)}>
                      <Text style={[styles.chipText, temViatura === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>Paga combustível?</Text>
                <View style={styles.chipGrid}>
                  {[{ val: 'sim', label: 'Sim' }, { val: 'nao', label: 'Não' }, { val: 'negociar', label: 'A negociar' }].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, pagaCombustivel === op.val && styles.chipActive]} onPress={() => setPagaCombustivel(op.val)}>
                      <Text style={[styles.chipText, pagaCombustivel === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* GERAL */}
            <View style={styles.blocoServico}>
              <Text style={styles.blocoTitulo}>🏠 Geral</Text>
              <Text style={styles.label}>Tem animais em casa?</Text>
              <View style={styles.chipGrid}>
                {[{ val: 'sim', label: '🐾 Sim' }, { val: 'nao', label: '✗ Não' }].map(op => (
                  <TouchableOpacity key={op.val} style={[styles.chip, temAnimais === op.val && styles.chipActive]} onPress={() => setTemAnimais(op.val)}>
                    <Text style={[styles.chipText, temAnimais === op.val && styles.chipTextActive]}>{op.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Quando precisa começar?</Text>
              <View style={styles.chipGrid}>
                {[{ val: 'imediata', label: 'Imediatamente' }, { val: '1semana', label: 'Em 1 semana' }, { val: '1mes', label: 'Em 1 mês' }].map(op => (
                  <TouchableOpacity key={op.val} style={[styles.chip, disponibilidade === op.val && styles.chipActive]} onPress={() => setDisponibilidade(op.val)}>
                    <Text style={[styles.chipText, disponibilidade === op.val && styles.chipTextActive]}>{op.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Notas adicionais (opcional)</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Ex: Casa de 3 quartos..."
                value={notasExtras}
                onChangeText={setNotasExtras}
                multiline
              />
            </View>

            <View style={styles.nota}>
              <Text style={styles.notaTexto}>
                ✅ O seu perfil ficará visível para trabalhadoras compatíveis assim que publicar.
              </Text>
            </View>
          </View>
        )}

        {/* ── NAVEGAÇÃO ── */}
        <View style={styles.navRow}>
          {etapa > 1 && (
            <TouchableOpacity style={styles.btnVoltar} onPress={() => setEtapa(etapa - 1)}>
              <Text style={styles.btnVoltarText}>Anterior</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.btnAvancar, etapa === 1 && { flex: 1 }, loading && styles.btnDisabled]}
            disabled={loading}
            onPress={() => {
              if (!validarEtapa()) return;
              if (etapa < 3) setEtapa(etapa + 1);
              else guardarPerfil();
            }}>
            <Text style={styles.btnAvancarText}>
              {etapa === 3 ? (loading ? 'A guardar...' : '✓ Guardar perfil') : 'Seguinte'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── BOTÃO PUBLICAR VAGA ── */}
        {perfilGuardado && (
          <TouchableOpacity
            style={[styles.btnPublicarVaga, loading && styles.btnDisabled]}
            disabled={loading}
            onPress={() => {
              Alert.alert(
                '📋 Publicar vaga',
                'Ao publicar a vaga, trabalhadoras compatíveis vão poder ver o seu anúncio.',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Publicar agora', onPress: publicarVaga },
                ]
              );
            }}>
            <Text style={styles.btnPublicarVagaText}>📋 Publicar vaga de trabalhadora</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 16 },
  progressBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingTop: 60, paddingBottom: 16, backgroundColor: '#fff', paddingHorizontal: 48,
  },
  progressStep: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  progressDot: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#e0e0e0',
    alignItems: 'center', justifyContent: 'center',
  },
  progressDotActive: { backgroundColor: '#1F8A70' },
  progressNum: { fontSize: 13, fontWeight: 'bold', color: '#aaa' },
  progressNumActive: { color: '#fff' },
  progressLine: { flex: 1, height: 2, backgroundColor: '#e0e0e0', marginHorizontal: 4 },
  progressLineActive: { backgroundColor: '#1F8A70' },
  etapaTitulo: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  etapaDesc: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 6, marginTop: 4 },
  input: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 12, fontSize: 14, backgroundColor: '#fff', marginBottom: 12, color: '#1F2937',
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  chipDia: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6',
    borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center',
  },
  chipActive: { backgroundColor: '#1F8A70', borderColor: '#1F8A70' },
  chipText: { fontSize: 13, color: '#6B7280' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  radioCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14,
    borderRadius: 12, backgroundColor: '#fff', marginBottom: 8,
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  radioCardActive: { backgroundColor: '#ECFDF5', borderColor: '#1F8A70' },
  radio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  radioActive: { borderColor: '#1F8A70' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1F8A70' },
  radioTitulo: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  radioTituloActive: { color: '#1F8A70' },
  radioDesc: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  toggleBtn: {
    flex: 1, padding: 10, borderRadius: 10, borderWidth: 1.5,
    borderColor: '#E5E7EB', alignItems: 'center', backgroundColor: '#fff',
  },
  toggleBtnActive: { backgroundColor: '#1F8A70', borderColor: '#1F8A70' },
  toggleText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  toggleTextActive: { color: '#fff' },
  horarioRow: { flexDirection: 'row', gap: 12 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: '#1F8A70', borderColor: '#1F8A70' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  checkLabel: { fontSize: 14, color: '#1F2937' },
  cardDestaque: {
    backgroundColor: '#ECFDF5', borderRadius: 16, padding: 16,
    marginTop: 16, borderWidth: 1, borderColor: '#A7F3D0',
  },
  sectionLabelDestaque: { fontSize: 13, fontWeight: '700', color: '#1F8A70', marginBottom: 12 },
  blocoServico: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 16, borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  blocoTitulo: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  nota: {
    backgroundColor: '#ECFDF5', borderRadius: 12, padding: 14,
    marginBottom: 16, borderWidth: 1, borderColor: '#A7F3D0',
  },
  notaTexto: { fontSize: 13, color: '#065F46', lineHeight: 20 },
  navRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  btnVoltar: {
    flex: 1, padding: 14, borderRadius: 12, borderWidth: 1.5,
    borderColor: '#E5E7EB', alignItems: 'center', backgroundColor: '#fff',
  },
  btnVoltarText: { fontSize: 15, color: '#6B7280', fontWeight: '600' },
  btnAvancar: {
    flex: 2, padding: 14, borderRadius: 12, backgroundColor: '#1F8A70', alignItems: 'center',
  },
  btnAvancarText: { fontSize: 15, color: '#fff', fontWeight: '700' },
  btnDisabled: { backgroundColor: '#9CA3AF' },
  btnPublicarVaga: {
    backgroundColor: '#F59E0B', padding: 17, borderRadius: 16,
    alignItems: 'center', marginTop: 12,
    shadowColor: '#F59E0B', shadowOpacity: 0.3, shadowRadius: 10, elevation: 4,
  },
  btnPublicarVagaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});