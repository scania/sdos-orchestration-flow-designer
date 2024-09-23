import NodeCache from "node-cache";

export const memoryCache = new NodeCache({ stdTTL: 3600 });

/**
 * Sets data in the cache with an optional TTL
 * @param key Unique cache key
 * @param data Data to store in the cache
 * @param ttl Time to live for the cache in seconds (optional)
 */
export function cacheSet<T>(key: string, data: T, ttl?: number) {
  memoryCache.set(key, data, ttl ?? 3600);
}

/**
 * Sets data in the cache with an optional TTL
 * @param key Unique cache key
 */
export function cacheGet<T>(key: string): T | undefined {
  return memoryCache.get<T>(key);
}
