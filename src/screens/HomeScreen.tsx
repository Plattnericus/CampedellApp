import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Image, ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useLanguage } from '../i18n';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { FadeInView } from '../components/FadeInView';
import { foodSections } from '../data/food';
import { drinkSections } from '../data/drinks';
import { wineSections } from '../data/wines';

type TabParamList = {
  Home: undefined;
  Menu: undefined;
  Drinks: undefined;
  Wines: undefined;
};

interface Props {
  navigation: BottomTabNavigationProp<TabParamList, 'Home'>;
}

const WELCOME: Record<string, { title: string; sub: string; tag: string; tagline: string }> = {
  de: {
    title: 'Herzlich\nWillkommen',
    sub: 'Entdecken Sie unsere Speisekarte',
    tag: 'Genuss pur',
    tagline: 'Genießen Sie traditionelle Südtiroler Küche mit hofeigenen Produkten in gemütlicher Atmosphäre.',
  },
  it: {
    title: 'Benvenuti\nal Campedèl',
    sub: 'Scoprite il nostro menu',
    tag: 'Puro piacere',
    tagline: 'Godetevi la cucina tradizionale altoatesina con prodotti del maso in un\'atmosfera accogliente.',
  },
  en: {
    title: 'Welcome to\nCampedèl',
    sub: 'Explore our menu',
    tag: 'Pure pleasure',
    tagline: 'Enjoy traditional South Tyrolean cuisine with farm-fresh products in a cosy atmosphere.',
  },
};

const SECTION_LABELS: Record<string, Record<string, string>> = {
  de: { cards: 'Unsere Karten' },
  it: { cards: 'Le nostre carte' },
  en: { cards: 'Our menus' },
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { lang } = useLanguage();
  const w = WELCOME[lang] ?? WELCOME.de;
  const labels = SECTION_LABELS[lang] ?? SECTION_LABELS.de;

  const totalDishes  = foodSections.reduce((n, s) => n + s.items.length, 0);
  const totalDrinks  = drinkSections.reduce((n, s) => n + s.items.length, 0);
  const totalWines   = wineSections.reduce((n, s) => n + s.wines.length, 0);
  const drinkCats    = drinkSections.length;
  const foodGangs    = foodSections.length;

  const menuCards = [
    {
      icon: 'restaurant' as const,
      iconBg: colors.accentLight,
      iconColor: colors.accent,
      title: lang === 'de' ? 'Speisekarte' : lang === 'it' ? 'Menu' : 'Food Menu',
      sub: lang === 'de'
        ? `${foodGangs} Gänge · ${totalDishes} Gerichte`
        : lang === 'it'
        ? `${foodGangs} portate · ${totalDishes} piatti`
        : `${foodGangs} courses · ${totalDishes} dishes`,
      tab: 'Menu' as const,
    },
    {
      icon: 'cafe' as const,
      iconBg: colors.accentLight,
      iconColor: colors.accent,
      title: lang === 'de' ? 'Getränke' : lang === 'it' ? 'Bevande' : 'Drinks',
      sub: lang === 'de'
        ? `${drinkCats} Kategorien · ${totalDrinks} Getränke`
        : lang === 'it'
        ? `${drinkCats} categorie · ${totalDrinks} bevande`
        : `${drinkCats} categories · ${totalDrinks} drinks`,
      tab: 'Drinks' as const,
    },
    {
      icon: 'wine' as const,
      iconBg: colors.accentLight,
      iconColor: colors.accent,
      title: lang === 'de' ? 'Weinkarte' : lang === 'it' ? 'Carta dei Vini' : 'Wine List',
      sub: lang === 'de'
        ? `Südtiroler Auslese · ${totalWines} Weine`
        : lang === 'it'
        ? `Selezione altoatesina · ${totalWines} vini`
        : `South Tyrolean selection · ${totalWines} wines`,
      tab: 'Wines' as const,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <FadeInView duration={500}>
        <View style={styles.heroWrap}>
          <ImageBackground
            source={require('../../assets/restaurant.jpg')}
            style={styles.hero}
            imageStyle={styles.heroImg}
            resizeMode="cover"
          >
            <View style={styles.heroOverlay}>
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>{w.title}</Text>
                <Text style={styles.heroSub}>{w.sub}</Text>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>{w.tag}</Text>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>
      </FadeInView>

      {/* Unsere Karten */}
      <FadeInView delay={120} duration={400}>
        <Text style={styles.sectionTitle}>{labels.cards}</Text>
      </FadeInView>

      <View style={styles.cardList}>
        {menuCards.map((card, i) => (
          <FadeInView key={card.tab} delay={160 + i * 70} duration={380}>
            <Pressable
              style={({ pressed }) => [styles.menuCard, pressed && styles.menuCardPressed]}
              onPress={() => navigation.navigate(card.tab)}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: card.iconBg }]}>
                <Ionicons name={card.icon} size={26} color={card.iconColor} />
              </View>
              <View style={styles.menuCardMid}>
                <Text style={styles.menuCardTitle}>{card.title}</Text>
                <Text style={styles.menuCardSub}>{card.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.border} />
            </Pressable>
          </FadeInView>
        ))}
      </View>

      <View style={{ flex: 1, minHeight: 40 }} />

      {/* Slogan */}
      <FadeInView delay={400} duration={400}>
        <Text style={styles.slogan}>Campedèl · Seiser Alm · Südtirol</Text>
      </FadeInView>

      <View style={{ height: 110 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: 16 },

  heroWrap: {
    marginHorizontal: 16,
    marginBottom: 28,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 5,
  },
  hero: { width: '100%', height: 210 },
  heroImg: { borderRadius: 22 },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 10, 5, 0.48)',
    borderRadius: 22,
    justifyContent: 'flex-end',
    padding: 22,
  },
  heroContent: { gap: 6 },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  heroSub: {
    ...typography.callout,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroBadgeText: {
    ...typography.footnote,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  sectionTitle: {
    ...typography.title2,
    color: colors.primary,
    fontWeight: '800',
    marginHorizontal: 18,
    marginBottom: 14,
  },

  cardList: { gap: 10, marginHorizontal: 16, marginBottom: 28 },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: colors.primary,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  menuCardPressed: { opacity: 0.85 },
  menuIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuCardMid: { flex: 1 },
  menuCardTitle: {
    ...typography.callout,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 3,
  },
  menuCardSub: {
    ...typography.caption1,
    color: colors.tertiary,
    fontWeight: '500',
  },

  slogan: {
    ...typography.footnote,
    color: colors.tertiary,
    textAlign: 'center',
    letterSpacing: 0.6,
    marginHorizontal: 30,
    marginBottom: 20,
  },
});
