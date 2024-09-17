import NodeCache from "node-cache";

export const memoryCache = new NodeCache({ stdTTL: 3600 });

/**
 * Reusable cache utility function
 * @param key Unique cache key
 * @param fetchFunc Function to fetch new data if cache is expired/missing
 * @param ttl Time to live for the cache in seconds (optional, defaults to cache's default TTL)
 * @returns Cached data or fetched data if not in cache
 */
export async function cacheFetch<T>(
  key: string,
  fetchFunc: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cachedData = memoryCache.get<T>(key);

  if (cachedData) {
    return cachedData;
  }
  const newData = await fetchFunc();
  memoryCache.set(key, newData, ttl ?? 3600);
  return newData;
}
/**
 * Sets data in the cache with an optional TTL
 * @param key Unique cache key
 * @param data Data to store in the cache
 * @param ttl Time to live for the cache in seconds (optional)
 */
export function cacheSet<T>(key: string, data: T, ttl?: number) {
  memoryCache.set(key, data, ttl ?? 3600);
}
