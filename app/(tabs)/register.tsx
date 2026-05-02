import { getLingua, t } from '@/constants/i18n';
import { supabase } from '@/constants/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const SUPABASE_URL = 'https://yxewlabdcxncgjoecxlz.supabase.co';

export default function RegisterScreen() {
  const [nome, setNome] = useState<string>('');
  const [telefone, setTelefone] = useState<string>('');
  const [codigoConvite, setCodigoConvite] = useState<string>('');
  const [tipoDocumento, setTipoDocumento] = useState<'bi' | 'passaporte'>('bi');
  const [numeroDocumento, setNumeroDocumento] = useState<string>('');
  const [validadeDocumento, setValidadeDocumento] = useState<string>('');
  const [nascimento, setNascimento] = useState<string>('');
  const [nacionalidade, setNacionalidade] = useState<string>('Moçambicana');
  const [tipo, setTipo] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [, setLinguaActual] = useState('pt');

  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [fotoDocumentoFrente, setFotoDocumentoFrente] = useState<string | null>(null);
  const [fotoDocumentoVerso, setFotoDocumentoVerso] = useState<string | null>(null);
  const [fotoSelfieDocumento, setFotoSelfieDocumento] = useState<string | null>(null);

  const router = useRouter();
  const { tipo: tipoParam } = useLocalSearchParams();

  const CODIGOS_VALIDOS = [
    'MOZDOM2026', 'TESTE123', 'AMIGO001', 'AMIGO002',
    'AMIGO003', 'AMIGO004', 'AMIGO005',
  ];

  useEffect(() => {
    if (tipoParam && tipoParam !== '') {
      const t = Array.isArray(tipoParam) ? tipoParam[0] : tipoParam;
      setTipo(t);
      AsyncStorage.setItem('tipoUser', t);
    }
  }, [tipoParam]);

  useFocusEffect(
    useCallback(() => {
      getLingua().then(l => setLinguaActual(l));
    }, [])
  );

  const tirarFoto = async (setter: (uri: string) => void, usarCamera = true) => {
    const permissao = usarCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      Alert.alert(t('permissao_necessaria'), t('permissao_camara'));
      return;
    }

    const resultado = usarCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.5, allowsEditing: true, aspect: [4, 3] })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.5, allowsEditing: true, aspect: [4, 3] });

    if (!resultado.canceled && resultado.assets[0]) {
      setter(resultado.assets[0].uri);
    }
  };

  const escolherFoto = (setter: (uri: string) => void) => {
    Alert.alert(t('adicionar_foto'), t('como_adicionar_foto'), [
      { text: t('tirar_foto'), onPress: () => tirarFoto(setter, true) },
      { text: t('escolher_galeria'), onPress: () => tirarFoto(setter, false) },
      { text: t('cancelar'), style: 'cancel' },
    ]);
  };

  const uploadFoto = async (uri: string, userId: string, nomeArquivo: string): Promise<string | null> => {
    try {
      const extensao = uri.split('.').pop()?.split('?')[0] ?? 'jpg';
      const caminho = `${userId}/${nomeArquivo}.${extensao}`;
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        name: `${nomeArquivo}.${extensao}`,
        type: `image/${extensao}`,
      } as any);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const res = await fetch(
        `${SUPABASE_URL}/storage/v1/object/documentos/${caminho}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'x-upsert': 'true',
          },
          body: formData,
        }
      );

      if (!res.ok) {
        console.error('Erro upload status:', res.status);
        return null;
      }
      return caminho;
    } catch (e) {
      console.error('Erro ao fazer upload:', e);
      return null;
    }
  };

  const FotoBox = ({
    foto, setter, titulo, desc, icone
  }: {
    foto: string | null;
    setter: (uri: string) => void;
    titulo: string;
    desc: string;
    icone: string;
  }) => (
    <TouchableOpacity style={[styles.fotoBox, foto && styles.fotoBoxPreenchida]} onPress={() => escolherFoto(setter)}>
      {foto ? (
        <Image source={{ uri: foto }} style={styles.fotoPreview} />
      ) : (
        <View style={styles.fotoPlaceholder}>
          <Text style={styles.fotoIcone}>{icone}</Text>
          <Text style={styles.fotoTitulo}>{titulo}</Text>
          <Text style={styles.fotoDesc}>{desc}</Text>
          <View style={styles.fotoBtn}>
            <Text style={styles.fotoBtnText}>+ {t('adicionar')}</Text>
          </View>
        </View>
      )}
      {foto && (
        <View style={styles.fotoEditarBadge}>
          <Text style={styles.fotoEditarText}>✏️ {t('editar')}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const registar = async () => {
    if (!nome || !telefone || !numeroDocumento || !nascimento) {
      Alert.alert(t('erro'), t('preencha_campos'));
      return;
    }

    const codigoUpper = codigoConvite.trim().toUpperCase();
    if (!CODIGOS_VALIDOS.includes(codigoUpper)) {
      Alert.alert('❌ ' + t('codigo_invalido'), t('codigo_invalido_desc'));
      return;
    }

    setLoading(true);
    try {
      const numeroCompleto = '258' + telefone;
      const emailFicticio = `${numeroCompleto}@domesticamoz.app`;
      const password = codigoUpper + numeroCompleto;

      let userId: string | null = null;

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: emailFicticio,
        password: password,
        options: { data: { telefone: numeroCompleto, codigo_convite: codigoUpper } }
      });

      if (signUpError && signUpError.message.includes('already registered')) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: emailFicticio,
          password: password,
        });
        if (signInError) {
          Alert.alert(t('erro'), t('ja_tem_conta'));
          setLoading(false);
          return;
        }
        userId = signInData?.user?.id ?? null;
      } else if (signUpError) {
        Alert.alert(t('erro'), signUpError.message);
        setLoading(false);
        return;
      } else {
        userId = signUpData?.user?.id ?? null;
      }

      if (!userId) {
        Alert.alert(t('erro'), t('erro_criar_conta'));
        setLoading(false);
        return;
      }

      let urlFrente = null, urlSelfie = null;
      if (fotoDocumentoFrente) urlFrente = await uploadFoto(fotoDocumentoFrente, userId, 'doc_frente');
      if (fotoSelfieDocumento) urlSelfie = await uploadFoto(fotoSelfieDocumento, userId, 'selfie_doc');

      const { error: upsertError } = await supabase.from('utilizadores').upsert({
        id: userId,
        nome_completo: nome,
        numero_telemovel: numeroCompleto,
        tipo: tipo || 'trabalhadora',
        numero_bi: numeroDocumento,
        data_nascimento: nascimento,
        foto_bi_url: urlFrente,
        foto_selfie_bi_url: urlSelfie,
        estado: 'pendente_verificacao',
        actualizado_em: new Date().toISOString(),
      }, { onConflict: 'id' });

      if (upsertError) {
        console.error('Erro upsert:', upsertError.message);
      }

      await AsyncStorage.setItem('tipoUser', tipo);
      await AsyncStorage.setItem('codigo_convite_valido', 'true');

      Alert.alert('✅ ' + t('conta_criada'), t('conta_criada_desc'), [
        { text: t('seguinte'), onPress: () => router.replace('/') }
      ]);

    } catch (e) {
      Alert.alert(t('erro'), t('sem_ligacao'));
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← {t('voltar')}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{t('criar_conta')}</Text>
      <Text style={styles.subtitle}>{t('preencha_dados')}</Text>

      {tipo !== '' && (
        <View style={[styles.tipoBadge, tipo === 'empregador' ? styles.tipoBadgeEmpregador : styles.tipoBadgeTrabalhadora]}>
          <Text style={[styles.tipoBadgeText, tipo === 'empregador' ? styles.tipoBadgeTextEmpregador : styles.tipoBadgeTextTrabalhadora]}>
            {tipo === 'trabalhadora' ? '👩 ' + t('registar_como_trabalhadora') : '🏠 ' + t('registar_como_empregador')}
          </Text>
        </View>
      )}

      <Text style={styles.seccaoTitulo}>📸 {t('foto_perfil')}</Text>
      <FotoBox foto={fotoPerfil} setter={setFotoPerfil} titulo={t('foto_perfil')} desc={t('foto_perfil_desc')} icone="🤳" />

      <Text style={styles.seccaoTitulo}>👤 {t('dados_pessoais')}</Text>

      <Text style={styles.label}>{t('nome_completo')} *</Text>
      <TextInput style={styles.input} placeholder={t('nome_apelido')} value={nome} onChangeText={setNome} />

      <Text style={styles.label}>{t('numero_telemovel')} *</Text>
      <View style={styles.phoneRow}>
        <View style={styles.prefixBox}>
          <Text style={styles.prefixText}>🇲🇿 +258</Text>
        </View>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="84 XXX XXXX"
          keyboardType="phone-pad"
          maxLength={9}
          value={telefone}
          onChangeText={setTelefone}
        />
      </View>
      <View style={{ marginBottom: 16 }} />

      <Text style={styles.label}>{t('codigo_convite')} *</Text>
      <TextInput
        style={styles.input}
        placeholder={t('codigo_placeholder')}
        value={codigoConvite}
        onChangeText={setCodigoConvite}
        autoCapitalize="characters"
        autoCorrect={false}
      />

      <Text style={styles.label}>{t('data_nascimento')} *</Text>
      <TextInput style={styles.input} placeholder="AAAA-MM-DD" value={nascimento} onChangeText={setNascimento} />

      <Text style={styles.label}>{t('nacionalidade')}</Text>
      <View style={styles.chipGrid}>
        {['Moçambicana', 'Portuguesa', 'Brasileira', 'Sul-africana', 'Zimbabueana', t('outra')].map(n => (
          <TouchableOpacity key={n} style={[styles.chip, nacionalidade === n && styles.chipActive]}
            onPress={() => setNacionalidade(n)}>
            <Text style={[styles.chipText, nacionalidade === n && styles.chipTextActive]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.seccaoTitulo}>🪪 {t('documento_identidade')}</Text>

      <Text style={styles.label}>{t('tipo_documento')} *</Text>
      <View style={styles.tipoDocRow}>
        <TouchableOpacity
          style={[styles.tipoDocBtn, tipoDocumento === 'bi' && styles.tipoDocBtnActive]}
          onPress={() => setTipoDocumento('bi')}>
          <Text style={[styles.tipoDocText, tipoDocumento === 'bi' && styles.tipoDocTextActive]}>🪪 {t('bi')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tipoDocBtn, tipoDocumento === 'passaporte' && styles.tipoDocBtnActive]}
          onPress={() => setTipoDocumento('passaporte')}>
          <Text style={[styles.tipoDocText, tipoDocumento === 'passaporte' && styles.tipoDocTextActive]}>📘 {t('passaporte')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>{tipoDocumento === 'bi' ? t('numero_bi') : t('numero_passaporte')} *</Text>
      <TextInput
        style={styles.input}
        placeholder={tipoDocumento === 'bi' ? 'Ex: 123456789A' : 'Ex: A1234567'}
        value={numeroDocumento}
        onChangeText={setNumeroDocumento}
        autoCapitalize="characters"
      />

      <Text style={styles.label}>{t('validade_documento')}</Text>
      <TextInput style={styles.input} placeholder="AAAA-MM-DD" value={validadeDocumento} onChangeText={setValidadeDocumento} />

      <Text style={styles.seccaoTitulo}>📷 {t('fotos_documento')}</Text>
      <Text style={styles.seccaoDesc}>{t('fotos_documento_desc')}</Text>

      <FotoBox foto={fotoDocumentoFrente} setter={setFotoDocumentoFrente}
        titulo={tipoDocumento === 'bi' ? t('bi_frente') : t('passaporte_pagina')}
        desc={t('fotografe_documento')} icone="🪪" />

      {tipoDocumento === 'bi' && (
        <FotoBox foto={fotoDocumentoVerso} setter={setFotoDocumentoVerso}
          titulo={t('bi_verso')} desc={t('fotografe_verso')} icone="🔄" />
      )}

      <FotoBox foto={fotoSelfieDocumento} setter={setFotoSelfieDocumento}
        titulo={t('selfie_com_documento')}
        desc={t('selfie_desc')} icone="🤳" />

      <View style={styles.notaVerificacao}>
        <Text style={styles.notaVerificacaoTexto}>🔒 {t('nota_privacidade_fotos')}</Text>
      </View>

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={registar}
        disabled={loading}>
        <Text style={styles.btnText}>{loading ? t('a_criar_conta') : t('criar_conta')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(tabs)/explore')} style={styles.linkRow}>
        <Text style={styles.linkText}>{t('ja_tenho_conta')} {t('entrar')}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', padding: 24, paddingTop: 60 },
  backBtn: { marginBottom: 16 },
  backText: { color: '#1D9E75', fontSize: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1D9E75', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#888780', marginBottom: 24 },
  seccaoTitulo: { fontSize: 16, fontWeight: '700', color: '#333', marginTop: 16, marginBottom: 12 },
  seccaoDesc: { fontSize: 13, color: '#888', marginBottom: 12, lineHeight: 20 },
  tipoBadge: { borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1 },
  tipoBadgeTrabalhadora: { backgroundColor: '#e8f5f0', borderColor: '#b2dfcf' },
  tipoBadgeEmpregador: { backgroundColor: '#EBF4FF', borderColor: '#bfdbf7' },
  tipoBadgeText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  tipoBadgeTextTrabalhadora: { color: '#1D9E75' },
  tipoBadgeTextEmpregador: { color: '#185FA5' },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#D3D1C7', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
  phoneRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  prefixBox: { backgroundColor: '#f0f0ea', borderRadius: 12, padding: 16, justifyContent: 'center' },
  prefixText: { fontSize: 14, color: '#333', fontWeight: '600' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0ea', borderWidth: 1, borderColor: '#e0e0da' },
  chipActive: { backgroundColor: '#1D9E75', borderColor: '#1D9E75' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  tipoDocRow: { gap: 8, marginBottom: 16 },
  tipoDocBtn: { padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#D3D1C7', alignItems: 'center', backgroundColor: '#f9f9f7' },
  tipoDocBtnActive: { backgroundColor: '#1D9E75', borderColor: '#1D9E75' },
  tipoDocText: { fontSize: 14, fontWeight: '600', color: '#555' },
  tipoDocTextActive: { color: '#fff' },
  fotoBox: { borderWidth: 2, borderColor: '#e0e0da', borderRadius: 16, borderStyle: 'dashed', marginBottom: 12, overflow: 'hidden', minHeight: 140 },
  fotoBoxPreenchida: { borderStyle: 'solid', borderColor: '#1D9E75' },
  fotoPlaceholder: { padding: 24, alignItems: 'center' },
  fotoIcone: { fontSize: 36, marginBottom: 8 },
  fotoTitulo: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 4 },
  fotoDesc: { fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 12 },
  fotoBtn: { backgroundColor: '#1D9E75', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  fotoBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  fotoPreview: { width: '100%', height: 180 },
  fotoEditarBadge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  fotoEditarText: { color: '#fff', fontSize: 12 },
  notaVerificacao: { backgroundColor: '#e8f5f0', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#b2dfcf' },
  notaVerificacaoTexto: { fontSize: 13, color: '#1D9E75', lineHeight: 20 },
  btn: { backgroundColor: '#1D9E75', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnDisabled: { backgroundColor: '#aaa' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkRow: { alignItems: 'center', marginTop: 20 },
  linkText: { color: '#1D9E75', fontSize: 14 },
});