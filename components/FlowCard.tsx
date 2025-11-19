import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface FlowCardProps {
  type: 'incoming' | 'outgoing';
  amount: number;
  count?: number;
}

export function FlowCard({ type, amount, count }: FlowCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const isIncoming = type === 'incoming';
  const icon = isIncoming ? 'arrow-down-circle' : 'arrow-up-circle';
  const color = isIncoming ? '#10b981' : '#ef4444';
  const label = isIncoming ? 'Money In' : 'Money Out';

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderColor: isDark ? '#374151' : '#e5e7eb',
      }
    ]}>
      <View style={styles.header}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={[
          styles.label,
          { color: isDark ? '#9ca3af' : '#6b7280' }
        ]}>
          {label}
        </Text>
      </View>

      <Text style={[styles.amount, { color: isDark ? '#f9fafb' : '#111827' }]}>
        ${amount.toFixed(2)}
      </Text>

      {count !== undefined && (
        <Text style={[
          styles.count,
          { color: isDark ? '#9ca3af' : '#6b7280' }
        ]}>
          {count} {count === 1 ? 'transaction' : 'transactions'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  count: {
    fontSize: 12,
  },
});
