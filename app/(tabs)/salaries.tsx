import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
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
import { Picker } from '@react-native-picker/picker';
import { ThemedBackground } from '@/components/ThemedBackground';
import { CurrencyText } from '@/components/CurrencyText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { initDatabase } from '@/database/init';
import {
  getAllSalaries,
  createSalary,
  updateSalary,
  deleteSalary,
  getTotalByStatus,
  getTotalSalaries,
} from '@/database/salariesService';
import type { Salary, SalaryStatus } from '@/types/database';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/Theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function SalariesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const themeColors = isDark ? Colors.dark : Colors.light;

  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form fields
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<SalaryStatus>('pending');

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<SalaryStatus | 'all'>('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Totals
  const [totalReceived, setTotalReceived] = useState(0);
  const [totalNotReceived, setTotalNotReceived] = useState(0);
  const [totalPending, setTotalPending] = useState(0);

  const loadData = async () => {
    try {
      await initDatabase();
      const [allSalaries, received, notReceived, pending] = await Promise.all([
        getAllSalaries(),
        getTotalByStatus('received'),
        getTotalByStatus('not_received'),
        getTotalByStatus('pending'),
      ]);
      setSalaries(allSalaries);
      setTotalReceived(received);
      setTotalNotReceived(notReceived);
      setTotalPending(pending);
    } catch (error) {
      console.error('Error loading salaries:', error);
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

  const filteredSalaries = useMemo(() => {
    let filtered = salaries;
    if (filterStatus !== 'all') {
      filtered = filtered.filter((s) => s.status === filterStatus);
    }
    if (filterStartDate) {
      filtered = filtered.filter((s) => s.date >= filterStartDate);
    }
    if (filterEndDate) {
      filtered = filtered.filter((s) => s.date <= filterEndDate);
    }
    return filtered;
  }, [salaries, filterStatus, filterStartDate, filterEndDate]);

  const hasActiveFilters = filterStatus !== 'all' || filterStartDate || filterEndDate;

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterStartDate('');
    setFilterEndDate('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setStatus('pending');
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!description.trim() || !amount.trim()) {
      Alert.alert('Error', 'Please fill in description and amount');
      return;
    }

    try {
      const data = {
        description: description.trim(),
        amount: parseFloat(amount),
        date,
        status,
      };

      if (editingId) {
        await updateSalary(editingId, data);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await createSalary(data);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      resetForm();
      setShowForm(false);
      await loadData();
    } catch (error) {
      console.error('Error saving salary:', error);
      Alert.alert('Error', 'Failed to save salary');
    }
  };

  const handleEdit = (salary: Salary) => {
    setDescription(salary.description);
    setAmount(salary.amount.toString());
    setDate(salary.date);
    setStatus(salary.status);
    setEditingId(salary.id);
    setShowForm(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Salary', 'Are you sure you want to delete this salary record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSalary(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await loadData();
          } catch (error) {
            console.error('Error deleting salary:', error);
            Alert.alert('Error', 'Failed to delete salary');
          }
        },
      },
    ]);
  };

  return (
    <ThemedBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={[styles.title, { color: theme.text }]}>Salaries</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  onPress={() => {
                    setShowFilters(!showFilters);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.iconButton,
                    { backgroundColor: hasActiveFilters ? '#06b6d4' : theme.surface },
                    Shadows.base,
                  ]}
                >
                  <Ionicons
                    name="funnel"
                    size={20}
                    color={hasActiveFilters ? '#ffffff' : theme.text}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    resetForm();
                    setShowForm(!showForm);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }}
                  style={[styles.iconButton, { backgroundColor: theme.primary }, Shadows.base]}
                >
                  <Ionicons name={showForm ? 'close' : 'add'} size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, { flex: 1, marginRight: Spacing.xs }]}>
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
                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                <Text style={styles.summaryLabel}>Received</Text>
                <CurrencyText
                  amount={totalReceived}
                  symbolSize={8}
                  amountSize={Typography.sizes.lg}
                  color="#ffffff"
                />
              </View>
            </View>
            <View style={[styles.summaryCard, { flex: 1, marginHorizontal: Spacing.xs }]}>
              <View
                style={[
                  styles.summaryGradient,
                  {
                    backgroundColor: '#fbbf24',
                    borderColor: themeColors.border,
                    borderWidth: 1
                  },
                  Shadows.md
                ]}
              >
                <Ionicons name="time" size={20} color="#ffffff" />
                <Text style={styles.summaryLabel}>Pending</Text>
                <CurrencyText
                  amount={totalPending}
                  symbolSize={8}
                  amountSize={Typography.sizes.lg}
                  color="#ffffff"
                />
              </View>
            </View>
            <View style={[styles.summaryCard, { flex: 1, marginLeft: Spacing.xs }]}>
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
                <Ionicons name="close-circle" size={20} color="#ffffff" />
                <Text style={styles.summaryLabel}>Not Received</Text>
                <CurrencyText
                  amount={totalNotReceived}
                  symbolSize={8}
                  amountSize={Typography.sizes.lg}
                  color="#ffffff"
                />
              </View>
            </View>
          </View>

          {/* Filters */}
          {showFilters && (
            <View style={[styles.filtersPanel, { backgroundColor: theme.surface }, Shadows.md]}>
              <View style={styles.filterRow}>
                <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Status</Text>
                <View style={[styles.pickerContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Picker
                    selectedValue={filterStatus}
                    onValueChange={(value) => setFilterStatus(value as SalaryStatus | 'all')}
                    style={[styles.picker, { color: theme.text }]}
                  >
                    <Picker.Item label="All Status" value="all" />
                    <Picker.Item label="Received" value="received" />
                    <Picker.Item label="Pending" value="pending" />
                    <Picker.Item label="Not Received" value="not_received" />
                  </Picker>
                </View>
              </View>
              <View style={styles.filterRow}>
                <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Date Range</Text>
                <View style={styles.dateRow}>
                  <TextInput
                    style={[
                      styles.dateInput,
                      { backgroundColor: theme.background, borderColor: theme.border, color: theme.text },
                    ]}
                    placeholder="From (YYYY-MM-DD)"
                    placeholderTextColor={theme.textTertiary}
                    value={filterStartDate}
                    onChangeText={setFilterStartDate}
                  />
                  <TextInput
                    style={[
                      styles.dateInput,
                      { backgroundColor: theme.background, borderColor: theme.border, color: theme.text },
                    ]}
                    placeholder="To (YYYY-MM-DD)"
                    placeholderTextColor={theme.textTertiary}
                    value={filterEndDate}
                    onChangeText={setFilterEndDate}
                  />
                </View>
              </View>
              {hasActiveFilters && (
                <TouchableOpacity
                  onPress={clearFilters}
                  style={[styles.clearButton, { borderColor: '#f43f5e' }, Shadows.sm]}
                >
                  <Ionicons name="close-circle" size={18} color="#f43f5e" />
                  <Text style={[styles.clearButtonText, { color: '#f43f5e' }]}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Form */}
          {showForm && (
            <View style={[styles.formPanel, { backgroundColor: theme.surface }, Shadows.md]}>
              <Text style={[styles.formTitle, { color: theme.text }]}>
                {editingId ? 'Edit Salary' : 'Add Salary'}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, borderColor: theme.border, color: theme.text },
                ]}
                placeholder="Description *"
                placeholderTextColor={theme.textTertiary}
                value={description}
                onChangeText={setDescription}
              />
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, borderColor: theme.border, color: theme.text },
                ]}
                placeholder="Amount *"
                placeholderTextColor={theme.textTertiary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, borderColor: theme.border, color: theme.text },
                ]}
                placeholder="Date (YYYY-MM-DD)"
                placeholderTextColor={theme.textTertiary}
                value={date}
                onChangeText={setDate}
              />
              <View style={[styles.pickerContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Picker
                  selectedValue={status}
                  onValueChange={(value) => setStatus(value as SalaryStatus)}
                  style={[styles.picker, { color: theme.text }]}
                >
                  <Picker.Item label="Pending" value="pending" />
                  <Picker.Item label="Received" value="received" />
                  <Picker.Item label="Not Received" value="not_received" />
                </Picker>
              </View>
              <View style={styles.formButtons}>
                <TouchableOpacity
                  onPress={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  style={[styles.cancelButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={[styles.submitButton, { backgroundColor: theme.primary }]}
                >
                  <Text style={styles.submitButtonText}>
                    {editingId ? 'Update' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Salaries List */}
          <View style={[styles.section, { paddingBottom: 100 }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              All Salaries ({filteredSalaries.length})
            </Text>
            {filteredSalaries.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.surface }, Shadows.base]}>
                <Text style={{ fontSize: 32, marginBottom: Spacing.sm }}>💰</Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No salary records
                </Text>
              </View>
            ) : (
              filteredSalaries.map((salary, index) => (
                <SalaryCard
                  key={salary.id}
                  salary={salary}
                  index={index}
                  theme={theme}
                  isDark={isDark}
                  onEdit={() => handleEdit(salary)}
                  onDelete={() => handleDelete(salary.id)}
                />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedBackground>
  );
}

interface SalaryCardProps {
  salary: Salary;
  index: number;
  theme: any;
  isDark: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function SalaryCard({ salary, index, theme, isDark, onEdit, onDelete }: SalaryCardProps) {
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
      translateY.value = withDelay(index * 30, withSpring(0, { damping: 15 }));
      hasAnimated.current = true;
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const statusColors = {
    received: '#10b981',
    pending: '#fbbf24',
    not_received: '#f43f5e',
  };

  const statusIcons = {
    received: 'checkmark-circle',
    pending: 'time',
    not_received: 'close-circle',
  };

  const statusLabels = {
    received: 'Received',
    pending: 'Pending',
    not_received: 'Not Received',
  };

  return (
    <AnimatedTouchable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.salaryCard, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }, Shadows.base, animatedStyle]}
    >
      <View style={styles.cardLeft}>
        <View
          style={[styles.avatar, { backgroundColor: statusColors[salary.status] }]}
        >
          <Ionicons name={statusIcons[salary.status] as any} size={20} color="#ffffff" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.salaryDescription, { color: theme.text }]}>
            {salary.description}
          </Text>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={12} color={theme.textTertiary} />
              <Text style={[styles.metaText, { color: theme.textTertiary }]}>
                {formatDate(salary.date)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={[styles.statusBadge, { 
                backgroundColor: salary.status === 'received' ? 'rgba(16, 185, 129, 0.2)' : 
                                salary.status === 'pending' ? 'rgba(251, 191, 36, 0.2)' : 
                                'rgba(244, 63, 94, 0.2)',
                color: salary.status === 'received' ? '#10b981' : 
                       salary.status === 'pending' ? '#fbbf24' : '#f43f5e'
              }]}>
                {statusLabels[salary.status]}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.cardRight}>
        <CurrencyText
          amount={salary.amount}
          symbolSize={9}
          amountSize={Typography.sizes.lg}
          color={salary.status === 'received' ? theme.success : salary.status === 'pending' ? '#fbbf24' : theme.danger}
        />
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
            <Ionicons name="pencil" size={18} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>
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
  headerButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  summaryCard: {},
  summaryGradient: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: Typography.sizes.xs,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: Spacing.xs,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
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
  pickerContainer: {
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    overflow: 'hidden',
  },
  picker: {
    height: 40,
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dateInput: {
    flex: 1,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    fontSize: Typography.sizes.xs,
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
  formPanel: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  formTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.base,
  },
  input: {
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.sizes.sm,
    marginBottom: Spacing.sm,
  },
  formButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  cancelButton: {
    flex: 1,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  submitButton: {
    flex: 1,
    borderRadius: BorderRadius.base,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: '#ffffff',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.base,
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
  salaryCard: {
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
  salaryDescription: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: Typography.sizes.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionButton: {
    padding: Spacing.xs,
  },
});
