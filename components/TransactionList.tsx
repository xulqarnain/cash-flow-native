import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Transaction, TransactionWithPerson } from '@/types/database';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface TransactionListProps {
  transactions: Transaction[] | TransactionWithPerson[];
  onTransactionPress?: (transaction: Transaction | TransactionWithPerson) => void;
  showPersonName?: boolean;
  emptyMessage?: string;
}

export function TransactionList({
  transactions,
  onTransactionPress,
  showPersonName = false,
  emptyMessage = 'No transactions yet',
}: TransactionListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const renderItem = ({ item }: { item: Transaction | TransactionWithPerson }) => {
    const isIncoming = item.type === 'incoming';
    const icon = isIncoming ? 'arrow-down-circle' : 'arrow-up-circle';
    const amountColor = isIncoming ? '#10b981' : '#ef4444';
    const amountPrefix = isIncoming ? '+' : '-';

    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const personName = showPersonName && 'personName' in item ? item.personName : null;

    return (
      <TouchableOpacity
        style={[
          styles.transactionItem,
          {
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderColor: isDark ? '#374151' : '#e5e7eb',
          }
        ]}
        onPress={() => onTransactionPress?.(item)}
        activeOpacity={0.7}
        disabled={!onTransactionPress}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color={amountColor} />
        </View>

        <View style={styles.details}>
          <Text style={[
            styles.description,
            { color: isDark ? '#f9fafb' : '#111827' }
          ]}>
            {item.description}
          </Text>
          {personName && (
            <Text style={[
              styles.personName,
              { color: isDark ? '#9ca3af' : '#6b7280' }
            ]}>
              {personName}
            </Text>
          )}
          <View style={styles.metaRow}>
            <Text style={[
              styles.date,
              { color: isDark ? '#9ca3af' : '#6b7280' }
            ]}>
              {formattedDate}
            </Text>
            {item.category && (
              <>
                <Text style={[styles.separator, { color: isDark ? '#9ca3af' : '#6b7280' }]}>•</Text>
                <Text style={[
                  styles.category,
                  { color: isDark ? '#9ca3af' : '#6b7280' }
                ]}>
                  {item.category}
                </Text>
              </>
            )}
          </View>
        </View>

        <Text style={[styles.amount, { color: amountColor }]}>
          {amountPrefix}${item.amount.toFixed(2)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="document-text-outline"
        size={64}
        color={isDark ? '#4b5563' : '#d1d5db'}
      />
      <Text style={[
        styles.emptyText,
        { color: isDark ? '#9ca3af' : '#6b7280' }
      ]}>
        {emptyMessage}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={transactions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={transactions.length === 0 ? styles.emptyList : styles.list}
      ListEmptyComponent={renderEmpty}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  personName: {
    fontSize: 14,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
  },
  separator: {
    marginHorizontal: 6,
    fontSize: 12,
  },
  category: {
    fontSize: 12,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});
