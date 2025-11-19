import { Text, StyleSheet, View } from 'react-native';
import { useCurrency } from '@/contexts/CurrencyContext';

interface CurrencyTextProps {
  amount: number;
  style?: any;
  symbolSize?: number;
  amountSize?: number;
  color?: string;
}

export function CurrencyText({ amount, style, symbolSize = 12, amountSize = 24, color = '#000000' }: CurrencyTextProps) {
  const { getCurrencySymbol, getAmountWithoutSymbol, currency } = useCurrency();
  const symbol = getCurrencySymbol();
  const amountStr = getAmountWithoutSymbol(amount);

  const symbolBefore = currency === '$' || currency === '£' || currency === '€' || currency === '¥';

  return (
    <View style={[styles.container, style]}>
      {symbolBefore && (
        <Text style={[styles.symbol, { fontSize: symbolSize, color }]}>
          {symbol}
        </Text>
      )}
      <Text style={[styles.amount, { fontSize: amountSize, color }]}>
        {amountStr}
      </Text>
      {!symbolBefore && (
        <Text style={[styles.symbol, { fontSize: symbolSize, color }]}>
          {symbol}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  symbol: {
    fontWeight: '500',
    opacity: 0.7,
  },
  amount: {
    fontWeight: '700',
  },
});
