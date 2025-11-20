import { useEffect } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  Easing,
  withTiming,
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CurrencyText } from './CurrencyText';
import { BorderRadius, Shadows, Spacing, Typography, Colors } from '@/constants/Theme';

interface GlassCardProps {
  title: string;
  value: number;
  subtitle?: string;
  variant?: 'primary' | 'success' | 'danger';
}

export function GlassCard({ title, value, subtitle, variant = 'primary' }: GlassCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? Colors.dark : Colors.light;

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

  const bgColors = {
    primary: themeColors.primary,
    success: themeColors.success,
    danger: themeColors.danger,
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: bgColors[variant],
          borderColor: themeColors.border,
          borderWidth: 1
        },
        Shadows.lg,
        animatedStyle
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      <CurrencyText
        amount={value}
        symbolSize={14}
        amountSize={Typography.sizes['4xl']}
        color="#ffffff"
      />
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Animated.View>
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
