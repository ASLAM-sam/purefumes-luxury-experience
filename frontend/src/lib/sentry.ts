import * as Sentry from "@sentry/react";
import type { SeverityLevel } from "@sentry/react";
import runtimeConfig from "@/lib/runtime-config";

const REDACTED = "[redacted]";
const SENSITIVE_KEY_PATTERN =
  /(^|[_-])(auth|authorization|cookie|csrf|credential|dsn|family|otp|pass|password|secret|session|signature|token)([_-]|$)|apiKey|keySecret|paymentSignature|setCookie/i;
const SENSITIVE_QUERY_KEYS = new Set([
  "token",
  "code",
  "password",
  "resettoken",
  "verificationtoken",
  "paymentsignature",
  "razorpay_signature",
  "signature",
]);
const JWT_PATTERN = /^eyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}$/;

const getBrowserOrigin = () => (typeof window === "undefined" ? "" : window.location.origin);

const toSampleRate = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback;
};

export const sanitizeFrontendUrl = (url = "") => {
  try {
    const parsed = new URL(url, getBrowserOrigin() || "https://local.invalid");

    parsed.searchParams.forEach((_value, key) => {
      if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) {
        parsed.searchParams.set(key, REDACTED);
      }
    });

    const sameOrigin = getBrowserOrigin() && parsed.origin === getBrowserOrigin();
    return sameOrigin ? `${parsed.pathname}${parsed.search}` : parsed.toString();
  } catch (_error) {
    return String(url).replace(
      /([?&](?:token|code|password|resetToken|verificationToken|paymentSignature|razorpay_signature|signature)=)[^&]+/gi,
      `$1${REDACTED}`,
    );
  }
};

export const redactSensitive = (
  value: unknown,
  seen: WeakSet<object> = new WeakSet<object>(),
): unknown => {
  if (value === null || value === undefined) return value;

  if (typeof value === "string") {
    return JWT_PATTERN.test(value) ? REDACTED : value;
  }

  if (typeof value !== "object") return value;
  if (value instanceof Date) return value;
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (seen.has(value)) return "[circular]";
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item, seen));
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, childValue]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : redactSensitive(childValue, seen),
    ]),
  );
};

const scrubEvent = (event: Sentry.Event) => {
  if (event.request) {
    event.request = redactSensitive({
      ...event.request,
      url: sanitizeFrontendUrl(event.request.url || ""),
      headers: redactSensitive(event.request.headers || {}),
      cookies: undefined,
      data: redactSensitive(event.request.data),
      query_string: sanitizeFrontendUrl(`/?${event.request.query_string || ""}`).replace(
        /^\/\??/,
        "",
      ),
    }) as Sentry.Event["request"];
  }

  if (event.extra) {
    event.extra = redactSensitive(event.extra) as Sentry.Event["extra"];
  }

  if (event.contexts) {
    event.contexts = redactSensitive(event.contexts) as Sentry.Event["contexts"];
  }

  if (event.user) {
    event.user = event.user.id ? { id: String(event.user.id) } : undefined;
  }

  return event;
};

const sentryDsn = String(import.meta.env.VITE_SENTRY_DSN || "").trim();
export const isFrontendSentryEnabled =
  typeof window !== "undefined" && import.meta.env.PROD && Boolean(sentryDsn);

if (isFrontendSentryEnabled) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE || undefined,
    sendDefaultPii: false,
    tracesSampleRate: toSampleRate(
      import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE,
      import.meta.env.PROD ? 0.05 : 0,
    ),
    tracePropagationTargets: [/^\/api/, /^\/auth/, runtimeConfig.frontendUrl],
    integrations: [Sentry.browserTracingIntegration()],
    beforeSend: scrubEvent as typeof Sentry.init extends (options: infer T) => void
      ? T extends { beforeSend?: infer U }
        ? U
        : never
      : never,
  });
}

export const captureFrontendException = (
  error: unknown,
  context: Record<string, unknown> = {},
) => {
  if (!isFrontendSentryEnabled) return;

  Sentry.withScope((scope) => {
    scope.setExtras(redactSensitive(context) as Record<string, unknown>);
    Sentry.captureException(error instanceof Error ? error : new Error(String(error)));
  });
};

export const captureFrontendMessage = (
  message: string,
  level: SeverityLevel = "info",
  context: Record<string, unknown> = {},
) => {
  if (!isFrontendSentryEnabled) return;

  Sentry.withScope((scope) => {
    scope.setLevel(level);
    scope.setExtras(redactSensitive(context) as Record<string, unknown>);
    Sentry.captureMessage(message, level);
  });
};

export { Sentry };
