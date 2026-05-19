import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable,
  Animated, ScrollView, PanResponder, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Wine, WineCategory, WINE_CATEGORY_META } from '../data/wines';
import { wineImages } from '../data/wineImageMap';
import { useLanguage } from '../i18n';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const SH = Dimensions.get('window').height;
const HERO_H = 210;

const GRAPE_FULL: Record<string, string> = {
  CH: 'Chardonnay', ME: 'Merlot', LA: 'Lagrein', CS: 'Cab. Sauvignon',
  CF: 'Cab. Franc', PN: 'Pinot Nero', PB: 'Pinot Bianco', SB: 'Sauvignon Blanc',
  RI: 'Riesling', VT: 'Vernatsch', CRE: 'Carménère', CV: 'Corvina',
  RON: 'Rondinella', MOL: 'Molinara',
};

const DRYNESS_LABEL: Record<string, Record<string, string>> = {
  de: { trocken: 'Trocken', halbtrocken: 'Halbtrocken', lieblich: 'Lieblich' },
  it: { trocken: 'Secco', halbtrocken: 'Semisecco', lieblich: 'Amabile' },
  en: { trocken: 'Dry', halbtrocken: 'Off-dry', lieblich: 'Sweet' },
};

interface Props {
  wine: Wine | null;
  category: WineCategory;
  visible: boolean;
  onClose: () => void;
}

export const WineDetailScreen: React.FC<Props> = ({ wine, category, visible, onClose }) => {
  const { lang } = useLanguage();
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

  if (!wine) return null;

  const fmt = (p: number) => `${p.toFixed(2).replace('.', ',')} €`;
  const meta = WINE_CATEGORY_META[category];
  const realImage = wineImages[wine.image ?? wine.id];
  const desc = wine.description[lang === 'en' ? 'de' : lang as 'de' | 'it'];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: bgOpacity }]}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={close} />
        </Animated.View>

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

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle} numberOfLines={2}>{wine.name}</Text>
            <Pressable style={styles.closeBtn} onPress={close}>
              <Ionicons name="close" size={18} color={colors.secondary} />
            </Pressable>
          </View>

          {/* Hero */}
          {realImage ? (
            <Image source={realImage} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={[meta.gradientStart, meta.gradientEnd] as const}
              style={styles.heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name={meta.icon as any} size={72} color="rgba(255,255,255,0.9)" />
            </LinearGradient>
          )}

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Winery + region */}
            <Text style={styles.winery}>{wine.winery}</Text>
            <Text style={styles.region}>{wine.region}{wine.doc ? ` · ${wine.doc}` : ''}</Text>

            {/* Dryness + organic badges */}
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{DRYNESS_LABEL[lang]?.[wine.dryness] ?? wine.dryness}</Text>
              </View>
              {wine.isOrganic && (
                <View style={[styles.badge, styles.organicBadge]}>
                  <Ionicons name="leaf" size={11} color="#15803d" />
                  <Text style={[styles.badgeText, { color: '#15803d' }]}>Bio</Text>
                </View>
              )}
              {wine.isLocal && (
                <View style={[styles.badge, styles.localBadge]}>
                  <Ionicons name="location" size={11} color={colors.accentDark} />
                  <Text style={[styles.badgeText, { color: colors.accentDark }]}>Lokal</Text>
                </View>
              )}
            </View>

            {/* Grapes */}
            {wine.grapes && wine.grapes.length > 0 && (
              <View style={styles.grapeRow}>
                {wine.grapes.map((g) => (
                  <View key={g} style={styles.grapeChip}>
                    <Text style={styles.grapeText}>{GRAPE_FULL[g] ?? g}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Description */}
            {desc ? (
              <Text style={styles.desc}>{desc}</Text>
            ) : null}

            {/* Prices */}
            <View style={styles.priceSection}>
              <Text style={styles.priceSectionTitle}>Preise</Text>
              {wine.prices.bottle && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Flasche</Text>
                  <Text style={styles.priceValue}>{fmt(wine.prices.bottle)}</Text>
                </View>
              )}
              {wine.prices.glass && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Glas (0,2 l)</Text>
                  <Text style={styles.priceValue}>{fmt(wine.prices.glass)}</Text>
                </View>
              )}
              {wine.prices.quarterLiter && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>¼ Liter</Text>
                  <Text style={styles.priceValue}>{fmt(wine.prices.quarterLiter)}</Text>
                </View>
              )}
              {wine.prices.halfLiter && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>½ Liter</Text>
                  <Text style={styles.priceValue}>{fmt(wine.prices.halfLiter)}</Text>
                </View>
              )}
              {wine.prices.liter && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>1 Liter</Text>
                  <Text style={styles.priceValue}>{fmt(wine.prices.liter)}</Text>
                </View>
              )}
            </View>

            {/* Awards */}
            {wine.awards && wine.awards.length > 0 && (
              <View style={styles.awardsSection}>
                <View style={styles.awardHeader}>
                  <Ionicons name="ribbon" size={14} color={colors.accent} />
                  <Text style={styles.awardTitle}>Auszeichnungen</Text>
                </View>
                {wine.awards.map((a, i) => (
                  <View key={i} style={styles.awardRow}>
                    <View style={styles.dot} />
                    <Text style={styles.awardText}>{a}</Text>
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
  heroImage: { width: '100%', height: HERO_H },
  heroGradient: {
    width: '100%', height: HERO_H,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { paddingHorizontal: 22 },
  scrollContent: { paddingTop: 18 },
  winery: {
    ...typography.title3,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  region: {
    ...typography.footnote,
    color: colors.tertiary,
    letterSpacing: 0.4,
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 8, marginBottom: 14,
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.cream,
    borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  organicBadge: { backgroundColor: '#dcfce7' },
  localBadge: { backgroundColor: colors.accentLight },
  badgeText: {
    ...typography.caption1,
    color: colors.secondary,
    fontWeight: '600',
  },
  grapeRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 6, marginBottom: 16,
  },
  grapeChip: {
    backgroundColor: colors.accentLight,
    borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  grapeText: {
    ...typography.caption1,
    color: colors.accentDark,
    fontWeight: '600',
  },
  desc: {
    ...typography.body,
    color: colors.secondary,
    lineHeight: 26,
    marginBottom: 22,
  },
  priceSection: {
    backgroundColor: colors.cream,
    borderRadius: 16,
    padding: 16, gap: 10,
    marginBottom: 18,
  },
  priceSectionTitle: {
    ...typography.subheadline,
    color: colors.secondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    ...typography.callout,
    color: colors.secondary,
  },
  priceValue: {
    ...typography.callout,
    color: colors.accent,
    fontWeight: '700',
  },
  awardsSection: {
    backgroundColor: colors.accentLight,
    borderRadius: 16, padding: 16, gap: 8,
  },
  awardHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, marginBottom: 4,
  },
  awardTitle: {
    ...typography.subheadline,
    color: colors.accentDark,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  awardRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  dot: {
    width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.accent,
  },
  awardText: { ...typography.callout, color: colors.secondary, flex: 1 },
});
