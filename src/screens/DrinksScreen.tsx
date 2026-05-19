import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, SectionList, ScrollView, Pressable, TextInput, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../i18n';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { FadeInView } from '../components/FadeInView';
import { SectionHeader } from '../components/SectionHeader';
import { FilterSheet, FilterGroup } from '../components/FilterSheet';
import { DrinkItem } from '../data/drinks';
import { useAppContent } from '../data/DataContext';
import { Translations } from '../i18n/de';

type DrinkSort = 'price-asc' | 'price-desc' | 'alpha';

const DrinkRow: React.FC<{ item: DrinkItem }> = ({ item }) => {
  const { lang } = useLanguage();
  const isSingle = item.prices.length === 1;
  const fmt = (p: number) => `${p.toFixed(2).replace('.', ',')} €`;

  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.left}>
        <Text style={rowStyles.name}>{item.name[lang]}</Text>
      </View>
      <View style={rowStyles.right}>
        {isSingle ? (
          <Text style={rowStyles.priceMain}>{fmt(item.prices[0].price)}</Text>
        ) : (
          item.prices.map((p) => (
            <View key={p.amount} style={rowStyles.priceItem}>
              <Text style={rowStyles.size}>{p.amount}</Text>
              <Text style={rowStyles.priceMain}>{fmt(p.price)}</Text>
            </View>
          ))
        )}
      </View>
      <View style={rowStyles.divider} />
    </View>
  );
};

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
    backgroundColor: colors.surface,
    gap: 12,
  },
  left: { flex: 1 },
  right: { alignItems: 'flex-end', gap: 2 },
  name: { ...typography.callout, color: colors.primary },
  priceItem: { flexDirection: 'row', gap: 6, alignItems: 'baseline' },
  size: { ...typography.caption1, color: colors.tertiary },
  priceMain: {
    ...typography.priceSmall,
    color: colors.accent,
    fontWeight: '700',
  },
  divider: {
    position: 'absolute', bottom: 0, left: 20, right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
  },
});

export const DrinksScreen: React.FC = () => {
  const { t, lang } = useLanguage();
  const { drinkSections, loading, refreshData } = useAppContent();
  const [activeCategory, setActiveCategory] = useState('hotDrinks');
  const [query, setQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeSort, setActiveSort] = useState<DrinkSort[]>([]);
  const listRef = useRef<SectionList<any>>(null);

  const allSections = useMemo(() => drinkSections.map((s) => ({
    id: s.id,
    categoryKey: s.categoryKey as keyof Translations['categories'],
    data: s.items,
  })), [drinkSections]);

  const filterGroups: FilterGroup[] = useMemo(() => [
    {
      title: lang === 'de' ? 'Sortierung' : lang === 'it' ? 'Ordina per' : 'Sort by',
      options: [
        {
          key: 'price-asc',
          label: lang === 'de' ? 'Preis aufsteigend' : lang === 'it' ? 'Prezzo crescente' : 'Price low–high',
          icon: 'arrow-up',
        },
        {
          key: 'price-desc',
          label: lang === 'de' ? 'Preis absteigend' : lang === 'it' ? 'Prezzo decrescente' : 'Price high–low',
          icon: 'arrow-down',
        },
        {
          key: 'alpha',
          label: lang === 'de' ? 'Alphabetisch' : lang === 'it' ? 'Alfabetico' : 'A–Z',
          icon: 'text',
        },
      ],
    },
  ], [lang]);

  const sections = useMemo(() => {
    const sort = activeSort[0] as DrinkSort | undefined;

    let data = allSections;

    if (query.trim()) {
      const q = query.toLowerCase();
      data = data
        .map((s) => ({
          ...s,
          data: s.data.filter((item) => item.name[lang].toLowerCase().includes(q)),
        }))
        .filter((s) => s.data.length > 0);
    }

    if (!sort) return data;

    return data.map((s) => ({
      ...s,
      data: [...s.data].sort((a, b) => {
        if (sort === 'price-asc') return a.prices[0].price - b.prices[0].price;
        if (sort === 'price-desc') return b.prices[0].price - a.prices[0].price;
        if (sort === 'alpha') return a.name[lang].localeCompare(b.name[lang]);
        return 0;
      }),
    }));
  }, [query, lang, activeSort]);

  const toggleSort = (key: string) => {
    // Only one sort active at a time — toggle off if already selected
    setActiveSort((prev) =>
      prev.includes(key as DrinkSort) ? [] : [key as DrinkSort],
    );
  };

  const scrollToSection = (idx: number) => {
    setActiveCategory(allSections[idx].id);
    try {
      listRef.current?.scrollToLocation({
        sectionIndex: idx, itemIndex: 0, animated: true, viewOffset: 0,
      });
    } catch {}
  };

  const filterLabel = lang === 'de' ? 'Sortieren' : lang === 'it' ? 'Ordina' : 'Sort';
  const resetLabel  = lang === 'de' ? 'Sortierung zurücksetzen' : lang === 'it' ? 'Reimposta' : 'Reset';
  if (loading && drinkSections.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.tertiary }}>Loading...</Text>
      </View>
    );
  }
  return (
    <FadeInView style={styles.container}>
      {/* Search bar + filter button */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.tertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={lang === 'de' ? 'Getränk suchen…' : lang === 'it' ? 'Cerca bevanda…' : 'Search drinks…'}
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
          style={[styles.filterBtn, activeSort.length > 0 && styles.filterBtnActive]}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons
            name={activeSort.length > 0 ? 'swap-vertical' : 'swap-vertical-outline'}
            size={18}
            color={activeSort.length > 0 ? colors.white : colors.secondary}
          />
          {activeSort.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>1</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Category pills — hidden while searching */}
      {!query.trim() && (
        <View style={styles.pillBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillContent}
          >
            {allSections.map((s, idx) => {
              const active = activeCategory === s.id;
              return (
                <Pressable
                  key={s.id}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => scrollToSection(idx)}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {t.categories[s.categoryKey]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DrinkRow item={item} />}
        renderSectionHeader={({ section }) => (
          <SectionHeader categoryKey={(section as any).categoryKey} />
        )}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={({ viewableItems }) => {
          if (query.trim()) return;
          const top = viewableItems.find((vi) => vi.section);
          if (top?.section) setActiveCategory((top.section as any).id);
        }}
        viewabilityConfig={{ itemVisiblePercentThreshold: 20 }}
        style={{ flex: 1 }}
        contentContainerStyle={[styles.listContent, sections.length === 0 && { flex: 1 }]}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="search-outline" size={40} color={colors.border} />
            <Text style={styles.emptyText}>
              {lang === 'de' ? 'Keine Ergebnisse' : lang === 'it' ? 'Nessun risultato' : 'No results'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshData} tintColor={colors.accent} />
        }
      />

      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        title={filterLabel}
        groups={filterGroups}
        activeFilters={activeSort}
        onToggle={toggleSort}
        onReset={() => setActiveSort([])}
        resetLabel={resetLabel}
      />
    </FadeInView>
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
  searchIcon: { flexShrink: 0 },
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
    backgroundColor: colors.background,
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
  listContent: { paddingBottom: 100 },
  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { ...typography.callout, color: colors.tertiary },
});
