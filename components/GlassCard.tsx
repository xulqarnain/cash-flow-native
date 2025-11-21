import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CurrencyText } from './CurrencyText';

interface GlassCardProps {
  title: string;
  value: number;
  subtitle?: string;
  variant?: 'primary' | 'success' | 'danger';
  style?: ViewStyle;
  delay?: number;
}

export function GlassCard({
  title,
  value,
  subtitle,
  variant = 'primary',
  style,
  delay = 0
}: GlassCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const getVariantColor = () => {
    switch (variant) {
      case 'success': return theme.success;
      case 'danger': return theme.danger;
      default: return theme.primary;
    }
  };

  const accentColor = getVariantColor();

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        Shadows.base,
        style
      ]}
    >
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
          {/* Subtle accent indicator */}
          <View style={[styles.indicator, { backgroundColor: accentColor }]} />
        </View>

        <View style={styles.valueContainer}>
          <CurrencyText
            amount={value}
            style={[styles.value, { color: theme.text }]}
            amountSize={32} // Typography.sizes['3xl'] is ~30-32
            color={theme.text}
          />
        </View>

        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.textTertiary }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginVertical: Spacing.sm,
  },
  content: {
    padding: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.full,
  },
  valueContainer: {
    marginVertical: Spacing.xs,
  },
  value: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    marginTop: Spacing.xs,
  },
});
