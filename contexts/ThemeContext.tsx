import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppTheme = 'gradient-black' | 'glass-blur' | 'solid-black';

export interface ThemeOption {
  id: AppTheme;
  name: string;
  description: string;
}

export const themeOptions: ThemeOption[] = [
  { id: 'gradient-black', name: 'Gradient Black', description: 'Smooth gradient background' },
  { id: 'glass-blur', name: 'Glass Blur', description: 'Frosted glass effect' },
  { id: 'solid-black', name: 'Solid Black', description: 'Pure black background' },
];

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => Promise<void>;
  getTabBarStyle: () => any;
  getBackgroundStyle: () => any;
  getSurfaceStyle: () => any;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>('glass-blur');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('app_theme');
      if (saved && ['gradient-black', 'glass-blur', 'solid-black'].includes(saved)) {
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
    // Return only visual styles, not positioning (CustomTabBar handles positioning)
    switch (theme) {
      case 'gradient-black':
        return {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
        };
      case 'glass-blur':
        return {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
        };
      case 'solid-black':
        return {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
        };
      default:
        return {};
    }
  };

  const getBackgroundStyle = () => {
    switch (theme) {
      case 'gradient-black':
        return {
          backgroundColor: '#0a0a0a',
        };
      case 'glass-blur':
        return {
          backgroundColor: 'rgba(8, 51, 68, 0.95)',
        };
      case 'solid-black':
        return {
          backgroundColor: '#000000',
        };
      default:
        return {};
    }
  };

  const getSurfaceStyle = () => {
    switch (theme) {
      case 'gradient-black':
        return {
          backgroundColor: 'rgba(20, 20, 20, 0.9)',
          borderWidth: 1,
          borderColor: 'rgba(6, 182, 212, 0.2)',
        };
      case 'glass-blur':
        return {
          backgroundColor: 'rgba(22, 78, 99, 0.6)',
          borderWidth: 1,
          borderColor: 'rgba(103, 232, 249, 0.2)',
          backdropFilter: 'blur(10px)',
        };
      case 'solid-black':
        return {
          backgroundColor: 'rgba(30, 30, 30, 1)',
          borderWidth: 1,
          borderColor: 'rgba(6, 182, 212, 0.3)',
        };
      default:
        return {};
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, getTabBarStyle, getBackgroundStyle, getSurfaceStyle }}>
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
