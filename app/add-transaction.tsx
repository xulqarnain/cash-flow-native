import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/Theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAllPeople } from '@/database/peopleService';
import { createTransaction } from '@/database/transactionsService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Person } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function AddTransactionModal() {
  const router = useRouter();
  const { personId } = useLocalSearchParams<{ personId?: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const themeColors = isDark ? Colors.dark : Colors.light;
  const { t } = useLanguage();

  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<number>(
    personId ? parseInt(personId) : 0
  );
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'incoming' | 'outgoing'>('incoming');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    loadPeople();
    opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
    translateY.value = withSpring(0, { damping: 15 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const loadPeople = async () => {
    try {
      const allPeople = await getAllPeople();
      setPeople(allPeople);
      if (allPeople.length > 0 && !selectedPersonId) {
        setSelectedPersonId(allPeople[0].id);
      }
    } catch (error) {
      console.error('Error loading people:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPersonId) {
      Alert.alert(t('error'), t('select_person_error'));
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert(t('error'), t('invalid_amount_error'));
      return;
    }
    if (!description.trim()) {
      Alert.alert(t('error'), t('enter_description_error'));
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);
    try {
      await createTransaction({
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
      console.error('Error creating transaction:', error);
      Alert.alert(t('error'), t('add_transaction_error'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (people.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.iconButton}>
            <Ionicons name="close" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>
            {t('add_transaction')}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.surfaceElevated }]}>
            <Text style={{ fontSize: 48 }}>👥</Text>
          </View>
          <Text style={[styles.emptyText, { color: theme.text }]}>
            {t('no_people')}
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
            {t('add_person_first')}
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
            {t('add_transaction')}
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
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: type === 'incoming' ? themeColors.success : themeColors.danger
                  }
                ]}
              >
                <Ionicons
                  name={type === 'incoming' ? 'arrow-down' : 'arrow-up'}
                  size={32}
                  color="#ffffff"
                />
              </View>
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
                  <View
                    style={[
                      styles.typeGradient,
                      type === 'incoming'
                        ? { backgroundColor: themeColors.success }
                        : { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }
                    ]}
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
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.typeButton, type === 'outgoing' && styles.typeButtonActive]}
                  onPress={() => {
                    setType('outgoing');
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <View
                    style={[
                      styles.typeGradient,
                      type === 'outgoing'
                        ? { backgroundColor: themeColors.danger }
                        : { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }
                    ]}
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
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Person Picker */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                {t('person_required')}
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
                  placeholder={t('category_placeholder')}
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
            <View
              style={[
                styles.gradientButton,
                {
                  backgroundColor: isSubmitting
                    ? '#9ca3af'
                    : type === 'incoming'
                      ? themeColors.success
                      : themeColors.danger
                },
                Shadows.md
              ]}
            >
              {isSubmitting ? (
                <Text style={[styles.buttonText, { color: '#ffffff' }]}>
                  {t('saving')}
                </Text>
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                  <Text style={[styles.buttonText, { color: '#ffffff', marginLeft: Spacing.sm }]}>
                    {t('save')}
                  </Text>
                </>
              )}
            </View>
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
