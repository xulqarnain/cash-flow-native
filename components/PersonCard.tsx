import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import type { PersonWithBalance } from '@/types/database';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface PersonCardProps {
  person: PersonWithBalance;
  onPress?: () => void;
}

export function PersonCard({ person, onPress }: PersonCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const balanceColor = person.balance > 0
    ? '#10b981' // green for positive (they owe you)
    : person.balance < 0
    ? '#ef4444' // red for negative (you owe them)
    : isDark ? '#9ca3af' : '#6b7280'; // gray for zero

  const balanceText = person.balance > 0
    ? `Owes you $${person.balance.toFixed(2)}`
    : person.balance < 0
    ? `You owe $${Math.abs(person.balance).toFixed(2)}`
    : 'No balance';

  const card = (
    <View style={[
      styles.card,
      {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderColor: isDark ? '#374151' : '#e5e7eb',
      }
    ]}>
      <View style={styles.header}>
        <Text style={[
          styles.name,
          { color: isDark ? '#f9fafb' : '#111827' }
        ]}>
          {person.name}
        </Text>
        {person.email && (
          <Text style={[
            styles.email,
            { color: isDark ? '#9ca3af' : '#6b7280' }
          ]}>
            {person.email}
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.balance, { color: balanceColor }]}>
          {balanceText}
        </Text>
        <Text style={[
          styles.transactionCount,
          { color: isDark ? '#9ca3af' : '#6b7280' }
        ]}>
          {person.transactionCount} {person.transactionCount === 1 ? 'transaction' : 'transactions'}
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {card}
      </TouchableOpacity>
    );
  }

  return (
    <Link href={`/person/${person.id}`} asChild>
      <TouchableOpacity activeOpacity={0.7}>
        {card}
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balance: {
    fontSize: 16,
    fontWeight: '700',
  },
  transactionCount: {
    fontSize: 12,
  },
});
