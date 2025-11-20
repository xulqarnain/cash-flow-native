export const Colors = {
  light: {
    // Professional fintech palette - inspired by Revolut, Stripe, N26
    primary: '#0066FF', // professional blue
    primaryLight: '#3B82F6',
    primaryDark: '#0052CC',
    secondary: '#6B7280', // neutral gray
    success: '#10B981', // emerald green for positive values
    successLight: '#34D399',
    danger: '#EF4444', // clean red for negative values
    dangerLight: '#F87171',
    warning: '#F59E0B', // amber
    info: '#0EA5E9', // sky blue

    background: '#FAFAFA', // light gray, easier on eyes than pure white
    backgroundSecondary: '#F5F5F5',
    surface: '#FFFFFF', // clean white cards
    surfaceElevated: '#FFFFFF',

    text: '#1A1A1A', // almost black, professional
    textSecondary: '#6B6B6B', // medium gray
    textTertiary: '#9CA3AF', // light gray

    border: '#E5E5E5', // very subtle borders
    borderLight: '#F0F0F0',

    shadow: 'rgba(0, 0, 0, 0.08)', // subtle realistic shadows
  },
  dark: {
    // True dark mode - inspired by modern fintech apps
    primary: '#3B82F6', // brighter blue for dark backgrounds
    primaryLight: '#60A5FA',
    primaryDark: '#2563EB',
    secondary: '#9CA3AF', // light gray
    success: '#10B981', // emerald
    successLight: '#34D399',
    danger: '#EF4444', // red
    dangerLight: '#F87171',
    warning: '#F59E0B', // amber
    info: '#0EA5E9', // sky blue

    background: '#0B0B0B', // true dark, not gray
    backgroundSecondary: '#151515',
    surface: '#1A1A1A', // slightly lighter for card contrast
    surfaceElevated: '#252525',

    text: '#FFFFFF', // pure white
    textSecondary: '#9CA3AF', // lighter gray
    textTertiary: '#6B7280', // medium gray

    border: '#2A2A2A', // very subtle in dark mode
    borderLight: '#1F1F1F',

    shadow: 'rgba(0, 0, 0, 0.4)', // darker shadows for depth
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
  // Subtle, professional shadows - no heavy blur effects
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
};

export const Gradients = {
  // Minimal gradients - only for CTAs and special elements
  primary: ['#0066FF', '#0052CC'], // subtle blue gradient
  success: ['#10B981', '#059669'], // emerald gradient
  danger: ['#EF4444', '#DC2626'], // red gradient
  warning: ['#F59E0B', '#D97706'], // amber gradient
  neutral: ['#6B7280', '#4B5563'], // gray gradient
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
