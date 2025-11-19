import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { initDatabase } from '@/database/init';
import { getPeopleWithBalances } from '@/database/peopleService';
import type { PersonWithBalance } from '@/types/database';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLanguage } from '@/contexts/LanguageContext';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/Theme';

const AnimatedTouchable = Animated.createAnimatedComponent(View);

export default function PaymentsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const { t } = useLanguage();
  const router = useRouter();

  const [people, setPeople] = useState<PersonWithBalance[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      await initDatabase();
      const peopleWithBalances = await getPeopleWithBalances();
      setPeople(peopleWithBalances);
    } catch (error) {
      console.error('Error loading payments data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Separate people into two categories
  const peopleWhoPay = people.filter(p => p.balance > 0); // They owe you
  const peopleToReceiveFrom = peopleWhoPay;
  const peopleToPay = people.filter(p => p.balance < 0); // You owe them

  const totalToReceive = peopleToReceiveFrom.reduce((sum, p) => sum + p.balance, 0);
  const totalToPay = Math.abs(peopleToPay.reduce((sum, p) => sum + p.balance, 0));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            {t('payments')}
          </Text>
        </View>

        {/* Need to Receive Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={['#10b981', '#14b8a6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sectionIcon}
            >
              <Ionicons name="arrow-down" size={20} color="#ffffff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {t('need_to_receive')}
              </Text>
              <Text style={[styles.sectionTotal, { color: theme.success }]}>
                ${totalToReceive.toFixed(2)}
              </Text>
            </View>
          </View>

          {peopleToReceiveFrom.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.surface }, Shadows.base]}>
              <Text style={{ fontSize: 32, marginBottom: Spacing.sm }}>✅</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {t('no_receivables')}
              </Text>
            </View>
          ) : (
            peopleToReceiveFrom.map((person, index) => (
              <PaymentCard
                key={person.id}
                person={person}
                type="receive"
                index={index}
                isDark={isDark}
                theme={theme}
                onPress={() => router.push(`/person/${person.id}`)}
              />
            ))
          )}
        </View>

        {/* Need to Pay Section */}
        <View style={[styles.section, { paddingBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={['#ef4444', '#f43f5e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sectionIcon}
            >
              <Ionicons name="arrow-up" size={20} color="#ffffff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {t('need_to_pay')}
              </Text>
              <Text style={[styles.sectionTotal, { color: theme.danger }]}>
                ${totalToPay.toFixed(2)}
              </Text>
            </View>
          </View>

          {peopleToPay.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.surface }, Shadows.base]}>
              <Text style={{ fontSize: 32, marginBottom: Spacing.sm }}>🎉</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {t('no_payments')}
              </Text>
            </View>
          ) : (
            peopleToPay.map((person, index) => (
              <PaymentCard
                key={person.id}
                person={person}
                type="pay"
                index={index}
                isDark={isDark}
                theme={theme}
                onPress={() => router.push(`/person/${person.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface PaymentCardProps {
  person: PersonWithBalance;
  type: 'receive' | 'pay';
  index: number;
  isDark: boolean;
  theme: any;
  onPress: () => void;
}

function PaymentCard({ person, type, index, isDark, theme, onPress }: PaymentCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  React.useEffect(() => {
    opacity.value = withDelay(
      index * 50,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      index * 50,
      withSpring(0, { damping: 15 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const amount = Math.abs(person.balance);
  const gradient = type === 'receive'
    ? ['#10b981', '#14b8a6']
    : ['#ef4444', '#f43f5e'];

  return (
    <AnimatedTouchable
      style={[
        styles.paymentCard,
        { backgroundColor: theme.surface },
        Shadows.base,
        animatedStyle,
      ]}
      onTouchStart={handlePressIn}
      onTouchEnd={() => {
        handlePressOut();
        onPress();
      }}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.avatar}
      >
        <Ionicons name="person" size={24} color="#ffffff" />
      </LinearGradient>

      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]}>
          {person.name}
        </Text>
        {person.phone && (
          <Text style={[styles.phone, { color: theme.textTertiary }]}>
            📞 {person.phone}
          </Text>
        )}
      </View>

      <View style={styles.amountContainer}>
        <Text style={[
          styles.amount,
          { color: type === 'receive' ? theme.success : theme.danger }
        ]}>
          ${amount.toFixed(2)}
        </Text>
        <Text style={[styles.transactionCount, { color: theme.textTertiary }]}>
          {person.transactionCount} {person.transactionCount === 1 ? 'txn' : 'txns'}
        </Text>
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
  },
  header: {
    marginBottom: Spacing.xl,
    paddingTop: Spacing.base,
  },
  title: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.extrabold,
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  sectionTotal: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.extrabold,
  },
  paymentCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  phone: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  transactionCount: {
    fontSize: Typography.sizes.xs,
  },
  emptyCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
});
