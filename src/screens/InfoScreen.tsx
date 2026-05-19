import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CampedelLogo } from '../components/CampedelLogo';
import { FadeInView } from '../components/FadeInView';
import { useLanguage } from '../i18n';
import { useColors } from '../theme/colors';
import { typography } from '../theme/typography';

export const InfoScreen: React.FC = () => {
  const { t } = useLanguage();
  const c = useColors();

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <FadeInView delay={0}>
        <LinearGradient
          colors={[c.accentLight, c.cream] as const}
          style={styles.hero}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <CampedelLogo size={100} color={c.primary} bgColor={c.cream} showText />
        </LinearGradient>
      </FadeInView>

      <FadeInView delay={120} style={[styles.quoteCard, { backgroundColor: c.surface, shadowColor: c.primary }]}>
        <Text style={[styles.quote, { color: c.secondary }]}>"{t.info.quote}"</Text>
        <Text style={[styles.quoteAuthor, { color: c.tertiary }]}>– {t.info.quoteAuthor}</Text>
      </FadeInView>

      <FadeInView delay={240} style={styles.section}>
        <Text style={[styles.sectionLabel, { color: c.accentDark }]}>Über uns</Text>
        <Text style={[styles.body, { color: c.secondary }]}>{t.info.description}</Text>
      </FadeInView>

      <FadeInView delay={340} style={[styles.contactCard, { backgroundColor: c.surface, shadowColor: c.primary }]}>
        <View style={styles.contactRow}>
          <View style={[styles.iconWrap, { backgroundColor: c.accent }]}>
            <Ionicons name="location" size={16} color={c.white} />
          </View>
          <Text style={[styles.contactText, { color: c.primary }]}>{t.info.address}</Text>
        </View>
        <View style={[styles.contactDivider, { backgroundColor: c.borderLight }]} />
        <View style={styles.contactRow}>
          <View style={[styles.iconWrap, { backgroundColor: c.accent }]}>
            <Ionicons name="globe" size={16} color={c.white} />
          </View>
          <Text style={[styles.contactText, styles.link, { color: c.accent }]}>{t.info.website}</Text>
        </View>
      </FadeInView>

      <FadeInView
        delay={440}
        style={[styles.allergenCard, { backgroundColor: c.accentLight, borderColor: c.accent + '30' }]}
      >
        <View style={styles.allergenRow}>
          <Ionicons name="information-circle" size={18} color={c.accent} />
          <Text style={[styles.allergenTitle, { color: c.accentDark }]}>
            Allergene / Allergeni / Allergens
          </Text>
        </View>
        <Text style={[styles.allergenBody, { color: c.secondary }]}>
          {`Allergene sind bei jedem Gericht mit Kürzeln gekennzeichnet (z.B. G = Gluten, D = Milch).\n\nGli allergeni sono indicati accanto a ogni piatto.\n\nAllergens are marked next to each dish. Ask our staff for details.`}
        </Text>
      </FadeInView>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingBottom: 40 },

  hero: {
    alignItems: 'center',
    paddingVertical: 44,
    paddingHorizontal: 24,
  },

  quoteCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 18,
    padding: 22,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
  quote: {
    ...typography.callout,
    fontStyle: 'italic',
    lineHeight: 25,
    marginBottom: 10,
  },
  quoteAuthor: {
    ...typography.caption1,
    letterSpacing: 0.3,
  },

  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionLabel: {
    ...typography.caption1,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  body: {
    ...typography.callout,
    lineHeight: 24,
  },

  contactCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 18,
    overflow: 'hidden',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    ...typography.callout,
    flex: 1,
  },
  link: {
    fontWeight: '500',
  },
  contactDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 62,
  },

  allergenCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
  },
  allergenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  allergenTitle: {
    ...typography.subheadline,
    fontWeight: '700',
  },
  allergenBody: {
    ...typography.footnote,
    lineHeight: 19,
  },
});
