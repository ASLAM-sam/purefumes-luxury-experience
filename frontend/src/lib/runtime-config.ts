const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

const browserOrigin = typeof window !== "undefined" ? window.location.origin : "";

const resolveUrl = (value: string, base = "") => {
  const input = String(value || "").trim();

  if (!input) {
    return "";
  }

  try {
    return trimTrailingSlash(new URL(input, base || undefined).toString());
  } catch (_error) {
    return trimTrailingSlash(input);
  }
};

const resolveOrigin = (value: string, base = "") => {
  const input = resolveUrl(value, base);

  if (!input) {
    return "";
  }

  try {
    return new URL(input, base || undefined).origin;
  } catch (_error) {
    return trimTrailingSlash(input.replace(/\/api$/, ""));
  }
};

const configuredFrontendUrl = resolveUrl(String(import.meta.env.VITE_FRONTEND_URL || ""), browserOrigin);
const frontendUrl = configuredFrontendUrl || browserOrigin;
const sameOriginBaseUrl = browserOrigin || frontendUrl;
const isLocalApiUrl = (value: string) => /localhost|127\.0\.0\.1/i.test(value);
const normalizeApiUrl = (value: string) => {
  const resolvedValue = resolveUrl(value, frontendUrl || browserOrigin);
  if (!resolvedValue) return "";

  return /\/api$/i.test(resolvedValue) ? resolvedValue : `${resolvedValue}/api`;
};

const configuredApiUrl = String(
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "",
).trim();
const normalizedConfiguredApiUrl = normalizeApiUrl(configuredApiUrl);
const productionSafeConfiguredApiUrl =
  import.meta.env.PROD && isLocalApiUrl(normalizedConfiguredApiUrl)
    ? ""
    : normalizedConfiguredApiUrl;
const sameOriginApiUrl = sameOriginBaseUrl ? resolveUrl("/api", sameOriginBaseUrl) : "/api";
const apiUrl =
  import.meta.env.PROD
    ? productionSafeConfiguredApiUrl || sameOriginApiUrl
    : productionSafeConfiguredApiUrl ||
      (frontendUrl ? resolveUrl("/api", frontendUrl) : "");
const apiOrigin = resolveOrigin(apiUrl, frontendUrl || browserOrigin) || frontendUrl;
const authUrl = apiUrl
  ? import.meta.env.PROD
    ? resolveUrl("/auth", apiOrigin || frontendUrl)
    : `${apiUrl.replace(/\/$/, "")}/auth`
  : apiOrigin
    ? resolveUrl("/auth", apiOrigin)
    : "";

if (import.meta.env.PROD) {
  if (apiUrl.startsWith("http://")) {
    throw new Error("VITE_API_URL must use HTTPS in production");
  }

  if (isLocalApiUrl(apiUrl)) {
    throw new Error("VITE_API_URL cannot point to localhost in production");
  }
}

export const runtimeConfig = {
  isProduction: import.meta.env.PROD,
  frontendUrl,
  apiUrl,
  apiOrigin,
  authUrl,
};

export default runtimeConfig;

