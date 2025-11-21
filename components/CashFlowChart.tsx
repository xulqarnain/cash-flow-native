import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/Theme';
import type { ChartDataPoint } from '@/database/transactionsService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Dimensions, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface CashFlowChartProps {
  data: ChartDataPoint[];
  style?: ViewStyle;
}

export function CashFlowChart({ data, style }: CashFlowChartProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundGradientFrom: theme.surface,
    backgroundGradientTo: theme.surface,
    color: (opacity = 1) => isDark ? `rgba(96, 165, 250, ${opacity})` : `rgba(37, 99, 235, ${opacity})`, // Blue
    labelColor: (opacity = 1) => theme.textSecondary,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: theme.surface
    },
    propsForBackgroundLines: {
      strokeDasharray: "", // Solid lines
      stroke: theme.border,
      strokeWidth: 1,
    }
  };

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No data available</Text>
      </View>
    );
  }

  // Transform data for the chart
  const labels = data.map(d => {
    const date = new Date(d.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const chartData = {
    labels,
    datasets: [
      {
        data: data.map(d => d.balance),
        color: (opacity = 1) => isDark ? `rgba(96, 165, 250, ${opacity})` : `rgba(37, 99, 235, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: theme.surface,
        borderColor: theme.border,
      },
      Shadows.sm,
      style
    ]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Cash Flow</Text>
        <View style={styles.legend}>
          <View style={[styles.dot, { backgroundColor: theme.primary }]} />
          <Text style={[styles.legendText, { color: theme.textSecondary }]}>Net Income</Text>
        </View>
      </View>

      <LineChart
        data={chartData}
        width={screenWidth - (Spacing.md * 2) - (Spacing.lg * 2)} // Adjust for container padding and screen margin
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        yAxisLabel="$"
        yAxisInterval={1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  emptyContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: Typography.sizes.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: Typography.sizes.xs,
  },
  chart: {
    marginRight: -16, // Adjust for chart padding
    paddingRight: 0,
  },
});
