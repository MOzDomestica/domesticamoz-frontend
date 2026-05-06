import { Platform } from 'react-native';

// ─── PALETA DE CORES ───────────────────────────────────────────
export const Palette = {
  verde: '#1F8A70',
  verdeSecundario: '#2FBF9B',
  verdeClaro: '#E8F5F0',
  verdeMedio: '#B2DFCF',
  laranja: '#F59E0B',
  laranjaClaro: '#FEF3C7',
  fundo: '#F9FAFB',
  branco: '#FFFFFF',
  textoPrincipal: '#1F2937',
  textoSecundario: '#6B7280',
  borda: '#E5E7EB',
  bordaFoco: '#1F8A70',
  erro: '#EF4444',
  erroClaro: '#FEE2E2',
  sucesso: '#10B981',
  aviso: '#F59E0B',
  cinzaClaro: '#F3F4F6',
  cinzaMedio: '#D1D5DB',
  sombra: 'rgba(0, 0, 0, 0.06)',
};

// ─── CORES DO APP ──────────────────────────────────────────────
export const Colors = {
  light: {
    text: Palette.textoPrincipal,
    background: Palette.fundo,
    tint: Palette.verde,
    icon: Palette.textoSecundario,
    tabIconDefault: Palette.textoSecundario,
    tabIconSelected: Palette.verde,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: Palette.verdeSecundario,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: Palette.verdeSecundario,
  },
};

// ─── TIPOGRAFIA ────────────────────────────────────────────────
export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: Palette.textoPrincipal, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, color: Palette.textoPrincipal, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const, color: Palette.textoPrincipal },
  h4: { fontSize: 16, fontWeight: '600' as const, color: Palette.textoPrincipal },
  body: { fontSize: 15, fontWeight: '400' as const, color: Palette.textoPrincipal, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, color: Palette.textoSecundario, lineHeight: 20 },
  caption: { fontSize: 11, fontWeight: '400' as const, color: Palette.textoSecundario },
  label: { fontSize: 14, fontWeight: '600' as const, color: Palette.textoPrincipal },
  btn: { fontSize: 16, fontWeight: '700' as const, color: Palette.branco },
  btnSmall: { fontSize: 13, fontWeight: '600' as const, color: Palette.branco },
};

// ─── ESPAÇAMENTO ───────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ─── BORDAS ────────────────────────────────────────────────────
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};

// ─── SOMBRAS ───────────────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ─── COMPONENTES REUTILIZÁVEIS ─────────────────────────────────
export const Components = {
  // Botão principal
  btnPrimario: {
    backgroundColor: Palette.verde,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...Shadows.md,
  },
  // Botão secundário
  btnSecundario: {
    backgroundColor: Palette.branco,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1.5,
    borderColor: Palette.verde,
  },
  // Botão fantasma
  btnFantasma: {
    backgroundColor: 'transparent',
    borderRadius: Radius.lg,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  // Input
  input: {
    backgroundColor: Palette.branco,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Palette.borda,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 15,
    color: Palette.textoPrincipal,
  },
  // Card
  card: {
    backgroundColor: Palette.branco,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  // Card elevado
  cardElevado: {
    backgroundColor: Palette.branco,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  // Badge verde
  badgeVerde: {
    backgroundColor: Palette.verdeClaro,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Palette.verdeMedio,
  },
  // Badge laranja
  badgeLaranja: {
    backgroundColor: Palette.laranjaClaro,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  // Separador
  separador: {
    height: 1,
    backgroundColor: Palette.borda,
    marginVertical: Spacing.md,
  },
};

// ─── FONTES ────────────────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});