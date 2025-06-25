import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export const getCache = async <T>(key: string): Promise<T | null> => {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
};

export const setCache = async <T>(key: string, value: T, ttl = 60): Promise<void> => {
  await redis.set(key, JSON.stringify(value), "EX", ttl);
};
