import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Colors, BorderRadius, Shadows } from '@/constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const { theme: appTheme, getTabBarStyle } = useAppTheme();
  const tabBarStyle = getTabBarStyle();

  const renderTabBarContent = () => (
    <View style={styles.tabsContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Icon mapping
        const iconName = (() => {
          switch (route.name) {
            case 'index':
              return isFocused ? 'home' : 'home-outline';
            case 'payments':
              return isFocused ? 'wallet' : 'wallet-outline';
            case 'history':
              return isFocused ? 'time' : 'time-outline';
            case 'settings':
              return isFocused ? 'settings' : 'settings-outline';
            default:
              return 'ellipse';
          }
        })();

        const scale = useSharedValue(1);

        const animatedStyle = useAnimatedStyle(() => ({
          transform: [{ scale: scale.value }],
        }));

        const handlePressIn = () => {
          scale.value = withSpring(0.85, { damping: 10 });
        };

        const handlePressOut = () => {
          scale.value = withSpring(1, { damping: 10 });
        };

        return (
          <AnimatedTouchableOpacity
            key={route.name}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.tab, animatedStyle]}
          >
            {isFocused ? (
              <LinearGradient
                colors={['#06b6d4', '#22d3ee']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.activeTab, Shadows.md]}
              >
                <Ionicons name={iconName as any} size={24} color="#ffffff" />
              </LinearGradient>
            ) : (
              <View style={styles.inactiveTab}>
                <Ionicons name={iconName as any} size={24} color="#67e8f9" />
              </View>
            )}
          </AnimatedTouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.floatingWrapper}>
        {appTheme === 'glass-blur' ? (
          <BlurView
            intensity={90}
            tint={isDark ? 'dark' : 'light'}
            style={[styles.tabBar, tabBarStyle, Shadows.xl]}
          >
            {renderTabBarContent()}
          </BlurView>
        ) : appTheme === 'gradient-black' ? (
          <LinearGradient
            colors={isDark ? ['rgba(0, 0, 0, 0.95)', 'rgba(15, 23, 42, 0.9)'] : ['rgba(255, 255, 255, 0.98)', 'rgba(240, 253, 250, 0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.tabBar, tabBarStyle, Shadows.xl]}
          >
            {renderTabBarContent()}
          </LinearGradient>
        ) : (
          <View style={[styles.tabBar, tabBarStyle, { backgroundColor: isDark ? '#000000' : '#ffffff' }, Shadows.xl]}>
            {renderTabBarContent()}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    paddingHorizontal: 16,
  },
  floatingWrapper: {
    borderRadius: 32,
    overflow: 'hidden',
  },
  tabBar: {
    borderRadius: 32,
    borderWidth: 0,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveTab: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
