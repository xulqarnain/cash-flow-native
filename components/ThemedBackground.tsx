import { ReactNode } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated from 'react-native-reanimated';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ThemedBackgroundProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function ThemedBackground({ children, style }: ThemedBackgroundProps) {
  const { theme } = useAppTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Modern financial app gradient - always use gradient with glass effect
  if (theme === 'glass-blur') {
    return (
      <LinearGradient
        colors={isDark
          ? ['#0a0f1c', '#0d1b2a', '#1b263b', '#415a77']
          : ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  if (theme === 'gradient-black') {
    return (
      <LinearGradient
        colors={isDark
          ? ['#000000', '#0f172a', '#1e293b', '#334155']
          : ['#f8fafc', '#e2e8f0', '#cbd5e1', '#94a3b8']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  // solid-black - still use subtle gradient for premium feel
  return (
    <LinearGradient
      colors={isDark
        ? ['#000000', '#0a0a0a', '#141414']
        : ['#ffffff', '#f9fafb', '#f3f4f6']
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
