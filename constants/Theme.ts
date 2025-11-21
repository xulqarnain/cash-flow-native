export const Colors = {
  light: {
    // Clean, Professional Palette (Stripe/Apple style)
    primary: '#2563EB', // Inter Blue - Trustworthy & Professional
    primaryLight: '#60A5FA',
    primaryDark: '#1E40AF',

    secondary: '#64748B', // Slate 500 - Perfect for secondary text

    success: '#059669', // Emerald 600 - Readable Green
    successLight: '#34D399',
    danger: '#DC2626', // Red 600 - Readable Red
    dangerLight: '#F87171',
    warning: '#D97706', // Amber 600
    info: '#0284C7', // Sky 600

    background: '#F1F5F9', // Slate 100 - Very subtle gray for app background
    backgroundSecondary: '#E2E8F0', // Slate 200

    surface: '#FFFFFF', // Pure White for cards
    surfaceElevated: '#FFFFFF',

    text: '#0F172A', // Slate 900 - High contrast black
    textSecondary: '#475569', // Slate 600
    textTertiary: '#94A3B8', // Slate 400

    border: '#E2E8F0', // Slate 200 - Subtle borders
    borderLight: '#F1F5F9',

    shadow: 'rgba(15, 23, 42, 0.05)', // Very subtle slate shadow
  },
  dark: {
    // Professional Dark Mode (Not Neon)
    primary: '#3B82F6',
    primaryLight: '#60A5FA',
    primaryDark: '#2563EB',

    secondary: '#94A3B8',

    success: '#10B981',
    successLight: '#34D399',
    danger: '#EF4444',
    dangerLight: '#F87171',
    warning: '#F59E0B',
    info: '#0EA5E9',

    background: '#0F172A', // Slate 900
    backgroundSecondary: '#1E293B', // Slate 800

    surface: '#1E293B', // Slate 800
    surfaceElevated: '#334155', // Slate 700

    text: '#F8FAFC', // Slate 50
    textSecondary: '#CBD5E1', // Slate 300
    textTertiary: '#64748B', // Slate 500

    border: '#334155',
    borderLight: '#1E293B',

    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const BorderRadius = {
  sm: 6,
  base: 12, // Standard modern radius
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  // Clean, modern, diffused shadows
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 8,
  },
  // Removed "glow" as it's not fit for clean UI
};

export const Gradients = {
  // Subtle gradients only
  primary: ['#2563EB', '#1D4ED8'],
  success: ['#059669', '#047857'],
  danger: ['#DC2626', '#B91C1C'],
  // No glass/overlay gradients needed for this clean look
};
