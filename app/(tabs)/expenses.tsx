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
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ThemedBackground } from '@/components/ThemedBackground';
import { CurrencyText } from '@/components/CurrencyText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { initDatabase } from '@/database/init';
import {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getTotalExpenses,
} from '@/database/expensesService';
import type { Expense } from '@/types/database';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/Theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function ExpensesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form fields
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [totalExpenses, setTotalExpenses] = useState(0);

  const loadData = async () => {
    try {
      await initDatabase();
      const [allExpenses, total] = await Promise.all([
        getAllExpenses(),
        getTotalExpenses(),
      ]);
      setExpenses(allExpenses);
      setTotalExpenses(total);
    } catch (error) {
      console.error('Error loading expenses:', error);
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

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    if (filterCategory.trim()) {
      filtered = filtered.filter((e) =>
        e.category?.toLowerCase().includes(filterCategory.toLowerCase())
      );
    }

    if (filterStartDate) {
      filtered = filtered.filter((e) => e.date >= filterStartDate);
    }

    if (filterEndDate) {
      filtered = filtered.filter((e) => e.date <= filterEndDate);
    }

    return filtered;
  }, [expenses, filterCategory, filterStartDate, filterEndDate]);

  const hasActiveFilters = filterCategory.trim() || filterStartDate || filterEndDate;

  const clearFilters = () => {
    setFilterCategory('');
    setFilterStartDate('');
    setFilterEndDate('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('');
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
        category: category.trim() || undefined,
      };

      if (editingId) {
        await updateExpense(editingId, data);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await createExpense(data);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      resetForm();
      setShowForm(false);
      await loadData();
    } catch (error) {
      console.error('Error saving expense:', error);
      Alert.alert('Error', 'Failed to save expense');
    }
  };

  const handleEdit = (expense: Expense) => {
    setDescription(expense.description);
    setAmount(expense.amount.toString());
    setDate(expense.date);
    setCategory(expense.category || '');
    setEditingId(expense.id);
    setShowForm(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteExpense(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await loadData();
          } catch (error) {
            console.error('Error deleting expense:', error);
            Alert.alert('Error', 'Failed to delete expense');
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
              <Text style={[styles.title, { color: theme.text }]}>Expenses</Text>
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

          {/* Total Card */}
          <LinearGradient
            colors={['#f59e0b', '#fb923c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.totalCard, Shadows.md]}
          >
            <Ionicons name="wallet" size={28} color="#ffffff" />
            <Text style={styles.totalLabel}>Total Expenses</Text>
            <CurrencyText
              amount={totalExpenses}
              symbolSize={12}
              amountSize={Typography.sizes['3xl']}
              color="#ffffff"
            />
          </LinearGradient>

          {/* Filters */}
          {showFilters && (
            <View style={[styles.filtersPanel, { backgroundColor: theme.surface }, Shadows.md]}>
              <View style={styles.filterRow}>
                <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Category</Text>
                <TextInput
                  style={[
                    styles.filterInput,
                    { backgroundColor: theme.background, borderColor: theme.border, color: theme.text },
                  ]}
                  placeholder="Filter by category"
                  placeholderTextColor={theme.textTertiary}
                  value={filterCategory}
                  onChangeText={setFilterCategory}
                />
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
                {editingId ? 'Edit Expense' : 'Add Expense'}
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
                placeholder="Category"
                placeholderTextColor={theme.textTertiary}
                value={category}
                onChangeText={setCategory}
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

          {/* Expenses List */}
          <View style={[styles.section, { paddingBottom: 100 }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              All Expenses ({filteredExpenses.length})
            </Text>
            {filteredExpenses.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.surface }, Shadows.base]}>
                <Text style={{ fontSize: 32, marginBottom: Spacing.sm }}>💸</Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No expenses recorded
                </Text>
              </View>
            ) : (
              filteredExpenses.map((expense, index) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  index={index}
                  theme={theme}
                  isDark={isDark}
                  onEdit={() => handleEdit(expense)}
                  onDelete={() => handleDelete(expense.id)}
                />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedBackground>
  );
}

interface ExpenseCardProps {
  expense: Expense;
  index: number;
  theme: any;
  isDark: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function ExpenseCard({ expense, index, theme, isDark, onEdit, onDelete }: ExpenseCardProps) {
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

  return (
    <AnimatedTouchable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.expenseCard, { backgroundColor: theme.surface }, Shadows.base, animatedStyle]}
    >
      <View style={styles.cardLeft}>
        <LinearGradient
          colors={['#f59e0b', '#fb923c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Ionicons name="wallet" size={20} color="#ffffff" />
        </LinearGradient>
        <View style={styles.cardInfo}>
          <Text style={[styles.expenseDescription, { color: theme.text }]}>
            {expense.description}
          </Text>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={12} color={theme.textTertiary} />
              <Text style={[styles.metaText, { color: theme.textTertiary }]}>
                {formatDate(expense.date)}
              </Text>
            </View>
            {expense.category && (
              <View style={styles.metaItem}>
                <Ionicons name="pricetag-outline" size={12} color={theme.textTertiary} />
                <Text style={[styles.metaText, { color: theme.textTertiary }]}>
                  {expense.category}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.cardRight}>
        <CurrencyText
          amount={expense.amount}
          symbolSize={9}
          amountSize={Typography.sizes.lg}
          color={theme.danger}
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
  totalCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  totalLabel: {
    fontSize: Typography.sizes.sm,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: Spacing.xs,
    fontWeight: Typography.weights.semibold,
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
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.sizes.sm,
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
  expenseCard: {
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
  expenseDescription: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
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
