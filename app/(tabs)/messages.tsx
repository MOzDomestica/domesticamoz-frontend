import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function MessagesScreen() {
  const router = useRouter();
  const [mensagem, setMensagem] = useState('');
  const [mensagens, setMensagens] = useState([
    { id: '1', texto: 'Olá! Vi o seu perfil e gostei muito. Está disponível para começar na próxima semana?', meu: false, hora: '14:32' },
    { id: '2', texto: 'Boa tarde! Sim, estou disponível. Pode dizer-me mais sobre o trabalho?', meu: true, hora: '14:35' },
    { id: '3', texto: 'Claro! É uma casa de 3 quartos, somos 4 pessoas. Precisamos de alguém de segunda a sexta.', meu: false, hora: '14:36' },
  ]);

  const enviar = () => {
    if (!mensagem.trim()) return;
    setMensagens(prev => [...prev, {
      id: Date.now().toString(),
      texto: mensagem,
      meu: true,
      hora: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    }]);
    setMensagem('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>M</Text>
            </View>
            <View>
              <Text style={styles.headerNome}>Maria João</Text>
              <Text style={styles.headerTipo}>Empregada Doméstica</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.btnContrato} onPress={() => router.push('/(tabs)/contract')}>
            <Text style={styles.btnContratoText}>Contrato</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.mensagensContainer}>
          {mensagens.map(m => (
            <View key={m.id} style={[styles.mensagemWrapper, m.meu ? styles.meuWrapper : styles.delesWrapper]}>
              <View style={[styles.bolha, m.meu ? styles.minhaBolha : styles.deleBolha]}>
                <Text style={[styles.bolhaTexto, m.meu ? styles.meuTexto : styles.deleTexto]}>{m.texto}</Text>
                <Text style={styles.hora}>{m.hora}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Escreva uma mensagem..."
            value={mensagem}
            onChangeText={setMensagem}
            multiline
          />
          <TouchableOpacity style={styles.btnEnviar} onPress={enviar}>
            <Text style={styles.btnEnviarText}>➤</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
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
  mensagemWrapper: { marginBottom: 12 },
  meuWrapper: { alignItems: 'flex-end' },
  delesWrapper: { alignItems: 'flex-start' },
  bolha: { maxWidth: '80%', borderRadius: 16, padding: 12 },
  minhaBolha: { backgroundColor: '#1D9E75', borderBottomRightRadius: 4 },
  deleBolha: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  bolhaTexto: { fontSize: 14, lineHeight: 20 },
  meuTexto: { color: '#fff' },
  deleTexto: { color: '#333' },
  hora: { fontSize: 10, color: '#888', marginTop: 4, textAlign: 'right' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#fff', padding: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#D3D1C7', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
  btnEnviar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1D9E75', alignItems: 'center', justifyContent: 'center' },
  btnEnviarText: { color: '#fff', fontSize: 18 },
});