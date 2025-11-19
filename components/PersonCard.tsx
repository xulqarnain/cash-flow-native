import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { PersonWithBalance } from '@/types/database';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CurrencyText } from './CurrencyText';
import { Colors, BorderRadius, Shadows, Spacing, Typography } from '@/constants/Theme';

interface PersonCardProps {
  person: PersonWithBalance;
  onPress?: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function PersonCard({ person, onPress }: PersonCardProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const themeColors = isDark ? Colors.dark : Colors.light;

  const scale = useSharedValue(1);

  const balanceColor = person.balance > 0
    ? theme.success
    : person.balance < 0
    ? theme.danger
    : theme.textTertiary;

  const balanceLabel = person.balance > 0
    ? 'Owes you'
    : person.balance < 0
    ? 'You owe'
    : 'No balance';

  const hasBalance = person.balance !== 0;

  const iconBgColor = person.balance > 0
    ? themeColors.success
    : person.balance < 0
    ? themeColors.danger
    : isDark ? '#0e7490' : '#06b6d4';

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    router.push(`/person/${person.id}`);
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderWidth: 1
        },
        Shadows.base,
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <View
          style={[styles.avatar, { backgroundColor: iconBgColor }]}
        >
          <Ionicons name="person" size={24} color="#ffffff" />
        </View>

        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.text }]}>
            {person.name}
          </Text>
          {person.phone && (
            <Text style={[styles.phone, { color: theme.textTertiary }]}>
              📞 {person.phone}
            </Text>
          )}
        </View>

        <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
      </View>

      <View style={styles.footer}>
        <View>
          <View style={styles.balanceRow}>
            <Text style={[styles.balanceLabel, { color: balanceColor }]}>
              {balanceLabel}{hasBalance ? ' ' : ''}
            </Text>
            {hasBalance && (
              <CurrencyText
                amount={Math.abs(person.balance)}
                symbolSize={9}
                amountSize={Typography.sizes.base}
                color={balanceColor}
              />
            )}
          </View>
          <Text style={[styles.transactionCount, { color: theme.textTertiary }]}>
            {person.transactionCount} {person.transactionCount === 1 ? 'transaction' : 'transactions'}
          </Text>
        </View>
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  phone: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  footer: {
    paddingLeft: 60,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.xs,
  },
  balanceLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
  },
  transactionCount: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
});
