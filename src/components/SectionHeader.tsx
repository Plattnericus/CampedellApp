import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useLanguage } from '../i18n';
import { Translations } from '../i18n/de';

interface Props {
  categoryKey: keyof Translations['categories'];
}

export const SectionHeader: React.FC<Props> = ({ categoryKey }) => {
  const { t } = useLanguage();
  const label = t.categories[categoryKey] ?? categoryKey;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 4,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.caption1,
    color: colors.accentDark,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  line: {
    height: 1.5,
    backgroundColor: colors.accentLight,
    borderRadius: 1,
  },
});
