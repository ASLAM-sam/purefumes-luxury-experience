import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const DEFAULT_PORT = 5000;
const DEFAULT_JWT_EXPIRE = "15m";
const DEFAULT_REFRESH_EXPIRE = "30d";
const DEFAULT_SMTP_PORT = 587;
const DEFAULT_DEV_FRONTEND_URL = "http://localhost:8080";
const DEFAULT_PRODUCTION_FRONTEND_URL = "https://purefumeshyderabad.com";
const DEFAULT_PRODUCTION_BACKEND_URL = "https://api.purefumeshyderabad.com";
const MIN_SECRET_LENGTH = 32;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");
const requestedNodeEnv = String(process.env.NODE_ENV || "").trim() || "development";

const loadEnvFiles = (nodeEnv) => {
  const envFiles = [
    path.join(backendRoot, `.env.${nodeEnv}.local`),
    path.join(backendRoot, `.env.${nodeEnv}`),
    ...(nodeEnv === "test" ? [] : [path.join(backendRoot, ".env.local")]),
    path.join(backendRoot, ".env"),
  ];

  envFiles.forEach((envFile) => {
    if (fs.existsSync(envFile)) {
      dotenv.config({ path: envFile });
    }
  });
};

loadEnvFiles(requestedNodeEnv);

const read = (key) => String(process.env[key] || "").trim();
const firstNonEmpty = (...values) => values.find((value) => String(value || "").trim())?.trim() || "";

const normalizeUrl = (value) => {
  const input = String(value || "").trim();
  if (!input) return "";

  try {
    const url = new URL(input);
    return url.toString().replace(/\/$/, "");
  } catch (_error) {
    return input.replace(/\/$/, "");
  }
};

const safeOriginFromUrl = (value) => {
  const input = String(value || "").trim();
  if (!input) return "";

  try {
    return new URL(input).origin;
  } catch (_error) {
    return "";
  }
};

const parseBoolean = (value, fallback = false) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return fallback;
  return ["1", "true", "yes", "on"].includes(normalized);
};

const nodeEnv = firstNonEmpty(read("NODE_ENV"), requestedNodeEnv, "development");
const isProduction = nodeEnv === "production";
const isTest = nodeEnv === "test";
const configuredCorsOrigins = read("CORS_ORIGIN")
  .split(",")
  .map((origin) => normalizeUrl(origin))
  .filter(Boolean);
const localDevelopmentOrigins = [
  DEFAULT_DEV_FRONTEND_URL,
  "http://127.0.0.1:8080",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
const productionOrigins = [
  DEFAULT_PRODUCTION_FRONTEND_URL,
  "https://www.purefumeshyderabad.com",
];
const port = Number(process.env.PORT || DEFAULT_PORT) || DEFAULT_PORT;
const firstCorsOrigin = configuredCorsOrigins[0] || "";
const frontendUrl = normalizeUrl(
  firstNonEmpty(
    read("CLIENT_URL"),
    read("FRONTEND_URL"),
    firstCorsOrigin,
    isProduction ? DEFAULT_PRODUCTION_FRONTEND_URL : DEFAULT_DEV_FRONTEND_URL,
  ),
);
const backendUrl = normalizeUrl(
  firstNonEmpty(
    read("BACKEND_URL"),
    safeOriginFromUrl(read("GOOGLE_CALLBACK_URL")),
    isProduction ? DEFAULT_PRODUCTION_BACKEND_URL : `http://localhost:${port}`,
  ),
);
const googleCallbackUrl = normalizeUrl(
  firstNonEmpty(
    read("GOOGLE_CALLBACK_URL"),
    backendUrl ? `${backendUrl}/auth/google/callback` : "",
  ),
);
const allowedOrigins = [
  ...new Set([
    ...(!isProduction ? localDevelopmentOrigins : []),
    ...productionOrigins,
    frontendUrl,
    ...configuredCorsOrigins,
  ].filter(Boolean)),
];
const hasExplicitGoogleOAuthConfig = Boolean(
  read("GOOGLE_CLIENT_ID") || read("GOOGLE_CLIENT_SECRET") || read("GOOGLE_CALLBACK_URL"),
);

export const env = {
  PORT: port,
  NODE_ENV: nodeEnv,
  isProduction,
  isTest,
  MONGO_URI: read("MONGO_URI"),
  MONGO_AUTO_INDEX: parseBoolean(read("MONGO_AUTO_INDEX"), !isProduction),
  ENFORCE_HTTPS: parseBoolean(read("ENFORCE_HTTPS"), isProduction),
  JWT_SECRET: read("JWT_SECRET"),
  REFRESH_SECRET: read("REFRESH_SECRET"),
  JWT_EXPIRE: firstNonEmpty(read("JWT_EXPIRE"), read("JWT_EXPIRES_IN"), DEFAULT_JWT_EXPIRE),
  REFRESH_EXPIRE: firstNonEmpty(read("REFRESH_EXPIRE"), DEFAULT_REFRESH_EXPIRE),
  COOKIE_SECRET: read("COOKIE_SECRET"),
  SESSION_SECRET: firstNonEmpty(read("SESSION_SECRET"), read("COOKIE_SECRET")),
  COOKIE_DOMAIN: read("COOKIE_DOMAIN") || undefined,
  COOKIE_SAME_SITE: firstNonEmpty(read("COOKIE_SAME_SITE"), isProduction ? "None" : "Lax"),
  CLIENT_URL: frontendUrl,
  FRONTEND_URL: frontendUrl,
  BACKEND_URL: backendUrl,
  CORS_ORIGIN: read("CORS_ORIGIN"),
  ALLOWED_ORIGINS: allowedOrigins,
  GOOGLE_CLIENT_ID: read("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: read("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL: googleCallbackUrl,
  SMTP_HOST: read("SMTP_HOST"),
  SMTP_PORT: Number(read("SMTP_PORT")) || DEFAULT_SMTP_PORT,
  SMTP_USER: read("SMTP_USER"),
  SMTP_PASS: read("SMTP_PASS"),
  MAIL_FROM: firstNonEmpty(read("MAIL_FROM"), read("SMTP_FROM")),
  SMTP_SECURE: parseBoolean(read("SMTP_SECURE")),
  REDIS_URL: read("REDIS_URL"),
  RAZORPAY_KEY_ID: read("RAZORPAY_KEY_ID"),
  RAZORPAY_KEY_SECRET: read("RAZORPAY_KEY_SECRET"),
  BYPASS_PAYMENT: parseBoolean(read("BYPASS_PAYMENT")),
  CLOUDINARY_URL: read("CLOUDINARY_URL"),
  ADMIN_EMAIL: read("ADMIN_EMAIL").toLowerCase(),
  ADMIN_USERNAME: read("ADMIN_USER").toLowerCase(),
  ADMIN_PASSWORD_HASH: read("ADMIN_PASSWORD_HASH"),
  ADMIN_PASSWORD_LEGACY: read("ADMIN_PASS"),
};

env.PAYMENT_MODE = firstNonEmpty(read("PAYMENT_MODE"), env.BYPASS_PAYMENT ? "test" : "live");

env.PAYMENT_BYPASS_ENABLED =
  !isProduction && (env.PAYMENT_MODE === "test" || env.BYPASS_PAYMENT);

export const getMissingGoogleOAuthConfigKeys = () => {
  const missing = [];

  if (!env.GOOGLE_CLIENT_ID) {
    missing.push("GOOGLE_CLIENT_ID");
  }

  if (!env.GOOGLE_CLIENT_SECRET) {
    missing.push("GOOGLE_CLIENT_SECRET");
  }

  if (!env.GOOGLE_CALLBACK_URL) {
    missing.push("GOOGLE_CALLBACK_URL or BACKEND_URL");
  }

  return missing;
};

const assertCompleteGroup = (keys, label) => {
  const values = keys.map((key) => ({ key, value: env[key] }));
  const provided = values.filter(({ value }) => Boolean(value));

  if (provided.length > 0 && provided.length !== values.length) {
    const missing = values.filter(({ value }) => !value).map(({ key }) => key);
    throw new Error(`Incomplete ${label} configuration. Missing: ${missing.join(", ")}`);
  }
};

const assertHttpsUrl = (value, label) => {
  if (!value) return;

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") {
      throw new Error(`${label} must use HTTPS in production`);
    }
  } catch (error) {
    if (error.message.includes("HTTPS")) {
      throw error;
    }
  }
};

const assertStrongSecret = (key) => {
  const value = env[key];
  if (isProduction && String(value || "").length < MIN_SECRET_LENGTH) {
    throw new Error(`${key} must be at least ${MIN_SECRET_LENGTH} characters in production`);
  }
};

export const validateEnv = () => {
  if (isTest) return;

  const requiredCoreKeys = ["MONGO_URI", "JWT_SECRET", "REFRESH_SECRET", "COOKIE_SECRET"];
  const missingCore = requiredCoreKeys.filter((key) => !env[key]);

  if (missingCore.length) {
    throw new Error(`Missing required environment variables: ${missingCore.join(", ")}`);
  }

  if (!env.FRONTEND_URL) {
    throw new Error("Missing required environment variable: FRONTEND_URL or CLIENT_URL");
  }

  if (!env.SESSION_SECRET) {
    throw new Error("Missing required environment variable: SESSION_SECRET or COOKIE_SECRET");
  }

  requiredCoreKeys.forEach(assertStrongSecret);
  assertStrongSecret("SESSION_SECRET");

  if (isProduction) {
    assertHttpsUrl(env.FRONTEND_URL, "FRONTEND_URL");
    assertHttpsUrl(env.BACKEND_URL, "BACKEND_URL");

    if (env.ALLOWED_ORIGINS.includes("*")) {
      throw new Error("CORS_ORIGIN cannot be '*' in production");
    }

    if (env.COOKIE_SAME_SITE.toLowerCase() === "none" && !env.ENFORCE_HTTPS) {
      throw new Error("SameSite=None cookies require HTTPS enforcement in production");
    }

    if (env.ADMIN_PASSWORD_LEGACY) {
      throw new Error("ADMIN_PASS is not allowed in production. Use ADMIN_PASSWORD_HASH.");
    }
  }

  if (hasExplicitGoogleOAuthConfig) {
    const missingGoogle = getMissingGoogleOAuthConfigKeys();

    if (missingGoogle.length) {
      throw new Error(`Incomplete Google OAuth configuration. Missing: ${missingGoogle.join(", ")}`);
    }
  }
  assertCompleteGroup(["SMTP_HOST", "MAIL_FROM"], "SMTP");

  if ((env.SMTP_USER && !env.SMTP_PASS) || (!env.SMTP_USER && env.SMTP_PASS)) {
    throw new Error("SMTP_USER and SMTP_PASS must be provided together");
  }

  const hasAdminIdentifier = Boolean(env.ADMIN_EMAIL || env.ADMIN_USERNAME);
  const hasAdminPassword = Boolean(env.ADMIN_PASSWORD_HASH || env.ADMIN_PASSWORD_LEGACY);

  if ((hasAdminIdentifier && !hasAdminPassword) || (!hasAdminIdentifier && hasAdminPassword)) {
    throw new Error(
      "Admin bootstrap requires ADMIN_EMAIL or ADMIN_USER together with ADMIN_PASSWORD_HASH or ADMIN_PASS",
    );
  }
};

export default env;
