import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLanguage, Language } from '../i18n';
import { useColors } from '../theme/colors';
import { typography } from '../theme/typography';

const LANGS: Language[] = ['de', 'it', 'en'];
const LABELS: Record<Language, string> = { de: 'DE', it: 'IT', en: 'EN' };
const BTN_W  = 44;
const BTN_H  = 34;
const PAD    = 3;

export const LanguageSwitcher: React.FC = () => {
  const { lang, setLang } = useLanguage();
  const c = useColors();
  const pillX    = useRef(new Animated.Value(LANGS.indexOf(lang) * BTN_W)).current;
  const pillScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(pillX, {
        toValue: LANGS.indexOf(lang) * BTN_W,
        useNativeDriver: true,
        friction: 7,
        tension: 120,
      }),
      Animated.sequence([
        Animated.timing(pillScale, {
          toValue: 0.88, duration: 80, useNativeDriver: true,
        }),
        Animated.spring(pillScale, {
          toValue: 1, friction: 6, tension: 160, useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [lang]);

  const handlePress = (l: Language) => {
    Haptics.selectionAsync();
    setLang(l);
  };

  return (
    <View style={[styles.track, { backgroundColor: c.cream, borderColor: c.border }]}>
      <Animated.View
        style={[
          styles.pill,
          {
            backgroundColor: c.accent,
            shadowColor: c.shadow,
            transform: [
              { translateX: pillX },
              { scale: pillScale },
            ],
          },
        ]}
      />
      {LANGS.map((l) => {
        const active = lang === l;
        return (
          <Pressable
            key={l}
            style={styles.btn}
            onPress={() => handlePress(l)}
            hitSlop={6}
          >
            <Text style={[styles.label, { color: c.tertiary }, active && styles.labelActive]}>
              {LABELS[l]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: PAD,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
  },
  pill: {
    position: 'absolute',
    left: PAD,
    top: PAD + Math.round((BTN_H - (BTN_H - PAD * 2)) / 2),
    width: BTN_W,
    height: BTN_H - PAD * 2,
    borderRadius: 9,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  btn: {
    width: BTN_W,
    height: BTN_H,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    ...typography.caption1,
    fontWeight: '600',
    letterSpacing: 0.8,
    fontSize: 12,
  },
  labelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
