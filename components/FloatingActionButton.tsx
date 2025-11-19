import { useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants/Theme';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface FABAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

export function FloatingActionButton() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const themeColors = isDark ? Colors.dark : Colors.light;

  const [isExpanded, setIsExpanded] = useState(false);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const actions: FABAction[] = [
    {
      icon: 'person-add',
      label: 'Add Person',
      color: '#6366f1',
      onPress: () => {
        router.push('/add-person');
        toggleExpanded();
      },
    },
    {
      icon: 'cash',
      label: 'Add Transaction',
      color: '#10b981',
      onPress: () => {
        router.push('/add-transaction');
        toggleExpanded();
      },
    },
  ];

  const toggleExpanded = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsExpanded(!isExpanded);
    rotation.value = withSpring(isExpanded ? 0 : 45, { damping: 15 });
  };

  const animatedRotation = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Action buttons */}
      {isExpanded && (
        <View style={styles.actionsContainer}>
          {actions.map((action, index) => (
            <ActionButton
              key={action.label}
              action={action}
              index={index}
              isDark={isDark}
            />
          ))}
        </View>
      )}

      {/* Main FAB */}
      <AnimatedTouchableOpacity
        onPress={toggleExpanded}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.fab, animatedScale]}
        activeOpacity={0.9}
      >
        <Animated.View
          style={[styles.fabGradient, { backgroundColor: themeColors.primary }, Shadows.lg, animatedScale]}
        >
          <Animated.View style={animatedRotation}>
            <Ionicons name="add" size={32} color="#ffffff" />
          </Animated.View>
        </Animated.View>
      </AnimatedTouchableOpacity>

      {/* Overlay */}
      {isExpanded && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleExpanded}
        />
      )}
    </View>
  );
}

interface ActionButtonProps {
  action: FABAction;
  index: number;
  isDark: boolean;
}

function ActionButton({ action, index, isDark }: ActionButtonProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.8);

  // Entrance animation
  useState(() => {
    opacity.value = withTiming(1, { duration: 200 });
    translateY.value = withSpring(0, { damping: 15 });
    scale.value = withSpring(1, { damping: 15 });
  });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action.onPress();
  };

  return (
    <Animated.View
      style={[
        styles.actionButton,
        animatedStyle,
        { marginBottom: index === 0 ? Spacing.base : 0 },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        style={styles.actionTouchable}
        activeOpacity={0.8}
      >
        <View
          style={[styles.actionIcon, { backgroundColor: action.color }, Shadows.md]}
        >
          <Ionicons name={action.icon} size={24} color="#ffffff" />
        </View>
        <View style={[
          styles.actionLabel,
          {
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
          },
          Shadows.base,
        ]}>
          <Text style={[
            styles.actionLabelText,
            { color: isDark ? '#f1f5f9' : '#0f172a' },
          ]}>
            {action.label}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 88,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 10000,
    elevation: 10000,
  },
  fab: {
    width: 64,
    height: 64,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsContainer: {
    marginBottom: Spacing.base,
  },
  actionButton: {
    alignItems: 'flex-end',
  },
  actionTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.base,
  },
  actionLabelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: -1,
  },
});
