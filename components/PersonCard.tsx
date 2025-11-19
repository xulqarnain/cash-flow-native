import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { PersonWithBalance } from '@/types/database';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrency } from '@/contexts/CurrencyContext';
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
  const { formatAmount } = useCurrency();

  const scale = useSharedValue(1);

  const balanceColor = person.balance > 0
    ? theme.success
    : person.balance < 0
    ? theme.danger
    : theme.textTertiary;

  const balanceText = person.balance > 0
    ? `Owes you ${formatAmount(person.balance)}`
    : person.balance < 0
    ? `You owe ${formatAmount(Math.abs(person.balance))}`
    : 'No balance';

  const iconGradient = person.balance > 0
    ? ['#10b981', '#14b8a6']
    : person.balance < 0
    ? ['#ef4444', '#f43f5e']
    : isDark ? ['#374151', '#4b5563'] : ['#e5e7eb', '#d1d5db'];

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
        },
        Shadows.base,
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <LinearGradient
          colors={iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Ionicons name="person" size={24} color="#ffffff" />
        </LinearGradient>

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
          <Text style={[styles.balance, { color: balanceColor }]}>
            {balanceText}
          </Text>
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
  balance: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  transactionCount: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
});
