import { Colors, Shadows, Spacing, Typography } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: theme.surface,
        borderTopColor: theme.border,
        paddingBottom: insets.bottom,
      },
      Shadows.sm // Subtle shadow for separation
    ]}>
      <View style={styles.content}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            Haptics.selectionAsync();
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Icon mapping
          const iconName = (() => {
            switch (route.name) {
              case 'index': return isFocused ? 'home' : 'home-outline';
              case 'payments': return isFocused ? 'wallet' : 'wallet-outline';
              case 'expenses': return isFocused ? 'receipt' : 'receipt-outline';
              case 'salaries': return isFocused ? 'cash' : 'cash-outline';
              case 'history': return isFocused ? 'time' : 'time-outline';
              case 'settings': return isFocused ? 'settings' : 'settings-outline';
              default: return 'ellipse';
            }
          })();

          const label = options.title !== undefined
            ? options.title
            : options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : route.name;

          return (
            <TouchableOpacity
              key={route.name}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <Ionicons
                name={iconName as any}
                size={24}
                color={isFocused ? theme.primary : theme.textTertiary}
              />
              <Text style={[
                styles.label,
                { color: isFocused ? theme.primary : theme.textTertiary }
              ]}>
                {label as string}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    height: 60,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: Typography.weights.medium,
  },
});
