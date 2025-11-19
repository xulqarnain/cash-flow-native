import { useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { ThemeProvider as AppThemeProvider } from '@/contexts/ThemeContext';
import { SplashScreen } from '@/components/SplashScreen';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <AppThemeProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="person/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="transaction/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="add-person" options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name="add-transaction" options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name="edit-transaction" options={{ presentation: 'modal', headerShown: false }} />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </AppThemeProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
