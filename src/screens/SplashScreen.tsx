import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CampedelLogo } from '../components/CampedelLogo';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { useLanguage } from '../i18n';
import { useColors } from '../theme/colors';
import { typography } from '../theme/typography';

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useLanguage();
  const c = useColors();

  const logoOpacity   = useRef(new Animated.Value(0)).current;
  const logoScale     = useRef(new Animated.Value(0.8)).current;
  const lineWidth     = useRef(new Animated.Value(0)).current;
  const quoteOpacity  = useRef(new Animated.Value(0)).current;
  const langOpacity   = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true }),
      ]),
      Animated.timing(lineWidth, { toValue: 1, duration: 500, useNativeDriver: false }),
      Animated.timing(quoteOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(langOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(screenOpacity, {
        toValue: 0, duration: 500, useNativeDriver: true,
      }).start(() => navigation.replace('Main'));
    }, 3400);

    return () => clearTimeout(timer);
  }, []);

  const animatedLineWidth = lineWidth.interpolate({
    inputRange: [0, 1], outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: c.background, opacity: screenOpacity }]}>
      <View style={styles.topRight}>
        <ThemeSwitcher />
      </View>
      <Animated.View
        style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
      >
        <CampedelLogo size={110} color={c.primary} bgColor={c.background} showText />
      </Animated.View>

      <View style={[styles.lineContainer, { backgroundColor: c.borderLight }]}>
        <Animated.View style={[styles.line, { backgroundColor: c.accent, width: animatedLineWidth }]} />
      </View>

      <Animated.View style={[styles.quoteWrap, { opacity: quoteOpacity }]}>
        <Text style={[styles.quote, { color: c.secondary }]}>{t.info.quote}</Text>
        <Text style={[styles.quoteAuthor, { color: c.tertiary }]}>{t.info.quoteAuthor}</Text>
      </Animated.View>

      <Animated.View style={[styles.langWrap, { opacity: langOpacity }]}>
        <LanguageSwitcher />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 44,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 40,
  },
  lineContainer: {
    width: '60%',
    height: 1.5,
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: 28,
  },
  line: {
    height: '100%',
    borderRadius: 1,
  },
  quoteWrap: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  quote: {
    ...typography.callout,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  quoteAuthor: {
    ...typography.caption1,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  langWrap: {
    marginTop: 36,
  },
  topRight: {
    position: 'absolute',
    top: 56,
    right: 20,
  },
});
