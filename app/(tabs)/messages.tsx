import { getLingua, t } from '@/constants/i18n';
import { supabase } from '@/constants/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  outra_pessoa: {
    nome_completo: string;
    tipo: string;
  } | null;
}

export default function MessagesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const conversaIdParam = params.conversa_id as string | undefined;

  const [userId, setUserId] = useState<string | null>(null);
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaActiva, setConversaActiva] = useState<Conversa | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [, setLinguaActual] = useState('pt');
  const scrollRef = useRef<ScrollView>(null);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    iniciar();
    getLingua().then(l => setLinguaActual(l));
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (conversaActiva) {
      carregarMensagens(conversaActiva.id);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        carregarMensagens(conversaActiva.id);
      }, 3000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
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
    } else if (lista.length > 0) {
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

  function iniciaisNome(nome: string | undefined) {
    if (!nome) return '?';
    return nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  function formatHora(data: string) {
    return new Date(data).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  }

  if (loading) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1D9E75" />
        <Text style={styles.loadingText}>{t('carregando')}</Text>
      </View>
    );
  }

  if (!conversaActiva) {
    return (
      <View style={styles.container}>
        <View style={styles.headerLista}>
          <Text style={styles.headerListaTitulo}>{t('mensagens')}</Text>
        </View>
        {conversas.length === 0 ? (
          <View style={styles.vazio}>
            <Text style={styles.vazioBig}>💬</Text>
            <Text style={styles.vazioText}>{t('sem_conversas')}</Text>
            <Text style={styles.vazioSub}>{t('sem_conversas_desc')}</Text>
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
                <Text style={styles.conversaNome}>{c.outra_pessoa?.nome_completo ?? t('utilizador')}</Text>
                <Text style={styles.conversaTipo}>{c.outra_pessoa?.tipo?.replace(/_/g, ' ')}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => conversas.length > 1 ? setConversaActiva(null) : router.back()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>
                {iniciaisNome(conversaActiva.outra_pessoa?.nome_completo)}
              </Text>
            </View>
            <View>
              <Text style={styles.headerNome}>
                {conversaActiva.outra_pessoa?.nome_completo ?? t('utilizador')}
              </Text>
              <Text style={styles.headerTipo}>
                {conversaActiva.outra_pessoa?.tipo?.replace(/_/g, ' ')}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.btnContrato} onPress={() => router.push('/(tabs)/contract' as any)}>
            <Text style={styles.btnContratoText}>{t('contrato')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView ref={scrollRef} contentContainerStyle={styles.mensagensContainer}>
          {mensagens.length === 0 && (
            <View style={styles.semMensagens}>
              <Text style={styles.semMensagensTexto}>{t('sem_mensagens_chat')}</Text>
            </View>
          )}
          {mensagens.map(m => (
            <View key={m.id} style={[styles.mensagemWrapper, m.remetente_id === userId ? styles.meuWrapper : styles.delesWrapper]}>
              <View style={[styles.bolha, m.remetente_id === userId ? styles.minhaBolha : styles.deleBolha]}>
                <Text style={[styles.bolhaTexto, m.remetente_id === userId ? styles.meuTexto : styles.deleTexto]}>
                  {m.conteudo}
                </Text>
                <Text style={[styles.hora, m.remetente_id === userId ? styles.horaMinhaT : styles.horaDeleT]}>
                  {formatHora(m.criado_em)}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={t('escreva_mensagem')}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#888', fontSize: 14 },
  headerLista: { backgroundColor: '#fff', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerListaTitulo: { fontSize: 26, fontWeight: 'bold', color: '#222' },
  conversaItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', gap: 12 },
  conversaAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#1D9E75', alignItems: 'center', justifyContent: 'center' },
  conversaAvatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  conversaInfo: { flex: 1 },
  conversaNome: { fontSize: 16, fontWeight: '600', color: '#222' },
  conversaTipo: { fontSize: 13, color: '#888', marginTop: 2, textTransform: 'capitalize' },
  vazio: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 80 },
  vazioBig: { fontSize: 48 },
  vazioText: { fontSize: 18, fontWeight: '600', color: '#444' },
  vazioSub: { fontSize: 14, color: '#aaa', textAlign: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backText: { fontSize: 24, color: '#1D9E75', marginRight: 12 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1D9E75', alignItems: 'center', justifyContent: 'center' },
  headerAvatarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  headerNome: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  headerTipo: { fontSize: 12, color: '#888' },
  btnContrato: { backgroundColor: '#E6F1FB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  btnContratoText: { color: '#185FA5', fontSize: 13, fontWeight: '600' },
  mensagensContainer: { padding: 16, paddingBottom: 8 },
  semMensagens: { alignItems: 'center', paddingVertical: 40 },
  semMensagensTexto: { fontSize: 14, color: '#aaa' },
  mensagemWrapper: { marginBottom: 12 },
  meuWrapper: { alignItems: 'flex-end' },
  delesWrapper: { alignItems: 'flex-start' },
  bolha: { maxWidth: '80%', borderRadius: 16, padding: 12 },
  minhaBolha: { backgroundColor: '#1D9E75', borderBottomRightRadius: 4 },
  deleBolha: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  bolhaTexto: { fontSize: 14, lineHeight: 20 },
  meuTexto: { color: '#fff' },
  deleTexto: { color: '#333' },
  hora: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  horaMinhaT: { color: 'rgba(255,255,255,0.7)' },
  horaDeleT: { color: '#aaa' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#fff', padding: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#D3D1C7', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
  btnEnviar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1D9E75', alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { backgroundColor: '#aaa' },
  btnEnviarText: { color: '#fff', fontSize: 18 },
});