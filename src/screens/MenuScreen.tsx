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

export const MenuScreen: React.FC = () => {
  const { t, lang } = useLanguage();
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('starters');
  const [query, setQuery] = useState('');
  const listRef = useRef<SectionList<any>>(null);

  const allSections: SectionData[] = foodSections.map((s) => ({
    id: s.id,
    categoryKey: s.categoryKey as keyof Translations['categories'],
    icon: s.icon,
    gradientStart: s.gradientStart,
    gradientEnd: s.gradientEnd,
    data: s.items,
  }));

  const sections: SectionData[] = useMemo(() => {
    if (!query.trim()) return allSections;
    const q = query.toLowerCase();
    return allSections
      .map((s) => ({
        ...s,
        data: s.data.filter(
          (item) =>
            item.name[lang].toLowerCase().includes(q) ||
            (item.description?.[lang]?.toLowerCase().includes(q) ?? false),
        ),
      }))
      .filter((s) => s.data.length > 0);
  }, [query, lang]);

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

  return (
    <FadeInView style={styles.container}>
      {/* Search bar */}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
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
