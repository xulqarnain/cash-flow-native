import { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { initDatabase } from '@/database/init';
import { getTransactionById, deleteTransaction } from '@/database/transactionsService';
import { getPersonWithBalance } from '@/database/peopleService';
import type { Transaction, PersonWithBalance } from '@/types/database';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/Theme';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const { formatAmount } = useCurrency();
  const { t } = useLanguage();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [person, setPerson] = useState<PersonWithBalance | null>(null);

  const loadData = async () => {
    try {
      await initDatabase();
      const transactionId = parseInt(id);
      const txnData = await getTransactionById(transactionId);

      if (txnData) {
        setTransaction(txnData);
        const personData = await getPersonWithBalance(txnData.personId);
        setPerson(personData);
      }
    } catch (error) {
      console.error('Error loading transaction data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(parseInt(id));
              router.back();
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push(`/edit-transaction?id=${id}`);
  };

  if (!transaction || !person) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isIncoming = transaction.type === 'incoming';
  const gradientColors = isIncoming ? ['#10b981', '#14b8a6'] : ['#ef4444', '#f43f5e'];
  const iconName = isIncoming ? 'arrow-down' : 'arrow-up';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Transaction Details
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Amount Card */}
        <View style={styles.amountSection}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.amountCard, Shadows.lg]}
          >
            <View style={styles.iconCircle}>
              <Ionicons name={iconName} size={40} color="#ffffff" />
            </View>
            <Text style={styles.amountLabel}>
              {isIncoming ? t('incoming') : t('outgoing')}
            </Text>
            <Text style={styles.amount}>
              {formatAmount(transaction.amount)}
            </Text>
          </LinearGradient>
        </View>

        {/* Details */}
        <View style={styles.detailsSection}>
          {/* Person */}
          <TouchableOpacity
            style={[styles.detailCard, { backgroundColor: theme.surface }, Shadows.base]}
            onPress={() => router.push(`/person/${person.id}`)}
          >
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons name="person-outline" size={24} color={theme.textTertiary} />
                <View style={styles.detailText}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                    Person
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {person.name}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
            </View>
          </TouchableOpacity>

          {/* Description */}
          <View style={[styles.detailCard, { backgroundColor: theme.surface }, Shadows.base]}>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons name="document-text-outline" size={24} color={theme.textTertiary} />
                <View style={styles.detailText}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                    Description
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {transaction.description}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Category */}
          {transaction.category && (
            <View style={[styles.detailCard, { backgroundColor: theme.surface }, Shadows.base]}>
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Ionicons name="pricetag-outline" size={24} color={theme.textTertiary} />
                  <View style={styles.detailText}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                      Category
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      {transaction.category}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Date */}
          <View style={[styles.detailCard, { backgroundColor: theme.surface }, Shadows.base]}>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons name="calendar-outline" size={24} color={theme.textTertiary} />
                <View style={styles.detailText}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                    Date
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {formatDate(transaction.date)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons - At Bottom */}
      <View style={[styles.buttonContainer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <TouchableOpacity
          onPress={handleEdit}
          style={[styles.button, { backgroundColor: theme.surface, borderColor: theme.border }, Shadows.base]}
        >
          <Ionicons name="pencil" size={20} color="#6366f1" />
          <Text style={[styles.buttonText, { color: '#6366f1' }]}>
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          style={[styles.button, { backgroundColor: theme.surface, borderColor: '#ef4444' }, Shadows.base]}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
          <Text style={[styles.buttonText, { color: '#ef4444' }]}>
            Delete
          </Text>
        </TouchableOpacity>
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
    fontSize: Typography.sizes.base,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  amountSection: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
  },
  amountCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  amountLabel: {
    fontSize: Typography.sizes.sm,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: Spacing.xs,
    fontWeight: Typography.weights.semibold,
    textTransform: 'uppercase',
  },
  amount: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.extrabold,
    color: '#ffffff',
  },
  detailsSection: {
    paddingHorizontal: Spacing.base,
  },
  detailCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  detailLabel: {
    fontSize: Typography.sizes.xs,
    marginBottom: Spacing.xs,
    fontWeight: Typography.weights.medium,
  },
  detailValue: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: Spacing.base,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  buttonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
});
