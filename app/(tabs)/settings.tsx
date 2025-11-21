import { Dropdown } from '@/components/Dropdown';
import { ThemedBackground } from '@/components/ThemedBackground';
import { Colors } from '@/constants/Theme';
import { currencies, useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { themeOptions, useAppTheme } from '@/contexts/ThemeContext';
import { createExpense, getAllExpenses } from '@/database/expensesService';
import { resetDatabase } from '@/database/init';
import { createPerson, getAllPeople } from '@/database/peopleService';
import { createSalary, getAllSalaries } from '@/database/salariesService';
import { createTransaction, getAllTransactions } from '@/database/transactionsService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? Colors.dark : Colors.light;
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { theme, setTheme } = useAppTheme();

  const handleExportCSV = async () => {
    try {
      const [people, transactions, expenses, salaries] = await Promise.all([
        getAllPeople(),
        getAllTransactions(),
        getAllExpenses(),
        getAllSalaries(),
      ]);

      // Create CSV content
      let csvContent = 'Export Date: ' + new Date().toISOString() + '\n\n';

      // People CSV
      csvContent += '=== PEOPLE ===\n';
      csvContent += 'ID,Name,Phone,Created At\n';
      people.forEach(person => {
        csvContent += `${person.id},"${person.name}","${person.phone || ''}","${person.createdAt}"\n`;
      });

      csvContent += '\n=== TRANSACTIONS ===\n';
      csvContent += 'ID,Person ID,Person Name,Amount,Type,Description,Category,Date,Created At\n';
      transactions.forEach(txn => {
        csvContent += `${txn.id},${txn.personId},"${txn.personName}",${txn.amount},"${txn.type}","${txn.description}","${txn.category || ''}","${txn.date}","${txn.createdAt}"\n`;
      });

      // Expenses CSV
      csvContent += '\n=== EXPENSES ===\n';
      csvContent += 'ID,Description,Amount,Date,Category,Created At\n';
      expenses.forEach(expense => {
        csvContent += `${expense.id},"${expense.description}",${expense.amount},"${expense.date}","${expense.category || ''}","${expense.createdAt}"\n`;
      });

      // Salaries CSV
      csvContent += '\n=== SALARIES ===\n';
      csvContent += 'ID,Description,Amount,Date,Status,Created At\n';
      salaries.forEach(salary => {
        csvContent += `${salary.id},"${salary.description}",${salary.amount},"${salary.date}","${salary.status}","${salary.createdAt}"\n`;
      });

      // Save to file
      const fileName = `cashflow_export_${new Date().getTime()}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Success', `Data exported to ${fileUri}`);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleImportCSV = async () => {
    Alert.alert(
      'Import CSV',
      'This feature will import people, transactions, expenses, and salaries from a CSV file. Make sure your CSV follows the export format.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: performImport },
      ]
    );
  };

  const performImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/comma-separated-values',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);

      // Parse CSV (basic implementation)
      const lines = fileContent.split('\n');
      let section = '';
      let importedPeople = 0;
      let importedTransactions = 0;
      let importedExpenses = 0;
      let importedSalaries = 0;

      for (const line of lines) {
        if (line.includes('=== PEOPLE ===')) {
          section = 'people';
          continue;
        } else if (line.includes('=== TRANSACTIONS ===')) {
          section = 'transactions';
          continue;
        } else if (line.includes('=== EXPENSES ===')) {
          section = 'expenses';
          continue;
        } else if (line.includes('=== SALARIES ===')) {
          section = 'salaries';
          continue;
        } else if (line.includes('ID,') || line.trim() === '' || line.includes('Export Date:')) {
          continue;
        }

        if (section === 'people') {
          const parts = line.match(/(?:[^,"]+|"[^"]*")+/g);
          if (parts && parts.length >= 3) {
            const name = parts[1].replace(/"/g, '');
            const phone = parts[2].replace(/"/g, '') || undefined;
            await createPerson(name, phone);
            importedPeople++;
          }
        } else if (section === 'transactions') {
          const parts = line.match(/(?:[^,"]+|"[^"]*")+/g);
          if (parts && parts.length >= 8) {
            const personId = parseInt(parts[1]);
            const amount = parseFloat(parts[3]);
            const type = parts[4].replace(/"/g, '') as 'incoming' | 'outgoing';
            const description = parts[5].replace(/"/g, '');
            const category = parts[6].replace(/"/g, '') || undefined;
            const date = parts[7].replace(/"/g, '');

            await createTransaction({
              personId,
              amount,
              type,
              description,
              category,
              date,
            });
            importedTransactions++;
          }
        } else if (section === 'expenses') {
          const parts = line.match(/(?:[^,"]+|"[^"]*")+/g);
          if (parts && parts.length >= 5) {
            const description = parts[1].replace(/"/g, '');
            const amount = parseFloat(parts[2]);
            const date = parts[3].replace(/"/g, '');
            const category = parts[4].replace(/"/g, '') || undefined;

            await createExpense({
              description,
              amount,
              date,
              category,
            });
            importedExpenses++;
          }
        } else if (section === 'salaries') {
          const parts = line.match(/(?:[^,"]+|"[^"]*")+/g);
          if (parts && parts.length >= 5) {
            const description = parts[1].replace(/"/g, '');
            const amount = parseFloat(parts[2]);
            const date = parts[3].replace(/"/g, '');
            const status = parts[4].replace(/"/g, '') as 'received' | 'not_received' | 'pending';

            await createSalary({
              description,
              amount,
              date,
              status,
            });
            importedSalaries++;
          }
        }
      }

      Alert.alert(
        'Import Complete',
        `Imported:\n${importedPeople} people\n${importedTransactions} transactions\n${importedExpenses} expenses\n${importedSalaries} salaries`
      );
    } catch (error) {
      console.error('Error importing CSV:', error);
      Alert.alert('Error', 'Failed to import data. Please check the file format.');
    }
  };

  const handleResetDatabase = () => {
    Alert.alert(
      'Reset Database',
      'This will delete ALL data permanently. This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetDatabase();
              Alert.alert('Success', 'All data has been deleted');
            } catch (error) {
              console.error('Error resetting database:', error);
              Alert.alert('Error', 'Failed to reset database');
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.text }]}>
              {t('settings')}
            </Text>
          </View>

          {/* Language Section */}
          <View style={styles.section}>
            <Dropdown
              label={t('language')}
              value={language}
              options={[
                { label: t('english'), value: 'en', icon: 'language-outline', iconColor: themeColors.primary },
                { label: t('roman_urdu'), value: 'ur', icon: 'language-outline', iconColor: '#ec4899' },
              ]}
              onSelect={(val) => setLanguage(val as any)}
            />
          </View>

          {/* Currency Section */}
          <View style={styles.section}>
            <Dropdown
              label="Currency"
              value={currency}
              options={currencies.map(c => ({
                label: `${c.symbol} - ${c.name}`,
                value: c.code,
                icon: 'cash-outline',
                iconColor: '#10b981'
              }))}
              onSelect={(val) => setCurrency(val as any)}
            />
          </View>

          {/* Theme Section */}
          <View style={styles.section}>
            <Dropdown
              label="Theme"
              value={theme}
              options={themeOptions.map(t => ({
                label: t.name,
                value: t.id,
                icon: t.id === 'gradient-black' ? 'color-filter-outline' : t.id === 'glass-blur' ? 'sparkles-outline' : 'square-outline',
                iconColor: t.id === 'gradient-black' ? '#8b5cf6' : t.id === 'glass-blur' ? themeColors.primary : themeColors.text
              }))}
              onSelect={(val) => setTheme(val as any)}
            />
          </View>

          {/* Data Management Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Data Management
            </Text>

            <TouchableOpacity
              style={[
                styles.settingItem,
                {
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border,
                }
              ]}
              onPress={handleExportCSV}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="download-outline" size={24} color="#22d3ee" />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: themeColors.text }]}>
                    Export Data (CSV)
                  </Text>
                  <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
                    Export all people and transactions
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.settingItem,
                {
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border,
                }
              ]}
              onPress={handleImportCSV}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="cloud-upload-outline" size={24} color="#10b981" />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: themeColors.text }]}>
                    Import Data (CSV)
                  </Text>
                  <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
                    Import people and transactions from CSV
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#f43f5e' }]}>
              Danger Zone
            </Text>

            <TouchableOpacity
              style={[
                styles.settingItem,
                {
                  backgroundColor: themeColors.surface,
                  borderColor: '#f43f5e',
                  borderWidth: 1,
                }
              ]}
              onPress={handleResetDatabase}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="trash-outline" size={24} color="#f43f5e" />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: '#f43f5e' }]}>
                    Reset Database
                  </Text>
                  <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
                    Delete all data permanently
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#f43f5e" />
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              About
            </Text>
            <View style={[
              styles.aboutCard,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              }
            ]}>
              <Text style={[styles.aboutTitle, { color: themeColors.text }]}>
                Cash Flow Tracker
              </Text>
              <Text style={[styles.aboutVersion, { color: themeColors.textSecondary }]}>
                Version 1.0.0
              </Text>
              <Text style={[styles.aboutDescription, { color: themeColors.textSecondary }]}>
                Track money owed to and by specific individuals with ease.
              </Text>
              <Text style={[styles.aboutCredit, { color: themeColors.textSecondary }]}>
                Built with ❤️ By Xulqarnain
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
  },
  aboutCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 14,
    marginBottom: 12,
  },
  aboutDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  aboutCredit: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
});
