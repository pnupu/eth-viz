import { Data, CachedData } from './types';

const LOCAL_STORAGE_KEY = 'ethereum_viz_data';
const CACHE_EXPIRATION_TIME = 1000 * 60 * 60; // 1 hour in milliseconds

export const storage = {
  saveData: (data: Data) => {
    const cachedData: CachedData = {
      ...data,
      timestamp: Date.now()
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cachedData));
  },
  getData: (): Data | null => {
    const cachedDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!cachedDataString) return null;

    const cachedData: CachedData = JSON.parse(cachedDataString);
    if (Date.now() - cachedData.timestamp > CACHE_EXPIRATION_TIME) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return null;
    }

    const { timestamp, ...data } = cachedData;
    return data;
  }
};