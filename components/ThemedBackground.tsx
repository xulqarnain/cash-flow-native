import { Colors } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface ThemedBackgroundProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function ThemedBackground({ children, style }: ThemedBackgroundProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
