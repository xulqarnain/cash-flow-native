import { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { GlassCard } from '@/components/GlassCard';
import { FlowCard } from '@/components/FlowCard';
import { PersonCard } from '@/components/PersonCard';
import { CashFlowChart } from '@/components/CashFlowChart';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { initDatabase } from '@/database/init';
import { getDashboardStats, getChartData, type ChartDataPoint } from '@/database/transactionsService';
import { getPeopleWithBalances } from '@/database/peopleService';
import type { PersonWithBalance, DashboardStats } from '@/types/database';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography } from '@/constants/Theme';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

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

  const balanceVariant = stats.totalBalance > 0 ? 'success' : stats.totalBalance < 0 ? 'danger' : 'primary';

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
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>
            Welcome back
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>
            Cash Flow
          </Text>
        </View>

        {/* Total Balance Card */}
        <View style={styles.section}>
          <GlassCard
            title="Total Balance"
            value={stats.totalBalance}
            subtitle={`${stats.transactionCount} total transactions`}
            variant={balanceVariant}
          />
        </View>

        {/* Flow Cards */}
        <View style={styles.flowContainer}>
          <FlowCard type="incoming" amount={stats.totalIncoming} />
          <View style={styles.flowSpacer} />
          <FlowCard type="outgoing" amount={stats.totalOutgoing} />
        </View>

        {/* Cash Flow Chart */}
        <View style={styles.section}>
          <CashFlowChart data={chartData} />
        </View>

        {/* People List */}
        <View style={[styles.section, { paddingBottom: Platform.OS === 'ios' ? 120 : 108 }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            People ({people.length})
          </Text>

          {people.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.surfaceElevated }]}>
                <Text style={{ fontSize: 48 }}>💰</Text>
              </View>
              <Text style={[styles.emptyText, { color: theme.text }]}>
                No people added yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
                Tap the + button to start tracking
              </Text>
            </View>
          ) : (
            people.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </SafeAreaView>
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
