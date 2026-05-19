import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, StyleSheet, ScrollView, FlatList, Pressable,
  TextInput, RefreshControl, Image, Dimensions, Modal, Animated,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector, ScrollView as GHScrollView } from 'react-native-gesture-handler';
import { useLanguage } from '../i18n';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { FadeInView } from '../components/FadeInView';
import { FilterSheet, FilterGroup } from '../components/FilterSheet';
import { DrinkItem, DrinkSection } from '../data/drinks';
import { useAppContent } from '../data/DataContext';
import { Translations } from '../i18n/de';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SIDE_PAD = 16;
const CARD_WIDTH = 148;
const IMAGE_HEIGHT = 110;
const CLOSE_THRESHOLD = 130;
const CLOSE_VELOCITY = 800;

const SECTION_GRADIENTS: Record<string, [string, string]> = {
  'wine-outline':  ['#FAE8EC', '#F2B8C4'],
  'cafe-outline':  ['#FFF0D6', '#FFCB7E'],
  'water-outline': ['#E8F4FC', '#A8D4F5'],
  'leaf-outline':  ['#E8F7EC', '#A5D6B4'],
  'beer-outline':  ['#FFF8E0', '#FFE57A'],
};

const getGradient = (icon?: string): [string, string] => {
  if (icon && SECTION_GRADIENTS[icon]) return SECTION_GRADIENTS[icon];
  return ['#F5EDE0', '#E8D5C0'];
};

// ─── Detail Sheet ─────────────────────────────────────────────────────────────

interface DetailProps {
  item: DrinkItem | null;
  sectionIcon?: string;
  visible: boolean;
  onClose: () => void;
}

const DrinkDetailSheet: React.FC<DetailProps> = ({ item, sectionIcon, visible, onClose }) => {
  const { lang } = useLanguage();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(0);
  const isDragging = useRef(false);
  const lastDragY = useRef(0);
  const [imgError, setImgError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (visible) {
      setImgError(false);
      setRetryCount(0);
      translateY.setValue(SCREEN_HEIGHT);
      bgOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, friction: 9, tension: 65, useNativeDriver: true }),
        Animated.timing(bgOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 300, useNativeDriver: true }),
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
      bgOpacity.setValue(Math.max(0, 1 - dy / (SCREEN_HEIGHT * 0.5)));
    })
    .onEnd((e) => {
      if (isDragging.current) {
        if (lastDragY.current > CLOSE_THRESHOLD || e.velocityY > CLOSE_VELOCITY) dismiss();
        else snapBack();
      }
      isDragging.current = false;
    });

  if (!item) return null;

  const fmt = (p: number) => `${p.toFixed(2).replace('.', ',')} €`;
  const [g1, g2] = getGradient(sectionIcon);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={dismiss}>
      <View style={detailStyles.overlay}>
        <Animated.View style={[detailStyles.backdrop, { opacity: bgOpacity }]}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={dismiss} />
        </Animated.View>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[detailStyles.sheet, { transform: [{ translateY }] }]}>
            <View style={detailStyles.handleArea}>
              <View style={detailStyles.handle} />
            </View>
            <View style={detailStyles.sheetHeader}>
              <Text style={detailStyles.sheetTitle} numberOfLines={2}>{item.name[lang]}</Text>
              <Pressable style={detailStyles.closeBtn} onPress={dismiss}>
                <Ionicons name="close" size={18} color={colors.secondary} />
              </Pressable>
            </View>
            {item.imageUrl && !imgError ? (
              <Image
                key={retryCount}
                source={{ uri: item.imageUrl }}
                style={detailStyles.heroImage}
                resizeMode="cover"
                onError={() => {
                  if (retryCount < 2) setTimeout(() => setRetryCount(c => c + 1), 1500);
                  else setImgError(true);
                }}
              />
            ) : (
              <LinearGradient colors={[g1, g2]} style={detailStyles.heroGradient}>
                <Ionicons name={(sectionIcon as any) ?? 'cafe-outline'} size={72} color="rgba(126,161,59,0.35)" />
              </LinearGradient>
            )}
            <GestureDetector gesture={nativeGesture}>
              <GHScrollView
                style={detailStyles.scroll}
                contentContainerStyle={detailStyles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
                scrollEventThrottle={16}
                onScroll={(e) => { scrollY.current = e.nativeEvent.contentOffset.y; }}
              >
                {item.prices.length > 0 && (
                  <View style={detailStyles.priceSection}>
                    {item.prices.map((p, i) => (
                      <View key={i} style={detailStyles.priceRow}>
                        <Text style={detailStyles.priceLabel}>
                          {p.amount || (lang === 'de' ? 'Preis' : lang === 'it' ? 'Prezzo' : 'Price')}
                        </Text>
                        <Text style={detailStyles.priceValue}>{fmt(p.price)}</Text>
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

const detailStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: SCREEN_HEIGHT * 0.85,
    shadowColor: colors.primary, shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: -6 }, shadowRadius: 24,
  },
  handleArea: { paddingVertical: 10, alignItems: 'center' },
  handle: { width: 38, height: 4, backgroundColor: colors.border, borderRadius: 2 },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 22, paddingTop: 12, paddingBottom: 14,
  },
  sheetTitle: { ...typography.title3, color: colors.primary, flex: 1, paddingRight: 12 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center',
  },
  heroImage: { width: '100%', height: 200 },
  heroGradient: { width: '100%', height: 200, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 22 },
  scrollContent: { paddingTop: 18 },
  priceSection: {
    backgroundColor: colors.cream, borderRadius: 16,
    padding: 16, gap: 12, marginBottom: 18,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { ...typography.callout, color: colors.secondary },
  priceValue: { ...typography.callout, color: colors.accent, fontWeight: '700' },
});

// ─── Horizontal Drink Card ────────────────────────────────────────────────────

interface DrinkCardProps {
  item: DrinkItem;
  sectionIcon?: string;
  onPress: (item: DrinkItem) => void;
}

const DrinkCard: React.FC<DrinkCardProps> = ({ item, sectionIcon, onPress }) => {
  const { lang } = useLanguage();
  const [imgError, setImgError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleImageError = useCallback(() => {
    if (retryCount < 2) setTimeout(() => setRetryCount(c => c + 1), 1500 * (retryCount + 1));
    else setImgError(true);
  }, [retryCount]);

  const fmt = (p: number) => `${p.toFixed(2).replace('.', ',')} €`;
  const firstPrice = item.prices.length > 0
    ? item.prices.reduce((min, p) => p.price < min.price ? p : min, item.prices[0])
    : null;
  const priceLabel = firstPrice
    ? (item.prices.length > 1 ? `ab ${fmt(firstPrice.price)}` : fmt(firstPrice.price))
    : '';
  const [g1, g2] = getGradient(sectionIcon);

  return (
    <Pressable style={cardStyles.card} onPress={() => onPress(item)}>
      {item.imageUrl && !imgError ? (
        <Image
          key={retryCount}
          source={{ uri: item.imageUrl }}
          style={cardStyles.image}
          resizeMode="cover"
          onError={handleImageError}
        />
      ) : (
        <LinearGradient colors={[g1, g2]} style={cardStyles.imagePlaceholder}>
          <Ionicons
            name={(sectionIcon as any) ?? 'cafe-outline'}
            size={36}
            color="rgba(126,161,59,0.35)"
          />
        </LinearGradient>
      )}
      <View style={cardStyles.info}>
        <Text style={cardStyles.name} numberOfLines={2}>{item.name[lang]}</Text>
        {priceLabel ? <Text style={cardStyles.price}>{priceLabel}</Text> : null}
      </View>
    </Pressable>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },
  image: { width: '100%', height: IMAGE_HEIGHT },
  imagePlaceholder: {
    width: '100%', height: IMAGE_HEIGHT,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { padding: 10, gap: 3 },
  name: { ...typography.caption1, color: colors.primary, fontWeight: '600', lineHeight: 17 },
  price: { ...typography.caption1, color: colors.accent, fontWeight: '700' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const DrinksScreen: React.FC = () => {
  const { t, lang } = useLanguage();
  const { drinkSections, loading, refreshData } = useAppContent();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState<DrinkItem | null>(null);
  const [selectedSectionIcon, setSelectedSectionIcon] = useState<string | undefined>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const screenOpacity = useRef(new Animated.Value(0)).current;

  const mainScrollRef = useRef<ScrollView>(null);
  const pillScrollRef = useRef<ScrollView>(null);
  const pillOffsets = useRef<Record<string, { x: number; width: number }>>({});
  // y-offset of each section header in the main scroll
  const sectionYOffsets = useRef<Record<string, number>>({});

  const resolvedCategory = drinkSections.find(s => s.id === activeCategory)
    ? activeCategory
    : (drinkSections[0]?.id ?? '');

  useFocusEffect(useCallback(() => {
    Animated.timing(screenOpacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    mainScrollRef.current?.scrollTo({ y: 0, animated: false });
    return () => screenOpacity.setValue(0);
  }, []));

  // Auto-scroll pill bar when active category changes
  useEffect(() => {
    const pill = pillOffsets.current[resolvedCategory];
    if (pill && pillScrollRef.current) {
      pillScrollRef.current.scrollTo({ x: Math.max(0, pill.x - 16), animated: true });
    }
  }, [resolvedCategory]);

  const getCategoryLabel = (s: DrinkSection) =>
    t.categories[s.categoryKey as keyof Translations['categories']] ?? s.categoryKey;

  // Dynamically generate filter groups by scanning drinkSections
  const filterGroups: FilterGroup[] = useMemo(() => [{
    title: lang === 'de' ? 'Kategorien' : lang === 'it' ? 'Categorie' : 'Categories',
    options: drinkSections.map(s => ({
      key: s.id,
      label: getCategoryLabel(s),
      icon: s.icon,
    })),
  }], [drinkSections, lang]);

  const toggleFilter = (key: string) => {
    setActiveFilters(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    );
  };

  const filteredSections = useMemo(() => {
    let base = drinkSections;

    if (activeFilters.length > 0) {
      base = base.filter(s => activeFilters.includes(s.id));
    }

    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base
      .map(s => ({
        ...s,
        items: s.items.filter(
          item => item.name[lang].toLowerCase().includes(q) ||
                  item.name.de.toLowerCase().includes(q)
        ),
      }))
      .filter(s => s.items.length > 0);
  }, [drinkSections, query, lang, activeFilters]);

  const handleItemPress = (item: DrinkItem, icon?: string) => {
    setSelectedItem(item);
    setSelectedSectionIcon(icon);
    setDetailVisible(true);
  };

  const scrollToSection = (id: string) => {
    setActiveCategory(id);
    const y = sectionYOffsets.current[id];
    if (y !== undefined && mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ y, animated: true });
    }
  };

  // Determine active category from main scroll position
  const handleMainScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (query.trim()) return;
    const scrollY = e.nativeEvent.contentOffset.y + 60; // offset for pills/header
    const ids = Object.keys(sectionYOffsets.current);
    let current = ids[0];
    for (const id of ids) {
      if (sectionYOffsets.current[id] <= scrollY) current = id;
    }
    if (current && current !== activeCategory) setActiveCategory(current);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await refreshData(); } finally { setRefreshing(false); }
  };

  if (loading && drinkSections.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Lade Getränke…</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      {/* Search bar + filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              lang === 'de' ? 'Getränk suchen…'
              : lang === 'it' ? 'Cerca bevanda…'
              : 'Search drinks…'
            }
            placeholderTextColor={colors.tertiary}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.tertiary} />
            </Pressable>
          )}
        </View>

        <Pressable
          style={[styles.filterBtn, activeFilters.length > 0 && styles.filterBtnActive]}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons
            name={activeFilters.length > 0 ? 'funnel' : 'funnel-outline'}
            size={18}
            color={activeFilters.length > 0 ? colors.white : colors.secondary}
          />
          {activeFilters.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilters.length}</Text>
            </View>
          )}
        </Pressable>
      </View>


      {/* Main vertical scroll — each category = horizontal carousel */}
      <ScrollView
        ref={mainScrollRef}
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        onScroll={handleMainScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent} />
        }
      >
        {filteredSections.map((section, sIdx) => (
          <FadeInView key={section.id} delay={sIdx * 70} duration={320}>
            <View
              onLayout={(e) => {
                sectionYOffsets.current[section.id] = e.nativeEvent.layout.y;
              }}
            >
              {/* Section header */}
              <View style={styles.sectionHeader}>
                {section.icon && (
                  <Ionicons name={section.icon as any} size={20} color={colors.accent} />
                )}
                <Text style={styles.sectionTitle}>{getCategoryLabel(section)}</Text>
              </View>

              {/* Horizontal card row */}
              <FlatList
                horizontal
                data={section.items}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <FadeInView delay={sIdx * 70 + index * 50} duration={300}>
                    <DrinkCard
                      item={item}
                      sectionIcon={section.icon}
                      onPress={(d) => handleItemPress(d, section.icon)}
                    />
                  </FadeInView>
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                snapToInterval={CARD_WIDTH + 12}
                decelerationRate="fast"
              />
            </View>
          </FadeInView>
        ))}

        {filteredSections.length === 0 && (
          <View style={styles.emptyWrap}>
            <Ionicons name="search-outline" size={40} color={colors.border} />
            <Text style={styles.emptyText}>
              {lang === 'de' ? 'Keine Ergebnisse'
              : lang === 'it' ? 'Nessun risultato'
              : 'No results'}
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        title={lang === 'de' ? 'Filter' : lang === 'it' ? 'Filtri' : 'Filter'}
        groups={filterGroups}
        activeFilters={activeFilters}
        onToggle={toggleFilter}
        onReset={() => setActiveFilters([])}
        resetLabel={lang === 'de' ? 'Filter zurücksetzen' : lang === 'it' ? 'Reimposta filtri' : 'Reset filters'}
      />

      <DrinkDetailSheet
        item={selectedItem}
        sectionIcon={selectedSectionIcon}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...typography.callout, color: colors.tertiary },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SIDE_PAD,
    marginTop: 10,
    marginBottom: 6,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cream,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    ...typography.callout,
    color: colors.primary,
    padding: 0,
    margin: 0,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accentMid,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.white,
    lineHeight: 12,
  },

  pillBar: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  pillContent: { paddingHorizontal: SIDE_PAD, gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  pillText: { ...typography.caption1, color: colors.secondary, fontWeight: '500' },
  pillTextActive: { color: colors.white, fontWeight: '600' },

  mainScroll: { flex: 1 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SIDE_PAD,
    paddingTop: 22,
    paddingBottom: 12,
  },
  sectionTitle: {
    ...typography.title2,
    color: colors.primary,
    fontWeight: '800',
  },

  horizontalList: {
    paddingHorizontal: SIDE_PAD,
    paddingBottom: 8,
  },

  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { ...typography.callout, color: colors.tertiary },
});
