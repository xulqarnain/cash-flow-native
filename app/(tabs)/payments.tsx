import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Text, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { initDatabase } from '@/database/init';
import { getAllTransactions } from '@/database/transactionsService';
import { getAllPeople } from '@/database/peopleService';
import type { TransactionWithPerson, Person } from '@/types/database';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemedBackground } from '@/components/ThemedBackground';
import { CurrencyText } from '@/components/CurrencyText';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/Theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function PaymentsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const themeColors = isDark ? Colors.dark : Colors.light;
  const { t } = useLanguage();
  const router = useRouter();

  const [transactions, setTransactions] = useState<TransactionWithPerson[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedPersonId, setSelectedPersonId] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadData = async () => {
    try {
      await initDatabase();
      const [allTransactions, allPeople] = await Promise.all([
        getAllTransactions(),
        getAllPeople(),
      ]);
      setTransactions(allTransactions);
      setPeople(allPeople);
    } catch (error) {
      console.error('Error loading payments data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by person
    if (selectedPersonId > 0) {
      filtered = filtered.filter(t => t.personId === selectedPersonId);
    }

    // Filter by category
    if (selectedCategory.trim()) {
      filtered = filtered.filter(t =>
        t.category?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(t => t.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(t => t.date <= endDate);
    }

    return filtered;
  }, [transactions, selectedPersonId, selectedCategory, startDate, endDate]);

  // Separate transactions into receive (incoming) and pay (outgoing)
  const transactionsToReceive = filteredTransactions.filter(t => t.type === 'incoming');
  const transactionsToPay = filteredTransactions.filter(t => t.type === 'outgoing');

  const totalToReceive = transactionsToReceive.reduce((sum, t) => sum + t.amount, 0);
  const totalToPay = transactionsToPay.reduce((sum, t) => sum + t.amount, 0);

  const clearFilters = () => {
    setSelectedPersonId(0);
    setSelectedCategory('');
    setStartDate('');
    setEndDate('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const hasActiveFilters = selectedPersonId > 0 || selectedCategory.trim() || startDate || endDate;

  return (
    <ThemedBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.text }]}>
              {t('payments')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowFilters(!showFilters);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.filterButton,
                { backgroundColor: hasActiveFilters ? '#06b6d4' : theme.surface },
                Shadows.base,
              ]}
            >
              <Ionicons
                name="funnel"
                size={20}
                color={hasActiveFilters ? '#ffffff' : theme.text}
              />
              {hasActiveFilters && (
                <View style={styles.filterBadge}>
                  <View style={styles.filterDot} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters Panel */}
        {showFilters && (
          <View style={[styles.filtersPanel, { backgroundColor: theme.surface }, Shadows.md]}>
            <View style={styles.filterRow}>
              <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>
                Person
              </Text>
              <View style={[styles.filterInput, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Ionicons name="person-outline" size={16} color={theme.textTertiary} />
                <Picker
                  selectedValue={selectedPersonId}
                  onValueChange={(value) => setSelectedPersonId(value)}
                  style={[styles.picker, { color: theme.text }]}
                >
                  <Picker.Item label="All People" value={0} />
                  {people.map((person) => (
                    <Picker.Item key={person.id} label={person.name} value={person.id} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.filterRow}>
              <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>
                Category
              </Text>
              <View style={[styles.filterInput, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Ionicons name="pricetag-outline" size={16} color={theme.textTertiary} />
                <TextInput
                  style={[styles.textInput, { color: theme.text }]}
                  placeholder="Search category..."
                  placeholderTextColor={theme.textTertiary}
                  value={selectedCategory}
                  onChangeText={setSelectedCategory}
                />
              </View>
            </View>

            <View style={styles.filterRow}>
              <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>
                Date Range
              </Text>
              <View style={styles.dateRangeRow}>
                <View style={[styles.dateInput, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Ionicons name="calendar-outline" size={16} color={theme.textTertiary} />
                  <TextInput
                    style={[styles.textInput, { color: theme.text }]}
                    placeholder="From (YYYY-MM-DD)"
                    placeholderTextColor={theme.textTertiary}
                    value={startDate}
                    onChangeText={setStartDate}
                  />
                </View>
                <View style={[styles.dateInput, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Ionicons name="calendar-outline" size={16} color={theme.textTertiary} />
                  <TextInput
                    style={[styles.textInput, { color: theme.text }]}
                    placeholder="To (YYYY-MM-DD)"
                    placeholderTextColor={theme.textTertiary}
                    value={endDate}
                    onChangeText={setEndDate}
                  />
                </View>
              </View>
            </View>

            {hasActiveFilters && (
              <TouchableOpacity
                onPress={clearFilters}
                style={[styles.clearButton, { backgroundColor: theme.background, borderColor: '#f43f5e' }, Shadows.sm]}
              >
                <Ionicons name="close-circle" size={18} color="#f43f5e" />
                <Text style={[styles.clearButtonText, { color: '#f43f5e' }]}>
                  Clear Filters
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { flex: 1, marginRight: Spacing.sm }]}>
            <View
              style={[
                styles.summaryGradient,
                {
                  backgroundColor: themeColors.success,
                  borderColor: themeColors.border,
                  borderWidth: 1
                },
                Shadows.md
              ]}
            >
              <Ionicons name="arrow-down" size={24} color="#ffffff" />
              <Text style={styles.summaryLabel}>{t('need_to_receive')}</Text>
              <CurrencyText
                amount={totalToReceive}
                symbolSize={10}
                amountSize={Typography.sizes['2xl']}
                color="#ffffff"
              />
              <Text style={styles.summaryCount}>{transactionsToReceive.length} txns</Text>
            </View>
          </View>

          <View style={[styles.summaryCard, { flex: 1, marginLeft: Spacing.sm }]}>
            <View
              style={[
                styles.summaryGradient,
                {
                  backgroundColor: themeColors.danger,
                  borderColor: themeColors.border,
                  borderWidth: 1
                },
                Shadows.md
              ]}
            >
              <Ionicons name="arrow-up" size={24} color="#ffffff" />
              <Text style={styles.summaryLabel}>{t('need_to_pay')}</Text>
              <CurrencyText
                amount={totalToPay}
                symbolSize={10}
                amountSize={Typography.sizes['2xl']}
                color="#ffffff"
              />
              <Text style={styles.summaryCount}>{transactionsToPay.length} txns</Text>
            </View>
          </View>
        </View>

        {/* Need to Receive Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View
                style={[styles.sectionIcon, { backgroundColor: themeColors.success }]}
              >
                <Ionicons name="arrow-down" size={16} color="#ffffff" />
              </View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {t('need_to_receive')}
              </Text>
            </View>
          </View>

          {transactionsToReceive.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.surface }, Shadows.base]}>
              <Text style={{ fontSize: 32, marginBottom: Spacing.sm }}>✅</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {t('no_receivables')}
              </Text>
            </View>
          ) : (
            transactionsToReceive.map((transaction, index) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                type="receive"
                index={index}
                isDark={isDark}
                theme={theme}
                onPress={() => router.push(`/person/${transaction.personId}`)}
              />
            ))
          )}
        </View>

        {/* Need to Pay Section */}
        <View style={[styles.section, { paddingBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View
                style={[styles.sectionIcon, { backgroundColor: themeColors.danger }]}
              >
                <Ionicons name="arrow-up" size={16} color="#ffffff" />
              </View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {t('need_to_pay')}
              </Text>
            </View>
          </View>

          {transactionsToPay.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.surface }, Shadows.base]}>
              <Text style={{ fontSize: 32, marginBottom: Spacing.sm }}>🎉</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {t('no_payments')}
              </Text>
            </View>
          ) : (
            transactionsToPay.map((transaction, index) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                type="pay"
                index={index}
                isDark={isDark}
                theme={theme}
                onPress={() => router.push(`/person/${transaction.personId}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
      </SafeAreaView>
    </ThemedBackground>
  );
}

interface TransactionCardProps {
  transaction: TransactionWithPerson;
  type: 'receive' | 'pay';
  index: number;
  isDark: boolean;
  theme: any;
  onPress: () => void;
}

function TransactionCard({ transaction, type, index, isDark, theme, onPress }: TransactionCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const hasAnimated = React.useRef(false);

  React.useEffect(() => {
    if (!hasAnimated.current) {
      opacity.value = 0;
      translateY.value = 20;
      opacity.value = withDelay(
        index * 30,
        withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
      );
      translateY.value = withDelay(
        index * 30,
        withSpring(0, { damping: 15 })
      );
      hasAnimated.current = true;
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const bgColor = type === 'receive' ? '#10b981' : '#f43f5e';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.transactionCard,
        { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 },
        Shadows.base,
        animatedStyle,
      ]}
    >
      <View style={styles.cardLeft}>
        <View
          style={[styles.avatar, { backgroundColor: bgColor }]}
        >
          <Ionicons name="person" size={20} color="#ffffff" />
        </View>

        <View style={styles.cardInfo}>
          <Text style={[styles.personName, { color: theme.text }]}>
            {transaction.personName}
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={1}>
            {transaction.description}
          </Text>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={12} color={theme.textTertiary} />
              <Text style={[styles.metaText, { color: theme.textTertiary }]}>
                {formatDate(transaction.date)}
              </Text>
            </View>
            {transaction.category && (
              <View style={styles.metaItem}>
                <Ionicons name="pricetag-outline" size={12} color={theme.textTertiary} />
                <Text style={[styles.metaText, { color: theme.textTertiary }]}>
                  {transaction.category}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <CurrencyText
        amount={transaction.amount}
        symbolSize={9}
        amountSize={Typography.sizes.lg}
        color={type === 'receive' ? theme.success : theme.danger}
      />
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
  },
  header: {
    marginBottom: Spacing.md,
    paddingTop: Spacing.base,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.extrabold,
    letterSpacing: -0.5,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  filtersPanel: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  filterRow: {
    marginBottom: Spacing.md,
  },
  filterLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  textInput: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    marginLeft: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  picker: {
    flex: 1,
    marginLeft: Spacing.xs,
  },
  dateRangeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  clearButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  summaryContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },
  summaryCard: {
  },
  summaryGradient: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: Typography.sizes.xs,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: Spacing.xs,
    fontWeight: Typography.weights.semibold,
  },
  summaryAmount: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.extrabold,
    color: '#ffffff',
    marginTop: Spacing.xs,
  },
  summaryCount: {
    fontSize: Typography.sizes.xs,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    marginBottom: Spacing.base,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  transactionCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  personName: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.sizes.sm,
    marginBottom: Spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: Typography.sizes.xs,
  },
  amount: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginLeft: Spacing.md,
  },
  emptyCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
});
