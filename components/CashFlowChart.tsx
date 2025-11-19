import { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  Easing,
  withTiming,
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BorderRadius, Shadows, Spacing, Typography } from '@/constants/Theme';
import type { ChartDataPoint } from '@/database/transactionsService';

interface CashFlowChartProps {
  data: ChartDataPoint[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const screenWidth = Dimensions.get('window').width;

  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      300,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    scale.value = withDelay(
      300,
      withSpring(1, { damping: 15, stiffness: 150 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (data.length === 0) {
    return (
      <Animated.View style={[
        styles.container,
        {
          backgroundColor: theme.surface,
        },
        Shadows.md,
        animatedStyle,
      ]}>
        <Text style={[styles.title, { color: theme.text }]}>
          Cash Flow (Last 7 Days)
        </Text>
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 32, marginBottom: Spacing.sm }}>📊</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No transaction data available
          </Text>
        </View>
      </Animated.View>
    );
  }

  // Format dates for labels (show only last 3 characters, e.g., "15")
  const labels = data.map(d => {
    const date = new Date(d.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const chartData = {
    labels,
    datasets: [
      {
        data: data.map(d => d.balance),
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // blue
        strokeWidth: 3,
      },
    ],
  };

  return (
    <Animated.View style={[
      styles.container,
      {
        backgroundColor: theme.surface,
      },
      Shadows.md,
      animatedStyle,
    ]}>
      <Text style={[styles.title, { color: theme.text }]}>
        Cash Flow Trend
      </Text>

      <LineChart
        data={chartData}
        width={screenWidth - 64}
        height={220}
        chartConfig={{
          backgroundColor: theme.surface,
          backgroundGradientFrom: theme.surface,
          backgroundGradientTo: theme.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
          labelColor: (opacity = 1) => isDark ? `rgba(203, 213, 225, ${opacity})` : `rgba(71, 85, 105, ${opacity})`,
          style: {
            borderRadius: BorderRadius.lg,
          },
          propsForDots: {
            r: '5',
            strokeWidth: '3',
            stroke: '#6366f1',
            fill: '#ffffff',
          },
          propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: theme.border,
            strokeWidth: 1,
          },
        }}
        bezier
        style={styles.chart}
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines={true}
        fromZero={false}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
          <Text style={[styles.legendText, { color: theme.textSecondary }]}>
            In: ${data.reduce((sum, d) => sum + d.incoming, 0).toFixed(0)}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
          <Text style={[styles.legendText, { color: theme.textSecondary }]}>
            Out: ${data.reduce((sum, d) => sum + d.outgoing, 0).toFixed(0)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.base,
  },
  chart: {
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  emptyState: {
    paddingVertical: Spacing['3xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
});
