import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Image, Animated, Easing, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { useLanguage } from '../i18n';
import { useColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { FadeInView } from '../components/FadeInView';
import { useAppContent } from '../data/DataContext';

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

const HERO_IMAGES = [
  require('../../assets/restaurant.jpg'),
  require('../../assets/restaurant2.webp'),
  require('../../assets/restaurant3.jpeg'),
];
const SLIDE_INTERVAL = 6500;
const FADE_DURATION  = 1300;

interface HeroSlideshowProps { children: React.ReactNode }

const HeroSlideshow: React.FC<HeroSlideshowProps> = ({ children }) => {
  const opacities = useRef(
    HERO_IMAGES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))
  ).current;
  const scales = useRef(HERO_IMAGES.map(() => new Animated.Value(1))).current;
  const dotWidths    = useRef(HERO_IMAGES.map((_, i) => new Animated.Value(i === 0 ? 18 : 6))).current;
  const dotOpacities = useRef(HERO_IMAGES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0.35))).current;
  const currentIdxRef = useRef(0);

  const startKenBurns = (idx: number) => {
    scales[idx].setValue(1);
    Animated.timing(scales[idx], {
      toValue: 1.08,
      duration: SLIDE_INTERVAL + FADE_DURATION,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const animateDots = (from: number, to: number) => {
    Animated.parallel([
      Animated.timing(dotWidths[from],    { toValue: 6,    duration: 350, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      Animated.timing(dotOpacities[from], { toValue: 0.35, duration: 350, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      Animated.timing(dotWidths[to],      { toValue: 18,   duration: 350, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      Animated.timing(dotOpacities[to],   { toValue: 1,    duration: 350, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
    ]).start();
  };

  useEffect(() => {
    startKenBurns(0);
    const id = setInterval(() => {
      const from = currentIdxRef.current;
      const to   = (from + 1) % HERO_IMAGES.length;
      startKenBurns(to);
      animateDots(from, to);
      Animated.parallel([
        Animated.timing(opacities[from], { toValue: 0, duration: FADE_DURATION, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacities[to],   { toValue: 1, duration: FADE_DURATION, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]).start(() => { currentIdxRef.current = to; });
    }, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={heroStyles.wrap}>
      {HERO_IMAGES.map((source, i) => (
        <Animated.Image
          key={i}
          source={source}
          style={[heroStyles.image, { opacity: opacities[i], transform: [{ scale: scales[i] }] }]}
          resizeMode="cover"
        />
      ))}
      <View style={heroStyles.overlay}>
        <View style={heroStyles.textWrap}>{children}</View>
        <View style={heroStyles.dots}>
          {HERO_IMAGES.map((_, i) => (
            <Animated.View
              key={i}
              style={[heroStyles.dot, { width: dotWidths[i], opacity: dotOpacities[i] }]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const heroStyles = StyleSheet.create({
  wrap: {
    height: 240,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#0E0B06',
  },
  image: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20,10,5,0.48)',
    justifyContent: 'space-between',
    padding: 22,
    paddingBottom: 16,
  },
  textWrap: { gap: 6, justifyContent: 'flex-end', flex: 1 },
  dots: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'flex-end',
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
});

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { lang } = useLanguage();
  const c = useColors();
  const { foodSections, drinkSections, wineSections, loading, refreshData } = useAppContent();
  const w = WELCOME[lang] ?? WELCOME.de;
  const labels = SECTION_LABELS[lang] ?? SECTION_LABELS.de;

  const scrollRef    = useRef<ScrollView>(null);
  const screenOpacity = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => {
    Animated.timing(screenOpacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    return () => screenOpacity.setValue(0);
  }, []));

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await refreshData(); } finally { setRefreshing(false); }
  };

  const totalDishes  = foodSections?.reduce((n, s) => n + s.items.length, 0) || 0;
  const totalDrinks  = drinkSections?.reduce((n, s) => n + s.items.length, 0) || 0;
  const totalWines   = wineSections?.reduce((n, s) => n + s.wines.length, 0) || 0;
  const drinkCats    = drinkSections?.length || 0;
  const foodGangs    = foodSections?.length || 0;

  const menuCards = [
    {
      icon: 'restaurant' as const,
      iconBg: c.accentLight,
      iconColor: c.accent,
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
      iconBg: c.accentLight,
      iconColor: c.accent,
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
      iconBg: c.accentLight,
      iconColor: c.accent,
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
    <Animated.View style={{ flex: 1, opacity: screenOpacity }}>
      <ScrollView
        ref={scrollRef}
        style={[styles.container, { backgroundColor: c.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={c.accent} />
        }
      >
        <FadeInView duration={500}>
          <View style={[styles.heroWrap, { shadowColor: c.shadow }]}>
            <HeroSlideshow>
              <Text style={styles.heroTitle}>{w.title}</Text>
              <Text style={styles.heroSub}>{w.sub}</Text>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{w.tag}</Text>
              </View>
            </HeroSlideshow>
          </View>
        </FadeInView>

        <FadeInView delay={120} duration={400}>
          <Text style={[styles.sectionTitle, { color: c.primary }]}>{labels.cards}</Text>
        </FadeInView>

        <View style={styles.cardList}>
          {menuCards.map((card, i) => (
            <FadeInView key={card.tab} delay={160 + i * 70} duration={380}>
              <Pressable
                style={({ pressed }) => [
                  styles.menuCard,
                  { backgroundColor: c.surface, shadowColor: c.shadow },
                  pressed && styles.menuCardPressed,
                ]}
                onPress={() => navigation.navigate(card.tab)}
              >
                <View style={[styles.menuIconWrap, { backgroundColor: card.iconBg }]}>
                  <Ionicons name={card.icon} size={26} color={card.iconColor} />
                </View>
                <View style={styles.menuCardMid}>
                  <Text style={[styles.menuCardTitle, { color: c.primary }]}>{card.title}</Text>
                  <Text style={[styles.menuCardSub, { color: c.tertiary }]}>{card.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={c.border} />
              </Pressable>
            </FadeInView>
          ))}
        </View>

        <View style={{ flex: 1, minHeight: 40 }} />

        <FadeInView delay={400} duration={400}>
          <Text style={[styles.slogan, { color: c.tertiary }]}>Campedèl · Seiser Alm · Südtirol</Text>
        </FadeInView>

        <View style={{ height: 110 }} />
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 16 },

  heroWrap: {
    marginHorizontal: 16,
    marginBottom: 28,
    borderRadius: 22,
    overflow: 'hidden',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 5,
  },
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
    fontWeight: '800',
    marginHorizontal: 18,
    marginBottom: 14,
  },

  cardList: { gap: 10, marginHorizontal: 16, marginBottom: 28 },
  menuCard: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
    fontWeight: '700',
    marginBottom: 3,
  },
  menuCardSub: {
    ...typography.caption1,
    fontWeight: '500',
  },

  slogan: {
    ...typography.footnote,
    textAlign: 'center',
    letterSpacing: 0.6,
    marginHorizontal: 30,
    marginBottom: 20,
  },
});
