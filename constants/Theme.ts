export const Colors = {
  light: {
    primary: '#06b6d4', // cyan
    primaryLight: '#22d3ee',
    primaryDark: '#0891b2',
    secondary: '#14b8a6', // teal
    success: '#10b981', // emerald
    successLight: '#34d399',
    danger: '#f43f5e', // rose
    dangerLight: '#fb7185',
    warning: '#f59e0b', // amber
    info: '#06b6d4', // cyan

    background: '#f0fdfa', // cyan tint
    backgroundSecondary: '#ccfbf1',
    surface: '#ffffff',
    surfaceElevated: '#ffffff',

    text: '#0f172a',
    textSecondary: '#0e7490',
    textTertiary: '#67e8f9',

    border: '#a5f3fc',
    borderLight: '#cffafe',

    shadow: 'rgba(6, 182, 212, 0.15)',
  },
  dark: {
    primary: '#22d3ee',
    primaryLight: '#67e8f9',
    primaryDark: '#06b6d4',
    secondary: '#2dd4bf',
    success: '#34d399',
    successLight: '#6ee7b7',
    danger: '#fb7185',
    dangerLight: '#fda4af',
    warning: '#fbbf24',
    info: '#22d3ee',

    background: '#083344', // deep cyan
    backgroundSecondary: '#0e7490',
    surface: '#164e63',
    surfaceElevated: '#155e75',

    text: '#ecfeff',
    textSecondary: '#a5f3fc',
    textTertiary: '#67e8f9',

    border: '#155e75',
    borderLight: '#0e7490',

    shadow: 'rgba(34, 211, 238, 0.3)',
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
  primary: ['#06b6d4', '#22d3ee', '#67e8f9'], // cyan gradient
  success: ['#10b981', '#14b8a6', '#22d3ee'], // emerald to cyan
  danger: ['#f43f5e', '#fb7185', '#fda4af'], // smooth rose
  ocean: ['#0891b2', '#06b6d4', '#22d3ee'], // deep to light cyan
  sunset: ['#f59e0b', '#fb923c', '#fca5a5'], // warm gradient
  aurora: ['#14b8a6', '#22d3ee', '#67e8f9'], // teal to cyan
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
