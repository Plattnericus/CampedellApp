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
  imageUrl?: string | null;
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
