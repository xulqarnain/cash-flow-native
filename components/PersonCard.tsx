import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { CurrencyText } from './CurrencyText';

interface PersonCardProps {
  person: {
    id: string;
    name: string;
    balance: number;
  };
  onPress?: () => void;
  style?: ViewStyle;
}

export function PersonCard({ person, onPress, style }: PersonCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
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
      <View style={[styles.avatar, { backgroundColor: theme.backgroundSecondary }]}>
        <Text style={[styles.avatarText, { color: theme.primary }]}>
          {person.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]}>{person.name}</Text>
        <CurrencyText
          amount={person.balance}
          style={[styles.balance, { color: theme.textSecondary }]}
          amountSize={14}
          color={theme.textSecondary}
        />
      </View>

      <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    marginBottom: 2,
  },
  balance: {
    fontSize: Typography.sizes.sm,
  },
});
