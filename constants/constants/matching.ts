import { supabase } from '@/constants/supabase';

// Tipos de opcao_condicao
type OpcaoCondicao = 'sim' | 'nao' | 'negociar';
type RegimeTrabalho = 'residente' | 'nao_residente' | 'ambos';

interface Trabalhadora {
  id: string;
  utilizador_id: string;
  tipo_trabalhadora: string;
  estado_perfil: string;
  anos_experiencia: number;
  regime_trabalho: RegimeTrabalho;
  hora_entrada: string | null;
  hora_entrada_opcao: OpcaoCondicao;
  hora_saida: string | null;
  hora_saida_opcao: OpcaoCondicao;
  dias_disponiveis: boolean[];
  refeicoes_opcao: OpcaoCondicao;
  transporte_opcao: OpcaoCondicao;
  detergente_limpeza_opcao: OpcaoCondicao | null;
  detergente_roupa_opcao: OpcaoCondicao | null;
  aceita_animais: boolean | null;
  salario_minimo: number | null;
  salario_maximo: number | null;
  idiomas: string[];
  avaliacao_media: number | null;
  servicos: string[];
}

interface Anuncio {
  id: string;
  utilizador_id: string;
  tipo_trabalhadora: string;
  estado: string;
  regime_pretendido: RegimeTrabalho;
  hora_entrada: string | null;
  hora_entrada_opcao: OpcaoCondicao;
  hora_saida: string | null;
  hora_saida_opcao: OpcaoCondicao;
  dias_necessarios: boolean[];
  refeicoes_opcao: OpcaoCondicao;
  transporte_opcao: OpcaoCondicao;
  detergente_limpeza_opcao: OpcaoCondicao | null;
  detergente_roupa_opcao: OpcaoCondicao | null;
  tem_animais: boolean | null;
  salario_minimo: number | null;
  salario_maximo: number | null;
  provincia_id: number | null;
  distrito_id: number | null;
  bairro_id: number | null;
}

// Verifica se duas opcoes sao compativeis (conta "negociar" como aceitavel)
function opcoesCompativeis(opcaoT: OpcaoCondicao, opcaoA: OpcaoCondicao): boolean {
  if (opcaoT === 'negociar' || opcaoA === 'negociar') return true;
  return opcaoT === opcaoA;
}

// Verifica sobreposicao de dias (pelo menos 1 dia em comum)
function diasCompativeis(disponiveis: boolean[], necessarios: boolean[]): number {
  let coincidencias = 0;
  let totalNecessarios = 0;
  for (let i = 0; i < 7; i++) {
    if (necessarios[i]) {
      totalNecessarios++;
      if (disponiveis[i]) coincidencias++;
    }
  }
  if (totalNecessarios === 0) return 1;
  return coincidencias / totalNecessarios;
}

// Verifica compatibilidade salarial
function salarioCompativel(
  tMin: number | null, tMax: number | null,
  aMin: number | null, aMax: number | null
): boolean {
  if (!tMin && !tMax) return true;
  if (!aMin && !aMax) return true;
  const tMinVal = tMin ?? 0;
  const tMaxVal = tMax ?? 999999;
  const aMinVal = aMin ?? 0;
  const aMaxVal = aMax ?? 999999;
  return tMinVal <= aMaxVal && aMinVal <= tMaxVal;
}

// Calcula score de compatibilidade (0-100)
export function calcularScore(trabalhadora: Trabalhadora, anuncio: Anuncio): number {
  let score = 0;

  // 1. TIPO (obrigatorio — eliminatorio)
  if (trabalhadora.tipo_trabalhadora !== anuncio.tipo_trabalhadora) return 0;

  // 2. REGIME (25 pontos — eliminatorio se incompativel)
  const regimeT = trabalhadora.regime_trabalho;
  const regimeA = anuncio.regime_pretendido;
  if (regimeT === regimeA || regimeT === 'ambos' || regimeA === 'ambos') {
    score += 25;
  } else {
    return 0;
  }

  // 3. DIAS DISPONÍVEIS (15 pontos)
  const proporcaoDias = diasCompativeis(trabalhadora.dias_disponiveis, anuncio.dias_necessarios);
  score += Math.round(proporcaoDias * 15);

  // 4. SALÁRIO (15 pontos)
  if (salarioCompativel(
    trabalhadora.salario_minimo, trabalhadora.salario_maximo,
    anuncio.salario_minimo, anuncio.salario_maximo
  )) {
    score += 15;
  }

  // 5. HORÁRIO (10 pontos)
  if (opcoesCompativeis(trabalhadora.hora_entrada_opcao, anuncio.hora_entrada_opcao)) score += 5;
  if (opcoesCompativeis(trabalhadora.hora_saida_opcao, anuncio.hora_saida_opcao)) score += 5;

  // 6. CONDIÇÕES (15 pontos)
  if (opcoesCompativeis(trabalhadora.refeicoes_opcao, anuncio.refeicoes_opcao)) score += 5;
  if (opcoesCompativeis(trabalhadora.transporte_opcao, anuncio.transporte_opcao)) score += 5;
  if (!anuncio.tem_animais || trabalhadora.aceita_animais) score += 5;

  // 7. DETERGENTES (5 pontos)
  if (!anuncio.detergente_limpeza_opcao || opcoesCompativeis(
    trabalhadora.detergente_limpeza_opcao ?? 'negociar',
    anuncio.detergente_limpeza_opcao
  )) score += 2;
  if (!anuncio.detergente_roupa_opcao || opcoesCompativeis(
    trabalhadora.detergente_roupa_opcao ?? 'negociar',
    anuncio.detergente_roupa_opcao
  )) score += 3;

  // 8. AVALIAÇÃO (10 pontos — bonus)
  const avaliacao = trabalhadora.avaliacao_media ?? 0;
  score += Math.round((avaliacao / 5) * 10);

  // 9. EXPERIÊNCIA (5 pontos — bonus)
  score += Math.min(trabalhadora.anos_experiencia, 5);

  return Math.min(score, 100);
}

// Função principal: encontrar matches para um anuncio
export async function encontrarMatches(anuncioId: string) {
  // 1. Buscar o anuncio
  const { data: anuncio, error: errAnuncio } = await supabase
    .from('anuncios_empregadores')
    .select('*')
    .eq('id', anuncioId)
    .single();

  if (errAnuncio || !anuncio) throw new Error('Anúncio não encontrado');

  // 2. Buscar trabalhadoras disponiveis do mesmo tipo
  const { data: trabalhadoras, error: errT } = await supabase
    .from('perfis_trabalhadoras')
    .select('*')
    .eq('tipo_trabalhadora', anuncio.tipo_trabalhadora)
    .eq('estado_perfil', 'disponivel');

  if (errT || !trabalhadoras) throw new Error('Erro ao buscar trabalhadoras');

  // 3. Buscar servicos de cada trabalhadora
  const perfilIds = trabalhadoras.map((t: any) => t.id);

  const { data: servicos } = await supabase
    .from('servicos_trabalhadora')
    .select('perfil_id, servico')
    .in('perfil_id', perfilIds);

  // 4. Mapear servicos por perfil
  const servicosPorPerfil: Record<string, string[]> = {};
  (servicos ?? []).forEach((s: any) => {
    if (!servicosPorPerfil[s.perfil_id]) servicosPorPerfil[s.perfil_id] = [];
    servicosPorPerfil[s.perfil_id].push(s.servico);
  });

  // 5. Calcular scores
  const resultados = trabalhadoras
    .map((t: any) => ({
      trabalhadora: { ...t, servicos: servicosPorPerfil[t.id] ?? [] } as Trabalhadora,
      score: calcularScore(
        { ...t, servicos: servicosPorPerfil[t.id] ?? [] } as Trabalhadora,
        anuncio as Anuncio
      ),
    }))
    .filter((r: any) => r.score >= 30)
    .sort((a: any, b: any) => b.score - a.score);

  // 6. Guardar matches no Supabase (upsert para nao duplicar)
  if (resultados.length > 0) {
    const matchesParaGuardar = resultados.map((r: any) => ({
      perfil_trabalhadora_id: r.trabalhadora.id,
      anuncio_id: anuncioId,
      estado: 'pendente',
      score_compatibilidade: r.score,
    }));

    await supabase
      .from('matches')
      .upsert(matchesParaGuardar, {
        onConflict: 'perfil_trabalhadora_id,anuncio_id',
        ignoreDuplicates: false,
      });
  }

  return resultados;
}

// Buscar matches ja guardados para um empregador
export async function buscarMatchesEmpregador(utilizadorId: string) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      perfis_trabalhadoras (
        id, tipo_trabalhadora, anos_experiencia, regime_trabalho,
        salario_minimo, salario_maximo, avaliacao_media, total_avaliacoes,
        idiomas, descricao,
        utilizadores ( id, nome, telefone )
      ),
      anuncios_empregadores (
        id, descricao_interna, tipo_trabalhadora
      )
    `)
    .eq('anuncios_empregadores.utilizador_id', utilizadorId)
    .order('score_compatibilidade', { ascending: false });

  if (error) throw error;
  return data ?? [];
}