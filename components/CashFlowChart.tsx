import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ChartDataPoint } from '@/database/transactionsService';

interface CashFlowChartProps {
  data: ChartDataPoint[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenWidth = Dimensions.get('window').width;

  if (data.length === 0) {
    return (
      <View style={[
        styles.container,
        {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderColor: isDark ? '#374151' : '#e5e7eb',
        }
      ]}>
        <Text style={[styles.title, { color: isDark ? '#f9fafb' : '#111827' }]}>
          Cash Flow (Last 7 Days)
        </Text>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            No transaction data available
          </Text>
        </View>
      </View>
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
    <View style={[
      styles.container,
      {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderColor: isDark ? '#374151' : '#e5e7eb',
      }
    ]}>
      <Text style={[styles.title, { color: isDark ? '#f9fafb' : '#111827' }]}>
        Cash Flow (Last 7 Days)
      </Text>

      <LineChart
        data={chartData}
        width={screenWidth - 64}
        height={220}
        chartConfig={{
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          backgroundGradientFrom: isDark ? '#1f2937' : '#ffffff',
          backgroundGradientTo: isDark ? '#1f2937' : '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => isDark ? `rgba(156, 163, 175, ${opacity})` : `rgba(107, 114, 128, ${opacity})`,
          labelColor: (opacity = 1) => isDark ? `rgba(156, 163, 175, ${opacity})` : `rgba(107, 114, 128, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#3b82f6',
          },
          propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: isDark ? '#374151' : '#e5e7eb',
            strokeWidth: 1,
          },
        }}
        bezier
        style={styles.chart}
        withInnerLines={true}
        withOuterLines={true}
        withVerticalLines={false}
        withHorizontalLines={true}
        fromZero={false}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
          <Text style={[styles.legendText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            Money In: ${data.reduce((sum, d) => sum + d.incoming, 0).toFixed(0)}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
          <Text style={[styles.legendText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            Money Out: ${data.reduce((sum, d) => sum + d.outgoing, 0).toFixed(0)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
