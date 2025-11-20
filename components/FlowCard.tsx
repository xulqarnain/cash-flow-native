import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import { Colors, BorderRadius, Shadows, Spacing, Typography } from '@/constants/Theme';

interface FlowCardProps {
  type: 'incoming' | 'outgoing';
  amount: number;
  count?: number;
}

export function FlowCard({ type, amount, count }: FlowCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const themeColors = isDark ? Colors.dark : Colors.light;

  const isIncoming = type === 'incoming';
  const icon = isIncoming ? 'trending-down' : 'trending-up';
  const label = isIncoming ? 'Money In' : 'Money Out';

  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      isIncoming ? 100 : 200,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    scale.value = withDelay(
      isIncoming ? 100 : 200,
      withSpring(1, { damping: 15, stiffness: 150 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const iconBgColor = isIncoming
    ? themeColors.success
    : themeColors.danger;

  return (
    <Animated.View style={[
      styles.card,
      {
        backgroundColor: theme.surface,
        borderColor: theme.border,
        borderWidth: 1
      },
      Shadows.md,
      animatedStyle,
    ]}>
      <View style={styles.header}>
        <View
          style={[styles.iconContainer, { backgroundColor: iconBgColor }]}
        >
          <Ionicons name={icon} size={20} color="#ffffff" />
        </View>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {label}
        </Text>
      </View>

      <CurrencyText
        amount={amount}
        symbolSize={10}
        amountSize={Typography.sizes['2xl']}
        color={theme.text}
      />

      {count !== undefined && (
        <Text style={[styles.count, { color: theme.textTertiary }]}>
          {count} {count === 1 ? 'transaction' : 'transactions'}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: Typography.sizes.sm,
    marginLeft: Spacing.sm,
    fontWeight: Typography.weights.semibold,
  },
  amount: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  count: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
});
