import { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  Easing,
  withTiming,
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BorderRadius, Shadows, Spacing, Typography, Gradients } from '@/constants/Theme';

interface GlassCardProps {
  title: string;
  value: string;
  subtitle?: string;
  variant?: 'primary' | 'success' | 'danger';
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export function GlassCard({ title, value, subtitle, variant = 'primary' }: GlassCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const gradientColors = {
    primary: isDark ? ['#6366f1', '#8b5cf6', '#d946ef'] : Gradients.primary,
    success: isDark ? ['#10b981', '#14b8a6', '#06b6d4'] : Gradients.success,
    danger: isDark ? ['#ef4444', '#f43f5e', '#ec4899'] : Gradients.danger,
  };

  return (
    <AnimatedLinearGradient
      colors={gradientColors[variant]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, Shadows.lg, animatedStyle]}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </AnimatedLinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    minHeight: 140,
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.sizes.sm,
    color: '#ffffff',
    opacity: 0.95,
    marginBottom: Spacing.sm,
    fontWeight: Typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.extrabold,
    color: '#ffffff',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.xs,
    color: '#ffffff',
    opacity: 0.9,
    fontWeight: Typography.weights.medium,
  },
});
