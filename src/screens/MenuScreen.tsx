import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SectionList, ScrollView, Pressable,
  TextInput, RefreshControl, Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../i18n';
import { useColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { FadeInView } from '../components/FadeInView';
import { MenuItemCard } from '../components/MenuItemCard';
import { SectionHeader } from '../components/SectionHeader';
import { FilterSheet, FilterGroup } from '../components/FilterSheet';
import { ItemDetailScreen } from './ItemDetailScreen';
import { FoodItem } from '../data/food';
import { useAppContent } from '../data/DataContext';
import { Translations } from '../i18n/de';

type SectionData = {
  id: string;
  categoryKey: keyof Translations['categories'];
  icon: string;
  gradientStart: string;
  gradientEnd: string;
  data: FoodItem[];
};

type MenuFilter = 'vegan' | 'vegetarian' | 'no-gluten' | 'no-dairy' | 'no-nuts';

export const MenuScreen: React.FC = () => {
  const { t, lang } = useLanguage();
  const c = useColors();
  const { foodSections, loading, refreshData } = useAppContent();

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

  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('starters');
  const [query, setQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<MenuFilter[]>([]);
  const [filterKey, setFilterKey] = useState(0);
  const listRef = useRef<SectionList<any>>(null);
  const pillScrollRef = useRef<ScrollView>(null);
  const pillOffsets = useRef<Record<string, { x: number; width: number }>>({});

  useEffect(() => {
    const pill = pillOffsets.current[activeCategory];
    if (pill && pillScrollRef.current) {
      pillScrollRef.current.scrollTo({ x: Math.max(0, pill.x - 16), animated: true });
    }
  }, [activeCategory]);

  const allSections: SectionData[] = useMemo(() => foodSections.map((s) => ({
    id: s.id,
    categoryKey: s.categoryKey as keyof Translations['categories'],
    icon: s.icon,
    gradientStart: s.gradientStart,
    gradientEnd: s.gradientEnd,
    data: s.items,
  })), [foodSections]);

  const filterGroups: FilterGroup[] = useMemo(() => [
    {
      title: lang === 'de' ? 'Ernährung' : lang === 'it' ? 'Alimentazione' : 'Diet',
      options: [
        { key: 'vegan', label: 'Vegan', icon: 'leaf', iconColor: '#15803d' },
        {
          key: 'vegetarian',
          label: lang === 'de' ? 'Vegetarisch' : lang === 'it' ? 'Vegetariano' : 'Vegetarian',
          icon: 'leaf-outline', iconColor: '#15803d',
        },
      ],
    },
    {
      title: lang === 'de' ? 'Ohne Allergene' : lang === 'it' ? 'Senza allergeni' : 'Allergen-free',
      options: [
        { key: 'no-gluten', label: lang === 'de' ? 'Glutenfrei' : lang === 'it' ? 'Senza glutine' : 'Gluten-free' },
        { key: 'no-dairy', label: lang === 'de' ? 'Laktosefrei' : lang === 'it' ? 'Senza lattosio' : 'Lactose-free' },
        { key: 'no-nuts', label: lang === 'de' ? 'Nussfrei' : lang === 'it' ? 'Senza noci' : 'Nut-free' },
      ],
    },
  ], [lang]);

  const sections: SectionData[] = useMemo(() => {
    let base = allSections;
    if (activeFilters.length > 0) {
      base = base.map((s) => ({
        ...s,
        data: s.data.filter((item) => {
          if (activeFilters.includes('vegan') && !item.isVegan) return false;
          if (activeFilters.includes('vegetarian') && !item.isVegetarian && !item.isVegan) return false;
          if (activeFilters.includes('no-gluten') && item.allergens?.includes('gluten')) return false;
          if (activeFilters.includes('no-dairy') && item.allergens?.includes('dairy')) return false;
          if (activeFilters.includes('no-nuts') && item.allergens?.includes('nuts')) return false;
          return true;
        }),
      })).filter((s) => s.data.length > 0);
    }
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base
      .map((s) => ({
        ...s,
        data: s.data.filter(
          (item) =>
            item.name[lang].toLowerCase().includes(q) ||
            (item.description?.[lang]?.toLowerCase().includes(q) ?? false),
        ),
      }))
      .filter((s) => s.data.length > 0);
  }, [query, lang, activeFilters, allSections]);

  const toggleFilter = (key: string) => {
    setActiveFilters((prev) =>
      prev.includes(key as MenuFilter) ? prev.filter((f) => f !== key) : [...prev, key as MenuFilter],
    );
    setFilterKey((k) => k + 1);
  };

  const handleItemPress = (item: FoodItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const scrollToSection = (idx: number) => {
    setActiveCategory(allSections[idx].id);
    try {
      listRef.current?.scrollToLocation({ sectionIndex: idx, itemIndex: 0, animated: true, viewOffset: 0 });
    } catch {}
  };

  const filterLabel = lang === 'de' ? 'Filter' : lang === 'it' ? 'Filtri' : 'Filter';
  const resetLabel  = lang === 'de' ? 'Filter zurücksetzen' : lang === 'it' ? 'Reimposta filtri' : 'Reset filters';

  if (loading && foodSections.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: c.tertiary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: c.background, opacity: screenOpacity }]}>
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: c.cream, borderColor: c.border }]}>
          <Ionicons name="search" size={16} color={c.tertiary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: c.primary }]}
            placeholder={lang === 'de' ? 'Suchen…' : lang === 'it' ? 'Cerca…' : 'Search…'}
            placeholderTextColor={c.tertiary}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={c.tertiary} />
            </Pressable>
          )}
        </View>

        <Pressable
          style={[
            styles.filterBtn,
            { backgroundColor: c.cream, borderColor: c.border },
            activeFilters.length > 0 && { backgroundColor: c.accent, borderColor: c.accent },
          ]}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons
            name={activeFilters.length > 0 ? 'funnel' : 'funnel-outline'}
            size={18}
            color={activeFilters.length > 0 ? c.white : c.secondary}
          />
          {activeFilters.length > 0 && (
            <View style={[styles.badge, { backgroundColor: c.accentMid, borderColor: c.surface }]}>
              <Text style={[styles.badgeText, { color: c.white }]}>{activeFilters.length}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {!query.trim() && (
        <View style={[styles.pillBar, { borderBottomColor: c.borderLight }]}>
          <ScrollView
            ref={pillScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillContent}
            scrollEventThrottle={16}
          >
            {allSections.map((s, idx) => {
              const active = activeCategory === s.id;
              return (
                <Pressable
                  key={s.id}
                  style={[
                    styles.pill,
                    { backgroundColor: c.cream, borderColor: c.border },
                    active && { backgroundColor: c.accent, borderColor: c.accent },
                  ]}
                  onPress={() => scrollToSection(idx)}
                  onLayout={(e) => {
                    pillOffsets.current[s.id] = {
                      x: e.nativeEvent.layout.x,
                      width: e.nativeEvent.layout.width,
                    };
                  }}
                >
                  <Ionicons name={s.icon as any} size={13} color={active ? c.white : c.secondary} />
                  <Text style={[styles.pillText, { color: c.secondary }, active && { color: c.white, fontWeight: '600' }]}>
                    {t.categories[s.categoryKey]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      <SectionList
        key={filterKey}
        ref={listRef}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index, section }) => (
          <FadeInView delay={index * 35} duration={280}>
            <MenuItemCard
              item={item}
              onPress={handleItemPress}
              icon={(section as SectionData).icon}
              gradientStart={(section as SectionData).gradientStart}
              gradientEnd={(section as SectionData).gradientEnd}
            />
          </FadeInView>
        )}
        renderSectionHeader={({ section }) => (
          <SectionHeader categoryKey={(section as SectionData).categoryKey} />
        )}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={({ viewableItems }) => {
          if (query.trim()) return;
          const top = viewableItems.find((vi) => vi.section);
          if (top?.section) setActiveCategory((top.section as any).id);
        }}
        viewabilityConfig={{ itemVisiblePercentThreshold: 20 }}
        contentContainerStyle={[
          styles.listContent,
          { backgroundColor: c.background },
          sections.length === 0 && { flex: 1 },
        ]}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="search-outline" size={40} color={c.border} />
            <Text style={[styles.emptyText, { color: c.tertiary }]}>
              {lang === 'de' ? 'Keine Ergebnisse' : lang === 'it' ? 'Nessun risultato' : 'No results'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={c.accent} />
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

      <ItemDetailScreen
        item={selectedItem}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  searchIcon: { flexShrink: 0 },
  searchInput: {
    flex: 1,
    ...typography.callout,
    padding: 0,
    margin: 0,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 12,
  },
  pillBar: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  pillContent: { paddingHorizontal: 14, gap: 7 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    ...typography.caption1,
    fontWeight: '500',
  },
  list: { flex: 1 },
  listContent: { paddingTop: 8, paddingBottom: 100 },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    ...typography.callout,
  },
});
