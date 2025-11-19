import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
import { useCurrency, currencies, type Currency } from '@/contexts/CurrencyContext';
import { useAppTheme, themeOptions, type AppTheme } from '@/contexts/ThemeContext';
import { ThemedBackground } from '@/components/ThemedBackground';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Shadows, BorderRadius } from '@/constants/Theme';
import { getAllPeople } from '@/database/peopleService';
import { getAllTransactions, createTransaction } from '@/database/transactionsService';
import { createPerson } from '@/database/peopleService';
import { resetDatabase } from '@/database/init';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? Colors.dark : Colors.light;
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { theme, setTheme } = useAppTheme();

  const handleExportCSV = async () => {
    try {
      const [people, transactions] = await Promise.all([
        getAllPeople(),
        getAllTransactions(),
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
      'This feature will import people and transactions from a CSV file. Make sure your CSV follows the export format.',
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

      for (const line of lines) {
        if (line.includes('=== PEOPLE ===')) {
          section = 'people';
          continue;
        } else if (line.includes('=== TRANSACTIONS ===')) {
          section = 'transactions';
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
        }
      }

      Alert.alert(
        'Import Complete',
        `Imported ${importedPeople} people and ${importedTransactions} transactions`
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
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            {t('language')}
          </Text>

          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: themeColors.surface,
                borderColor: language === 'en' ? themeColors.primary : themeColors.border,
                borderWidth: language === 'en' ? 2 : 1,
              }
            ]}
            onPress={() => setLanguage('en')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="language-outline" size={24} color={themeColors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: themeColors.text }]}>
                  {t('english')}
                </Text>
                <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
                  English
                </Text>
              </View>
            </View>
            {language === 'en' && <Ionicons name="checkmark-circle" size={24} color={themeColors.primary} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: themeColors.surface,
                borderColor: language === 'ur' ? themeColors.primary : themeColors.border,
                borderWidth: language === 'ur' ? 2 : 1,
              }
            ]}
            onPress={() => setLanguage('ur')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="language-outline" size={24} color="#ec4899" />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: themeColors.text }]}>
                  {t('roman_urdu')}
                </Text>
                <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
                  Roman Urdu
                </Text>
              </View>
            </View>
            {language === 'ur' && <Ionicons name="checkmark-circle" size={24} color="#ec4899" />}
          </TouchableOpacity>
        </View>

        {/* Currency Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Currency
          </Text>

          {currencies.map((curr) => (
            <TouchableOpacity
              key={curr.code}
              style={[
                styles.settingItem,
                {
                  backgroundColor: themeColors.surface,
                  borderColor: currency === curr.code ? themeColors.primary : themeColors.border,
                  borderWidth: currency === curr.code ? 2 : 1,
                }
              ]}
              onPress={() => setCurrency(curr.code)}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="cash-outline" size={24} color="#10b981" />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: themeColors.text }]}>
                    {curr.symbol} - {curr.name}
                  </Text>
                </View>
              </View>
              {currency === curr.code && <Ionicons name="checkmark-circle" size={24} color={themeColors.primary} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Theme
          </Text>

          {themeOptions.map((themeOption) => (
            <TouchableOpacity
              key={themeOption.id}
              style={[
                styles.settingItem,
                {
                  backgroundColor: themeColors.surface,
                  borderColor: theme === themeOption.id ? themeColors.primary : themeColors.border,
                  borderWidth: theme === themeOption.id ? 2 : 1,
                }
              ]}
              onPress={() => setTheme(themeOption.id)}
            >
              <View style={styles.settingLeft}>
                <Ionicons
                  name={
                    themeOption.id === 'gradient-black' ? 'color-filter-outline' :
                    themeOption.id === 'glass-blur' ? 'sparkles-outline' :
                    'square-outline'
                  }
                  size={24}
                  color={
                    themeOption.id === 'gradient-black' ? '#8b5cf6' :
                    themeOption.id === 'glass-blur' ? themeColors.primary :
                    '#ffffff'
                  }
                />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: themeColors.text }]}>
                    {themeOption.name}
                  </Text>
                  <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
                    {themeOption.description}
                  </Text>
                </View>
              </View>
              {theme === themeOption.id && <Ionicons name="checkmark-circle" size={24} color={themeColors.primary} />}
            </TouchableOpacity>
          ))}
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
