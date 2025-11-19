import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'ur';

interface Translations {
  en: { [key: string]: string };
  ur: { [key: string]: string };
}

const translations: Translations = {
  en: {
    // Dashboard
    'welcome_back': 'Welcome back',
    'cash_flow': 'Cash Flow',
    'total_balance': 'Total Balance',
    'total_transactions': 'total transactions',
    'money_in': 'Money In',
    'money_out': 'Money Out',
    'people': 'People',
    'no_people': 'No people added yet',
    'tap_to_start': 'Tap the + button to start tracking',
    'cash_flow_trend': 'Cash Flow Trend',

    // Person
    'owes_you': 'Owes you',
    'you_owe': 'You owe',
    'no_balance': 'No balance',
    'transaction': 'transaction',
    'transactions': 'transactions',

    // Actions
    'add_person': 'Add Person',
    'add_transaction': 'Add Transaction',
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',

    // Forms
    'name': 'Name',
    'phone': 'Phone',
    'amount': 'Amount',
    'description': 'Description',
    'category': 'Category',
    'date': 'Date',
    'type': 'Type',
    'incoming': 'Incoming',
    'outgoing': 'Outgoing',
    'enter_name': 'Enter name',
    'enter_phone': 'Enter phone number',
    'enter_amount': 'Enter amount',
    'enter_description': 'Enter description',
    'optional': 'Optional',

    // Payments Summary
    'payments': 'Payments',
    'need_to_pay': 'Need to Pay',
    'need_to_receive': 'Need to Receive',
    'total': 'Total',
    'no_payments': 'No pending payments',
    'no_receivables': 'No pending receivables',

    // Settings
    'settings': 'Settings',
    'language': 'Language',
    'english': 'English',
    'roman_urdu': 'Roman Urdu',
    'import_export': 'Import/Export',
    'export_data': 'Export Data',
    'import_data': 'Import Data',
    'reset_database': 'Reset Database',

    // History
    'history': 'History',
    'search': 'Search',
    'no_transactions': 'No transactions yet',
  },
  ur: {
    // Dashboard
    'welcome_back': 'Khush Amdeed',
    'cash_flow': 'Paisay Ka Hisaab',
    'total_balance': 'Kul Balance',
    'total_transactions': 'kul transactions',
    'money_in': 'Milay Paisay',
    'money_out': 'Diye Paisay',
    'people': 'Log',
    'no_people': 'Abhi koi nahi hai',
    'tap_to_start': '+ button pe click karo',
    'cash_flow_trend': 'Paisay Ka Chart',

    // Person
    'owes_you': 'Aap ko dena hai',
    'you_owe': 'Aap ne dena hai',
    'no_balance': 'Koi balance nahi',
    'transaction': 'transaction',
    'transactions': 'transactions',

    // Actions
    'add_person': 'Naya Shakhs',
    'add_transaction': 'Naya Transaction',
    'save': 'Save Karo',
    'cancel': 'Cancel Karo',
    'delete': 'Delete Karo',
    'edit': 'Edit Karo',

    // Forms
    'name': 'Naam',
    'phone': 'Phone Number',
    'amount': 'Raqam',
    'description': 'Tafseel',
    'category': 'Category',
    'date': 'Tarikh',
    'type': 'Qisam',
    'incoming': 'Milay',
    'outgoing': 'Diye',
    'enter_name': 'Naam likho',
    'enter_phone': 'Phone number likho',
    'enter_amount': 'Raqam likho',
    'enter_description': 'Tafseel likho',
    'optional': 'Zaroori Nahi',

    // Payments Summary
    'payments': 'Payments',
    'need_to_pay': 'Dena Hai',
    'need_to_receive': 'Lena Hai',
    'total': 'Kul',
    'no_payments': 'Koi dena nahi',
    'no_receivables': 'Koi lena nahi',

    // Settings
    'settings': 'Settings',
    'language': 'Zubaan',
    'english': 'English',
    'roman_urdu': 'Roman Urdu',
    'import_export': 'Import/Export',
    'export_data': 'Data Export Karo',
    'import_data': 'Data Import Karo',
    'reset_database': 'Database Reset Karo',

    // History
    'history': 'History',
    'search': 'Talaash Karo',
    'no_transactions': 'Abhi koi transaction nahi',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem('app_language');
      if (saved === 'en' || saved === 'ur') {
        setLanguageState(saved);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('app_language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
