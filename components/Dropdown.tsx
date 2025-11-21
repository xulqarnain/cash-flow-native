import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

interface DropdownOption {
    label: string;
    value: string;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
}

interface DropdownProps {
    label: string;
    value: string;
    options: DropdownOption[];
    onSelect: (value: string) => void;
}

export function Dropdown({ label, value, options, onSelect }: DropdownProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? Colors.dark : Colors.light;
    const [visible, setVisible] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>

            <TouchableOpacity
                style={[
                    styles.trigger,
                    {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                    },
                ]}
                onPress={() => setVisible(true)}
                activeOpacity={0.7}
            >
                <View style={styles.triggerContent}>
                    {selectedOption?.icon && (
                        <Ionicons
                            name={selectedOption.icon}
                            size={20}
                            color={selectedOption.iconColor || theme.text}
                            style={styles.triggerIcon}
                        />
                    )}
                    <Text style={[styles.triggerText, { color: theme.text }]}>
                        {selectedOption?.label || 'Select...'}
                    </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color={theme.textTertiary} />
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent
                animationType="none"
                onRequestClose={() => setVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback>
                            <Animated.View
                                entering={SlideInDown}
                                exiting={SlideOutDown}
                                style={[
                                    styles.modalContent,
                                    { backgroundColor: theme.surfaceElevated },
                                    Shadows.xl
                                ]}
                            >
                                <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                                    <Text style={[styles.modalTitle, { color: theme.text }]}>{label}</Text>
                                    <TouchableOpacity onPress={() => setVisible(false)}>
                                        <Ionicons name="close" size={24} color={theme.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                <FlatList
                                    data={options}
                                    keyExtractor={item => item.value}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[
                                                styles.optionItem,
                                                item.value === value && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                                            ]}
                                            onPress={() => {
                                                onSelect(item.value);
                                                setVisible(false);
                                            }}
                                        >
                                            <View style={styles.optionContent}>
                                                {item.icon && (
                                                    <Ionicons
                                                        name={item.icon}
                                                        size={24}
                                                        color={item.iconColor || theme.text}
                                                        style={styles.optionIcon}
                                                    />
                                                )}
                                                <Text style={[
                                                    styles.optionLabel,
                                                    { color: theme.text, fontWeight: item.value === value ? '600' : '400' }
                                                ]}>
                                                    {item.label}
                                                </Text>
                                            </View>
                                            {item.value === value && (
                                                <Ionicons name="checkmark" size={24} color={theme.primary} />
                                            )}
                                        </TouchableOpacity>
                                    )}
                                />
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
        marginBottom: Spacing.xs,
    },
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderRadius: BorderRadius.base,
        borderWidth: 1,
    },
    triggerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    triggerIcon: {
        marginRight: Spacing.sm,
    },
    triggerText: {
        fontSize: Typography.sizes.base,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        paddingBottom: Spacing.xl,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionIcon: {
        marginRight: Spacing.md,
    },
    optionLabel: {
        fontSize: Typography.sizes.base,
    },
});
