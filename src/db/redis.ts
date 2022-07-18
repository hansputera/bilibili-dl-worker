import Redis from 'ioredis';

/**
 * Get redis.
 * @return {Redis}
 */
export const getRedis = (): Redis =>
    new Redis(process.env.REDIS_URL ?? 'redis://:@localhost:6379', {
        maxRetriesPerRequest: null,
    });
