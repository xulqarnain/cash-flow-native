import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { createPerson } from '@/database/peopleService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLanguage } from '@/contexts/LanguageContext';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/Theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function AddPersonModal() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const themeColors = isDark ? Colors.dark : Colors.light;
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
    translateY.value = withSpring(0, { damping: 15 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);
    try {
      await createPerson(name.trim(), phone.trim() || undefined);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('Error creating person:', error);
      Alert.alert('Error', 'Failed to add person');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.iconButton}>
            <Ionicons name="close" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>
            {t('add_person')}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Form */}
        <Animated.View style={[styles.formContainer, animatedStyle]}>
          <View style={styles.form}>
            {/* Icon Header */}
            <View style={styles.iconHeader}>
              <View
                style={[styles.iconCircle, { backgroundColor: themeColors.primary }]}
              >
                <Ionicons name="person-add" size={32} color="#ffffff" />
              </View>
            </View>

            {/* Name Input */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                {t('name')} *
              </Text>
              <View style={[
                styles.inputContainer,
                { backgroundColor: theme.surface, borderColor: theme.border },
                Shadows.sm,
              ]}>
                <Ionicons name="person-outline" size={20} color={theme.textTertiary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder={t('enter_name')}
                  placeholderTextColor={theme.textTertiary}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                />
              </View>
            </View>

            {/* Phone Input */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                {t('phone')} ({t('optional')})
              </Text>
              <View style={[
                styles.inputContainer,
                { backgroundColor: theme.surface, borderColor: theme.border },
                Shadows.sm,
              ]}>
                <Ionicons name="call-outline" size={20} color={theme.textTertiary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder={t('enter_phone')}
                  placeholderTextColor={theme.textTertiary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <AnimatedTouchable
            onPress={handleCancel}
            style={[styles.button, styles.cancelButtonStyle]}
          >
            <View style={[
              styles.cancelButton,
              { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
              Shadows.base,
            ]}>
              <Text style={[styles.buttonText, { color: theme.text }]}>
                {t('cancel')}
              </Text>
            </View>
          </AnimatedTouchable>

          <AnimatedTouchable
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={[styles.button, styles.saveButtonStyle]}
          >
            <View
              style={[
                styles.gradientButton,
                {
                  backgroundColor: isSubmitting ? '#9ca3af' : themeColors.primary
                },
                Shadows.md
              ]}
            >
              {isSubmitting ? (
                <Text style={[styles.buttonText, { color: '#ffffff' }]}>
                  Saving...
                </Text>
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                  <Text style={[styles.buttonText, { color: '#ffffff', marginLeft: Spacing.sm }]}>
                    {t('save')}
                  </Text>
                </>
              )}
            </View>
          </AnimatedTouchable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
  },
  formContainer: {
    flex: 1,
  },
  form: {
    padding: Spacing.xl,
  },
  iconHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.base,
    marginLeft: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    borderRadius: BorderRadius.base,
    overflow: 'hidden',
  },
  cancelButtonStyle: {
  },
  cancelButton: {
    paddingVertical: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.base,
  },
  saveButtonStyle: {
  },
  gradientButton: {
    paddingVertical: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
});
