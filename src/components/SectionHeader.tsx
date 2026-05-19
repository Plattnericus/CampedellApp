import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useLanguage } from '../i18n';
import { Translations } from '../i18n/de';

interface Props {
  categoryKey: keyof Translations['categories'];
}

export const SectionHeader: React.FC<Props> = ({ categoryKey }) => {
  const { t } = useLanguage();
  const c = useColors();
  const label = t.categories[categoryKey] ?? categoryKey;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Text style={[styles.title, { color: c.accentDark }]}>{label}</Text>
      <View style={[styles.line, { backgroundColor: c.accentLight }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 4,
  },
  title: {
    ...typography.caption1,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  line: {
    height: 1.5,
    borderRadius: 1,
  },
});
