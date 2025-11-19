import { useState, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TransactionList } from '@/components/TransactionList';
import { initDatabase } from '@/database/init';
import { getAllTransactions, searchTransactions } from '@/database/transactionsService';
import type { TransactionWithPerson } from '@/types/database';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HistoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f9fafb' }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#f9fafb' : '#111827' }]}>
          Transaction History
        </Text>

        {/* Search Bar */}
        <View style={[
          styles.searchContainer,
          {
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderColor: isDark ? '#374151' : '#e5e7eb',
          }
        ]}>
          <Ionicons
            name="search"
            size={20}
            color={isDark ? '#9ca3af' : '#6b7280'}
            style={styles.searchIcon}
          />
          <TextInput
            style={[
              styles.searchInput,
              { color: isDark ? '#f9fafb' : '#111827' }
            ]}
            placeholder="Search transactions..."
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color={isDark ? '#9ca3af' : '#6b7280'}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Add Transaction Button */}
        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: isDark ? '#3b82f6' : '#3b82f6' }
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
