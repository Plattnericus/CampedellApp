import menuData from './menu.json';

export type Allergen =
  | 'gluten' | 'dairy' | 'eggs' | 'nuts' | 'fish'
  | 'shellfish' | 'soy' | 'celery' | 'mustard' | 'sesame'
  | 'sulphites' | 'lupins' | 'molluscs' | 'peanuts';

export interface FoodItem {
  id: string;
  name: { de: string; it: string; en: string };
  description?: { de: string; it: string; en: string };
  price: number;
  allergens?: Allergen[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  // Schlüssel für foodImages in imageMap.ts  (z. B. "burger")
  image?: string;
}

export interface FoodSection {
  id: string;
  categoryKey: string;
  icon: string;
  gradientStart: string;
  gradientEnd: string;
  items: FoodItem[];
}

export const foodSections: FoodSection[] = (menuData as { sections: FoodSection[] }).sections;
