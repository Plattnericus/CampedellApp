export const colors = {
  // Core backgrounds — warm ivory tones (Südtirol / natural feel)
  background: '#FAF6F1',     // warm ivory – main app background
  surface:    '#FFFFFF',     // pure white – cards & bottom sheets
  cream:      '#F2EAE0',     // warm cream – pill backgrounds, inactive states
  creamDark:  '#E5D7CA',     // deeper cream – pressed states

  // Brand / accent — mountain green (Südtirol alpine feel)
  accent:      '#7EA13B',    // fresh green – primary brand color
  accentLight: '#EEF5DC',    // very light green – tint backgrounds
  accentDark:  '#587129',    // dark forest green – text on light backgrounds
  accentMid:   '#6B8932',    // medium green – icons, highlights

  // Text — warm dark brown tones (warm, readable, not cold black)
  primary:   '#1A1208',      // near-black warm brown – headings & titles
  secondary: '#4A3828',      // warm medium brown – body text
  tertiary:  '#9A8476',      // warm taupe – captions, secondary labels

  // Borders & dividers
  border:      '#DDD0C4',    // warm beige border
  borderLight: '#EDE4DC',    // very subtle warm divider

  // Utility
  white:   '#FFFFFF',
  black:   '#000000',
  overlay: 'rgba(26, 18, 8, 0.50)',

  // Semantic
  success: '#2D6A4F',
  error:   '#C0392B',
} as const;
