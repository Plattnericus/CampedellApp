export type WineCategory = 'sparkling' | 'white' | 'red';

export interface WinePrice {
  bottle?: number;
  glass?: number;
  quarterLiter?: number;
  halfLiter?: number;
  liter?: number;
}

export interface Wine {
  id: string;
  name: string;
  winery: string;
  region: string;
  doc: string;
  dryness: 'trocken' | 'halbtrocken' | 'lieblich';
  grapes?: string[];
  description: { de: string; it: string };
  prices: WinePrice;
  awards?: string[];
  isOrganic?: boolean;
  isLocal?: boolean;
  // Schlüssel für wineImages in wineImageMap.ts (z. B. "lagrein")
  image?: string;
}

export interface WineSection {
  category: WineCategory;
  wines: Wine[];
}

// Gradient + Icon pro Kategorie
export const WINE_CATEGORY_META: Record<WineCategory, {
  icon: string;
  gradientStart: string;
  gradientEnd: string;
}> = {
  sparkling: { icon: 'sparkles',      gradientStart: '#FFF9E6', gradientEnd: '#FFE066' },
  white:     { icon: 'wine-outline',  gradientStart: '#F3FCE8', gradientEnd: '#B5D99C' },
  red:       { icon: 'wine',          gradientStart: '#FCE4EC', gradientEnd: '#EF9A9A' },
};
