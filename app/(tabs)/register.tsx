import { supabase } from '@/constants/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const [nome, setNome] = useState<string>('');
  const [telefone, setTelefone] = useState<string>('');
  const [tipoDocumento, setTipoDocumento] = useState<'bi' | 'passaporte'>('bi');
  const [numeroDocumento, setNumeroDocumento] = useState<string>('');
  const [validadeDocumento, setValidadeDocumento] = useState<string>('');
  const [nascimento, setNascimento] = useState<string>('');
  const [nacionalidade, setNacionalidade] = useState<string>('Moçambicana');
  const [tipo, setTipo] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Fotos
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [fotoDocumentoFrente, setFotoDocumentoFrente] = useState<string | null>(null);
  const [fotoDocumentoVerso, setFotoDocumentoVerso] = useState<string | null>(null);
  const [fotoSelfieDocumento, setFotoSelfieDocumento] = useState<string | null>(null);

  const router = useRouter();
  const { tipo: tipoParam } = useLocalSearchParams();

  useEffect(() => {
    if (tipoParam && tipoParam !== '') {
      const t = Array.isArray(tipoParam) ? tipoParam[0] : tipoParam;
      setTipo(t);
      AsyncStorage.setItem('tipoUser', t);
    }
  }, [tipoParam]);

  const tirarFoto = async (setter: (uri: string) => void, usarCamera = true) => {
    const permissao = usarCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Precisa de permitir o acesso à câmara ou galeria.');
      return;
    }

    const resultado = usarCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true, aspect: [4, 3] })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true, aspect: [4, 3] });

    if (!resultado.canceled && resultado.assets[0]) {
      setter(resultado.assets[0].uri);
    }
  };

  const escolherFoto = (setter: (uri: string) => void) => {
    Alert.alert('Adicionar foto', 'Como quer adicionar a foto?', [
      { text: 'Tirar foto', onPress: () => tirarFoto(setter, true) },
      { text: 'Escolher da galeria', onPress: () => tirarFoto(setter, false) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
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
            <Text style={styles.fotoBtnText}>+ Adicionar</Text>
          </View>
        </View>
      )}
      {foto && (
        <View style={styles.fotoEditarBadge}>
          <Text style={styles.fotoEditarText}>✏️ Editar</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const registar = async () => {
    if (!nome || !telefone || !numeroDocumento || !nascimento) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: '+258' + telefone,
      });

      if (error) {
        Alert.alert('Erro', error.message);
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem('registo_nome', nome);
      await AsyncStorage.setItem('registo_documento', numeroDocumento);
      await AsyncStorage.setItem('registo_tipo_documento', tipoDocumento);
      await AsyncStorage.setItem('registo_validade', validadeDocumento);
      await AsyncStorage.setItem('registo_nascimento', nascimento);
      await AsyncStorage.setItem('registo_nacionalidade', nacionalidade);
      await AsyncStorage.setItem('tipoUser', tipo);

      router.push({ pathname: '/(tabs)/verify', params: { phone: '+258' + telefone } });

    } catch (e) {
      Alert.alert('Erro', 'Sem ligação ao servidor');
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Criar conta</Text>
      <Text style={styles.subtitle}>Preencha os seus dados</Text>

      {/* BADGE TIPO */}
      {tipo !== '' && (
        <View style={[styles.tipoBadge, tipo === 'empregador' ? styles.tipoBadgeEmpregador : styles.tipoBadgeTrabalhadora]}>
          <Text style={[styles.tipoBadgeText, tipo === 'empregador' ? styles.tipoBadgeTextEmpregador : styles.tipoBadgeTextTrabalhadora]}>
            {tipo === 'trabalhadora' ? '👩 A registar como Trabalhadora' : '🏠 A registar como Empregador'}
          </Text>
        </View>
      )}

      {/* FOTO DE PERFIL */}
      <Text style={styles.seccaoTitulo}>📸 Foto de perfil</Text>
      <FotoBox
        foto={fotoPerfil}
        setter={setFotoPerfil}
        titulo="Foto de perfil"
        desc="Tire uma selfie clara do seu rosto"
        icone="🤳"
      />

      {/* DADOS PESSOAIS */}
      <Text style={styles.seccaoTitulo}>👤 Dados pessoais</Text>

      <Text style={styles.label}>Nome completo *</Text>
      <TextInput style={styles.input} placeholder="Nome e apelido" value={nome} onChangeText={setNome} />

      <Text style={styles.label}>Número de telemóvel *</Text>
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

      <Text style={styles.label}>Data de nascimento *</Text>
      <TextInput style={styles.input} placeholder="AAAA-MM-DD" value={nascimento} onChangeText={setNascimento} />

      <Text style={styles.label}>Nacionalidade</Text>
      <View style={styles.chipGrid}>
        {['Moçambicana', 'Portuguesa', 'Brasileira', 'Sul-africana', 'Zimbabueana', 'Outra'].map(n => (
          <TouchableOpacity key={n} style={[styles.chip, nacionalidade === n && styles.chipActive]}
            onPress={() => setNacionalidade(n)}>
            <Text style={[styles.chipText, nacionalidade === n && styles.chipTextActive]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* DOCUMENTO */}
      <Text style={styles.seccaoTitulo}>🪪 Documento de identidade</Text>

      <Text style={styles.label}>Tipo de documento *</Text>
      <View style={styles.tipoDocRow}>
        <TouchableOpacity
          style={[styles.tipoDocBtn, tipoDocumento === 'bi' && styles.tipoDocBtnActive]}
          onPress={() => setTipoDocumento('bi')}>
          <Text style={[styles.tipoDocText, tipoDocumento === 'bi' && styles.tipoDocTextActive]}>🪪 Bilhete de Identidade</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tipoDocBtn, tipoDocumento === 'passaporte' && styles.tipoDocBtnActive]}
          onPress={() => setTipoDocumento('passaporte')}>
          <Text style={[styles.tipoDocText, tipoDocumento === 'passaporte' && styles.tipoDocTextActive]}>📘 Passaporte</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>{tipoDocumento === 'bi' ? 'Número de BI *' : 'Número de passaporte *'}</Text>
      <TextInput
        style={styles.input}
        placeholder={tipoDocumento === 'bi' ? 'Ex: 123456789A' : 'Ex: A1234567'}
        value={numeroDocumento}
        onChangeText={setNumeroDocumento}
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Data de validade do documento</Text>
      <TextInput style={styles.input} placeholder="AAAA-MM-DD" value={validadeDocumento} onChangeText={setValidadeDocumento} />

      {/* FOTOS DO DOCUMENTO */}
      <Text style={styles.seccaoTitulo}>📷 Fotos do documento</Text>
      <Text style={styles.seccaoDesc}>As fotos ajudam a verificar a sua identidade e aumentam a confiança no seu perfil.</Text>

      <FotoBox
        foto={fotoDocumentoFrente}
        setter={setFotoDocumentoFrente}
        titulo={tipoDocumento === 'bi' ? 'BI — frente' : 'Passaporte — página principal'}
        desc="Fotografe o documento claramente"
        icone="🪪"
      />

      {tipoDocumento === 'bi' && (
        <FotoBox
          foto={fotoDocumentoVerso}
          setter={setFotoDocumentoVerso}
          titulo="BI — verso"
          desc="Fotografe o verso do BI"
          icone="🔄"
        />
      )}

      <FotoBox
        foto={fotoSelfieDocumento}
        setter={setFotoSelfieDocumento}
        titulo="Selfie com documento"
        desc="Segure o documento perto do rosto e tire uma foto"
        icone="🤳"
      />

      <View style={styles.notaVerificacao}>
        <Text style={styles.notaVerificacaoTexto}>🔒 As suas fotos são usadas apenas para verificação de identidade e não são partilhadas publicamente.</Text>
      </View>

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={registar}
        disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'A criar conta...' : 'Criar conta'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(tabs)/explore')} style={styles.linkRow}>
        <Text style={styles.linkText}>Já tenho conta? Entrar</Text>
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