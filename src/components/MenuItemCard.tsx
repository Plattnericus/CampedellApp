import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useLanguage } from '../i18n';
import { FoodItem } from '../data/food';
import { foodImages } from '../data/imageMap';
import { AllergenBadge } from './AllergenBadge';

interface Props {
  item: FoodItem;
  onPress: (item: FoodItem) => void;
  icon: string;
  gradientStart: string;
  gradientEnd: string;
}

export const MenuItemCard: React.FC<Props> = ({
  item,
  onPress,
  icon,
  gradientStart,
  gradientEnd,
}) => {
  const { lang } = useLanguage();
  const scale = useRef(new Animated.Value(1)).current;
  const bg    = useRef(new Animated.Value(0)).current;

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

  const formatPrice = (p: number) => `${p.toFixed(2).replace('.', ',')} €`;
  const realImage = foodImages[item.image ?? item.id];

  return (
    <Animated.View style={[styles.cardWrap, { transform: [{ scale }] }]}>
      <Animated.View style={[styles.card, { backgroundColor: bgColor }]}>
        <Pressable
          onPress={() => onPress(item)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.inner}
        >
          {/* Thumbnail */}
          {realImage ? (
            <Image source={realImage} style={styles.thumbImage} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={[gradientStart, gradientEnd] as const}
              style={styles.thumb}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name={icon as any} size={26} color="rgba(255,255,255,0.9)" />
            </LinearGradient>
          )}

          {/* Text */}
          <View style={styles.mid}>
            <Text style={styles.name} numberOfLines={2}>{item.name[lang]}</Text>
            {item.description && (
              <Text style={styles.desc} numberOfLines={2}>
                {item.description[lang]}
              </Text>
            )}
            <View style={styles.tags}>
              {item.isVegetarian && !item.isVegan && (
                <View style={styles.vegBadge}>
                  <Ionicons name="leaf" size={8} color="#15803d" />
                  <Text style={styles.vegText}>V</Text>
                </View>
              )}
              {item.isVegan && (
                <View style={[styles.vegBadge, styles.veganBadge]}>
                  <Ionicons name="leaf" size={8} color="#047857" />
                  <Text style={[styles.vegText, { color: '#047857' }]}>VE</Text>
                </View>
              )}
              {item.allergens && item.allergens.length > 0 && (
                <AllergenBadge allergens={item.allergens} />
              )}
            </View>
          </View>

          {/* Price + chevron */}
          <View style={styles.rightCol}>
            <Text style={styles.price}>{formatPrice(item.price)}</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.border} />
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
  name: {
    ...typography.callout,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 3,
    lineHeight: 20,
  },
  desc: {
    ...typography.caption1,
    color: colors.tertiary,
    lineHeight: 17,
    marginBottom: 5,
  },
  rightCol: {
    alignItems: 'center',
    flexShrink: 0,
    gap: 4,
  },
  price: {
    ...typography.subheadline,
    color: colors.accent,
    fontWeight: '700',
  },
  tags: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  vegBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#dcfce7',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  veganBadge: { backgroundColor: '#d1fae5' },
  vegText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#15803d',
    letterSpacing: 0.3,
  },
});
