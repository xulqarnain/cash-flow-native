import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
import type { TransactionWithPerson } from '@/types/database';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/Theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function PaymentsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const { t } = useLanguage();
  const { formatAmount } = useCurrency();
  const router = useRouter();

  const [transactions, setTransactions] = useState<TransactionWithPerson[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      await initDatabase();
      const allTransactions = await getAllTransactions();
      setTransactions(allTransactions);
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

  // Separate transactions into receive (incoming) and pay (outgoing)
  const transactionsToReceive = transactions.filter(t => t.type === 'incoming');
  const transactionsToPay = transactions.filter(t => t.type === 'outgoing');

  const totalToReceive = transactionsToReceive.reduce((sum, t) => sum + t.amount, 0);
  const totalToPay = transactionsToPay.reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            {t('payments')}
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { flex: 1, marginRight: Spacing.sm }]}>
            <LinearGradient
              colors={['#10b981', '#14b8a6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.summaryGradient, Shadows.md]}
            >
              <Ionicons name="arrow-down" size={24} color="#ffffff" />
              <Text style={styles.summaryLabel}>{t('need_to_receive')}</Text>
              <Text style={styles.summaryAmount}>{formatAmount(totalToReceive)}</Text>
              <Text style={styles.summaryCount}>{transactionsToReceive.length} txns</Text>
            </LinearGradient>
          </View>

          <View style={[styles.summaryCard, { flex: 1, marginLeft: Spacing.sm }]}>
            <LinearGradient
              colors={['#ef4444', '#f43f5e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.summaryGradient, Shadows.md]}
            >
              <Ionicons name="arrow-up" size={24} color="#ffffff" />
              <Text style={styles.summaryLabel}>{t('need_to_pay')}</Text>
              <Text style={styles.summaryAmount}>{formatAmount(totalToPay)}</Text>
              <Text style={styles.summaryCount}>{transactionsToPay.length} txns</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Need to Receive Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <LinearGradient
                colors={['#10b981', '#14b8a6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sectionIcon}
              >
                <Ionicons name="arrow-down" size={16} color="#ffffff" />
              </LinearGradient>
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
                formatAmount={formatAmount}
                onPress={() => router.push(`/person/${transaction.personId}`)}
              />
            ))
          )}
        </View>

        {/* Need to Pay Section */}
        <View style={[styles.section, { paddingBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <LinearGradient
                colors={['#ef4444', '#f43f5e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sectionIcon}
              >
                <Ionicons name="arrow-up" size={16} color="#ffffff" />
              </LinearGradient>
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
                formatAmount={formatAmount}
                onPress={() => router.push(`/person/${transaction.personId}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface TransactionCardProps {
  transaction: TransactionWithPerson;
  type: 'receive' | 'pay';
  index: number;
  isDark: boolean;
  theme: any;
  formatAmount: (amount: number) => string;
  onPress: () => void;
}

function TransactionCard({ transaction, type, index, isDark, theme, formatAmount, onPress }: TransactionCardProps) {
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

  const gradient = type === 'receive'
    ? ['#10b981', '#14b8a6']
    : ['#ef4444', '#f43f5e'];

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
        { backgroundColor: theme.surface },
        Shadows.base,
        animatedStyle,
      ]}
    >
      <View style={styles.cardLeft}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Ionicons name="person" size={20} color="#ffffff" />
        </LinearGradient>

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

      <Text style={[
        styles.amount,
        { color: type === 'receive' ? theme.success : theme.danger }
      ]}>
        {formatAmount(transaction.amount)}
      </Text>
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
    marginBottom: Spacing.xl,
    paddingTop: Spacing.base,
  },
  title: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.extrabold,
    letterSpacing: -0.5,
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
