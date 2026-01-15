import { getRedisClient } from '../config/redis.js';

/**
 * Get item from cache
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached data or null
 */
export const get = async (key) => {
    try {
        const redis = getRedisClient();
        if (!redis) return null;

        const cached = await redis.get(key);
        return cached ? JSON.parse(cached) : null;
    } catch (error) {
        console.warn(`Cache GET error for key ${key}:`, error.message);
        return null;
    }
};

/**
 * Set item in cache
 * @param {string} key - Cache key
 * @param {any} value - Data to cache
 * @param {number} ttl - Time to live in seconds (default: 1 hour)
 */
export const set = async (key, value, ttl = 3600) => {
    try {
        const redis = getRedisClient();
        if (!redis) {
            console.log(`ℹ️  Cache SET skipped (Redis unavailable): ${key}`);
            return;
        }

        await redis.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
        console.warn(`Cache SET error for key ${key}:`, error.message);
    }
};

/**
 * Delete item from cache
 * @param {string} key - Cache key
 */
export const del = async (key) => {
    try {
        const redis = getRedisClient();
        if (!redis) return;

        await redis.del(key);
    } catch (error) {
        console.warn(`Cache DEL error for key ${key}:`, error.message);
    }
};

/**
 * Get or set cache
 * @param {string} key - Cache key
 * @param {number} ttl - Time to live in seconds
 * @param {Function} callback - Async function to fetch data if cache miss
 * @returns {Promise<any>} Data from cache or callback
 */
export const remember = async (key, ttl, callback) => {
    const cached = await get(key);
    if (cached) return cached;

    const data = await callback();
    if (data) {
        await set(key, data, ttl);
    }
    return data;
};

/**
 * Delete items matching a pattern
 * @param {string} pattern - Cache key pattern (e.g., 'products:*')
 */
export const delPattern = async (pattern) => {
    try {
        const redis = getRedisClient();
        if (!redis) return;

        // Use scanIterator for safe iteration over keys
        const iterator = redis.scanIterator({
            MATCH: pattern,
            COUNT: 100
        });

        const keysToDelete = [];
        for await (const key of iterator) {
            keysToDelete.push(key);
        }

        if (keysToDelete.length > 0) {
            // Delete in chunks to avoid stack overflow or command size limits
            // redis.unlink does not support array argument in this version, must use spread
            const chunkSize = 1000;
            for (let i = 0; i < keysToDelete.length; i += chunkSize) {
                const chunk = keysToDelete.slice(i, i + chunkSize);
                if (chunk.length > 0) {
                    await redis.unlink(...chunk);
                }
            }
        }
    } catch (error) {
        console.warn(`Cache DEL PATTERN error for ${pattern}:`, error.message);
    }
};

export default {
    get,
    set,
    del,
    delPattern,
    remember
};
