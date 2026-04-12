import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const DIAS_TRIAL = 30;

export const verificarSubscricao = async (): Promise<{
  activa: boolean;
  diasRestantes: number;
  expirada: boolean;
}> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { activa: false, diasRestantes: 0, expirada: false };
    }

    // Verificar data de registo guardada localmente
    let dataRegisto = await AsyncStorage.getItem('data_registo');

    if (!dataRegisto) {
      // Primeira vez — guardar data actual
      dataRegisto = new Date().toISOString();
      await AsyncStorage.setItem('data_registo', dataRegisto);
    }

    const dataInicio = new Date(dataRegisto);
    const dataExpiracao = new Date(dataInicio);
    dataExpiracao.setDate(dataExpiracao.getDate() + DIAS_TRIAL);

    const agora = new Date();
    const diasRestantes = Math.ceil((dataExpiracao.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24));
    const expirada = agora > dataExpiracao;

    return {
      activa: !expirada,
      diasRestantes: Math.max(0, diasRestantes),
      expirada,
    };

  } catch (e) {
    return { activa: true, diasRestantes: 30, expirada: false };
  }
};

export const formatarDiasRestantes = (dias: number): string => {
  if (dias <= 0) return 'Expirada';
  if (dias === 1) return '1 dia restante';
  if (dias <= 7) return `${dias} dias restantes ⚠️`;
  return `${dias} dias restantes`;
};