import { getLingua, t } from '@/constants/i18n';
import { supabase } from '@/constants/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const SERVICOS_OPCOES = [
  'Limpeza geral', 'Cozinha', 'Lavar roupa', 'Passar roupa',
  'Cuidar de crianças', 'Cuidar de idosos', 'Jardinagem', 'Condução',
];

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function EmployerScreen() {
  const router = useRouter();
  const [etapa, setEtapa] = useState(1);
  const [loading, setLoading] = useState(false);
  const [, setLinguaActual] = useState('pt');

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
  const [levaPasSeios, setLevaPasseios] = useState('');
  const [mobilidadeIdoso, setMobilidadeIdoso] = useState('');
  const [gestaomedicacao, setGestaomedicacao] = useState('');
  const [forneceFerramentas, setForneceFerramentas] = useState('');
  const [tamanhoJardim, setTamanhoJardim] = useState('');
  const [temViatura, setTemViatura] = useState('');
  const [pagaCombustivel, setPagaCombustivel] = useState('');

  useFocusEffect(
    useCallback(() => {
      getLingua().then(l => setLinguaActual(l));
    }, [])
  );

  const toggleItem = (item: string, lista: string[], setLista: (v: string[]) => void) => {
    setLista(lista.includes(item) ? lista.filter(i => i !== item) : [...lista, item]);
  };

  const tem = (s: string) => servicos.includes(s);

  const validarEtapa = () => {
    if (etapa === 1 && (!nome || !provincia || !distrito || !bairro)) {
      Alert.alert(t('campos_em_falta'), t('preencha_todos'));
      return false;
    }
    if (etapa === 2 && servicos.length === 0) {
      Alert.alert(t('servicos_em_falta'), t('selecione_servico'));
      return false;
    }
    return true;
  };

  const publicar = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert(t('erro'), t('sessao_expirada'));
        router.push('/(tabs)/explore');
        return;
      }

      const diasArray = DIAS.map(d => diasTrabalhados.includes(d));

      let tipoTrabalhadora = 'empregada_domestica';
      if (tem('Cuidar de crianças') && !tem('Limpeza geral')) tipoTrabalhadora = 'baba';
      else if (tem('Cozinha') && !tem('Limpeza geral')) tipoTrabalhadora = 'cozinheira';

      const { error } = await supabase.from('anuncios_empregadores').insert({
        utilizador_id: user.id,
        descricao_interna: nome || t('anuncio_sem_titulo'),
        tipo_trabalhadora: tipoTrabalhadora,
        estado: 'activo',
        regime_pretendido: regime || 'nao_residente',
        hora_entrada: horarioEntrada || null,
        hora_entrada_opcao: 'negociar',
        hora_saida: horarioSaida || null,
        hora_saida_opcao: 'negociar',
        dias_necessarios: diasArray,
        salario_minimo: parseInt(salarioMin) || null,
        salario_maximo: parseInt(salarioMax) || null,
        refeicoes_opcao: 'negociar',
        transporte_opcao: 'negociar',
        tem_animais: temAnimais === 'sim',
        tem_quarto_disponivel: quartoDisponivel,
        detergente_limpeza_opcao: forneceDetergentelimpeza === 'sim' ? 'fornece' : forneceDetergentelimpeza === 'nao' ? 'nao_fornece' : forneceDetergentelimpeza === 'negociar' ? 'negociar' : null,
        detergente_roupa_opcao: forneceDetergenteRoupa === 'sim' ? 'fornece' : forneceDetergenteRoupa === 'nao' ? 'nao_fornece' : forneceDetergenteRoupa === 'negociar' ? 'negociar' : null,
        ingredientes_opcao: forneceIngredientes === 'sim' ? 'fornece' : forneceIngredientes === 'nao' ? 'nao_fornece' : forneceIngredientes === 'negociar' ? 'negociar' : null,
      });

      if (error) {
        Alert.alert(t('erro'), error.message);
        return;
      }

      await AsyncStorage.setItem('perfilEmpregadorCompleto', 'true');
      Alert.alert('✅ ' + t('anuncio_publicado'), t('anuncio_visivel'), [
        { text: t('ver_matches'), onPress: () => router.push('/(tabs)/match') }
      ]);
    } catch (e) {
      Alert.alert(t('erro'), t('sem_ligacao'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f0' }}>
      <View style={styles.progressBar}>
        {[1, 2, 3].map(n => (
          <View key={n} style={styles.progressStep}>
            <View style={[styles.progressDot, etapa >= n && styles.progressDotActive]}>
              <Text style={[styles.progressNum, etapa >= n && styles.progressNumActive]}>{n}</Text>
            </View>
            {n < 3 && <View style={[styles.progressLine, etapa > n && styles.progressLineActive]} />}
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.container}>

        {etapa === 1 && (
          <View>
            <Text style={styles.etapaTitulo}>{t('sobre_sua_casa')}</Text>
            <Text style={styles.etapaDesc}>{t('sobre_sua_casa_desc')}</Text>

            <Text style={styles.label}>{t('o_seu_nome')}</Text>
            <TextInput style={styles.input} placeholder="Ex: Carlos Machava" value={nome} onChangeText={setNome} />

            <Text style={styles.label}>{t('provincia')}</Text>
            <TextInput style={styles.input} placeholder="Ex: Maputo" value={provincia} onChangeText={setProvincia} />

            <Text style={styles.label}>{t('distrito')}</Text>
            <TextInput style={styles.input} placeholder="Ex: KaMpfumu" value={distrito} onChangeText={setDistrito} />

            <Text style={styles.label}>{t('bairro')}</Text>
            <TextInput style={styles.input} placeholder="Ex: Sommerschield" value={bairro} onChangeText={setBairro} />

            <Text style={styles.label}>{t('tipo_residencia')}</Text>
            <View style={styles.chipGrid}>
              {[
                { val: 'apartamento', label: '🏢 ' + t('apartamento') },
                { val: 'vivenda', label: '🏠 ' + t('vivenda') },
                { val: 'outro', label: '🏗️ ' + t('outro') }
              ].map(op => (
                <TouchableOpacity key={op.val} style={[styles.chip, tipoResidencia === op.val && styles.chipActive]}
                  onPress={() => setTipoResidencia(op.val)}>
                  <Text style={[styles.chipText, tipoResidencia === op.val && styles.chipTextActive]}>{op.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t('pessoas_em_casa')}</Text>
            <View style={styles.chipGrid}>
              {['1', '2', '3', '4', '5', '6+'].map(n => (
                <TouchableOpacity key={n} style={[styles.chipDia, numeroPessoas === n && styles.chipActive]}
                  onPress={() => setNumeroPessoas(n)}>
                  <Text style={[styles.chipText, numeroPessoas === n && styles.chipTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t('criancas_em_casa')}</Text>
            <View style={styles.chipGrid}>
              {['0', '1', '2', '3', '4+'].map(n => (
                <TouchableOpacity key={n} style={[styles.chipDia, numeroCriancas === n && styles.chipActive]}
                  onPress={() => setNumeroCriancas(n)}>
                  <Text style={[styles.chipText, numeroCriancas === n && styles.chipTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t('idosos_em_casa')}</Text>
            <View style={styles.chipGrid}>
              {['0', '1', '2', '3+'].map(n => (
                <TouchableOpacity key={n} style={[styles.chipDia, numeroIdosos === n && styles.chipActive]}
                  onPress={() => setNumeroIdosos(n)}>
                  <Text style={[styles.chipText, numeroIdosos === n && styles.chipTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {etapa === 2 && (
          <View>
            <Text style={styles.etapaTitulo}>{t('servicos_condicoes')}</Text>
            <Text style={styles.etapaDesc}>{t('servicos_condicoes_desc')}</Text>

            <Text style={styles.label}>{t('tipo_contrato')}</Text>
            <View style={styles.chipGrid}>
              {[
                { val: 'mensalista', label: '📅 ' + t('mensalista') },
                { val: 'diarista', label: '🗓️ ' + t('diarista') },
                { val: 'ocasional', label: '⚡ ' + t('ocasional') }
              ].map(op => (
                <TouchableOpacity key={op.val} style={[styles.chip, tipoContrato === op.val && styles.chipActive]}
                  onPress={() => setTipoContrato(op.val)}>
                  <Text style={[styles.chipText, tipoContrato === op.val && styles.chipTextActive]}>{op.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t('servicos_precisa')}</Text>
            <Text style={styles.labelDesc}>{t('seleccione_todos')}</Text>
            <View style={styles.chipGrid}>
              {SERVICOS_OPCOES.map(s => (
                <TouchableOpacity key={s} style={[styles.chip, servicos.includes(s) && styles.chipActive]}
                  onPress={() => toggleItem(s, servicos, setServicos)}>
                  <Text style={[styles.chipText, servicos.includes(s) && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t('regime_pretendido')}</Text>
            {[
              { val: 'nao_residente', titulo: t('nao_residente'), desc: t('nao_residente_desc') },
              { val: 'residente', titulo: t('residente'), desc: t('residente_empregador_desc') },
              { val: 'ambos', titulo: t('aceito_ambos'), desc: t('aceito_ambos_empregador_desc') },
            ].map(op => (
              <TouchableOpacity key={op.val} style={[styles.radioCard, regime === op.val && styles.radioCardActive]}
                onPress={() => setRegime(op.val)}>
                <View style={[styles.radio, regime === op.val && styles.radioActive]}>
                  {regime === op.val && <View style={styles.radioDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.radioTitulo, regime === op.val && styles.radioTituloActive]}>{op.titulo}</Text>
                  <Text style={styles.radioDesc}>{op.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <Text style={[styles.label, { marginTop: 16 }]}>{t('tipo_horario')}</Text>
            <View style={styles.toggleRow}>
              {[{ val: 'fixo', label: t('horario_fixo') }, { val: 'flexivel', label: t('horario_flexivel') }].map(h => (
                <TouchableOpacity key={h.val} style={[styles.toggleBtn, horarioTipo === h.val && styles.toggleBtnActive]}
                  onPress={() => setHorarioTipo(h.val)}>
                  <Text style={[styles.toggleText, horarioTipo === h.val && styles.toggleTextActive]}>{h.label}</Text>
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

            <Text style={[styles.label, { marginTop: 8 }]}>{t('dias_trabalho')}</Text>
            <View style={styles.chipGrid}>
              {DIAS.map(d => (
                <TouchableOpacity key={d} style={[styles.chipDia, diasTrabalhados.includes(d) && styles.chipActive]}
                  onPress={() => toggleItem(d, diasTrabalhados, setDiasTrabalhados)}>
                  <Text style={[styles.chipText, diasTrabalhados.includes(d) && styles.chipTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 8 }]}>{t('salario_oferece')}</Text>
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
              <View style={styles.cardDestaque}>
                <Text style={styles.sectionLabelDestaque}>{t('condicoes_residente')}</Text>
                <TouchableOpacity style={styles.checkRow} onPress={() => setQuartoDisponivel(!quartoDisponivel)}>
                  <View style={[styles.checkbox, quartoDisponivel && styles.checkboxActive]}>
                    {quartoDisponivel && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkLabel}>{t('tenho_quarto')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.checkRow} onPress={() => setSaidaFimSemana(!saidaFimSemana)}>
                  <View style={[styles.checkbox, saidaFimSemana && styles.checkboxActive]}>
                    {saidaFimSemana && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkLabel}>{t('permito_saida_fim_semana')}</Text>
                </TouchableOpacity>
                <Text style={[styles.label, { marginTop: 8 }]}>{t('refeicoes_incluidas')}</Text>
                <View style={styles.chipGrid}>
                  {[
                    { val: 'todas', label: t('refeicoes_todas_3') },
                    { val: 'negociar', label: t('a_negociar') },
                    { val: 'nenhuma', label: t('refeicoes_nenhuma') }
                  ].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, refeicoes === op.val && styles.chipActive]}
                      onPress={() => setRefeicoes(op.val)}>
                      <Text style={[styles.chipText, refeicoes === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {etapa === 3 && (
          <View>
            <Text style={styles.etapaTitulo}>{t('condicoes_especificas')}</Text>
            <Text style={styles.etapaDesc}>{t('condicoes_especificas_desc')}</Text>

            {tem('Limpeza geral') && (
              <View style={styles.blocoServico}>
                <Text style={styles.blocoTitulo}>🧹 {t('limpeza_geral')}</Text>
                <Text style={styles.label}>{t('fornece_produtos_limpeza')}</Text>
                <View style={styles.chipGrid}>
                  {[
                    { val: 'sim', label: t('sim_forneco') },
                    { val: 'nao', label: t('nao') },
                    { val: 'negociar', label: t('a_negociar') }
                  ].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, forneceDetergentelimpeza === op.val && styles.chipActive]}
                      onPress={() => setForneceDetergentelimpeza(op.val)}>
                      <Text style={[styles.chipText, forneceDetergentelimpeza === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {tem('Lavar roupa') && (
              <View style={styles.blocoServico}>
                <Text style={styles.blocoTitulo}>👕 {t('lavar_roupa')}</Text>
                <Text style={styles.label}>{t('fornece_detergente_roupa')}</Text>
                <View style={styles.chipGrid}>
                  {[
                    { val: 'sim', label: t('sim_forneco') },
                    { val: 'nao', label: t('nao') },
                    { val: 'negociar', label: t('a_negociar') }
                  ].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, forneceDetergenteRoupa === op.val && styles.chipActive]}
                      onPress={() => setForneceDetergenteRoupa(op.val)}>
                      <Text style={[styles.chipText, forneceDetergenteRoupa === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {tem('Passar roupa') && (
              <View style={styles.blocoServico}>
                <Text style={styles.blocoTitulo}>🔥 {t('passar_roupa')}</Text>
                <Text style={styles.label}>{t('tem_ferro')}</Text>
                <View style={styles.chipGrid}>
                  {[{ val: 'sim', label: t('sim') }, { val: 'nao', label: t('nao') }].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, temFerro === op.val && styles.chipActive]}
                      onPress={() => setTemFerro(op.val)}>
                      <Text style={[styles.chipText, temFerro === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>{t('tipo_roupa')}</Text>
                <View style={styles.chipGrid}>
                  {[
                    { val: 'casual', label: t('casual') },
                    { val: 'formal', label: t('formal') },
                    { val: 'ambos', label: t('ambos') }
                  ].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, tipoRoupa === op.val && styles.chipActive]}
                      onPress={() => setTipoRoupa(op.val)}>
                      <Text style={[styles.chipText, tipoRoupa === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {tem('Cozinha') && (
              <View style={styles.blocoServico}>
                <Text style={styles.blocoTitulo}>🍳 {t('cozinha')}</Text>
                <Text style={styles.label}>{t('fornece_ingredientes')}</Text>
                <View style={styles.chipGrid}>
                  {[
                    { val: 'sim', label: t('sim_forneco') },
                    { val: 'nao', label: t('nao') },
                    { val: 'negociar', label: t('a_negociar') }
                  ].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, forneceIngredientes === op.val && styles.chipActive]}
                      onPress={() => setForneceIngredientes(op.val)}>
                      <Text style={[styles.chipText, forneceIngredientes === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>{t('tem_dieta_especial')}</Text>
                <View style={styles.chipGrid}>
                  {[{ val: 'sim', label: t('sim') }, { val: 'nao', label: t('nao') }].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, temDietaEspecial === op.val && styles.chipActive]}
                      onPress={() => setTemDietaEspecial(op.val)}>
                      <Text style={[styles.chipText, temDietaEspecial === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>{t('cozinhar_eventos')}</Text>
                <View style={styles.chipGrid}>
                  {[
                    { val: 'sim', label: t('sim') },
                    { val: 'nao', label: t('nao') },
                    { val: 'ocasional', label: t('ocasionalmente') }
                  ].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, fazEventos === op.val && styles.chipActive]}
                      onPress={() => setFazEventos(op.val)}>
                      <Text style={[styles.chipText, fazEventos === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {tem('Cuidar de crianças') && (
              <View style={styles.blocoServico}>
                <Text style={styles.blocoTitulo}>👶 {t('cuidar_criancas')}</Text>
                <Text style={styles.label}>{t('idades_criancas')}</Text>
                <View style={styles.chipGrid}>
                  {[
                    { val: '0-2', label: '0-2 ' + t('anos') },
                    { val: '3-6', label: '3-6 ' + t('anos') },
                    { val: '7-12', label: '7-12 ' + t('anos') },
                    { val: '13+', label: '13+ ' + t('anos') }
                  ].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, idadeCriancas === op.val && styles.chipActive]}
                      onPress={() => setIdadeCriancas(op.val)}>
                      <Text style={[styles.chipText, idadeCriancas === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>{t('apoio_escolar')}</Text>
                <View style={styles.chipGrid}>
                  {[{ val: 'sim', label: t('sim') }, { val: 'nao', label: t('nao') }].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, precisaApoioEscolar === op.val && styles.chipActive]}
                      onPress={() => setPrecisaApoioEscolar(op.val)}>
                      <Text style={[styles.chipText, precisaApoioEscolar === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>{t('leva_passeios')}</Text>
                <View style={styles.chipGrid}>
                  {[
                    { val: 'sim', label: t('sim') },
                    { val: 'nao', label: t('nao') },
                    { val: 'ocasional', label: t('ocasionalmente') }
                  ].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, levaPasSeios === op.val && styles.chipActive]}
                      onPress={() => setLevaPasseios(op.val)}>
                      <Text style={[styles.chipText, levaPasSeios === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {tem('Cuidar de idosos') && (
              <View style={styles.blocoServico}>
                <Text style={styles.blocoTitulo}>👴 {t('cuidar_idosos')}</Text>
                <Text style={styles.label}>{t('mobilidade_idoso')}</Text>
                <View style={styles.chipGrid}>
                  {[
                    { val: 'autonomo', label: t('autonomo') },
                    { val: 'ajuda_parcial', label: t('ajuda_parcial') },
                    { val: 'dependente', label: t('dependente') }
                  ].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, mobilidadeIdoso === op.val && styles.chipActive]}
                      onPress={() => setMobilidadeIdoso(op.val)}>
                      <Text style={[styles.chipText, mobilidadeIdoso === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>{t('gestao_medicacao')}</Text>
                <View style={styles.chipGrid}>
                  {[{ val: 'sim', label: t('sim') }, { val: 'nao', label: t('nao') }].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, gestaomedicacao === op.val && styles.chipActive]}
                      onPress={() => setGestaomedicacao(op.val)}>
                      <Text style={[styles.chipText, gestaomedicacao === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {tem('Jardinagem') && (
              <View style={styles.blocoServico}>
                <Text style={styles.blocoTitulo}>🌿 {t('jardinagem')}</Text>
                <Text style={styles.label}>{t('fornece_ferramentas')}</Text>
                <View style={styles.chipGrid}>
                  {[
                    { val: 'sim', label: t('sim') },
                    { val: 'nao', label: t('nao') },
                    { val: 'negociar', label: t('a_negociar') }
                  ].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, forneceFerramentas === op.val && styles.chipActive]}
                      onPress={() => setForneceFerramentas(op.val)}>
                      <Text style={[styles.chipText, forneceFerramentas === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>{t('tamanho_jardim')}</Text>
                <View style={styles.chipGrid}>
                  {[
                    { val: 'pequeno', label: t('pequeno') },
                    { val: 'medio', label: t('medio') },
                    { val: 'grande', label: t('grande') }
                  ].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, tamanhoJardim === op.val && styles.chipActive]}
                      onPress={() => setTamanhoJardim(op.val)}>
                      <Text style={[styles.chipText, tamanhoJardim === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {tem('Condução') && (
              <View style={styles.blocoServico}>
                <Text style={styles.blocoTitulo}>🚗 {t('conducao')}</Text>
                <Text style={styles.label}>{t('tem_viatura')}</Text>
                <View style={styles.chipGrid}>
                  {[{ val: 'sim', label: t('sim') }, { val: 'nao', label: t('nao') }].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, temViatura === op.val && styles.chipActive]}
                      onPress={() => setTemViatura(op.val)}>
                      <Text style={[styles.chipText, temViatura === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>{t('paga_combustivel')}</Text>
                <View style={styles.chipGrid}>
                  {[
                    { val: 'sim', label: t('sim') },
                    { val: 'nao', label: t('nao') },
                    { val: 'negociar', label: t('a_negociar') }
                  ].map(op => (
                    <TouchableOpacity key={op.val} style={[styles.chip, pagaCombustivel === op.val && styles.chipActive]}
                      onPress={() => setPagaCombustivel(op.val)}>
                      <Text style={[styles.chipText, pagaCombustivel === op.val && styles.chipTextActive]}>{op.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.blocoServico}>
              <Text style={styles.blocoTitulo}>🏠 {t('geral')}</Text>
              <Text style={styles.label}>{t('tem_animais')}</Text>
              <View style={styles.chipGrid}>
                {[{ val: 'sim', label: '🐾 ' + t('sim') }, { val: 'nao', label: '✗ ' + t('nao') }].map(op => (
                  <TouchableOpacity key={op.val} style={[styles.chip, temAnimais === op.val && styles.chipActive]}
                    onPress={() => setTemAnimais(op.val)}>
                    <Text style={[styles.chipText, temAnimais === op.val && styles.chipTextActive]}>{op.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>{t('quando_comecar')}</Text>
              <View style={styles.chipGrid}>
                {[
                  { val: 'imediata', label: t('imediatamente') },
                  { val: '1semana', label: t('em_1_semana') },
                  { val: '1mes', label: t('em_1_mes') }
                ].map(op => (
                  <TouchableOpacity key={op.val} style={[styles.chip, disponibilidade === op.val && styles.chipActive]}
                    onPress={() => setDisponibilidade(op.val)}>
                    <Text style={[styles.chipText, disponibilidade === op.val && styles.chipTextActive]}>{op.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>{t('notas_adicionais')}</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder={t('notas_placeholder')}
                value={notasExtras}
                onChangeText={setNotasExtras}
                multiline
              />
            </View>

            <View style={styles.nota}>
              <Text style={styles.notaTexto}>✅ {t('anuncio_visivel_nota')}</Text>
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
              if (!validarEtapa()) return;
              if (etapa < 3) setEtapa(etapa + 1);
              else publicar();
            }}>
            <Text style={styles.btnAvancarText}>
              {etapa === 3 ? (loading ? t('carregando') : '✓ ' + t('publicar_anuncio')) : t('seguinte') + ' >'}
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
  progressBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingBottom: 16, backgroundColor: '#fff', paddingHorizontal: 48 },
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
  chipDia: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0f0ea', borderWidth: 1, borderColor: '#e0e0da', alignItems: 'center', justifyContent: 'center' },
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
  cardDestaque: { backgroundColor: '#e8f5f0', borderRadius: 16, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#b2dfcf' },
  sectionLabelDestaque: { fontSize: 13, fontWeight: '700', color: '#1D9E75', marginBottom: 12 },
  blocoServico: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e0e0da' },
  blocoTitulo: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 12 },
  nota: { backgroundColor: '#e8f5f0', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#b2dfcf' },
  notaTexto: { fontSize: 13, color: '#1D9E75', lineHeight: 20 },
  navRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  btnVoltar: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#fff' },
  btnVoltarText: { fontSize: 15, color: '#555', fontWeight: '600' },
  btnAvancar: { flex: 2, padding: 14, borderRadius: 12, backgroundColor: '#1D9E75', alignItems: 'center' },
  btnAvancarText: { fontSize: 15, color: '#fff', fontWeight: '700' },
  btnDisabled: { backgroundColor: '#aaa' },
});