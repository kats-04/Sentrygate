import NodeCache from 'node-cache';

// In-memory cache for development/production
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false
});

// Cache middleware for API responses
export const cacheMiddleware = (duration = 300) => (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `__cache__${req.originalUrl}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      res.set('X-Cache', 'HIT');
      return res.json(cachedResponse);
    }

    // Store original json method
    const originalJson = res.json;
    res.json = function(data) {
      // Cache the response
      cache.set(key, data, duration);
      res.set('X-Cache', 'MISS');
      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };

// Clear cache for specific pattern
export const clearCache = (pattern) => {
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => key.includes(pattern));

  matchingKeys.forEach(key => {
    cache.del(key);
  });

  return matchingKeys.length;
};

// Get cache stats
export const getCacheStats = () => ({
    keys: cache.getStats().keys,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    hitRate: cache.getStats().hits / (cache.getStats().hits + cache.getStats().misses) || 0
  });

// Clear all cache
export const clearAllCache = () => {
  cache.flushAll();
  return true;
};

export default cache;
