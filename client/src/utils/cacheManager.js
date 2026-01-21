import React from 'react';

// Simple in-memory cache with TTL support
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  set(key, value, ttl = null) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    this.cache.set(key, value);

    // Set TTL if provided
    if (ttl) {
      const timer = setTimeout(() => {
        this.cache.delete(key);
        this.timers.delete(key);
      }, ttl);

      this.timers.set(key, timer);
    }
  }

  get(key) {
    return this.cache.get(key);
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    return this.cache.delete(key);
  }

  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
  }

  size() {
    return this.cache.size;
  }

  keys() {
    return Array.from(this.cache.keys());
  }

  entries() {
    return Array.from(this.cache.entries());
  }
}

// React hook for local storage caching
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = React.useCallback(value => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

// API response caching
export const createCachedApiCall = (apiFunction, ttl = 5 * 60 * 1000) => {
  const cache = new CacheManager();

  return async (...args) => {
    const cacheKey = JSON.stringify(args);

    // Return cached value if available
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    // Call API and cache result
    try {
      const result = await apiFunction(...args);
      cache.set(cacheKey, result, ttl);
      return result;
    } catch (error) {
      // Return cached error if available
      throw error;
    }
  };
};

// React Query style cache
export class QueryCache {
  constructor() {
    this.queries = new Map();
  }

  getQueryKey(...args) {
    return JSON.stringify(args);
  }

  setQuery(key, data, status = 'success') {
    this.queries.set(key, {
      data,
      status,
      timestamp: Date.now(),
    });
  }

  getQuery(key) {
    return this.queries.get(key);
  }

  invalidate(key) {
    this.queries.delete(key);
  }

  invalidateAll() {
    this.queries.clear();
  }

  isStale(key, staleTime = 5 * 60 * 1000) {
    const query = this.queries.get(key);
    if (!query) return true;
    return Date.now() - query.timestamp > staleTime;
  }
}

// Global cache instances
export const apiCache = new CacheManager();
export const queryCache = new QueryCache();

// Clear cache on memory pressure
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    apiCache.clear();
    queryCache.invalidateAll();
  });
}

export default {
  CacheManager,
  useLocalStorage,
  createCachedApiCall,
  QueryCache,
  apiCache,
  queryCache,
};
