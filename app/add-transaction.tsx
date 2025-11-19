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
import { Picker } from '@react-native-picker/picker';
import { createTransaction } from '@/database/transactionsService';
import { getAllPeople } from '@/database/peopleService';
import type { Person } from '@/types/database';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AddTransactionModal() {
  const router = useRouter();
  const { personId } = useLocalSearchParams<{ personId?: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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

  useEffect(() => {
    loadPeople();
  }, []);

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
      router.back();
    } catch (error) {
      console.error('Error creating transaction:', error);
      Alert.alert('Error', 'Failed to add transaction');
      setIsSubmitting(false);
    }
  };

  if (people.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f9fafb' }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
            <Text style={[styles.cancelText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: isDark ? '#f9fafb' : '#111827' }]}>
            Add Transaction
          </Text>
          <View style={styles.saveButton} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="people-outline"
            size={64}
            color={isDark ? '#4b5563' : '#d1d5db'}
          />
          <Text style={[styles.emptyText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            No people added yet
          </Text>
          <Text style={[styles.emptySubtext, { color: isDark ? '#6b7280' : '#9ca3af' }]}>
            Add a person first to create transactions
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f9fafb' }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
          <Text style={[styles.cancelText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? '#f9fafb' : '#111827' }]}>
          Add Transaction
        </Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={styles.saveButton}
        >
          <Text style={[
            styles.saveText,
            { color: isSubmitting ? '#9ca3af' : '#3b82f6' }
          ]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.form}>
        {/* Person Picker */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: isDark ? '#f9fafb' : '#111827' }]}>
            Person *
          </Text>
          <View style={[
            styles.pickerContainer,
            {
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderColor: isDark ? '#374151' : '#e5e7eb',
            }
          ]}>
            <Picker
              selectedValue={selectedPersonId}
              onValueChange={(value) => setSelectedPersonId(value)}
              style={[styles.picker, { color: isDark ? '#f9fafb' : '#111827' }]}
            >
              {people.map((person) => (
                <Picker.Item key={person.id} label={person.name} value={person.id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Transaction Type */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: isDark ? '#f9fafb' : '#111827' }]}>
            Type *
          </Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'incoming' && styles.typeButtonActive,
                {
                  backgroundColor: type === 'incoming'
                    ? '#10b981'
                    : isDark ? '#1f2937' : '#ffffff',
                  borderColor: type === 'incoming'
                    ? '#10b981'
                    : isDark ? '#374151' : '#e5e7eb',
                }
              ]}
              onPress={() => setType('incoming')}
            >
              <Ionicons
                name="arrow-down-circle"
                size={24}
                color={type === 'incoming' ? '#ffffff' : isDark ? '#9ca3af' : '#6b7280'}
              />
              <Text style={[
                styles.typeText,
                { color: type === 'incoming' ? '#ffffff' : isDark ? '#9ca3af' : '#6b7280' }
              ]}>
                Money In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'outgoing' && styles.typeButtonActive,
                {
                  backgroundColor: type === 'outgoing'
                    ? '#ef4444'
                    : isDark ? '#1f2937' : '#ffffff',
                  borderColor: type === 'outgoing'
                    ? '#ef4444'
                    : isDark ? '#374151' : '#e5e7eb',
                }
              ]}
              onPress={() => setType('outgoing')}
            >
              <Ionicons
                name="arrow-up-circle"
                size={24}
                color={type === 'outgoing' ? '#ffffff' : isDark ? '#9ca3af' : '#6b7280'}
              />
              <Text style={[
                styles.typeText,
                { color: type === 'outgoing' ? '#ffffff' : isDark ? '#9ca3af' : '#6b7280' }
              ]}>
                Money Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: isDark ? '#f9fafb' : '#111827' }]}>
            Amount *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                borderColor: isDark ? '#374151' : '#e5e7eb',
                color: isDark ? '#f9fafb' : '#111827',
              }
            ]}
            placeholder="0.00"
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: isDark ? '#f9fafb' : '#111827' }]}>
            Description *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                borderColor: isDark ? '#374151' : '#e5e7eb',
                color: isDark ? '#f9fafb' : '#111827',
              }
            ]}
            placeholder="Enter description"
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Category */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: isDark ? '#f9fafb' : '#111827' }]}>
            Category (Optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                borderColor: isDark ? '#374151' : '#e5e7eb',
                color: isDark ? '#f9fafb' : '#111827',
              }
            ]}
            placeholder="e.g., Loan, Payment, Gift"
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            value={category}
            onChangeText={setCategory}
          />
        </View>

        {/* Date */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: isDark ? '#f9fafb' : '#111827' }]}>
            Date *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                borderColor: isDark ? '#374151' : '#e5e7eb',
                color: isDark ? '#f9fafb' : '#111827',
              }
            ]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            value={date}
            onChangeText={setDate}
          />
        </View>
      </ScrollView>
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
    padding: 16,
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  typeButtonActive: {
    borderWidth: 2,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
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
