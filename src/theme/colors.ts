import { useTheme } from './ThemeContext';

export const lightColors = {
  background: '#FAF6F1',
  surface:    '#FFFFFF',
  cream:      '#F2EAE0',
  creamDark:  '#E5D7CA',
  shadow:     '#1A1208',

  accent:      '#7EA13B',
  accentLight: '#EEF5DC',
  accentDark:  '#587129',
  accentMid:   '#6B8932',

  primary:   '#1A1208',
  secondary: '#4A3828',
  tertiary:  '#9A8476',

  border:      '#DDD0C4',
  borderLight: '#EDE4DC',

  white:   '#FFFFFF',
  black:   '#000000',
  overlay: 'rgba(26, 18, 8, 0.50)',

  success: '#2D6A4F',
  error:   '#C0392B',
} as const;

export const darkColors = {
  background: '#1A1208',
  surface:    '#251A0C',
  cream:      '#2E2010',
  creamDark:  '#3A2A1A',
  shadow:     'transparent',

  accent:      '#90BC40',
  accentLight: '#243210',
  accentDark:  '#7EA13B',
  accentMid:   '#7EA13B',

  primary:   '#F5EDE0',
  secondary: '#C4A882',
  tertiary:  '#7A6A54',

  border:      '#3C2C1C',
  borderLight: '#2E2010',

  white:   '#FFFFFF',
  black:   '#000000',
  overlay: 'rgba(0, 0, 0, 0.65)',

  success: '#3A8A60',
  error:   '#D44030',
} as const;

// Static export kept for backward compat (always light)
export const colors = lightColors;

export type AppColors = {
  readonly [K in keyof typeof lightColors]: string;
};

export const useColors = (): AppColors => {
  const { isDark } = useTheme();
  return (isDark ? darkColors : lightColors) as AppColors;
};
