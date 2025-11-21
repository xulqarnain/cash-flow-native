import { CashFlowChart } from '@/components/CashFlowChart';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { FlowCard } from '@/components/FlowCard';
import { GlassCard } from '@/components/GlassCard';
import { PersonCard } from '@/components/PersonCard';
import { ThemedBackground } from '@/components/ThemedBackground';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { initDatabase } from '@/database/init';
import { getPeopleWithBalances } from '@/database/peopleService';
import { getChartData, getDashboardStats, type ChartDataPoint } from '@/database/transactionsService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { DashboardStats, PersonWithBalance } from '@/types/database';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const { t } = useLanguage();

  const [stats, setStats] = useState<DashboardStats>({
    totalBalance: 0,
    totalIncoming: 0,
    totalOutgoing: 0,
    transactionCount: 0,
    peopleCount: 0,
  });
  const [people, setPeople] = useState<PersonWithBalance[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      await initDatabase();
      const [dashboardStats, peopleWithBalances, cashFlowData] = await Promise.all([
        getDashboardStats(),
        getPeopleWithBalances(),
        getChartData(7),
      ]);
      setStats(dashboardStats);
      setPeople(peopleWithBalances);
      setChartData(cashFlowData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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

  // Calculate Net To Receive and Net To Pay from people balances
  const totalToReceive = people
    .filter(p => p.balance > 0)
    .reduce((sum, p) => sum + p.balance, 0);

  const totalToPay = people
    .filter(p => p.balance < 0)
    .reduce((sum, p) => sum + Math.abs(p.balance), 0);

  const netBalance = totalToReceive - totalToPay;
  const balanceVariant = netBalance > 0 ? 'success' : netBalance < 0 ? 'danger' : 'primary';

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
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>
              {t('welcome_back')}
            </Text>
            <Text style={[styles.title, { color: theme.text }]}>
              {t('cash_flow')}
            </Text>
          </View>

          {/* Total Balance Card */}
          <View style={styles.section}>
            <GlassCard
              title={t('total_balance')}
              value={netBalance}
              subtitle={`${people.length} ${t('people')}`}
              variant={balanceVariant}
            />
          </View>

          {/* Flow Cards */}
          <View style={styles.flowContainer}>
            <FlowCard
              type="income"
              amount={totalToReceive}
              label={t('need_to_receive')}
              icon="arrow-down"
              delay={100}
            />
            <View style={styles.flowSpacer} />
            <FlowCard
              type="expense"
              amount={totalToPay}
              label={t('need_to_pay')}
              icon="arrow-up"
              delay={200}
            />
          </View>

          {/* Cash Flow Chart */}
          <View style={styles.section}>
            <CashFlowChart data={chartData} />
          </View>

          {/* People List */}
          <View style={[styles.section, { paddingBottom: Platform.OS === 'ios' ? 120 : 108 }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('people')} ({people.length})
            </Text>

            {people.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { backgroundColor: theme.surfaceElevated }]}>
                  <Text style={{ fontSize: 48 }}>💰</Text>
                </View>
                <Text style={[styles.emptyText, { color: theme.text }]}>
                  {t('no_people')}
                </Text>
                <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
                  {t('tap_to_start')}
                </Text>
              </View>
            ) : (
              people.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  onPress={() => router.push(`/person/${person.id}`)}
                />
              ))
            )}
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        <FloatingActionButton />
      </SafeAreaView>
    </ThemedBackground>
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
  greeting: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.extrabold,
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.base,
  },
  flowContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },
  flowSpacer: {
    width: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  emptyText: {
    fontSize: Typography.sizes.lg,
    marginTop: Spacing.base,
    fontWeight: Typography.weights.semibold,
  },
  emptySubtext: {
    fontSize: Typography.sizes.sm,
    marginTop: Spacing.sm,
  },
});
