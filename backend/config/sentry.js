import { createRequire } from "module";
import env from "./env.js";
import { getRequestLogContext, redactSensitive, sanitizeUrl } from "../utils/redaction.js";

const require = createRequire(import.meta.url);
let initialized = false;
let sentry = null;

const getSentry = () => {
  if (!sentry) {
    sentry = require("@sentry/node");
  }

  return sentry;
};

const toSampleRate = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback;
};

const shouldHandleExpressError = (error) => {
  const statusCode = Number(
    error?.statusCode || error?.status || error?.status_code || error?.output?.statusCode || 500,
  );

  return statusCode >= 500;
};

const scrubEvent = (event) => {
  if (event.request) {
    event.request = redactSensitive({
      ...event.request,
      url: sanitizeUrl(event.request.url || ""),
      headers: redactSensitive(event.request.headers || {}),
      cookies: undefined,
      data: redactSensitive(event.request.data),
      query_string: sanitizeUrl(`/?${event.request.query_string || ""}`).replace(/^\/\??/, ""),
    });
  }

  if (event.extra) {
    event.extra = redactSensitive(event.extra);
  }

  if (event.contexts) {
    event.contexts = redactSensitive(event.contexts);
  }

  if (event.user) {
    event.user = redactSensitive({
      id: event.user.id,
      role: event.user.role,
    });
  }

  return event;
};

export const isSentryEnabled = () => initialized;

export const initSentry = () => {
  if (initialized || env.isTest || !env.SENTRY_DSN) {
    return initialized;
  }

  const Sentry = getSentry();

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    release: env.SENTRY_RELEASE || undefined,
    sendDefaultPii: false,
    tracesSampleRate: toSampleRate(
      env.SENTRY_TRACES_SAMPLE_RATE,
      env.isProduction ? 0.05 : 0,
    ),
    beforeSend: scrubEvent,
  });

  initialized = true;
  return initialized;
};

export const setupSentryErrorHandler = (app) => {
  if (!initialized) return;

  const Sentry = getSentry();
  Sentry.setupExpressErrorHandler(app, {
    shouldHandleError: shouldHandleExpressError,
  });
};

export const captureException = (error, context = {}) => {
  if (!initialized) return;

  const Sentry = getSentry();
  Sentry.withScope((scope) => {
    Object.entries(context.tags || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        scope.setTag(key, String(value));
      }
    });

    if (context.req) {
      scope.setExtras(getRequestLogContext(context.req, context.extra || {}));
    } else if (context.extra) {
      scope.setExtras(redactSensitive(context.extra));
    }

    const normalizedError =
      error instanceof Error ? error : new Error(String(error || "Unknown error"));
    Sentry.captureException(normalizedError);
  });
};

export const captureMessage = (message, level = "info", context = {}) => {
  if (!initialized) return;

  const Sentry = getSentry();
  Sentry.withScope((scope) => {
    scope.setLevel(level);

    Object.entries(context.tags || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        scope.setTag(key, String(value));
      }
    });

    if (context.req) {
      scope.setExtras(getRequestLogContext(context.req, context.extra || {}));
    } else if (context.extra) {
      scope.setExtras(redactSensitive(context.extra));
    }

    Sentry.captureMessage(message, level);
  });
};

export const flushSentry = (timeout = 2000) =>
  initialized ? getSentry().flush(timeout) : Promise.resolve(true);
