import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Transaction, TransactionWithPerson } from '@/types/database';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CurrencyText } from './CurrencyText';
import { Colors, Shadows, BorderRadius, Spacing } from '@/constants/Theme';

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
  const themeColors = isDark ? Colors.dark : Colors.light;

  const renderItem = ({ item }: { item: Transaction | TransactionWithPerson }) => {
    const isIncoming = item.type === 'incoming';
    const icon = isIncoming ? 'arrow-down-circle' : 'arrow-up-circle';
    const amountColor = isIncoming ? themeColors.success : themeColors.danger;
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
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
          },
          Shadows.base
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
            { color: themeColors.text }
          ]}>
            {item.description}
          </Text>
          {personName && (
            <Text style={[
              styles.personName,
              { color: themeColors.textSecondary }
            ]}>
              {personName}
            </Text>
          )}
          <View style={styles.metaRow}>
            <Text style={[
              styles.date,
              { color: themeColors.textSecondary }
            ]}>
              {formattedDate}
            </Text>
            {item.category && (
              <>
                <Text style={[styles.separator, { color: themeColors.textSecondary }]}>•</Text>
                <Text style={[
                  styles.category,
                  { color: themeColors.textSecondary }
                ]}>
                  {item.category}
                </Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={[styles.amountPrefix, { color: amountColor }]}>
            {amountPrefix}
          </Text>
          <CurrencyText
            amount={item.amount}
            symbolSize={9}
            amountSize={18}
            color={amountColor}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="document-text-outline"
        size={64}
        color={themeColors.textTertiary}
      />
      <Text style={[
        styles.emptyText,
        { color: themeColors.textSecondary }
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
    padding: Spacing.base,
    paddingBottom: 100, // Space for footer menu
  },
  emptyList: {
    flex: 1,
    paddingBottom: 100, // Space for footer menu
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    marginRight: Spacing.base,
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
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginLeft: Spacing.base,
  },
  amountPrefix: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    marginTop: Spacing.base,
  },
});
