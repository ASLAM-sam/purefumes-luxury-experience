const SLOW_API_THRESHOLD_MS = 450;
const SLOW_RENDER_THRESHOLD_MS = 24;

const canUsePerformance = () => typeof performance !== "undefined" && performance.now;

const isDebugEnabled = () => {
  if (!import.meta.env.DEV) return false;

  try {
    return typeof window !== "undefined"
      ? window.localStorage.getItem("purefumes_perf_debug") !== "off"
      : true;
  } catch (_error) {
    return true;
  }
};

export const perfInstrumentation = {
  timeAsync: async <T>(
    label: string,
    operation: () => Promise<T>,
    options: { thresholdMs?: number; metadata?: Record<string, unknown> } = {},
  ): Promise<T> => {
    const start = canUsePerformance() ? performance.now() : Date.now();

    try {
      return await operation();
    } finally {
      const end = canUsePerformance() ? performance.now() : Date.now();
      const duration = end - start;
      const threshold = options.thresholdMs ?? SLOW_API_THRESHOLD_MS;

      if (isDebugEnabled() && duration >= threshold) {
        console.debug("[perf]", label, {
          durationMs: Math.round(duration),
          ...options.metadata,
        });
      }
    }
  },

  duplicateRequest: (key: string) => {
    if (isDebugEnabled()) {
      console.debug("[perf] duplicate request deduped", { key });
    }
  },

  cacheHit: (key: string, state: "fresh" | "stale") => {
    if (isDebugEnabled()) {
      console.debug("[perf] cache hit", { key, state });
    }
  },

  renderCommit: (component: string, renderCount: number, durationMs: number) => {
    if (!isDebugEnabled() || durationMs < SLOW_RENDER_THRESHOLD_MS) return;

    console.debug("[perf] slow render", {
      component,
      renderCount,
      durationMs: Math.round(durationMs),
    });
  },
};
