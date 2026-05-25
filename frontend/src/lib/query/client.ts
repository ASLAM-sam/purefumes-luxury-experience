import { QueryClient } from "@tanstack/react-query";

const isOffline = () => typeof navigator !== "undefined" && navigator.onLine === false;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry(failureCount, error) {
        if (isOffline()) return false;
        if (failureCount >= 1) return false;

        const status = Number((error as { status?: number } | undefined)?.status || 0);
        if (status >= 400 && status < 500) return false;
        return true;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});
