export interface DrinkPrice { amount: string; price: number; }

export interface DrinkItem {
  id: string;
  name: { de: string; it: string; en: string };
  prices: DrinkPrice[];
  imageUrl?: string | null;
}

export interface DrinkSection {
  id: string;
  categoryKey: string;
  icon?: string;
  items: DrinkItem[];
}
