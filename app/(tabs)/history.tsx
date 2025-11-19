import { useState, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedBackground } from '@/components/ThemedBackground';
import { TransactionList } from '@/components/TransactionList';
import { initDatabase } from '@/database/init';
import { getAllTransactions, searchTransactions } from '@/database/transactionsService';
import type { TransactionWithPerson } from '@/types/database';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Shadows, BorderRadius, Spacing } from '@/constants/Theme';

export default function HistoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? Colors.dark : Colors.light;

  const [transactions, setTransactions] = useState<TransactionWithPerson[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const loadTransactions = async () => {
    try {
      await initDatabase();
      const allTransactions = await getAllTransactions();
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      await loadTransactions();
      return;
    }

    try {
      const results = await searchTransactions(query);
      setTransactions(results);
    } catch (error) {
      console.error('Error searching transactions:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  return (
    <ThemedBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>
          Transaction History
        </Text>

        {/* Search Bar */}
        <View style={[
          styles.searchContainer,
          {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
          },
          Shadows.base
        ]}>
          <Ionicons
            name="search"
            size={20}
            color={themeColors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[
              styles.searchInput,
              { color: themeColors.text }
            ]}
            placeholder="Search transactions..."
            placeholderTextColor={themeColors.textTertiary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color={themeColors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Add Transaction Button */}
        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: themeColors.primary },
            Shadows.md
          ]}
          onPress={() => router.push('/add-transaction')}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
          <Text style={styles.addButtonText}>Add Transaction</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction List */}
      <TransactionList
        transactions={transactions}
        showPersonName={true}
        emptyMessage={
          searchQuery.length > 0
            ? 'No transactions found'
            : 'No transactions yet. Add one to get started!'
        }
        onTransactionPress={(txn) => router.push(`/transaction/${txn.id}`)}
      />
      </SafeAreaView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.base,
    paddingTop: Spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: Spacing.base,
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    marginBottom: Spacing.base,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.base,
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
});
