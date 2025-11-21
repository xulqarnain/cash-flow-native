import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface ActionButtonProps {
  action: { icon: string; label: string; color: string; onPress: () => void };
  index: number;
  isDark: boolean;
}

function ActionButton({ action, index, isDark }: ActionButtonProps) {
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={styles.actionContainer}
    >
      <View style={[styles.labelContainer, Shadows.sm, { backgroundColor: theme.surface }]}>
        <Text style={[styles.label, { color: theme.text }]}>{action.label}</Text>
      </View>
      <TouchableOpacity
        onPress={action.onPress}
        style={[styles.actionButton, { backgroundColor: action.color }, Shadows.base]}
        activeOpacity={0.8}
      >
        <Ionicons name={action.icon as any} size={20} color="#ffffff" />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function FloatingActionButton() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const rotation = useSharedValue(0);

  const toggleExpanded = () => {
    Haptics.selectionAsync();
    setIsExpanded(!isExpanded);
    rotation.value = withSpring(isExpanded ? 0 : 45);
  };

  const animatedRotation = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const actions = [
    {
      icon: 'person-add',
      label: 'Add Person',
      color: theme.primary,
      onPress: () => {
        toggleExpanded();
        router.push('/add-person');
      }
    },
    {
      icon: 'cash',
      label: 'Add Transaction',
      color: theme.success,
      onPress: () => {
        toggleExpanded();
        router.push('/add-transaction');
      }
    },
  ];

  return (
    <View style={styles.container} pointerEvents="box-none">
      {isExpanded && (
        <View style={styles.actionsWrapper} pointerEvents="box-none">
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

      <AnimatedTouchableOpacity
        onPress={toggleExpanded}
        style={[
          styles.fab,
          { backgroundColor: theme.primary },
          Shadows.lg,
          animatedRotation
        ]}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={32} color="#ffffff" />
      </AnimatedTouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90, // Above tab bar
    right: 20,
    alignItems: 'flex-end',
    zIndex: 100,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsWrapper: {
    marginBottom: Spacing.md,
    alignItems: 'flex-end',
    gap: Spacing.md,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: Spacing.sm,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  labelContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.base,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
});
