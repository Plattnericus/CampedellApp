import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api-campedel.pokyh.com/api';
const CACHE_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export const fetchWithCache = async <T>(endpoint: string, cacheKey: string, forceRefresh = false): Promise<T> => {
  try {
    if (!forceRefresh) {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const parsedCache: CacheItem<T> = JSON.parse(cached);
        const isExpired = Date.now() - parsedCache.timestamp > CACHE_EXPIRATION_MS;
        
        if (!isExpired) {
          // Trigger background fetch to keep cache fresh
          fetchDataAndCache(endpoint, cacheKey).catch(e => console.log('Background fetch failed:', e));
          return parsedCache.data;
        }
      }
    }
    
    return await fetchDataAndCache<T>(endpoint, cacheKey);
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    // Fallback to cache even if expired
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached).data;
    }
    throw error;
  }
};

const fetchDataAndCache = async <T>(endpoint: string, cacheKey: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
  
  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }
  
  const raw: any = await response.json();

  // Normalize common API shapes: array, { value: [...] }, { sections: [...] }
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

  const cacheItem: CacheItem<T> = {
    data,
    timestamp: Date.now(),
  };

  await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));
  return data as T;
};

export const fetchMenu = (forceRefresh = false) => fetchWithCache('/menu', 'campedel_menu_cache', forceRefresh);
export const fetchDrinks = (forceRefresh = false) => fetchWithCache('/drinks', 'campedel_drinks_cache', forceRefresh);
export const fetchWines = (forceRefresh = false) => fetchWithCache('/wines', 'campedel_wines_cache', forceRefresh);
