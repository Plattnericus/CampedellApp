import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useLanguage } from '../i18n';
import { Wine, WineCategory, WINE_CATEGORY_META } from '../data/wines';

interface Props {
  wine: Wine;
  category: WineCategory;
  onPress: (wine: Wine) => void;
}

const GRAPE_FULL: Record<string, string> = {
  CH: 'Chardonnay', ME: 'Merlot', LA: 'Lagrein', CS: 'Cab. Sauvignon',
  CF: 'Cab. Franc', PN: 'Pinot Nero', PB: 'Pinot Bianco', SB: 'Sauvignon Blanc',
  RI: 'Riesling', VT: 'Vernatsch', CRE: 'Carménère', CV: 'Corvina',
  RON: 'Rondinella', MOL: 'Molinara',
};

export const WineCard: React.FC<Props> = ({ wine, category, onPress }) => {
  const { lang, t } = useLanguage();
  const scale = useRef(new Animated.Value(1)).current;
  const bg    = useRef(new Animated.Value(0)).current;
  const meta  = WINE_CATEGORY_META[category];
  const [imgError, setImgError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const remoteUrl = wine.imageUrl;
  const desc  = wine.description[lang === 'en' ? 'de' : lang];

  const handleImageError = () => {
    if (retryCount < 2) {
      setTimeout(() => setRetryCount(c => c + 1), 1500 * (retryCount + 1));
    } else {
      setImgError(true);
    }
  };

  const handlePressIn = () => {
    Haptics.selectionAsync();
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, friction: 12 }),
      Animated.timing(bg, { toValue: 1, duration: 80, useNativeDriver: false }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8 }),
      Animated.timing(bg, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start();
  };

  const bgColor = bg.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surface, colors.accentLight],
  });

  const fmt = (p: number) => `${p.toFixed(2).replace('.', ',')} €`;

  const mainPrice = wine.prices.bottle
    ? `${fmt(wine.prices.bottle)}`
    : wine.prices.liter
    ? `${fmt(wine.prices.liter)} / L`
    : wine.prices.glass
    ? `${fmt(wine.prices.glass)} Glas`
    : '';

  return (
    <Animated.View style={[styles.cardWrap, { transform: [{ scale }] }]}>
      <Animated.View style={[styles.card, { backgroundColor: bgColor }]}>
        <Pressable
          onPress={() => onPress(wine)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.inner}
        >
          {/* Thumbnail */}
          {remoteUrl && !imgError ? (
            <Image
              key={retryCount}
              source={{ uri: remoteUrl }}
              style={styles.thumbImage}
              resizeMode="cover"
              onError={handleImageError}
            />
          ) : (
            <LinearGradient
              colors={[meta.gradientStart, meta.gradientEnd] as const}
              style={styles.thumb}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name={meta.icon as any} size={26} color="rgba(255,255,255,0.9)" />
            </LinearGradient>
          )}

          {/* Text */}
          <View style={styles.mid}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>{wine.name}</Text>
              {wine.isOrganic && (
                <View style={styles.bioBadge}>
                  <Ionicons name="leaf" size={9} color="#15803d" />
                </View>
              )}
            </View>
            <Text style={styles.winery} numberOfLines={1}>{wine.winery}</Text>
            {desc ? (
              <Text style={styles.desc} numberOfLines={2}>{desc}</Text>
            ) : null}
            {wine.grapes && wine.grapes.length > 0 && (
              <View style={styles.grapeRow}>
                {wine.grapes.slice(0, 3).map((g) => (
                  <View key={g} style={styles.grapeChip}>
                    <Text style={styles.grapeText}>{GRAPE_FULL[g] ?? g}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Price + chevron */}
          <View style={styles.rightCol}>
            <Text style={styles.price}>{mainPrice}</Text>
            {wine.prices.glass && wine.prices.bottle && (
              <Text style={styles.priceSub}>{fmt(wine.prices.glass)} Glas</Text>
            )}
            <Ionicons name="chevron-forward" size={14} color={colors.border} style={styles.chevron} />
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrap: {
    marginHorizontal: 14,
    marginBottom: 10,
    borderRadius: 18,
    shadowColor: colors.primary,
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 13,
    alignItems: 'center',
  },
  thumb: {
    width: 58,
    height: 58,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  thumbImage: {
    width: 58,
    height: 58,
    borderRadius: 14,
    flexShrink: 0,
  },
  mid: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  name: {
    ...typography.callout,
    color: colors.primary,
    fontWeight: '600',
    flex: 1,
  },
  bioBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  winery: {
    ...typography.caption1,
    color: colors.secondary,
    fontWeight: '500',
    marginBottom: 3,
  },
  desc: {
    ...typography.caption1,
    color: colors.tertiary,
    lineHeight: 17,
    marginBottom: 4,
  },
  grapeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  grapeChip: {
    backgroundColor: colors.accentLight,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  grapeText: {
    ...typography.caption2,
    color: colors.accentDark,
    fontWeight: '600',
  },
  rightCol: {
    alignItems: 'flex-end',
    flexShrink: 0,
    gap: 1,
  },
  price: {
    ...typography.subheadline,
    color: colors.accent,
    fontWeight: '700',
  },
  priceSub: {
    ...typography.caption1,
    color: colors.accentDark,
    fontWeight: '500',
  },
  chevron: {
    marginTop: 4,
  },
});
