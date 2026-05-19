import React, { useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable,
  Animated, Dimensions, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const SH = Dimensions.get('window').height;

// ─── Animated chip ────────────────────────────────────────────────────────────
interface ChipProps {
  opt: FilterOption;
  active: boolean;
  onToggle: (key: string) => void;
  delay: number;
}

const AnimatedChip: React.FC<ChipProps> = ({ opt, active, onToggle, delay }) => {
  const scale = useRef(new Animated.Value(0.85)).current;
  const mountOpacity = useRef(new Animated.Value(0)).current;

  // Stagger in on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(mountOpacity, { toValue: 1, duration: 220, delay, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 7, tension: 180, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.88, friction: 5, tension: 300, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1,    friction: 5, tension: 300, useNativeDriver: true }),
    ]).start();
    onToggle(opt.key);
  }, [onToggle, opt.key]);

  return (
    <Animated.View style={{ opacity: mountOpacity, transform: [{ scale }] }}>
      <Pressable
        style={[styles.chip, active && styles.chipActive]}
        onPress={handlePress}
      >
        {opt.icon && (
          <Ionicons
            name={opt.icon as any}
            size={13}
            color={active ? colors.white : (opt.iconColor ?? colors.secondary)}
          />
        )}
        <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
        {active && <Ionicons name="checkmark" size={12} color={colors.white} />}
      </Pressable>
    </Animated.View>
  );
};

export interface FilterOption {
  key: string;
  label: string;
  icon?: string;
  iconColor?: string;
}

export interface FilterGroup {
  title: string;
  options: FilterOption[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  groups: FilterGroup[];
  activeFilters: string[];
  onToggle: (key: string) => void;
  onReset: () => void;
  resetLabel: string;
}

export const FilterSheet: React.FC<Props> = ({
  visible, onClose, title, groups, activeFilters, onToggle, onReset, resetLabel,
}) => {
  const translateY = useRef(new Animated.Value(SH)).current;
  const bgOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(SH);
      bgOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0, friction: 9, tension: 65, useNativeDriver: true,
        }),
        Animated.timing(bgOpacity, {
          toValue: 1, duration: 250, useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SH, duration: 280, useNativeDriver: true,
      }),
      Animated.timing(bgOpacity, {
        toValue: 0, duration: 220, useNativeDriver: true,
      }),
    ]).start(onClose);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={dismiss}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: bgOpacity }]}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={dismiss} />
        </Animated.View>

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.handleArea}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Pressable style={styles.closeBtn} onPress={dismiss}>
              <Ionicons name="close" size={18} color={colors.secondary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {groups.map((group, gi) => (
              <View key={gi} style={styles.group}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                <View style={styles.chips}>
                  {group.options.map((opt, oi) => (
                    <AnimatedChip
                      key={opt.key}
                      opt={opt}
                      active={activeFilters.includes(opt.key)}
                      onToggle={onToggle}
                      delay={gi * 60 + oi * 40}
                    />
                  ))}
                </View>
              </View>
            ))}

            {activeFilters.length > 0 && (
              <Pressable style={styles.resetBtn} onPress={() => { onReset(); dismiss(); }}>
                <Ionicons name="refresh-outline" size={14} color={colors.accent} />
                <Text style={styles.resetText}>{resetLabel}</Text>
              </Pressable>
            )}

            <View style={{ height: 36 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: SH * 0.75,
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: -6 },
    shadowRadius: 24,
  },
  handleArea: { paddingVertical: 10, alignItems: 'center' },
  handle: {
    width: 38, height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 16,
  },
  headerTitle: {
    ...typography.title3,
    color: colors.primary,
    flex: 1,
    fontWeight: '700',
  },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.cream,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { paddingHorizontal: 22 },
  scrollContent: { paddingBottom: 8 },
  group: { marginBottom: 22 },
  groupTitle: {
    ...typography.subheadline,
    color: colors.tertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    ...typography.callout,
    color: colors.secondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.accent,
    marginTop: 4,
  },
  resetText: {
    ...typography.callout,
    color: colors.accent,
    fontWeight: '600',
  },
});
