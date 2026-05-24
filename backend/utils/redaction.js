const REDACTED = "[redacted]";

const SENSITIVE_KEY_PATTERN =
  /(^|[_-])(auth|authorization|cookie|csrf|credential|dsn|family|otp|pass|password|secret|session|signature|token)([_-]|$)|apiKey|keySecret|paymentSignature|refreshTokens|setCookie/i;

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

export const sanitizeUrl = (url = "") => {
  try {
    const parsed = new URL(url, "http://local.request");

    parsed.searchParams.forEach((_value, key) => {
      if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) {
        parsed.searchParams.set(key, REDACTED);
      }
    });

    return `${parsed.pathname}${parsed.search}`;
  } catch (_error) {
    return String(url).replace(
      /([?&](?:token|code|password|resetToken|verificationToken|paymentSignature|razorpay_signature|signature)=)[^&]+/gi,
      `$1${REDACTED}`,
    );
  }
};

export const redactSensitive = (value, seen = new WeakSet()) => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    return JWT_PATTERN.test(value) ? REDACTED : value;
  }

  if (typeof value !== "object") {
    return value;
  }

  if (value instanceof Date) {
    return value;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
      statusCode: value.statusCode,
      code: value.code,
    };
  }

  if (seen.has(value)) {
    return "[circular]";
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item, seen));
  }

  const redacted = {};

  Object.entries(value).forEach(([key, childValue]) => {
    redacted[key] = SENSITIVE_KEY_PATTERN.test(key)
      ? REDACTED
      : redactSensitive(childValue, seen);
  });

  return redacted;
};

export const getRequestLogContext = (req, extra = {}) =>
  redactSensitive({
    requestId: req?.id,
    method: req?.method,
    path: sanitizeUrl(req?.originalUrl || req?.url || ""),
    origin: req?.get?.("origin") || "",
    userId: req?.user?.id || req?.user?._id?.toString?.() || "",
    role: req?.user?.role || "",
    ...extra,
  });
