export const Colors = {
  light: {
    primary: '#6366f1', // indigo
    primaryLight: '#818cf8',
    primaryDark: '#4f46e5',
    secondary: '#ec4899', // pink
    success: '#10b981', // emerald
    successLight: '#34d399',
    danger: '#ef4444', // red
    dangerLight: '#f87171',
    warning: '#f59e0b', // amber
    info: '#3b82f6', // blue

    background: '#f8fafc',
    backgroundSecondary: '#f1f5f9',
    surface: '#ffffff',
    surfaceElevated: '#ffffff',

    text: '#0f172a',
    textSecondary: '#64748b',
    textTertiary: '#94a3b8',

    border: '#e2e8f0',
    borderLight: '#f1f5f9',

    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    primary: '#818cf8',
    primaryLight: '#a5b4fc',
    primaryDark: '#6366f1',
    secondary: '#f472b6',
    success: '#34d399',
    successLight: '#6ee7b7',
    danger: '#f87171',
    dangerLight: '#fca5a5',
    warning: '#fbbf24',
    info: '#60a5fa',

    background: '#0f172a',
    backgroundSecondary: '#1e293b',
    surface: '#1e293b',
    surfaceElevated: '#334155',

    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textTertiary: '#94a3b8',

    border: '#334155',
    borderLight: '#475569',

    shadow: 'rgba(0, 0, 0, 0.5)',
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
  sm: 8,
  base: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const Gradients = {
  primary: ['#6366f1', '#8b5cf6', '#d946ef'],
  success: ['#10b981', '#14b8a6', '#06b6d4'],
  danger: ['#ef4444', '#f43f5e', '#ec4899'],
  ocean: ['#0ea5e9', '#3b82f6', '#6366f1'],
  sunset: ['#f59e0b', '#f97316', '#ef4444'],
  aurora: ['#8b5cf6', '#d946ef', '#ec4899'],
};

export const Animation = {
  durations: {
    fast: 150,
    base: 250,
    slow: 400,
  },
  springs: {
    smooth: {
      damping: 15,
      stiffness: 150,
    },
    bouncy: {
      damping: 10,
      stiffness: 100,
    },
  },
};
