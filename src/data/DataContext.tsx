import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { fetchMenu, fetchDrinks, fetchWines } from '../services/apiService';
import { FoodSection } from './food';
import { DrinkSection } from './drinks';
import { WineSection } from './wines';

interface DataContextType {
  foodSections: FoodSection[];
  drinkSections: DrinkSection[];
  wineSections: WineSection[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [foodSections, setFoodSections] = useState<FoodSection[]>([]);
  const [drinkSections, setDrinkSections] = useState<DrinkSection[]>([]);
  const [wineSections, setWineSections] = useState<WineSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (force = false) => {
    try {
      if (force) setLoading(true);
      setError(null);
      
      const [menuRes, drinksRes, winesRes] = await Promise.all([
        fetchMenu(force),
        fetchDrinks(force),
        fetchWines(force)
      ]);
      
      setFoodSections((menuRes as any).sections || menuRes);
      setDrinkSections((drinksRes as any).sections || drinksRes);
      setWineSections((winesRes as any).sections || winesRes);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load menu data. Please check your connection.');
      Alert.alert(
        'Verbindungsfehler',
        'Leider konnten wir keine Verbindung zum Server herstellen. Möglicherweise sind einige Informationen nicht aktuell.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  return (
    <DataContext.Provider
      value={{
        foodSections,
        drinkSections,
        wineSections,
        loading,
        error,
        refreshData: () => loadData(true),
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useAppContent = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useAppContent must be used within a DataProvider');
  }
  return context;
};
