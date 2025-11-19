import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { updateTransaction, getTransactionById } from '@/database/transactionsService';
import { getAllPeople } from '@/database/peopleService';
import type { Person } from '@/types/database';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLanguage } from '@/contexts/LanguageContext';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/Theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function EditTransactionModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const { t } = useLanguage();

  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<number>(0);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'incoming' | 'outgoing'>('incoming');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    loadData();
    opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
    translateY.value = withSpring(0, { damping: 15 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const loadData = async () => {
    try {
      const [allPeople, transaction] = await Promise.all([
        getAllPeople(),
        getTransactionById(parseInt(id)),
      ]);

      setPeople(allPeople);

      if (transaction) {
        setSelectedPersonId(transaction.personId);
        setAmount(transaction.amount.toString());
        setType(transaction.type);
        setDescription(transaction.description);
        setCategory(transaction.category || '');
        setDate(transaction.date);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading transaction:', error);
      Alert.alert('Error', 'Failed to load transaction');
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPersonId) {
      Alert.alert('Error', 'Please select a person');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);
    try {
      await updateTransaction(parseInt(id), {
        personId: selectedPersonId,
        amount: parseFloat(amount),
        type,
        description: description.trim(),
        category: category.trim() || undefined,
        date,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('Error updating transaction:', error);
      Alert.alert('Error', 'Failed to update transaction');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (isLoading) {
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

  if (people.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.iconButton}>
            <Ionicons name="close" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>
            Edit Transaction
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.surfaceElevated }]}>
            <Text style={{ fontSize: 48 }}>👥</Text>
          </View>
          <Text style={[styles.emptyText, { color: theme.text }]}>
            No people added yet
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
            Add a person first to create transactions
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.iconButton}>
            <Ionicons name="close" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>
            Edit Transaction
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Form */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.formContainer, animatedStyle]}>
            {/* Icon Header */}
            <View style={styles.iconHeader}>
              <LinearGradient
                colors={type === 'incoming' ? ['#10b981', '#14b8a6'] : ['#f43f5e', '#fb7185']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconCircle}
              >
                <Ionicons
                  name={type === 'incoming' ? 'arrow-down' : 'arrow-up'}
                  size={32}
                  color="#ffffff"
                />
              </LinearGradient>
            </View>

            {/* Transaction Type */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                {t('type')} *
              </Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'incoming' && styles.typeButtonActive]}
                  onPress={() => {
                    setType('incoming');
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <LinearGradient
                    colors={type === 'incoming' ? ['#10b981', '#14b8a6'] : ['transparent', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.typeGradient, type !== 'incoming' && { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}
                  >
                    <Ionicons
                      name="arrow-down"
                      size={20}
                      color={type === 'incoming' ? '#ffffff' : theme.textTertiary}
                    />
                    <Text style={[
                      styles.typeText,
                      { color: type === 'incoming' ? '#ffffff' : theme.textSecondary }
                    ]}>
                      {t('incoming')}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.typeButton, type === 'outgoing' && styles.typeButtonActive]}
                  onPress={() => {
                    setType('outgoing');
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <LinearGradient
                    colors={type === 'outgoing' ? ['#f43f5e', '#fb7185'] : ['transparent', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.typeGradient, type !== 'outgoing' && { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}
                  >
                    <Ionicons
                      name="arrow-up"
                      size={20}
                      color={type === 'outgoing' ? '#ffffff' : theme.textTertiary}
                    />
                    <Text style={[
                      styles.typeText,
                      { color: type === 'outgoing' ? '#ffffff' : theme.textSecondary }
                    ]}>
                      {t('outgoing')}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Person Picker */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Person *
              </Text>
              <View style={[
                styles.inputContainer,
                { backgroundColor: theme.surface, borderColor: theme.border },
                Shadows.sm,
              ]}>
                <Ionicons name="person-outline" size={20} color={theme.textTertiary} />
                <Picker
                  selectedValue={selectedPersonId}
                  onValueChange={(value) => setSelectedPersonId(value)}
                  style={[styles.picker, { color: theme.text }]}
                >
                  {people.map((person) => (
                    <Picker.Item key={person.id} label={person.name} value={person.id} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Amount */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                {t('amount')} *
              </Text>
              <View style={[
                styles.inputContainer,
                { backgroundColor: theme.surface, borderColor: theme.border },
                Shadows.sm,
              ]}>
                <Ionicons name="cash-outline" size={20} color={theme.textTertiary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="0.00"
                  placeholderTextColor={theme.textTertiary}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                {t('description')} *
              </Text>
              <View style={[
                styles.inputContainer,
                { backgroundColor: theme.surface, borderColor: theme.border },
                Shadows.sm,
              ]}>
                <Ionicons name="document-text-outline" size={20} color={theme.textTertiary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder={t('enter_description')}
                  placeholderTextColor={theme.textTertiary}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>

            {/* Category */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                {t('category')} ({t('optional')})
              </Text>
              <View style={[
                styles.inputContainer,
                { backgroundColor: theme.surface, borderColor: theme.border },
                Shadows.sm,
              ]}>
                <Ionicons name="pricetag-outline" size={20} color={theme.textTertiary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="e.g., Loan, Payment, Gift"
                  placeholderTextColor={theme.textTertiary}
                  value={category}
                  onChangeText={setCategory}
                />
              </View>
            </View>

            {/* Date */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                {t('date')} *
              </Text>
              <View style={[
                styles.inputContainer,
                { backgroundColor: theme.surface, borderColor: theme.border },
                Shadows.sm,
              ]}>
                <Ionicons name="calendar-outline" size={20} color={theme.textTertiary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.textTertiary}
                  value={date}
                  onChangeText={setDate}
                />
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <AnimatedTouchable
            onPress={handleCancel}
            style={[styles.button, styles.cancelButtonStyle]}
          >
            <View style={[
              styles.cancelButton,
              { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
              Shadows.base,
            ]}>
              <Text style={[styles.buttonText, { color: theme.text }]}>
                {t('cancel')}
              </Text>
            </View>
          </AnimatedTouchable>

          <AnimatedTouchable
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={[styles.button, styles.saveButtonStyle]}
          >
            <LinearGradient
              colors={isSubmitting ? ['#9ca3af', '#6b7280'] : (type === 'incoming' ? ['#10b981', '#14b8a6'] : ['#f43f5e', '#fb7185'])}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.gradientButton, Shadows.md]}
            >
              {isSubmitting ? (
                <Text style={[styles.buttonText, { color: '#ffffff' }]}>
                  Updating...
                </Text>
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                  <Text style={[styles.buttonText, { color: '#ffffff', marginLeft: Spacing.sm }]}>
                    {t('save')}
                  </Text>
                </>
              )}
            </LinearGradient>
          </AnimatedTouchable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  formContainer: {
  },
  iconHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.base,
    marginLeft: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  picker: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  typeButton: {
    flex: 1,
    borderRadius: BorderRadius.base,
    overflow: 'hidden',
  },
  typeButtonActive: {
  },
  typeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    borderRadius: BorderRadius.base,
  },
  typeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    borderRadius: BorderRadius.base,
    overflow: 'hidden',
  },
  cancelButtonStyle: {
  },
  cancelButton: {
    paddingVertical: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.base,
  },
  saveButtonStyle: {
  },
  gradientButton: {
    paddingVertical: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
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
