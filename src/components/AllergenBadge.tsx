import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Allergen } from '../data/food';
import { colors } from '../theme/colors';

const ABBR: Record<Allergen, string> = {
  gluten: 'G', dairy: 'D', eggs: 'E', nuts: 'N', fish: 'F',
  shellfish: 'Sh', soy: 'So', celery: 'C', mustard: 'M',
  sesame: 'Se', sulphites: 'Su', lupins: 'L', molluscs: 'Mo', peanuts: 'P',
};

interface Props { allergens: Allergen[] }

export const AllergenBadge: React.FC<Props> = ({ allergens }) => {
  if (!allergens || allergens.length === 0) return null;
  return (
    <View style={styles.row}>
      {allergens.map((a) => (
        <View key={a} style={styles.badge}>
          <Text style={styles.text}>{ABBR[a]}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 7 },
  badge: {
    backgroundColor: colors.accentLight,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    fontSize: 10, fontWeight: '700',
    color: colors.accentDark,
    letterSpacing: 0.3,
  },
});
