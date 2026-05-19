import { Platform } from 'react-native';

const fontFamily = Platform.OS === 'ios' ? 'System' : 'sans-serif';

export const typography = {
  largeTitle: {
    fontFamily,
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.37,
    lineHeight: 41,
  },
  title1: {
    fontFamily,
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.36,
    lineHeight: 34,
  },
  title2: {
    fontFamily,
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: 0.35,
    lineHeight: 28,
  },
  title3: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.38,
    lineHeight: 25,
  },
  headline: {
    fontFamily,
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.41,
    lineHeight: 22,
  },
  body: {
    fontFamily,
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: -0.41,
    lineHeight: 22,
  },
  callout: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: -0.32,
    lineHeight: 21,
  },
  subheadline: {
    fontFamily,
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: -0.24,
    lineHeight: 20,
  },
  footnote: {
    fontFamily,
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: -0.08,
    lineHeight: 18,
  },
  caption1: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 16,
  },
  caption2: {
    fontFamily,
    fontSize: 11,
    fontWeight: '400' as const,
    letterSpacing: 0.06,
    lineHeight: 13,
  },
  price: {
    fontFamily,
    fontSize: 17,
    fontWeight: '500' as const,
    letterSpacing: -0.41,
    lineHeight: 22,
  },
  priceSmall: {
    fontFamily,
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 18,
  },
};
