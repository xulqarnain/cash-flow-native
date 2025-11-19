import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppTheme = 'modern'; // Simplified to single professional theme

export interface ThemeOption {
  id: AppTheme;
  name: string;
  description: string;
}

export const themeOptions: ThemeOption[] = [
  { id: 'modern', name: 'Modern', description: 'Clean, professional design' },
];

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => Promise<void>;
  getTabBarStyle: () => any;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>('modern');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('app_theme');
      if (saved === 'modern') {
        setThemeState(saved as AppTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (newTheme: AppTheme) => {
    try {
      await AsyncStorage.setItem('app_theme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const getTabBarStyle = () => {
    // Clean, transparent tab bar - CustomTabBar handles all styling
    return {
      backgroundColor: 'transparent',
      borderTopWidth: 0,
    };
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, getTabBarStyle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return context;
}
