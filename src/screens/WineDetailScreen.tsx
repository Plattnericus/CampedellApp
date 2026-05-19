import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable,
  Animated, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector, ScrollView as GHScrollView } from 'react-native-gesture-handler';
import { Wine, WineCategory, WINE_CATEGORY_META } from '../data/wines';
import { useLanguage } from '../i18n';
import { useColors } from '../theme/colors';
import { typography } from '../theme/typography';

const SH = Dimensions.get('window').height;
const HERO_H = 210;
const CLOSE_THRESHOLD = 130;
const CLOSE_VELOCITY  = 800;

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
  const c = useColors();

  const translateY = useRef(new Animated.Value(SH)).current;
  const bgOpacity  = useRef(new Animated.Value(0)).current;
  const scrollY    = useRef(0);
  const isDragging = useRef(false);
  const lastDragY  = useRef(0);

  useEffect(() => {
    if (visible) {
      translateY.setValue(SH);
      bgOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, friction: 9, tension: 65, useNativeDriver: true }),
        Animated.timing(bgOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: SH, duration: 300, useNativeDriver: true }),
      Animated.timing(bgOpacity, { toValue: 0, duration: 240, useNativeDriver: true }),
    ]).start(onClose);
  };

  const snapBack = () => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, friction: 10, tension: 120, useNativeDriver: true }),
      Animated.timing(bgOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const nativeGesture = Gesture.Native();
  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .simultaneousWithExternalGesture(nativeGesture)
    .onStart(() => { isDragging.current = false; lastDragY.current = 0; })
    .onUpdate((e) => {
      if (!isDragging.current) {
        if (e.translationY > 0 && scrollY.current <= 1) {
          isDragging.current = true;
          translateY.stopAnimation();
          bgOpacity.stopAnimation();
        } else return;
      }
      const dy = Math.max(0, e.translationY * 0.92);
      lastDragY.current = dy;
      translateY.setValue(dy);
      bgOpacity.setValue(Math.max(0, 1 - dy / (SH * 0.5)));
    })
    .onEnd((e) => {
      if (isDragging.current) {
        if (lastDragY.current > CLOSE_THRESHOLD || e.velocityY > CLOSE_VELOCITY) dismiss();
        else snapBack();
      }
      isDragging.current = false;
    });

  if (!wine) return null;

  const fmt       = (p: number) => `${p.toFixed(2).replace('.', ',')} €`;
  const meta      = WINE_CATEGORY_META[category];
  const remoteUrl = wine.imageUrl;
  const desc      = wine.description[lang === 'en' ? 'de' : lang as 'de' | 'it'];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={dismiss}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: bgOpacity, backgroundColor: c.overlay }]}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={dismiss} />
        </Animated.View>

        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.sheet,
              { backgroundColor: c.surface, shadowColor: c.primary, transform: [{ translateY }] },
            ]}
          >
            <View style={styles.handleArea}>
              <View style={[styles.handle, { backgroundColor: c.border }]} />
            </View>

            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: c.primary }]} numberOfLines={2}>{wine.name}</Text>
              <Pressable style={[styles.closeBtn, { backgroundColor: c.cream }]} onPress={dismiss}>
                <Ionicons name="close" size={18} color={c.secondary} />
              </Pressable>
            </View>

            {remoteUrl ? (
              <Image source={{ uri: remoteUrl }} style={styles.heroImage} resizeMode="cover" />
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

            <GestureDetector gesture={nativeGesture}>
              <GHScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
                scrollEventThrottle={16}
                onScroll={(e) => { scrollY.current = e.nativeEvent.contentOffset.y; }}
              >
                <Text style={[styles.winery, { color: c.primary }]}>{wine.winery}</Text>
                <Text style={[styles.region, { color: c.tertiary }]}>
                  {wine.region}{wine.doc ? ` · ${wine.doc}` : ''}
                </Text>

                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: c.cream }]}>
                    <Text style={[styles.badgeText, { color: c.secondary }]}>
                      {DRYNESS_LABEL[lang]?.[wine.dryness] ?? wine.dryness}
                    </Text>
                  </View>
                  {wine.isOrganic && (
                    <View style={[styles.badge, styles.organicBadge]}>
                      <Ionicons name="leaf" size={11} color="#15803d" />
                      <Text style={[styles.badgeText, { color: '#15803d' }]}>Bio</Text>
                    </View>
                  )}
                  {wine.isLocal && (
                    <View style={[styles.badge, { backgroundColor: c.accentLight }]}>
                      <Ionicons name="location" size={11} color={c.accentDark} />
                      <Text style={[styles.badgeText, { color: c.accentDark }]}>Lokal</Text>
                    </View>
                  )}
                </View>

                {wine.grapes && wine.grapes.length > 0 && (
                  <View style={styles.grapeRow}>
                    {wine.grapes.map((g) => (
                      <View key={g} style={[styles.grapeChip, { backgroundColor: c.accentLight }]}>
                        <Text style={[styles.grapeText, { color: c.accentDark }]}>{GRAPE_FULL[g] ?? g}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {desc ? <Text style={[styles.desc, { color: c.secondary }]}>{desc}</Text> : null}

                <View style={[styles.priceSection, { backgroundColor: c.cream }]}>
                  <Text style={[styles.priceSectionTitle, { color: c.secondary }]}>Preise</Text>
                  {wine.prices.bottle && (
                    <View style={styles.priceRow}>
                      <Text style={[styles.priceLabel, { color: c.secondary }]}>Flasche</Text>
                      <Text style={[styles.priceValue, { color: c.accent }]}>{fmt(wine.prices.bottle)}</Text>
                    </View>
                  )}
                  {wine.prices.glass && (
                    <View style={styles.priceRow}>
                      <Text style={[styles.priceLabel, { color: c.secondary }]}>Glas (0,2 l)</Text>
                      <Text style={[styles.priceValue, { color: c.accent }]}>{fmt(wine.prices.glass)}</Text>
                    </View>
                  )}
                  {wine.prices.quarterLiter && (
                    <View style={styles.priceRow}>
                      <Text style={[styles.priceLabel, { color: c.secondary }]}>¼ Liter</Text>
                      <Text style={[styles.priceValue, { color: c.accent }]}>{fmt(wine.prices.quarterLiter)}</Text>
                    </View>
                  )}
                  {wine.prices.halfLiter && (
                    <View style={styles.priceRow}>
                      <Text style={[styles.priceLabel, { color: c.secondary }]}>½ Liter</Text>
                      <Text style={[styles.priceValue, { color: c.accent }]}>{fmt(wine.prices.halfLiter)}</Text>
                    </View>
                  )}
                  {wine.prices.liter && (
                    <View style={styles.priceRow}>
                      <Text style={[styles.priceLabel, { color: c.secondary }]}>1 Liter</Text>
                      <Text style={[styles.priceValue, { color: c.accent }]}>{fmt(wine.prices.liter)}</Text>
                    </View>
                  )}
                </View>

                {wine.awards && wine.awards.length > 0 && (
                  <View style={[styles.awardsSection, { backgroundColor: c.accentLight }]}>
                    <View style={styles.awardHeader}>
                      <Ionicons name="ribbon" size={14} color={c.accent} />
                      <Text style={[styles.awardTitle, { color: c.accentDark }]}>Auszeichnungen</Text>
                    </View>
                    {wine.awards.map((a, i) => (
                      <View key={i} style={styles.awardRow}>
                        <View style={[styles.dot, { backgroundColor: c.accent }]} />
                        <Text style={[styles.awardText, { color: c.secondary }]}>{a}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={{ height: 48 }} />
              </GHScrollView>
            </GestureDetector>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: SH * 0.92,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: -6 },
    shadowRadius: 24,
  },
  handleArea: { paddingVertical: 10, alignItems: 'center' },
  handle: {
    width: 38, height: 4,
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 22, paddingTop: 12, paddingBottom: 14,
  },
  sheetTitle: {
    ...typography.title3,
    flex: 1, paddingRight: 12,
  },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
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
    fontWeight: '700',
    marginBottom: 4,
  },
  region: {
    ...typography.footnote,
    letterSpacing: 0.4,
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 8, marginBottom: 14,
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  organicBadge: { backgroundColor: '#dcfce7' },
  badgeText: {
    ...typography.caption1,
    fontWeight: '600',
  },
  grapeRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 6, marginBottom: 16,
  },
  grapeChip: {
    borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  grapeText: {
    ...typography.caption1,
    fontWeight: '600',
  },
  desc: {
    ...typography.body,
    lineHeight: 26,
    marginBottom: 22,
  },
  priceSection: {
    borderRadius: 16,
    padding: 16, gap: 10,
    marginBottom: 18,
  },
  priceSectionTitle: {
    ...typography.subheadline,
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
  priceLabel: { ...typography.callout },
  priceValue: { ...typography.callout, fontWeight: '700' },
  awardsSection: {
    borderRadius: 16, padding: 16, gap: 8,
  },
  awardHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, marginBottom: 4,
  },
  awardTitle: {
    ...typography.subheadline,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  awardRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  awardText: { ...typography.callout, flex: 1 },
});
