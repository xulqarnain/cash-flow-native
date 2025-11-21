import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CurrencyText } from './CurrencyText';

interface FlowCardProps {
  type: 'income' | 'expense';
  amount: number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  count?: number;
  style?: ViewStyle;
  delay?: number;
}

export function FlowCard({
  type,
  amount,
  label,
  icon,
  count,
  style,
  delay = 0
}: FlowCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const isIncoming = type === 'income';
  const iconColor = isIncoming ? theme.success : theme.danger;
  const iconBg = isIncoming ? theme.successLight + '20' : theme.dangerLight + '20'; // 20% opacity

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        Shadows.sm,
        style
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {label}
        </Text>
      </View>

      <CurrencyText
        amount={amount}
        style={[styles.amount, { color: theme.text }]}
        amountSize={20}
        color={theme.text}
      />

      {count !== undefined && (
        <Text style={[styles.count, { color: theme.textTertiary }]}>
          {count} trans.
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginHorizontal: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  label: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    flex: 1,
  },
  amount: {
    fontWeight: Typography.weights.bold,
    marginBottom: 2,
  },
  count: {
    fontSize: 10,
    marginTop: Spacing.xs,
  },
});
