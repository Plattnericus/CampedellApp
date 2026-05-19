import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, SectionList, ScrollView, Pressable,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../i18n';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { FadeInView } from '../components/FadeInView';
import { MenuItemCard } from '../components/MenuItemCard';
import { SectionHeader } from '../components/SectionHeader';
import { FilterSheet, FilterGroup } from '../components/FilterSheet';
import { ItemDetailScreen } from './ItemDetailScreen';
import { foodSections, FoodItem } from '../data/food';
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
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('starters');
  const [query, setQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<MenuFilter[]>([]);
  const listRef = useRef<SectionList<any>>(null);

  const allSections: SectionData[] = foodSections.map((s) => ({
    id: s.id,
    categoryKey: s.categoryKey as keyof Translations['categories'],
    icon: s.icon,
    gradientStart: s.gradientStart,
    gradientEnd: s.gradientEnd,
    data: s.items,
  }));

  const filterGroups: FilterGroup[] = useMemo(() => [
    {
      title: lang === 'de' ? 'Ernährung' : lang === 'it' ? 'Alimentazione' : 'Diet',
      options: [
        {
          key: 'vegan',
          label: 'Vegan',
          icon: 'leaf',
          iconColor: '#15803d',
        },
        {
          key: 'vegetarian',
          label: lang === 'de' ? 'Vegetarisch' : lang === 'it' ? 'Vegetariano' : 'Vegetarian',
          icon: 'leaf-outline',
          iconColor: '#15803d',
        },
      ],
    },
    {
      title: lang === 'de' ? 'Ohne Allergene' : lang === 'it' ? 'Senza allergeni' : 'Allergen-free',
      options: [
        {
          key: 'no-gluten',
          label: lang === 'de' ? 'Glutenfrei' : lang === 'it' ? 'Senza glutine' : 'Gluten-free',
        },
        {
          key: 'no-dairy',
          label: lang === 'de' ? 'Laktosefrei' : lang === 'it' ? 'Senza lattosio' : 'Lactose-free',
        },
        {
          key: 'no-nuts',
          label: lang === 'de' ? 'Nussfrei' : lang === 'it' ? 'Senza noci' : 'Nut-free',
        },
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
  }, [query, lang, activeFilters]);

  const toggleFilter = (key: string) => {
    setActiveFilters((prev) =>
      prev.includes(key as MenuFilter)
        ? prev.filter((f) => f !== key)
        : [...prev, key as MenuFilter],
    );
  };

  const handleItemPress = (item: FoodItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const scrollToSection = (idx: number) => {
    setActiveCategory(allSections[idx].id);
    try {
      listRef.current?.scrollToLocation({
        sectionIndex: idx, itemIndex: 0, animated: true, viewOffset: 0,
      });
    } catch {}
  };

  const filterLabel = lang === 'de' ? 'Filter' : lang === 'it' ? 'Filtri' : 'Filter';
  const resetLabel  = lang === 'de' ? 'Filter zurücksetzen' : lang === 'it' ? 'Reimposta filtri' : 'Reset filters';

  return (
    <FadeInView style={styles.container}>
      {/* Search bar + filter button */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.tertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={lang === 'de' ? 'Suchen…' : lang === 'it' ? 'Cerca…' : 'Search…'}
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
            horizontal showsHorizontalScrollIndicator={false}
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
                  <Ionicons
                    name={s.icon as any}
                    size={13}
                    color={active ? colors.white : colors.secondary}
                  />
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
        renderItem={({ item, section }) => (
          <MenuItemCard
            item={item}
            onPress={handleItemPress}
            icon={(section as SectionData).icon}
            gradientStart={(section as SectionData).gradientStart}
            gradientEnd={(section as SectionData).gradientEnd}
          />
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
        contentContainerStyle={styles.listContent}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="search-outline" size={40} color={colors.border} />
            <Text style={styles.emptyText}>
              {lang === 'de' ? 'Keine Ergebnisse' : lang === 'it' ? 'Nessun risultato' : 'No results'}
            </Text>
          </View>
        }
      />

      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        title={filterLabel}
        groups={filterGroups}
        activeFilters={activeFilters}
        onToggle={toggleFilter}
        onReset={() => setActiveFilters([])}
        resetLabel={resetLabel}
      />

      <ItemDetailScreen
        item={selectedItem}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  pillContent: { paddingHorizontal: 14, gap: 7 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pillText: {
    ...typography.caption1,
    color: colors.secondary,
    fontWeight: '500',
  },
  pillTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  list: { flex: 1 },
  listContent: { backgroundColor: colors.background, paddingTop: 8, paddingBottom: 100 },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    ...typography.callout,
    color: colors.tertiary,
  },
});
