import { useEffect, useState } from "react";
import { useVirtualCache } from "@/store/virtualQueryCache";
import { hash } from "ohash";
import { useSidebarStore } from "@/store/sidebarStore";

type QueryHook<T> = () => {
  data: T | undefined;
  isLoading: boolean;
  error?: unknown;
  refetch: () => Promise<{ data: T | undefined }>;
};

export function useVirtualQuery<T>(
  queryHook: QueryHook<T>,
  deps: unknown[] = [],
  customKey?: string
) {
  const key = customKey ?? hash(deps);
  const { cache, setCache } = useVirtualCache();
  const setError = useSidebarStore((state) => state.setError);
  const cachedData = cache[key] as T | undefined;

  const { data, error: initialError, isLoading, refetch: originalRefetch } = queryHook();

  const [internalLoading, setInternalLoading] = useState(false);

  const refetch = async () => {
    setInternalLoading(true);
    try {
      const result = await originalRefetch();

      if (result.data !== undefined) {
        setCache(key, result.data);
      }
      return result;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
      return { data: undefined, error: err };
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setInternalLoading(true);

      try {
        const result = await refetch();
        if (mounted && result.data !== undefined) {
          setCache(key, result.data);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong.");
        }
      } finally {
        setInternalLoading(false);
      }
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

    if (initialError) {
      if (initialError instanceof Error) {
        setError(initialError.message);
      } else {
        setError("Something went wrong.");
      }
    }
  }, [data, initialError]);

  return {
    data: (cache[key] as T | undefined) ?? data,
    isLoading: internalLoading || isLoading,
    refetch,
  };
}
