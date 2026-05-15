import { perfInstrumentation } from "@/lib/performance/instrumentation";

type CacheEntry<T> = {
  value: T;
  createdAt: number;
  staleAt: number;
  expiresAt: number;
  revalidating?: Promise<T>;
};

type ReadThroughOptions<T> = {
  key: string;
  loader: () => Promise<T>;
  cache?: boolean;
  forceFresh?: boolean;
  ttlMs?: number;
  swrMs?: number;
  retries?: number;
  retryBaseMs?: number;
  timeoutMs?: number;
};

type ExclusiveOptions<T> = {
  key: string;
  action: () => Promise<T>;
  cooldownMs?: number;
};

const DEFAULT_CACHE_TTL_MS = 30 * 1000;
const DEFAULT_SWR_MS = 2 * 60 * 1000;
const DEFAULT_MAX_CACHE_KEYS = 180;
const DEFAULT_MAX_CONCURRENT_REQUESTS = 6;

const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();
const actionLocks = new Map<string, { promise: Promise<unknown>; lockedUntil: number }>();
const queue: Array<() => void> = [];

let activeRequests = 0;

const trimCache = () => {
  while (cache.size > DEFAULT_MAX_CACHE_KEYS) {
    const oldestKey = cache.keys().next().value;
    if (!oldestKey) return;
    cache.delete(oldestKey);
  }
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const runWithConcurrencyLimit = async <T>(task: () => Promise<T>): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const run = () => {
      activeRequests += 1;

      task()
        .then(resolve, reject)
        .finally(() => {
          activeRequests = Math.max(0, activeRequests - 1);
          queue.shift()?.();
        });
    };

    if (activeRequests < DEFAULT_MAX_CONCURRENT_REQUESTS) {
      run();
    } else {
      queue.push(run);
    }
  });

const runWithRetry = async <T>(
  task: () => Promise<T>,
  retries: number,
  retryBaseMs: number,
): Promise<T> => {
  let attempt = 0;

  while (true) {
    try {
      return await task();
    } catch (error) {
      if (attempt >= retries) {
        throw error;
      }

      attempt += 1;
      await delay(retryBaseMs * 2 ** (attempt - 1));
    }
  }
};

const withTimeout = async <T>(
  task: () => Promise<T>,
  timeoutMs: number | undefined,
): Promise<T> => {
  if (!timeoutMs) {
    return task();
  }

  let timeoutId: number | undefined;

  try {
    return await Promise.race([
      task(),
      new Promise<T>((_, reject) => {
        timeoutId = globalThis.setTimeout(() => {
          reject(new Error("Request timed out. Please try again."));
        }, timeoutMs) as unknown as number;
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) {
      globalThis.clearTimeout(timeoutId);
    }
  }
};

const revalidate = <T>(
  options: Required<Pick<ReadThroughOptions<T>, "key" | "loader">> &
    Omit<ReadThroughOptions<T>, "key" | "loader">,
) => {
  const existing = cache.get(options.key) as CacheEntry<T> | undefined;

  if (existing?.revalidating) {
    return existing.revalidating;
  }

  const request = apiTrafficProxy
    .readThrough({
      ...options,
      forceFresh: true,
    })
    .finally(() => {
      const nextEntry = cache.get(options.key) as CacheEntry<T> | undefined;
      if (nextEntry) {
        delete nextEntry.revalidating;
      }
    });

  if (existing) {
    existing.revalidating = request;
  }

  return request;
};

export const apiTrafficProxy = {
  readThrough: async <T>({
    key,
    loader,
    cache: shouldCache = true,
    forceFresh = false,
    ttlMs = DEFAULT_CACHE_TTL_MS,
    swrMs = DEFAULT_SWR_MS,
    retries = 0,
    retryBaseMs = 250,
    timeoutMs,
  }: ReadThroughOptions<T>): Promise<T> => {
    const now = Date.now();
    const cached = cache.get(key) as CacheEntry<T> | undefined;

    if (shouldCache && !forceFresh && cached && now < cached.staleAt) {
      perfInstrumentation.cacheHit(key, "fresh");
      return cached.value;
    }

    if (shouldCache && !forceFresh && cached && now < cached.expiresAt) {
      perfInstrumentation.cacheHit(key, "stale");
      void revalidate({ key, loader, cache: shouldCache, ttlMs, swrMs, retries, retryBaseMs });
      return cached.value;
    }

    const existingRequest = inflight.get(key) as Promise<T> | undefined;
    if (!forceFresh && existingRequest) {
      perfInstrumentation.duplicateRequest(key);
      return existingRequest;
    }

    const request = runWithConcurrencyLimit(() =>
      perfInstrumentation.timeAsync(
        `api:${key}`,
        () => runWithRetry(() => withTimeout(loader, timeoutMs), retries, retryBaseMs),
        { metadata: { cache: shouldCache, forceFresh } },
      ),
    );

    inflight.set(key, request);

    try {
      const value = await request;

      if (shouldCache) {
        cache.set(key, {
          value,
          createdAt: Date.now(),
          staleAt: Date.now() + ttlMs,
          expiresAt: Date.now() + ttlMs + swrMs,
        });
        trimCache();
      }

      return value;
    } catch (error) {
      if (shouldCache && cached) {
        return cached.value;
      }

      throw error;
    } finally {
      if (inflight.get(key) === request) {
        inflight.delete(key);
      }
    }
  },

  runExclusive: async <T>({ key, action, cooldownMs = 450 }: ExclusiveOptions<T>): Promise<T> => {
    const now = Date.now();
    const lock = actionLocks.get(key) as { promise: Promise<T>; lockedUntil: number } | undefined;

    if (lock && now < lock.lockedUntil) {
      perfInstrumentation.duplicateRequest(`action:${key}`);
      return lock.promise;
    }

    const promise = perfInstrumentation.timeAsync(`action:${key}`, action).finally(() => {
      const nextLock = actionLocks.get(key);

      if (nextLock?.promise === promise) {
        actionLocks.delete(key);
      }
    });

    actionLocks.set(key, {
      promise,
      lockedUntil: now + cooldownMs,
    });

    return promise;
  },

  invalidate(predicate: (key: string) => boolean) {
    Array.from(cache.keys()).forEach((key) => {
      if (predicate(key)) {
        cache.delete(key);
        inflight.delete(key);
      }
    });
  },

  clear() {
    cache.clear();
    inflight.clear();
    actionLocks.clear();
    queue.splice(0, queue.length);
  },
};
