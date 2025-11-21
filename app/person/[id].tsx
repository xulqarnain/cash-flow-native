import { CurrencyText } from '@/components/CurrencyText';
import { TransactionList } from '@/components/TransactionList';
import { useLanguage } from '@/contexts/LanguageContext';
import { initDatabase } from '@/database/init';
import { deletePerson, getPersonWithBalance } from '@/database/peopleService';
import { getTransactionsByPerson } from '@/database/transactionsService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { PersonWithBalance, Transaction } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PersonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useLanguage();

  const [person, setPerson] = useState<PersonWithBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const loadData = async () => {
    try {
      await initDatabase();
      const personId = parseInt(id);
      const [personData, personTransactions] = await Promise.all([
        getPersonWithBalance(personId),
        getTransactionsByPerson(personId),
      ]);
      setPerson(personData);
      setTransactions(personTransactions);
    } catch (error) {
      console.error('Error loading person data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  const handleDeletePerson = () => {
    Alert.alert(
      t('delete_person_title'),
      t('delete_person_message').replace('{name}', person?.name || ''),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePerson(parseInt(id));
              router.back();
            } catch (error) {
              console.error('Error deleting person:', error);
              Alert.alert('Error', 'Failed to delete person');
            }
          },
        },
      ]
    );
  };

  if (!person) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f9fafb' }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            {t('loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const balanceColor = person.balance > 0
    ? '#10b981'
    : person.balance < 0
      ? '#f43f5e'
      : isDark ? '#9ca3af' : '#6b7280';

  const balanceLabel = person.balance > 0
    ? t('owes_you')
    : person.balance < 0
      ? t('you_owe')
      : t('no_balance');

  const hasBalance = person.balance !== 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f9fafb' }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#f9fafb' : '#111827'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeletePerson} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={24} color="#f43f5e" />
          </TouchableOpacity>
        </View>

        <View style={styles.personInfo}>
          <View style={[
            styles.avatar,
            { backgroundColor: isDark ? '#22d3ee' : '#22d3ee' }
          ]}>
            <Text style={styles.avatarText}>
              {person.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={[styles.name, { color: isDark ? '#f9fafb' : '#111827' }]}>
            {person.name}
          </Text>

          {person.phone && (
            <Text style={[styles.phone, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              {person.phone}
            </Text>
          )}

          <View style={[
            styles.balanceCard,
            {
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderColor: isDark ? '#374151' : '#e5e7eb',
            }
          ]}>
            <Text style={[styles.balanceCardLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              {t('current_balance')}
            </Text>
            <View style={styles.balanceRow}>
              <Text style={[styles.balanceText, { color: balanceColor }]}>
                {balanceLabel}{hasBalance ? ' ' : ''}
              </Text>
              {hasBalance && (
                <CurrencyText
                  amount={Math.abs(person.balance)}
                  symbolSize={11}
                  amountSize={28}
                  color={balanceColor}
                />
              )}
            </View>
            <Text style={[styles.transactionCount, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              {person.transactionCount} {person.transactionCount === 1 ? t('transaction') : t('transactions')}
            </Text>
          </View>
        </View>
      </View>

      {/* Transactions */}
      <View style={styles.transactionsSection}>
        <View style={styles.transactionsHeader}>
          <Text style={[styles.transactionsTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
            {t('transactions_title')}
          </Text>
          <TouchableOpacity
            style={styles.addTransactionButton}
            onPress={() => router.push(`/add-transaction?personId=${id}`)}
          >
            <Ionicons name="add-circle" size={28} color="#22d3ee" />
          </TouchableOpacity>
        </View>

        <TransactionList
          transactions={transactions}
          showPersonName={false}
          emptyMessage={t('no_transactions_start')}
          onTransactionPress={(txn) => router.push(`/transaction/${txn.id}`)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  personInfo: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  phone: {
    fontSize: 16,
    marginBottom: 20,
  },
  balanceCard: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  balanceCardLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  balanceText: {
    fontSize: 28,
    fontWeight: '700',
  },
  transactionCount: {
    fontSize: 14,
  },
  transactionsSection: {
    flex: 1,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  transactionsTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  addTransactionButton: {
    padding: 4,
  },
});
