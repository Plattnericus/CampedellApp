import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable,
  Animated, ScrollView, PanResponder, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FoodItem, Allergen, foodSections } from '../data/food';
import { foodImages } from '../data/imageMap';
import { useLanguage, Language } from '../i18n';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const ALLERGEN_LABELS: Record<Language, Partial<Record<Allergen, string>>> = {
  de: {
    gluten: 'Gluten (Weizen)', dairy: 'Milch / Laktose', eggs: 'Eier',
    nuts: 'Schalenfrüchte', fish: 'Fisch', shellfish: 'Schalentiere',
    soy: 'Soja', celery: 'Sellerie', mustard: 'Senf', sesame: 'Sesam',
    sulphites: 'Sulfite / SO₂', lupins: 'Lupinen', molluscs: 'Weichtiere',
    peanuts: 'Erdnüsse',
  },
  it: {
    gluten: 'Glutine', dairy: 'Latte', eggs: 'Uova',
    nuts: 'Frutta a guscio', fish: 'Pesce', shellfish: 'Crostacei',
    soy: 'Soia', celery: 'Sedano', mustard: 'Senape', sesame: 'Sesamo',
    sulphites: 'Solfiti / SO₂', lupins: 'Lupini', molluscs: 'Molluschi',
    peanuts: 'Arachidi',
  },
  en: {
    gluten: 'Gluten (wheat)', dairy: 'Milk / Lactose', eggs: 'Eggs',
    nuts: 'Tree nuts', fish: 'Fish', shellfish: 'Crustaceans',
    soy: 'Soy', celery: 'Celery', mustard: 'Mustard', sesame: 'Sesame',
    sulphites: 'Sulphites / SO₂', lupins: 'Lupins', molluscs: 'Molluscs',
    peanuts: 'Peanuts',
  },
};

const SH = Dimensions.get('window').height;
const HERO_H = 210;

interface Props {
  item: FoodItem | null;
  visible: boolean;
  onClose: () => void;
}

export const ItemDetailScreen: React.FC<Props> = ({ item, visible, onClose }) => {
  const { lang, t } = useLanguage();
  const translateY = useRef(new Animated.Value(SH)).current;
  const bgOpacity  = useRef(new Animated.Value(0)).current;
  const dragY      = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(SH);
      dragY.setValue(0);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0, friction: 9, tension: 65, useNativeDriver: true,
        }),
        Animated.timing(bgOpacity, {
          toValue: 1, duration: 280, useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const close = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SH, duration: 340, useNativeDriver: true,
      }),
      Animated.timing(bgOpacity, {
        toValue: 0, duration: 240, useNativeDriver: true,
      }),
    ]).start(onClose);
  };

  const pan = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => g.dy > 10 && Math.abs(g.dy) > Math.abs(g.dx),
    onPanResponderMove: (_, g) => { if (g.dy > 0) dragY.setValue(g.dy); },
    onPanResponderRelease: (_, g) => {
      if (g.dy > 80 || g.vy > 1.5) {
        close();
      } else {
        Animated.spring(dragY, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
      }
    },
  });

  if (!item) return null;
  const fmt = (p: number) => `${p.toFixed(2).replace('.', ',')} €`;

  const section = foodSections.find((s) => s.items.some((i) => i.id === item.id));
  const realImage = foodImages[item.image ?? item.id];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: bgOpacity }]}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={close} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: Animated.add(translateY, dragY) }] },
          ]}
        >
          {/* Drag handle */}
          <View {...pan.panHandlers} style={styles.handleArea}>
            <View style={styles.handle} />
          </View>

          {/* Header — Titel + X oben */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle} numberOfLines={2}>
              {item.name[lang]}
            </Text>
            <Pressable style={styles.closeBtn} onPress={close}>
              <Ionicons name="close" size={18} color={colors.secondary} />
            </Pressable>
          </View>

          {/* Hero image or gradient placeholder — unter dem Titel */}
          {realImage ? (
            <Image
              source={realImage}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : section ? (
            <LinearGradient
              colors={[section.gradientStart, section.gradientEnd] as const}
              style={styles.heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name={section.icon as any} size={72} color="rgba(255,255,255,0.9)" />
            </LinearGradient>
          ) : null}

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Price + badges */}
            <View style={styles.priceRow}>
              <Text style={styles.price}>{fmt(item.price)}</Text>
              {item.isVegetarian && !item.isVegan && (
                <View style={[styles.badge, { backgroundColor: '#dcfce7' }]}>
                  <Text style={[styles.badgeText, { color: '#15803d' }]}>Vegetarisch</Text>
                </View>
              )}
              {item.isVegan && (
                <View style={[styles.badge, { backgroundColor: '#d1fae5' }]}>
                  <Text style={[styles.badgeText, { color: '#047857' }]}>Vegan</Text>
                </View>
              )}
            </View>

            {/* Description */}
            {item.description && (
              <Text style={styles.desc}>{item.description[lang]}</Text>
            )}

            {/* Allergens */}
            {item.allergens && item.allergens.length > 0 && (
              <View style={styles.allergenSection}>
                <View style={styles.allergenHeader}>
                  <View style={styles.allergenIcon}>
                    <Ionicons name="warning" size={13} color={colors.white} />
                  </View>
                  <Text style={styles.allergenTitle}>{t.detail.allergens}</Text>
                </View>
                {item.allergens.map((a) => (
                  <View key={a} style={styles.allergenRow}>
                    <View style={styles.dot} />
                    <Text style={styles.allergenText}>
                      {ALLERGEN_LABELS[lang][a] ?? a}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: 48 }} />
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
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: SH * 0.92,
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
  heroImage: {
    width: '100%',
    height: HERO_H,
  },
  heroGradient: {
    width: '100%',
    height: HERO_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 22, paddingTop: 12, paddingBottom: 14,
  },
  sheetTitle: {
    ...typography.title3,
    color: colors.primary,
    flex: 1, paddingRight: 12,
  },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.cream,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { paddingHorizontal: 22, paddingTop: 18 },
  priceRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 16, flexWrap: 'wrap',
  },
  price: { ...typography.title2, color: colors.accent, fontWeight: '700' },
  badge: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  badgeText: { fontSize: 13, fontWeight: '600' },
  desc: {
    ...typography.body,
    color: colors.secondary,
    lineHeight: 26,
    marginBottom: 22,
  },
  allergenSection: {
    backgroundColor: colors.accentLight,
    borderRadius: 14, padding: 16, gap: 8,
  },
  allergenHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4,
  },
  allergenIcon: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  allergenTitle: {
    ...typography.subheadline, color: colors.accentDark, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  allergenRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  dot: {
    width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.accent,
  },
  allergenText: { ...typography.callout, color: colors.secondary, flex: 1 },
});
