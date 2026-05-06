import {
  formatarData,
  getIconeNotificacao,
  getNotificacoes,
  getTotalNaoLidas,
  limparNotificacoes,
  marcarTodasLidas,
  type Notificacao,
} from '@/constants/notifications';
import { supabase } from '@/constants/supabase';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';

interface Mensagem {
  id: string;
  conversa_id: string;
  remetente_id: string;
  conteudo: string;
  tipo: string;
  lida: boolean;
  criado_em: string;
}

interface Conversa {
  id: string;
  match_id: string;
  trabalhadora_id: string;
  empregador_id: string;
  outra_pessoa: { nome_completo: string; tipo: string } | null;
}

export default function MessagesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const conversaIdParam = params.conversa_id as string | undefined;

  const [tabActiva, setTabActiva] = useState<'mensagens' | 'avisos'>('mensagens');
  const [userId, setUserId] = useState<string | null>(null);
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaActiva, setConversaActiva] = useState<Conversa | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // Avisos
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [totalAvisos, setTotalAvisos] = useState(0);

  const scrollRef = useRef<ScrollView>(null);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    iniciar();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarAvisos();
    }, [])
  );

  useEffect(() => {
    if (conversaActiva) {
      carregarMensagens(conversaActiva.id);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => carregarMensagens(conversaActiva.id), 3000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [conversaActiva]);

  async function iniciar() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      await carregarConversas(user.id);
    } finally {
      setLoading(false);
    }
  }

  async function carregarConversas(uid: string) {
    const { data, error } = await supabase
      .from('conversas')
      .select(`
        *,
        trabalhadora:utilizadores!conversas_trabalhadora_id_fkey ( nome_completo, tipo ),
        empregador:utilizadores!conversas_empregador_id_fkey ( nome_completo, tipo )
      `)
      .or(`trabalhadora_id.eq.${uid},empregador_id.eq.${uid}`)
      .order('ultima_mensagem_em', { ascending: false });

    if (error || !data) return;

    const lista = data.map((c: any) => ({
      id: c.id,
      match_id: c.match_id,
      trabalhadora_id: c.trabalhadora_id,
      empregador_id: c.empregador_id,
      outra_pessoa: uid === c.trabalhadora_id ? c.empregador : c.trabalhadora,
    }));

    setConversas(lista);

    if (conversaIdParam) {
      const found = lista.find((c: Conversa) => c.id === conversaIdParam);
      if (found) setConversaActiva(found);
    } else if (lista.length > 0 && conversaIdParam) {
      setConversaActiva(lista[0]);
    }
  }

  async function carregarMensagens(conversaId: string) {
    const { data } = await supabase
      .from('mensagens')
      .select('*')
      .eq('conversa_id', conversaId)
      .order('criado_em', { ascending: true });

    if (data) {
      setMensagens(data as Mensagem[]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }

  async function carregarAvisos() {
    const lista = await getNotificacoes();
    setNotificacoes(lista);
    const total = await getTotalNaoLidas();
    setTotalAvisos(total);
  }

  async function enviarMensagem() {
    if (!novaMensagem.trim() || !conversaActiva || !userId) return;
    setEnviando(true);
    const texto = novaMensagem.trim();
    setNovaMensagem('');

    const { error } = await supabase.from('mensagens').insert({
      conversa_id: conversaActiva.id,
      remetente_id: userId,
      conteudo: texto,
      tipo: 'texto',
      lida: false,
    });

    if (!error) {
      await supabase
        .from('conversas')
        .update({ ultima_mensagem_em: new Date().toISOString() })
        .eq('id', conversaActiva.id);
      await carregarMensagens(conversaActiva.id);
    }

    setEnviando(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  async function marcarAvisosLidos() {
    await marcarTodasLidas();
    await carregarAvisos();
  }

  async function limparAvisos() {
    await limparNotificacoes();
    await carregarAvisos();
  }

  function iniciaisNome(nome: string | undefined) {
    if (!nome) return '?';
    return nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  function formatHora(data: string) {
    return new Date(data).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  }

  // ── LOADING ──────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1F8A70" />
        <Text style={styles.loadingText}>A carregar...</Text>
      </View>
    );
  }

  // ── CHAT ABERTO ───────────────────────────────────────
  if (conversaActiva) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>

          <View style={styles.chatHeader}>
            <TouchableOpacity
              onPress={() => setConversaActiva(null)}
              style={styles.chatBackBtn}>
              <Text style={styles.chatBackText}>←</Text>
            </TouchableOpacity>
            <View style={styles.chatHeaderAvatar}>
              <Text style={styles.chatHeaderAvatarText}>
                {iniciaisNome(conversaActiva.outra_pessoa?.nome_completo)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.chatHeaderNome}>
                {conversaActiva.outra_pessoa?.nome_completo ?? 'Utilizador'}
              </Text>
              <Text style={styles.chatHeaderTipo}>
                {conversaActiva.outra_pessoa?.tipo?.replace(/_/g, ' ')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.btnContrato}
              onPress={() => router.push('/(tabs)/contract' as any)}>
              <Text style={styles.btnContratoText}>Contrato</Text>
            </TouchableOpacity>
          </View>

          <ScrollView ref={scrollRef} contentContainerStyle={styles.mensagensContainer}>
            {mensagens.length === 0 && (
              <View style={styles.semMensagens}>
                <Text style={styles.semMensagensTexto}>
                  Ainda não há mensagens. Diga olá! 👋
                </Text>
              </View>
            )}
            {mensagens.map(m => (
              <View
                key={m.id}
                style={[
                  styles.mensagemWrapper,
                  m.remetente_id === userId ? styles.meuWrapper : styles.delesWrapper,
                ]}>
                <View style={[
                  styles.bolha,
                  m.remetente_id === userId ? styles.minhaBolha : styles.deleBolha,
                ]}>
                  <Text style={[
                    styles.bolhaTexto,
                    m.remetente_id === userId ? styles.meuTexto : styles.deleTexto,
                  ]}>
                    {m.conteudo}
                  </Text>
                  <Text style={[
                    styles.hora,
                    m.remetente_id === userId ? styles.horaMinhaT : styles.horaDeleT,
                  ]}>
                    {formatHora(m.criado_em)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputMensagem}
              placeholder="Escreva uma mensagem..."
              value={novaMensagem}
              onChangeText={setNovaMensagem}
              multiline
            />
            <TouchableOpacity
              style={[styles.btnEnviar, enviando && styles.btnDisabled]}
              onPress={enviarMensagem}
              disabled={enviando}>
              {enviando
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.btnEnviarText}>➤</Text>
              }
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    );
  }

  // ── LISTA DE CONVERSAS + AVISOS ───────────────────────
  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.listaHeader}>
        <Text style={styles.listaTitulo}>
          {tabActiva === 'mensagens' ? 'Mensagens' : 'Avisos'}
        </Text>
        {tabActiva === 'avisos' && notificacoes.length > 0 && (
          <TouchableOpacity onPress={limparAvisos}>
            <Text style={styles.limparText}>Limpar tudo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* TABS */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, tabActiva === 'mensagens' && styles.tabActiva]}
          onPress={() => setTabActiva('mensagens')}>
          <Text style={[styles.tabText, tabActiva === 'mensagens' && styles.tabTextActiva]}>
            Mensagens
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tabActiva === 'avisos' && styles.tabActiva]}
          onPress={() => {
            setTabActiva('avisos');
            marcarAvisosLidos();
          }}>
          <Text style={[styles.tabText, tabActiva === 'avisos' && styles.tabTextActiva]}>
            Avisos{totalAvisos > 0 ? ` (${totalAvisos})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTEÚDO */}
      <ScrollView style={{ flex: 1 }}>

        {/* ABA MENSAGENS */}
        {tabActiva === 'mensagens' && (
          conversas.length === 0 ? (
            <View style={styles.vazio}>
              <Text style={styles.vazioBig}>💬</Text>
              <Text style={styles.vazioText}>Sem conversas</Text>
              <Text style={styles.vazioSub}>Contacte uma trabalhadora nos Matches!</Text>
            </View>
          ) : (
            conversas.map(c => (
              <TouchableOpacity
                key={c.id}
                style={styles.conversaItem}
                onPress={() => setConversaActiva(c)}>
                <View style={styles.conversaAvatar}>
                  <Text style={styles.conversaAvatarText}>
                    {iniciaisNome(c.outra_pessoa?.nome_completo)}
                  </Text>
                </View>
                <View style={styles.conversaInfo}>
                  <Text style={styles.conversaNome}>
                    {c.outra_pessoa?.nome_completo ?? 'Utilizador'}
                  </Text>
                  <Text style={styles.conversaTipo}>
                    {c.outra_pessoa?.tipo?.replace(/_/g, ' ')}
                  </Text>
                </View>
                <Text style={styles.conversaSeta}>›</Text>
              </TouchableOpacity>
            ))
          )
        )}

        {/* ABA AVISOS */}
        {tabActiva === 'avisos' && (
          notificacoes.length === 0 ? (
            <View style={styles.vazio}>
              <Text style={styles.vazioBig}>🔔</Text>
              <Text style={styles.vazioText}>Sem avisos</Text>
              <Text style={styles.vazioSub}>As suas notificações aparecerão aqui.</Text>
            </View>
          ) : (
            notificacoes.map(n => (
              <View
                key={n.id}
                style={[styles.avisoCard, !n.lida && styles.avisoCardNaoLido]}>
                <View style={styles.avisoIconeBox}>
                  <Text style={styles.avisoIcone}>{getIconeNotificacao(n.tipo)}</Text>
                </View>
                <View style={styles.avisoInfo}>
                  <View style={styles.avisoTopo}>
                    <Text style={styles.avisoTitulo}>{n.titulo}</Text>
                    <Text style={styles.avisoData}>{formatarData(n.data)}</Text>
                  </View>
                  <Text style={styles.avisoMensagem}>{n.mensagem}</Text>
                </View>
                {!n.lida && <View style={styles.avisoPonto} />}
              </View>
            ))
          )
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#6B7280', fontSize: 14 },

  // HEADER LISTA
  listaHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  listaTitulo: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  limparText: { fontSize: 14, color: '#EF4444', fontWeight: '600' },

  // TABS
  tabsRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    paddingHorizontal: 20, paddingBottom: 0,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  tab: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActiva: { borderBottomColor: '#1F8A70' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#9CA3AF' },
  tabTextActiva: { color: '#1F8A70' },

  // LISTA CONVERSAS
  conversaItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', padding: 16,
    borderBottomWidth: 1, borderBottomColor: '#F9FAFB', gap: 12,
  },
  conversaAvatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#1F8A70', alignItems: 'center', justifyContent: 'center',
  },
  conversaAvatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  conversaInfo: { flex: 1 },
  conversaNome: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  conversaTipo: { fontSize: 13, color: '#6B7280', marginTop: 2, textTransform: 'capitalize' },
  conversaSeta: { fontSize: 22, color: '#D1D5DB' },

  // AVISOS
  avisoCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#fff', padding: 14,
    borderBottomWidth: 1, borderBottomColor: '#F9FAFB', gap: 12,
  },
  avisoCardNaoLido: { backgroundColor: '#F0FDF4', borderLeftWidth: 3, borderLeftColor: '#1F8A70' },
  avisoIconeBox: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center',
  },
  avisoIcone: { fontSize: 20 },
  avisoInfo: { flex: 1 },
  avisoTopo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  avisoTitulo: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  avisoData: { fontSize: 11, color: '#9CA3AF' },
  avisoMensagem: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  avisoPonto: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#1F8A70', marginTop: 4,
  },

  // VAZIO
  vazio: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  vazioBig: { fontSize: 48, marginBottom: 16 },
  vazioText: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  vazioSub: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 32 },

  // CHAT
  chatHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', padding: 16, paddingTop: 60,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 10,
  },
  chatBackBtn: { marginRight: 4 },
  chatBackText: { fontSize: 24, color: '#1F8A70' },
  chatHeaderAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#1F8A70', alignItems: 'center', justifyContent: 'center',
  },
  chatHeaderAvatarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  chatHeaderNome: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  chatHeaderTipo: { fontSize: 12, color: '#6B7280' },
  btnContrato: {
    backgroundColor: '#EBF4FF', paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 20,
  },
  btnContratoText: { color: '#1D6FA5', fontSize: 13, fontWeight: '600' },
  mensagensContainer: { padding: 16, paddingBottom: 8 },
  semMensagens: { alignItems: 'center', paddingVertical: 40 },
  semMensagensTexto: { fontSize: 14, color: '#9CA3AF' },
  mensagemWrapper: { marginBottom: 12 },
  meuWrapper: { alignItems: 'flex-end' },
  delesWrapper: { alignItems: 'flex-start' },
  bolha: { maxWidth: '80%', borderRadius: 16, padding: 12 },
  minhaBolha: { backgroundColor: '#1F8A70', borderBottomRightRadius: 4 },
  deleBolha: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  bolhaTexto: { fontSize: 14, lineHeight: 20 },
  meuTexto: { color: '#fff' },
  deleTexto: { color: '#1F2937' },
  hora: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  horaMinhaT: { color: 'rgba(255,255,255,0.7)' },
  horaDeleT: { color: '#9CA3AF' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: '#fff', padding: 12,
    borderTopWidth: 1, borderTopColor: '#F3F4F6', gap: 8,
  },
  inputMensagem: {
    flex: 1, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100,
    backgroundColor: '#F9FAFB',
  },
  btnEnviar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1F8A70', alignItems: 'center', justifyContent: 'center',
  },
  btnDisabled: { backgroundColor: '#9CA3AF' },
  btnEnviarText: { color: '#fff', fontSize: 18 },
});