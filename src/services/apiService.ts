import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api-campedel.pokyh.com/api';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchDataAndCache = async <T>(endpoint: string, cacheKey: string, attempt = 0): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const raw: any = await response.json();

    let data: any = raw;
    if (raw) {
      if (Array.isArray(raw)) {
        data = raw;
      } else if (Array.isArray(raw.value)) {
        data = raw.value;
      } else if (Array.isArray(raw.sections)) {
        data = raw.sections;
      }
    }

    const cacheItem: CacheItem<T> = { data, timestamp: Date.now() };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    return data as T;
  } catch (err) {
    if (attempt < MAX_RETRIES - 1) {
      await delay(RETRY_DELAY_MS * Math.pow(2, attempt));
      return fetchDataAndCache<T>(endpoint, cacheKey, attempt + 1);
    }
    throw err;
  }
};

export const fetchWithCache = async <T>(endpoint: string, cacheKey: string, forceRefresh = false): Promise<T> => {
  // On force refresh (app start) — always fetch fresh from API
  if (forceRefresh) {
    try {
      return await fetchDataAndCache<T>(endpoint, cacheKey);
    } catch (error) {
      console.error(`Error fetching ${endpoint}, falling back to cache:`, error);
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        console.log(`Using cached data for ${cacheKey}`);
        return JSON.parse(cached).data;
      }
      throw error;
    }
  }

  // During session — return cached data directly without any network calls
  const cached = await AsyncStorage.getItem(cacheKey);
  if (cached) {
    return JSON.parse(cached).data;
  }

  // No cache at all — must fetch
  return fetchDataAndCache<T>(endpoint, cacheKey);
};

export const clearCache = async () => {
  await AsyncStorage.multiRemove([
    'campedel_menu_cache',
    'campedel_drinks_cache',
    'campedel_wines_cache',
  ]);
};

export const fetchMenu = (forceRefresh = false) =>
  fetchWithCache('/menu', 'campedel_menu_cache', forceRefresh);

export const fetchDrinks = (forceRefresh = false) =>
  fetchWithCache('/drinks', 'campedel_drinks_cache', forceRefresh);

export const fetchWines = (forceRefresh = false) =>
  fetchWithCache('/wines', 'campedel_wines_cache', forceRefresh);
