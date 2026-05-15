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
const configuredApiUrl = String(
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "",
).trim();
const apiUrl =
  resolveUrl(configuredApiUrl, frontendUrl || browserOrigin) ||
  (frontendUrl ? resolveUrl("/api", frontendUrl) : "");
const apiOrigin = resolveOrigin(apiUrl, frontendUrl || browserOrigin) || frontendUrl;
const authUrl = apiOrigin ? resolveUrl("/auth", apiOrigin) : "";

if (import.meta.env.PROD && apiUrl.startsWith("http://")) {
  throw new Error("VITE_API_URL must use HTTPS in production");
}

export const runtimeConfig = {
  isProduction: import.meta.env.PROD,
  frontendUrl,
  apiUrl,
  apiOrigin,
  authUrl,
};

export default runtimeConfig;
