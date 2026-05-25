import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import runtimeConfig from "@/lib/runtime-config";
import { captureFrontendException, captureFrontendMessage } from "@/lib/sentry";
import { getDeviceId, getDeviceName } from "./device";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
  errors?: Array<{ message?: string }>;
};

type RequestConfig = AxiosRequestConfig & {
  skipAuthRefresh?: boolean;
  dedupeKey?: string;
  idempotent?: boolean;
};

const AUTH_REFRESH_LOCK_NAME = "purefumes-auth-refresh";
const AUTH_REFRESH_LOCK_KEY = "purefumes:auth-refresh-lock";
const AUTH_REFRESH_LAST_SUCCESS_KEY = "purefumes:auth-refresh-last-success";
const AUTH_REFRESH_LOCK_TTL_MS = 10_000;
const AUTH_REFRESH_RECENT_SUCCESS_MS = 1_500;
const AUTH_REFRESH_LOCK_POLL_MS = 120;
const AUTH_REFRESH_FAILURE_BACKOFF_MS = 15_000;

type NavigatorWithLocks = Navigator & {
  locks?: {
    request<T>(name: string, callback: () => Promise<T> | T): Promise<T>;
  };
};

const apiBaseUrl = runtimeConfig.apiUrl.replace(/\/$/, "");
const authBaseUrl = runtimeConfig.authUrl.replace(/\/$/, "");

const client = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15_000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

const inflightRequests = new Map<string, Promise<unknown>>();
let refreshPromise: Promise<boolean> | null = null;
let refreshBackoffUntilMs = 0;

const isOffline = () => typeof navigator !== "undefined" && navigator.onLine === false;

const normalizeError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const apiMessage =
      error.response?.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data
        ? String((error.response.data as { message?: string }).message || "")
        : "";
    const normalized = new Error(apiMessage || error.message || "Request failed");
    (normalized as Error & { status?: number }).status = error.response?.status;
    return normalized;
  }

  return error instanceof Error ? error : new Error("Request failed");
};

const readStorageNumber = (key: string) => {
  if (typeof window === "undefined") return 0;

  try {
    return Number(window.localStorage.getItem(key) || 0) || 0;
  } catch (_error) {
    return 0;
  }
};

const writeStorageNumber = (key: string, value: number) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, String(value));
  } catch (_error) {
    // Cross-tab lock coordination is best effort.
  }
};

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const markAuthRefreshSucceeded = () => {
  writeStorageNumber(AUTH_REFRESH_LAST_SUCCESS_KEY, Date.now());
};

const wasAuthRefreshRecentlyCompleted = (startedAt: number) => {
  const lastSuccessAt = readStorageNumber(AUTH_REFRESH_LAST_SUCCESS_KEY);
  return (
    lastSuccessAt >= startedAt ||
    (lastSuccessAt > 0 && Date.now() - lastSuccessAt <= AUTH_REFRESH_RECENT_SUCCESS_MS)
  );
};

const createLockId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const tryAcquireStorageRefreshLock = (lockId: string) => {
  if (typeof window === "undefined") return true;

  try {
    const now = Date.now();
    const current = JSON.parse(window.localStorage.getItem(AUTH_REFRESH_LOCK_KEY) || "null") as {
      id?: string;
      expiresAt?: number;
    } | null;

    if (current?.expiresAt && current.expiresAt > now && current.id !== lockId) {
      return false;
    }

    window.localStorage.setItem(
      AUTH_REFRESH_LOCK_KEY,
      JSON.stringify({ id: lockId, expiresAt: now + AUTH_REFRESH_LOCK_TTL_MS }),
    );
    const next = JSON.parse(window.localStorage.getItem(AUTH_REFRESH_LOCK_KEY) || "null") as {
      id?: string;
    } | null;
    return next?.id === lockId;
  } catch (_error) {
    return true;
  }
};

const releaseStorageRefreshLock = (lockId: string) => {
  if (typeof window === "undefined") return;

  try {
    const current = JSON.parse(window.localStorage.getItem(AUTH_REFRESH_LOCK_KEY) || "null") as {
      id?: string;
    } | null;

    if (current?.id === lockId) {
      window.localStorage.removeItem(AUTH_REFRESH_LOCK_KEY);
    }
  } catch (_error) {
    // A stale lock expires quickly and should not block the next refresh attempt.
  }
};

const runWithStorageRefreshLock = async <T,>(action: () => Promise<T>): Promise<T> => {
  const lockId = createLockId();
  const deadline = Date.now() + AUTH_REFRESH_LOCK_TTL_MS + 2_000;

  while (!tryAcquireStorageRefreshLock(lockId)) {
    if (Date.now() > deadline) {
      throw new Error("Authentication refresh is still in progress. Please try again.");
    }

    await delay(AUTH_REFRESH_LOCK_POLL_MS);
  }

  try {
    return await action();
  } finally {
    releaseStorageRefreshLock(lockId);
  }
};

const runWithRefreshLock = async <T,>(action: () => Promise<T>): Promise<T> => {
  const lockManager =
    typeof navigator !== "undefined" ? (navigator as NavigatorWithLocks).locks : undefined;
  if (lockManager?.request) {
    return lockManager.request(AUTH_REFRESH_LOCK_NAME, action);
  }

  return runWithStorageRefreshLock(action);
};

const isAdminSessionRequest = (url: string) =>
  url === "/auth/me" ||
  url.startsWith("/admin") ||
  url.startsWith("/analytics") ||
  url === "/payments/settings" ||
  url.startsWith("/payments/settings?") ||
  url === "/orders" ||
  url.startsWith("/orders?") ||
  url.startsWith("/orders/unseen") ||
  /^\/orders\/[^/]+(?:\/seen)?$/.test(url);

const shouldAttemptRefresh = (url: string) =>
  isAdminSessionRequest(url) &&
  Date.now() >= refreshBackoffUntilMs &&
  !url.startsWith("/auth/login") &&
  !url.startsWith("/auth/refresh");

const refreshAuthSession = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const startedAt = Date.now();
  refreshPromise = runWithRefreshLock(async () => {
    if (wasAuthRefreshRecentlyCompleted(startedAt)) {
      return true;
    }

    if (isOffline()) {
      return false;
    }

    try {
      await client.post(
        `${authBaseUrl}/refresh`,
        undefined,
        {
          baseURL: "",
          skipAuthRefresh: true,
          timeout: 10_000,
        } as RequestConfig,
      );
      refreshBackoffUntilMs = 0;
      markAuthRefreshSucceeded();
      return true;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
        refreshBackoffUntilMs = Date.now() + AUTH_REFRESH_FAILURE_BACKOFF_MS;
      }

      captureFrontendMessage("Authentication refresh failed", "warning", {
        source: "axios.refresh",
        status: axiosError.response?.status || 0,
      });
      return false;
    }
  }).finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (isOffline()) {
    return Promise.reject(new Error("You appear to be offline. Please reconnect and try again."));
  }

  const headers = AxiosHeaders.from(config.headers ?? {});
  headers.set("X-Device-Id", getDeviceId());
  headers.set("X-Device-Name", getDeviceName());

  const method = String(config.method || "get").toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && !headers.has("Idempotency-Key")) {
    headers.set(
      "Idempotency-Key",
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
  }

  if (!(config.data instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  config.headers = headers;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiEnvelope<unknown>>) => {
    const config = (error.config || {}) as RequestConfig & { _retry?: boolean };
    const normalizedUrl = String(config.url || "");

    if (
      error.response?.status === 401 &&
      !config.skipAuthRefresh &&
      !config._retry &&
      shouldAttemptRefresh(normalizedUrl)
    ) {
      config._retry = true;
      const refreshed = await refreshAuthSession();
      if (refreshed) {
        return client.request(config);
      }
    }

    const normalized = normalizeError(error);
    captureFrontendException(normalized, {
      source: "axios.response",
      path: normalizedUrl,
      status: error.response?.status || 0,
    });
    throw normalized;
  },
);

const buildDedupeKey = (config: RequestConfig) =>
  [
    String(config.method || "get").toUpperCase(),
    String(config.url || ""),
    JSON.stringify(config.params || {}),
    typeof config.data === "string" ? config.data : JSON.stringify(config.data || {}),
  ].join("::");

const unwrapEnvelope = <T,>(response: AxiosResponse<ApiEnvelope<T> | T>) => {
  const payload = response.data;
  if (payload && typeof payload === "object" && "success" in payload) {
    const envelope = payload as ApiEnvelope<T>;
    if (envelope.success === false) {
      throw new Error(envelope.message || "Request failed");
    }
    return envelope.data;
  }

  return payload as T;
};

export const requestJson = async <T,>(config: RequestConfig): Promise<T> => {
  const method = String(config.method || "GET").toUpperCase();
  const dedupeEligible = method === "GET" || Boolean(config.dedupeKey);
  const dedupeKey = config.dedupeKey || buildDedupeKey(config);

  if (dedupeEligible) {
    const existing = inflightRequests.get(dedupeKey);
    if (existing) {
      return existing as Promise<T>;
    }
  }

  const request = client
    .request<ApiEnvelope<T> | T>(config)
    .then((response) => unwrapEnvelope<T>(response))
    .catch((error) => {
      throw normalizeError(error);
    })
    .finally(() => {
      inflightRequests.delete(dedupeKey);
    });

  if (dedupeEligible) {
    inflightRequests.set(dedupeKey, request);
  }

  return request;
};

export const uploadMultipart = async <T,>(
  url: string,
  formData: FormData,
  config: Omit<RequestConfig, "onUploadProgress"> & { onUploadProgress?: (progress: number) => void },
): Promise<T> =>
  requestJson<T>({
    ...config,
    url,
    data: formData,
    onUploadProgress(event) {
      if (typeof config.onUploadProgress === "function" && event.total) {
        config.onUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });

export const clearHttpClientState = () => {
  inflightRequests.clear();
  refreshBackoffUntilMs = 0;
};

export default client;
