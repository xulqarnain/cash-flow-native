import { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/components/GlassCard';
import { FlowCard } from '@/components/FlowCard';
import { PersonCard } from '@/components/PersonCard';
import { initDatabase, getDashboardStats } from '@/database/transactionsService';
import { getPeopleWithBalances } from '@/database/peopleService';
import type { PersonWithBalance, DashboardStats } from '@/types/database';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [stats, setStats] = useState<DashboardStats>({
    totalBalance: 0,
    totalIncoming: 0,
    totalOutgoing: 0,
    transactionCount: 0,
    peopleCount: 0,
  });
  const [people, setPeople] = useState<PersonWithBalance[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      await initDatabase();
      const [dashboardStats, peopleWithBalances] = await Promise.all([
        getDashboardStats(),
        getPeopleWithBalances(),
      ]);
      setStats(dashboardStats);
      setPeople(peopleWithBalances);
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
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f9fafb' }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? '#f9fafb' : '#111827' }]}>
            Cash Flow Dashboard
          </Text>
        </View>

        {/* Total Balance Card */}
        <View style={styles.section}>
          <GlassCard
            title="Total Balance"
            value={`$${stats.totalBalance.toFixed(2)}`}
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

        {/* People List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              People ({people.length})
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/add-person')}
            >
              <Ionicons name="add-circle" size={28} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {people.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="people-outline"
                size={64}
                color={isDark ? '#4b5563' : '#d1d5db'}
              />
              <Text style={[styles.emptyText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                No people added yet
              </Text>
              <Text style={[styles.emptySubtext, { color: isDark ? '#6b7280' : '#9ca3af' }]}>
                Tap the + button to add someone
              </Text>
            </View>
          ) : (
            people.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  addButton: {
    padding: 4,
  },
  flowContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  flowSpacer: {
    width: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
});
