import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CampedelLogo } from '../components/CampedelLogo';
import { FadeInView } from '../components/FadeInView';
import { useLanguage } from '../i18n';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export const InfoScreen: React.FC = () => {
  const { t } = useLanguage();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <FadeInView delay={0}>
        <LinearGradient
          colors={[colors.accentLight, colors.cream] as const}
          style={styles.hero}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <CampedelLogo
            size={100}
            color={colors.primary}
            bgColor={colors.cream}
            showText
          />
        </LinearGradient>
      </FadeInView>

      {/* Quote */}
      <FadeInView delay={120} style={styles.quoteCard}>
        <Text style={styles.quote}>"{t.info.quote}"</Text>
        <Text style={styles.quoteAuthor}>– {t.info.quoteAuthor}</Text>
      </FadeInView>

      {/* About */}
      <FadeInView delay={240} style={styles.section}>
        <Text style={styles.sectionLabel}>Über uns</Text>
        <Text style={styles.body}>{t.info.description}</Text>
      </FadeInView>

      {/* Address */}
      <FadeInView delay={340} style={styles.contactCard}>
        <View style={styles.contactRow}>
          <View style={styles.iconWrap}>
            <Ionicons name="location" size={16} color={colors.white} />
          </View>
          <Text style={styles.contactText}>{t.info.address}</Text>
        </View>
        <View style={styles.contactDivider} />
        <View style={styles.contactRow}>
          <View style={styles.iconWrap}>
            <Ionicons name="globe" size={16} color={colors.white} />
          </View>
          <Text style={[styles.contactText, styles.link]}>{t.info.website}</Text>
        </View>
      </FadeInView>

      {/* Allergen notice */}
      <FadeInView delay={440} style={styles.allergenCard}>
        <View style={styles.allergenRow}>
          <Ionicons name="information-circle" size={18} color={colors.accent} />
          <Text style={styles.allergenTitle}>Allergene / Allergeni / Allergens</Text>
        </View>
        <Text style={styles.allergenBody}>
          {`Allergene sind bei jedem Gericht mit Kürzeln gekennzeichnet (z.B. G = Gluten, D = Milch).\n\nGli allergeni sono indicati accanto a ogni piatto.\n\nAllergens are marked next to each dish. Ask our staff for details.`}
        </Text>
      </FadeInView>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },

  hero: {
    alignItems: 'center',
    paddingVertical: 44,
    paddingHorizontal: 24,
  },

  quoteCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 22,
    shadowColor: colors.primary,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
  quote: {
    ...typography.callout,
    color: colors.secondary,
    fontStyle: 'italic',
    lineHeight: 25,
    marginBottom: 10,
  },
  quoteAuthor: {
    ...typography.caption1,
    color: colors.tertiary,
    letterSpacing: 0.3,
  },

  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionLabel: {
    ...typography.caption1,
    color: colors.accentDark,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  body: {
    ...typography.callout,
    color: colors.secondary,
    lineHeight: 24,
  },

  contactCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: colors.primary,
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
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    ...typography.callout,
    color: colors.primary,
    flex: 1,
  },
  link: {
    color: colors.accent,
    fontWeight: '500',
  },
  contactDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
    marginLeft: 62,
  },

  allergenCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: colors.accentLight,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  allergenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  allergenTitle: {
    ...typography.subheadline,
    color: colors.accentDark,
    fontWeight: '700',
  },
  allergenBody: {
    ...typography.footnote,
    color: colors.secondary,
    lineHeight: 19,
  },
});
