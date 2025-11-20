import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Currency = 'Rs' | '$' | '€' | '£' | '¥' | 'SR';

export interface CurrencyOption {
  code: Currency;
  name: string;
  symbol: Currency;
}

export const currencies: CurrencyOption[] = [
  { code: 'Rs', name: 'Pakistani Rupee', symbol: 'Rs' },
  { code: 'SR', name: 'Saudi Riyal', symbol: 'SR' },
  { code: '$', name: 'US Dollar', symbol: '$' },
  { code: '€', name: 'Euro', symbol: '€' },
  { code: '£', name: 'British Pound', symbol: '£' },
  { code: '¥', name: 'Japanese Yen', symbol: '¥' },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (curr: Currency) => Promise<void>;
  formatAmount: (amount: number) => string;
  getCurrencySymbol: () => Currency;
  getAmountWithoutSymbol: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('Rs');

  useEffect(() => {
    loadCurrency();
  }, []);

  const loadCurrency = async () => {
    try {
      const saved = await AsyncStorage.getItem('app_currency');
      if (saved && ['Rs', 'SR', '$', '€', '£', '¥'].includes(saved)) {
        setCurrencyState(saved as Currency);
      }
    } catch (error) {
      console.error('Error loading currency:', error);
    }
  };

  const setCurrency = async (curr: Currency) => {
    try {
      await AsyncStorage.setItem('app_currency', curr);
      setCurrencyState(curr);
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  };

  const formatAmount = (amount: number): string => {
    const formattedNumber = amount.toFixed(2);

    // For currencies that go before the number
    if (currency === '$' || currency === '£' || currency === '€' || currency === '¥') {
      return `${currency}${formattedNumber}`;
    }

    // For Rs, SR and others that go after
    return `${currency} ${formattedNumber}`;
  };

  const getCurrencySymbol = (): Currency => {
    return currency;
  };

  const getAmountWithoutSymbol = (amount: number): string => {
    return amount.toFixed(2);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, getCurrencySymbol, getAmountWithoutSymbol }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}
