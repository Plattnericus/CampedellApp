import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SectionList, ScrollView, Pressable,
  TextInput, RefreshControl, Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../i18n';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { FadeInView } from '../components/FadeInView';
import { WineCard } from '../components/WineCard';
import { FilterSheet, FilterGroup } from '../components/FilterSheet';
import { WineDetailScreen } from './WineDetailScreen';
import { WineCategory, Wine, WINE_CATEGORY_META } from '../data/wines';
import { useAppContent } from '../data/DataContext';

const CATS: WineCategory[] = ['sparkling', 'white', 'red'];

type WineFilter = 'organic' | 'local' | 'trocken' | 'halbtrocken' | 'lieblich';

type WineSectionData = {
  id: WineCategory;
  category: WineCategory;
  data: Wine[];
};

export const WinesScreen: React.FC = () => {
  const { t, lang } = useLanguage();
  const { wineSections, loading, refreshData } = useAppContent();

  const screenOpacity = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => {
    Animated.timing(screenOpacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    try {
      listRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: false, viewOffset: 0 });
    } catch {}
    return () => screenOpacity.setValue(0);
  }, []));

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await refreshData(); } finally { setRefreshing(false); }
  };

  const [activeCategory, setActiveCategory] = useState<WineCategory>('sparkling');
  const [query, setQuery] = useState('');
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<WineCategory>('sparkling');
  const [detailVisible, setDetailVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<WineFilter[]>([]);
  const [filterKey, setFilterKey] = useState(0);

  const listRef = useRef<SectionList<any>>(null);
  const pillScrollRef = useRef<ScrollView>(null);
  const pillOffsets = useRef<Record<string, { x: number; width: number }>>({});

  // Auto-scroll pill bar to keep active category visible
  useEffect(() => {
    const pill = pillOffsets.current[activeCategory];
    if (pill && pillScrollRef.current) {
      pillScrollRef.current.scrollTo({
        x: Math.max(0, pill.x - 16),
        animated: true,
      });
    }
  }, [activeCategory]);

  const filterGroups: FilterGroup[] = useMemo(() => [
    {
      title: lang === 'de' ? 'Eigenschaften' : lang === 'it' ? 'Caratteristiche' : 'Properties',
      options: [
        { key: 'organic', label: 'Bio', icon: 'leaf', iconColor: '#15803d' },
        {
          key: 'local',
          label: lang === 'de' ? 'Lokal' : lang === 'it' ? 'Locale' : 'Local',
          icon: 'location',
          iconColor: colors.accentDark,
        },
      ],
    },
    {
      title: lang === 'de' ? 'Geschmack' : lang === 'it' ? 'Gusto' : 'Taste',
      options: [
        { key: 'trocken',     label: lang === 'de' ? 'Trocken'     : lang === 'it' ? 'Secco'     : 'Dry'    },
        { key: 'halbtrocken', label: lang === 'de' ? 'Halbtrocken' : lang === 'it' ? 'Semisecco' : 'Off-dry' },
        { key: 'lieblich',    label: lang === 'de' ? 'Lieblich'    : lang === 'it' ? 'Amabile'   : 'Sweet'   },
      ],
    },
  ], [lang]);

  // Build SectionList sections from all wine categories
  const sections: WineSectionData[] = useMemo(() => {
    const drynessFilters = activeFilters.filter(
      (f) => f === 'trocken' || f === 'halbtrocken' || f === 'lieblich'
    );
    const descLang = lang === 'en' ? 'de' : lang as 'de' | 'it';
    const q = query.toLowerCase().trim();

    return CATS.map((cat) => {
      const section = wineSections.find((s) => s.category === cat);
      let data: Wine[] = section?.wines ?? [];

      // Apply filters
      if (activeFilters.length > 0) {
        data = data.filter((wine) => {
          if (activeFilters.includes('organic') && !wine.isOrganic) return false;
          if (activeFilters.includes('local') && !wine.isLocal) return false;
          if (drynessFilters.length > 0 && !drynessFilters.includes(wine.dryness as any)) return false;
          return true;
        });
      }

      // Apply search
      if (q) {
        data = data.filter(
          (w) =>
            w.name.toLowerCase().includes(q) ||
            w.winery.toLowerCase().includes(q) ||
            w.region.toLowerCase().includes(q) ||
            w.description[descLang].toLowerCase().includes(q)
        );
      }

      return { id: cat, category: cat, data };
    }).filter((s) => s.data.length > 0);
  }, [wineSections, query, activeFilters, lang]);

  const toggleFilter = (key: string) => {
    setActiveFilters((prev) =>
      prev.includes(key as WineFilter)
        ? prev.filter((f) => f !== key)
        : [...prev, key as WineFilter]
    );
    setFilterKey((k) => k + 1);
  };

  const handleWinePress = (wine: Wine, category: WineCategory) => {
    setSelectedWine(wine);
    setSelectedCategory(category);
    setDetailVisible(true);
  };

  const scrollToCategory = (cat: WineCategory) => {
    setActiveCategory(cat);
    const idx = sections.findIndex((s) => s.category === cat);
    if (idx < 0) return;
    try {
      listRef.current?.scrollToLocation({
        sectionIndex: idx,
        itemIndex: 0,
        animated: true,
        viewOffset: 0,
      });
    } catch {}
  };

  const CAT_LABEL: Record<WineCategory, keyof typeof t.categories> = {
    sparkling: 'sparkling', white: 'white', red: 'red',
  };

  const filterLabel = lang === 'de' ? 'Filter' : lang === 'it' ? 'Filtri' : 'Filter';
  const resetLabel  = lang === 'de' ? 'Filter zurücksetzen' : lang === 'it' ? 'Reimposta filtri' : 'Reset filters';

  if (loading && wineSections.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.tertiary }}>Loading…</Text>
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
            placeholder={lang === 'de' ? 'Wein suchen…' : lang === 'it' ? 'Cerca vino…' : 'Search wine…'}
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

      {/* Category pills — hidden while searching */}
      {!query.trim() && (
        <View style={styles.pillBar}>
          <ScrollView
            ref={pillScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillContent}
            scrollEventThrottle={16}
          >
            {CATS.map((cat) => {
              const active = activeCategory === cat;
              const meta = WINE_CATEGORY_META[cat];
              return (
                <Pressable
                  key={cat}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => scrollToCategory(cat)}
                  onLayout={(e) => {
                    pillOffsets.current[cat] = {
                      x: e.nativeEvent.layout.x,
                      width: e.nativeEvent.layout.width,
                    };
                  }}
                >
                  <Ionicons
                    name={meta.icon as any}
                    size={13}
                    color={active ? colors.white : colors.secondary}
                  />
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {t.categories[CAT_LABEL[cat]]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* All wines in one SectionList */}
      <SectionList
        key={filterKey}
        ref={listRef}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index, section }) => (
          <FadeInView delay={index * 35} duration={280}>
            <WineCard
              wine={item}
              category={(section as WineSectionData).category}
              onPress={(wine) => handleWinePress(wine, (section as WineSectionData).category)}
            />
          </FadeInView>
        )}
        renderSectionHeader={({ section }) => {
          const cat = (section as WineSectionData).category;
          const meta = WINE_CATEGORY_META[cat];
          return (
            <View style={styles.sectionHeader}>
              <Ionicons name={meta.icon as any} size={20} color={colors.accent} />
              <Text style={styles.sectionTitle}>{t.categories[CAT_LABEL[cat]]}</Text>
            </View>
          );
        }}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={({ viewableItems }) => {
          if (query.trim()) return;
          const top = viewableItems.find((vi) => vi.section);
          if (top?.section) {
            const cat = (top.section as WineSectionData).category;
            setActiveCategory(cat);
          }
        }}
        viewabilityConfig={{ itemVisiblePercentThreshold: 20 }}
        contentContainerStyle={[
          styles.list,
          sections.length === 0 && { flex: 1, backgroundColor: colors.background },
        ]}
        ListEmptyComponent={
          <View style={[styles.emptyWrap, { flex: 1, justifyContent: 'center' }]}>
            <Ionicons name="wine-outline" size={40} color={colors.border} />
            <Text style={styles.emptyText}>
              {lang === 'de' ? 'Keine Ergebnisse' : lang === 'it' ? 'Nessun risultato' : 'No results'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent} />
        }
      />

      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        title={filterLabel}
        groups={filterGroups}
        activeFilters={activeFilters}
        onToggle={toggleFilter}
        onReset={() => { setActiveFilters([]); setFilterKey((k) => k + 1); }}
        resetLabel={resetLabel}
      />

      <WineDetailScreen
        wine={selectedWine}
        category={selectedCategory}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
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
  pillContent: { paddingHorizontal: 14, gap: 7 },
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

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    ...typography.title2,
    color: colors.primary,
    fontWeight: '800',
  },

  list: { paddingBottom: 100 },
  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { ...typography.callout, color: colors.tertiary },
});
