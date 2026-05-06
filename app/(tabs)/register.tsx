import { supabase } from '@/constants/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert, Image, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';

const SUPABASE_URL = 'https://yxewlabdcxncgjoecxlz.supabase.co';
const CODIGOS = ['MOZDOM2026','TESTE123','AMIGO001','AMIGO002','AMIGO003','AMIGO004','AMIGO005'];

export default function RegisterScreen() {
  const router = useRouter();
  const [etapa, setEtapa] = useState(0);
  const [tipo, setTipo] = useState<'trabalhadora'|'empregador'|''>('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConf, setPasswordConf] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [tipoDoc, setTipoDoc] = useState<'bi'|'passaporte'>('bi');
  const [numDoc, setNumDoc] = useState('');
  const [validade, setValidade] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState<string|null>(null);
  const [fotoFrente, setFotoFrente] = useState<string|null>(null);
  const [fotoVerso, setFotoVerso] = useState<string|null>(null);
  const [fotoSelfie, setFotoSelfie] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  // SEMPRE que o ecrã ganhar foco, volta à etapa 0
  useFocusEffect(
    useCallback(() => {
      setEtapa(0);
      setTipo('');
    }, [])
  );

  const tirarFoto = (setter: (u: string) => void) => {
    Alert.alert('Foto', 'Como quer adicionar?', [
      {
        text: 'Câmara', onPress: async () => {
          const p = await ImagePicker.requestCameraPermissionsAsync();
          if (!p.granted) return;
          const r = await ImagePicker.launchCameraAsync({ quality: 0.5, allowsEditing: true, aspect: [4, 3] });
          if (!r.canceled) setter(r.assets[0].uri);
        }
      },
      {
        text: 'Galeria', onPress: async () => {
          const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!p.granted) return;
          const r = await ImagePicker.launchImageLibraryAsync({ quality: 0.5, allowsEditing: true, aspect: [4, 3] });
          if (!r.canceled) setter(r.assets[0].uri);
        }
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const uploadFoto = async (uri: string, userId: string, nomeArq: string) => {
    try {
      const ext = uri.split('.').pop()?.split('?')[0] ?? 'jpg';
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      const fd = new FormData();
      fd.append('file', { uri, name: `${nomeArq}.${ext}`, type: `image/${ext}` } as any);
      const res = await fetch(
        `${SUPABASE_URL}/storage/v1/object/documentos/${userId}/${nomeArq}.${ext}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}`, 'x-upsert': 'true' },
          body: fd,
        }
      );
      return res.ok ? `${userId}/${nomeArq}.${ext}` : null;
    } catch { return null; }
  };

  const registar = async () => {
    if (!nome || !telefone || password.length < 6) {
      Alert.alert('Erro', 'Preencha todos os campos. A palavra-passe deve ter 6 dígitos.');
      return;
    }
    if (password !== passwordConf) {
      Alert.alert('Erro', 'As palavras-passe não coincidem.');
      return;
    }
    if (!CODIGOS.includes(codigo.trim().toUpperCase())) {
      Alert.alert('Código inválido', 'O código de convite não é válido.');
      return;
    }
    setLoading(true);
    try {
      const numero = `258${telefone.replace(/\D/g, '')}`;
      const email = `${numero}@domesticamoz.app`;
      const { data: up, error: ue } = await supabase.auth.signUp({ email, password });
      if (ue?.message?.includes('already registered')) {
        Alert.alert('Erro', 'Este número já tem conta. Use "Entrar".');
        setLoading(false); return;
      }
      if (ue) { Alert.alert('Erro', ue.message); setLoading(false); return; }
      const userId = up?.user?.id;
      if (!userId) { Alert.alert('Erro', 'Não foi possível criar a conta.'); setLoading(false); return; }

      let urlFrente = null, urlSelfie = null;
      if (fotoFrente) urlFrente = await uploadFoto(fotoFrente, userId, 'doc_frente');
      if (fotoSelfie) urlSelfie = await uploadFoto(fotoSelfie, userId, 'selfie_doc');

      await supabase.from('utilizadores').upsert({
        id: userId, nome_completo: nome, numero_telemovel: numero,
        tipo: tipo || 'trabalhadora',
        numero_bi: numDoc || 'TEMP_' + userId.slice(0, 8),
        data_nascimento: nascimento || '1990-01-01',
        foto_bi_url: urlFrente, foto_selfie_bi_url: urlSelfie,
        estado: 'pendente_verificacao',
        actualizado_em: new Date().toISOString(),
      }, { onConflict: 'id' });

      await AsyncStorage.setItem('tipoUser', tipo);
      await AsyncStorage.setItem('codigo_convite_valido', 'true');

      if (tipo === 'empregador') {
        router.replace('/(tabs)/employer');
      } else {
        router.replace('/(tabs)/profile');
      }
    } catch {
      Alert.alert('Erro', 'Sem ligação ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const eliminarConta = () => {
    Alert.alert(
      '⚠️ Eliminar conta',
      'Tem a certeza? Esta acção é irreversível.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive', onPress: async () => {
            await supabase.auth.signOut();
            await AsyncStorage.clear();
            router.replace('/');
          }
        },
      ]
    );
  };

  const FotoBox = ({ foto, setter, titulo, icone }: {
    foto: string|null; setter:(u:string)=>void; titulo:string; icone:string;
  }) => (
    <TouchableOpacity
      style={[styles.fotoBox, foto && styles.fotoBoxOk]}
      onPress={() => tirarFoto(setter)}>
      {foto ? (
        <Image source={{ uri: foto }} style={styles.fotoPreview} />
      ) : (
        <View style={styles.fotoPlaceholder}>
          <Text style={styles.fotoIcone}>{icone}</Text>
          <Text style={styles.fotoTitulo}>{titulo}</Text>
          <Text style={styles.fotoAddText}>+ Adicionar</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // ─── ETAPA 0: TIPO ────────────────────────────────────
  if (etapa === 0) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Criar conta</Text>
        <Text style={styles.subtitulo}>Quem é você na plataforma?</Text>

        <TouchableOpacity
          style={[styles.tipoCard, tipo === 'trabalhadora' && styles.tipoCardActivo]}
          onPress={() => setTipo('trabalhadora')}>
          <Text style={styles.tipoIcone}>👩</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.tipoNome, tipo === 'trabalhadora' && styles.tipoNomeActivo]}>
              Sou Trabalhadora
            </Text>
            <Text style={styles.tipoDesc}>Encontre emprego doméstico de confiança</Text>
          </View>
          {tipo === 'trabalhadora' && <Text style={styles.tipoCheck}>✓</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tipoCard, tipo === 'empregador' && styles.tipoCardActivo]}
          onPress={() => setTipo('empregador')}>
          <Text style={styles.tipoIcone}>🏠</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.tipoNome, tipo === 'empregador' && styles.tipoNomeActivo]}>
              Sou Empregador
            </Text>
            <Text style={styles.tipoDesc}>Encontre a trabalhadora ideal para si</Text>
          </View>
          {tipo === 'empregador' && <Text style={styles.tipoCheck}>✓</Text>}
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={[styles.btnPrimario, !tipo && styles.btnDesactivado]}
          disabled={!tipo}
          onPress={() => setEtapa(1)}>
          <Text style={styles.btnPrimarioText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── ETAPA 1: DADOS ───────────────────────────────────
  if (etapa === 1) {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => setEtapa(0)} style={styles.backBtn}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Dados pessoais</Text>
        <Text style={styles.subtitulo}>Preencha os seus dados</Text>

        <Text style={styles.label}>Nome completo *</Text>
        <TextInput style={styles.input} placeholder="Nome e apelido" value={nome} onChangeText={setNome} />

        <Text style={styles.label}>Número de telemóvel *</Text>
        <View style={styles.inputRow}>
          <View style={styles.prefixoBox}>
            <Text style={styles.prefixo}>🇲🇿 +258</Text>
          </View>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="84 XXX XXXX" keyboardType="phone-pad" maxLength={9}
            value={telefone} onChangeText={setTelefone}
          />
        </View>
        <View style={{ height: 16 }} />

        <Text style={styles.label}>Palavra-passe (6 dígitos) *</Text>
        <TextInput
          style={styles.input} placeholder="• • • • • •"
          secureTextEntry keyboardType="number-pad" maxLength={6}
          value={password} onChangeText={setPassword}
        />

        <Text style={styles.label}>Confirmar palavra-passe *</Text>
        <TextInput
          style={styles.input} placeholder="• • • • • •"
          secureTextEntry keyboardType="number-pad" maxLength={6}
          value={passwordConf} onChangeText={setPasswordConf}
        />

        <Text style={styles.label}>Código de convite *</Text>
        <TextInput
          style={styles.input} placeholder="Ex: MOZDOM2026"
          autoCapitalize="characters" value={codigo} onChangeText={setCodigo}
        />

        <Text style={styles.label}>Data de nascimento</Text>
        <TextInput style={styles.input} placeholder="AAAA-MM-DD" value={nascimento} onChangeText={setNascimento} />

        <TouchableOpacity style={styles.btnPrimario} onPress={() => setEtapa(2)}>
          <Text style={styles.btnPrimarioText}>Seguinte</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  // ─── ETAPA 2: DOCUMENTOS ─────────────────────────────
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <TouchableOpacity onPress={() => setEtapa(1)} style={styles.backBtn}>
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>
      <Text style={styles.titulo}>Documentos e foto</Text>
      <Text style={styles.subtitulo}>Para verificação de identidade</Text>

      <Text style={styles.label}>Foto de perfil</Text>
      <FotoBox foto={fotoPerfil} setter={setFotoPerfil} titulo="Selfie do seu rosto" icone="🤳" />

      <Text style={styles.label}>Tipo de documento</Text>
      <View style={styles.docTipoRow}>
        {(['bi', 'passaporte'] as const).map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.docTipoBtn, tipoDoc === d && styles.docTipoBtnActivo]}
            onPress={() => setTipoDoc(d)}>
            <Text style={[styles.docTipoText, tipoDoc === d && styles.docTipoTextActivo]}>
              {d === 'bi' ? '🪪 BI' : '📘 Passaporte'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>{tipoDoc === 'bi' ? 'Número de BI' : 'Número de passaporte'}</Text>
      <TextInput
        style={styles.input}
        placeholder={tipoDoc === 'bi' ? 'Ex: 123456789A' : 'Ex: A1234567'}
        autoCapitalize="characters" value={numDoc} onChangeText={setNumDoc}
      />

      <Text style={styles.label}>Validade do documento</Text>
      <TextInput style={styles.input} placeholder="AAAA-MM-DD" value={validade} onChangeText={setValidade} />

      <Text style={styles.label}>{tipoDoc === 'bi' ? 'BI — frente' : 'Passaporte — página principal'}</Text>
      <FotoBox foto={fotoFrente} setter={setFotoFrente} titulo="Fotografe o documento" icone="🪪" />

      {tipoDoc === 'bi' && (
        <>
          <Text style={styles.label}>BI — verso</Text>
          <FotoBox foto={fotoVerso} setter={setFotoVerso} titulo="Fotografe o verso" icone="🔄" />
        </>
      )}

      <Text style={styles.label}>Selfie com documento visível</Text>
      <FotoBox foto={fotoSelfie} setter={setFotoSelfie} titulo="Segure o documento perto do rosto" icone="📸" />

      <View style={styles.notaPriv}>
        <Text style={styles.notaPrivText}>
          🔒 As fotos são usadas apenas para verificação e não são partilhadas publicamente.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.btnPrimario, loading && styles.btnDesactivado]}
        disabled={loading} onPress={registar}>
        <Text style={styles.btnPrimarioText}>{loading ? 'A criar conta...' : '✓ Criar conta'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnEliminar} onPress={eliminarConta}>
        <Text style={styles.btnEliminarText}>🗑️ Eliminar conta</Text>
      </TouchableOpacity>
      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 24, paddingTop: 72 },
  scroll: { backgroundColor: '#F9FAFB', padding: 24, paddingTop: 72 },
  backBtn: { marginBottom: 24 },
  backText: { color: '#1F8A70', fontSize: 16, fontWeight: '600' },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1F2937', marginBottom: 6 },
  subtitulo: { fontSize: 15, color: '#6B7280', marginBottom: 28 },
  label: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8, marginTop: 4 },
  input: {
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 14, padding: 14, fontSize: 15, color: '#1F2937', marginBottom: 16,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  prefixoBox: {
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 14, padding: 14, marginRight: 8,
  },
  prefixo: { fontSize: 15, color: '#6B7280', fontWeight: '600' },
  docTipoRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  docTipoBtn: {
    flex: 1, padding: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    alignItems: 'center', backgroundColor: '#fff',
  },
  docTipoBtnActivo: { backgroundColor: '#1F8A70', borderColor: '#1F8A70' },
  docTipoText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  docTipoTextActivo: { color: '#fff' },
  fotoBox: {
    borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 16,
    borderStyle: 'dashed', marginBottom: 16, overflow: 'hidden', minHeight: 130,
  },
  fotoBoxOk: { borderStyle: 'solid', borderColor: '#1F8A70' },
  fotoPlaceholder: { padding: 24, alignItems: 'center' },
  fotoIcone: { fontSize: 32, marginBottom: 8 },
  fotoTitulo: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  fotoAddText: { fontSize: 13, color: '#1F8A70', fontWeight: '600' },
  fotoPreview: { width: '100%', height: 170 },
  notaPriv: {
    backgroundColor: '#ECFDF5', borderRadius: 12, padding: 14,
    marginBottom: 16, borderWidth: 1, borderColor: '#A7F3D0',
  },
  notaPrivText: { fontSize: 13, color: '#065F46', lineHeight: 20 },
  tipoCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 16, padding: 18, marginBottom: 14,
    borderWidth: 1.5, borderColor: '#E5E7EB', gap: 14,
  },
  tipoCardActivo: { borderColor: '#1F8A70', backgroundColor: '#ECFDF5' },
  tipoIcone: { fontSize: 32 },
  tipoNome: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  tipoNomeActivo: { color: '#1F8A70' },
  tipoDesc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  tipoCheck: { fontSize: 20, color: '#1F8A70', fontWeight: 'bold' },
  btnPrimario: {
    backgroundColor: '#1F8A70', padding: 17, borderRadius: 16,
    alignItems: 'center', marginTop: 8,
    shadowColor: '#1F8A70', shadowOpacity: 0.25, shadowRadius: 10, elevation: 4,
  },
  btnDesactivado: { backgroundColor: '#9CA3AF' },
  btnPrimarioText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  btnEliminar: {
    padding: 16, borderRadius: 16, alignItems: 'center',
    marginTop: 12, borderWidth: 1.5, borderColor: '#FCA5A5',
  },
  btnEliminarText: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
});