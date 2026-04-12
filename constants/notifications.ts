import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notificacao {
  id: string;
  tipo: 'match' | 'mensagem' | 'entrevista' | 'contrato' | 'avaliacao' | 'subscricao';
  titulo: string;
  mensagem: string;
  lida: boolean;
  data: string;
}

const CHAVE = 'notificacoes';

export const getNotificacoes = async (): Promise<Notificacao[]> => {
  try {
    const raw = await AsyncStorage.getItem(CHAVE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const adicionarNotificacao = async (
  tipo: Notificacao['tipo'],
  titulo: string,
  mensagem: string
): Promise<void> => {
  try {
    const lista = await getNotificacoes();
    const nova: Notificacao = {
      id: Date.now().toString(),
      tipo,
      titulo,
      mensagem,
      lida: false,
      data: new Date().toISOString(),
    };
    await AsyncStorage.setItem(CHAVE, JSON.stringify([nova, ...lista]));
  } catch {}
};

export const marcarTodasLidas = async (): Promise<void> => {
  try {
    const lista = await getNotificacoes();
    const actualizadas = lista.map(n => ({ ...n, lida: true }));
    await AsyncStorage.setItem(CHAVE, JSON.stringify(actualizadas));
  } catch {}
};

export const getTotalNaoLidas = async (): Promise<number> => {
  const lista = await getNotificacoes();
  return lista.filter(n => !n.lida).length;
};

export const limparNotificacoes = async (): Promise<void> => {
  await AsyncStorage.removeItem(CHAVE);
};

export const getIconeNotificacao = (tipo: Notificacao['tipo']): string => {
  switch (tipo) {
    case 'match': return '💚';
    case 'mensagem': return '💬';
    case 'entrevista': return '🤝';
    case 'contrato': return '📋';
    case 'avaliacao': return '⭐';
    case 'subscricao': return '⚠️';
    default: return '🔔';
  }
};

export const formatarData = (data: string): string => {
  const d = new Date(data);
  const agora = new Date();
  const diff = agora.getTime() - d.getTime();
  const minutos = Math.floor(diff / 60000);
  const horas = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);

  if (minutos < 1) return 'Agora mesmo';
  if (minutos < 60) return `${minutos}min atrás`;
  if (horas < 24) return `${horas}h atrás`;
  if (dias < 7) return `${dias}d atrás`;
  return d.toLocaleDateString('pt-PT');
};