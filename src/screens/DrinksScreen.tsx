import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, SectionList, ScrollView, Pressable, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../i18n';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { FadeInView } from '../components/FadeInView';
import { SectionHeader } from '../components/SectionHeader';
import { drinkSections, DrinkItem } from '../data/drinks';
import { Translations } from '../i18n/de';

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
  const [activeCategory, setActiveCategory] = useState('hotDrinks');
  const [query, setQuery] = useState('');
  const listRef = useRef<SectionList<any>>(null);

  const allSections = drinkSections.map((s) => ({
    id: s.id,
    categoryKey: s.categoryKey as keyof Translations['categories'],
    data: s.items,
  }));

  const sections = useMemo(() => {
    if (!query.trim()) return allSections;
    const q = query.toLowerCase();
    return allSections
      .map((s) => ({
        ...s,
        data: s.data.filter((item) => item.name[lang].toLowerCase().includes(q)),
      }))
      .filter((s) => s.data.length > 0);
  }, [query, lang]);

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
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="search-outline" size={40} color={colors.border} />
            <Text style={styles.emptyText}>
              {lang === 'de' ? 'Keine Ergebnisse' : lang === 'it' ? 'Nessun risultato' : 'No results'}
            </Text>
          </View>
        }
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
  listContent: { backgroundColor: colors.surface, paddingBottom: 100 },
  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 12, backgroundColor: colors.background },
  emptyText: { ...typography.callout, color: colors.tertiary },
});
