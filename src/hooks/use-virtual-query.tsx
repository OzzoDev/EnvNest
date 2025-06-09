import { useEffect, useState } from "react";
import { useVirtualCache } from "@/store/virtualQueryCache";
import { hash } from "ohash";

type QueryHook<T> = () => {
  data: T | undefined;
  isLoading: boolean;
  refetch: () => Promise<{ data: T | undefined }>;
};

export function useVirtualQuery<T>(
  queryHook: QueryHook<T>,
  deps: boolean[] = [],
  customKey?: string
) {
  const key = customKey ?? hash(deps);
  const { cache, setCache } = useVirtualCache();
  const cachedData = cache[key] as T | undefined;

  const { data, isLoading, refetch } = queryHook();

  const [internalLoading, setInternalLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setInternalLoading(true);
      const result = await refetch();
      if (mounted && result.data !== undefined) {
        setCache(key, result.data);
      }
      setInternalLoading(false);
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, deps);

  useEffect(() => {
    if (data !== undefined && !cachedData) {
      setCache(key, data);
    }
  }, [data]);

  return {
    data: cachedData ?? data,
    isLoading: internalLoading || isLoading,
    refetch,
  };
}
