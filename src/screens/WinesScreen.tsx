import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, ScrollView, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../i18n';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { FadeInView } from '../components/FadeInView';
import { WineCard } from '../components/WineCard';
import { WineDetailScreen } from './WineDetailScreen';
import { wineSections, WineCategory, Wine, WINE_CATEGORY_META } from '../data/wines';

const CATS: WineCategory[] = ['sparkling', 'white', 'red'];

export const WinesScreen: React.FC = () => {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<WineCategory>('sparkling');
  const [query, setQuery] = useState('');
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const allWines = wineSections.find((s) => s.category === activeTab)?.wines ?? [];

  const wines: Wine[] = useMemo(() => {
    if (!query.trim()) return allWines;
    const q = query.toLowerCase();
    const descLang = lang === 'en' ? 'de' : lang as 'de' | 'it';
    return allWines.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.winery.toLowerCase().includes(q) ||
        w.region.toLowerCase().includes(q) ||
        w.description[descLang].toLowerCase().includes(q),
    );
  }, [query, activeTab, allWines]);

  const handleWinePress = (wine: Wine) => {
    setSelectedWine(wine);
    setDetailVisible(true);
  };

  const CAT_LABEL: Record<WineCategory, keyof typeof t.categories> = {
    sparkling: 'sparkling', white: 'white', red: 'red',
  };

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <FadeInView delay={80} duration={380}>
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
      </FadeInView>

      {/* Category pills — hidden while searching */}
      {!query.trim() && (
        <FadeInView delay={140} duration={380}>
          <View style={styles.pillBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillContent}
            >
              {CATS.map((cat) => {
                const active = activeTab === cat;
                const meta = WINE_CATEGORY_META[cat];
                return (
                  <Pressable
                    key={cat}
                    style={[styles.pill, active && styles.pillActive]}
                    onPress={() => { setActiveTab(cat); setQuery(''); }}
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
        </FadeInView>
      )}

      <FlatList
        key={activeTab + query}
        data={wines}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <FadeInView delay={index * 55} duration={340}>
            <WineCard wine={item} category={activeTab} onPress={handleWinePress} />
          </FadeInView>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="wine-outline" size={40} color={colors.border} />
            <Text style={styles.emptyText}>
              {lang === 'de' ? 'Keine Ergebnisse' : lang === 'it' ? 'Nessun risultato' : 'No results'}
            </Text>
          </View>
        }
      />

      <WineDetailScreen
        wine={selectedWine}
        category={activeTab}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
      />
    </View>
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
    paddingHorizontal: 14,
    paddingVertical: 8,
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
  list: { paddingTop: 14, paddingBottom: 100 },
  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { ...typography.callout, color: colors.tertiary },
});
