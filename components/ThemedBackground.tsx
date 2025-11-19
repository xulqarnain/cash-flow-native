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

  if (theme === 'glass-blur') {
    return (
      <BlurView
        intensity={isDark ? 60 : 80}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.container, { backgroundColor: isDark ? 'rgba(8, 51, 68, 0.7)' : 'rgba(240, 253, 250, 0.7)' }, style]}
      >
        {children}
      </BlurView>
    );
  }

  if (theme === 'gradient-black') {
    return (
      <LinearGradient
        colors={isDark ? ['rgba(0, 0, 0, 0.98)', 'rgba(15, 23, 42, 0.95)', 'rgba(8, 51, 68, 0.92)'] : ['rgba(240, 253, 250, 1)', 'rgba(207, 250, 254, 1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  // solid-black
  return (
    <Animated.View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#f0fdfa' }, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
