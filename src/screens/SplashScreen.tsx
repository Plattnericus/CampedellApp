import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CampedelLogo } from '../components/CampedelLogo';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useLanguage } from '../i18n';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useLanguage();

  const logoOpacity   = useRef(new Animated.Value(0)).current;
  const logoScale     = useRef(new Animated.Value(0.8)).current;
  const lineWidth     = useRef(new Animated.Value(0)).current;
  const quoteOpacity  = useRef(new Animated.Value(0)).current;
  const langOpacity   = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo appears
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1, duration: 800, useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1, friction: 7, tension: 50, useNativeDriver: true,
        }),
      ]),
      // Gold line expands
      Animated.timing(lineWidth, {
        toValue: 1, duration: 500, useNativeDriver: false,
      }),
      // Quote fades in
      Animated.timing(quoteOpacity, {
        toValue: 1, duration: 600, useNativeDriver: true,
      }),
      // Language switcher
      Animated.timing(langOpacity, {
        toValue: 1, duration: 400, useNativeDriver: true,
      }),
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
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      {/* Logo */}
      <Animated.View
        style={[
          styles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <CampedelLogo
          size={110}
          color={colors.primary}
          bgColor={colors.background}
          showText
        />
      </Animated.View>

      {/* Animated divider */}
      <View style={styles.lineContainer}>
        <Animated.View style={[styles.line, { width: animatedLineWidth }]} />
      </View>

      {/* Quote */}
      <Animated.View style={[styles.quoteWrap, { opacity: quoteOpacity }]}>
        <Text style={styles.quote}>{t.info.quote}</Text>
        <Text style={styles.quoteAuthor}>{t.info.quoteAuthor}</Text>
      </Animated.View>

      {/* Language picker */}
      <Animated.View style={[styles.langWrap, { opacity: langOpacity }]}>
        <LanguageSwitcher />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.borderLight,
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: 28,
  },
  line: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 1,
  },
  quoteWrap: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  quote: {
    ...typography.callout,
    color: colors.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  quoteAuthor: {
    ...typography.caption1,
    color: colors.tertiary,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  langWrap: {
    marginTop: 36,
  },
});
