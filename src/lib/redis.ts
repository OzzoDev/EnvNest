import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const getCache = async <T>(key: string): Promise<T | null> => {
  const cached = await redis.get<T>(key);
  return cached ?? null;
};

export const setCache = async <T>(
  key: string,
  value: T,
  ttl = 60
): Promise<void> => {
  await redis.set(key, value, { ex: ttl });
};
