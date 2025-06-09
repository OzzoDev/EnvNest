import { create } from "zustand";

type VirtualCacheStore = {
  cache: Record<string, unknown>;
  setCache: (key: string, data: unknown) => void;
  clearCache: (key: string) => void;
};

export const useVirtualCache = create<VirtualCacheStore>((set) => ({
  cache: {},
  setCache: (key, data) =>
    set((state) => ({
      cache: { ...state.cache, [key]: data },
    })),
  clearCache: (key) =>
    set((state) => {
      const newCache = { ...state.cache };
      delete newCache[key];
      return { cache: newCache };
    }),
}));
