import AsyncStorage from '@react-native-async-storage/async-storage';

type Lingua = 'pt' | 'en';

const traducoes: Record<Lingua, Record<string, string>> = {
  pt: {
    app_nome: 'DomésticaMoz',
    app_slogan: 'Emprego doméstico de confiança',
    guardar: 'Guardar',
    cancelar: 'Cancelar',
    seguinte: 'Seguinte',
    anterior: 'Anterior',
    voltar: 'Voltar',
    erro: 'Erro',
    sucesso: 'Sucesso',
    carregando: 'A carregar...',
    sou_trabalhadora: 'Sou Trabalhadora',
    sou_empregador: 'Sou Empregador',
    ja_tenho_conta: 'Já tenho conta?',
    entrar: 'Entrar',
    como_usar: 'Como quer usar a app?',
    trabalhadora_desc: 'Encontre emprego doméstico de confiança',
    empregador_desc: 'Encontre a trabalhadora ideal para si',
    plataforma_segura: 'Plataforma segura e verificada',
    criar_conta: 'Criar conta',
    preencha_dados: 'Preencha os seus dados',
    nome_completo: 'Nome completo',
    numero_telemovel: 'Número de telemóvel',
    tipo_documento: 'Tipo de documento',
    numero_bi: 'Número de BI',
    numero_passaporte: 'Número de passaporte',
    data_nascimento: 'Data de nascimento',
    validade_documento: 'Data de validade do documento',
    nacionalidade: 'Nacionalidade',
    bi: 'Bilhete de Identidade (BI)',
    passaporte: 'Passaporte',
    foto_perfil: 'Foto de perfil',
    foto_bi_frente: 'Foto do BI (frente)',
    foto_bi_verso: 'Foto do BI (verso)',
    foto_passaporte: 'Foto do passaporte',
    selfie_com_documento: 'Selfie com documento visível',
    tirar_foto: 'Tirar foto',
    escolher_galeria: 'Escolher da galeria',
    meus_matches: 'Os meus matches',
    propostas_recebidas: 'Propostas recebidas',
    ver_perfil: 'Ver perfil',
    responder: 'Responder',
    notificacoes: 'Notificações',
    sem_notificacoes: 'Sem notificações',
    limpar_tudo: 'Limpar tudo',
    definicoes: 'Definições',
    lingua_app: 'Língua da app',
    sobre: 'Sobre',
    subscricao_necessaria: 'Subscrição necessária',
    plano_mensal: 'Plano Mensal',
    plano_anual: 'Plano Anual',
    subscrever: 'Subscrever agora',
    acesso_convite: 'Acesso por convite',
    entrar_codigo: 'Entrar com código',
    guardar_perfil: 'Guardar perfil',
    publicar_anuncio: 'Publicar anúncio',
  },
  en: {
    app_nome: 'DomésticaMoz',
    app_slogan: 'Trusted domestic employment',
    guardar: 'Save',
    cancelar: 'Cancel',
    seguinte: 'Next',
    anterior: 'Previous',
    voltar: 'Back',
    erro: 'Error',
    sucesso: 'Success',
    carregando: 'Loading...',
    sou_trabalhadora: 'I am a Worker',
    sou_empregador: 'I am an Employer',
    ja_tenho_conta: 'Already have an account?',
    entrar: 'Sign in',
    como_usar: 'How do you want to use the app?',
    trabalhadora_desc: 'Find trusted domestic employment',
    empregador_desc: 'Find the ideal worker for you',
    plataforma_segura: 'Safe and verified platform',
    criar_conta: 'Create account',
    preencha_dados: 'Fill in your details',
    nome_completo: 'Full name',
    numero_telemovel: 'Phone number',
    tipo_documento: 'Document type',
    numero_bi: 'ID number',
    numero_passaporte: 'Passport number',
    data_nascimento: 'Date of birth',
    validade_documento: 'Document expiry date',
    nacionalidade: 'Nationality',
    bi: 'Identity Card (BI)',
    passaporte: 'Passport',
    foto_perfil: 'Profile photo',
    foto_bi_frente: 'ID card photo (front)',
    foto_bi_verso: 'ID card photo (back)',
    foto_passaporte: 'Passport photo',
    selfie_com_documento: 'Selfie with visible document',
    tirar_foto: 'Take photo',
    escolher_galeria: 'Choose from gallery',
    meus_matches: 'My matches',
    propostas_recebidas: 'Received proposals',
    ver_perfil: 'View profile',
    responder: 'Reply',
    notificacoes: 'Notifications',
    sem_notificacoes: 'No notifications',
    limpar_tudo: 'Clear all',
    definicoes: 'Settings',
    lingua_app: 'App language',
    sobre: 'About',
    subscricao_necessaria: 'Subscription required',
    plano_mensal: 'Monthly Plan',
    plano_anual: 'Annual Plan',
    subscrever: 'Subscribe now',
    acesso_convite: 'Invite access',
    entrar_codigo: 'Enter with code',
    guardar_perfil: 'Save profile',
    publicar_anuncio: 'Publish ad',
  },
};

let linguaActual: Lingua = 'pt';

export const setLingua = async (lingua: Lingua) => {
  linguaActual = lingua;
  await AsyncStorage.setItem('lingua', lingua);
};

export const getLingua = async (): Promise<Lingua> => {
  const lingua = await AsyncStorage.getItem('lingua');
  if (lingua === 'pt' || lingua === 'en') {
    linguaActual = lingua;
    return lingua;
  }
  return 'pt';
};

export const t = (chave: string): string => {
  return traducoes[linguaActual][chave] || chave;
};

export default { t, setLingua, getLingua };