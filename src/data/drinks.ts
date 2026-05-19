export interface DrinkPrice { amount: string; price: number; }

export interface DrinkItem { id: string; name: { de: string; it: string; en: string }; prices: DrinkPrice[]; }

export interface DrinkSection { id: string; categoryKey: string; items: DrinkItem[]; }
