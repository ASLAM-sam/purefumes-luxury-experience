import { w as withScope, i as init, k as browserTracingIntegration, l as captureException, m as captureMessage, g as getDefaultExportFromCjs, n as getAugmentedNamespace, r as reactExports, j as jsxRuntimeExports, X, C as CircleAlert, I as Info, o as CircleCheck, E as ErrorBoundary, S as Search, p as ChevronDown, H as Heart, q as ShoppingBag, M as Menu, s as House, t as Store, u as ShieldCheck, B as BadgeCheck, v as Headphones, T as Truck, F as Facebook, x as Instagram, P as Phone, y as Clock, z as Mail, D as MapPin, G as Check } from "./vendor-react-98xxEzFV.js";
import { u as useQueryClient, a as useQuery, Q as QueryClient, b as createRootRoute, H as HeadContent, S as Scripts, d as QueryClientProvider, O as Outlet, L as Link, e as createFileRoute, l as lazyRouteComponent, f as useNavigate, r as redirect, n as notFound, g as createRouter, h as useRouter } from "./vendor-tanstack-DkD25YnA.js";
import require$$1 from "util";
import stream, { Readable } from "stream";
import require$$1$1 from "path";
import require$$3 from "http";
import require$$4 from "https";
import require$$0$2 from "url";
import require$$6 from "fs";
import require$$8 from "crypto";
import require$$4$1 from "assert";
import { W as WriteStream, R as ReadStream } from "./worker-entry-8w9vAzi1.js";
import require$$0$3 from "os";
import zlib from "zlib";
import { EventEmitter } from "events";
import { A as AnimatePresence, m as motion } from "./vendor-motion-3kNaalGV.js";
import { c as clsx } from "./vendor-charts-Ot63D9Dz.js";
const isatty = function() {
  return false;
};
const tty = {
  ReadStream,
  WriteStream,
  isatty
};
const tty$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ReadStream,
  WriteStream,
  default: tty,
  isatty
}, Symbol.toStringTag, { value: "Module" }));
const trimTrailingSlash = (value) => value.replace(/\/$/, "");
const browserOrigin = typeof window !== "undefined" ? window.location.origin : "";
const resolveUrl = (value, base = "") => {
  const input = String(value || "").trim();
  if (!input) {
    return "";
  }
  try {
    return trimTrailingSlash(new URL(input, base || void 0).toString());
  } catch (_error) {
    return trimTrailingSlash(input);
  }
};
const resolveOrigin = (value, base = "") => {
  const input = resolveUrl(value, base);
  if (!input) {
    return "";
  }
  try {
    return new URL(input, base || void 0).origin;
  } catch (_error) {
    return trimTrailingSlash(input.replace(/\/api$/, ""));
  }
};
const configuredFrontendUrl = resolveUrl(String("https://purefumeshyderabad.in"), browserOrigin);
const frontendUrl = configuredFrontendUrl || browserOrigin;
const sameOriginBaseUrl = browserOrigin || frontendUrl;
const isLocalApiUrl = (value) => /localhost|127\.0\.0\.1/i.test(value);
const normalizeApiUrl = (value) => {
  const resolvedValue = resolveUrl(value, frontendUrl || browserOrigin);
  if (!resolvedValue) return "";
  return /\/api$/i.test(resolvedValue) ? resolvedValue : `${resolvedValue}/api`;
};
const configuredApiUrl = String(
  "https://hydpurefumes.onrender.com/api"
).trim();
const normalizedConfiguredApiUrl = normalizeApiUrl(configuredApiUrl);
const productionSafeConfiguredApiUrl = isLocalApiUrl(normalizedConfiguredApiUrl) ? "" : normalizedConfiguredApiUrl;
sameOriginBaseUrl ? resolveUrl("/api", sameOriginBaseUrl) : "/api";
const productionDefaultApiUrl = "https://api.purefumeshyderabad.in/api";
const apiUrl = productionSafeConfiguredApiUrl || productionDefaultApiUrl;
const apiOrigin = resolveOrigin(apiUrl, frontendUrl || browserOrigin) || frontendUrl;
const authUrl = resolveUrl("/auth", apiOrigin || frontendUrl);
{
  if (apiUrl.startsWith("http://")) {
    throw new Error("VITE_API_URL must use HTTPS in production");
  }
  if (isLocalApiUrl(apiUrl)) {
    throw new Error("VITE_API_URL cannot point to localhost in production");
  }
}
const runtimeConfig = {
  frontendUrl,
  apiUrl,
  apiOrigin,
  authUrl
};
const REDACTED = "[redacted]";
const SENSITIVE_KEY_PATTERN = /(^|[_-])(auth|authorization|cookie|csrf|credential|dsn|family|otp|pass|password|secret|session|signature|token)([_-]|$)|apiKey|keySecret|paymentSignature|setCookie/i;
const SENSITIVE_QUERY_KEYS = /* @__PURE__ */ new Set([
  "token",
  "code",
  "password",
  "resettoken",
  "verificationtoken",
  "paymentsignature",
  "razorpay_signature",
  "signature"
]);
const JWT_PATTERN = /^eyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}$/;
const getBrowserOrigin = () => typeof window === "undefined" ? "" : window.location.origin;
const toSampleRate = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback;
};
const sanitizeFrontendUrl = (url = "") => {
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
      `$1${REDACTED}`
    );
  }
};
const redactSensitive = (value, seen = /* @__PURE__ */ new WeakSet()) => {
  if (value === null || value === void 0) return value;
  if (typeof value === "string") {
    return JWT_PATTERN.test(value) ? REDACTED : value;
  }
  if (typeof value !== "object") return value;
  if (value instanceof Date) return value;
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack
    };
  }
  if (seen.has(value)) return "[circular]";
  seen.add(value);
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item, seen));
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, childValue]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : redactSensitive(childValue, seen)
    ])
  );
};
const scrubEvent = (event) => {
  if (event.request) {
    event.request = redactSensitive({
      ...event.request,
      url: sanitizeFrontendUrl(event.request.url || ""),
      headers: redactSensitive(event.request.headers || {}),
      cookies: void 0,
      data: redactSensitive(event.request.data),
      query_string: sanitizeFrontendUrl(`/?${event.request.query_string || ""}`).replace(
        /^\/\??/,
        ""
      )
    });
  }
  if (event.extra) {
    event.extra = redactSensitive(event.extra);
  }
  if (event.contexts) {
    event.contexts = redactSensitive(event.contexts);
  }
  if (event.user) {
    event.user = event.user.id ? { id: String(event.user.id) } : void 0;
  }
  return event;
};
const sentryDsn = String("https://b23854e81c257bff8ac43a8a81b282cd@o4511433215901696.ingest.de.sentry.io/4511433272459344").trim();
const isFrontendSentryEnabled = typeof window !== "undefined" && true && Boolean(sentryDsn);
if (isFrontendSentryEnabled) {
  init({
    dsn: sentryDsn,
    environment: "production",
    release: void 0,
    sendDefaultPii: false,
    tracesSampleRate: toSampleRate(
      void 0,
      0.05
    ),
    tracePropagationTargets: [/^\/api/, /^\/auth/, runtimeConfig.frontendUrl],
    integrations: [browserTracingIntegration()],
    beforeSend: scrubEvent
  });
}
const captureFrontendException = (error, context = {}) => {
  if (!isFrontendSentryEnabled) return;
  withScope((scope) => {
    scope.setExtras(redactSensitive(context));
    captureException(error instanceof Error ? error : new Error(String(error)));
  });
};
const captureFrontendMessage = (message, level = "info", context = {}) => {
  if (!isFrontendSentryEnabled) return;
  withScope((scope) => {
    scope.setLevel(level);
    scope.setExtras(redactSensitive(context));
    captureMessage(message, level);
  });
};
const SLOW_API_THRESHOLD_MS = 450;
const SLOW_RENDER_THRESHOLD_MS = 24;
const canUsePerformance = () => typeof performance !== "undefined" && performance.now;
const isDebugEnabled = () => {
  return false;
};
const perfInstrumentation = {
  timeAsync: async (label, operation, options = {}) => {
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
          ...options.metadata
        });
      }
    }
  },
  duplicateRequest: (key) => {
    if (isDebugEnabled()) {
      console.debug("[perf] duplicate request deduped", { key });
    }
  },
  cacheHit: (key, state) => {
    if (isDebugEnabled()) {
      console.debug("[perf] cache hit", { key, state });
    }
  },
  renderCommit: (component, renderCount, durationMs) => {
    if (!isDebugEnabled() || durationMs < SLOW_RENDER_THRESHOLD_MS) return;
    console.debug("[perf] slow render", {
      component,
      renderCount,
      durationMs: Math.round(durationMs)
    });
  }
};
const DEFAULT_CACHE_TTL_MS = 30 * 1e3;
const DEFAULT_SWR_MS = 2 * 60 * 1e3;
const DEFAULT_MAX_CACHE_KEYS = 180;
const DEFAULT_MAX_CONCURRENT_REQUESTS = 6;
const cache = /* @__PURE__ */ new Map();
const inflight = /* @__PURE__ */ new Map();
const actionLocks = /* @__PURE__ */ new Map();
const queue = [];
let activeRequests = 0;
const trimCache = () => {
  while (cache.size > DEFAULT_MAX_CACHE_KEYS) {
    const oldestKey = cache.keys().next().value;
    if (!oldestKey) return;
    cache.delete(oldestKey);
  }
};
const delay$1 = (ms2) => new Promise((resolve) => setTimeout(resolve, ms2));
const runWithConcurrencyLimit = async (task) => new Promise((resolve, reject) => {
  const run = () => {
    activeRequests += 1;
    task().then(resolve, reject).finally(() => {
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
const runWithRetry = async (task, retries, retryBaseMs) => {
  let attempt = 0;
  while (true) {
    try {
      return await task();
    } catch (error) {
      if (attempt >= retries) {
        throw error;
      }
      attempt += 1;
      await delay$1(retryBaseMs * 2 ** (attempt - 1));
    }
  }
};
const withTimeout = async (task, timeoutMs) => {
  if (!timeoutMs) {
    return task();
  }
  let timeoutId;
  try {
    return await Promise.race([
      task(),
      new Promise((_, reject) => {
        timeoutId = globalThis.setTimeout(() => {
          reject(new Error("Request timed out. Please try again."));
        }, timeoutMs);
      })
    ]);
  } finally {
    if (timeoutId !== void 0) {
      globalThis.clearTimeout(timeoutId);
    }
  }
};
const revalidate = (options) => {
  const existing = cache.get(options.key);
  if (existing?.revalidating) {
    return existing.revalidating;
  }
  const request = apiTrafficProxy.readThrough({
    ...options,
    forceFresh: true
  }).finally(() => {
    const nextEntry = cache.get(options.key);
    if (nextEntry) {
      delete nextEntry.revalidating;
    }
  });
  if (existing) {
    existing.revalidating = request;
  }
  return request;
};
const apiTrafficProxy = {
  readThrough: async ({
    key,
    loader,
    cache: shouldCache = true,
    forceFresh = false,
    ttlMs = DEFAULT_CACHE_TTL_MS,
    swrMs = DEFAULT_SWR_MS,
    retries = 0,
    retryBaseMs = 250,
    timeoutMs
  }) => {
    const now = Date.now();
    const cached = cache.get(key);
    if (shouldCache && !forceFresh && cached && now < cached.staleAt) {
      perfInstrumentation.cacheHit(key, "fresh");
      return cached.value;
    }
    if (shouldCache && !forceFresh && cached && now < cached.expiresAt) {
      perfInstrumentation.cacheHit(key, "stale");
      void revalidate({ key, loader, cache: shouldCache, ttlMs, swrMs, retries, retryBaseMs });
      return cached.value;
    }
    const existingRequest = inflight.get(key);
    if (!forceFresh && existingRequest) {
      perfInstrumentation.duplicateRequest(key);
      return existingRequest;
    }
    const request = runWithConcurrencyLimit(
      () => perfInstrumentation.timeAsync(
        `api:${key}`,
        () => runWithRetry(() => withTimeout(loader, timeoutMs), retries, retryBaseMs),
        { metadata: { cache: shouldCache, forceFresh } }
      )
    );
    inflight.set(key, request);
    try {
      const value = await request;
      if (shouldCache) {
        cache.set(key, {
          value,
          createdAt: Date.now(),
          staleAt: Date.now() + ttlMs,
          expiresAt: Date.now() + ttlMs + swrMs
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
  runExclusive: async ({ key, action, cooldownMs = 450 }) => {
    const now = Date.now();
    const lock = actionLocks.get(key);
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
      lockedUntil: now + cooldownMs
    });
    return promise;
  },
  invalidate(predicate) {
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
  }
};
function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}
const { toString } = Object.prototype;
const { getPrototypeOf } = Object;
const { iterator, toStringTag } = Symbol;
const kindOf = /* @__PURE__ */ ((cache2) => (thing) => {
  const str = toString.call(thing);
  return cache2[str] || (cache2[str] = str.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null));
const kindOfTest = (type2) => {
  type2 = type2.toLowerCase();
  return (thing) => kindOf(thing) === type2;
};
const typeOfTest = (type2) => (thing) => typeof thing === type2;
const { isArray } = Array;
const isUndefined = typeOfTest("undefined");
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}
const isArrayBuffer = kindOfTest("ArrayBuffer");
function isArrayBufferView(val) {
  let result;
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && isArrayBuffer(val.buffer);
  }
  return result;
}
const isString = typeOfTest("string");
const isFunction = typeOfTest("function");
const isNumber$1 = typeOfTest("number");
const isObject = (thing) => thing !== null && typeof thing === "object";
const isBoolean = (thing) => thing === true || thing === false;
const isPlainObject = (val) => {
  if (kindOf(val) !== "object") {
    return false;
  }
  const prototype2 = getPrototypeOf(val);
  return (prototype2 === null || prototype2 === Object.prototype || Object.getPrototypeOf(prototype2) === null) && !(toStringTag in val) && !(iterator in val);
};
const isEmptyObject = (val) => {
  if (!isObject(val) || isBuffer(val)) {
    return false;
  }
  try {
    return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
  } catch (e) {
    return false;
  }
};
const isDate = kindOfTest("Date");
const isFile = kindOfTest("File");
const isBlob = kindOfTest("Blob");
const isFileList = kindOfTest("FileList");
const isStream = (val) => isObject(val) && isFunction(val.pipe);
const isFormData = (thing) => {
  let kind;
  return thing && (typeof FormData === "function" && thing instanceof FormData || isFunction(thing.append) && ((kind = kindOf(thing)) === "formdata" || // detect form-data instance
  kind === "object" && isFunction(thing.toString) && thing.toString() === "[object FormData]"));
};
const isURLSearchParams = kindOfTest("URLSearchParams");
const [isReadableStream, isRequest, isResponse, isHeaders] = ["ReadableStream", "Request", "Response", "Headers"].map(kindOfTest);
const trim = (str) => str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function forEach(obj, fn, { allOwnKeys = false } = {}) {
  if (obj === null || typeof obj === "undefined") {
    return;
  }
  let i;
  let l;
  if (typeof obj !== "object") {
    obj = [obj];
  }
  if (isArray(obj)) {
    for (i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    if (isBuffer(obj)) {
      return;
    }
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;
    for (i = 0; i < len; i++) {
      key = keys[i];
      fn.call(null, obj[key], key, obj);
    }
  }
}
function findKey(obj, key) {
  if (isBuffer(obj)) {
    return null;
  }
  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i = keys.length;
  let _key;
  while (i-- > 0) {
    _key = keys[i];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}
const _global = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
})();
const isContextDefined = (context) => !isUndefined(context) && context !== _global;
function merge() {
  const { caseless } = isContextDefined(this) && this || {};
  const result = {};
  const assignValue = (val, key) => {
    const targetKey = caseless && findKey(result, key) || key;
    if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
      result[targetKey] = merge(result[targetKey], val);
    } else if (isPlainObject(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray(val)) {
      result[targetKey] = val.slice();
    } else {
      result[targetKey] = val;
    }
  };
  for (let i = 0, l = arguments.length; i < l; i++) {
    arguments[i] && forEach(arguments[i], assignValue);
  }
  return result;
}
const extend = (a, b, thisArg, { allOwnKeys } = {}) => {
  forEach(b, (val, key) => {
    if (thisArg && isFunction(val)) {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  }, { allOwnKeys });
  return a;
};
const stripBOM = (content) => {
  if (content.charCodeAt(0) === 65279) {
    content = content.slice(1);
  }
  return content;
};
const inherits = (constructor, superConstructor, props, descriptors2) => {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors2);
  constructor.prototype.constructor = constructor;
  Object.defineProperty(constructor, "super", {
    value: superConstructor.prototype
  });
  props && Object.assign(constructor.prototype, props);
};
const toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
  let props;
  let i;
  let prop;
  const merged = {};
  destObj = destObj || {};
  if (sourceObj == null) return destObj;
  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
  return destObj;
};
const endsWith = (str, searchString, position) => {
  str = String(str);
  if (position === void 0 || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  const lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
};
const toArray = (thing) => {
  if (!thing) return null;
  if (isArray(thing)) return thing;
  let i = thing.length;
  if (!isNumber$1(i)) return null;
  const arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
};
const isTypedArray = /* @__PURE__ */ ((TypedArray) => {
  return (thing) => {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
const forEachEntry = (obj, fn) => {
  const generator = obj && obj[iterator];
  const _iterator = generator.call(obj);
  let result;
  while ((result = _iterator.next()) && !result.done) {
    const pair = result.value;
    fn.call(obj, pair[0], pair[1]);
  }
};
const matchAll = (regExp, str) => {
  let matches;
  const arr = [];
  while ((matches = regExp.exec(str)) !== null) {
    arr.push(matches);
  }
  return arr;
};
const isHTMLForm = kindOfTest("HTMLFormElement");
const toCamelCase = (str) => {
  return str.toLowerCase().replace(
    /[-_\s]([a-z\d])(\w*)/g,
    function replacer(m, p1, p2) {
      return p1.toUpperCase() + p2;
    }
  );
};
const hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
const isRegExp = kindOfTest("RegExp");
const reduceDescriptors = (obj, reducer) => {
  const descriptors2 = Object.getOwnPropertyDescriptors(obj);
  const reducedDescriptors = {};
  forEach(descriptors2, (descriptor, name) => {
    let ret;
    if ((ret = reducer(descriptor, name, obj)) !== false) {
      reducedDescriptors[name] = ret || descriptor;
    }
  });
  Object.defineProperties(obj, reducedDescriptors);
};
const freezeMethods = (obj) => {
  reduceDescriptors(obj, (descriptor, name) => {
    if (isFunction(obj) && ["arguments", "caller", "callee"].indexOf(name) !== -1) {
      return false;
    }
    const value = obj[name];
    if (!isFunction(value)) return;
    descriptor.enumerable = false;
    if ("writable" in descriptor) {
      descriptor.writable = false;
      return;
    }
    if (!descriptor.set) {
      descriptor.set = () => {
        throw Error("Can not rewrite read-only method '" + name + "'");
      };
    }
  });
};
const toObjectSet = (arrayOrString, delimiter) => {
  const obj = {};
  const define = (arr) => {
    arr.forEach((value) => {
      obj[value] = true;
    });
  };
  isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
  return obj;
};
const noop = () => {
};
const toFiniteNumber$1 = (value, defaultValue) => {
  return value != null && Number.isFinite(value = +value) ? value : defaultValue;
};
function isSpecCompliantForm(thing) {
  return !!(thing && isFunction(thing.append) && thing[toStringTag] === "FormData" && thing[iterator]);
}
const toJSONObject = (obj) => {
  const stack = new Array(10);
  const visit = (source, i) => {
    if (isObject(source)) {
      if (stack.indexOf(source) >= 0) {
        return;
      }
      if (isBuffer(source)) {
        return source;
      }
      if (!("toJSON" in source)) {
        stack[i] = source;
        const target = isArray(source) ? [] : {};
        forEach(source, (value, key) => {
          const reducedValue = visit(value, i + 1);
          !isUndefined(reducedValue) && (target[key] = reducedValue);
        });
        stack[i] = void 0;
        return target;
      }
    }
    return source;
  };
  return visit(obj, 0);
};
const isAsyncFn = kindOfTest("AsyncFunction");
const isThenable = (thing) => thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);
const _setImmediate = ((setImmediateSupported, postMessageSupported) => {
  if (setImmediateSupported) {
    return setImmediate;
  }
  return postMessageSupported ? ((token, callbacks) => {
    _global.addEventListener("message", ({ source, data }) => {
      if (source === _global && data === token) {
        callbacks.length && callbacks.shift()();
      }
    }, false);
    return (cb) => {
      callbacks.push(cb);
      _global.postMessage(token, "*");
    };
  })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
})(
  typeof setImmediate === "function",
  isFunction(_global.postMessage)
);
const asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
const isIterable = (thing) => thing != null && isFunction(thing[iterator]);
const utils$1 = {
  isArray,
  isArrayBuffer,
  isBuffer,
  isFormData,
  isArrayBufferView,
  isString,
  isNumber: isNumber$1,
  isBoolean,
  isObject,
  isPlainObject,
  isEmptyObject,
  isReadableStream,
  isRequest,
  isResponse,
  isHeaders,
  isUndefined,
  isDate,
  isFile,
  isBlob,
  isRegExp,
  isFunction,
  isStream,
  isURLSearchParams,
  isTypedArray,
  isFileList,
  forEach,
  merge,
  extend,
  trim,
  stripBOM,
  inherits,
  toFlatObject,
  kindOf,
  kindOfTest,
  endsWith,
  toArray,
  forEachEntry,
  matchAll,
  isHTMLForm,
  hasOwnProperty,
  hasOwnProp: hasOwnProperty,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors,
  freezeMethods,
  toObjectSet,
  toCamelCase,
  noop,
  toFiniteNumber: toFiniteNumber$1,
  findKey,
  global: _global,
  isContextDefined,
  isSpecCompliantForm,
  toJSONObject,
  isAsyncFn,
  isThenable,
  setImmediate: _setImmediate,
  asap,
  isIterable
};
function AxiosError$1(message, code, config, request, response) {
  Error.call(this);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }
  this.message = message;
  this.name = "AxiosError";
  code && (this.code = code);
  config && (this.config = config);
  request && (this.request = request);
  if (response) {
    this.response = response;
    this.status = response.status ? response.status : null;
  }
}
utils$1.inherits(AxiosError$1, Error, {
  toJSON: function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: utils$1.toJSONObject(this.config),
      code: this.code,
      status: this.status
    };
  }
});
const prototype$1 = AxiosError$1.prototype;
const descriptors = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
  // eslint-disable-next-line func-names
].forEach((code) => {
  descriptors[code] = { value: code };
});
Object.defineProperties(AxiosError$1, descriptors);
Object.defineProperty(prototype$1, "isAxiosError", { value: true });
AxiosError$1.from = (error, code, config, request, response, customProps) => {
  const axiosError = Object.create(prototype$1);
  utils$1.toFlatObject(error, axiosError, function filter2(obj) {
    return obj !== Error.prototype;
  }, (prop) => {
    return prop !== "isAxiosError";
  });
  AxiosError$1.call(axiosError, error.message, code, config, request, response);
  axiosError.cause = error;
  axiosError.name = error.name;
  customProps && Object.assign(axiosError, customProps);
  return axiosError;
};
var delayed_stream;
var hasRequiredDelayed_stream;
function requireDelayed_stream() {
  if (hasRequiredDelayed_stream) return delayed_stream;
  hasRequiredDelayed_stream = 1;
  var Stream = stream.Stream;
  var util = require$$1;
  delayed_stream = DelayedStream;
  function DelayedStream() {
    this.source = null;
    this.dataSize = 0;
    this.maxDataSize = 1024 * 1024;
    this.pauseStream = true;
    this._maxDataSizeExceeded = false;
    this._released = false;
    this._bufferedEvents = [];
  }
  util.inherits(DelayedStream, Stream);
  DelayedStream.create = function(source, options) {
    var delayedStream = new this();
    options = options || {};
    for (var option in options) {
      delayedStream[option] = options[option];
    }
    delayedStream.source = source;
    var realEmit = source.emit;
    source.emit = function() {
      delayedStream._handleEmit(arguments);
      return realEmit.apply(source, arguments);
    };
    source.on("error", function() {
    });
    if (delayedStream.pauseStream) {
      source.pause();
    }
    return delayedStream;
  };
  Object.defineProperty(DelayedStream.prototype, "readable", {
    configurable: true,
    enumerable: true,
    get: function() {
      return this.source.readable;
    }
  });
  DelayedStream.prototype.setEncoding = function() {
    return this.source.setEncoding.apply(this.source, arguments);
  };
  DelayedStream.prototype.resume = function() {
    if (!this._released) {
      this.release();
    }
    this.source.resume();
  };
  DelayedStream.prototype.pause = function() {
    this.source.pause();
  };
  DelayedStream.prototype.release = function() {
    this._released = true;
    this._bufferedEvents.forEach(function(args) {
      this.emit.apply(this, args);
    }.bind(this));
    this._bufferedEvents = [];
  };
  DelayedStream.prototype.pipe = function() {
    var r = Stream.prototype.pipe.apply(this, arguments);
    this.resume();
    return r;
  };
  DelayedStream.prototype._handleEmit = function(args) {
    if (this._released) {
      this.emit.apply(this, args);
      return;
    }
    if (args[0] === "data") {
      this.dataSize += args[1].length;
      this._checkIfMaxDataSizeExceeded();
    }
    this._bufferedEvents.push(args);
  };
  DelayedStream.prototype._checkIfMaxDataSizeExceeded = function() {
    if (this._maxDataSizeExceeded) {
      return;
    }
    if (this.dataSize <= this.maxDataSize) {
      return;
    }
    this._maxDataSizeExceeded = true;
    var message = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
    this.emit("error", new Error(message));
  };
  return delayed_stream;
}
var combined_stream;
var hasRequiredCombined_stream;
function requireCombined_stream() {
  if (hasRequiredCombined_stream) return combined_stream;
  hasRequiredCombined_stream = 1;
  var util = require$$1;
  var Stream = stream.Stream;
  var DelayedStream = requireDelayed_stream();
  combined_stream = CombinedStream;
  function CombinedStream() {
    this.writable = false;
    this.readable = true;
    this.dataSize = 0;
    this.maxDataSize = 2 * 1024 * 1024;
    this.pauseStreams = true;
    this._released = false;
    this._streams = [];
    this._currentStream = null;
    this._insideLoop = false;
    this._pendingNext = false;
  }
  util.inherits(CombinedStream, Stream);
  CombinedStream.create = function(options) {
    var combinedStream = new this();
    options = options || {};
    for (var option in options) {
      combinedStream[option] = options[option];
    }
    return combinedStream;
  };
  CombinedStream.isStreamLike = function(stream2) {
    return typeof stream2 !== "function" && typeof stream2 !== "string" && typeof stream2 !== "boolean" && typeof stream2 !== "number" && !Buffer.isBuffer(stream2);
  };
  CombinedStream.prototype.append = function(stream2) {
    var isStreamLike = CombinedStream.isStreamLike(stream2);
    if (isStreamLike) {
      if (!(stream2 instanceof DelayedStream)) {
        var newStream = DelayedStream.create(stream2, {
          maxDataSize: Infinity,
          pauseStream: this.pauseStreams
        });
        stream2.on("data", this._checkDataSize.bind(this));
        stream2 = newStream;
      }
      this._handleErrors(stream2);
      if (this.pauseStreams) {
        stream2.pause();
      }
    }
    this._streams.push(stream2);
    return this;
  };
  CombinedStream.prototype.pipe = function(dest, options) {
    Stream.prototype.pipe.call(this, dest, options);
    this.resume();
    return dest;
  };
  CombinedStream.prototype._getNext = function() {
    this._currentStream = null;
    if (this._insideLoop) {
      this._pendingNext = true;
      return;
    }
    this._insideLoop = true;
    try {
      do {
        this._pendingNext = false;
        this._realGetNext();
      } while (this._pendingNext);
    } finally {
      this._insideLoop = false;
    }
  };
  CombinedStream.prototype._realGetNext = function() {
    var stream2 = this._streams.shift();
    if (typeof stream2 == "undefined") {
      this.end();
      return;
    }
    if (typeof stream2 !== "function") {
      this._pipeNext(stream2);
      return;
    }
    var getStream = stream2;
    getStream(function(stream3) {
      var isStreamLike = CombinedStream.isStreamLike(stream3);
      if (isStreamLike) {
        stream3.on("data", this._checkDataSize.bind(this));
        this._handleErrors(stream3);
      }
      this._pipeNext(stream3);
    }.bind(this));
  };
  CombinedStream.prototype._pipeNext = function(stream2) {
    this._currentStream = stream2;
    var isStreamLike = CombinedStream.isStreamLike(stream2);
    if (isStreamLike) {
      stream2.on("end", this._getNext.bind(this));
      stream2.pipe(this, { end: false });
      return;
    }
    var value = stream2;
    this.write(value);
    this._getNext();
  };
  CombinedStream.prototype._handleErrors = function(stream2) {
    var self2 = this;
    stream2.on("error", function(err) {
      self2._emitError(err);
    });
  };
  CombinedStream.prototype.write = function(data) {
    this.emit("data", data);
  };
  CombinedStream.prototype.pause = function() {
    if (!this.pauseStreams) {
      return;
    }
    if (this.pauseStreams && this._currentStream && typeof this._currentStream.pause == "function") this._currentStream.pause();
    this.emit("pause");
  };
  CombinedStream.prototype.resume = function() {
    if (!this._released) {
      this._released = true;
      this.writable = true;
      this._getNext();
    }
    if (this.pauseStreams && this._currentStream && typeof this._currentStream.resume == "function") this._currentStream.resume();
    this.emit("resume");
  };
  CombinedStream.prototype.end = function() {
    this._reset();
    this.emit("end");
  };
  CombinedStream.prototype.destroy = function() {
    this._reset();
    this.emit("close");
  };
  CombinedStream.prototype._reset = function() {
    this.writable = false;
    this._streams = [];
    this._currentStream = null;
  };
  CombinedStream.prototype._checkDataSize = function() {
    this._updateDataSize();
    if (this.dataSize <= this.maxDataSize) {
      return;
    }
    var message = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
    this._emitError(new Error(message));
  };
  CombinedStream.prototype._updateDataSize = function() {
    this.dataSize = 0;
    var self2 = this;
    this._streams.forEach(function(stream2) {
      if (!stream2.dataSize) {
        return;
      }
      self2.dataSize += stream2.dataSize;
    });
    if (this._currentStream && this._currentStream.dataSize) {
      this.dataSize += this._currentStream.dataSize;
    }
  };
  CombinedStream.prototype._emitError = function(err) {
    this._reset();
    this.emit("error", err);
  };
  return combined_stream;
}
var mimeTypes = {};
const require$$0$1 = {
  "application/1d-interleaved-parityfec": { "source": "iana" },
  "application/3gpdash-qoe-report+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/3gpp-ims+xml": { "source": "iana", "compressible": true },
  "application/3gpphal+json": { "source": "iana", "compressible": true },
  "application/3gpphalforms+json": { "source": "iana", "compressible": true },
  "application/a2l": { "source": "iana" },
  "application/ace+cbor": { "source": "iana" },
  "application/activemessage": { "source": "iana" },
  "application/activity+json": { "source": "iana", "compressible": true },
  "application/alto-costmap+json": { "source": "iana", "compressible": true },
  "application/alto-costmapfilter+json": { "source": "iana", "compressible": true },
  "application/alto-directory+json": { "source": "iana", "compressible": true },
  "application/alto-endpointcost+json": { "source": "iana", "compressible": true },
  "application/alto-endpointcostparams+json": { "source": "iana", "compressible": true },
  "application/alto-endpointprop+json": { "source": "iana", "compressible": true },
  "application/alto-endpointpropparams+json": { "source": "iana", "compressible": true },
  "application/alto-error+json": { "source": "iana", "compressible": true },
  "application/alto-networkmap+json": { "source": "iana", "compressible": true },
  "application/alto-networkmapfilter+json": { "source": "iana", "compressible": true },
  "application/alto-updatestreamcontrol+json": { "source": "iana", "compressible": true },
  "application/alto-updatestreamparams+json": { "source": "iana", "compressible": true },
  "application/aml": { "source": "iana" },
  "application/andrew-inset": { "source": "iana", "extensions": ["ez"] },
  "application/applefile": { "source": "iana" },
  "application/applixware": { "source": "apache", "extensions": ["aw"] },
  "application/at+jwt": { "source": "iana" },
  "application/atf": { "source": "iana" },
  "application/atfx": { "source": "iana" },
  "application/atom+xml": { "source": "iana", "compressible": true, "extensions": ["atom"] },
  "application/atomcat+xml": { "source": "iana", "compressible": true, "extensions": ["atomcat"] },
  "application/atomdeleted+xml": { "source": "iana", "compressible": true, "extensions": ["atomdeleted"] },
  "application/atomicmail": { "source": "iana" },
  "application/atomsvc+xml": { "source": "iana", "compressible": true, "extensions": ["atomsvc"] },
  "application/atsc-dwd+xml": { "source": "iana", "compressible": true, "extensions": ["dwd"] },
  "application/atsc-dynamic-event-message": { "source": "iana" },
  "application/atsc-held+xml": { "source": "iana", "compressible": true, "extensions": ["held"] },
  "application/atsc-rdt+json": { "source": "iana", "compressible": true },
  "application/atsc-rsat+xml": { "source": "iana", "compressible": true, "extensions": ["rsat"] },
  "application/atxml": { "source": "iana" },
  "application/auth-policy+xml": { "source": "iana", "compressible": true },
  "application/bacnet-xdd+zip": { "source": "iana", "compressible": false },
  "application/batch-smtp": { "source": "iana" },
  "application/bdoc": { "compressible": false, "extensions": ["bdoc"] },
  "application/beep+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/calendar+json": { "source": "iana", "compressible": true },
  "application/calendar+xml": { "source": "iana", "compressible": true, "extensions": ["xcs"] },
  "application/call-completion": { "source": "iana" },
  "application/cals-1840": { "source": "iana" },
  "application/captive+json": { "source": "iana", "compressible": true },
  "application/cbor": { "source": "iana" },
  "application/cbor-seq": { "source": "iana" },
  "application/cccex": { "source": "iana" },
  "application/ccmp+xml": { "source": "iana", "compressible": true },
  "application/ccxml+xml": { "source": "iana", "compressible": true, "extensions": ["ccxml"] },
  "application/cdfx+xml": { "source": "iana", "compressible": true, "extensions": ["cdfx"] },
  "application/cdmi-capability": { "source": "iana", "extensions": ["cdmia"] },
  "application/cdmi-container": { "source": "iana", "extensions": ["cdmic"] },
  "application/cdmi-domain": { "source": "iana", "extensions": ["cdmid"] },
  "application/cdmi-object": { "source": "iana", "extensions": ["cdmio"] },
  "application/cdmi-queue": { "source": "iana", "extensions": ["cdmiq"] },
  "application/cdni": { "source": "iana" },
  "application/cea": { "source": "iana" },
  "application/cea-2018+xml": { "source": "iana", "compressible": true },
  "application/cellml+xml": { "source": "iana", "compressible": true },
  "application/cfw": { "source": "iana" },
  "application/city+json": { "source": "iana", "compressible": true },
  "application/clr": { "source": "iana" },
  "application/clue+xml": { "source": "iana", "compressible": true },
  "application/clue_info+xml": { "source": "iana", "compressible": true },
  "application/cms": { "source": "iana" },
  "application/cnrp+xml": { "source": "iana", "compressible": true },
  "application/coap-group+json": { "source": "iana", "compressible": true },
  "application/coap-payload": { "source": "iana" },
  "application/commonground": { "source": "iana" },
  "application/conference-info+xml": { "source": "iana", "compressible": true },
  "application/cose": { "source": "iana" },
  "application/cose-key": { "source": "iana" },
  "application/cose-key-set": { "source": "iana" },
  "application/cpl+xml": { "source": "iana", "compressible": true, "extensions": ["cpl"] },
  "application/csrattrs": { "source": "iana" },
  "application/csta+xml": { "source": "iana", "compressible": true },
  "application/cstadata+xml": { "source": "iana", "compressible": true },
  "application/csvm+json": { "source": "iana", "compressible": true },
  "application/cu-seeme": { "source": "apache", "extensions": ["cu"] },
  "application/cwt": { "source": "iana" },
  "application/cybercash": { "source": "iana" },
  "application/dart": { "compressible": true },
  "application/dash+xml": { "source": "iana", "compressible": true, "extensions": ["mpd"] },
  "application/dash-patch+xml": { "source": "iana", "compressible": true, "extensions": ["mpp"] },
  "application/dashdelta": { "source": "iana" },
  "application/davmount+xml": { "source": "iana", "compressible": true, "extensions": ["davmount"] },
  "application/dca-rft": { "source": "iana" },
  "application/dcd": { "source": "iana" },
  "application/dec-dx": { "source": "iana" },
  "application/dialog-info+xml": { "source": "iana", "compressible": true },
  "application/dicom": { "source": "iana" },
  "application/dicom+json": { "source": "iana", "compressible": true },
  "application/dicom+xml": { "source": "iana", "compressible": true },
  "application/dii": { "source": "iana" },
  "application/dit": { "source": "iana" },
  "application/dns": { "source": "iana" },
  "application/dns+json": { "source": "iana", "compressible": true },
  "application/dns-message": { "source": "iana" },
  "application/docbook+xml": { "source": "apache", "compressible": true, "extensions": ["dbk"] },
  "application/dots+cbor": { "source": "iana" },
  "application/dskpp+xml": { "source": "iana", "compressible": true },
  "application/dssc+der": { "source": "iana", "extensions": ["dssc"] },
  "application/dssc+xml": { "source": "iana", "compressible": true, "extensions": ["xdssc"] },
  "application/dvcs": { "source": "iana" },
  "application/ecmascript": { "source": "iana", "compressible": true, "extensions": ["es", "ecma"] },
  "application/edi-consent": { "source": "iana" },
  "application/edi-x12": { "source": "iana", "compressible": false },
  "application/edifact": { "source": "iana", "compressible": false },
  "application/efi": { "source": "iana" },
  "application/elm+json": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/elm+xml": { "source": "iana", "compressible": true },
  "application/emergencycalldata.cap+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/emergencycalldata.comment+xml": { "source": "iana", "compressible": true },
  "application/emergencycalldata.control+xml": { "source": "iana", "compressible": true },
  "application/emergencycalldata.deviceinfo+xml": { "source": "iana", "compressible": true },
  "application/emergencycalldata.ecall.msd": { "source": "iana" },
  "application/emergencycalldata.providerinfo+xml": { "source": "iana", "compressible": true },
  "application/emergencycalldata.serviceinfo+xml": { "source": "iana", "compressible": true },
  "application/emergencycalldata.subscriberinfo+xml": { "source": "iana", "compressible": true },
  "application/emergencycalldata.veds+xml": { "source": "iana", "compressible": true },
  "application/emma+xml": { "source": "iana", "compressible": true, "extensions": ["emma"] },
  "application/emotionml+xml": { "source": "iana", "compressible": true, "extensions": ["emotionml"] },
  "application/encaprtp": { "source": "iana" },
  "application/epp+xml": { "source": "iana", "compressible": true },
  "application/epub+zip": { "source": "iana", "compressible": false, "extensions": ["epub"] },
  "application/eshop": { "source": "iana" },
  "application/exi": { "source": "iana", "extensions": ["exi"] },
  "application/expect-ct-report+json": { "source": "iana", "compressible": true },
  "application/express": { "source": "iana", "extensions": ["exp"] },
  "application/fastinfoset": { "source": "iana" },
  "application/fastsoap": { "source": "iana" },
  "application/fdt+xml": { "source": "iana", "compressible": true, "extensions": ["fdt"] },
  "application/fhir+json": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/fhir+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/fido.trusted-apps+json": { "compressible": true },
  "application/fits": { "source": "iana" },
  "application/flexfec": { "source": "iana" },
  "application/font-sfnt": { "source": "iana" },
  "application/font-tdpfr": { "source": "iana", "extensions": ["pfr"] },
  "application/font-woff": { "source": "iana", "compressible": false },
  "application/framework-attributes+xml": { "source": "iana", "compressible": true },
  "application/geo+json": { "source": "iana", "compressible": true, "extensions": ["geojson"] },
  "application/geo+json-seq": { "source": "iana" },
  "application/geopackage+sqlite3": { "source": "iana" },
  "application/geoxacml+xml": { "source": "iana", "compressible": true },
  "application/gltf-buffer": { "source": "iana" },
  "application/gml+xml": { "source": "iana", "compressible": true, "extensions": ["gml"] },
  "application/gpx+xml": { "source": "apache", "compressible": true, "extensions": ["gpx"] },
  "application/gxf": { "source": "apache", "extensions": ["gxf"] },
  "application/gzip": { "source": "iana", "compressible": false, "extensions": ["gz"] },
  "application/h224": { "source": "iana" },
  "application/held+xml": { "source": "iana", "compressible": true },
  "application/hjson": { "extensions": ["hjson"] },
  "application/http": { "source": "iana" },
  "application/hyperstudio": { "source": "iana", "extensions": ["stk"] },
  "application/ibe-key-request+xml": { "source": "iana", "compressible": true },
  "application/ibe-pkg-reply+xml": { "source": "iana", "compressible": true },
  "application/ibe-pp-data": { "source": "iana" },
  "application/iges": { "source": "iana" },
  "application/im-iscomposing+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/index": { "source": "iana" },
  "application/index.cmd": { "source": "iana" },
  "application/index.obj": { "source": "iana" },
  "application/index.response": { "source": "iana" },
  "application/index.vnd": { "source": "iana" },
  "application/inkml+xml": { "source": "iana", "compressible": true, "extensions": ["ink", "inkml"] },
  "application/iotp": { "source": "iana" },
  "application/ipfix": { "source": "iana", "extensions": ["ipfix"] },
  "application/ipp": { "source": "iana" },
  "application/isup": { "source": "iana" },
  "application/its+xml": { "source": "iana", "compressible": true, "extensions": ["its"] },
  "application/java-archive": { "source": "apache", "compressible": false, "extensions": ["jar", "war", "ear"] },
  "application/java-serialized-object": { "source": "apache", "compressible": false, "extensions": ["ser"] },
  "application/java-vm": { "source": "apache", "compressible": false, "extensions": ["class"] },
  "application/javascript": { "source": "iana", "charset": "UTF-8", "compressible": true, "extensions": ["js", "mjs"] },
  "application/jf2feed+json": { "source": "iana", "compressible": true },
  "application/jose": { "source": "iana" },
  "application/jose+json": { "source": "iana", "compressible": true },
  "application/jrd+json": { "source": "iana", "compressible": true },
  "application/jscalendar+json": { "source": "iana", "compressible": true },
  "application/json": { "source": "iana", "charset": "UTF-8", "compressible": true, "extensions": ["json", "map"] },
  "application/json-patch+json": { "source": "iana", "compressible": true },
  "application/json-seq": { "source": "iana" },
  "application/json5": { "extensions": ["json5"] },
  "application/jsonml+json": { "source": "apache", "compressible": true, "extensions": ["jsonml"] },
  "application/jwk+json": { "source": "iana", "compressible": true },
  "application/jwk-set+json": { "source": "iana", "compressible": true },
  "application/jwt": { "source": "iana" },
  "application/kpml-request+xml": { "source": "iana", "compressible": true },
  "application/kpml-response+xml": { "source": "iana", "compressible": true },
  "application/ld+json": { "source": "iana", "compressible": true, "extensions": ["jsonld"] },
  "application/lgr+xml": { "source": "iana", "compressible": true, "extensions": ["lgr"] },
  "application/link-format": { "source": "iana" },
  "application/load-control+xml": { "source": "iana", "compressible": true },
  "application/lost+xml": { "source": "iana", "compressible": true, "extensions": ["lostxml"] },
  "application/lostsync+xml": { "source": "iana", "compressible": true },
  "application/lpf+zip": { "source": "iana", "compressible": false },
  "application/lxf": { "source": "iana" },
  "application/mac-binhex40": { "source": "iana", "extensions": ["hqx"] },
  "application/mac-compactpro": { "source": "apache", "extensions": ["cpt"] },
  "application/macwriteii": { "source": "iana" },
  "application/mads+xml": { "source": "iana", "compressible": true, "extensions": ["mads"] },
  "application/manifest+json": { "source": "iana", "charset": "UTF-8", "compressible": true, "extensions": ["webmanifest"] },
  "application/marc": { "source": "iana", "extensions": ["mrc"] },
  "application/marcxml+xml": { "source": "iana", "compressible": true, "extensions": ["mrcx"] },
  "application/mathematica": { "source": "iana", "extensions": ["ma", "nb", "mb"] },
  "application/mathml+xml": { "source": "iana", "compressible": true, "extensions": ["mathml"] },
  "application/mathml-content+xml": { "source": "iana", "compressible": true },
  "application/mathml-presentation+xml": { "source": "iana", "compressible": true },
  "application/mbms-associated-procedure-description+xml": { "source": "iana", "compressible": true },
  "application/mbms-deregister+xml": { "source": "iana", "compressible": true },
  "application/mbms-envelope+xml": { "source": "iana", "compressible": true },
  "application/mbms-msk+xml": { "source": "iana", "compressible": true },
  "application/mbms-msk-response+xml": { "source": "iana", "compressible": true },
  "application/mbms-protection-description+xml": { "source": "iana", "compressible": true },
  "application/mbms-reception-report+xml": { "source": "iana", "compressible": true },
  "application/mbms-register+xml": { "source": "iana", "compressible": true },
  "application/mbms-register-response+xml": { "source": "iana", "compressible": true },
  "application/mbms-schedule+xml": { "source": "iana", "compressible": true },
  "application/mbms-user-service-description+xml": { "source": "iana", "compressible": true },
  "application/mbox": { "source": "iana", "extensions": ["mbox"] },
  "application/media-policy-dataset+xml": { "source": "iana", "compressible": true, "extensions": ["mpf"] },
  "application/media_control+xml": { "source": "iana", "compressible": true },
  "application/mediaservercontrol+xml": { "source": "iana", "compressible": true, "extensions": ["mscml"] },
  "application/merge-patch+json": { "source": "iana", "compressible": true },
  "application/metalink+xml": { "source": "apache", "compressible": true, "extensions": ["metalink"] },
  "application/metalink4+xml": { "source": "iana", "compressible": true, "extensions": ["meta4"] },
  "application/mets+xml": { "source": "iana", "compressible": true, "extensions": ["mets"] },
  "application/mf4": { "source": "iana" },
  "application/mikey": { "source": "iana" },
  "application/mipc": { "source": "iana" },
  "application/missing-blocks+cbor-seq": { "source": "iana" },
  "application/mmt-aei+xml": { "source": "iana", "compressible": true, "extensions": ["maei"] },
  "application/mmt-usd+xml": { "source": "iana", "compressible": true, "extensions": ["musd"] },
  "application/mods+xml": { "source": "iana", "compressible": true, "extensions": ["mods"] },
  "application/moss-keys": { "source": "iana" },
  "application/moss-signature": { "source": "iana" },
  "application/mosskey-data": { "source": "iana" },
  "application/mosskey-request": { "source": "iana" },
  "application/mp21": { "source": "iana", "extensions": ["m21", "mp21"] },
  "application/mp4": { "source": "iana", "extensions": ["mp4s", "m4p"] },
  "application/mpeg4-generic": { "source": "iana" },
  "application/mpeg4-iod": { "source": "iana" },
  "application/mpeg4-iod-xmt": { "source": "iana" },
  "application/mrb-consumer+xml": { "source": "iana", "compressible": true },
  "application/mrb-publish+xml": { "source": "iana", "compressible": true },
  "application/msc-ivr+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/msc-mixer+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/msword": { "source": "iana", "compressible": false, "extensions": ["doc", "dot"] },
  "application/mud+json": { "source": "iana", "compressible": true },
  "application/multipart-core": { "source": "iana" },
  "application/mxf": { "source": "iana", "extensions": ["mxf"] },
  "application/n-quads": { "source": "iana", "extensions": ["nq"] },
  "application/n-triples": { "source": "iana", "extensions": ["nt"] },
  "application/nasdata": { "source": "iana" },
  "application/news-checkgroups": { "source": "iana", "charset": "US-ASCII" },
  "application/news-groupinfo": { "source": "iana", "charset": "US-ASCII" },
  "application/news-transmission": { "source": "iana" },
  "application/nlsml+xml": { "source": "iana", "compressible": true },
  "application/node": { "source": "iana", "extensions": ["cjs"] },
  "application/nss": { "source": "iana" },
  "application/oauth-authz-req+jwt": { "source": "iana" },
  "application/oblivious-dns-message": { "source": "iana" },
  "application/ocsp-request": { "source": "iana" },
  "application/ocsp-response": { "source": "iana" },
  "application/octet-stream": { "source": "iana", "compressible": false, "extensions": ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"] },
  "application/oda": { "source": "iana", "extensions": ["oda"] },
  "application/odm+xml": { "source": "iana", "compressible": true },
  "application/odx": { "source": "iana" },
  "application/oebps-package+xml": { "source": "iana", "compressible": true, "extensions": ["opf"] },
  "application/ogg": { "source": "iana", "compressible": false, "extensions": ["ogx"] },
  "application/omdoc+xml": { "source": "apache", "compressible": true, "extensions": ["omdoc"] },
  "application/onenote": { "source": "apache", "extensions": ["onetoc", "onetoc2", "onetmp", "onepkg"] },
  "application/opc-nodeset+xml": { "source": "iana", "compressible": true },
  "application/oscore": { "source": "iana" },
  "application/oxps": { "source": "iana", "extensions": ["oxps"] },
  "application/p21": { "source": "iana" },
  "application/p21+zip": { "source": "iana", "compressible": false },
  "application/p2p-overlay+xml": { "source": "iana", "compressible": true, "extensions": ["relo"] },
  "application/parityfec": { "source": "iana" },
  "application/passport": { "source": "iana" },
  "application/patch-ops-error+xml": { "source": "iana", "compressible": true, "extensions": ["xer"] },
  "application/pdf": { "source": "iana", "compressible": false, "extensions": ["pdf"] },
  "application/pdx": { "source": "iana" },
  "application/pem-certificate-chain": { "source": "iana" },
  "application/pgp-encrypted": { "source": "iana", "compressible": false, "extensions": ["pgp"] },
  "application/pgp-keys": { "source": "iana", "extensions": ["asc"] },
  "application/pgp-signature": { "source": "iana", "extensions": ["asc", "sig"] },
  "application/pics-rules": { "source": "apache", "extensions": ["prf"] },
  "application/pidf+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/pidf-diff+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/pkcs10": { "source": "iana", "extensions": ["p10"] },
  "application/pkcs12": { "source": "iana" },
  "application/pkcs7-mime": { "source": "iana", "extensions": ["p7m", "p7c"] },
  "application/pkcs7-signature": { "source": "iana", "extensions": ["p7s"] },
  "application/pkcs8": { "source": "iana", "extensions": ["p8"] },
  "application/pkcs8-encrypted": { "source": "iana" },
  "application/pkix-attr-cert": { "source": "iana", "extensions": ["ac"] },
  "application/pkix-cert": { "source": "iana", "extensions": ["cer"] },
  "application/pkix-crl": { "source": "iana", "extensions": ["crl"] },
  "application/pkix-pkipath": { "source": "iana", "extensions": ["pkipath"] },
  "application/pkixcmp": { "source": "iana", "extensions": ["pki"] },
  "application/pls+xml": { "source": "iana", "compressible": true, "extensions": ["pls"] },
  "application/poc-settings+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/postscript": { "source": "iana", "compressible": true, "extensions": ["ai", "eps", "ps"] },
  "application/ppsp-tracker+json": { "source": "iana", "compressible": true },
  "application/problem+json": { "source": "iana", "compressible": true },
  "application/problem+xml": { "source": "iana", "compressible": true },
  "application/provenance+xml": { "source": "iana", "compressible": true, "extensions": ["provx"] },
  "application/prs.alvestrand.titrax-sheet": { "source": "iana" },
  "application/prs.cww": { "source": "iana", "extensions": ["cww"] },
  "application/prs.cyn": { "source": "iana", "charset": "7-BIT" },
  "application/prs.hpub+zip": { "source": "iana", "compressible": false },
  "application/prs.nprend": { "source": "iana" },
  "application/prs.plucker": { "source": "iana" },
  "application/prs.rdf-xml-crypt": { "source": "iana" },
  "application/prs.xsf+xml": { "source": "iana", "compressible": true },
  "application/pskc+xml": { "source": "iana", "compressible": true, "extensions": ["pskcxml"] },
  "application/pvd+json": { "source": "iana", "compressible": true },
  "application/qsig": { "source": "iana" },
  "application/raml+yaml": { "compressible": true, "extensions": ["raml"] },
  "application/raptorfec": { "source": "iana" },
  "application/rdap+json": { "source": "iana", "compressible": true },
  "application/rdf+xml": { "source": "iana", "compressible": true, "extensions": ["rdf", "owl"] },
  "application/reginfo+xml": { "source": "iana", "compressible": true, "extensions": ["rif"] },
  "application/relax-ng-compact-syntax": { "source": "iana", "extensions": ["rnc"] },
  "application/remote-printing": { "source": "iana" },
  "application/reputon+json": { "source": "iana", "compressible": true },
  "application/resource-lists+xml": { "source": "iana", "compressible": true, "extensions": ["rl"] },
  "application/resource-lists-diff+xml": { "source": "iana", "compressible": true, "extensions": ["rld"] },
  "application/rfc+xml": { "source": "iana", "compressible": true },
  "application/riscos": { "source": "iana" },
  "application/rlmi+xml": { "source": "iana", "compressible": true },
  "application/rls-services+xml": { "source": "iana", "compressible": true, "extensions": ["rs"] },
  "application/route-apd+xml": { "source": "iana", "compressible": true, "extensions": ["rapd"] },
  "application/route-s-tsid+xml": { "source": "iana", "compressible": true, "extensions": ["sls"] },
  "application/route-usd+xml": { "source": "iana", "compressible": true, "extensions": ["rusd"] },
  "application/rpki-ghostbusters": { "source": "iana", "extensions": ["gbr"] },
  "application/rpki-manifest": { "source": "iana", "extensions": ["mft"] },
  "application/rpki-publication": { "source": "iana" },
  "application/rpki-roa": { "source": "iana", "extensions": ["roa"] },
  "application/rpki-updown": { "source": "iana" },
  "application/rsd+xml": { "source": "apache", "compressible": true, "extensions": ["rsd"] },
  "application/rss+xml": { "source": "apache", "compressible": true, "extensions": ["rss"] },
  "application/rtf": { "source": "iana", "compressible": true, "extensions": ["rtf"] },
  "application/rtploopback": { "source": "iana" },
  "application/rtx": { "source": "iana" },
  "application/samlassertion+xml": { "source": "iana", "compressible": true },
  "application/samlmetadata+xml": { "source": "iana", "compressible": true },
  "application/sarif+json": { "source": "iana", "compressible": true },
  "application/sarif-external-properties+json": { "source": "iana", "compressible": true },
  "application/sbe": { "source": "iana" },
  "application/sbml+xml": { "source": "iana", "compressible": true, "extensions": ["sbml"] },
  "application/scaip+xml": { "source": "iana", "compressible": true },
  "application/scim+json": { "source": "iana", "compressible": true },
  "application/scvp-cv-request": { "source": "iana", "extensions": ["scq"] },
  "application/scvp-cv-response": { "source": "iana", "extensions": ["scs"] },
  "application/scvp-vp-request": { "source": "iana", "extensions": ["spq"] },
  "application/scvp-vp-response": { "source": "iana", "extensions": ["spp"] },
  "application/sdp": { "source": "iana", "extensions": ["sdp"] },
  "application/secevent+jwt": { "source": "iana" },
  "application/senml+cbor": { "source": "iana" },
  "application/senml+json": { "source": "iana", "compressible": true },
  "application/senml+xml": { "source": "iana", "compressible": true, "extensions": ["senmlx"] },
  "application/senml-etch+cbor": { "source": "iana" },
  "application/senml-etch+json": { "source": "iana", "compressible": true },
  "application/senml-exi": { "source": "iana" },
  "application/sensml+cbor": { "source": "iana" },
  "application/sensml+json": { "source": "iana", "compressible": true },
  "application/sensml+xml": { "source": "iana", "compressible": true, "extensions": ["sensmlx"] },
  "application/sensml-exi": { "source": "iana" },
  "application/sep+xml": { "source": "iana", "compressible": true },
  "application/sep-exi": { "source": "iana" },
  "application/session-info": { "source": "iana" },
  "application/set-payment": { "source": "iana" },
  "application/set-payment-initiation": { "source": "iana", "extensions": ["setpay"] },
  "application/set-registration": { "source": "iana" },
  "application/set-registration-initiation": { "source": "iana", "extensions": ["setreg"] },
  "application/sgml": { "source": "iana" },
  "application/sgml-open-catalog": { "source": "iana" },
  "application/shf+xml": { "source": "iana", "compressible": true, "extensions": ["shf"] },
  "application/sieve": { "source": "iana", "extensions": ["siv", "sieve"] },
  "application/simple-filter+xml": { "source": "iana", "compressible": true },
  "application/simple-message-summary": { "source": "iana" },
  "application/simplesymbolcontainer": { "source": "iana" },
  "application/sipc": { "source": "iana" },
  "application/slate": { "source": "iana" },
  "application/smil": { "source": "iana" },
  "application/smil+xml": { "source": "iana", "compressible": true, "extensions": ["smi", "smil"] },
  "application/smpte336m": { "source": "iana" },
  "application/soap+fastinfoset": { "source": "iana" },
  "application/soap+xml": { "source": "iana", "compressible": true },
  "application/sparql-query": { "source": "iana", "extensions": ["rq"] },
  "application/sparql-results+xml": { "source": "iana", "compressible": true, "extensions": ["srx"] },
  "application/spdx+json": { "source": "iana", "compressible": true },
  "application/spirits-event+xml": { "source": "iana", "compressible": true },
  "application/sql": { "source": "iana" },
  "application/srgs": { "source": "iana", "extensions": ["gram"] },
  "application/srgs+xml": { "source": "iana", "compressible": true, "extensions": ["grxml"] },
  "application/sru+xml": { "source": "iana", "compressible": true, "extensions": ["sru"] },
  "application/ssdl+xml": { "source": "apache", "compressible": true, "extensions": ["ssdl"] },
  "application/ssml+xml": { "source": "iana", "compressible": true, "extensions": ["ssml"] },
  "application/stix+json": { "source": "iana", "compressible": true },
  "application/swid+xml": { "source": "iana", "compressible": true, "extensions": ["swidtag"] },
  "application/tamp-apex-update": { "source": "iana" },
  "application/tamp-apex-update-confirm": { "source": "iana" },
  "application/tamp-community-update": { "source": "iana" },
  "application/tamp-community-update-confirm": { "source": "iana" },
  "application/tamp-error": { "source": "iana" },
  "application/tamp-sequence-adjust": { "source": "iana" },
  "application/tamp-sequence-adjust-confirm": { "source": "iana" },
  "application/tamp-status-query": { "source": "iana" },
  "application/tamp-status-response": { "source": "iana" },
  "application/tamp-update": { "source": "iana" },
  "application/tamp-update-confirm": { "source": "iana" },
  "application/tar": { "compressible": true },
  "application/taxii+json": { "source": "iana", "compressible": true },
  "application/td+json": { "source": "iana", "compressible": true },
  "application/tei+xml": { "source": "iana", "compressible": true, "extensions": ["tei", "teicorpus"] },
  "application/tetra_isi": { "source": "iana" },
  "application/thraud+xml": { "source": "iana", "compressible": true, "extensions": ["tfi"] },
  "application/timestamp-query": { "source": "iana" },
  "application/timestamp-reply": { "source": "iana" },
  "application/timestamped-data": { "source": "iana", "extensions": ["tsd"] },
  "application/tlsrpt+gzip": { "source": "iana" },
  "application/tlsrpt+json": { "source": "iana", "compressible": true },
  "application/tnauthlist": { "source": "iana" },
  "application/token-introspection+jwt": { "source": "iana" },
  "application/toml": { "compressible": true, "extensions": ["toml"] },
  "application/trickle-ice-sdpfrag": { "source": "iana" },
  "application/trig": { "source": "iana", "extensions": ["trig"] },
  "application/ttml+xml": { "source": "iana", "compressible": true, "extensions": ["ttml"] },
  "application/tve-trigger": { "source": "iana" },
  "application/tzif": { "source": "iana" },
  "application/tzif-leap": { "source": "iana" },
  "application/ubjson": { "compressible": false, "extensions": ["ubj"] },
  "application/ulpfec": { "source": "iana" },
  "application/urc-grpsheet+xml": { "source": "iana", "compressible": true },
  "application/urc-ressheet+xml": { "source": "iana", "compressible": true, "extensions": ["rsheet"] },
  "application/urc-targetdesc+xml": { "source": "iana", "compressible": true, "extensions": ["td"] },
  "application/urc-uisocketdesc+xml": { "source": "iana", "compressible": true },
  "application/vcard+json": { "source": "iana", "compressible": true },
  "application/vcard+xml": { "source": "iana", "compressible": true },
  "application/vemmi": { "source": "iana" },
  "application/vividence.scriptfile": { "source": "apache" },
  "application/vnd.1000minds.decision-model+xml": { "source": "iana", "compressible": true, "extensions": ["1km"] },
  "application/vnd.3gpp-prose+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp-prose-pc3ch+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp-v2x-local-service-information": { "source": "iana" },
  "application/vnd.3gpp.5gnas": { "source": "iana" },
  "application/vnd.3gpp.access-transfer-events+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.bsf+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.gmop+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.gtpc": { "source": "iana" },
  "application/vnd.3gpp.interworking-data": { "source": "iana" },
  "application/vnd.3gpp.lpp": { "source": "iana" },
  "application/vnd.3gpp.mc-signalling-ear": { "source": "iana" },
  "application/vnd.3gpp.mcdata-affiliation-command+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcdata-info+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcdata-payload": { "source": "iana" },
  "application/vnd.3gpp.mcdata-service-config+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcdata-signalling": { "source": "iana" },
  "application/vnd.3gpp.mcdata-ue-config+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcdata-user-profile+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcptt-affiliation-command+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcptt-floor-request+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcptt-info+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcptt-location-info+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcptt-mbms-usage-info+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcptt-service-config+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcptt-signed+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcptt-ue-config+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcptt-ue-init-config+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcptt-user-profile+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcvideo-affiliation-command+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcvideo-affiliation-info+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcvideo-info+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcvideo-location-info+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcvideo-service-config+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcvideo-transmission-request+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcvideo-ue-config+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mcvideo-user-profile+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.mid-call+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.ngap": { "source": "iana" },
  "application/vnd.3gpp.pfcp": { "source": "iana" },
  "application/vnd.3gpp.pic-bw-large": { "source": "iana", "extensions": ["plb"] },
  "application/vnd.3gpp.pic-bw-small": { "source": "iana", "extensions": ["psb"] },
  "application/vnd.3gpp.pic-bw-var": { "source": "iana", "extensions": ["pvb"] },
  "application/vnd.3gpp.s1ap": { "source": "iana" },
  "application/vnd.3gpp.sms": { "source": "iana" },
  "application/vnd.3gpp.sms+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.srvcc-ext+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.srvcc-info+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.state-and-event-info+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp.ussd+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp2.bcmcsinfo+xml": { "source": "iana", "compressible": true },
  "application/vnd.3gpp2.sms": { "source": "iana" },
  "application/vnd.3gpp2.tcap": { "source": "iana", "extensions": ["tcap"] },
  "application/vnd.3lightssoftware.imagescal": { "source": "iana" },
  "application/vnd.3m.post-it-notes": { "source": "iana", "extensions": ["pwn"] },
  "application/vnd.accpac.simply.aso": { "source": "iana", "extensions": ["aso"] },
  "application/vnd.accpac.simply.imp": { "source": "iana", "extensions": ["imp"] },
  "application/vnd.acucobol": { "source": "iana", "extensions": ["acu"] },
  "application/vnd.acucorp": { "source": "iana", "extensions": ["atc", "acutc"] },
  "application/vnd.adobe.air-application-installer-package+zip": { "source": "apache", "compressible": false, "extensions": ["air"] },
  "application/vnd.adobe.flash.movie": { "source": "iana" },
  "application/vnd.adobe.formscentral.fcdt": { "source": "iana", "extensions": ["fcdt"] },
  "application/vnd.adobe.fxp": { "source": "iana", "extensions": ["fxp", "fxpl"] },
  "application/vnd.adobe.partial-upload": { "source": "iana" },
  "application/vnd.adobe.xdp+xml": { "source": "iana", "compressible": true, "extensions": ["xdp"] },
  "application/vnd.adobe.xfdf": { "source": "iana", "extensions": ["xfdf"] },
  "application/vnd.aether.imp": { "source": "iana" },
  "application/vnd.afpc.afplinedata": { "source": "iana" },
  "application/vnd.afpc.afplinedata-pagedef": { "source": "iana" },
  "application/vnd.afpc.cmoca-cmresource": { "source": "iana" },
  "application/vnd.afpc.foca-charset": { "source": "iana" },
  "application/vnd.afpc.foca-codedfont": { "source": "iana" },
  "application/vnd.afpc.foca-codepage": { "source": "iana" },
  "application/vnd.afpc.modca": { "source": "iana" },
  "application/vnd.afpc.modca-cmtable": { "source": "iana" },
  "application/vnd.afpc.modca-formdef": { "source": "iana" },
  "application/vnd.afpc.modca-mediummap": { "source": "iana" },
  "application/vnd.afpc.modca-objectcontainer": { "source": "iana" },
  "application/vnd.afpc.modca-overlay": { "source": "iana" },
  "application/vnd.afpc.modca-pagesegment": { "source": "iana" },
  "application/vnd.age": { "source": "iana", "extensions": ["age"] },
  "application/vnd.ah-barcode": { "source": "iana" },
  "application/vnd.ahead.space": { "source": "iana", "extensions": ["ahead"] },
  "application/vnd.airzip.filesecure.azf": { "source": "iana", "extensions": ["azf"] },
  "application/vnd.airzip.filesecure.azs": { "source": "iana", "extensions": ["azs"] },
  "application/vnd.amadeus+json": { "source": "iana", "compressible": true },
  "application/vnd.amazon.ebook": { "source": "apache", "extensions": ["azw"] },
  "application/vnd.amazon.mobi8-ebook": { "source": "iana" },
  "application/vnd.americandynamics.acc": { "source": "iana", "extensions": ["acc"] },
  "application/vnd.amiga.ami": { "source": "iana", "extensions": ["ami"] },
  "application/vnd.amundsen.maze+xml": { "source": "iana", "compressible": true },
  "application/vnd.android.ota": { "source": "iana" },
  "application/vnd.android.package-archive": { "source": "apache", "compressible": false, "extensions": ["apk"] },
  "application/vnd.anki": { "source": "iana" },
  "application/vnd.anser-web-certificate-issue-initiation": { "source": "iana", "extensions": ["cii"] },
  "application/vnd.anser-web-funds-transfer-initiation": { "source": "apache", "extensions": ["fti"] },
  "application/vnd.antix.game-component": { "source": "iana", "extensions": ["atx"] },
  "application/vnd.apache.arrow.file": { "source": "iana" },
  "application/vnd.apache.arrow.stream": { "source": "iana" },
  "application/vnd.apache.thrift.binary": { "source": "iana" },
  "application/vnd.apache.thrift.compact": { "source": "iana" },
  "application/vnd.apache.thrift.json": { "source": "iana" },
  "application/vnd.api+json": { "source": "iana", "compressible": true },
  "application/vnd.aplextor.warrp+json": { "source": "iana", "compressible": true },
  "application/vnd.apothekende.reservation+json": { "source": "iana", "compressible": true },
  "application/vnd.apple.installer+xml": { "source": "iana", "compressible": true, "extensions": ["mpkg"] },
  "application/vnd.apple.keynote": { "source": "iana", "extensions": ["key"] },
  "application/vnd.apple.mpegurl": { "source": "iana", "extensions": ["m3u8"] },
  "application/vnd.apple.numbers": { "source": "iana", "extensions": ["numbers"] },
  "application/vnd.apple.pages": { "source": "iana", "extensions": ["pages"] },
  "application/vnd.apple.pkpass": { "compressible": false, "extensions": ["pkpass"] },
  "application/vnd.arastra.swi": { "source": "iana" },
  "application/vnd.aristanetworks.swi": { "source": "iana", "extensions": ["swi"] },
  "application/vnd.artisan+json": { "source": "iana", "compressible": true },
  "application/vnd.artsquare": { "source": "iana" },
  "application/vnd.astraea-software.iota": { "source": "iana", "extensions": ["iota"] },
  "application/vnd.audiograph": { "source": "iana", "extensions": ["aep"] },
  "application/vnd.autopackage": { "source": "iana" },
  "application/vnd.avalon+json": { "source": "iana", "compressible": true },
  "application/vnd.avistar+xml": { "source": "iana", "compressible": true },
  "application/vnd.balsamiq.bmml+xml": { "source": "iana", "compressible": true, "extensions": ["bmml"] },
  "application/vnd.balsamiq.bmpr": { "source": "iana" },
  "application/vnd.banana-accounting": { "source": "iana" },
  "application/vnd.bbf.usp.error": { "source": "iana" },
  "application/vnd.bbf.usp.msg": { "source": "iana" },
  "application/vnd.bbf.usp.msg+json": { "source": "iana", "compressible": true },
  "application/vnd.bekitzur-stech+json": { "source": "iana", "compressible": true },
  "application/vnd.bint.med-content": { "source": "iana" },
  "application/vnd.biopax.rdf+xml": { "source": "iana", "compressible": true },
  "application/vnd.blink-idb-value-wrapper": { "source": "iana" },
  "application/vnd.blueice.multipass": { "source": "iana", "extensions": ["mpm"] },
  "application/vnd.bluetooth.ep.oob": { "source": "iana" },
  "application/vnd.bluetooth.le.oob": { "source": "iana" },
  "application/vnd.bmi": { "source": "iana", "extensions": ["bmi"] },
  "application/vnd.bpf": { "source": "iana" },
  "application/vnd.bpf3": { "source": "iana" },
  "application/vnd.businessobjects": { "source": "iana", "extensions": ["rep"] },
  "application/vnd.byu.uapi+json": { "source": "iana", "compressible": true },
  "application/vnd.cab-jscript": { "source": "iana" },
  "application/vnd.canon-cpdl": { "source": "iana" },
  "application/vnd.canon-lips": { "source": "iana" },
  "application/vnd.capasystems-pg+json": { "source": "iana", "compressible": true },
  "application/vnd.cendio.thinlinc.clientconf": { "source": "iana" },
  "application/vnd.century-systems.tcp_stream": { "source": "iana" },
  "application/vnd.chemdraw+xml": { "source": "iana", "compressible": true, "extensions": ["cdxml"] },
  "application/vnd.chess-pgn": { "source": "iana" },
  "application/vnd.chipnuts.karaoke-mmd": { "source": "iana", "extensions": ["mmd"] },
  "application/vnd.ciedi": { "source": "iana" },
  "application/vnd.cinderella": { "source": "iana", "extensions": ["cdy"] },
  "application/vnd.cirpack.isdn-ext": { "source": "iana" },
  "application/vnd.citationstyles.style+xml": { "source": "iana", "compressible": true, "extensions": ["csl"] },
  "application/vnd.claymore": { "source": "iana", "extensions": ["cla"] },
  "application/vnd.cloanto.rp9": { "source": "iana", "extensions": ["rp9"] },
  "application/vnd.clonk.c4group": { "source": "iana", "extensions": ["c4g", "c4d", "c4f", "c4p", "c4u"] },
  "application/vnd.cluetrust.cartomobile-config": { "source": "iana", "extensions": ["c11amc"] },
  "application/vnd.cluetrust.cartomobile-config-pkg": { "source": "iana", "extensions": ["c11amz"] },
  "application/vnd.coffeescript": { "source": "iana" },
  "application/vnd.collabio.xodocuments.document": { "source": "iana" },
  "application/vnd.collabio.xodocuments.document-template": { "source": "iana" },
  "application/vnd.collabio.xodocuments.presentation": { "source": "iana" },
  "application/vnd.collabio.xodocuments.presentation-template": { "source": "iana" },
  "application/vnd.collabio.xodocuments.spreadsheet": { "source": "iana" },
  "application/vnd.collabio.xodocuments.spreadsheet-template": { "source": "iana" },
  "application/vnd.collection+json": { "source": "iana", "compressible": true },
  "application/vnd.collection.doc+json": { "source": "iana", "compressible": true },
  "application/vnd.collection.next+json": { "source": "iana", "compressible": true },
  "application/vnd.comicbook+zip": { "source": "iana", "compressible": false },
  "application/vnd.comicbook-rar": { "source": "iana" },
  "application/vnd.commerce-battelle": { "source": "iana" },
  "application/vnd.commonspace": { "source": "iana", "extensions": ["csp"] },
  "application/vnd.contact.cmsg": { "source": "iana", "extensions": ["cdbcmsg"] },
  "application/vnd.coreos.ignition+json": { "source": "iana", "compressible": true },
  "application/vnd.cosmocaller": { "source": "iana", "extensions": ["cmc"] },
  "application/vnd.crick.clicker": { "source": "iana", "extensions": ["clkx"] },
  "application/vnd.crick.clicker.keyboard": { "source": "iana", "extensions": ["clkk"] },
  "application/vnd.crick.clicker.palette": { "source": "iana", "extensions": ["clkp"] },
  "application/vnd.crick.clicker.template": { "source": "iana", "extensions": ["clkt"] },
  "application/vnd.crick.clicker.wordbank": { "source": "iana", "extensions": ["clkw"] },
  "application/vnd.criticaltools.wbs+xml": { "source": "iana", "compressible": true, "extensions": ["wbs"] },
  "application/vnd.cryptii.pipe+json": { "source": "iana", "compressible": true },
  "application/vnd.crypto-shade-file": { "source": "iana" },
  "application/vnd.cryptomator.encrypted": { "source": "iana" },
  "application/vnd.cryptomator.vault": { "source": "iana" },
  "application/vnd.ctc-posml": { "source": "iana", "extensions": ["pml"] },
  "application/vnd.ctct.ws+xml": { "source": "iana", "compressible": true },
  "application/vnd.cups-pdf": { "source": "iana" },
  "application/vnd.cups-postscript": { "source": "iana" },
  "application/vnd.cups-ppd": { "source": "iana", "extensions": ["ppd"] },
  "application/vnd.cups-raster": { "source": "iana" },
  "application/vnd.cups-raw": { "source": "iana" },
  "application/vnd.curl": { "source": "iana" },
  "application/vnd.curl.car": { "source": "apache", "extensions": ["car"] },
  "application/vnd.curl.pcurl": { "source": "apache", "extensions": ["pcurl"] },
  "application/vnd.cyan.dean.root+xml": { "source": "iana", "compressible": true },
  "application/vnd.cybank": { "source": "iana" },
  "application/vnd.cyclonedx+json": { "source": "iana", "compressible": true },
  "application/vnd.cyclonedx+xml": { "source": "iana", "compressible": true },
  "application/vnd.d2l.coursepackage1p0+zip": { "source": "iana", "compressible": false },
  "application/vnd.d3m-dataset": { "source": "iana" },
  "application/vnd.d3m-problem": { "source": "iana" },
  "application/vnd.dart": { "source": "iana", "compressible": true, "extensions": ["dart"] },
  "application/vnd.data-vision.rdz": { "source": "iana", "extensions": ["rdz"] },
  "application/vnd.datapackage+json": { "source": "iana", "compressible": true },
  "application/vnd.dataresource+json": { "source": "iana", "compressible": true },
  "application/vnd.dbf": { "source": "iana", "extensions": ["dbf"] },
  "application/vnd.debian.binary-package": { "source": "iana" },
  "application/vnd.dece.data": { "source": "iana", "extensions": ["uvf", "uvvf", "uvd", "uvvd"] },
  "application/vnd.dece.ttml+xml": { "source": "iana", "compressible": true, "extensions": ["uvt", "uvvt"] },
  "application/vnd.dece.unspecified": { "source": "iana", "extensions": ["uvx", "uvvx"] },
  "application/vnd.dece.zip": { "source": "iana", "extensions": ["uvz", "uvvz"] },
  "application/vnd.denovo.fcselayout-link": { "source": "iana", "extensions": ["fe_launch"] },
  "application/vnd.desmume.movie": { "source": "iana" },
  "application/vnd.dir-bi.plate-dl-nosuffix": { "source": "iana" },
  "application/vnd.dm.delegation+xml": { "source": "iana", "compressible": true },
  "application/vnd.dna": { "source": "iana", "extensions": ["dna"] },
  "application/vnd.document+json": { "source": "iana", "compressible": true },
  "application/vnd.dolby.mlp": { "source": "apache", "extensions": ["mlp"] },
  "application/vnd.dolby.mobile.1": { "source": "iana" },
  "application/vnd.dolby.mobile.2": { "source": "iana" },
  "application/vnd.doremir.scorecloud-binary-document": { "source": "iana" },
  "application/vnd.dpgraph": { "source": "iana", "extensions": ["dpg"] },
  "application/vnd.dreamfactory": { "source": "iana", "extensions": ["dfac"] },
  "application/vnd.drive+json": { "source": "iana", "compressible": true },
  "application/vnd.ds-keypoint": { "source": "apache", "extensions": ["kpxx"] },
  "application/vnd.dtg.local": { "source": "iana" },
  "application/vnd.dtg.local.flash": { "source": "iana" },
  "application/vnd.dtg.local.html": { "source": "iana" },
  "application/vnd.dvb.ait": { "source": "iana", "extensions": ["ait"] },
  "application/vnd.dvb.dvbisl+xml": { "source": "iana", "compressible": true },
  "application/vnd.dvb.dvbj": { "source": "iana" },
  "application/vnd.dvb.esgcontainer": { "source": "iana" },
  "application/vnd.dvb.ipdcdftnotifaccess": { "source": "iana" },
  "application/vnd.dvb.ipdcesgaccess": { "source": "iana" },
  "application/vnd.dvb.ipdcesgaccess2": { "source": "iana" },
  "application/vnd.dvb.ipdcesgpdd": { "source": "iana" },
  "application/vnd.dvb.ipdcroaming": { "source": "iana" },
  "application/vnd.dvb.iptv.alfec-base": { "source": "iana" },
  "application/vnd.dvb.iptv.alfec-enhancement": { "source": "iana" },
  "application/vnd.dvb.notif-aggregate-root+xml": { "source": "iana", "compressible": true },
  "application/vnd.dvb.notif-container+xml": { "source": "iana", "compressible": true },
  "application/vnd.dvb.notif-generic+xml": { "source": "iana", "compressible": true },
  "application/vnd.dvb.notif-ia-msglist+xml": { "source": "iana", "compressible": true },
  "application/vnd.dvb.notif-ia-registration-request+xml": { "source": "iana", "compressible": true },
  "application/vnd.dvb.notif-ia-registration-response+xml": { "source": "iana", "compressible": true },
  "application/vnd.dvb.notif-init+xml": { "source": "iana", "compressible": true },
  "application/vnd.dvb.pfr": { "source": "iana" },
  "application/vnd.dvb.service": { "source": "iana", "extensions": ["svc"] },
  "application/vnd.dxr": { "source": "iana" },
  "application/vnd.dynageo": { "source": "iana", "extensions": ["geo"] },
  "application/vnd.dzr": { "source": "iana" },
  "application/vnd.easykaraoke.cdgdownload": { "source": "iana" },
  "application/vnd.ecdis-update": { "source": "iana" },
  "application/vnd.ecip.rlp": { "source": "iana" },
  "application/vnd.eclipse.ditto+json": { "source": "iana", "compressible": true },
  "application/vnd.ecowin.chart": { "source": "iana", "extensions": ["mag"] },
  "application/vnd.ecowin.filerequest": { "source": "iana" },
  "application/vnd.ecowin.fileupdate": { "source": "iana" },
  "application/vnd.ecowin.series": { "source": "iana" },
  "application/vnd.ecowin.seriesrequest": { "source": "iana" },
  "application/vnd.ecowin.seriesupdate": { "source": "iana" },
  "application/vnd.efi.img": { "source": "iana" },
  "application/vnd.efi.iso": { "source": "iana" },
  "application/vnd.emclient.accessrequest+xml": { "source": "iana", "compressible": true },
  "application/vnd.enliven": { "source": "iana", "extensions": ["nml"] },
  "application/vnd.enphase.envoy": { "source": "iana" },
  "application/vnd.eprints.data+xml": { "source": "iana", "compressible": true },
  "application/vnd.epson.esf": { "source": "iana", "extensions": ["esf"] },
  "application/vnd.epson.msf": { "source": "iana", "extensions": ["msf"] },
  "application/vnd.epson.quickanime": { "source": "iana", "extensions": ["qam"] },
  "application/vnd.epson.salt": { "source": "iana", "extensions": ["slt"] },
  "application/vnd.epson.ssf": { "source": "iana", "extensions": ["ssf"] },
  "application/vnd.ericsson.quickcall": { "source": "iana" },
  "application/vnd.espass-espass+zip": { "source": "iana", "compressible": false },
  "application/vnd.eszigno3+xml": { "source": "iana", "compressible": true, "extensions": ["es3", "et3"] },
  "application/vnd.etsi.aoc+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.asic-e+zip": { "source": "iana", "compressible": false },
  "application/vnd.etsi.asic-s+zip": { "source": "iana", "compressible": false },
  "application/vnd.etsi.cug+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.iptvcommand+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.iptvdiscovery+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.iptvprofile+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.iptvsad-bc+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.iptvsad-cod+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.iptvsad-npvr+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.iptvservice+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.iptvsync+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.iptvueprofile+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.mcid+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.mheg5": { "source": "iana" },
  "application/vnd.etsi.overload-control-policy-dataset+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.pstn+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.sci+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.simservs+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.timestamp-token": { "source": "iana" },
  "application/vnd.etsi.tsl+xml": { "source": "iana", "compressible": true },
  "application/vnd.etsi.tsl.der": { "source": "iana" },
  "application/vnd.eu.kasparian.car+json": { "source": "iana", "compressible": true },
  "application/vnd.eudora.data": { "source": "iana" },
  "application/vnd.evolv.ecig.profile": { "source": "iana" },
  "application/vnd.evolv.ecig.settings": { "source": "iana" },
  "application/vnd.evolv.ecig.theme": { "source": "iana" },
  "application/vnd.exstream-empower+zip": { "source": "iana", "compressible": false },
  "application/vnd.exstream-package": { "source": "iana" },
  "application/vnd.ezpix-album": { "source": "iana", "extensions": ["ez2"] },
  "application/vnd.ezpix-package": { "source": "iana", "extensions": ["ez3"] },
  "application/vnd.f-secure.mobile": { "source": "iana" },
  "application/vnd.familysearch.gedcom+zip": { "source": "iana", "compressible": false },
  "application/vnd.fastcopy-disk-image": { "source": "iana" },
  "application/vnd.fdf": { "source": "iana", "extensions": ["fdf"] },
  "application/vnd.fdsn.mseed": { "source": "iana", "extensions": ["mseed"] },
  "application/vnd.fdsn.seed": { "source": "iana", "extensions": ["seed", "dataless"] },
  "application/vnd.ffsns": { "source": "iana" },
  "application/vnd.ficlab.flb+zip": { "source": "iana", "compressible": false },
  "application/vnd.filmit.zfc": { "source": "iana" },
  "application/vnd.fints": { "source": "iana" },
  "application/vnd.firemonkeys.cloudcell": { "source": "iana" },
  "application/vnd.flographit": { "source": "iana", "extensions": ["gph"] },
  "application/vnd.fluxtime.clip": { "source": "iana", "extensions": ["ftc"] },
  "application/vnd.font-fontforge-sfd": { "source": "iana" },
  "application/vnd.framemaker": { "source": "iana", "extensions": ["fm", "frame", "maker", "book"] },
  "application/vnd.frogans.fnc": { "source": "iana", "extensions": ["fnc"] },
  "application/vnd.frogans.ltf": { "source": "iana", "extensions": ["ltf"] },
  "application/vnd.fsc.weblaunch": { "source": "iana", "extensions": ["fsc"] },
  "application/vnd.fujifilm.fb.docuworks": { "source": "iana" },
  "application/vnd.fujifilm.fb.docuworks.binder": { "source": "iana" },
  "application/vnd.fujifilm.fb.docuworks.container": { "source": "iana" },
  "application/vnd.fujifilm.fb.jfi+xml": { "source": "iana", "compressible": true },
  "application/vnd.fujitsu.oasys": { "source": "iana", "extensions": ["oas"] },
  "application/vnd.fujitsu.oasys2": { "source": "iana", "extensions": ["oa2"] },
  "application/vnd.fujitsu.oasys3": { "source": "iana", "extensions": ["oa3"] },
  "application/vnd.fujitsu.oasysgp": { "source": "iana", "extensions": ["fg5"] },
  "application/vnd.fujitsu.oasysprs": { "source": "iana", "extensions": ["bh2"] },
  "application/vnd.fujixerox.art-ex": { "source": "iana" },
  "application/vnd.fujixerox.art4": { "source": "iana" },
  "application/vnd.fujixerox.ddd": { "source": "iana", "extensions": ["ddd"] },
  "application/vnd.fujixerox.docuworks": { "source": "iana", "extensions": ["xdw"] },
  "application/vnd.fujixerox.docuworks.binder": { "source": "iana", "extensions": ["xbd"] },
  "application/vnd.fujixerox.docuworks.container": { "source": "iana" },
  "application/vnd.fujixerox.hbpl": { "source": "iana" },
  "application/vnd.fut-misnet": { "source": "iana" },
  "application/vnd.futoin+cbor": { "source": "iana" },
  "application/vnd.futoin+json": { "source": "iana", "compressible": true },
  "application/vnd.fuzzysheet": { "source": "iana", "extensions": ["fzs"] },
  "application/vnd.genomatix.tuxedo": { "source": "iana", "extensions": ["txd"] },
  "application/vnd.gentics.grd+json": { "source": "iana", "compressible": true },
  "application/vnd.geo+json": { "source": "iana", "compressible": true },
  "application/vnd.geocube+xml": { "source": "iana", "compressible": true },
  "application/vnd.geogebra.file": { "source": "iana", "extensions": ["ggb"] },
  "application/vnd.geogebra.slides": { "source": "iana" },
  "application/vnd.geogebra.tool": { "source": "iana", "extensions": ["ggt"] },
  "application/vnd.geometry-explorer": { "source": "iana", "extensions": ["gex", "gre"] },
  "application/vnd.geonext": { "source": "iana", "extensions": ["gxt"] },
  "application/vnd.geoplan": { "source": "iana", "extensions": ["g2w"] },
  "application/vnd.geospace": { "source": "iana", "extensions": ["g3w"] },
  "application/vnd.gerber": { "source": "iana" },
  "application/vnd.globalplatform.card-content-mgt": { "source": "iana" },
  "application/vnd.globalplatform.card-content-mgt-response": { "source": "iana" },
  "application/vnd.gmx": { "source": "iana", "extensions": ["gmx"] },
  "application/vnd.google-apps.document": { "compressible": false, "extensions": ["gdoc"] },
  "application/vnd.google-apps.presentation": { "compressible": false, "extensions": ["gslides"] },
  "application/vnd.google-apps.spreadsheet": { "compressible": false, "extensions": ["gsheet"] },
  "application/vnd.google-earth.kml+xml": { "source": "iana", "compressible": true, "extensions": ["kml"] },
  "application/vnd.google-earth.kmz": { "source": "iana", "compressible": false, "extensions": ["kmz"] },
  "application/vnd.gov.sk.e-form+xml": { "source": "iana", "compressible": true },
  "application/vnd.gov.sk.e-form+zip": { "source": "iana", "compressible": false },
  "application/vnd.gov.sk.xmldatacontainer+xml": { "source": "iana", "compressible": true },
  "application/vnd.grafeq": { "source": "iana", "extensions": ["gqf", "gqs"] },
  "application/vnd.gridmp": { "source": "iana" },
  "application/vnd.groove-account": { "source": "iana", "extensions": ["gac"] },
  "application/vnd.groove-help": { "source": "iana", "extensions": ["ghf"] },
  "application/vnd.groove-identity-message": { "source": "iana", "extensions": ["gim"] },
  "application/vnd.groove-injector": { "source": "iana", "extensions": ["grv"] },
  "application/vnd.groove-tool-message": { "source": "iana", "extensions": ["gtm"] },
  "application/vnd.groove-tool-template": { "source": "iana", "extensions": ["tpl"] },
  "application/vnd.groove-vcard": { "source": "iana", "extensions": ["vcg"] },
  "application/vnd.hal+json": { "source": "iana", "compressible": true },
  "application/vnd.hal+xml": { "source": "iana", "compressible": true, "extensions": ["hal"] },
  "application/vnd.handheld-entertainment+xml": { "source": "iana", "compressible": true, "extensions": ["zmm"] },
  "application/vnd.hbci": { "source": "iana", "extensions": ["hbci"] },
  "application/vnd.hc+json": { "source": "iana", "compressible": true },
  "application/vnd.hcl-bireports": { "source": "iana" },
  "application/vnd.hdt": { "source": "iana" },
  "application/vnd.heroku+json": { "source": "iana", "compressible": true },
  "application/vnd.hhe.lesson-player": { "source": "iana", "extensions": ["les"] },
  "application/vnd.hl7cda+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/vnd.hl7v2+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/vnd.hp-hpgl": { "source": "iana", "extensions": ["hpgl"] },
  "application/vnd.hp-hpid": { "source": "iana", "extensions": ["hpid"] },
  "application/vnd.hp-hps": { "source": "iana", "extensions": ["hps"] },
  "application/vnd.hp-jlyt": { "source": "iana", "extensions": ["jlt"] },
  "application/vnd.hp-pcl": { "source": "iana", "extensions": ["pcl"] },
  "application/vnd.hp-pclxl": { "source": "iana", "extensions": ["pclxl"] },
  "application/vnd.httphone": { "source": "iana" },
  "application/vnd.hydrostatix.sof-data": { "source": "iana", "extensions": ["sfd-hdstx"] },
  "application/vnd.hyper+json": { "source": "iana", "compressible": true },
  "application/vnd.hyper-item+json": { "source": "iana", "compressible": true },
  "application/vnd.hyperdrive+json": { "source": "iana", "compressible": true },
  "application/vnd.hzn-3d-crossword": { "source": "iana" },
  "application/vnd.ibm.afplinedata": { "source": "iana" },
  "application/vnd.ibm.electronic-media": { "source": "iana" },
  "application/vnd.ibm.minipay": { "source": "iana", "extensions": ["mpy"] },
  "application/vnd.ibm.modcap": { "source": "iana", "extensions": ["afp", "listafp", "list3820"] },
  "application/vnd.ibm.rights-management": { "source": "iana", "extensions": ["irm"] },
  "application/vnd.ibm.secure-container": { "source": "iana", "extensions": ["sc"] },
  "application/vnd.iccprofile": { "source": "iana", "extensions": ["icc", "icm"] },
  "application/vnd.ieee.1905": { "source": "iana" },
  "application/vnd.igloader": { "source": "iana", "extensions": ["igl"] },
  "application/vnd.imagemeter.folder+zip": { "source": "iana", "compressible": false },
  "application/vnd.imagemeter.image+zip": { "source": "iana", "compressible": false },
  "application/vnd.immervision-ivp": { "source": "iana", "extensions": ["ivp"] },
  "application/vnd.immervision-ivu": { "source": "iana", "extensions": ["ivu"] },
  "application/vnd.ims.imsccv1p1": { "source": "iana" },
  "application/vnd.ims.imsccv1p2": { "source": "iana" },
  "application/vnd.ims.imsccv1p3": { "source": "iana" },
  "application/vnd.ims.lis.v2.result+json": { "source": "iana", "compressible": true },
  "application/vnd.ims.lti.v2.toolconsumerprofile+json": { "source": "iana", "compressible": true },
  "application/vnd.ims.lti.v2.toolproxy+json": { "source": "iana", "compressible": true },
  "application/vnd.ims.lti.v2.toolproxy.id+json": { "source": "iana", "compressible": true },
  "application/vnd.ims.lti.v2.toolsettings+json": { "source": "iana", "compressible": true },
  "application/vnd.ims.lti.v2.toolsettings.simple+json": { "source": "iana", "compressible": true },
  "application/vnd.informedcontrol.rms+xml": { "source": "iana", "compressible": true },
  "application/vnd.informix-visionary": { "source": "iana" },
  "application/vnd.infotech.project": { "source": "iana" },
  "application/vnd.infotech.project+xml": { "source": "iana", "compressible": true },
  "application/vnd.innopath.wamp.notification": { "source": "iana" },
  "application/vnd.insors.igm": { "source": "iana", "extensions": ["igm"] },
  "application/vnd.intercon.formnet": { "source": "iana", "extensions": ["xpw", "xpx"] },
  "application/vnd.intergeo": { "source": "iana", "extensions": ["i2g"] },
  "application/vnd.intertrust.digibox": { "source": "iana" },
  "application/vnd.intertrust.nncp": { "source": "iana" },
  "application/vnd.intu.qbo": { "source": "iana", "extensions": ["qbo"] },
  "application/vnd.intu.qfx": { "source": "iana", "extensions": ["qfx"] },
  "application/vnd.iptc.g2.catalogitem+xml": { "source": "iana", "compressible": true },
  "application/vnd.iptc.g2.conceptitem+xml": { "source": "iana", "compressible": true },
  "application/vnd.iptc.g2.knowledgeitem+xml": { "source": "iana", "compressible": true },
  "application/vnd.iptc.g2.newsitem+xml": { "source": "iana", "compressible": true },
  "application/vnd.iptc.g2.newsmessage+xml": { "source": "iana", "compressible": true },
  "application/vnd.iptc.g2.packageitem+xml": { "source": "iana", "compressible": true },
  "application/vnd.iptc.g2.planningitem+xml": { "source": "iana", "compressible": true },
  "application/vnd.ipunplugged.rcprofile": { "source": "iana", "extensions": ["rcprofile"] },
  "application/vnd.irepository.package+xml": { "source": "iana", "compressible": true, "extensions": ["irp"] },
  "application/vnd.is-xpr": { "source": "iana", "extensions": ["xpr"] },
  "application/vnd.isac.fcs": { "source": "iana", "extensions": ["fcs"] },
  "application/vnd.iso11783-10+zip": { "source": "iana", "compressible": false },
  "application/vnd.jam": { "source": "iana", "extensions": ["jam"] },
  "application/vnd.japannet-directory-service": { "source": "iana" },
  "application/vnd.japannet-jpnstore-wakeup": { "source": "iana" },
  "application/vnd.japannet-payment-wakeup": { "source": "iana" },
  "application/vnd.japannet-registration": { "source": "iana" },
  "application/vnd.japannet-registration-wakeup": { "source": "iana" },
  "application/vnd.japannet-setstore-wakeup": { "source": "iana" },
  "application/vnd.japannet-verification": { "source": "iana" },
  "application/vnd.japannet-verification-wakeup": { "source": "iana" },
  "application/vnd.jcp.javame.midlet-rms": { "source": "iana", "extensions": ["rms"] },
  "application/vnd.jisp": { "source": "iana", "extensions": ["jisp"] },
  "application/vnd.joost.joda-archive": { "source": "iana", "extensions": ["joda"] },
  "application/vnd.jsk.isdn-ngn": { "source": "iana" },
  "application/vnd.kahootz": { "source": "iana", "extensions": ["ktz", "ktr"] },
  "application/vnd.kde.karbon": { "source": "iana", "extensions": ["karbon"] },
  "application/vnd.kde.kchart": { "source": "iana", "extensions": ["chrt"] },
  "application/vnd.kde.kformula": { "source": "iana", "extensions": ["kfo"] },
  "application/vnd.kde.kivio": { "source": "iana", "extensions": ["flw"] },
  "application/vnd.kde.kontour": { "source": "iana", "extensions": ["kon"] },
  "application/vnd.kde.kpresenter": { "source": "iana", "extensions": ["kpr", "kpt"] },
  "application/vnd.kde.kspread": { "source": "iana", "extensions": ["ksp"] },
  "application/vnd.kde.kword": { "source": "iana", "extensions": ["kwd", "kwt"] },
  "application/vnd.kenameaapp": { "source": "iana", "extensions": ["htke"] },
  "application/vnd.kidspiration": { "source": "iana", "extensions": ["kia"] },
  "application/vnd.kinar": { "source": "iana", "extensions": ["kne", "knp"] },
  "application/vnd.koan": { "source": "iana", "extensions": ["skp", "skd", "skt", "skm"] },
  "application/vnd.kodak-descriptor": { "source": "iana", "extensions": ["sse"] },
  "application/vnd.las": { "source": "iana" },
  "application/vnd.las.las+json": { "source": "iana", "compressible": true },
  "application/vnd.las.las+xml": { "source": "iana", "compressible": true, "extensions": ["lasxml"] },
  "application/vnd.laszip": { "source": "iana" },
  "application/vnd.leap+json": { "source": "iana", "compressible": true },
  "application/vnd.liberty-request+xml": { "source": "iana", "compressible": true },
  "application/vnd.llamagraphics.life-balance.desktop": { "source": "iana", "extensions": ["lbd"] },
  "application/vnd.llamagraphics.life-balance.exchange+xml": { "source": "iana", "compressible": true, "extensions": ["lbe"] },
  "application/vnd.logipipe.circuit+zip": { "source": "iana", "compressible": false },
  "application/vnd.loom": { "source": "iana" },
  "application/vnd.lotus-1-2-3": { "source": "iana", "extensions": ["123"] },
  "application/vnd.lotus-approach": { "source": "iana", "extensions": ["apr"] },
  "application/vnd.lotus-freelance": { "source": "iana", "extensions": ["pre"] },
  "application/vnd.lotus-notes": { "source": "iana", "extensions": ["nsf"] },
  "application/vnd.lotus-organizer": { "source": "iana", "extensions": ["org"] },
  "application/vnd.lotus-screencam": { "source": "iana", "extensions": ["scm"] },
  "application/vnd.lotus-wordpro": { "source": "iana", "extensions": ["lwp"] },
  "application/vnd.macports.portpkg": { "source": "iana", "extensions": ["portpkg"] },
  "application/vnd.mapbox-vector-tile": { "source": "iana", "extensions": ["mvt"] },
  "application/vnd.marlin.drm.actiontoken+xml": { "source": "iana", "compressible": true },
  "application/vnd.marlin.drm.conftoken+xml": { "source": "iana", "compressible": true },
  "application/vnd.marlin.drm.license+xml": { "source": "iana", "compressible": true },
  "application/vnd.marlin.drm.mdcf": { "source": "iana" },
  "application/vnd.mason+json": { "source": "iana", "compressible": true },
  "application/vnd.maxar.archive.3tz+zip": { "source": "iana", "compressible": false },
  "application/vnd.maxmind.maxmind-db": { "source": "iana" },
  "application/vnd.mcd": { "source": "iana", "extensions": ["mcd"] },
  "application/vnd.medcalcdata": { "source": "iana", "extensions": ["mc1"] },
  "application/vnd.mediastation.cdkey": { "source": "iana", "extensions": ["cdkey"] },
  "application/vnd.meridian-slingshot": { "source": "iana" },
  "application/vnd.mfer": { "source": "iana", "extensions": ["mwf"] },
  "application/vnd.mfmp": { "source": "iana", "extensions": ["mfm"] },
  "application/vnd.micro+json": { "source": "iana", "compressible": true },
  "application/vnd.micrografx.flo": { "source": "iana", "extensions": ["flo"] },
  "application/vnd.micrografx.igx": { "source": "iana", "extensions": ["igx"] },
  "application/vnd.microsoft.portable-executable": { "source": "iana" },
  "application/vnd.microsoft.windows.thumbnail-cache": { "source": "iana" },
  "application/vnd.miele+json": { "source": "iana", "compressible": true },
  "application/vnd.mif": { "source": "iana", "extensions": ["mif"] },
  "application/vnd.minisoft-hp3000-save": { "source": "iana" },
  "application/vnd.mitsubishi.misty-guard.trustweb": { "source": "iana" },
  "application/vnd.mobius.daf": { "source": "iana", "extensions": ["daf"] },
  "application/vnd.mobius.dis": { "source": "iana", "extensions": ["dis"] },
  "application/vnd.mobius.mbk": { "source": "iana", "extensions": ["mbk"] },
  "application/vnd.mobius.mqy": { "source": "iana", "extensions": ["mqy"] },
  "application/vnd.mobius.msl": { "source": "iana", "extensions": ["msl"] },
  "application/vnd.mobius.plc": { "source": "iana", "extensions": ["plc"] },
  "application/vnd.mobius.txf": { "source": "iana", "extensions": ["txf"] },
  "application/vnd.mophun.application": { "source": "iana", "extensions": ["mpn"] },
  "application/vnd.mophun.certificate": { "source": "iana", "extensions": ["mpc"] },
  "application/vnd.motorola.flexsuite": { "source": "iana" },
  "application/vnd.motorola.flexsuite.adsi": { "source": "iana" },
  "application/vnd.motorola.flexsuite.fis": { "source": "iana" },
  "application/vnd.motorola.flexsuite.gotap": { "source": "iana" },
  "application/vnd.motorola.flexsuite.kmr": { "source": "iana" },
  "application/vnd.motorola.flexsuite.ttc": { "source": "iana" },
  "application/vnd.motorola.flexsuite.wem": { "source": "iana" },
  "application/vnd.motorola.iprm": { "source": "iana" },
  "application/vnd.mozilla.xul+xml": { "source": "iana", "compressible": true, "extensions": ["xul"] },
  "application/vnd.ms-3mfdocument": { "source": "iana" },
  "application/vnd.ms-artgalry": { "source": "iana", "extensions": ["cil"] },
  "application/vnd.ms-asf": { "source": "iana" },
  "application/vnd.ms-cab-compressed": { "source": "iana", "extensions": ["cab"] },
  "application/vnd.ms-color.iccprofile": { "source": "apache" },
  "application/vnd.ms-excel": { "source": "iana", "compressible": false, "extensions": ["xls", "xlm", "xla", "xlc", "xlt", "xlw"] },
  "application/vnd.ms-excel.addin.macroenabled.12": { "source": "iana", "extensions": ["xlam"] },
  "application/vnd.ms-excel.sheet.binary.macroenabled.12": { "source": "iana", "extensions": ["xlsb"] },
  "application/vnd.ms-excel.sheet.macroenabled.12": { "source": "iana", "extensions": ["xlsm"] },
  "application/vnd.ms-excel.template.macroenabled.12": { "source": "iana", "extensions": ["xltm"] },
  "application/vnd.ms-fontobject": { "source": "iana", "compressible": true, "extensions": ["eot"] },
  "application/vnd.ms-htmlhelp": { "source": "iana", "extensions": ["chm"] },
  "application/vnd.ms-ims": { "source": "iana", "extensions": ["ims"] },
  "application/vnd.ms-lrm": { "source": "iana", "extensions": ["lrm"] },
  "application/vnd.ms-office.activex+xml": { "source": "iana", "compressible": true },
  "application/vnd.ms-officetheme": { "source": "iana", "extensions": ["thmx"] },
  "application/vnd.ms-opentype": { "source": "apache", "compressible": true },
  "application/vnd.ms-outlook": { "compressible": false, "extensions": ["msg"] },
  "application/vnd.ms-package.obfuscated-opentype": { "source": "apache" },
  "application/vnd.ms-pki.seccat": { "source": "apache", "extensions": ["cat"] },
  "application/vnd.ms-pki.stl": { "source": "apache", "extensions": ["stl"] },
  "application/vnd.ms-playready.initiator+xml": { "source": "iana", "compressible": true },
  "application/vnd.ms-powerpoint": { "source": "iana", "compressible": false, "extensions": ["ppt", "pps", "pot"] },
  "application/vnd.ms-powerpoint.addin.macroenabled.12": { "source": "iana", "extensions": ["ppam"] },
  "application/vnd.ms-powerpoint.presentation.macroenabled.12": { "source": "iana", "extensions": ["pptm"] },
  "application/vnd.ms-powerpoint.slide.macroenabled.12": { "source": "iana", "extensions": ["sldm"] },
  "application/vnd.ms-powerpoint.slideshow.macroenabled.12": { "source": "iana", "extensions": ["ppsm"] },
  "application/vnd.ms-powerpoint.template.macroenabled.12": { "source": "iana", "extensions": ["potm"] },
  "application/vnd.ms-printdevicecapabilities+xml": { "source": "iana", "compressible": true },
  "application/vnd.ms-printing.printticket+xml": { "source": "apache", "compressible": true },
  "application/vnd.ms-printschematicket+xml": { "source": "iana", "compressible": true },
  "application/vnd.ms-project": { "source": "iana", "extensions": ["mpp", "mpt"] },
  "application/vnd.ms-tnef": { "source": "iana" },
  "application/vnd.ms-windows.devicepairing": { "source": "iana" },
  "application/vnd.ms-windows.nwprinting.oob": { "source": "iana" },
  "application/vnd.ms-windows.printerpairing": { "source": "iana" },
  "application/vnd.ms-windows.wsd.oob": { "source": "iana" },
  "application/vnd.ms-wmdrm.lic-chlg-req": { "source": "iana" },
  "application/vnd.ms-wmdrm.lic-resp": { "source": "iana" },
  "application/vnd.ms-wmdrm.meter-chlg-req": { "source": "iana" },
  "application/vnd.ms-wmdrm.meter-resp": { "source": "iana" },
  "application/vnd.ms-word.document.macroenabled.12": { "source": "iana", "extensions": ["docm"] },
  "application/vnd.ms-word.template.macroenabled.12": { "source": "iana", "extensions": ["dotm"] },
  "application/vnd.ms-works": { "source": "iana", "extensions": ["wps", "wks", "wcm", "wdb"] },
  "application/vnd.ms-wpl": { "source": "iana", "extensions": ["wpl"] },
  "application/vnd.ms-xpsdocument": { "source": "iana", "compressible": false, "extensions": ["xps"] },
  "application/vnd.msa-disk-image": { "source": "iana" },
  "application/vnd.mseq": { "source": "iana", "extensions": ["mseq"] },
  "application/vnd.msign": { "source": "iana" },
  "application/vnd.multiad.creator": { "source": "iana" },
  "application/vnd.multiad.creator.cif": { "source": "iana" },
  "application/vnd.music-niff": { "source": "iana" },
  "application/vnd.musician": { "source": "iana", "extensions": ["mus"] },
  "application/vnd.muvee.style": { "source": "iana", "extensions": ["msty"] },
  "application/vnd.mynfc": { "source": "iana", "extensions": ["taglet"] },
  "application/vnd.nacamar.ybrid+json": { "source": "iana", "compressible": true },
  "application/vnd.ncd.control": { "source": "iana" },
  "application/vnd.ncd.reference": { "source": "iana" },
  "application/vnd.nearst.inv+json": { "source": "iana", "compressible": true },
  "application/vnd.nebumind.line": { "source": "iana" },
  "application/vnd.nervana": { "source": "iana" },
  "application/vnd.netfpx": { "source": "iana" },
  "application/vnd.neurolanguage.nlu": { "source": "iana", "extensions": ["nlu"] },
  "application/vnd.nimn": { "source": "iana" },
  "application/vnd.nintendo.nitro.rom": { "source": "iana" },
  "application/vnd.nintendo.snes.rom": { "source": "iana" },
  "application/vnd.nitf": { "source": "iana", "extensions": ["ntf", "nitf"] },
  "application/vnd.noblenet-directory": { "source": "iana", "extensions": ["nnd"] },
  "application/vnd.noblenet-sealer": { "source": "iana", "extensions": ["nns"] },
  "application/vnd.noblenet-web": { "source": "iana", "extensions": ["nnw"] },
  "application/vnd.nokia.catalogs": { "source": "iana" },
  "application/vnd.nokia.conml+wbxml": { "source": "iana" },
  "application/vnd.nokia.conml+xml": { "source": "iana", "compressible": true },
  "application/vnd.nokia.iptv.config+xml": { "source": "iana", "compressible": true },
  "application/vnd.nokia.isds-radio-presets": { "source": "iana" },
  "application/vnd.nokia.landmark+wbxml": { "source": "iana" },
  "application/vnd.nokia.landmark+xml": { "source": "iana", "compressible": true },
  "application/vnd.nokia.landmarkcollection+xml": { "source": "iana", "compressible": true },
  "application/vnd.nokia.n-gage.ac+xml": { "source": "iana", "compressible": true, "extensions": ["ac"] },
  "application/vnd.nokia.n-gage.data": { "source": "iana", "extensions": ["ngdat"] },
  "application/vnd.nokia.n-gage.symbian.install": { "source": "iana", "extensions": ["n-gage"] },
  "application/vnd.nokia.ncd": { "source": "iana" },
  "application/vnd.nokia.pcd+wbxml": { "source": "iana" },
  "application/vnd.nokia.pcd+xml": { "source": "iana", "compressible": true },
  "application/vnd.nokia.radio-preset": { "source": "iana", "extensions": ["rpst"] },
  "application/vnd.nokia.radio-presets": { "source": "iana", "extensions": ["rpss"] },
  "application/vnd.novadigm.edm": { "source": "iana", "extensions": ["edm"] },
  "application/vnd.novadigm.edx": { "source": "iana", "extensions": ["edx"] },
  "application/vnd.novadigm.ext": { "source": "iana", "extensions": ["ext"] },
  "application/vnd.ntt-local.content-share": { "source": "iana" },
  "application/vnd.ntt-local.file-transfer": { "source": "iana" },
  "application/vnd.ntt-local.ogw_remote-access": { "source": "iana" },
  "application/vnd.ntt-local.sip-ta_remote": { "source": "iana" },
  "application/vnd.ntt-local.sip-ta_tcp_stream": { "source": "iana" },
  "application/vnd.oasis.opendocument.chart": { "source": "iana", "extensions": ["odc"] },
  "application/vnd.oasis.opendocument.chart-template": { "source": "iana", "extensions": ["otc"] },
  "application/vnd.oasis.opendocument.database": { "source": "iana", "extensions": ["odb"] },
  "application/vnd.oasis.opendocument.formula": { "source": "iana", "extensions": ["odf"] },
  "application/vnd.oasis.opendocument.formula-template": { "source": "iana", "extensions": ["odft"] },
  "application/vnd.oasis.opendocument.graphics": { "source": "iana", "compressible": false, "extensions": ["odg"] },
  "application/vnd.oasis.opendocument.graphics-template": { "source": "iana", "extensions": ["otg"] },
  "application/vnd.oasis.opendocument.image": { "source": "iana", "extensions": ["odi"] },
  "application/vnd.oasis.opendocument.image-template": { "source": "iana", "extensions": ["oti"] },
  "application/vnd.oasis.opendocument.presentation": { "source": "iana", "compressible": false, "extensions": ["odp"] },
  "application/vnd.oasis.opendocument.presentation-template": { "source": "iana", "extensions": ["otp"] },
  "application/vnd.oasis.opendocument.spreadsheet": { "source": "iana", "compressible": false, "extensions": ["ods"] },
  "application/vnd.oasis.opendocument.spreadsheet-template": { "source": "iana", "extensions": ["ots"] },
  "application/vnd.oasis.opendocument.text": { "source": "iana", "compressible": false, "extensions": ["odt"] },
  "application/vnd.oasis.opendocument.text-master": { "source": "iana", "extensions": ["odm"] },
  "application/vnd.oasis.opendocument.text-template": { "source": "iana", "extensions": ["ott"] },
  "application/vnd.oasis.opendocument.text-web": { "source": "iana", "extensions": ["oth"] },
  "application/vnd.obn": { "source": "iana" },
  "application/vnd.ocf+cbor": { "source": "iana" },
  "application/vnd.oci.image.manifest.v1+json": { "source": "iana", "compressible": true },
  "application/vnd.oftn.l10n+json": { "source": "iana", "compressible": true },
  "application/vnd.oipf.contentaccessdownload+xml": { "source": "iana", "compressible": true },
  "application/vnd.oipf.contentaccessstreaming+xml": { "source": "iana", "compressible": true },
  "application/vnd.oipf.cspg-hexbinary": { "source": "iana" },
  "application/vnd.oipf.dae.svg+xml": { "source": "iana", "compressible": true },
  "application/vnd.oipf.dae.xhtml+xml": { "source": "iana", "compressible": true },
  "application/vnd.oipf.mippvcontrolmessage+xml": { "source": "iana", "compressible": true },
  "application/vnd.oipf.pae.gem": { "source": "iana" },
  "application/vnd.oipf.spdiscovery+xml": { "source": "iana", "compressible": true },
  "application/vnd.oipf.spdlist+xml": { "source": "iana", "compressible": true },
  "application/vnd.oipf.ueprofile+xml": { "source": "iana", "compressible": true },
  "application/vnd.oipf.userprofile+xml": { "source": "iana", "compressible": true },
  "application/vnd.olpc-sugar": { "source": "iana", "extensions": ["xo"] },
  "application/vnd.oma-scws-config": { "source": "iana" },
  "application/vnd.oma-scws-http-request": { "source": "iana" },
  "application/vnd.oma-scws-http-response": { "source": "iana" },
  "application/vnd.oma.bcast.associated-procedure-parameter+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.bcast.drm-trigger+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.bcast.imd+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.bcast.ltkm": { "source": "iana" },
  "application/vnd.oma.bcast.notification+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.bcast.provisioningtrigger": { "source": "iana" },
  "application/vnd.oma.bcast.sgboot": { "source": "iana" },
  "application/vnd.oma.bcast.sgdd+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.bcast.sgdu": { "source": "iana" },
  "application/vnd.oma.bcast.simple-symbol-container": { "source": "iana" },
  "application/vnd.oma.bcast.smartcard-trigger+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.bcast.sprov+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.bcast.stkm": { "source": "iana" },
  "application/vnd.oma.cab-address-book+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.cab-feature-handler+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.cab-pcc+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.cab-subs-invite+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.cab-user-prefs+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.dcd": { "source": "iana" },
  "application/vnd.oma.dcdc": { "source": "iana" },
  "application/vnd.oma.dd2+xml": { "source": "iana", "compressible": true, "extensions": ["dd2"] },
  "application/vnd.oma.drm.risd+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.group-usage-list+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.lwm2m+cbor": { "source": "iana" },
  "application/vnd.oma.lwm2m+json": { "source": "iana", "compressible": true },
  "application/vnd.oma.lwm2m+tlv": { "source": "iana" },
  "application/vnd.oma.pal+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.poc.detailed-progress-report+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.poc.final-report+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.poc.groups+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.poc.invocation-descriptor+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.poc.optimized-progress-report+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.push": { "source": "iana" },
  "application/vnd.oma.scidm.messages+xml": { "source": "iana", "compressible": true },
  "application/vnd.oma.xcap-directory+xml": { "source": "iana", "compressible": true },
  "application/vnd.omads-email+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/vnd.omads-file+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/vnd.omads-folder+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/vnd.omaloc-supl-init": { "source": "iana" },
  "application/vnd.onepager": { "source": "iana" },
  "application/vnd.onepagertamp": { "source": "iana" },
  "application/vnd.onepagertamx": { "source": "iana" },
  "application/vnd.onepagertat": { "source": "iana" },
  "application/vnd.onepagertatp": { "source": "iana" },
  "application/vnd.onepagertatx": { "source": "iana" },
  "application/vnd.openblox.game+xml": { "source": "iana", "compressible": true, "extensions": ["obgx"] },
  "application/vnd.openblox.game-binary": { "source": "iana" },
  "application/vnd.openeye.oeb": { "source": "iana" },
  "application/vnd.openofficeorg.extension": { "source": "apache", "extensions": ["oxt"] },
  "application/vnd.openstreetmap.data+xml": { "source": "iana", "compressible": true, "extensions": ["osm"] },
  "application/vnd.opentimestamps.ots": { "source": "iana" },
  "application/vnd.openxmlformats-officedocument.custom-properties+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.drawing+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.extended-properties+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { "source": "iana", "compressible": false, "extensions": ["pptx"] },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.slide": { "source": "iana", "extensions": ["sldx"] },
  "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow": { "source": "iana", "extensions": ["ppsx"] },
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.template": { "source": "iana", "extensions": ["potx"] },
  "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { "source": "iana", "compressible": false, "extensions": ["xlsx"] },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template": { "source": "iana", "extensions": ["xltx"] },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.theme+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.themeoverride+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.vmldrawing": { "source": "iana" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { "source": "iana", "compressible": false, "extensions": ["docx"] },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template": { "source": "iana", "extensions": ["dotx"] },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-package.core-properties+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": { "source": "iana", "compressible": true },
  "application/vnd.openxmlformats-package.relationships+xml": { "source": "iana", "compressible": true },
  "application/vnd.oracle.resource+json": { "source": "iana", "compressible": true },
  "application/vnd.orange.indata": { "source": "iana" },
  "application/vnd.osa.netdeploy": { "source": "iana" },
  "application/vnd.osgeo.mapguide.package": { "source": "iana", "extensions": ["mgp"] },
  "application/vnd.osgi.bundle": { "source": "iana" },
  "application/vnd.osgi.dp": { "source": "iana", "extensions": ["dp"] },
  "application/vnd.osgi.subsystem": { "source": "iana", "extensions": ["esa"] },
  "application/vnd.otps.ct-kip+xml": { "source": "iana", "compressible": true },
  "application/vnd.oxli.countgraph": { "source": "iana" },
  "application/vnd.pagerduty+json": { "source": "iana", "compressible": true },
  "application/vnd.palm": { "source": "iana", "extensions": ["pdb", "pqa", "oprc"] },
  "application/vnd.panoply": { "source": "iana" },
  "application/vnd.paos.xml": { "source": "iana" },
  "application/vnd.patentdive": { "source": "iana" },
  "application/vnd.patientecommsdoc": { "source": "iana" },
  "application/vnd.pawaafile": { "source": "iana", "extensions": ["paw"] },
  "application/vnd.pcos": { "source": "iana" },
  "application/vnd.pg.format": { "source": "iana", "extensions": ["str"] },
  "application/vnd.pg.osasli": { "source": "iana", "extensions": ["ei6"] },
  "application/vnd.piaccess.application-licence": { "source": "iana" },
  "application/vnd.picsel": { "source": "iana", "extensions": ["efif"] },
  "application/vnd.pmi.widget": { "source": "iana", "extensions": ["wg"] },
  "application/vnd.poc.group-advertisement+xml": { "source": "iana", "compressible": true },
  "application/vnd.pocketlearn": { "source": "iana", "extensions": ["plf"] },
  "application/vnd.powerbuilder6": { "source": "iana", "extensions": ["pbd"] },
  "application/vnd.powerbuilder6-s": { "source": "iana" },
  "application/vnd.powerbuilder7": { "source": "iana" },
  "application/vnd.powerbuilder7-s": { "source": "iana" },
  "application/vnd.powerbuilder75": { "source": "iana" },
  "application/vnd.powerbuilder75-s": { "source": "iana" },
  "application/vnd.preminet": { "source": "iana" },
  "application/vnd.previewsystems.box": { "source": "iana", "extensions": ["box"] },
  "application/vnd.proteus.magazine": { "source": "iana", "extensions": ["mgz"] },
  "application/vnd.psfs": { "source": "iana" },
  "application/vnd.publishare-delta-tree": { "source": "iana", "extensions": ["qps"] },
  "application/vnd.pvi.ptid1": { "source": "iana", "extensions": ["ptid"] },
  "application/vnd.pwg-multiplexed": { "source": "iana" },
  "application/vnd.pwg-xhtml-print+xml": { "source": "iana", "compressible": true },
  "application/vnd.qualcomm.brew-app-res": { "source": "iana" },
  "application/vnd.quarantainenet": { "source": "iana" },
  "application/vnd.quark.quarkxpress": { "source": "iana", "extensions": ["qxd", "qxt", "qwd", "qwt", "qxl", "qxb"] },
  "application/vnd.quobject-quoxdocument": { "source": "iana" },
  "application/vnd.radisys.moml+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-audit+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-audit-conf+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-audit-conn+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-audit-dialog+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-audit-stream+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-conf+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-dialog+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-dialog-base+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-dialog-fax-detect+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-dialog-group+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-dialog-speech+xml": { "source": "iana", "compressible": true },
  "application/vnd.radisys.msml-dialog-transform+xml": { "source": "iana", "compressible": true },
  "application/vnd.rainstor.data": { "source": "iana" },
  "application/vnd.rapid": { "source": "iana" },
  "application/vnd.rar": { "source": "iana", "extensions": ["rar"] },
  "application/vnd.realvnc.bed": { "source": "iana", "extensions": ["bed"] },
  "application/vnd.recordare.musicxml": { "source": "iana", "extensions": ["mxl"] },
  "application/vnd.recordare.musicxml+xml": { "source": "iana", "compressible": true, "extensions": ["musicxml"] },
  "application/vnd.renlearn.rlprint": { "source": "iana" },
  "application/vnd.resilient.logic": { "source": "iana" },
  "application/vnd.restful+json": { "source": "iana", "compressible": true },
  "application/vnd.rig.cryptonote": { "source": "iana", "extensions": ["cryptonote"] },
  "application/vnd.rim.cod": { "source": "apache", "extensions": ["cod"] },
  "application/vnd.rn-realmedia": { "source": "apache", "extensions": ["rm"] },
  "application/vnd.rn-realmedia-vbr": { "source": "apache", "extensions": ["rmvb"] },
  "application/vnd.route66.link66+xml": { "source": "iana", "compressible": true, "extensions": ["link66"] },
  "application/vnd.rs-274x": { "source": "iana" },
  "application/vnd.ruckus.download": { "source": "iana" },
  "application/vnd.s3sms": { "source": "iana" },
  "application/vnd.sailingtracker.track": { "source": "iana", "extensions": ["st"] },
  "application/vnd.sar": { "source": "iana" },
  "application/vnd.sbm.cid": { "source": "iana" },
  "application/vnd.sbm.mid2": { "source": "iana" },
  "application/vnd.scribus": { "source": "iana" },
  "application/vnd.sealed.3df": { "source": "iana" },
  "application/vnd.sealed.csf": { "source": "iana" },
  "application/vnd.sealed.doc": { "source": "iana" },
  "application/vnd.sealed.eml": { "source": "iana" },
  "application/vnd.sealed.mht": { "source": "iana" },
  "application/vnd.sealed.net": { "source": "iana" },
  "application/vnd.sealed.ppt": { "source": "iana" },
  "application/vnd.sealed.tiff": { "source": "iana" },
  "application/vnd.sealed.xls": { "source": "iana" },
  "application/vnd.sealedmedia.softseal.html": { "source": "iana" },
  "application/vnd.sealedmedia.softseal.pdf": { "source": "iana" },
  "application/vnd.seemail": { "source": "iana", "extensions": ["see"] },
  "application/vnd.seis+json": { "source": "iana", "compressible": true },
  "application/vnd.sema": { "source": "iana", "extensions": ["sema"] },
  "application/vnd.semd": { "source": "iana", "extensions": ["semd"] },
  "application/vnd.semf": { "source": "iana", "extensions": ["semf"] },
  "application/vnd.shade-save-file": { "source": "iana" },
  "application/vnd.shana.informed.formdata": { "source": "iana", "extensions": ["ifm"] },
  "application/vnd.shana.informed.formtemplate": { "source": "iana", "extensions": ["itp"] },
  "application/vnd.shana.informed.interchange": { "source": "iana", "extensions": ["iif"] },
  "application/vnd.shana.informed.package": { "source": "iana", "extensions": ["ipk"] },
  "application/vnd.shootproof+json": { "source": "iana", "compressible": true },
  "application/vnd.shopkick+json": { "source": "iana", "compressible": true },
  "application/vnd.shp": { "source": "iana" },
  "application/vnd.shx": { "source": "iana" },
  "application/vnd.sigrok.session": { "source": "iana" },
  "application/vnd.simtech-mindmapper": { "source": "iana", "extensions": ["twd", "twds"] },
  "application/vnd.siren+json": { "source": "iana", "compressible": true },
  "application/vnd.smaf": { "source": "iana", "extensions": ["mmf"] },
  "application/vnd.smart.notebook": { "source": "iana" },
  "application/vnd.smart.teacher": { "source": "iana", "extensions": ["teacher"] },
  "application/vnd.snesdev-page-table": { "source": "iana" },
  "application/vnd.software602.filler.form+xml": { "source": "iana", "compressible": true, "extensions": ["fo"] },
  "application/vnd.software602.filler.form-xml-zip": { "source": "iana" },
  "application/vnd.solent.sdkm+xml": { "source": "iana", "compressible": true, "extensions": ["sdkm", "sdkd"] },
  "application/vnd.spotfire.dxp": { "source": "iana", "extensions": ["dxp"] },
  "application/vnd.spotfire.sfs": { "source": "iana", "extensions": ["sfs"] },
  "application/vnd.sqlite3": { "source": "iana" },
  "application/vnd.sss-cod": { "source": "iana" },
  "application/vnd.sss-dtf": { "source": "iana" },
  "application/vnd.sss-ntf": { "source": "iana" },
  "application/vnd.stardivision.calc": { "source": "apache", "extensions": ["sdc"] },
  "application/vnd.stardivision.draw": { "source": "apache", "extensions": ["sda"] },
  "application/vnd.stardivision.impress": { "source": "apache", "extensions": ["sdd"] },
  "application/vnd.stardivision.math": { "source": "apache", "extensions": ["smf"] },
  "application/vnd.stardivision.writer": { "source": "apache", "extensions": ["sdw", "vor"] },
  "application/vnd.stardivision.writer-global": { "source": "apache", "extensions": ["sgl"] },
  "application/vnd.stepmania.package": { "source": "iana", "extensions": ["smzip"] },
  "application/vnd.stepmania.stepchart": { "source": "iana", "extensions": ["sm"] },
  "application/vnd.street-stream": { "source": "iana" },
  "application/vnd.sun.wadl+xml": { "source": "iana", "compressible": true, "extensions": ["wadl"] },
  "application/vnd.sun.xml.calc": { "source": "apache", "extensions": ["sxc"] },
  "application/vnd.sun.xml.calc.template": { "source": "apache", "extensions": ["stc"] },
  "application/vnd.sun.xml.draw": { "source": "apache", "extensions": ["sxd"] },
  "application/vnd.sun.xml.draw.template": { "source": "apache", "extensions": ["std"] },
  "application/vnd.sun.xml.impress": { "source": "apache", "extensions": ["sxi"] },
  "application/vnd.sun.xml.impress.template": { "source": "apache", "extensions": ["sti"] },
  "application/vnd.sun.xml.math": { "source": "apache", "extensions": ["sxm"] },
  "application/vnd.sun.xml.writer": { "source": "apache", "extensions": ["sxw"] },
  "application/vnd.sun.xml.writer.global": { "source": "apache", "extensions": ["sxg"] },
  "application/vnd.sun.xml.writer.template": { "source": "apache", "extensions": ["stw"] },
  "application/vnd.sus-calendar": { "source": "iana", "extensions": ["sus", "susp"] },
  "application/vnd.svd": { "source": "iana", "extensions": ["svd"] },
  "application/vnd.swiftview-ics": { "source": "iana" },
  "application/vnd.sycle+xml": { "source": "iana", "compressible": true },
  "application/vnd.syft+json": { "source": "iana", "compressible": true },
  "application/vnd.symbian.install": { "source": "apache", "extensions": ["sis", "sisx"] },
  "application/vnd.syncml+xml": { "source": "iana", "charset": "UTF-8", "compressible": true, "extensions": ["xsm"] },
  "application/vnd.syncml.dm+wbxml": { "source": "iana", "charset": "UTF-8", "extensions": ["bdm"] },
  "application/vnd.syncml.dm+xml": { "source": "iana", "charset": "UTF-8", "compressible": true, "extensions": ["xdm"] },
  "application/vnd.syncml.dm.notification": { "source": "iana" },
  "application/vnd.syncml.dmddf+wbxml": { "source": "iana" },
  "application/vnd.syncml.dmddf+xml": { "source": "iana", "charset": "UTF-8", "compressible": true, "extensions": ["ddf"] },
  "application/vnd.syncml.dmtnds+wbxml": { "source": "iana" },
  "application/vnd.syncml.dmtnds+xml": { "source": "iana", "charset": "UTF-8", "compressible": true },
  "application/vnd.syncml.ds.notification": { "source": "iana" },
  "application/vnd.tableschema+json": { "source": "iana", "compressible": true },
  "application/vnd.tao.intent-module-archive": { "source": "iana", "extensions": ["tao"] },
  "application/vnd.tcpdump.pcap": { "source": "iana", "extensions": ["pcap", "cap", "dmp"] },
  "application/vnd.think-cell.ppttc+json": { "source": "iana", "compressible": true },
  "application/vnd.tmd.mediaflex.api+xml": { "source": "iana", "compressible": true },
  "application/vnd.tml": { "source": "iana" },
  "application/vnd.tmobile-livetv": { "source": "iana", "extensions": ["tmo"] },
  "application/vnd.tri.onesource": { "source": "iana" },
  "application/vnd.trid.tpt": { "source": "iana", "extensions": ["tpt"] },
  "application/vnd.triscape.mxs": { "source": "iana", "extensions": ["mxs"] },
  "application/vnd.trueapp": { "source": "iana", "extensions": ["tra"] },
  "application/vnd.truedoc": { "source": "iana" },
  "application/vnd.ubisoft.webplayer": { "source": "iana" },
  "application/vnd.ufdl": { "source": "iana", "extensions": ["ufd", "ufdl"] },
  "application/vnd.uiq.theme": { "source": "iana", "extensions": ["utz"] },
  "application/vnd.umajin": { "source": "iana", "extensions": ["umj"] },
  "application/vnd.unity": { "source": "iana", "extensions": ["unityweb"] },
  "application/vnd.uoml+xml": { "source": "iana", "compressible": true, "extensions": ["uoml"] },
  "application/vnd.uplanet.alert": { "source": "iana" },
  "application/vnd.uplanet.alert-wbxml": { "source": "iana" },
  "application/vnd.uplanet.bearer-choice": { "source": "iana" },
  "application/vnd.uplanet.bearer-choice-wbxml": { "source": "iana" },
  "application/vnd.uplanet.cacheop": { "source": "iana" },
  "application/vnd.uplanet.cacheop-wbxml": { "source": "iana" },
  "application/vnd.uplanet.channel": { "source": "iana" },
  "application/vnd.uplanet.channel-wbxml": { "source": "iana" },
  "application/vnd.uplanet.list": { "source": "iana" },
  "application/vnd.uplanet.list-wbxml": { "source": "iana" },
  "application/vnd.uplanet.listcmd": { "source": "iana" },
  "application/vnd.uplanet.listcmd-wbxml": { "source": "iana" },
  "application/vnd.uplanet.signal": { "source": "iana" },
  "application/vnd.uri-map": { "source": "iana" },
  "application/vnd.valve.source.material": { "source": "iana" },
  "application/vnd.vcx": { "source": "iana", "extensions": ["vcx"] },
  "application/vnd.vd-study": { "source": "iana" },
  "application/vnd.vectorworks": { "source": "iana" },
  "application/vnd.vel+json": { "source": "iana", "compressible": true },
  "application/vnd.verimatrix.vcas": { "source": "iana" },
  "application/vnd.veritone.aion+json": { "source": "iana", "compressible": true },
  "application/vnd.veryant.thin": { "source": "iana" },
  "application/vnd.ves.encrypted": { "source": "iana" },
  "application/vnd.vidsoft.vidconference": { "source": "iana" },
  "application/vnd.visio": { "source": "iana", "extensions": ["vsd", "vst", "vss", "vsw"] },
  "application/vnd.visionary": { "source": "iana", "extensions": ["vis"] },
  "application/vnd.vividence.scriptfile": { "source": "iana" },
  "application/vnd.vsf": { "source": "iana", "extensions": ["vsf"] },
  "application/vnd.wap.sic": { "source": "iana" },
  "application/vnd.wap.slc": { "source": "iana" },
  "application/vnd.wap.wbxml": { "source": "iana", "charset": "UTF-8", "extensions": ["wbxml"] },
  "application/vnd.wap.wmlc": { "source": "iana", "extensions": ["wmlc"] },
  "application/vnd.wap.wmlscriptc": { "source": "iana", "extensions": ["wmlsc"] },
  "application/vnd.webturbo": { "source": "iana", "extensions": ["wtb"] },
  "application/vnd.wfa.dpp": { "source": "iana" },
  "application/vnd.wfa.p2p": { "source": "iana" },
  "application/vnd.wfa.wsc": { "source": "iana" },
  "application/vnd.windows.devicepairing": { "source": "iana" },
  "application/vnd.wmc": { "source": "iana" },
  "application/vnd.wmf.bootstrap": { "source": "iana" },
  "application/vnd.wolfram.mathematica": { "source": "iana" },
  "application/vnd.wolfram.mathematica.package": { "source": "iana" },
  "application/vnd.wolfram.player": { "source": "iana", "extensions": ["nbp"] },
  "application/vnd.wordperfect": { "source": "iana", "extensions": ["wpd"] },
  "application/vnd.wqd": { "source": "iana", "extensions": ["wqd"] },
  "application/vnd.wrq-hp3000-labelled": { "source": "iana" },
  "application/vnd.wt.stf": { "source": "iana", "extensions": ["stf"] },
  "application/vnd.wv.csp+wbxml": { "source": "iana" },
  "application/vnd.wv.csp+xml": { "source": "iana", "compressible": true },
  "application/vnd.wv.ssp+xml": { "source": "iana", "compressible": true },
  "application/vnd.xacml+json": { "source": "iana", "compressible": true },
  "application/vnd.xara": { "source": "iana", "extensions": ["xar"] },
  "application/vnd.xfdl": { "source": "iana", "extensions": ["xfdl"] },
  "application/vnd.xfdl.webform": { "source": "iana" },
  "application/vnd.xmi+xml": { "source": "iana", "compressible": true },
  "application/vnd.xmpie.cpkg": { "source": "iana" },
  "application/vnd.xmpie.dpkg": { "source": "iana" },
  "application/vnd.xmpie.plan": { "source": "iana" },
  "application/vnd.xmpie.ppkg": { "source": "iana" },
  "application/vnd.xmpie.xlim": { "source": "iana" },
  "application/vnd.yamaha.hv-dic": { "source": "iana", "extensions": ["hvd"] },
  "application/vnd.yamaha.hv-script": { "source": "iana", "extensions": ["hvs"] },
  "application/vnd.yamaha.hv-voice": { "source": "iana", "extensions": ["hvp"] },
  "application/vnd.yamaha.openscoreformat": { "source": "iana", "extensions": ["osf"] },
  "application/vnd.yamaha.openscoreformat.osfpvg+xml": { "source": "iana", "compressible": true, "extensions": ["osfpvg"] },
  "application/vnd.yamaha.remote-setup": { "source": "iana" },
  "application/vnd.yamaha.smaf-audio": { "source": "iana", "extensions": ["saf"] },
  "application/vnd.yamaha.smaf-phrase": { "source": "iana", "extensions": ["spf"] },
  "application/vnd.yamaha.through-ngn": { "source": "iana" },
  "application/vnd.yamaha.tunnel-udpencap": { "source": "iana" },
  "application/vnd.yaoweme": { "source": "iana" },
  "application/vnd.yellowriver-custom-menu": { "source": "iana", "extensions": ["cmp"] },
  "application/vnd.youtube.yt": { "source": "iana" },
  "application/vnd.zul": { "source": "iana", "extensions": ["zir", "zirz"] },
  "application/vnd.zzazz.deck+xml": { "source": "iana", "compressible": true, "extensions": ["zaz"] },
  "application/voicexml+xml": { "source": "iana", "compressible": true, "extensions": ["vxml"] },
  "application/voucher-cms+json": { "source": "iana", "compressible": true },
  "application/vq-rtcpxr": { "source": "iana" },
  "application/wasm": { "source": "iana", "compressible": true, "extensions": ["wasm"] },
  "application/watcherinfo+xml": { "source": "iana", "compressible": true, "extensions": ["wif"] },
  "application/webpush-options+json": { "source": "iana", "compressible": true },
  "application/whoispp-query": { "source": "iana" },
  "application/whoispp-response": { "source": "iana" },
  "application/widget": { "source": "iana", "extensions": ["wgt"] },
  "application/winhlp": { "source": "apache", "extensions": ["hlp"] },
  "application/wita": { "source": "iana" },
  "application/wordperfect5.1": { "source": "iana" },
  "application/wsdl+xml": { "source": "iana", "compressible": true, "extensions": ["wsdl"] },
  "application/wspolicy+xml": { "source": "iana", "compressible": true, "extensions": ["wspolicy"] },
  "application/x-7z-compressed": { "source": "apache", "compressible": false, "extensions": ["7z"] },
  "application/x-abiword": { "source": "apache", "extensions": ["abw"] },
  "application/x-ace-compressed": { "source": "apache", "extensions": ["ace"] },
  "application/x-amf": { "source": "apache" },
  "application/x-apple-diskimage": { "source": "apache", "extensions": ["dmg"] },
  "application/x-arj": { "compressible": false, "extensions": ["arj"] },
  "application/x-authorware-bin": { "source": "apache", "extensions": ["aab", "x32", "u32", "vox"] },
  "application/x-authorware-map": { "source": "apache", "extensions": ["aam"] },
  "application/x-authorware-seg": { "source": "apache", "extensions": ["aas"] },
  "application/x-bcpio": { "source": "apache", "extensions": ["bcpio"] },
  "application/x-bdoc": { "compressible": false, "extensions": ["bdoc"] },
  "application/x-bittorrent": { "source": "apache", "extensions": ["torrent"] },
  "application/x-blorb": { "source": "apache", "extensions": ["blb", "blorb"] },
  "application/x-bzip": { "source": "apache", "compressible": false, "extensions": ["bz"] },
  "application/x-bzip2": { "source": "apache", "compressible": false, "extensions": ["bz2", "boz"] },
  "application/x-cbr": { "source": "apache", "extensions": ["cbr", "cba", "cbt", "cbz", "cb7"] },
  "application/x-cdlink": { "source": "apache", "extensions": ["vcd"] },
  "application/x-cfs-compressed": { "source": "apache", "extensions": ["cfs"] },
  "application/x-chat": { "source": "apache", "extensions": ["chat"] },
  "application/x-chess-pgn": { "source": "apache", "extensions": ["pgn"] },
  "application/x-chrome-extension": { "extensions": ["crx"] },
  "application/x-cocoa": { "source": "nginx", "extensions": ["cco"] },
  "application/x-compress": { "source": "apache" },
  "application/x-conference": { "source": "apache", "extensions": ["nsc"] },
  "application/x-cpio": { "source": "apache", "extensions": ["cpio"] },
  "application/x-csh": { "source": "apache", "extensions": ["csh"] },
  "application/x-deb": { "compressible": false },
  "application/x-debian-package": { "source": "apache", "extensions": ["deb", "udeb"] },
  "application/x-dgc-compressed": { "source": "apache", "extensions": ["dgc"] },
  "application/x-director": { "source": "apache", "extensions": ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa"] },
  "application/x-doom": { "source": "apache", "extensions": ["wad"] },
  "application/x-dtbncx+xml": { "source": "apache", "compressible": true, "extensions": ["ncx"] },
  "application/x-dtbook+xml": { "source": "apache", "compressible": true, "extensions": ["dtb"] },
  "application/x-dtbresource+xml": { "source": "apache", "compressible": true, "extensions": ["res"] },
  "application/x-dvi": { "source": "apache", "compressible": false, "extensions": ["dvi"] },
  "application/x-envoy": { "source": "apache", "extensions": ["evy"] },
  "application/x-eva": { "source": "apache", "extensions": ["eva"] },
  "application/x-font-bdf": { "source": "apache", "extensions": ["bdf"] },
  "application/x-font-dos": { "source": "apache" },
  "application/x-font-framemaker": { "source": "apache" },
  "application/x-font-ghostscript": { "source": "apache", "extensions": ["gsf"] },
  "application/x-font-libgrx": { "source": "apache" },
  "application/x-font-linux-psf": { "source": "apache", "extensions": ["psf"] },
  "application/x-font-pcf": { "source": "apache", "extensions": ["pcf"] },
  "application/x-font-snf": { "source": "apache", "extensions": ["snf"] },
  "application/x-font-speedo": { "source": "apache" },
  "application/x-font-sunos-news": { "source": "apache" },
  "application/x-font-type1": { "source": "apache", "extensions": ["pfa", "pfb", "pfm", "afm"] },
  "application/x-font-vfont": { "source": "apache" },
  "application/x-freearc": { "source": "apache", "extensions": ["arc"] },
  "application/x-futuresplash": { "source": "apache", "extensions": ["spl"] },
  "application/x-gca-compressed": { "source": "apache", "extensions": ["gca"] },
  "application/x-glulx": { "source": "apache", "extensions": ["ulx"] },
  "application/x-gnumeric": { "source": "apache", "extensions": ["gnumeric"] },
  "application/x-gramps-xml": { "source": "apache", "extensions": ["gramps"] },
  "application/x-gtar": { "source": "apache", "extensions": ["gtar"] },
  "application/x-gzip": { "source": "apache" },
  "application/x-hdf": { "source": "apache", "extensions": ["hdf"] },
  "application/x-httpd-php": { "compressible": true, "extensions": ["php"] },
  "application/x-install-instructions": { "source": "apache", "extensions": ["install"] },
  "application/x-iso9660-image": { "source": "apache", "extensions": ["iso"] },
  "application/x-iwork-keynote-sffkey": { "extensions": ["key"] },
  "application/x-iwork-numbers-sffnumbers": { "extensions": ["numbers"] },
  "application/x-iwork-pages-sffpages": { "extensions": ["pages"] },
  "application/x-java-archive-diff": { "source": "nginx", "extensions": ["jardiff"] },
  "application/x-java-jnlp-file": { "source": "apache", "compressible": false, "extensions": ["jnlp"] },
  "application/x-javascript": { "compressible": true },
  "application/x-keepass2": { "extensions": ["kdbx"] },
  "application/x-latex": { "source": "apache", "compressible": false, "extensions": ["latex"] },
  "application/x-lua-bytecode": { "extensions": ["luac"] },
  "application/x-lzh-compressed": { "source": "apache", "extensions": ["lzh", "lha"] },
  "application/x-makeself": { "source": "nginx", "extensions": ["run"] },
  "application/x-mie": { "source": "apache", "extensions": ["mie"] },
  "application/x-mobipocket-ebook": { "source": "apache", "extensions": ["prc", "mobi"] },
  "application/x-mpegurl": { "compressible": false },
  "application/x-ms-application": { "source": "apache", "extensions": ["application"] },
  "application/x-ms-shortcut": { "source": "apache", "extensions": ["lnk"] },
  "application/x-ms-wmd": { "source": "apache", "extensions": ["wmd"] },
  "application/x-ms-wmz": { "source": "apache", "extensions": ["wmz"] },
  "application/x-ms-xbap": { "source": "apache", "extensions": ["xbap"] },
  "application/x-msaccess": { "source": "apache", "extensions": ["mdb"] },
  "application/x-msbinder": { "source": "apache", "extensions": ["obd"] },
  "application/x-mscardfile": { "source": "apache", "extensions": ["crd"] },
  "application/x-msclip": { "source": "apache", "extensions": ["clp"] },
  "application/x-msdos-program": { "extensions": ["exe"] },
  "application/x-msdownload": { "source": "apache", "extensions": ["exe", "dll", "com", "bat", "msi"] },
  "application/x-msmediaview": { "source": "apache", "extensions": ["mvb", "m13", "m14"] },
  "application/x-msmetafile": { "source": "apache", "extensions": ["wmf", "wmz", "emf", "emz"] },
  "application/x-msmoney": { "source": "apache", "extensions": ["mny"] },
  "application/x-mspublisher": { "source": "apache", "extensions": ["pub"] },
  "application/x-msschedule": { "source": "apache", "extensions": ["scd"] },
  "application/x-msterminal": { "source": "apache", "extensions": ["trm"] },
  "application/x-mswrite": { "source": "apache", "extensions": ["wri"] },
  "application/x-netcdf": { "source": "apache", "extensions": ["nc", "cdf"] },
  "application/x-ns-proxy-autoconfig": { "compressible": true, "extensions": ["pac"] },
  "application/x-nzb": { "source": "apache", "extensions": ["nzb"] },
  "application/x-perl": { "source": "nginx", "extensions": ["pl", "pm"] },
  "application/x-pilot": { "source": "nginx", "extensions": ["prc", "pdb"] },
  "application/x-pkcs12": { "source": "apache", "compressible": false, "extensions": ["p12", "pfx"] },
  "application/x-pkcs7-certificates": { "source": "apache", "extensions": ["p7b", "spc"] },
  "application/x-pkcs7-certreqresp": { "source": "apache", "extensions": ["p7r"] },
  "application/x-pki-message": { "source": "iana" },
  "application/x-rar-compressed": { "source": "apache", "compressible": false, "extensions": ["rar"] },
  "application/x-redhat-package-manager": { "source": "nginx", "extensions": ["rpm"] },
  "application/x-research-info-systems": { "source": "apache", "extensions": ["ris"] },
  "application/x-sea": { "source": "nginx", "extensions": ["sea"] },
  "application/x-sh": { "source": "apache", "compressible": true, "extensions": ["sh"] },
  "application/x-shar": { "source": "apache", "extensions": ["shar"] },
  "application/x-shockwave-flash": { "source": "apache", "compressible": false, "extensions": ["swf"] },
  "application/x-silverlight-app": { "source": "apache", "extensions": ["xap"] },
  "application/x-sql": { "source": "apache", "extensions": ["sql"] },
  "application/x-stuffit": { "source": "apache", "compressible": false, "extensions": ["sit"] },
  "application/x-stuffitx": { "source": "apache", "extensions": ["sitx"] },
  "application/x-subrip": { "source": "apache", "extensions": ["srt"] },
  "application/x-sv4cpio": { "source": "apache", "extensions": ["sv4cpio"] },
  "application/x-sv4crc": { "source": "apache", "extensions": ["sv4crc"] },
  "application/x-t3vm-image": { "source": "apache", "extensions": ["t3"] },
  "application/x-tads": { "source": "apache", "extensions": ["gam"] },
  "application/x-tar": { "source": "apache", "compressible": true, "extensions": ["tar"] },
  "application/x-tcl": { "source": "apache", "extensions": ["tcl", "tk"] },
  "application/x-tex": { "source": "apache", "extensions": ["tex"] },
  "application/x-tex-tfm": { "source": "apache", "extensions": ["tfm"] },
  "application/x-texinfo": { "source": "apache", "extensions": ["texinfo", "texi"] },
  "application/x-tgif": { "source": "apache", "extensions": ["obj"] },
  "application/x-ustar": { "source": "apache", "extensions": ["ustar"] },
  "application/x-virtualbox-hdd": { "compressible": true, "extensions": ["hdd"] },
  "application/x-virtualbox-ova": { "compressible": true, "extensions": ["ova"] },
  "application/x-virtualbox-ovf": { "compressible": true, "extensions": ["ovf"] },
  "application/x-virtualbox-vbox": { "compressible": true, "extensions": ["vbox"] },
  "application/x-virtualbox-vbox-extpack": { "compressible": false, "extensions": ["vbox-extpack"] },
  "application/x-virtualbox-vdi": { "compressible": true, "extensions": ["vdi"] },
  "application/x-virtualbox-vhd": { "compressible": true, "extensions": ["vhd"] },
  "application/x-virtualbox-vmdk": { "compressible": true, "extensions": ["vmdk"] },
  "application/x-wais-source": { "source": "apache", "extensions": ["src"] },
  "application/x-web-app-manifest+json": { "compressible": true, "extensions": ["webapp"] },
  "application/x-www-form-urlencoded": { "source": "iana", "compressible": true },
  "application/x-x509-ca-cert": { "source": "iana", "extensions": ["der", "crt", "pem"] },
  "application/x-x509-ca-ra-cert": { "source": "iana" },
  "application/x-x509-next-ca-cert": { "source": "iana" },
  "application/x-xfig": { "source": "apache", "extensions": ["fig"] },
  "application/x-xliff+xml": { "source": "apache", "compressible": true, "extensions": ["xlf"] },
  "application/x-xpinstall": { "source": "apache", "compressible": false, "extensions": ["xpi"] },
  "application/x-xz": { "source": "apache", "extensions": ["xz"] },
  "application/x-zmachine": { "source": "apache", "extensions": ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"] },
  "application/x400-bp": { "source": "iana" },
  "application/xacml+xml": { "source": "iana", "compressible": true },
  "application/xaml+xml": { "source": "apache", "compressible": true, "extensions": ["xaml"] },
  "application/xcap-att+xml": { "source": "iana", "compressible": true, "extensions": ["xav"] },
  "application/xcap-caps+xml": { "source": "iana", "compressible": true, "extensions": ["xca"] },
  "application/xcap-diff+xml": { "source": "iana", "compressible": true, "extensions": ["xdf"] },
  "application/xcap-el+xml": { "source": "iana", "compressible": true, "extensions": ["xel"] },
  "application/xcap-error+xml": { "source": "iana", "compressible": true },
  "application/xcap-ns+xml": { "source": "iana", "compressible": true, "extensions": ["xns"] },
  "application/xcon-conference-info+xml": { "source": "iana", "compressible": true },
  "application/xcon-conference-info-diff+xml": { "source": "iana", "compressible": true },
  "application/xenc+xml": { "source": "iana", "compressible": true, "extensions": ["xenc"] },
  "application/xhtml+xml": { "source": "iana", "compressible": true, "extensions": ["xhtml", "xht"] },
  "application/xhtml-voice+xml": { "source": "apache", "compressible": true },
  "application/xliff+xml": { "source": "iana", "compressible": true, "extensions": ["xlf"] },
  "application/xml": { "source": "iana", "compressible": true, "extensions": ["xml", "xsl", "xsd", "rng"] },
  "application/xml-dtd": { "source": "iana", "compressible": true, "extensions": ["dtd"] },
  "application/xml-external-parsed-entity": { "source": "iana" },
  "application/xml-patch+xml": { "source": "iana", "compressible": true },
  "application/xmpp+xml": { "source": "iana", "compressible": true },
  "application/xop+xml": { "source": "iana", "compressible": true, "extensions": ["xop"] },
  "application/xproc+xml": { "source": "apache", "compressible": true, "extensions": ["xpl"] },
  "application/xslt+xml": { "source": "iana", "compressible": true, "extensions": ["xsl", "xslt"] },
  "application/xspf+xml": { "source": "apache", "compressible": true, "extensions": ["xspf"] },
  "application/xv+xml": { "source": "iana", "compressible": true, "extensions": ["mxml", "xhvml", "xvml", "xvm"] },
  "application/yang": { "source": "iana", "extensions": ["yang"] },
  "application/yang-data+json": { "source": "iana", "compressible": true },
  "application/yang-data+xml": { "source": "iana", "compressible": true },
  "application/yang-patch+json": { "source": "iana", "compressible": true },
  "application/yang-patch+xml": { "source": "iana", "compressible": true },
  "application/yin+xml": { "source": "iana", "compressible": true, "extensions": ["yin"] },
  "application/zip": { "source": "iana", "compressible": false, "extensions": ["zip"] },
  "application/zlib": { "source": "iana" },
  "application/zstd": { "source": "iana" },
  "audio/1d-interleaved-parityfec": { "source": "iana" },
  "audio/32kadpcm": { "source": "iana" },
  "audio/3gpp": { "source": "iana", "compressible": false, "extensions": ["3gpp"] },
  "audio/3gpp2": { "source": "iana" },
  "audio/aac": { "source": "iana" },
  "audio/ac3": { "source": "iana" },
  "audio/adpcm": { "source": "apache", "extensions": ["adp"] },
  "audio/amr": { "source": "iana", "extensions": ["amr"] },
  "audio/amr-wb": { "source": "iana" },
  "audio/amr-wb+": { "source": "iana" },
  "audio/aptx": { "source": "iana" },
  "audio/asc": { "source": "iana" },
  "audio/atrac-advanced-lossless": { "source": "iana" },
  "audio/atrac-x": { "source": "iana" },
  "audio/atrac3": { "source": "iana" },
  "audio/basic": { "source": "iana", "compressible": false, "extensions": ["au", "snd"] },
  "audio/bv16": { "source": "iana" },
  "audio/bv32": { "source": "iana" },
  "audio/clearmode": { "source": "iana" },
  "audio/cn": { "source": "iana" },
  "audio/dat12": { "source": "iana" },
  "audio/dls": { "source": "iana" },
  "audio/dsr-es201108": { "source": "iana" },
  "audio/dsr-es202050": { "source": "iana" },
  "audio/dsr-es202211": { "source": "iana" },
  "audio/dsr-es202212": { "source": "iana" },
  "audio/dv": { "source": "iana" },
  "audio/dvi4": { "source": "iana" },
  "audio/eac3": { "source": "iana" },
  "audio/encaprtp": { "source": "iana" },
  "audio/evrc": { "source": "iana" },
  "audio/evrc-qcp": { "source": "iana" },
  "audio/evrc0": { "source": "iana" },
  "audio/evrc1": { "source": "iana" },
  "audio/evrcb": { "source": "iana" },
  "audio/evrcb0": { "source": "iana" },
  "audio/evrcb1": { "source": "iana" },
  "audio/evrcnw": { "source": "iana" },
  "audio/evrcnw0": { "source": "iana" },
  "audio/evrcnw1": { "source": "iana" },
  "audio/evrcwb": { "source": "iana" },
  "audio/evrcwb0": { "source": "iana" },
  "audio/evrcwb1": { "source": "iana" },
  "audio/evs": { "source": "iana" },
  "audio/flexfec": { "source": "iana" },
  "audio/fwdred": { "source": "iana" },
  "audio/g711-0": { "source": "iana" },
  "audio/g719": { "source": "iana" },
  "audio/g722": { "source": "iana" },
  "audio/g7221": { "source": "iana" },
  "audio/g723": { "source": "iana" },
  "audio/g726-16": { "source": "iana" },
  "audio/g726-24": { "source": "iana" },
  "audio/g726-32": { "source": "iana" },
  "audio/g726-40": { "source": "iana" },
  "audio/g728": { "source": "iana" },
  "audio/g729": { "source": "iana" },
  "audio/g7291": { "source": "iana" },
  "audio/g729d": { "source": "iana" },
  "audio/g729e": { "source": "iana" },
  "audio/gsm": { "source": "iana" },
  "audio/gsm-efr": { "source": "iana" },
  "audio/gsm-hr-08": { "source": "iana" },
  "audio/ilbc": { "source": "iana" },
  "audio/ip-mr_v2.5": { "source": "iana" },
  "audio/isac": { "source": "apache" },
  "audio/l16": { "source": "iana" },
  "audio/l20": { "source": "iana" },
  "audio/l24": { "source": "iana", "compressible": false },
  "audio/l8": { "source": "iana" },
  "audio/lpc": { "source": "iana" },
  "audio/melp": { "source": "iana" },
  "audio/melp1200": { "source": "iana" },
  "audio/melp2400": { "source": "iana" },
  "audio/melp600": { "source": "iana" },
  "audio/mhas": { "source": "iana" },
  "audio/midi": { "source": "apache", "extensions": ["mid", "midi", "kar", "rmi"] },
  "audio/mobile-xmf": { "source": "iana", "extensions": ["mxmf"] },
  "audio/mp3": { "compressible": false, "extensions": ["mp3"] },
  "audio/mp4": { "source": "iana", "compressible": false, "extensions": ["m4a", "mp4a"] },
  "audio/mp4a-latm": { "source": "iana" },
  "audio/mpa": { "source": "iana" },
  "audio/mpa-robust": { "source": "iana" },
  "audio/mpeg": { "source": "iana", "compressible": false, "extensions": ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"] },
  "audio/mpeg4-generic": { "source": "iana" },
  "audio/musepack": { "source": "apache" },
  "audio/ogg": { "source": "iana", "compressible": false, "extensions": ["oga", "ogg", "spx", "opus"] },
  "audio/opus": { "source": "iana" },
  "audio/parityfec": { "source": "iana" },
  "audio/pcma": { "source": "iana" },
  "audio/pcma-wb": { "source": "iana" },
  "audio/pcmu": { "source": "iana" },
  "audio/pcmu-wb": { "source": "iana" },
  "audio/prs.sid": { "source": "iana" },
  "audio/qcelp": { "source": "iana" },
  "audio/raptorfec": { "source": "iana" },
  "audio/red": { "source": "iana" },
  "audio/rtp-enc-aescm128": { "source": "iana" },
  "audio/rtp-midi": { "source": "iana" },
  "audio/rtploopback": { "source": "iana" },
  "audio/rtx": { "source": "iana" },
  "audio/s3m": { "source": "apache", "extensions": ["s3m"] },
  "audio/scip": { "source": "iana" },
  "audio/silk": { "source": "apache", "extensions": ["sil"] },
  "audio/smv": { "source": "iana" },
  "audio/smv-qcp": { "source": "iana" },
  "audio/smv0": { "source": "iana" },
  "audio/sofa": { "source": "iana" },
  "audio/sp-midi": { "source": "iana" },
  "audio/speex": { "source": "iana" },
  "audio/t140c": { "source": "iana" },
  "audio/t38": { "source": "iana" },
  "audio/telephone-event": { "source": "iana" },
  "audio/tetra_acelp": { "source": "iana" },
  "audio/tetra_acelp_bb": { "source": "iana" },
  "audio/tone": { "source": "iana" },
  "audio/tsvcis": { "source": "iana" },
  "audio/uemclip": { "source": "iana" },
  "audio/ulpfec": { "source": "iana" },
  "audio/usac": { "source": "iana" },
  "audio/vdvi": { "source": "iana" },
  "audio/vmr-wb": { "source": "iana" },
  "audio/vnd.3gpp.iufp": { "source": "iana" },
  "audio/vnd.4sb": { "source": "iana" },
  "audio/vnd.audiokoz": { "source": "iana" },
  "audio/vnd.celp": { "source": "iana" },
  "audio/vnd.cisco.nse": { "source": "iana" },
  "audio/vnd.cmles.radio-events": { "source": "iana" },
  "audio/vnd.cns.anp1": { "source": "iana" },
  "audio/vnd.cns.inf1": { "source": "iana" },
  "audio/vnd.dece.audio": { "source": "iana", "extensions": ["uva", "uvva"] },
  "audio/vnd.digital-winds": { "source": "iana", "extensions": ["eol"] },
  "audio/vnd.dlna.adts": { "source": "iana" },
  "audio/vnd.dolby.heaac.1": { "source": "iana" },
  "audio/vnd.dolby.heaac.2": { "source": "iana" },
  "audio/vnd.dolby.mlp": { "source": "iana" },
  "audio/vnd.dolby.mps": { "source": "iana" },
  "audio/vnd.dolby.pl2": { "source": "iana" },
  "audio/vnd.dolby.pl2x": { "source": "iana" },
  "audio/vnd.dolby.pl2z": { "source": "iana" },
  "audio/vnd.dolby.pulse.1": { "source": "iana" },
  "audio/vnd.dra": { "source": "iana", "extensions": ["dra"] },
  "audio/vnd.dts": { "source": "iana", "extensions": ["dts"] },
  "audio/vnd.dts.hd": { "source": "iana", "extensions": ["dtshd"] },
  "audio/vnd.dts.uhd": { "source": "iana" },
  "audio/vnd.dvb.file": { "source": "iana" },
  "audio/vnd.everad.plj": { "source": "iana" },
  "audio/vnd.hns.audio": { "source": "iana" },
  "audio/vnd.lucent.voice": { "source": "iana", "extensions": ["lvp"] },
  "audio/vnd.ms-playready.media.pya": { "source": "iana", "extensions": ["pya"] },
  "audio/vnd.nokia.mobile-xmf": { "source": "iana" },
  "audio/vnd.nortel.vbk": { "source": "iana" },
  "audio/vnd.nuera.ecelp4800": { "source": "iana", "extensions": ["ecelp4800"] },
  "audio/vnd.nuera.ecelp7470": { "source": "iana", "extensions": ["ecelp7470"] },
  "audio/vnd.nuera.ecelp9600": { "source": "iana", "extensions": ["ecelp9600"] },
  "audio/vnd.octel.sbc": { "source": "iana" },
  "audio/vnd.presonus.multitrack": { "source": "iana" },
  "audio/vnd.qcelp": { "source": "iana" },
  "audio/vnd.rhetorex.32kadpcm": { "source": "iana" },
  "audio/vnd.rip": { "source": "iana", "extensions": ["rip"] },
  "audio/vnd.rn-realaudio": { "compressible": false },
  "audio/vnd.sealedmedia.softseal.mpeg": { "source": "iana" },
  "audio/vnd.vmx.cvsd": { "source": "iana" },
  "audio/vnd.wave": { "compressible": false },
  "audio/vorbis": { "source": "iana", "compressible": false },
  "audio/vorbis-config": { "source": "iana" },
  "audio/wav": { "compressible": false, "extensions": ["wav"] },
  "audio/wave": { "compressible": false, "extensions": ["wav"] },
  "audio/webm": { "source": "apache", "compressible": false, "extensions": ["weba"] },
  "audio/x-aac": { "source": "apache", "compressible": false, "extensions": ["aac"] },
  "audio/x-aiff": { "source": "apache", "extensions": ["aif", "aiff", "aifc"] },
  "audio/x-caf": { "source": "apache", "compressible": false, "extensions": ["caf"] },
  "audio/x-flac": { "source": "apache", "extensions": ["flac"] },
  "audio/x-m4a": { "source": "nginx", "extensions": ["m4a"] },
  "audio/x-matroska": { "source": "apache", "extensions": ["mka"] },
  "audio/x-mpegurl": { "source": "apache", "extensions": ["m3u"] },
  "audio/x-ms-wax": { "source": "apache", "extensions": ["wax"] },
  "audio/x-ms-wma": { "source": "apache", "extensions": ["wma"] },
  "audio/x-pn-realaudio": { "source": "apache", "extensions": ["ram", "ra"] },
  "audio/x-pn-realaudio-plugin": { "source": "apache", "extensions": ["rmp"] },
  "audio/x-realaudio": { "source": "nginx", "extensions": ["ra"] },
  "audio/x-tta": { "source": "apache" },
  "audio/x-wav": { "source": "apache", "extensions": ["wav"] },
  "audio/xm": { "source": "apache", "extensions": ["xm"] },
  "chemical/x-cdx": { "source": "apache", "extensions": ["cdx"] },
  "chemical/x-cif": { "source": "apache", "extensions": ["cif"] },
  "chemical/x-cmdf": { "source": "apache", "extensions": ["cmdf"] },
  "chemical/x-cml": { "source": "apache", "extensions": ["cml"] },
  "chemical/x-csml": { "source": "apache", "extensions": ["csml"] },
  "chemical/x-pdb": { "source": "apache" },
  "chemical/x-xyz": { "source": "apache", "extensions": ["xyz"] },
  "font/collection": { "source": "iana", "extensions": ["ttc"] },
  "font/otf": { "source": "iana", "compressible": true, "extensions": ["otf"] },
  "font/sfnt": { "source": "iana" },
  "font/ttf": { "source": "iana", "compressible": true, "extensions": ["ttf"] },
  "font/woff": { "source": "iana", "extensions": ["woff"] },
  "font/woff2": { "source": "iana", "extensions": ["woff2"] },
  "image/aces": { "source": "iana", "extensions": ["exr"] },
  "image/apng": { "compressible": false, "extensions": ["apng"] },
  "image/avci": { "source": "iana", "extensions": ["avci"] },
  "image/avcs": { "source": "iana", "extensions": ["avcs"] },
  "image/avif": { "source": "iana", "compressible": false, "extensions": ["avif"] },
  "image/bmp": { "source": "iana", "compressible": true, "extensions": ["bmp"] },
  "image/cgm": { "source": "iana", "extensions": ["cgm"] },
  "image/dicom-rle": { "source": "iana", "extensions": ["drle"] },
  "image/emf": { "source": "iana", "extensions": ["emf"] },
  "image/fits": { "source": "iana", "extensions": ["fits"] },
  "image/g3fax": { "source": "iana", "extensions": ["g3"] },
  "image/gif": { "source": "iana", "compressible": false, "extensions": ["gif"] },
  "image/heic": { "source": "iana", "extensions": ["heic"] },
  "image/heic-sequence": { "source": "iana", "extensions": ["heics"] },
  "image/heif": { "source": "iana", "extensions": ["heif"] },
  "image/heif-sequence": { "source": "iana", "extensions": ["heifs"] },
  "image/hej2k": { "source": "iana", "extensions": ["hej2"] },
  "image/hsj2": { "source": "iana", "extensions": ["hsj2"] },
  "image/ief": { "source": "iana", "extensions": ["ief"] },
  "image/jls": { "source": "iana", "extensions": ["jls"] },
  "image/jp2": { "source": "iana", "compressible": false, "extensions": ["jp2", "jpg2"] },
  "image/jpeg": { "source": "iana", "compressible": false, "extensions": ["jpeg", "jpg", "jpe"] },
  "image/jph": { "source": "iana", "extensions": ["jph"] },
  "image/jphc": { "source": "iana", "extensions": ["jhc"] },
  "image/jpm": { "source": "iana", "compressible": false, "extensions": ["jpm"] },
  "image/jpx": { "source": "iana", "compressible": false, "extensions": ["jpx", "jpf"] },
  "image/jxr": { "source": "iana", "extensions": ["jxr"] },
  "image/jxra": { "source": "iana", "extensions": ["jxra"] },
  "image/jxrs": { "source": "iana", "extensions": ["jxrs"] },
  "image/jxs": { "source": "iana", "extensions": ["jxs"] },
  "image/jxsc": { "source": "iana", "extensions": ["jxsc"] },
  "image/jxsi": { "source": "iana", "extensions": ["jxsi"] },
  "image/jxss": { "source": "iana", "extensions": ["jxss"] },
  "image/ktx": { "source": "iana", "extensions": ["ktx"] },
  "image/ktx2": { "source": "iana", "extensions": ["ktx2"] },
  "image/naplps": { "source": "iana" },
  "image/pjpeg": { "compressible": false },
  "image/png": { "source": "iana", "compressible": false, "extensions": ["png"] },
  "image/prs.btif": { "source": "iana", "extensions": ["btif"] },
  "image/prs.pti": { "source": "iana", "extensions": ["pti"] },
  "image/pwg-raster": { "source": "iana" },
  "image/sgi": { "source": "apache", "extensions": ["sgi"] },
  "image/svg+xml": { "source": "iana", "compressible": true, "extensions": ["svg", "svgz"] },
  "image/t38": { "source": "iana", "extensions": ["t38"] },
  "image/tiff": { "source": "iana", "compressible": false, "extensions": ["tif", "tiff"] },
  "image/tiff-fx": { "source": "iana", "extensions": ["tfx"] },
  "image/vnd.adobe.photoshop": { "source": "iana", "compressible": true, "extensions": ["psd"] },
  "image/vnd.airzip.accelerator.azv": { "source": "iana", "extensions": ["azv"] },
  "image/vnd.cns.inf2": { "source": "iana" },
  "image/vnd.dece.graphic": { "source": "iana", "extensions": ["uvi", "uvvi", "uvg", "uvvg"] },
  "image/vnd.djvu": { "source": "iana", "extensions": ["djvu", "djv"] },
  "image/vnd.dvb.subtitle": { "source": "iana", "extensions": ["sub"] },
  "image/vnd.dwg": { "source": "iana", "extensions": ["dwg"] },
  "image/vnd.dxf": { "source": "iana", "extensions": ["dxf"] },
  "image/vnd.fastbidsheet": { "source": "iana", "extensions": ["fbs"] },
  "image/vnd.fpx": { "source": "iana", "extensions": ["fpx"] },
  "image/vnd.fst": { "source": "iana", "extensions": ["fst"] },
  "image/vnd.fujixerox.edmics-mmr": { "source": "iana", "extensions": ["mmr"] },
  "image/vnd.fujixerox.edmics-rlc": { "source": "iana", "extensions": ["rlc"] },
  "image/vnd.globalgraphics.pgb": { "source": "iana" },
  "image/vnd.microsoft.icon": { "source": "iana", "compressible": true, "extensions": ["ico"] },
  "image/vnd.mix": { "source": "iana" },
  "image/vnd.mozilla.apng": { "source": "iana" },
  "image/vnd.ms-dds": { "compressible": true, "extensions": ["dds"] },
  "image/vnd.ms-modi": { "source": "iana", "extensions": ["mdi"] },
  "image/vnd.ms-photo": { "source": "apache", "extensions": ["wdp"] },
  "image/vnd.net-fpx": { "source": "iana", "extensions": ["npx"] },
  "image/vnd.pco.b16": { "source": "iana", "extensions": ["b16"] },
  "image/vnd.radiance": { "source": "iana" },
  "image/vnd.sealed.png": { "source": "iana" },
  "image/vnd.sealedmedia.softseal.gif": { "source": "iana" },
  "image/vnd.sealedmedia.softseal.jpg": { "source": "iana" },
  "image/vnd.svf": { "source": "iana" },
  "image/vnd.tencent.tap": { "source": "iana", "extensions": ["tap"] },
  "image/vnd.valve.source.texture": { "source": "iana", "extensions": ["vtf"] },
  "image/vnd.wap.wbmp": { "source": "iana", "extensions": ["wbmp"] },
  "image/vnd.xiff": { "source": "iana", "extensions": ["xif"] },
  "image/vnd.zbrush.pcx": { "source": "iana", "extensions": ["pcx"] },
  "image/webp": { "source": "apache", "extensions": ["webp"] },
  "image/wmf": { "source": "iana", "extensions": ["wmf"] },
  "image/x-3ds": { "source": "apache", "extensions": ["3ds"] },
  "image/x-cmu-raster": { "source": "apache", "extensions": ["ras"] },
  "image/x-cmx": { "source": "apache", "extensions": ["cmx"] },
  "image/x-freehand": { "source": "apache", "extensions": ["fh", "fhc", "fh4", "fh5", "fh7"] },
  "image/x-icon": { "source": "apache", "compressible": true, "extensions": ["ico"] },
  "image/x-jng": { "source": "nginx", "extensions": ["jng"] },
  "image/x-mrsid-image": { "source": "apache", "extensions": ["sid"] },
  "image/x-ms-bmp": { "source": "nginx", "compressible": true, "extensions": ["bmp"] },
  "image/x-pcx": { "source": "apache", "extensions": ["pcx"] },
  "image/x-pict": { "source": "apache", "extensions": ["pic", "pct"] },
  "image/x-portable-anymap": { "source": "apache", "extensions": ["pnm"] },
  "image/x-portable-bitmap": { "source": "apache", "extensions": ["pbm"] },
  "image/x-portable-graymap": { "source": "apache", "extensions": ["pgm"] },
  "image/x-portable-pixmap": { "source": "apache", "extensions": ["ppm"] },
  "image/x-rgb": { "source": "apache", "extensions": ["rgb"] },
  "image/x-tga": { "source": "apache", "extensions": ["tga"] },
  "image/x-xbitmap": { "source": "apache", "extensions": ["xbm"] },
  "image/x-xcf": { "compressible": false },
  "image/x-xpixmap": { "source": "apache", "extensions": ["xpm"] },
  "image/x-xwindowdump": { "source": "apache", "extensions": ["xwd"] },
  "message/cpim": { "source": "iana" },
  "message/delivery-status": { "source": "iana" },
  "message/disposition-notification": { "source": "iana", "extensions": ["disposition-notification"] },
  "message/external-body": { "source": "iana" },
  "message/feedback-report": { "source": "iana" },
  "message/global": { "source": "iana", "extensions": ["u8msg"] },
  "message/global-delivery-status": { "source": "iana", "extensions": ["u8dsn"] },
  "message/global-disposition-notification": { "source": "iana", "extensions": ["u8mdn"] },
  "message/global-headers": { "source": "iana", "extensions": ["u8hdr"] },
  "message/http": { "source": "iana", "compressible": false },
  "message/imdn+xml": { "source": "iana", "compressible": true },
  "message/news": { "source": "iana" },
  "message/partial": { "source": "iana", "compressible": false },
  "message/rfc822": { "source": "iana", "compressible": true, "extensions": ["eml", "mime"] },
  "message/s-http": { "source": "iana" },
  "message/sip": { "source": "iana" },
  "message/sipfrag": { "source": "iana" },
  "message/tracking-status": { "source": "iana" },
  "message/vnd.si.simp": { "source": "iana" },
  "message/vnd.wfa.wsc": { "source": "iana", "extensions": ["wsc"] },
  "model/3mf": { "source": "iana", "extensions": ["3mf"] },
  "model/e57": { "source": "iana" },
  "model/gltf+json": { "source": "iana", "compressible": true, "extensions": ["gltf"] },
  "model/gltf-binary": { "source": "iana", "compressible": true, "extensions": ["glb"] },
  "model/iges": { "source": "iana", "compressible": false, "extensions": ["igs", "iges"] },
  "model/mesh": { "source": "iana", "compressible": false, "extensions": ["msh", "mesh", "silo"] },
  "model/mtl": { "source": "iana", "extensions": ["mtl"] },
  "model/obj": { "source": "iana", "extensions": ["obj"] },
  "model/step": { "source": "iana" },
  "model/step+xml": { "source": "iana", "compressible": true, "extensions": ["stpx"] },
  "model/step+zip": { "source": "iana", "compressible": false, "extensions": ["stpz"] },
  "model/step-xml+zip": { "source": "iana", "compressible": false, "extensions": ["stpxz"] },
  "model/stl": { "source": "iana", "extensions": ["stl"] },
  "model/vnd.collada+xml": { "source": "iana", "compressible": true, "extensions": ["dae"] },
  "model/vnd.dwf": { "source": "iana", "extensions": ["dwf"] },
  "model/vnd.flatland.3dml": { "source": "iana" },
  "model/vnd.gdl": { "source": "iana", "extensions": ["gdl"] },
  "model/vnd.gs-gdl": { "source": "apache" },
  "model/vnd.gs.gdl": { "source": "iana" },
  "model/vnd.gtw": { "source": "iana", "extensions": ["gtw"] },
  "model/vnd.moml+xml": { "source": "iana", "compressible": true },
  "model/vnd.mts": { "source": "iana", "extensions": ["mts"] },
  "model/vnd.opengex": { "source": "iana", "extensions": ["ogex"] },
  "model/vnd.parasolid.transmit.binary": { "source": "iana", "extensions": ["x_b"] },
  "model/vnd.parasolid.transmit.text": { "source": "iana", "extensions": ["x_t"] },
  "model/vnd.pytha.pyox": { "source": "iana" },
  "model/vnd.rosette.annotated-data-model": { "source": "iana" },
  "model/vnd.sap.vds": { "source": "iana", "extensions": ["vds"] },
  "model/vnd.usdz+zip": { "source": "iana", "compressible": false, "extensions": ["usdz"] },
  "model/vnd.valve.source.compiled-map": { "source": "iana", "extensions": ["bsp"] },
  "model/vnd.vtu": { "source": "iana", "extensions": ["vtu"] },
  "model/vrml": { "source": "iana", "compressible": false, "extensions": ["wrl", "vrml"] },
  "model/x3d+binary": { "source": "apache", "compressible": false, "extensions": ["x3db", "x3dbz"] },
  "model/x3d+fastinfoset": { "source": "iana", "extensions": ["x3db"] },
  "model/x3d+vrml": { "source": "apache", "compressible": false, "extensions": ["x3dv", "x3dvz"] },
  "model/x3d+xml": { "source": "iana", "compressible": true, "extensions": ["x3d", "x3dz"] },
  "model/x3d-vrml": { "source": "iana", "extensions": ["x3dv"] },
  "multipart/alternative": { "source": "iana", "compressible": false },
  "multipart/appledouble": { "source": "iana" },
  "multipart/byteranges": { "source": "iana" },
  "multipart/digest": { "source": "iana" },
  "multipart/encrypted": { "source": "iana", "compressible": false },
  "multipart/form-data": { "source": "iana", "compressible": false },
  "multipart/header-set": { "source": "iana" },
  "multipart/mixed": { "source": "iana" },
  "multipart/multilingual": { "source": "iana" },
  "multipart/parallel": { "source": "iana" },
  "multipart/related": { "source": "iana", "compressible": false },
  "multipart/report": { "source": "iana" },
  "multipart/signed": { "source": "iana", "compressible": false },
  "multipart/vnd.bint.med-plus": { "source": "iana" },
  "multipart/voice-message": { "source": "iana" },
  "multipart/x-mixed-replace": { "source": "iana" },
  "text/1d-interleaved-parityfec": { "source": "iana" },
  "text/cache-manifest": { "source": "iana", "compressible": true, "extensions": ["appcache", "manifest"] },
  "text/calendar": { "source": "iana", "extensions": ["ics", "ifb"] },
  "text/calender": { "compressible": true },
  "text/cmd": { "compressible": true },
  "text/coffeescript": { "extensions": ["coffee", "litcoffee"] },
  "text/cql": { "source": "iana" },
  "text/cql-expression": { "source": "iana" },
  "text/cql-identifier": { "source": "iana" },
  "text/css": { "source": "iana", "charset": "UTF-8", "compressible": true, "extensions": ["css"] },
  "text/csv": { "source": "iana", "compressible": true, "extensions": ["csv"] },
  "text/csv-schema": { "source": "iana" },
  "text/directory": { "source": "iana" },
  "text/dns": { "source": "iana" },
  "text/ecmascript": { "source": "iana" },
  "text/encaprtp": { "source": "iana" },
  "text/enriched": { "source": "iana" },
  "text/fhirpath": { "source": "iana" },
  "text/flexfec": { "source": "iana" },
  "text/fwdred": { "source": "iana" },
  "text/gff3": { "source": "iana" },
  "text/grammar-ref-list": { "source": "iana" },
  "text/html": { "source": "iana", "compressible": true, "extensions": ["html", "htm", "shtml"] },
  "text/jade": { "extensions": ["jade"] },
  "text/javascript": { "source": "iana", "compressible": true },
  "text/jcr-cnd": { "source": "iana" },
  "text/jsx": { "compressible": true, "extensions": ["jsx"] },
  "text/less": { "compressible": true, "extensions": ["less"] },
  "text/markdown": { "source": "iana", "compressible": true, "extensions": ["markdown", "md"] },
  "text/mathml": { "source": "nginx", "extensions": ["mml"] },
  "text/mdx": { "compressible": true, "extensions": ["mdx"] },
  "text/mizar": { "source": "iana" },
  "text/n3": { "source": "iana", "charset": "UTF-8", "compressible": true, "extensions": ["n3"] },
  "text/parameters": { "source": "iana", "charset": "UTF-8" },
  "text/parityfec": { "source": "iana" },
  "text/plain": { "source": "iana", "compressible": true, "extensions": ["txt", "text", "conf", "def", "list", "log", "in", "ini"] },
  "text/provenance-notation": { "source": "iana", "charset": "UTF-8" },
  "text/prs.fallenstein.rst": { "source": "iana" },
  "text/prs.lines.tag": { "source": "iana", "extensions": ["dsc"] },
  "text/prs.prop.logic": { "source": "iana" },
  "text/raptorfec": { "source": "iana" },
  "text/red": { "source": "iana" },
  "text/rfc822-headers": { "source": "iana" },
  "text/richtext": { "source": "iana", "compressible": true, "extensions": ["rtx"] },
  "text/rtf": { "source": "iana", "compressible": true, "extensions": ["rtf"] },
  "text/rtp-enc-aescm128": { "source": "iana" },
  "text/rtploopback": { "source": "iana" },
  "text/rtx": { "source": "iana" },
  "text/sgml": { "source": "iana", "extensions": ["sgml", "sgm"] },
  "text/shaclc": { "source": "iana" },
  "text/shex": { "source": "iana", "extensions": ["shex"] },
  "text/slim": { "extensions": ["slim", "slm"] },
  "text/spdx": { "source": "iana", "extensions": ["spdx"] },
  "text/strings": { "source": "iana" },
  "text/stylus": { "extensions": ["stylus", "styl"] },
  "text/t140": { "source": "iana" },
  "text/tab-separated-values": { "source": "iana", "compressible": true, "extensions": ["tsv"] },
  "text/troff": { "source": "iana", "extensions": ["t", "tr", "roff", "man", "me", "ms"] },
  "text/turtle": { "source": "iana", "charset": "UTF-8", "extensions": ["ttl"] },
  "text/ulpfec": { "source": "iana" },
  "text/uri-list": { "source": "iana", "compressible": true, "extensions": ["uri", "uris", "urls"] },
  "text/vcard": { "source": "iana", "compressible": true, "extensions": ["vcard"] },
  "text/vnd.a": { "source": "iana" },
  "text/vnd.abc": { "source": "iana" },
  "text/vnd.ascii-art": { "source": "iana" },
  "text/vnd.curl": { "source": "iana", "extensions": ["curl"] },
  "text/vnd.curl.dcurl": { "source": "apache", "extensions": ["dcurl"] },
  "text/vnd.curl.mcurl": { "source": "apache", "extensions": ["mcurl"] },
  "text/vnd.curl.scurl": { "source": "apache", "extensions": ["scurl"] },
  "text/vnd.debian.copyright": { "source": "iana", "charset": "UTF-8" },
  "text/vnd.dmclientscript": { "source": "iana" },
  "text/vnd.dvb.subtitle": { "source": "iana", "extensions": ["sub"] },
  "text/vnd.esmertec.theme-descriptor": { "source": "iana", "charset": "UTF-8" },
  "text/vnd.familysearch.gedcom": { "source": "iana", "extensions": ["ged"] },
  "text/vnd.ficlab.flt": { "source": "iana" },
  "text/vnd.fly": { "source": "iana", "extensions": ["fly"] },
  "text/vnd.fmi.flexstor": { "source": "iana", "extensions": ["flx"] },
  "text/vnd.gml": { "source": "iana" },
  "text/vnd.graphviz": { "source": "iana", "extensions": ["gv"] },
  "text/vnd.hans": { "source": "iana" },
  "text/vnd.hgl": { "source": "iana" },
  "text/vnd.in3d.3dml": { "source": "iana", "extensions": ["3dml"] },
  "text/vnd.in3d.spot": { "source": "iana", "extensions": ["spot"] },
  "text/vnd.iptc.newsml": { "source": "iana" },
  "text/vnd.iptc.nitf": { "source": "iana" },
  "text/vnd.latex-z": { "source": "iana" },
  "text/vnd.motorola.reflex": { "source": "iana" },
  "text/vnd.ms-mediapackage": { "source": "iana" },
  "text/vnd.net2phone.commcenter.command": { "source": "iana" },
  "text/vnd.radisys.msml-basic-layout": { "source": "iana" },
  "text/vnd.senx.warpscript": { "source": "iana" },
  "text/vnd.si.uricatalogue": { "source": "iana" },
  "text/vnd.sosi": { "source": "iana" },
  "text/vnd.sun.j2me.app-descriptor": { "source": "iana", "charset": "UTF-8", "extensions": ["jad"] },
  "text/vnd.trolltech.linguist": { "source": "iana", "charset": "UTF-8" },
  "text/vnd.wap.si": { "source": "iana" },
  "text/vnd.wap.sl": { "source": "iana" },
  "text/vnd.wap.wml": { "source": "iana", "extensions": ["wml"] },
  "text/vnd.wap.wmlscript": { "source": "iana", "extensions": ["wmls"] },
  "text/vtt": { "source": "iana", "charset": "UTF-8", "compressible": true, "extensions": ["vtt"] },
  "text/x-asm": { "source": "apache", "extensions": ["s", "asm"] },
  "text/x-c": { "source": "apache", "extensions": ["c", "cc", "cxx", "cpp", "h", "hh", "dic"] },
  "text/x-component": { "source": "nginx", "extensions": ["htc"] },
  "text/x-fortran": { "source": "apache", "extensions": ["f", "for", "f77", "f90"] },
  "text/x-gwt-rpc": { "compressible": true },
  "text/x-handlebars-template": { "extensions": ["hbs"] },
  "text/x-java-source": { "source": "apache", "extensions": ["java"] },
  "text/x-jquery-tmpl": { "compressible": true },
  "text/x-lua": { "extensions": ["lua"] },
  "text/x-markdown": { "compressible": true, "extensions": ["mkd"] },
  "text/x-nfo": { "source": "apache", "extensions": ["nfo"] },
  "text/x-opml": { "source": "apache", "extensions": ["opml"] },
  "text/x-org": { "compressible": true, "extensions": ["org"] },
  "text/x-pascal": { "source": "apache", "extensions": ["p", "pas"] },
  "text/x-processing": { "compressible": true, "extensions": ["pde"] },
  "text/x-sass": { "extensions": ["sass"] },
  "text/x-scss": { "extensions": ["scss"] },
  "text/x-setext": { "source": "apache", "extensions": ["etx"] },
  "text/x-sfv": { "source": "apache", "extensions": ["sfv"] },
  "text/x-suse-ymp": { "compressible": true, "extensions": ["ymp"] },
  "text/x-uuencode": { "source": "apache", "extensions": ["uu"] },
  "text/x-vcalendar": { "source": "apache", "extensions": ["vcs"] },
  "text/x-vcard": { "source": "apache", "extensions": ["vcf"] },
  "text/xml": { "source": "iana", "compressible": true, "extensions": ["xml"] },
  "text/xml-external-parsed-entity": { "source": "iana" },
  "text/yaml": { "compressible": true, "extensions": ["yaml", "yml"] },
  "video/1d-interleaved-parityfec": { "source": "iana" },
  "video/3gpp": { "source": "iana", "extensions": ["3gp", "3gpp"] },
  "video/3gpp-tt": { "source": "iana" },
  "video/3gpp2": { "source": "iana", "extensions": ["3g2"] },
  "video/av1": { "source": "iana" },
  "video/bmpeg": { "source": "iana" },
  "video/bt656": { "source": "iana" },
  "video/celb": { "source": "iana" },
  "video/dv": { "source": "iana" },
  "video/encaprtp": { "source": "iana" },
  "video/ffv1": { "source": "iana" },
  "video/flexfec": { "source": "iana" },
  "video/h261": { "source": "iana", "extensions": ["h261"] },
  "video/h263": { "source": "iana", "extensions": ["h263"] },
  "video/h263-1998": { "source": "iana" },
  "video/h263-2000": { "source": "iana" },
  "video/h264": { "source": "iana", "extensions": ["h264"] },
  "video/h264-rcdo": { "source": "iana" },
  "video/h264-svc": { "source": "iana" },
  "video/h265": { "source": "iana" },
  "video/iso.segment": { "source": "iana", "extensions": ["m4s"] },
  "video/jpeg": { "source": "iana", "extensions": ["jpgv"] },
  "video/jpeg2000": { "source": "iana" },
  "video/jpm": { "source": "apache", "extensions": ["jpm", "jpgm"] },
  "video/jxsv": { "source": "iana" },
  "video/mj2": { "source": "iana", "extensions": ["mj2", "mjp2"] },
  "video/mp1s": { "source": "iana" },
  "video/mp2p": { "source": "iana" },
  "video/mp2t": { "source": "iana", "extensions": ["ts"] },
  "video/mp4": { "source": "iana", "compressible": false, "extensions": ["mp4", "mp4v", "mpg4"] },
  "video/mp4v-es": { "source": "iana" },
  "video/mpeg": { "source": "iana", "compressible": false, "extensions": ["mpeg", "mpg", "mpe", "m1v", "m2v"] },
  "video/mpeg4-generic": { "source": "iana" },
  "video/mpv": { "source": "iana" },
  "video/nv": { "source": "iana" },
  "video/ogg": { "source": "iana", "compressible": false, "extensions": ["ogv"] },
  "video/parityfec": { "source": "iana" },
  "video/pointer": { "source": "iana" },
  "video/quicktime": { "source": "iana", "compressible": false, "extensions": ["qt", "mov"] },
  "video/raptorfec": { "source": "iana" },
  "video/raw": { "source": "iana" },
  "video/rtp-enc-aescm128": { "source": "iana" },
  "video/rtploopback": { "source": "iana" },
  "video/rtx": { "source": "iana" },
  "video/scip": { "source": "iana" },
  "video/smpte291": { "source": "iana" },
  "video/smpte292m": { "source": "iana" },
  "video/ulpfec": { "source": "iana" },
  "video/vc1": { "source": "iana" },
  "video/vc2": { "source": "iana" },
  "video/vnd.cctv": { "source": "iana" },
  "video/vnd.dece.hd": { "source": "iana", "extensions": ["uvh", "uvvh"] },
  "video/vnd.dece.mobile": { "source": "iana", "extensions": ["uvm", "uvvm"] },
  "video/vnd.dece.mp4": { "source": "iana" },
  "video/vnd.dece.pd": { "source": "iana", "extensions": ["uvp", "uvvp"] },
  "video/vnd.dece.sd": { "source": "iana", "extensions": ["uvs", "uvvs"] },
  "video/vnd.dece.video": { "source": "iana", "extensions": ["uvv", "uvvv"] },
  "video/vnd.directv.mpeg": { "source": "iana" },
  "video/vnd.directv.mpeg-tts": { "source": "iana" },
  "video/vnd.dlna.mpeg-tts": { "source": "iana" },
  "video/vnd.dvb.file": { "source": "iana", "extensions": ["dvb"] },
  "video/vnd.fvt": { "source": "iana", "extensions": ["fvt"] },
  "video/vnd.hns.video": { "source": "iana" },
  "video/vnd.iptvforum.1dparityfec-1010": { "source": "iana" },
  "video/vnd.iptvforum.1dparityfec-2005": { "source": "iana" },
  "video/vnd.iptvforum.2dparityfec-1010": { "source": "iana" },
  "video/vnd.iptvforum.2dparityfec-2005": { "source": "iana" },
  "video/vnd.iptvforum.ttsavc": { "source": "iana" },
  "video/vnd.iptvforum.ttsmpeg2": { "source": "iana" },
  "video/vnd.motorola.video": { "source": "iana" },
  "video/vnd.motorola.videop": { "source": "iana" },
  "video/vnd.mpegurl": { "source": "iana", "extensions": ["mxu", "m4u"] },
  "video/vnd.ms-playready.media.pyv": { "source": "iana", "extensions": ["pyv"] },
  "video/vnd.nokia.interleaved-multimedia": { "source": "iana" },
  "video/vnd.nokia.mp4vr": { "source": "iana" },
  "video/vnd.nokia.videovoip": { "source": "iana" },
  "video/vnd.objectvideo": { "source": "iana" },
  "video/vnd.radgamettools.bink": { "source": "iana" },
  "video/vnd.radgamettools.smacker": { "source": "iana" },
  "video/vnd.sealed.mpeg1": { "source": "iana" },
  "video/vnd.sealed.mpeg4": { "source": "iana" },
  "video/vnd.sealed.swf": { "source": "iana" },
  "video/vnd.sealedmedia.softseal.mov": { "source": "iana" },
  "video/vnd.uvvu.mp4": { "source": "iana", "extensions": ["uvu", "uvvu"] },
  "video/vnd.vivo": { "source": "iana", "extensions": ["viv"] },
  "video/vnd.youtube.yt": { "source": "iana" },
  "video/vp8": { "source": "iana" },
  "video/vp9": { "source": "iana" },
  "video/webm": { "source": "apache", "compressible": false, "extensions": ["webm"] },
  "video/x-f4v": { "source": "apache", "extensions": ["f4v"] },
  "video/x-fli": { "source": "apache", "extensions": ["fli"] },
  "video/x-flv": { "source": "apache", "compressible": false, "extensions": ["flv"] },
  "video/x-m4v": { "source": "apache", "extensions": ["m4v"] },
  "video/x-matroska": { "source": "apache", "compressible": false, "extensions": ["mkv", "mk3d", "mks"] },
  "video/x-mng": { "source": "apache", "extensions": ["mng"] },
  "video/x-ms-asf": { "source": "apache", "extensions": ["asf", "asx"] },
  "video/x-ms-vob": { "source": "apache", "extensions": ["vob"] },
  "video/x-ms-wm": { "source": "apache", "extensions": ["wm"] },
  "video/x-ms-wmv": { "source": "apache", "compressible": false, "extensions": ["wmv"] },
  "video/x-ms-wmx": { "source": "apache", "extensions": ["wmx"] },
  "video/x-ms-wvx": { "source": "apache", "extensions": ["wvx"] },
  "video/x-msvideo": { "source": "apache", "extensions": ["avi"] },
  "video/x-sgi-movie": { "source": "apache", "extensions": ["movie"] },
  "video/x-smv": { "source": "apache", "extensions": ["smv"] },
  "x-conference/x-cooltalk": { "source": "apache", "extensions": ["ice"] },
  "x-shader/x-fragment": { "compressible": true },
  "x-shader/x-vertex": { "compressible": true }
};
var mimeDb;
var hasRequiredMimeDb;
function requireMimeDb() {
  if (hasRequiredMimeDb) return mimeDb;
  hasRequiredMimeDb = 1;
  mimeDb = require$$0$1;
  return mimeDb;
}
var hasRequiredMimeTypes;
function requireMimeTypes() {
  if (hasRequiredMimeTypes) return mimeTypes;
  hasRequiredMimeTypes = 1;
  (function(exports$1) {
    var db = requireMimeDb();
    var extname = require$$1$1.extname;
    var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
    var TEXT_TYPE_REGEXP = /^text\//i;
    exports$1.charset = charset;
    exports$1.charsets = { lookup: charset };
    exports$1.contentType = contentType;
    exports$1.extension = extension;
    exports$1.extensions = /* @__PURE__ */ Object.create(null);
    exports$1.lookup = lookup;
    exports$1.types = /* @__PURE__ */ Object.create(null);
    populateMaps(exports$1.extensions, exports$1.types);
    function charset(type2) {
      if (!type2 || typeof type2 !== "string") {
        return false;
      }
      var match = EXTRACT_TYPE_REGEXP.exec(type2);
      var mime = match && db[match[1].toLowerCase()];
      if (mime && mime.charset) {
        return mime.charset;
      }
      if (match && TEXT_TYPE_REGEXP.test(match[1])) {
        return "UTF-8";
      }
      return false;
    }
    function contentType(str) {
      if (!str || typeof str !== "string") {
        return false;
      }
      var mime = str.indexOf("/") === -1 ? exports$1.lookup(str) : str;
      if (!mime) {
        return false;
      }
      if (mime.indexOf("charset") === -1) {
        var charset2 = exports$1.charset(mime);
        if (charset2) mime += "; charset=" + charset2.toLowerCase();
      }
      return mime;
    }
    function extension(type2) {
      if (!type2 || typeof type2 !== "string") {
        return false;
      }
      var match = EXTRACT_TYPE_REGEXP.exec(type2);
      var exts = match && exports$1.extensions[match[1].toLowerCase()];
      if (!exts || !exts.length) {
        return false;
      }
      return exts[0];
    }
    function lookup(path) {
      if (!path || typeof path !== "string") {
        return false;
      }
      var extension2 = extname("x." + path).toLowerCase().substr(1);
      if (!extension2) {
        return false;
      }
      return exports$1.types[extension2] || false;
    }
    function populateMaps(extensions, types) {
      var preference = ["nginx", "apache", void 0, "iana"];
      Object.keys(db).forEach(function forEachMimeType(type2) {
        var mime = db[type2];
        var exts = mime.extensions;
        if (!exts || !exts.length) {
          return;
        }
        extensions[type2] = exts;
        for (var i = 0; i < exts.length; i++) {
          var extension2 = exts[i];
          if (types[extension2]) {
            var from = preference.indexOf(db[types[extension2]].source);
            var to = preference.indexOf(mime.source);
            if (types[extension2] !== "application/octet-stream" && (from > to || from === to && types[extension2].substr(0, 12) === "application/")) {
              continue;
            }
          }
          types[extension2] = type2;
        }
      });
    }
  })(mimeTypes);
  return mimeTypes;
}
var defer_1;
var hasRequiredDefer;
function requireDefer() {
  if (hasRequiredDefer) return defer_1;
  hasRequiredDefer = 1;
  defer_1 = defer;
  function defer(fn) {
    var nextTick = typeof setImmediate == "function" ? setImmediate : typeof process == "object" && typeof process.nextTick == "function" ? process.nextTick : null;
    if (nextTick) {
      nextTick(fn);
    } else {
      setTimeout(fn, 0);
    }
  }
  return defer_1;
}
var async_1;
var hasRequiredAsync;
function requireAsync() {
  if (hasRequiredAsync) return async_1;
  hasRequiredAsync = 1;
  var defer = requireDefer();
  async_1 = async;
  function async(callback) {
    var isAsync = false;
    defer(function() {
      isAsync = true;
    });
    return function async_callback(err, result) {
      if (isAsync) {
        callback(err, result);
      } else {
        defer(function nextTick_callback() {
          callback(err, result);
        });
      }
    };
  }
  return async_1;
}
var abort_1;
var hasRequiredAbort;
function requireAbort() {
  if (hasRequiredAbort) return abort_1;
  hasRequiredAbort = 1;
  abort_1 = abort;
  function abort(state) {
    Object.keys(state.jobs).forEach(clean2.bind(state));
    state.jobs = {};
  }
  function clean2(key) {
    if (typeof this.jobs[key] == "function") {
      this.jobs[key]();
    }
  }
  return abort_1;
}
var iterate_1;
var hasRequiredIterate;
function requireIterate() {
  if (hasRequiredIterate) return iterate_1;
  hasRequiredIterate = 1;
  var async = requireAsync(), abort = requireAbort();
  iterate_1 = iterate;
  function iterate(list, iterator2, state, callback) {
    var key = state["keyedList"] ? state["keyedList"][state.index] : state.index;
    state.jobs[key] = runJob(iterator2, key, list[key], function(error, output) {
      if (!(key in state.jobs)) {
        return;
      }
      delete state.jobs[key];
      if (error) {
        abort(state);
      } else {
        state.results[key] = output;
      }
      callback(error, state.results);
    });
  }
  function runJob(iterator2, key, item, callback) {
    var aborter;
    if (iterator2.length == 2) {
      aborter = iterator2(item, async(callback));
    } else {
      aborter = iterator2(item, key, async(callback));
    }
    return aborter;
  }
  return iterate_1;
}
var state_1;
var hasRequiredState;
function requireState() {
  if (hasRequiredState) return state_1;
  hasRequiredState = 1;
  state_1 = state;
  function state(list, sortMethod) {
    var isNamedList = !Array.isArray(list), initState = {
      index: 0,
      keyedList: isNamedList || sortMethod ? Object.keys(list) : null,
      jobs: {},
      results: isNamedList ? {} : [],
      size: isNamedList ? Object.keys(list).length : list.length
    };
    if (sortMethod) {
      initState.keyedList.sort(isNamedList ? sortMethod : function(a, b) {
        return sortMethod(list[a], list[b]);
      });
    }
    return initState;
  }
  return state_1;
}
var terminator_1;
var hasRequiredTerminator;
function requireTerminator() {
  if (hasRequiredTerminator) return terminator_1;
  hasRequiredTerminator = 1;
  var abort = requireAbort(), async = requireAsync();
  terminator_1 = terminator;
  function terminator(callback) {
    if (!Object.keys(this.jobs).length) {
      return;
    }
    this.index = this.size;
    abort(this);
    async(callback)(null, this.results);
  }
  return terminator_1;
}
var parallel_1;
var hasRequiredParallel;
function requireParallel() {
  if (hasRequiredParallel) return parallel_1;
  hasRequiredParallel = 1;
  var iterate = requireIterate(), initState = requireState(), terminator = requireTerminator();
  parallel_1 = parallel;
  function parallel(list, iterator2, callback) {
    var state = initState(list);
    while (state.index < (state["keyedList"] || list).length) {
      iterate(list, iterator2, state, function(error, result) {
        if (error) {
          callback(error, result);
          return;
        }
        if (Object.keys(state.jobs).length === 0) {
          callback(null, state.results);
          return;
        }
      });
      state.index++;
    }
    return terminator.bind(state, callback);
  }
  return parallel_1;
}
var serialOrdered = { exports: {} };
var hasRequiredSerialOrdered;
function requireSerialOrdered() {
  if (hasRequiredSerialOrdered) return serialOrdered.exports;
  hasRequiredSerialOrdered = 1;
  var iterate = requireIterate(), initState = requireState(), terminator = requireTerminator();
  serialOrdered.exports = serialOrdered$1;
  serialOrdered.exports.ascending = ascending;
  serialOrdered.exports.descending = descending;
  function serialOrdered$1(list, iterator2, sortMethod, callback) {
    var state = initState(list, sortMethod);
    iterate(list, iterator2, state, function iteratorHandler(error, result) {
      if (error) {
        callback(error, result);
        return;
      }
      state.index++;
      if (state.index < (state["keyedList"] || list).length) {
        iterate(list, iterator2, state, iteratorHandler);
        return;
      }
      callback(null, state.results);
    });
    return terminator.bind(state, callback);
  }
  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  }
  function descending(a, b) {
    return -1 * ascending(a, b);
  }
  return serialOrdered.exports;
}
var serial_1;
var hasRequiredSerial;
function requireSerial() {
  if (hasRequiredSerial) return serial_1;
  hasRequiredSerial = 1;
  var serialOrdered2 = requireSerialOrdered();
  serial_1 = serial;
  function serial(list, iterator2, callback) {
    return serialOrdered2(list, iterator2, null, callback);
  }
  return serial_1;
}
var asynckit;
var hasRequiredAsynckit;
function requireAsynckit() {
  if (hasRequiredAsynckit) return asynckit;
  hasRequiredAsynckit = 1;
  asynckit = {
    parallel: requireParallel(),
    serial: requireSerial(),
    serialOrdered: requireSerialOrdered()
  };
  return asynckit;
}
var esObjectAtoms;
var hasRequiredEsObjectAtoms;
function requireEsObjectAtoms() {
  if (hasRequiredEsObjectAtoms) return esObjectAtoms;
  hasRequiredEsObjectAtoms = 1;
  esObjectAtoms = Object;
  return esObjectAtoms;
}
var esErrors;
var hasRequiredEsErrors;
function requireEsErrors() {
  if (hasRequiredEsErrors) return esErrors;
  hasRequiredEsErrors = 1;
  esErrors = Error;
  return esErrors;
}
var _eval;
var hasRequired_eval;
function require_eval() {
  if (hasRequired_eval) return _eval;
  hasRequired_eval = 1;
  _eval = EvalError;
  return _eval;
}
var range;
var hasRequiredRange;
function requireRange() {
  if (hasRequiredRange) return range;
  hasRequiredRange = 1;
  range = RangeError;
  return range;
}
var ref;
var hasRequiredRef;
function requireRef() {
  if (hasRequiredRef) return ref;
  hasRequiredRef = 1;
  ref = ReferenceError;
  return ref;
}
var syntax;
var hasRequiredSyntax;
function requireSyntax() {
  if (hasRequiredSyntax) return syntax;
  hasRequiredSyntax = 1;
  syntax = SyntaxError;
  return syntax;
}
var type;
var hasRequiredType;
function requireType() {
  if (hasRequiredType) return type;
  hasRequiredType = 1;
  type = TypeError;
  return type;
}
var uri;
var hasRequiredUri;
function requireUri() {
  if (hasRequiredUri) return uri;
  hasRequiredUri = 1;
  uri = URIError;
  return uri;
}
var abs;
var hasRequiredAbs;
function requireAbs() {
  if (hasRequiredAbs) return abs;
  hasRequiredAbs = 1;
  abs = Math.abs;
  return abs;
}
var floor;
var hasRequiredFloor;
function requireFloor() {
  if (hasRequiredFloor) return floor;
  hasRequiredFloor = 1;
  floor = Math.floor;
  return floor;
}
var max;
var hasRequiredMax;
function requireMax() {
  if (hasRequiredMax) return max;
  hasRequiredMax = 1;
  max = Math.max;
  return max;
}
var min;
var hasRequiredMin;
function requireMin() {
  if (hasRequiredMin) return min;
  hasRequiredMin = 1;
  min = Math.min;
  return min;
}
var pow;
var hasRequiredPow;
function requirePow() {
  if (hasRequiredPow) return pow;
  hasRequiredPow = 1;
  pow = Math.pow;
  return pow;
}
var round;
var hasRequiredRound;
function requireRound() {
  if (hasRequiredRound) return round;
  hasRequiredRound = 1;
  round = Math.round;
  return round;
}
var _isNaN;
var hasRequired_isNaN;
function require_isNaN() {
  if (hasRequired_isNaN) return _isNaN;
  hasRequired_isNaN = 1;
  _isNaN = Number.isNaN || function isNaN2(a) {
    return a !== a;
  };
  return _isNaN;
}
var sign;
var hasRequiredSign;
function requireSign() {
  if (hasRequiredSign) return sign;
  hasRequiredSign = 1;
  var $isNaN = /* @__PURE__ */ require_isNaN();
  sign = function sign2(number) {
    if ($isNaN(number) || number === 0) {
      return number;
    }
    return number < 0 ? -1 : 1;
  };
  return sign;
}
var gOPD;
var hasRequiredGOPD;
function requireGOPD() {
  if (hasRequiredGOPD) return gOPD;
  hasRequiredGOPD = 1;
  gOPD = Object.getOwnPropertyDescriptor;
  return gOPD;
}
var gopd;
var hasRequiredGopd;
function requireGopd() {
  if (hasRequiredGopd) return gopd;
  hasRequiredGopd = 1;
  var $gOPD = /* @__PURE__ */ requireGOPD();
  if ($gOPD) {
    try {
      $gOPD([], "length");
    } catch (e) {
      $gOPD = null;
    }
  }
  gopd = $gOPD;
  return gopd;
}
var esDefineProperty;
var hasRequiredEsDefineProperty;
function requireEsDefineProperty() {
  if (hasRequiredEsDefineProperty) return esDefineProperty;
  hasRequiredEsDefineProperty = 1;
  var $defineProperty = Object.defineProperty || false;
  if ($defineProperty) {
    try {
      $defineProperty({}, "a", { value: 1 });
    } catch (e) {
      $defineProperty = false;
    }
  }
  esDefineProperty = $defineProperty;
  return esDefineProperty;
}
var shams$1;
var hasRequiredShams$1;
function requireShams$1() {
  if (hasRequiredShams$1) return shams$1;
  hasRequiredShams$1 = 1;
  shams$1 = function hasSymbols2() {
    if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
      return false;
    }
    if (typeof Symbol.iterator === "symbol") {
      return true;
    }
    var obj = {};
    var sym = /* @__PURE__ */ Symbol("test");
    var symObj = Object(sym);
    if (typeof sym === "string") {
      return false;
    }
    if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
      return false;
    }
    if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
      return false;
    }
    var symVal = 42;
    obj[sym] = symVal;
    for (var _ in obj) {
      return false;
    }
    if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
      return false;
    }
    if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
      return false;
    }
    var syms = Object.getOwnPropertySymbols(obj);
    if (syms.length !== 1 || syms[0] !== sym) {
      return false;
    }
    if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
      return false;
    }
    if (typeof Object.getOwnPropertyDescriptor === "function") {
      var descriptor = (
        /** @type {PropertyDescriptor} */
        Object.getOwnPropertyDescriptor(obj, sym)
      );
      if (descriptor.value !== symVal || descriptor.enumerable !== true) {
        return false;
      }
    }
    return true;
  };
  return shams$1;
}
var hasSymbols;
var hasRequiredHasSymbols;
function requireHasSymbols() {
  if (hasRequiredHasSymbols) return hasSymbols;
  hasRequiredHasSymbols = 1;
  var origSymbol = typeof Symbol !== "undefined" && Symbol;
  var hasSymbolSham = requireShams$1();
  hasSymbols = function hasNativeSymbols() {
    if (typeof origSymbol !== "function") {
      return false;
    }
    if (typeof Symbol !== "function") {
      return false;
    }
    if (typeof origSymbol("foo") !== "symbol") {
      return false;
    }
    if (typeof /* @__PURE__ */ Symbol("bar") !== "symbol") {
      return false;
    }
    return hasSymbolSham();
  };
  return hasSymbols;
}
var Reflect_getPrototypeOf;
var hasRequiredReflect_getPrototypeOf;
function requireReflect_getPrototypeOf() {
  if (hasRequiredReflect_getPrototypeOf) return Reflect_getPrototypeOf;
  hasRequiredReflect_getPrototypeOf = 1;
  Reflect_getPrototypeOf = typeof Reflect !== "undefined" && Reflect.getPrototypeOf || null;
  return Reflect_getPrototypeOf;
}
var Object_getPrototypeOf;
var hasRequiredObject_getPrototypeOf;
function requireObject_getPrototypeOf() {
  if (hasRequiredObject_getPrototypeOf) return Object_getPrototypeOf;
  hasRequiredObject_getPrototypeOf = 1;
  var $Object = /* @__PURE__ */ requireEsObjectAtoms();
  Object_getPrototypeOf = $Object.getPrototypeOf || null;
  return Object_getPrototypeOf;
}
var implementation;
var hasRequiredImplementation;
function requireImplementation() {
  if (hasRequiredImplementation) return implementation;
  hasRequiredImplementation = 1;
  var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
  var toStr = Object.prototype.toString;
  var max2 = Math.max;
  var funcType = "[object Function]";
  var concatty = function concatty2(a, b) {
    var arr = [];
    for (var i = 0; i < a.length; i += 1) {
      arr[i] = a[i];
    }
    for (var j = 0; j < b.length; j += 1) {
      arr[j + a.length] = b[j];
    }
    return arr;
  };
  var slicy = function slicy2(arrLike, offset) {
    var arr = [];
    for (var i = offset, j = 0; i < arrLike.length; i += 1, j += 1) {
      arr[j] = arrLike[i];
    }
    return arr;
  };
  var joiny = function(arr, joiner) {
    var str = "";
    for (var i = 0; i < arr.length; i += 1) {
      str += arr[i];
      if (i + 1 < arr.length) {
        str += joiner;
      }
    }
    return str;
  };
  implementation = function bind2(that) {
    var target = this;
    if (typeof target !== "function" || toStr.apply(target) !== funcType) {
      throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slicy(arguments, 1);
    var bound;
    var binder = function() {
      if (this instanceof bound) {
        var result = target.apply(
          this,
          concatty(args, arguments)
        );
        if (Object(result) === result) {
          return result;
        }
        return this;
      }
      return target.apply(
        that,
        concatty(args, arguments)
      );
    };
    var boundLength = max2(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
      boundArgs[i] = "$" + i;
    }
    bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
    if (target.prototype) {
      var Empty = function Empty2() {
      };
      Empty.prototype = target.prototype;
      bound.prototype = new Empty();
      Empty.prototype = null;
    }
    return bound;
  };
  return implementation;
}
var functionBind;
var hasRequiredFunctionBind;
function requireFunctionBind() {
  if (hasRequiredFunctionBind) return functionBind;
  hasRequiredFunctionBind = 1;
  var implementation2 = requireImplementation();
  functionBind = Function.prototype.bind || implementation2;
  return functionBind;
}
var functionCall;
var hasRequiredFunctionCall;
function requireFunctionCall() {
  if (hasRequiredFunctionCall) return functionCall;
  hasRequiredFunctionCall = 1;
  functionCall = Function.prototype.call;
  return functionCall;
}
var functionApply;
var hasRequiredFunctionApply;
function requireFunctionApply() {
  if (hasRequiredFunctionApply) return functionApply;
  hasRequiredFunctionApply = 1;
  functionApply = Function.prototype.apply;
  return functionApply;
}
var reflectApply;
var hasRequiredReflectApply;
function requireReflectApply() {
  if (hasRequiredReflectApply) return reflectApply;
  hasRequiredReflectApply = 1;
  reflectApply = typeof Reflect !== "undefined" && Reflect && Reflect.apply;
  return reflectApply;
}
var actualApply;
var hasRequiredActualApply;
function requireActualApply() {
  if (hasRequiredActualApply) return actualApply;
  hasRequiredActualApply = 1;
  var bind2 = requireFunctionBind();
  var $apply = requireFunctionApply();
  var $call = requireFunctionCall();
  var $reflectApply = requireReflectApply();
  actualApply = $reflectApply || bind2.call($call, $apply);
  return actualApply;
}
var callBindApplyHelpers;
var hasRequiredCallBindApplyHelpers;
function requireCallBindApplyHelpers() {
  if (hasRequiredCallBindApplyHelpers) return callBindApplyHelpers;
  hasRequiredCallBindApplyHelpers = 1;
  var bind2 = requireFunctionBind();
  var $TypeError = /* @__PURE__ */ requireType();
  var $call = requireFunctionCall();
  var $actualApply = requireActualApply();
  callBindApplyHelpers = function callBindBasic(args) {
    if (args.length < 1 || typeof args[0] !== "function") {
      throw new $TypeError("a function is required");
    }
    return $actualApply(bind2, $call, args);
  };
  return callBindApplyHelpers;
}
var get;
var hasRequiredGet;
function requireGet() {
  if (hasRequiredGet) return get;
  hasRequiredGet = 1;
  var callBind = requireCallBindApplyHelpers();
  var gOPD2 = /* @__PURE__ */ requireGopd();
  var hasProtoAccessor;
  try {
    hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */
    [].__proto__ === Array.prototype;
  } catch (e) {
    if (!e || typeof e !== "object" || !("code" in e) || e.code !== "ERR_PROTO_ACCESS") {
      throw e;
    }
  }
  var desc = !!hasProtoAccessor && gOPD2 && gOPD2(
    Object.prototype,
    /** @type {keyof typeof Object.prototype} */
    "__proto__"
  );
  var $Object = Object;
  var $getPrototypeOf = $Object.getPrototypeOf;
  get = desc && typeof desc.get === "function" ? callBind([desc.get]) : typeof $getPrototypeOf === "function" ? (
    /** @type {import('./get')} */
    function getDunder(value) {
      return $getPrototypeOf(value == null ? value : $Object(value));
    }
  ) : false;
  return get;
}
var getProto;
var hasRequiredGetProto;
function requireGetProto() {
  if (hasRequiredGetProto) return getProto;
  hasRequiredGetProto = 1;
  var reflectGetProto = requireReflect_getPrototypeOf();
  var originalGetProto = requireObject_getPrototypeOf();
  var getDunderProto = /* @__PURE__ */ requireGet();
  getProto = reflectGetProto ? function getProto2(O) {
    return reflectGetProto(O);
  } : originalGetProto ? function getProto2(O) {
    if (!O || typeof O !== "object" && typeof O !== "function") {
      throw new TypeError("getProto: not an object");
    }
    return originalGetProto(O);
  } : getDunderProto ? function getProto2(O) {
    return getDunderProto(O);
  } : null;
  return getProto;
}
var hasown;
var hasRequiredHasown;
function requireHasown() {
  if (hasRequiredHasown) return hasown;
  hasRequiredHasown = 1;
  var call = Function.prototype.call;
  var $hasOwn = Object.prototype.hasOwnProperty;
  var bind2 = requireFunctionBind();
  hasown = bind2.call(call, $hasOwn);
  return hasown;
}
var getIntrinsic;
var hasRequiredGetIntrinsic;
function requireGetIntrinsic() {
  if (hasRequiredGetIntrinsic) return getIntrinsic;
  hasRequiredGetIntrinsic = 1;
  var undefined$1;
  var $Object = /* @__PURE__ */ requireEsObjectAtoms();
  var $Error = /* @__PURE__ */ requireEsErrors();
  var $EvalError = /* @__PURE__ */ require_eval();
  var $RangeError = /* @__PURE__ */ requireRange();
  var $ReferenceError = /* @__PURE__ */ requireRef();
  var $SyntaxError = /* @__PURE__ */ requireSyntax();
  var $TypeError = /* @__PURE__ */ requireType();
  var $URIError = /* @__PURE__ */ requireUri();
  var abs2 = /* @__PURE__ */ requireAbs();
  var floor2 = /* @__PURE__ */ requireFloor();
  var max2 = /* @__PURE__ */ requireMax();
  var min2 = /* @__PURE__ */ requireMin();
  var pow2 = /* @__PURE__ */ requirePow();
  var round2 = /* @__PURE__ */ requireRound();
  var sign2 = /* @__PURE__ */ requireSign();
  var $Function = Function;
  var getEvalledConstructor = function(expressionSyntax) {
    try {
      return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
    } catch (e) {
    }
  };
  var $gOPD = /* @__PURE__ */ requireGopd();
  var $defineProperty = /* @__PURE__ */ requireEsDefineProperty();
  var throwTypeError = function() {
    throw new $TypeError();
  };
  var ThrowTypeError = $gOPD ? (function() {
    try {
      arguments.callee;
      return throwTypeError;
    } catch (calleeThrows) {
      try {
        return $gOPD(arguments, "callee").get;
      } catch (gOPDthrows) {
        return throwTypeError;
      }
    }
  })() : throwTypeError;
  var hasSymbols2 = requireHasSymbols()();
  var getProto2 = requireGetProto();
  var $ObjectGPO = requireObject_getPrototypeOf();
  var $ReflectGPO = requireReflect_getPrototypeOf();
  var $apply = requireFunctionApply();
  var $call = requireFunctionCall();
  var needsEval = {};
  var TypedArray = typeof Uint8Array === "undefined" || !getProto2 ? undefined$1 : getProto2(Uint8Array);
  var INTRINSICS = {
    __proto__: null,
    "%AggregateError%": typeof AggregateError === "undefined" ? undefined$1 : AggregateError,
    "%Array%": Array,
    "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined$1 : ArrayBuffer,
    "%ArrayIteratorPrototype%": hasSymbols2 && getProto2 ? getProto2([][Symbol.iterator]()) : undefined$1,
    "%AsyncFromSyncIteratorPrototype%": undefined$1,
    "%AsyncFunction%": needsEval,
    "%AsyncGenerator%": needsEval,
    "%AsyncGeneratorFunction%": needsEval,
    "%AsyncIteratorPrototype%": needsEval,
    "%Atomics%": typeof Atomics === "undefined" ? undefined$1 : Atomics,
    "%BigInt%": typeof BigInt === "undefined" ? undefined$1 : BigInt,
    "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined$1 : BigInt64Array,
    "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined$1 : BigUint64Array,
    "%Boolean%": Boolean,
    "%DataView%": typeof DataView === "undefined" ? undefined$1 : DataView,
    "%Date%": Date,
    "%decodeURI%": decodeURI,
    "%decodeURIComponent%": decodeURIComponent,
    "%encodeURI%": encodeURI,
    "%encodeURIComponent%": encodeURIComponent,
    "%Error%": $Error,
    "%eval%": eval,
    // eslint-disable-line no-eval
    "%EvalError%": $EvalError,
    "%Float16Array%": typeof Float16Array === "undefined" ? undefined$1 : Float16Array,
    "%Float32Array%": typeof Float32Array === "undefined" ? undefined$1 : Float32Array,
    "%Float64Array%": typeof Float64Array === "undefined" ? undefined$1 : Float64Array,
    "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined$1 : FinalizationRegistry,
    "%Function%": $Function,
    "%GeneratorFunction%": needsEval,
    "%Int8Array%": typeof Int8Array === "undefined" ? undefined$1 : Int8Array,
    "%Int16Array%": typeof Int16Array === "undefined" ? undefined$1 : Int16Array,
    "%Int32Array%": typeof Int32Array === "undefined" ? undefined$1 : Int32Array,
    "%isFinite%": isFinite,
    "%isNaN%": isNaN,
    "%IteratorPrototype%": hasSymbols2 && getProto2 ? getProto2(getProto2([][Symbol.iterator]())) : undefined$1,
    "%JSON%": typeof JSON === "object" ? JSON : undefined$1,
    "%Map%": typeof Map === "undefined" ? undefined$1 : Map,
    "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols2 || !getProto2 ? undefined$1 : getProto2((/* @__PURE__ */ new Map())[Symbol.iterator]()),
    "%Math%": Math,
    "%Number%": Number,
    "%Object%": $Object,
    "%Object.getOwnPropertyDescriptor%": $gOPD,
    "%parseFloat%": parseFloat,
    "%parseInt%": parseInt,
    "%Promise%": typeof Promise === "undefined" ? undefined$1 : Promise,
    "%Proxy%": typeof Proxy === "undefined" ? undefined$1 : Proxy,
    "%RangeError%": $RangeError,
    "%ReferenceError%": $ReferenceError,
    "%Reflect%": typeof Reflect === "undefined" ? undefined$1 : Reflect,
    "%RegExp%": RegExp,
    "%Set%": typeof Set === "undefined" ? undefined$1 : Set,
    "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols2 || !getProto2 ? undefined$1 : getProto2((/* @__PURE__ */ new Set())[Symbol.iterator]()),
    "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined$1 : SharedArrayBuffer,
    "%String%": String,
    "%StringIteratorPrototype%": hasSymbols2 && getProto2 ? getProto2(""[Symbol.iterator]()) : undefined$1,
    "%Symbol%": hasSymbols2 ? Symbol : undefined$1,
    "%SyntaxError%": $SyntaxError,
    "%ThrowTypeError%": ThrowTypeError,
    "%TypedArray%": TypedArray,
    "%TypeError%": $TypeError,
    "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined$1 : Uint8Array,
    "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined$1 : Uint8ClampedArray,
    "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined$1 : Uint16Array,
    "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined$1 : Uint32Array,
    "%URIError%": $URIError,
    "%WeakMap%": typeof WeakMap === "undefined" ? undefined$1 : WeakMap,
    "%WeakRef%": typeof WeakRef === "undefined" ? undefined$1 : WeakRef,
    "%WeakSet%": typeof WeakSet === "undefined" ? undefined$1 : WeakSet,
    "%Function.prototype.call%": $call,
    "%Function.prototype.apply%": $apply,
    "%Object.defineProperty%": $defineProperty,
    "%Object.getPrototypeOf%": $ObjectGPO,
    "%Math.abs%": abs2,
    "%Math.floor%": floor2,
    "%Math.max%": max2,
    "%Math.min%": min2,
    "%Math.pow%": pow2,
    "%Math.round%": round2,
    "%Math.sign%": sign2,
    "%Reflect.getPrototypeOf%": $ReflectGPO
  };
  if (getProto2) {
    try {
      null.error;
    } catch (e) {
      var errorProto = getProto2(getProto2(e));
      INTRINSICS["%Error.prototype%"] = errorProto;
    }
  }
  var doEval = function doEval2(name) {
    var value;
    if (name === "%AsyncFunction%") {
      value = getEvalledConstructor("async function () {}");
    } else if (name === "%GeneratorFunction%") {
      value = getEvalledConstructor("function* () {}");
    } else if (name === "%AsyncGeneratorFunction%") {
      value = getEvalledConstructor("async function* () {}");
    } else if (name === "%AsyncGenerator%") {
      var fn = doEval2("%AsyncGeneratorFunction%");
      if (fn) {
        value = fn.prototype;
      }
    } else if (name === "%AsyncIteratorPrototype%") {
      var gen = doEval2("%AsyncGenerator%");
      if (gen && getProto2) {
        value = getProto2(gen.prototype);
      }
    }
    INTRINSICS[name] = value;
    return value;
  };
  var LEGACY_ALIASES = {
    __proto__: null,
    "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
    "%ArrayPrototype%": ["Array", "prototype"],
    "%ArrayProto_entries%": ["Array", "prototype", "entries"],
    "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
    "%ArrayProto_keys%": ["Array", "prototype", "keys"],
    "%ArrayProto_values%": ["Array", "prototype", "values"],
    "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
    "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
    "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
    "%BooleanPrototype%": ["Boolean", "prototype"],
    "%DataViewPrototype%": ["DataView", "prototype"],
    "%DatePrototype%": ["Date", "prototype"],
    "%ErrorPrototype%": ["Error", "prototype"],
    "%EvalErrorPrototype%": ["EvalError", "prototype"],
    "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
    "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
    "%FunctionPrototype%": ["Function", "prototype"],
    "%Generator%": ["GeneratorFunction", "prototype"],
    "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
    "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
    "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
    "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
    "%JSONParse%": ["JSON", "parse"],
    "%JSONStringify%": ["JSON", "stringify"],
    "%MapPrototype%": ["Map", "prototype"],
    "%NumberPrototype%": ["Number", "prototype"],
    "%ObjectPrototype%": ["Object", "prototype"],
    "%ObjProto_toString%": ["Object", "prototype", "toString"],
    "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
    "%PromisePrototype%": ["Promise", "prototype"],
    "%PromiseProto_then%": ["Promise", "prototype", "then"],
    "%Promise_all%": ["Promise", "all"],
    "%Promise_reject%": ["Promise", "reject"],
    "%Promise_resolve%": ["Promise", "resolve"],
    "%RangeErrorPrototype%": ["RangeError", "prototype"],
    "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
    "%RegExpPrototype%": ["RegExp", "prototype"],
    "%SetPrototype%": ["Set", "prototype"],
    "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
    "%StringPrototype%": ["String", "prototype"],
    "%SymbolPrototype%": ["Symbol", "prototype"],
    "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
    "%TypedArrayPrototype%": ["TypedArray", "prototype"],
    "%TypeErrorPrototype%": ["TypeError", "prototype"],
    "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
    "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
    "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
    "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
    "%URIErrorPrototype%": ["URIError", "prototype"],
    "%WeakMapPrototype%": ["WeakMap", "prototype"],
    "%WeakSetPrototype%": ["WeakSet", "prototype"]
  };
  var bind2 = requireFunctionBind();
  var hasOwn = /* @__PURE__ */ requireHasown();
  var $concat = bind2.call($call, Array.prototype.concat);
  var $spliceApply = bind2.call($apply, Array.prototype.splice);
  var $replace = bind2.call($call, String.prototype.replace);
  var $strSlice = bind2.call($call, String.prototype.slice);
  var $exec = bind2.call($call, RegExp.prototype.exec);
  var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
  var reEscapeChar = /\\(\\)?/g;
  var stringToPath = function stringToPath2(string) {
    var first = $strSlice(string, 0, 1);
    var last = $strSlice(string, -1);
    if (first === "%" && last !== "%") {
      throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
    } else if (last === "%" && first !== "%") {
      throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
    }
    var result = [];
    $replace(string, rePropName, function(match, number, quote, subString) {
      result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match;
    });
    return result;
  };
  var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
    var intrinsicName = name;
    var alias;
    if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
      alias = LEGACY_ALIASES[intrinsicName];
      intrinsicName = "%" + alias[0] + "%";
    }
    if (hasOwn(INTRINSICS, intrinsicName)) {
      var value = INTRINSICS[intrinsicName];
      if (value === needsEval) {
        value = doEval(intrinsicName);
      }
      if (typeof value === "undefined" && !allowMissing) {
        throw new $TypeError("intrinsic " + name + " exists, but is not available. Please file an issue!");
      }
      return {
        alias,
        name: intrinsicName,
        value
      };
    }
    throw new $SyntaxError("intrinsic " + name + " does not exist!");
  };
  getIntrinsic = function GetIntrinsic(name, allowMissing) {
    if (typeof name !== "string" || name.length === 0) {
      throw new $TypeError("intrinsic name must be a non-empty string");
    }
    if (arguments.length > 1 && typeof allowMissing !== "boolean") {
      throw new $TypeError('"allowMissing" argument must be a boolean');
    }
    if ($exec(/^%?[^%]*%?$/, name) === null) {
      throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
    }
    var parts = stringToPath(name);
    var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
    var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
    var intrinsicRealName = intrinsic.name;
    var value = intrinsic.value;
    var skipFurtherCaching = false;
    var alias = intrinsic.alias;
    if (alias) {
      intrinsicBaseName = alias[0];
      $spliceApply(parts, $concat([0, 1], alias));
    }
    for (var i = 1, isOwn = true; i < parts.length; i += 1) {
      var part = parts[i];
      var first = $strSlice(part, 0, 1);
      var last = $strSlice(part, -1);
      if ((first === '"' || first === "'" || first === "`" || (last === '"' || last === "'" || last === "`")) && first !== last) {
        throw new $SyntaxError("property names with quotes must have matching quotes");
      }
      if (part === "constructor" || !isOwn) {
        skipFurtherCaching = true;
      }
      intrinsicBaseName += "." + part;
      intrinsicRealName = "%" + intrinsicBaseName + "%";
      if (hasOwn(INTRINSICS, intrinsicRealName)) {
        value = INTRINSICS[intrinsicRealName];
      } else if (value != null) {
        if (!(part in value)) {
          if (!allowMissing) {
            throw new $TypeError("base intrinsic for " + name + " exists, but the property is not available.");
          }
          return void undefined$1;
        }
        if ($gOPD && i + 1 >= parts.length) {
          var desc = $gOPD(value, part);
          isOwn = !!desc;
          if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
            value = desc.get;
          } else {
            value = value[part];
          }
        } else {
          isOwn = hasOwn(value, part);
          value = value[part];
        }
        if (isOwn && !skipFurtherCaching) {
          INTRINSICS[intrinsicRealName] = value;
        }
      }
    }
    return value;
  };
  return getIntrinsic;
}
var shams;
var hasRequiredShams;
function requireShams() {
  if (hasRequiredShams) return shams;
  hasRequiredShams = 1;
  var hasSymbols2 = requireShams$1();
  shams = function hasToStringTagShams() {
    return hasSymbols2() && !!Symbol.toStringTag;
  };
  return shams;
}
var esSetTostringtag;
var hasRequiredEsSetTostringtag;
function requireEsSetTostringtag() {
  if (hasRequiredEsSetTostringtag) return esSetTostringtag;
  hasRequiredEsSetTostringtag = 1;
  var GetIntrinsic = /* @__PURE__ */ requireGetIntrinsic();
  var $defineProperty = GetIntrinsic("%Object.defineProperty%", true);
  var hasToStringTag = requireShams()();
  var hasOwn = /* @__PURE__ */ requireHasown();
  var $TypeError = /* @__PURE__ */ requireType();
  var toStringTag2 = hasToStringTag ? Symbol.toStringTag : null;
  esSetTostringtag = function setToStringTag(object, value) {
    var overrideIfSet = arguments.length > 2 && !!arguments[2] && arguments[2].force;
    var nonConfigurable = arguments.length > 2 && !!arguments[2] && arguments[2].nonConfigurable;
    if (typeof overrideIfSet !== "undefined" && typeof overrideIfSet !== "boolean" || typeof nonConfigurable !== "undefined" && typeof nonConfigurable !== "boolean") {
      throw new $TypeError("if provided, the `overrideIfSet` and `nonConfigurable` options must be booleans");
    }
    if (toStringTag2 && (overrideIfSet || !hasOwn(object, toStringTag2))) {
      if ($defineProperty) {
        $defineProperty(object, toStringTag2, {
          configurable: !nonConfigurable,
          enumerable: false,
          value,
          writable: false
        });
      } else {
        object[toStringTag2] = value;
      }
    }
  };
  return esSetTostringtag;
}
var populate;
var hasRequiredPopulate;
function requirePopulate() {
  if (hasRequiredPopulate) return populate;
  hasRequiredPopulate = 1;
  populate = function(dst, src2) {
    Object.keys(src2).forEach(function(prop) {
      dst[prop] = dst[prop] || src2[prop];
    });
    return dst;
  };
  return populate;
}
var form_data;
var hasRequiredForm_data;
function requireForm_data() {
  if (hasRequiredForm_data) return form_data;
  hasRequiredForm_data = 1;
  var CombinedStream = requireCombined_stream();
  var util = require$$1;
  var path = require$$1$1;
  var http2 = require$$3;
  var https = require$$4;
  var parseUrl = require$$0$2.parse;
  var fs = require$$6;
  var Stream = stream.Stream;
  var crypto2 = require$$8;
  var mime = requireMimeTypes();
  var asynckit2 = requireAsynckit();
  var setToStringTag = /* @__PURE__ */ requireEsSetTostringtag();
  var hasOwn = /* @__PURE__ */ requireHasown();
  var populate2 = requirePopulate();
  function FormData2(options) {
    if (!(this instanceof FormData2)) {
      return new FormData2(options);
    }
    this._overheadLength = 0;
    this._valueLength = 0;
    this._valuesToMeasure = [];
    CombinedStream.call(this);
    options = options || {};
    for (var option in options) {
      this[option] = options[option];
    }
  }
  util.inherits(FormData2, CombinedStream);
  FormData2.LINE_BREAK = "\r\n";
  FormData2.DEFAULT_CONTENT_TYPE = "application/octet-stream";
  FormData2.prototype.append = function(field, value, options) {
    options = options || {};
    if (typeof options === "string") {
      options = { filename: options };
    }
    var append2 = CombinedStream.prototype.append.bind(this);
    if (typeof value === "number" || value == null) {
      value = String(value);
    }
    if (Array.isArray(value)) {
      this._error(new Error("Arrays are not supported."));
      return;
    }
    var header = this._multiPartHeader(field, value, options);
    var footer = this._multiPartFooter();
    append2(header);
    append2(value);
    append2(footer);
    this._trackLength(header, value, options);
  };
  FormData2.prototype._trackLength = function(header, value, options) {
    var valueLength = 0;
    if (options.knownLength != null) {
      valueLength += Number(options.knownLength);
    } else if (Buffer.isBuffer(value)) {
      valueLength = value.length;
    } else if (typeof value === "string") {
      valueLength = Buffer.byteLength(value);
    }
    this._valueLength += valueLength;
    this._overheadLength += Buffer.byteLength(header) + FormData2.LINE_BREAK.length;
    if (!value || !value.path && !(value.readable && hasOwn(value, "httpVersion")) && !(value instanceof Stream)) {
      return;
    }
    if (!options.knownLength) {
      this._valuesToMeasure.push(value);
    }
  };
  FormData2.prototype._lengthRetriever = function(value, callback) {
    if (hasOwn(value, "fd")) {
      if (value.end != void 0 && value.end != Infinity && value.start != void 0) {
        callback(null, value.end + 1 - (value.start ? value.start : 0));
      } else {
        fs.stat(value.path, function(err, stat) {
          if (err) {
            callback(err);
            return;
          }
          var fileSize = stat.size - (value.start ? value.start : 0);
          callback(null, fileSize);
        });
      }
    } else if (hasOwn(value, "httpVersion")) {
      callback(null, Number(value.headers["content-length"]));
    } else if (hasOwn(value, "httpModule")) {
      value.on("response", function(response) {
        value.pause();
        callback(null, Number(response.headers["content-length"]));
      });
      value.resume();
    } else {
      callback("Unknown stream");
    }
  };
  FormData2.prototype._multiPartHeader = function(field, value, options) {
    if (typeof options.header === "string") {
      return options.header;
    }
    var contentDisposition = this._getContentDisposition(value, options);
    var contentType = this._getContentType(value, options);
    var contents = "";
    var headers = {
      // add custom disposition as third element or keep it two elements if not
      "Content-Disposition": ["form-data", 'name="' + field + '"'].concat(contentDisposition || []),
      // if no content type. allow it to be empty array
      "Content-Type": [].concat(contentType || [])
    };
    if (typeof options.header === "object") {
      populate2(headers, options.header);
    }
    var header;
    for (var prop in headers) {
      if (hasOwn(headers, prop)) {
        header = headers[prop];
        if (header == null) {
          continue;
        }
        if (!Array.isArray(header)) {
          header = [header];
        }
        if (header.length) {
          contents += prop + ": " + header.join("; ") + FormData2.LINE_BREAK;
        }
      }
    }
    return "--" + this.getBoundary() + FormData2.LINE_BREAK + contents + FormData2.LINE_BREAK;
  };
  FormData2.prototype._getContentDisposition = function(value, options) {
    var filename;
    if (typeof options.filepath === "string") {
      filename = path.normalize(options.filepath).replace(/\\/g, "/");
    } else if (options.filename || value && (value.name || value.path)) {
      filename = path.basename(options.filename || value && (value.name || value.path));
    } else if (value && value.readable && hasOwn(value, "httpVersion")) {
      filename = path.basename(value.client._httpMessage.path || "");
    }
    if (filename) {
      return 'filename="' + filename + '"';
    }
  };
  FormData2.prototype._getContentType = function(value, options) {
    var contentType = options.contentType;
    if (!contentType && value && value.name) {
      contentType = mime.lookup(value.name);
    }
    if (!contentType && value && value.path) {
      contentType = mime.lookup(value.path);
    }
    if (!contentType && value && value.readable && hasOwn(value, "httpVersion")) {
      contentType = value.headers["content-type"];
    }
    if (!contentType && (options.filepath || options.filename)) {
      contentType = mime.lookup(options.filepath || options.filename);
    }
    if (!contentType && value && typeof value === "object") {
      contentType = FormData2.DEFAULT_CONTENT_TYPE;
    }
    return contentType;
  };
  FormData2.prototype._multiPartFooter = function() {
    return function(next) {
      var footer = FormData2.LINE_BREAK;
      var lastPart = this._streams.length === 0;
      if (lastPart) {
        footer += this._lastBoundary();
      }
      next(footer);
    }.bind(this);
  };
  FormData2.prototype._lastBoundary = function() {
    return "--" + this.getBoundary() + "--" + FormData2.LINE_BREAK;
  };
  FormData2.prototype.getHeaders = function(userHeaders) {
    var header;
    var formHeaders = {
      "content-type": "multipart/form-data; boundary=" + this.getBoundary()
    };
    for (header in userHeaders) {
      if (hasOwn(userHeaders, header)) {
        formHeaders[header.toLowerCase()] = userHeaders[header];
      }
    }
    return formHeaders;
  };
  FormData2.prototype.setBoundary = function(boundary) {
    if (typeof boundary !== "string") {
      throw new TypeError("FormData boundary must be a string");
    }
    this._boundary = boundary;
  };
  FormData2.prototype.getBoundary = function() {
    if (!this._boundary) {
      this._generateBoundary();
    }
    return this._boundary;
  };
  FormData2.prototype.getBuffer = function() {
    var dataBuffer = new Buffer.alloc(0);
    var boundary = this.getBoundary();
    for (var i = 0, len = this._streams.length; i < len; i++) {
      if (typeof this._streams[i] !== "function") {
        if (Buffer.isBuffer(this._streams[i])) {
          dataBuffer = Buffer.concat([dataBuffer, this._streams[i]]);
        } else {
          dataBuffer = Buffer.concat([dataBuffer, Buffer.from(this._streams[i])]);
        }
        if (typeof this._streams[i] !== "string" || this._streams[i].substring(2, boundary.length + 2) !== boundary) {
          dataBuffer = Buffer.concat([dataBuffer, Buffer.from(FormData2.LINE_BREAK)]);
        }
      }
    }
    return Buffer.concat([dataBuffer, Buffer.from(this._lastBoundary())]);
  };
  FormData2.prototype._generateBoundary = function() {
    this._boundary = "--------------------------" + crypto2.randomBytes(12).toString("hex");
  };
  FormData2.prototype.getLengthSync = function() {
    var knownLength = this._overheadLength + this._valueLength;
    if (this._streams.length) {
      knownLength += this._lastBoundary().length;
    }
    if (!this.hasKnownLength()) {
      this._error(new Error("Cannot calculate proper length in synchronous way."));
    }
    return knownLength;
  };
  FormData2.prototype.hasKnownLength = function() {
    var hasKnownLength = true;
    if (this._valuesToMeasure.length) {
      hasKnownLength = false;
    }
    return hasKnownLength;
  };
  FormData2.prototype.getLength = function(cb) {
    var knownLength = this._overheadLength + this._valueLength;
    if (this._streams.length) {
      knownLength += this._lastBoundary().length;
    }
    if (!this._valuesToMeasure.length) {
      process.nextTick(cb.bind(this, null, knownLength));
      return;
    }
    asynckit2.parallel(this._valuesToMeasure, this._lengthRetriever, function(err, values) {
      if (err) {
        cb(err);
        return;
      }
      values.forEach(function(length) {
        knownLength += length;
      });
      cb(null, knownLength);
    });
  };
  FormData2.prototype.submit = function(params, cb) {
    var request;
    var options;
    var defaults2 = { method: "post" };
    if (typeof params === "string") {
      params = parseUrl(params);
      options = populate2({
        port: params.port,
        path: params.pathname,
        host: params.hostname,
        protocol: params.protocol
      }, defaults2);
    } else {
      options = populate2(params, defaults2);
      if (!options.port) {
        options.port = options.protocol === "https:" ? 443 : 80;
      }
    }
    options.headers = this.getHeaders(params.headers);
    if (options.protocol === "https:") {
      request = https.request(options);
    } else {
      request = http2.request(options);
    }
    this.getLength(function(err, length) {
      if (err && err !== "Unknown stream") {
        this._error(err);
        return;
      }
      if (length) {
        request.setHeader("Content-Length", length);
      }
      this.pipe(request);
      if (cb) {
        var onResponse;
        var callback = function(error, responce) {
          request.removeListener("error", callback);
          request.removeListener("response", onResponse);
          return cb.call(this, error, responce);
        };
        onResponse = callback.bind(this, null);
        request.on("error", callback);
        request.on("response", onResponse);
      }
    }.bind(this));
    return request;
  };
  FormData2.prototype._error = function(err) {
    if (!this.error) {
      this.error = err;
      this.pause();
      this.emit("error", err);
    }
  };
  FormData2.prototype.toString = function() {
    return "[object FormData]";
  };
  setToStringTag(FormData2.prototype, "FormData");
  form_data = FormData2;
  return form_data;
}
var form_dataExports = requireForm_data();
const FormData$1 = /* @__PURE__ */ getDefaultExportFromCjs(form_dataExports);
function isVisitable(thing) {
  return utils$1.isPlainObject(thing) || utils$1.isArray(thing);
}
function removeBrackets(key) {
  return utils$1.endsWith(key, "[]") ? key.slice(0, -2) : key;
}
function renderKey(path, key, dots) {
  if (!path) return key;
  return path.concat(key).map(function each(token, i) {
    token = removeBrackets(token);
    return !dots && i ? "[" + token + "]" : token;
  }).join(dots ? "." : "");
}
function isFlatArray(arr) {
  return utils$1.isArray(arr) && !arr.some(isVisitable);
}
const predicates = utils$1.toFlatObject(utils$1, {}, null, function filter(prop) {
  return /^is[A-Z]/.test(prop);
});
function toFormData$1(obj, formData, options) {
  if (!utils$1.isObject(obj)) {
    throw new TypeError("target must be an object");
  }
  formData = formData || new (FormData$1 || FormData)();
  options = utils$1.toFlatObject(options, {
    metaTokens: true,
    dots: false,
    indexes: false
  }, false, function defined(option, source) {
    return !utils$1.isUndefined(source[option]);
  });
  const metaTokens = options.metaTokens;
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
  const useBlob = _Blob && utils$1.isSpecCompliantForm(formData);
  if (!utils$1.isFunction(visitor)) {
    throw new TypeError("visitor must be a function");
  }
  function convertValue(value) {
    if (value === null) return "";
    if (utils$1.isDate(value)) {
      return value.toISOString();
    }
    if (utils$1.isBoolean(value)) {
      return value.toString();
    }
    if (!useBlob && utils$1.isBlob(value)) {
      throw new AxiosError$1("Blob is not supported. Use a Buffer instead.");
    }
    if (utils$1.isArrayBuffer(value) || utils$1.isTypedArray(value)) {
      return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
    }
    return value;
  }
  function defaultVisitor(value, key, path) {
    let arr = value;
    if (value && !path && typeof value === "object") {
      if (utils$1.endsWith(key, "{}")) {
        key = metaTokens ? key : key.slice(0, -2);
        value = JSON.stringify(value);
      } else if (utils$1.isArray(value) && isFlatArray(value) || (utils$1.isFileList(value) || utils$1.endsWith(key, "[]")) && (arr = utils$1.toArray(value))) {
        key = removeBrackets(key);
        arr.forEach(function each(el, index) {
          !(utils$1.isUndefined(el) || el === null) && formData.append(
            // eslint-disable-next-line no-nested-ternary
            indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]",
            convertValue(el)
          );
        });
        return false;
      }
    }
    if (isVisitable(value)) {
      return true;
    }
    formData.append(renderKey(path, key, dots), convertValue(value));
    return false;
  }
  const stack = [];
  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });
  function build(value, path) {
    if (utils$1.isUndefined(value)) return;
    if (stack.indexOf(value) !== -1) {
      throw Error("Circular reference detected in " + path.join("."));
    }
    stack.push(value);
    utils$1.forEach(value, function each(el, key) {
      const result = !(utils$1.isUndefined(el) || el === null) && visitor.call(
        formData,
        el,
        utils$1.isString(key) ? key.trim() : key,
        path,
        exposedHelpers
      );
      if (result === true) {
        build(el, path ? path.concat(key) : [key]);
      }
    });
    stack.pop();
  }
  if (!utils$1.isObject(obj)) {
    throw new TypeError("data must be an object");
  }
  build(obj);
  return formData;
}
function encode$1(str) {
  const charMap = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
    return charMap[match];
  });
}
function AxiosURLSearchParams(params, options) {
  this._pairs = [];
  params && toFormData$1(params, this, options);
}
const prototype = AxiosURLSearchParams.prototype;
prototype.append = function append(name, value) {
  this._pairs.push([name, value]);
};
prototype.toString = function toString2(encoder) {
  const _encode = encoder ? function(value) {
    return encoder.call(this, value, encode$1);
  } : encode$1;
  return this._pairs.map(function each(pair) {
    return _encode(pair[0]) + "=" + _encode(pair[1]);
  }, "").join("&");
};
function encode(val) {
  return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function buildURL(url, params, options) {
  if (!params) {
    return url;
  }
  const _encode = options && options.encode || encode;
  if (utils$1.isFunction(options)) {
    options = {
      serialize: options
    };
  }
  const serializeFn = options && options.serialize;
  let serializedParams;
  if (serializeFn) {
    serializedParams = serializeFn(params, options);
  } else {
    serializedParams = utils$1.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams(params, options).toString(_encode);
  }
  if (serializedParams) {
    const hashmarkIndex = url.indexOf("#");
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
  }
  return url;
}
class InterceptorManager {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
   */
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(fn) {
    utils$1.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  }
}
const transitionalDefaults = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};
const URLSearchParams$1 = require$$0$2.URLSearchParams;
const ALPHA = "abcdefghijklmnopqrstuvwxyz";
const DIGIT = "0123456789";
const ALPHABET = {
  DIGIT,
  ALPHA,
  ALPHA_DIGIT: ALPHA + ALPHA.toUpperCase() + DIGIT
};
const generateString = (size = 16, alphabet = ALPHABET.ALPHA_DIGIT) => {
  let str = "";
  const { length } = alphabet;
  const randomValues = new Uint32Array(size);
  require$$8.randomFillSync(randomValues);
  for (let i = 0; i < size; i++) {
    str += alphabet[randomValues[i] % length];
  }
  return str;
};
const platform$1 = {
  isNode: true,
  classes: {
    URLSearchParams: URLSearchParams$1,
    FormData: FormData$1,
    Blob: typeof Blob !== "undefined" && Blob || null
  },
  ALPHABET,
  generateString,
  protocols: ["http", "https", "file", "data"]
};
const hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
const _navigator = typeof navigator === "object" && navigator || void 0;
const hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || ["ReactNative", "NativeScript", "NS"].indexOf(_navigator.product) < 0);
const hasStandardBrowserWebWorkerEnv = (() => {
  return typeof WorkerGlobalScope !== "undefined" && // eslint-disable-next-line no-undef
  self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
})();
const origin = hasBrowserEnv && window.location.href || "http://localhost";
const utils = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv,
  hasStandardBrowserEnv,
  hasStandardBrowserWebWorkerEnv,
  navigator: _navigator,
  origin
}, Symbol.toStringTag, { value: "Module" }));
const platform = {
  ...utils,
  ...platform$1
};
function toURLEncodedForm(data, options) {
  return toFormData$1(data, new platform.classes.URLSearchParams(), {
    visitor: function(value, key, path, helpers) {
      if (platform.isNode && utils$1.isBuffer(value)) {
        this.append(key, value.toString("base64"));
        return false;
      }
      return helpers.defaultVisitor.apply(this, arguments);
    },
    ...options
  });
}
function parsePropPath(name) {
  return utils$1.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
    return match[0] === "[]" ? "" : match[1] || match[0];
  });
}
function arrayToObject(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i;
  const len = keys.length;
  let key;
  for (i = 0; i < len; i++) {
    key = keys[i];
    obj[key] = arr[key];
  }
  return obj;
}
function formDataToJSON(formData) {
  function buildPath(path, value, target, index) {
    let name = path[index++];
    if (name === "__proto__") return true;
    const isNumericKey = Number.isFinite(+name);
    const isLast = index >= path.length;
    name = !name && utils$1.isArray(target) ? target.length : name;
    if (isLast) {
      if (utils$1.hasOwnProp(target, name)) {
        target[name] = [target[name], value];
      } else {
        target[name] = value;
      }
      return !isNumericKey;
    }
    if (!target[name] || !utils$1.isObject(target[name])) {
      target[name] = [];
    }
    const result = buildPath(path, value, target[name], index);
    if (result && utils$1.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }
    return !isNumericKey;
  }
  if (utils$1.isFormData(formData) && utils$1.isFunction(formData.entries)) {
    const obj = {};
    utils$1.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });
    return obj;
  }
  return null;
}
function stringifySafely(rawValue, parser, encoder) {
  if (utils$1.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils$1.trim(rawValue);
    } catch (e) {
      if (e.name !== "SyntaxError") {
        throw e;
      }
    }
  }
  return (encoder || JSON.stringify)(rawValue);
}
const defaults = {
  transitional: transitionalDefaults,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [function transformRequest(data, headers) {
    const contentType = headers.getContentType() || "";
    const hasJSONContentType = contentType.indexOf("application/json") > -1;
    const isObjectPayload = utils$1.isObject(data);
    if (isObjectPayload && utils$1.isHTMLForm(data)) {
      data = new FormData(data);
    }
    const isFormData2 = utils$1.isFormData(data);
    if (isFormData2) {
      return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
    }
    if (utils$1.isArrayBuffer(data) || utils$1.isBuffer(data) || utils$1.isStream(data) || utils$1.isFile(data) || utils$1.isBlob(data) || utils$1.isReadableStream(data)) {
      return data;
    }
    if (utils$1.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils$1.isURLSearchParams(data)) {
      headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
      return data.toString();
    }
    let isFileList2;
    if (isObjectPayload) {
      if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
        return toURLEncodedForm(data, this.formSerializer).toString();
      }
      if ((isFileList2 = utils$1.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
        const _FormData = this.env && this.env.FormData;
        return toFormData$1(
          isFileList2 ? { "files[]": data } : data,
          _FormData && new _FormData(),
          this.formSerializer
        );
      }
    }
    if (isObjectPayload || hasJSONContentType) {
      headers.setContentType("application/json", false);
      return stringifySafely(data);
    }
    return data;
  }],
  transformResponse: [function transformResponse(data) {
    const transitional2 = this.transitional || defaults.transitional;
    const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
    const JSONRequested = this.responseType === "json";
    if (utils$1.isResponse(data) || utils$1.isReadableStream(data)) {
      return data;
    }
    if (data && utils$1.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
      const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
      const strictJSONParsing = !silentJSONParsing && JSONRequested;
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === "SyntaxError") {
            throw AxiosError$1.from(e, AxiosError$1.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }
    return data;
  }],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: platform.classes.FormData,
    Blob: platform.classes.Blob
  },
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },
  headers: {
    common: {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
utils$1.forEach(["delete", "get", "head", "post", "put", "patch"], (method) => {
  defaults.headers[method] = {};
});
const ignoreDuplicateOf = utils$1.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]);
const parseHeaders = (rawHeaders) => {
  const parsed = {};
  let key;
  let val;
  let i;
  rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
    i = line.indexOf(":");
    key = line.substring(0, i).trim().toLowerCase();
    val = line.substring(i + 1).trim();
    if (!key || parsed[key] && ignoreDuplicateOf[key]) {
      return;
    }
    if (key === "set-cookie") {
      if (parsed[key]) {
        parsed[key].push(val);
      } else {
        parsed[key] = [val];
      }
    } else {
      parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
    }
  });
  return parsed;
};
const $internals = /* @__PURE__ */ Symbol("internals");
function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}
function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }
  return utils$1.isArray(value) ? value.map(normalizeValue) : String(value);
}
function parseTokens(str) {
  const tokens = /* @__PURE__ */ Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;
  while (match = tokensRE.exec(str)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}
const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
  if (utils$1.isFunction(filter2)) {
    return filter2.call(this, value, header);
  }
  if (isHeaderNameFilter) {
    value = header;
  }
  if (!utils$1.isString(value)) return;
  if (utils$1.isString(filter2)) {
    return value.indexOf(filter2) !== -1;
  }
  if (utils$1.isRegExp(filter2)) {
    return filter2.test(value);
  }
}
function formatHeader(header) {
  return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
    return char.toUpperCase() + str;
  });
}
function buildAccessors(obj, header) {
  const accessorName = utils$1.toCamelCase(" " + header);
  ["get", "set", "has"].forEach((methodName) => {
    Object.defineProperty(obj, methodName + accessorName, {
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
}
let AxiosHeaders$1 = class AxiosHeaders {
  constructor(headers) {
    headers && this.set(headers);
  }
  set(header, valueOrRewrite, rewrite) {
    const self2 = this;
    function setHeader(_value, _header, _rewrite) {
      const lHeader = normalizeHeader(_header);
      if (!lHeader) {
        throw new Error("header name must be a non-empty string");
      }
      const key = utils$1.findKey(self2, lHeader);
      if (!key || self2[key] === void 0 || _rewrite === true || _rewrite === void 0 && self2[key] !== false) {
        self2[key || _header] = normalizeValue(_value);
      }
    }
    const setHeaders = (headers, _rewrite) => utils$1.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
    if (utils$1.isPlainObject(header) || header instanceof this.constructor) {
      setHeaders(header, valueOrRewrite);
    } else if (utils$1.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
      setHeaders(parseHeaders(header), valueOrRewrite);
    } else if (utils$1.isObject(header) && utils$1.isIterable(header)) {
      let obj = {}, dest, key;
      for (const entry of header) {
        if (!utils$1.isArray(entry)) {
          throw TypeError("Object iterator must return a key-value pair");
        }
        obj[key = entry[0]] = (dest = obj[key]) ? utils$1.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]] : entry[1];
      }
      setHeaders(obj, valueOrRewrite);
    } else {
      header != null && setHeader(valueOrRewrite, header, rewrite);
    }
    return this;
  }
  get(header, parser) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils$1.findKey(this, header);
      if (key) {
        const value = this[key];
        if (!parser) {
          return value;
        }
        if (parser === true) {
          return parseTokens(value);
        }
        if (utils$1.isFunction(parser)) {
          return parser.call(this, value, key);
        }
        if (utils$1.isRegExp(parser)) {
          return parser.exec(value);
        }
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(header, matcher) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils$1.findKey(this, header);
      return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
    }
    return false;
  }
  delete(header, matcher) {
    const self2 = this;
    let deleted = false;
    function deleteHeader(_header) {
      _header = normalizeHeader(_header);
      if (_header) {
        const key = utils$1.findKey(self2, _header);
        if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
          delete self2[key];
          deleted = true;
        }
      }
    }
    if (utils$1.isArray(header)) {
      header.forEach(deleteHeader);
    } else {
      deleteHeader(header);
    }
    return deleted;
  }
  clear(matcher) {
    const keys = Object.keys(this);
    let i = keys.length;
    let deleted = false;
    while (i--) {
      const key = keys[i];
      if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
        delete this[key];
        deleted = true;
      }
    }
    return deleted;
  }
  normalize(format) {
    const self2 = this;
    const headers = {};
    utils$1.forEach(this, (value, header) => {
      const key = utils$1.findKey(headers, header);
      if (key) {
        self2[key] = normalizeValue(value);
        delete self2[header];
        return;
      }
      const normalized = format ? formatHeader(header) : String(header).trim();
      if (normalized !== header) {
        delete self2[header];
      }
      self2[normalized] = normalizeValue(value);
      headers[normalized] = true;
    });
    return this;
  }
  concat(...targets) {
    return this.constructor.concat(this, ...targets);
  }
  toJSON(asStrings) {
    const obj = /* @__PURE__ */ Object.create(null);
    utils$1.forEach(this, (value, header) => {
      value != null && value !== false && (obj[header] = asStrings && utils$1.isArray(value) ? value.join(", ") : value);
    });
    return obj;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
  }
  getSetCookie() {
    return this.get("set-cookie") || [];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(thing) {
    return thing instanceof this ? thing : new this(thing);
  }
  static concat(first, ...targets) {
    const computed = new this(first);
    targets.forEach((target) => computed.set(target));
    return computed;
  }
  static accessor(header) {
    const internals = this[$internals] = this[$internals] = {
      accessors: {}
    };
    const accessors = internals.accessors;
    const prototype2 = this.prototype;
    function defineAccessor(_header) {
      const lHeader = normalizeHeader(_header);
      if (!accessors[lHeader]) {
        buildAccessors(prototype2, _header);
        accessors[lHeader] = true;
      }
    }
    utils$1.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
    return this;
  }
};
AxiosHeaders$1.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
utils$1.reduceDescriptors(AxiosHeaders$1.prototype, ({ value }, key) => {
  let mapped = key[0].toUpperCase() + key.slice(1);
  return {
    get: () => value,
    set(headerValue) {
      this[mapped] = headerValue;
    }
  };
});
utils$1.freezeMethods(AxiosHeaders$1);
function transformData(fns, response) {
  const config = this || defaults;
  const context = response || config;
  const headers = AxiosHeaders$1.from(context.headers);
  let data = context.data;
  utils$1.forEach(fns, function transform(fn) {
    data = fn.call(config, data, headers.normalize(), response ? response.status : void 0);
  });
  headers.normalize();
  return data;
}
function isCancel$1(value) {
  return !!(value && value.__CANCEL__);
}
function CanceledError$1(message, config, request) {
  AxiosError$1.call(this, message == null ? "canceled" : message, AxiosError$1.ERR_CANCELED, config, request);
  this.name = "CanceledError";
}
utils$1.inherits(CanceledError$1, AxiosError$1, {
  __CANCEL__: true
});
function settle(resolve, reject, response) {
  const validateStatus2 = response.config.validateStatus;
  if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError$1(
      "Request failed with status code " + response.status,
      [AxiosError$1.ERR_BAD_REQUEST, AxiosError$1.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response
    ));
  }
}
function isAbsoluteURL(url) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}
function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
}
function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
  let isRelativeUrl = !isAbsoluteURL(requestedURL);
  if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}
var proxyFromEnv$1 = {};
var hasRequiredProxyFromEnv;
function requireProxyFromEnv() {
  if (hasRequiredProxyFromEnv) return proxyFromEnv$1;
  hasRequiredProxyFromEnv = 1;
  var parseUrl = require$$0$2.parse;
  var DEFAULT_PORTS = {
    ftp: 21,
    gopher: 70,
    http: 80,
    https: 443,
    ws: 80,
    wss: 443
  };
  var stringEndsWith = String.prototype.endsWith || function(s) {
    return s.length <= this.length && this.indexOf(s, this.length - s.length) !== -1;
  };
  function getProxyForUrl(url) {
    var parsedUrl = typeof url === "string" ? parseUrl(url) : url || {};
    var proto = parsedUrl.protocol;
    var hostname = parsedUrl.host;
    var port = parsedUrl.port;
    if (typeof hostname !== "string" || !hostname || typeof proto !== "string") {
      return "";
    }
    proto = proto.split(":", 1)[0];
    hostname = hostname.replace(/:\d*$/, "");
    port = parseInt(port) || DEFAULT_PORTS[proto] || 0;
    if (!shouldProxy(hostname, port)) {
      return "";
    }
    var proxy = getEnv("npm_config_" + proto + "_proxy") || getEnv(proto + "_proxy") || getEnv("npm_config_proxy") || getEnv("all_proxy");
    if (proxy && proxy.indexOf("://") === -1) {
      proxy = proto + "://" + proxy;
    }
    return proxy;
  }
  function shouldProxy(hostname, port) {
    var NO_PROXY = (getEnv("npm_config_no_proxy") || getEnv("no_proxy")).toLowerCase();
    if (!NO_PROXY) {
      return true;
    }
    if (NO_PROXY === "*") {
      return false;
    }
    return NO_PROXY.split(/[,\s]/).every(function(proxy) {
      if (!proxy) {
        return true;
      }
      var parsedProxy = proxy.match(/^(.+):(\d+)$/);
      var parsedProxyHostname = parsedProxy ? parsedProxy[1] : proxy;
      var parsedProxyPort = parsedProxy ? parseInt(parsedProxy[2]) : 0;
      if (parsedProxyPort && parsedProxyPort !== port) {
        return true;
      }
      if (!/^[.*]/.test(parsedProxyHostname)) {
        return hostname !== parsedProxyHostname;
      }
      if (parsedProxyHostname.charAt(0) === "*") {
        parsedProxyHostname = parsedProxyHostname.slice(1);
      }
      return !stringEndsWith.call(hostname, parsedProxyHostname);
    });
  }
  function getEnv(key) {
    return process.env[key.toLowerCase()] || process.env[key.toUpperCase()] || "";
  }
  proxyFromEnv$1.getProxyForUrl = getProxyForUrl;
  return proxyFromEnv$1;
}
var proxyFromEnvExports = requireProxyFromEnv();
const proxyFromEnv = /* @__PURE__ */ getDefaultExportFromCjs(proxyFromEnvExports);
var followRedirects$1 = { exports: {} };
var src = { exports: {} };
var browser = { exports: {} };
var ms;
var hasRequiredMs;
function requireMs() {
  if (hasRequiredMs) return ms;
  hasRequiredMs = 1;
  var s = 1e3;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var w = d * 7;
  var y = d * 365.25;
  ms = function(val, options) {
    options = options || {};
    var type2 = typeof val;
    if (type2 === "string" && val.length > 0) {
      return parse(val);
    } else if (type2 === "number" && isFinite(val)) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
    );
  };
  function parse(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
      str
    );
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type2 = (match[2] || "ms").toLowerCase();
    switch (type2) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "weeks":
      case "week":
      case "w":
        return n * w;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return void 0;
    }
  }
  function fmtShort(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d) {
      return Math.round(ms2 / d) + "d";
    }
    if (msAbs >= h) {
      return Math.round(ms2 / h) + "h";
    }
    if (msAbs >= m) {
      return Math.round(ms2 / m) + "m";
    }
    if (msAbs >= s) {
      return Math.round(ms2 / s) + "s";
    }
    return ms2 + "ms";
  }
  function fmtLong(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d) {
      return plural(ms2, msAbs, d, "day");
    }
    if (msAbs >= h) {
      return plural(ms2, msAbs, h, "hour");
    }
    if (msAbs >= m) {
      return plural(ms2, msAbs, m, "minute");
    }
    if (msAbs >= s) {
      return plural(ms2, msAbs, s, "second");
    }
    return ms2 + " ms";
  }
  function plural(ms2, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms2 / n) + " " + name + (isPlural ? "s" : "");
  }
  return ms;
}
var common;
var hasRequiredCommon;
function requireCommon() {
  if (hasRequiredCommon) return common;
  hasRequiredCommon = 1;
  function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = requireMs();
    createDebug.destroy = destroy;
    Object.keys(env).forEach((key) => {
      createDebug[key] = env[key];
    });
    createDebug.names = [];
    createDebug.skips = [];
    createDebug.formatters = {};
    function selectColor(namespace) {
      let hash = 0;
      for (let i = 0; i < namespace.length; i++) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    function createDebug(namespace) {
      let prevTime;
      let enableOverride = null;
      let namespacesCache;
      let enabledCache;
      function debug(...args) {
        if (!debug.enabled) {
          return;
        }
        const self2 = debug;
        const curr = Number(/* @__PURE__ */ new Date());
        const ms2 = curr - (prevTime || curr);
        self2.diff = ms2;
        self2.prev = prevTime;
        self2.curr = curr;
        prevTime = curr;
        args[0] = createDebug.coerce(args[0]);
        if (typeof args[0] !== "string") {
          args.unshift("%O");
        }
        let index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
          if (match === "%%") {
            return "%";
          }
          index++;
          const formatter = createDebug.formatters[format];
          if (typeof formatter === "function") {
            const val = args[index];
            match = formatter.call(self2, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        createDebug.formatArgs.call(self2, args);
        const logFn = self2.log || createDebug.log;
        logFn.apply(self2, args);
      }
      debug.namespace = namespace;
      debug.useColors = createDebug.useColors();
      debug.color = createDebug.selectColor(namespace);
      debug.extend = extend2;
      debug.destroy = createDebug.destroy;
      Object.defineProperty(debug, "enabled", {
        enumerable: true,
        configurable: false,
        get: () => {
          if (enableOverride !== null) {
            return enableOverride;
          }
          if (namespacesCache !== createDebug.namespaces) {
            namespacesCache = createDebug.namespaces;
            enabledCache = createDebug.enabled(namespace);
          }
          return enabledCache;
        },
        set: (v) => {
          enableOverride = v;
        }
      });
      if (typeof createDebug.init === "function") {
        createDebug.init(debug);
      }
      return debug;
    }
    function extend2(namespace, delimiter) {
      const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
      newDebug.log = this.log;
      return newDebug;
    }
    function enable(namespaces) {
      createDebug.save(namespaces);
      createDebug.namespaces = namespaces;
      createDebug.names = [];
      createDebug.skips = [];
      const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const ns of split) {
        if (ns[0] === "-") {
          createDebug.skips.push(ns.slice(1));
        } else {
          createDebug.names.push(ns);
        }
      }
    }
    function matchesTemplate(search, template) {
      let searchIndex = 0;
      let templateIndex = 0;
      let starIndex = -1;
      let matchIndex = 0;
      while (searchIndex < search.length) {
        if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
          if (template[templateIndex] === "*") {
            starIndex = templateIndex;
            matchIndex = searchIndex;
            templateIndex++;
          } else {
            searchIndex++;
            templateIndex++;
          }
        } else if (starIndex !== -1) {
          templateIndex = starIndex + 1;
          matchIndex++;
          searchIndex = matchIndex;
        } else {
          return false;
        }
      }
      while (templateIndex < template.length && template[templateIndex] === "*") {
        templateIndex++;
      }
      return templateIndex === template.length;
    }
    function disable() {
      const namespaces = [
        ...createDebug.names,
        ...createDebug.skips.map((namespace) => "-" + namespace)
      ].join(",");
      createDebug.enable("");
      return namespaces;
    }
    function enabled(name) {
      for (const skip of createDebug.skips) {
        if (matchesTemplate(name, skip)) {
          return false;
        }
      }
      for (const ns of createDebug.names) {
        if (matchesTemplate(name, ns)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error) {
        return val.stack || val.message;
      }
      return val;
    }
    function destroy() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    createDebug.enable(createDebug.load());
    return createDebug;
  }
  common = setup;
  return common;
}
var hasRequiredBrowser;
function requireBrowser() {
  if (hasRequiredBrowser) return browser.exports;
  hasRequiredBrowser = 1;
  (function(module, exports$1) {
    exports$1.formatArgs = formatArgs;
    exports$1.save = save;
    exports$1.load = load;
    exports$1.useColors = useColors;
    exports$1.storage = localstorage();
    exports$1.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports$1.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports$1.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports$1.storage.setItem("debug", namespaces);
        } else {
          exports$1.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r;
      try {
        r = exports$1.storage.getItem("debug") || exports$1.storage.getItem("DEBUG");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module.exports = requireCommon()(exports$1);
    const { formatters } = module.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  })(browser, browser.exports);
  return browser.exports;
}
var node = { exports: {} };
const require$$0 = /* @__PURE__ */ getAugmentedNamespace(tty$1);
var hasFlag;
var hasRequiredHasFlag;
function requireHasFlag() {
  if (hasRequiredHasFlag) return hasFlag;
  hasRequiredHasFlag = 1;
  hasFlag = (flag, argv = process.argv) => {
    const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
    const position = argv.indexOf(prefix + flag);
    const terminatorPosition = argv.indexOf("--");
    return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
  };
  return hasFlag;
}
var supportsColor_1;
var hasRequiredSupportsColor;
function requireSupportsColor() {
  if (hasRequiredSupportsColor) return supportsColor_1;
  hasRequiredSupportsColor = 1;
  const os = require$$0$3;
  const tty2 = require$$0;
  const hasFlag2 = requireHasFlag();
  const { env } = process;
  let forceColor;
  if (hasFlag2("no-color") || hasFlag2("no-colors") || hasFlag2("color=false") || hasFlag2("color=never")) {
    forceColor = 0;
  } else if (hasFlag2("color") || hasFlag2("colors") || hasFlag2("color=true") || hasFlag2("color=always")) {
    forceColor = 1;
  }
  if ("FORCE_COLOR" in env) {
    if (env.FORCE_COLOR === "true") {
      forceColor = 1;
    } else if (env.FORCE_COLOR === "false") {
      forceColor = 0;
    } else {
      forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
    }
  }
  function translateLevel(level) {
    if (level === 0) {
      return false;
    }
    return {
      level,
      hasBasic: true,
      has256: level >= 2,
      has16m: level >= 3
    };
  }
  function supportsColor(haveStream, streamIsTTY) {
    if (forceColor === 0) {
      return 0;
    }
    if (hasFlag2("color=16m") || hasFlag2("color=full") || hasFlag2("color=truecolor")) {
      return 3;
    }
    if (hasFlag2("color=256")) {
      return 2;
    }
    if (haveStream && !streamIsTTY && forceColor === void 0) {
      return 0;
    }
    const min2 = forceColor || 0;
    if (env.TERM === "dumb") {
      return min2;
    }
    if (process.platform === "win32") {
      const osRelease = os.release().split(".");
      if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
        return Number(osRelease[2]) >= 14931 ? 3 : 2;
      }
      return 1;
    }
    if ("CI" in env) {
      if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((sign2) => sign2 in env) || env.CI_NAME === "codeship") {
        return 1;
      }
      return min2;
    }
    if ("TEAMCITY_VERSION" in env) {
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
    }
    if (env.COLORTERM === "truecolor") {
      return 3;
    }
    if ("TERM_PROGRAM" in env) {
      const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (env.TERM_PROGRAM) {
        case "iTerm.app":
          return version >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    if (/-256(color)?$/i.test(env.TERM)) {
      return 2;
    }
    if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
      return 1;
    }
    if ("COLORTERM" in env) {
      return 1;
    }
    return min2;
  }
  function getSupportLevel(stream2) {
    const level = supportsColor(stream2, stream2 && stream2.isTTY);
    return translateLevel(level);
  }
  supportsColor_1 = {
    supportsColor: getSupportLevel,
    stdout: translateLevel(supportsColor(true, tty2.isatty(1))),
    stderr: translateLevel(supportsColor(true, tty2.isatty(2)))
  };
  return supportsColor_1;
}
var hasRequiredNode;
function requireNode() {
  if (hasRequiredNode) return node.exports;
  hasRequiredNode = 1;
  (function(module, exports$1) {
    const tty2 = require$$0;
    const util = require$$1;
    exports$1.init = init2;
    exports$1.log = log;
    exports$1.formatArgs = formatArgs;
    exports$1.save = save;
    exports$1.load = load;
    exports$1.useColors = useColors;
    exports$1.destroy = util.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    );
    exports$1.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor = requireSupportsColor();
      if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports$1.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error) {
    }
    exports$1.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
        return k.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports$1.inspectOpts ? Boolean(exports$1.inspectOpts.colors) : tty2.isatty(process.stderr.fd);
    }
    function formatArgs(args) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c = this.color;
        const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
        const prefix = `  ${colorCode};1m${name} \x1B[0m`;
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    function getDate() {
      if (exports$1.inspectOpts.hideDate) {
        return "";
      }
      return (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function log(...args) {
      return process.stderr.write(util.formatWithOptions(exports$1.inspectOpts, ...args) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function init2(debug) {
      debug.inspectOpts = {};
      const keys = Object.keys(exports$1.inspectOpts);
      for (let i = 0; i < keys.length; i++) {
        debug.inspectOpts[keys[i]] = exports$1.inspectOpts[keys[i]];
      }
    }
    module.exports = requireCommon()(exports$1);
    const { formatters } = module.exports;
    formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
    };
    formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
  })(node, node.exports);
  return node.exports;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src.exports;
  hasRequiredSrc = 1;
  if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
    src.exports = requireBrowser();
  } else {
    src.exports = requireNode();
  }
  return src.exports;
}
var debug_1;
var hasRequiredDebug;
function requireDebug() {
  if (hasRequiredDebug) return debug_1;
  hasRequiredDebug = 1;
  var debug;
  debug_1 = function() {
    if (!debug) {
      try {
        debug = requireSrc()("follow-redirects");
      } catch (error) {
      }
      if (typeof debug !== "function") {
        debug = function() {
        };
      }
    }
    debug.apply(null, arguments);
  };
  return debug_1;
}
var hasRequiredFollowRedirects;
function requireFollowRedirects() {
  if (hasRequiredFollowRedirects) return followRedirects$1.exports;
  hasRequiredFollowRedirects = 1;
  var url = require$$0$2;
  var URL2 = url.URL;
  var http2 = require$$3;
  var https = require$$4;
  var Writable = stream.Writable;
  var assert = require$$4$1;
  var debug = requireDebug();
  (function detectUnsupportedEnvironment() {
    var looksLikeNode = typeof process !== "undefined";
    var looksLikeBrowser = typeof window !== "undefined" && typeof document !== "undefined";
    var looksLikeV8 = isFunction2(Error.captureStackTrace);
    if (!looksLikeNode && (looksLikeBrowser || !looksLikeV8)) {
      console.warn("The follow-redirects package should be excluded from browser builds.");
    }
  })();
  var useNativeURL = false;
  try {
    assert(new URL2(""));
  } catch (error) {
    useNativeURL = error.code === "ERR_INVALID_URL";
  }
  var sensitiveHeaders = [
    "Authorization",
    "Proxy-Authorization",
    "Cookie"
  ];
  var preservedUrlFields = [
    "auth",
    "host",
    "hostname",
    "href",
    "path",
    "pathname",
    "port",
    "protocol",
    "query",
    "search",
    "hash"
  ];
  var events = ["abort", "aborted", "connect", "error", "socket", "timeout"];
  var eventHandlers = /* @__PURE__ */ Object.create(null);
  events.forEach(function(event) {
    eventHandlers[event] = function(arg1, arg2, arg3) {
      this._redirectable.emit(event, arg1, arg2, arg3);
    };
  });
  var InvalidUrlError = createErrorType(
    "ERR_INVALID_URL",
    "Invalid URL",
    TypeError
  );
  var RedirectionError = createErrorType(
    "ERR_FR_REDIRECTION_FAILURE",
    "Redirected request failed"
  );
  var TooManyRedirectsError = createErrorType(
    "ERR_FR_TOO_MANY_REDIRECTS",
    "Maximum number of redirects exceeded",
    RedirectionError
  );
  var MaxBodyLengthExceededError = createErrorType(
    "ERR_FR_MAX_BODY_LENGTH_EXCEEDED",
    "Request body larger than maxBodyLength limit"
  );
  var WriteAfterEndError = createErrorType(
    "ERR_STREAM_WRITE_AFTER_END",
    "write after end"
  );
  var destroy = Writable.prototype.destroy || noop2;
  function RedirectableRequest(options, responseCallback) {
    Writable.call(this);
    this._sanitizeOptions(options);
    this._options = options;
    this._ended = false;
    this._ending = false;
    this._redirectCount = 0;
    this._redirects = [];
    this._requestBodyLength = 0;
    this._requestBodyBuffers = [];
    if (responseCallback) {
      this.on("response", responseCallback);
    }
    var self2 = this;
    this._onNativeResponse = function(response) {
      try {
        self2._processResponse(response);
      } catch (cause) {
        self2.emit("error", cause instanceof RedirectionError ? cause : new RedirectionError({ cause }));
      }
    };
    this._headerFilter = new RegExp("^(?:" + sensitiveHeaders.concat(options.sensitiveHeaders).map(escapeRegex).join("|") + ")$", "i");
    this._performRequest();
  }
  RedirectableRequest.prototype = Object.create(Writable.prototype);
  RedirectableRequest.prototype.abort = function() {
    destroyRequest(this._currentRequest);
    this._currentRequest.abort();
    this.emit("abort");
  };
  RedirectableRequest.prototype.destroy = function(error) {
    destroyRequest(this._currentRequest, error);
    destroy.call(this, error);
    return this;
  };
  RedirectableRequest.prototype.write = function(data, encoding, callback) {
    if (this._ending) {
      throw new WriteAfterEndError();
    }
    if (!isString2(data) && !isBuffer2(data)) {
      throw new TypeError("data should be a string, Buffer or Uint8Array");
    }
    if (isFunction2(encoding)) {
      callback = encoding;
      encoding = null;
    }
    if (data.length === 0) {
      if (callback) {
        callback();
      }
      return;
    }
    if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
      this._requestBodyLength += data.length;
      this._requestBodyBuffers.push({ data, encoding });
      this._currentRequest.write(data, encoding, callback);
    } else {
      this.emit("error", new MaxBodyLengthExceededError());
      this.abort();
    }
  };
  RedirectableRequest.prototype.end = function(data, encoding, callback) {
    if (isFunction2(data)) {
      callback = data;
      data = encoding = null;
    } else if (isFunction2(encoding)) {
      callback = encoding;
      encoding = null;
    }
    if (!data) {
      this._ended = this._ending = true;
      this._currentRequest.end(null, null, callback);
    } else {
      var self2 = this;
      var currentRequest = this._currentRequest;
      this.write(data, encoding, function() {
        self2._ended = true;
        currentRequest.end(null, null, callback);
      });
      this._ending = true;
    }
  };
  RedirectableRequest.prototype.setHeader = function(name, value) {
    this._options.headers[name] = value;
    this._currentRequest.setHeader(name, value);
  };
  RedirectableRequest.prototype.removeHeader = function(name) {
    delete this._options.headers[name];
    this._currentRequest.removeHeader(name);
  };
  RedirectableRequest.prototype.setTimeout = function(msecs, callback) {
    var self2 = this;
    function destroyOnTimeout(socket) {
      socket.setTimeout(msecs);
      socket.removeListener("timeout", socket.destroy);
      socket.addListener("timeout", socket.destroy);
    }
    function startTimer(socket) {
      if (self2._timeout) {
        clearTimeout(self2._timeout);
      }
      self2._timeout = setTimeout(function() {
        self2.emit("timeout");
        clearTimer();
      }, msecs);
      destroyOnTimeout(socket);
    }
    function clearTimer() {
      if (self2._timeout) {
        clearTimeout(self2._timeout);
        self2._timeout = null;
      }
      self2.removeListener("abort", clearTimer);
      self2.removeListener("error", clearTimer);
      self2.removeListener("response", clearTimer);
      self2.removeListener("close", clearTimer);
      if (callback) {
        self2.removeListener("timeout", callback);
      }
      if (!self2.socket) {
        self2._currentRequest.removeListener("socket", startTimer);
      }
    }
    if (callback) {
      this.on("timeout", callback);
    }
    if (this.socket) {
      startTimer(this.socket);
    } else {
      this._currentRequest.once("socket", startTimer);
    }
    this.on("socket", destroyOnTimeout);
    this.on("abort", clearTimer);
    this.on("error", clearTimer);
    this.on("response", clearTimer);
    this.on("close", clearTimer);
    return this;
  };
  [
    "flushHeaders",
    "getHeader",
    "setNoDelay",
    "setSocketKeepAlive"
  ].forEach(function(method) {
    RedirectableRequest.prototype[method] = function(a, b) {
      return this._currentRequest[method](a, b);
    };
  });
  ["aborted", "connection", "socket"].forEach(function(property) {
    Object.defineProperty(RedirectableRequest.prototype, property, {
      get: function() {
        return this._currentRequest[property];
      }
    });
  });
  RedirectableRequest.prototype._sanitizeOptions = function(options) {
    if (!options.headers) {
      options.headers = {};
    }
    if (!isArray2(options.sensitiveHeaders)) {
      options.sensitiveHeaders = [];
    }
    if (options.host) {
      if (!options.hostname) {
        options.hostname = options.host;
      }
      delete options.host;
    }
    if (!options.pathname && options.path) {
      var searchPos = options.path.indexOf("?");
      if (searchPos < 0) {
        options.pathname = options.path;
      } else {
        options.pathname = options.path.substring(0, searchPos);
        options.search = options.path.substring(searchPos);
      }
    }
  };
  RedirectableRequest.prototype._performRequest = function() {
    var protocol = this._options.protocol;
    var nativeProtocol = this._options.nativeProtocols[protocol];
    if (!nativeProtocol) {
      throw new TypeError("Unsupported protocol " + protocol);
    }
    if (this._options.agents) {
      var scheme = protocol.slice(0, -1);
      this._options.agent = this._options.agents[scheme];
    }
    var request = this._currentRequest = nativeProtocol.request(this._options, this._onNativeResponse);
    request._redirectable = this;
    for (var event of events) {
      request.on(event, eventHandlers[event]);
    }
    this._currentUrl = /^\//.test(this._options.path) ? url.format(this._options) : (
      // When making a request to a proxy, […]
      // a client MUST send the target URI in absolute-form […].
      this._options.path
    );
    if (this._isRedirect) {
      var i = 0;
      var self2 = this;
      var buffers = this._requestBodyBuffers;
      (function writeNext(error) {
        if (request === self2._currentRequest) {
          if (error) {
            self2.emit("error", error);
          } else if (i < buffers.length) {
            var buffer = buffers[i++];
            if (!request.finished) {
              request.write(buffer.data, buffer.encoding, writeNext);
            }
          } else if (self2._ended) {
            request.end();
          }
        }
      })();
    }
  };
  RedirectableRequest.prototype._processResponse = function(response) {
    var statusCode = response.statusCode;
    if (this._options.trackRedirects) {
      this._redirects.push({
        url: this._currentUrl,
        headers: response.headers,
        statusCode
      });
    }
    var location = response.headers.location;
    if (!location || this._options.followRedirects === false || statusCode < 300 || statusCode >= 400) {
      response.responseUrl = this._currentUrl;
      response.redirects = this._redirects;
      this.emit("response", response);
      this._requestBodyBuffers = [];
      return;
    }
    destroyRequest(this._currentRequest);
    response.destroy();
    if (++this._redirectCount > this._options.maxRedirects) {
      throw new TooManyRedirectsError();
    }
    var requestHeaders;
    var beforeRedirect = this._options.beforeRedirect;
    if (beforeRedirect) {
      requestHeaders = Object.assign({
        // The Host header was set by nativeProtocol.request
        Host: response.req.getHeader("host")
      }, this._options.headers);
    }
    var method = this._options.method;
    if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" || // RFC7231§6.4.4: The 303 (See Other) status code indicates that
    // the server is redirecting the user agent to a different resource […]
    // A user agent can perform a retrieval request targeting that URI
    // (a GET or HEAD request if using HTTP) […]
    statusCode === 303 && !/^(?:GET|HEAD)$/.test(this._options.method)) {
      this._options.method = "GET";
      this._requestBodyBuffers = [];
      removeMatchingHeaders(/^content-/i, this._options.headers);
    }
    var currentHostHeader = removeMatchingHeaders(/^host$/i, this._options.headers);
    var currentUrlParts = parseUrl(this._currentUrl);
    var currentHost = currentHostHeader || currentUrlParts.host;
    var currentUrl = /^\w+:/.test(location) ? this._currentUrl : url.format(Object.assign(currentUrlParts, { host: currentHost }));
    var redirectUrl = resolveUrl2(location, currentUrl);
    debug("redirecting to", redirectUrl.href);
    this._isRedirect = true;
    spreadUrlObject(redirectUrl, this._options);
    if (redirectUrl.protocol !== currentUrlParts.protocol && redirectUrl.protocol !== "https:" || redirectUrl.host !== currentHost && !isSubdomain(redirectUrl.host, currentHost)) {
      removeMatchingHeaders(this._headerFilter, this._options.headers);
    }
    if (isFunction2(beforeRedirect)) {
      var responseDetails = {
        headers: response.headers,
        statusCode
      };
      var requestDetails = {
        url: currentUrl,
        method,
        headers: requestHeaders
      };
      beforeRedirect(this._options, responseDetails, requestDetails);
      this._sanitizeOptions(this._options);
    }
    this._performRequest();
  };
  function wrap(protocols) {
    var exports$1 = {
      maxRedirects: 21,
      maxBodyLength: 10 * 1024 * 1024
    };
    var nativeProtocols = {};
    Object.keys(protocols).forEach(function(scheme) {
      var protocol = scheme + ":";
      var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
      var wrappedProtocol = exports$1[scheme] = Object.create(nativeProtocol);
      function request(input, options, callback) {
        if (isURL(input)) {
          input = spreadUrlObject(input);
        } else if (isString2(input)) {
          input = spreadUrlObject(parseUrl(input));
        } else {
          callback = options;
          options = validateUrl(input);
          input = { protocol };
        }
        if (isFunction2(options)) {
          callback = options;
          options = null;
        }
        options = Object.assign({
          maxRedirects: exports$1.maxRedirects,
          maxBodyLength: exports$1.maxBodyLength
        }, input, options);
        options.nativeProtocols = nativeProtocols;
        if (!isString2(options.host) && !isString2(options.hostname)) {
          options.hostname = "::1";
        }
        assert.equal(options.protocol, protocol, "protocol mismatch");
        debug("options", options);
        return new RedirectableRequest(options, callback);
      }
      function get2(input, options, callback) {
        var wrappedRequest = wrappedProtocol.request(input, options, callback);
        wrappedRequest.end();
        return wrappedRequest;
      }
      Object.defineProperties(wrappedProtocol, {
        request: { value: request, configurable: true, enumerable: true, writable: true },
        get: { value: get2, configurable: true, enumerable: true, writable: true }
      });
    });
    return exports$1;
  }
  function noop2() {
  }
  function parseUrl(input) {
    var parsed;
    if (useNativeURL) {
      parsed = new URL2(input);
    } else {
      parsed = validateUrl(url.parse(input));
      if (!isString2(parsed.protocol)) {
        throw new InvalidUrlError({ input });
      }
    }
    return parsed;
  }
  function resolveUrl2(relative, base) {
    return useNativeURL ? new URL2(relative, base) : parseUrl(url.resolve(base, relative));
  }
  function validateUrl(input) {
    if (/^\[/.test(input.hostname) && !/^\[[:0-9a-f]+\]$/i.test(input.hostname)) {
      throw new InvalidUrlError({ input: input.href || input });
    }
    if (/^\[/.test(input.host) && !/^\[[:0-9a-f]+\](:\d+)?$/i.test(input.host)) {
      throw new InvalidUrlError({ input: input.href || input });
    }
    return input;
  }
  function spreadUrlObject(urlObject, target) {
    var spread2 = target || {};
    for (var key of preservedUrlFields) {
      spread2[key] = urlObject[key];
    }
    if (spread2.hostname.startsWith("[")) {
      spread2.hostname = spread2.hostname.slice(1, -1);
    }
    if (spread2.port !== "") {
      spread2.port = Number(spread2.port);
    }
    spread2.path = spread2.search ? spread2.pathname + spread2.search : spread2.pathname;
    return spread2;
  }
  function removeMatchingHeaders(regex, headers) {
    var lastValue;
    for (var header in headers) {
      if (regex.test(header)) {
        lastValue = headers[header];
        delete headers[header];
      }
    }
    return lastValue === null || typeof lastValue === "undefined" ? void 0 : String(lastValue).trim();
  }
  function createErrorType(code, message, baseClass) {
    function CustomError(properties) {
      if (isFunction2(Error.captureStackTrace)) {
        Error.captureStackTrace(this, this.constructor);
      }
      Object.assign(this, properties || {});
      this.code = code;
      this.message = this.cause ? message + ": " + this.cause.message : message;
    }
    CustomError.prototype = new (baseClass || Error)();
    Object.defineProperties(CustomError.prototype, {
      constructor: {
        value: CustomError,
        enumerable: false
      },
      name: {
        value: "Error [" + code + "]",
        enumerable: false
      }
    });
    return CustomError;
  }
  function destroyRequest(request, error) {
    for (var event of events) {
      request.removeListener(event, eventHandlers[event]);
    }
    request.on("error", noop2);
    request.destroy(error);
  }
  function isSubdomain(subdomain, domain) {
    assert(isString2(subdomain) && isString2(domain));
    var dot = subdomain.length - domain.length - 1;
    return dot > 0 && subdomain[dot] === "." && subdomain.endsWith(domain);
  }
  function isArray2(value) {
    return value instanceof Array;
  }
  function isString2(value) {
    return typeof value === "string" || value instanceof String;
  }
  function isFunction2(value) {
    return typeof value === "function";
  }
  function isBuffer2(value) {
    return typeof value === "object" && "length" in value;
  }
  function isURL(value) {
    return URL2 && value instanceof URL2;
  }
  function escapeRegex(regex) {
    return regex.replace(/[\]\\/()*+?.$]/g, "\\$&");
  }
  followRedirects$1.exports = wrap({ http: http2, https });
  followRedirects$1.exports.wrap = wrap;
  return followRedirects$1.exports;
}
var followRedirectsExports = requireFollowRedirects();
const followRedirects = /* @__PURE__ */ getDefaultExportFromCjs(followRedirectsExports);
const VERSION$1 = "1.11.0";
function parseProtocol(url) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
  return match && match[1] || "";
}
const DATA_URL_PATTERN = /^(?:([^;]+);)?(?:[^;]+;)?(base64|),([\s\S]*)$/;
function fromDataURI(uri2, asBlob, options) {
  const _Blob = options && options.Blob || platform.classes.Blob;
  const protocol = parseProtocol(uri2);
  if (asBlob === void 0 && _Blob) {
    asBlob = true;
  }
  if (protocol === "data") {
    uri2 = protocol.length ? uri2.slice(protocol.length + 1) : uri2;
    const match = DATA_URL_PATTERN.exec(uri2);
    if (!match) {
      throw new AxiosError$1("Invalid URL", AxiosError$1.ERR_INVALID_URL);
    }
    const mime = match[1];
    const isBase64 = match[2];
    const body = match[3];
    const buffer = Buffer.from(decodeURIComponent(body), isBase64 ? "base64" : "utf8");
    if (asBlob) {
      if (!_Blob) {
        throw new AxiosError$1("Blob is not supported", AxiosError$1.ERR_NOT_SUPPORT);
      }
      return new _Blob([buffer], { type: mime });
    }
    return buffer;
  }
  throw new AxiosError$1("Unsupported protocol " + protocol, AxiosError$1.ERR_NOT_SUPPORT);
}
const kInternals = /* @__PURE__ */ Symbol("internals");
class AxiosTransformStream extends stream.Transform {
  constructor(options) {
    options = utils$1.toFlatObject(options, {
      maxRate: 0,
      chunkSize: 64 * 1024,
      minChunkSize: 100,
      timeWindow: 500,
      ticksRate: 2,
      samplesCount: 15
    }, null, (prop, source) => {
      return !utils$1.isUndefined(source[prop]);
    });
    super({
      readableHighWaterMark: options.chunkSize
    });
    const internals = this[kInternals] = {
      timeWindow: options.timeWindow,
      chunkSize: options.chunkSize,
      maxRate: options.maxRate,
      minChunkSize: options.minChunkSize,
      bytesSeen: 0,
      isCaptured: false,
      notifiedBytesLoaded: 0,
      ts: Date.now(),
      bytes: 0,
      onReadCallback: null
    };
    this.on("newListener", (event) => {
      if (event === "progress") {
        if (!internals.isCaptured) {
          internals.isCaptured = true;
        }
      }
    });
  }
  _read(size) {
    const internals = this[kInternals];
    if (internals.onReadCallback) {
      internals.onReadCallback();
    }
    return super._read(size);
  }
  _transform(chunk, encoding, callback) {
    const internals = this[kInternals];
    const maxRate = internals.maxRate;
    const readableHighWaterMark = this.readableHighWaterMark;
    const timeWindow = internals.timeWindow;
    const divider = 1e3 / timeWindow;
    const bytesThreshold = maxRate / divider;
    const minChunkSize = internals.minChunkSize !== false ? Math.max(internals.minChunkSize, bytesThreshold * 0.01) : 0;
    const pushChunk = (_chunk, _callback) => {
      const bytes = Buffer.byteLength(_chunk);
      internals.bytesSeen += bytes;
      internals.bytes += bytes;
      internals.isCaptured && this.emit("progress", internals.bytesSeen);
      if (this.push(_chunk)) {
        process.nextTick(_callback);
      } else {
        internals.onReadCallback = () => {
          internals.onReadCallback = null;
          process.nextTick(_callback);
        };
      }
    };
    const transformChunk = (_chunk, _callback) => {
      const chunkSize = Buffer.byteLength(_chunk);
      let chunkRemainder = null;
      let maxChunkSize = readableHighWaterMark;
      let bytesLeft;
      let passed = 0;
      if (maxRate) {
        const now = Date.now();
        if (!internals.ts || (passed = now - internals.ts) >= timeWindow) {
          internals.ts = now;
          bytesLeft = bytesThreshold - internals.bytes;
          internals.bytes = bytesLeft < 0 ? -bytesLeft : 0;
          passed = 0;
        }
        bytesLeft = bytesThreshold - internals.bytes;
      }
      if (maxRate) {
        if (bytesLeft <= 0) {
          return setTimeout(() => {
            _callback(null, _chunk);
          }, timeWindow - passed);
        }
        if (bytesLeft < maxChunkSize) {
          maxChunkSize = bytesLeft;
        }
      }
      if (maxChunkSize && chunkSize > maxChunkSize && chunkSize - maxChunkSize > minChunkSize) {
        chunkRemainder = _chunk.subarray(maxChunkSize);
        _chunk = _chunk.subarray(0, maxChunkSize);
      }
      pushChunk(_chunk, chunkRemainder ? () => {
        process.nextTick(_callback, null, chunkRemainder);
      } : _callback);
    };
    transformChunk(chunk, function transformNextChunk(err, _chunk) {
      if (err) {
        return callback(err);
      }
      if (_chunk) {
        transformChunk(_chunk, transformNextChunk);
      } else {
        callback(null);
      }
    });
  }
}
const { asyncIterator } = Symbol;
const readBlob = async function* (blob) {
  if (blob.stream) {
    yield* blob.stream();
  } else if (blob.arrayBuffer) {
    yield await blob.arrayBuffer();
  } else if (blob[asyncIterator]) {
    yield* blob[asyncIterator]();
  } else {
    yield blob;
  }
};
const BOUNDARY_ALPHABET = platform.ALPHABET.ALPHA_DIGIT + "-_";
const textEncoder = typeof TextEncoder === "function" ? new TextEncoder() : new require$$1.TextEncoder();
const CRLF = "\r\n";
const CRLF_BYTES = textEncoder.encode(CRLF);
const CRLF_BYTES_COUNT = 2;
class FormDataPart {
  constructor(name, value) {
    const { escapeName } = this.constructor;
    const isStringValue = utils$1.isString(value);
    let headers = `Content-Disposition: form-data; name="${escapeName(name)}"${!isStringValue && value.name ? `; filename="${escapeName(value.name)}"` : ""}${CRLF}`;
    if (isStringValue) {
      value = textEncoder.encode(String(value).replace(/\r?\n|\r\n?/g, CRLF));
    } else {
      headers += `Content-Type: ${value.type || "application/octet-stream"}${CRLF}`;
    }
    this.headers = textEncoder.encode(headers + CRLF);
    this.contentLength = isStringValue ? value.byteLength : value.size;
    this.size = this.headers.byteLength + this.contentLength + CRLF_BYTES_COUNT;
    this.name = name;
    this.value = value;
  }
  async *encode() {
    yield this.headers;
    const { value } = this;
    if (utils$1.isTypedArray(value)) {
      yield value;
    } else {
      yield* readBlob(value);
    }
    yield CRLF_BYTES;
  }
  static escapeName(name) {
    return String(name).replace(/[\r\n"]/g, (match) => ({
      "\r": "%0D",
      "\n": "%0A",
      '"': "%22"
    })[match]);
  }
}
const formDataToStream = (form, headersHandler, options) => {
  const {
    tag = "form-data-boundary",
    size = 25,
    boundary = tag + "-" + platform.generateString(size, BOUNDARY_ALPHABET)
  } = options || {};
  if (!utils$1.isFormData(form)) {
    throw TypeError("FormData instance required");
  }
  if (boundary.length < 1 || boundary.length > 70) {
    throw Error("boundary must be 10-70 characters long");
  }
  const boundaryBytes = textEncoder.encode("--" + boundary + CRLF);
  const footerBytes = textEncoder.encode("--" + boundary + "--" + CRLF);
  let contentLength = footerBytes.byteLength;
  const parts = Array.from(form.entries()).map(([name, value]) => {
    const part = new FormDataPart(name, value);
    contentLength += part.size;
    return part;
  });
  contentLength += boundaryBytes.byteLength * parts.length;
  contentLength = utils$1.toFiniteNumber(contentLength);
  const computedHeaders = {
    "Content-Type": `multipart/form-data; boundary=${boundary}`
  };
  if (Number.isFinite(contentLength)) {
    computedHeaders["Content-Length"] = contentLength;
  }
  headersHandler && headersHandler(computedHeaders);
  return Readable.from((async function* () {
    for (const part of parts) {
      yield boundaryBytes;
      yield* part.encode();
    }
    yield footerBytes;
  })());
};
class ZlibHeaderTransformStream extends stream.Transform {
  __transform(chunk, encoding, callback) {
    this.push(chunk);
    callback();
  }
  _transform(chunk, encoding, callback) {
    if (chunk.length !== 0) {
      this._transform = this.__transform;
      if (chunk[0] !== 120) {
        const header = Buffer.alloc(2);
        header[0] = 120;
        header[1] = 156;
        this.push(header, encoding);
      }
    }
    this.__transform(chunk, encoding, callback);
  }
}
const callbackify = (fn, reducer) => {
  return utils$1.isAsyncFn(fn) ? function(...args) {
    const cb = args.pop();
    fn.apply(this, args).then((value) => {
      try {
        reducer ? cb(null, ...reducer(value)) : cb(null, value);
      } catch (err) {
        cb(err);
      }
    }, cb);
  } : fn;
};
function speedometer(samplesCount, min2) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;
  min2 = min2 !== void 0 ? min2 : 1e3;
  return function push(chunkLength) {
    const now = Date.now();
    const startedAt = timestamps[tail];
    if (!firstSampleTS) {
      firstSampleTS = now;
    }
    bytes[head] = chunkLength;
    timestamps[head] = now;
    let i = tail;
    let bytesCount = 0;
    while (i !== head) {
      bytesCount += bytes[i++];
      i = i % samplesCount;
    }
    head = (head + 1) % samplesCount;
    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }
    if (now - firstSampleTS < min2) {
      return;
    }
    const passed = startedAt && now - startedAt;
    return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
  };
}
function throttle$1(fn, freq) {
  let timestamp = 0;
  let threshold = 1e3 / freq;
  let lastArgs;
  let timer;
  const invoke = (args, now = Date.now()) => {
    timestamp = now;
    lastArgs = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fn(...args);
  };
  const throttled = (...args) => {
    const now = Date.now();
    const passed = now - timestamp;
    if (passed >= threshold) {
      invoke(args, now);
    } else {
      lastArgs = args;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          invoke(lastArgs);
        }, threshold - passed);
      }
    }
  };
  const flush = () => lastArgs && invoke(lastArgs);
  return [throttled, flush];
}
const progressEventReducer = (listener, isDownloadStream, freq = 3) => {
  let bytesNotified = 0;
  const _speedometer = speedometer(50, 250);
  return throttle$1((e) => {
    const loaded = e.loaded;
    const total = e.lengthComputable ? e.total : void 0;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;
    bytesNotified = loaded;
    const data = {
      loaded,
      total,
      progress: total ? loaded / total : void 0,
      bytes: progressBytes,
      rate: rate ? rate : void 0,
      estimated: rate && total && inRange ? (total - loaded) / rate : void 0,
      event: e,
      lengthComputable: total != null,
      [isDownloadStream ? "download" : "upload"]: true
    };
    listener(data);
  }, freq);
};
const progressEventDecorator = (total, throttled) => {
  const lengthComputable = total != null;
  return [(loaded) => throttled[0]({
    lengthComputable,
    total,
    loaded
  }), throttled[1]];
};
const asyncDecorator = (fn) => (...args) => utils$1.asap(() => fn(...args));
const zlibOptions = {
  flush: zlib.constants.Z_SYNC_FLUSH,
  finishFlush: zlib.constants.Z_SYNC_FLUSH
};
const brotliOptions = {
  flush: zlib.constants.BROTLI_OPERATION_FLUSH,
  finishFlush: zlib.constants.BROTLI_OPERATION_FLUSH
};
const isBrotliSupported = utils$1.isFunction(zlib.createBrotliDecompress);
const { http: httpFollow, https: httpsFollow } = followRedirects;
const isHttps = /https:?/;
const supportedProtocols = platform.protocols.map((protocol) => {
  return protocol + ":";
});
const flushOnFinish = (stream2, [throttled, flush]) => {
  stream2.on("end", flush).on("error", flush);
  return throttled;
};
function dispatchBeforeRedirect(options, responseDetails) {
  if (options.beforeRedirects.proxy) {
    options.beforeRedirects.proxy(options);
  }
  if (options.beforeRedirects.config) {
    options.beforeRedirects.config(options, responseDetails);
  }
}
function setProxy(options, configProxy, location) {
  let proxy = configProxy;
  if (!proxy && proxy !== false) {
    const proxyUrl = proxyFromEnv.getProxyForUrl(location);
    if (proxyUrl) {
      proxy = new URL(proxyUrl);
    }
  }
  if (proxy) {
    if (proxy.username) {
      proxy.auth = (proxy.username || "") + ":" + (proxy.password || "");
    }
    if (proxy.auth) {
      if (proxy.auth.username || proxy.auth.password) {
        proxy.auth = (proxy.auth.username || "") + ":" + (proxy.auth.password || "");
      }
      const base64 = Buffer.from(proxy.auth, "utf8").toString("base64");
      options.headers["Proxy-Authorization"] = "Basic " + base64;
    }
    options.headers.host = options.hostname + (options.port ? ":" + options.port : "");
    const proxyHost = proxy.hostname || proxy.host;
    options.hostname = proxyHost;
    options.host = proxyHost;
    options.port = proxy.port;
    options.path = location;
    if (proxy.protocol) {
      options.protocol = proxy.protocol.includes(":") ? proxy.protocol : `${proxy.protocol}:`;
    }
  }
  options.beforeRedirects.proxy = function beforeRedirect(redirectOptions) {
    setProxy(redirectOptions, configProxy, redirectOptions.href);
  };
}
const isHttpAdapterSupported = typeof process !== "undefined" && utils$1.kindOf(process) === "process";
const wrapAsync = (asyncExecutor) => {
  return new Promise((resolve, reject) => {
    let onDone;
    let isDone;
    const done = (value, isRejected) => {
      if (isDone) return;
      isDone = true;
      onDone && onDone(value, isRejected);
    };
    const _resolve = (value) => {
      done(value);
      resolve(value);
    };
    const _reject = (reason) => {
      done(reason, true);
      reject(reason);
    };
    asyncExecutor(_resolve, _reject, (onDoneHandler) => onDone = onDoneHandler).catch(_reject);
  });
};
const resolveFamily = ({ address, family }) => {
  if (!utils$1.isString(address)) {
    throw TypeError("address must be a string");
  }
  return {
    address,
    family: family || (address.indexOf(".") < 0 ? 6 : 4)
  };
};
const buildAddressEntry = (address, family) => resolveFamily(utils$1.isObject(address) ? address : { address, family });
const httpAdapter = isHttpAdapterSupported && function httpAdapter2(config) {
  return wrapAsync(async function dispatchHttpRequest(resolve, reject, onDone) {
    let { data, lookup, family } = config;
    const { responseType, responseEncoding } = config;
    const method = config.method.toUpperCase();
    let isDone;
    let rejected = false;
    let req;
    if (lookup) {
      const _lookup = callbackify(lookup, (value) => utils$1.isArray(value) ? value : [value]);
      lookup = (hostname, opt, cb) => {
        _lookup(hostname, opt, (err, arg0, arg1) => {
          if (err) {
            return cb(err);
          }
          const addresses = utils$1.isArray(arg0) ? arg0.map((addr) => buildAddressEntry(addr)) : [buildAddressEntry(arg0, arg1)];
          opt.all ? cb(err, addresses) : cb(err, addresses[0].address, addresses[0].family);
        });
      };
    }
    const emitter = new EventEmitter();
    const onFinished = () => {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(abort);
      }
      if (config.signal) {
        config.signal.removeEventListener("abort", abort);
      }
      emitter.removeAllListeners();
    };
    onDone((value, isRejected) => {
      isDone = true;
      if (isRejected) {
        rejected = true;
        onFinished();
      }
    });
    function abort(reason) {
      emitter.emit("abort", !reason || reason.type ? new CanceledError$1(null, config, req) : reason);
    }
    emitter.once("abort", reject);
    if (config.cancelToken || config.signal) {
      config.cancelToken && config.cancelToken.subscribe(abort);
      if (config.signal) {
        config.signal.aborted ? abort() : config.signal.addEventListener("abort", abort);
      }
    }
    const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
    const parsed = new URL(fullPath, platform.hasBrowserEnv ? platform.origin : void 0);
    const protocol = parsed.protocol || supportedProtocols[0];
    if (protocol === "data:") {
      let convertedData;
      if (method !== "GET") {
        return settle(resolve, reject, {
          status: 405,
          statusText: "method not allowed",
          headers: {},
          config
        });
      }
      try {
        convertedData = fromDataURI(config.url, responseType === "blob", {
          Blob: config.env && config.env.Blob
        });
      } catch (err) {
        throw AxiosError$1.from(err, AxiosError$1.ERR_BAD_REQUEST, config);
      }
      if (responseType === "text") {
        convertedData = convertedData.toString(responseEncoding);
        if (!responseEncoding || responseEncoding === "utf8") {
          convertedData = utils$1.stripBOM(convertedData);
        }
      } else if (responseType === "stream") {
        convertedData = stream.Readable.from(convertedData);
      }
      return settle(resolve, reject, {
        data: convertedData,
        status: 200,
        statusText: "OK",
        headers: new AxiosHeaders$1(),
        config
      });
    }
    if (supportedProtocols.indexOf(protocol) === -1) {
      return reject(new AxiosError$1(
        "Unsupported protocol " + protocol,
        AxiosError$1.ERR_BAD_REQUEST,
        config
      ));
    }
    const headers = AxiosHeaders$1.from(config.headers).normalize();
    headers.set("User-Agent", "axios/" + VERSION$1, false);
    const { onUploadProgress, onDownloadProgress } = config;
    const maxRate = config.maxRate;
    let maxUploadRate = void 0;
    let maxDownloadRate = void 0;
    if (utils$1.isSpecCompliantForm(data)) {
      const userBoundary = headers.getContentType(/boundary=([-_\w\d]{10,70})/i);
      data = formDataToStream(data, (formHeaders) => {
        headers.set(formHeaders);
      }, {
        tag: `axios-${VERSION$1}-boundary`,
        boundary: userBoundary && userBoundary[1] || void 0
      });
    } else if (utils$1.isFormData(data) && utils$1.isFunction(data.getHeaders)) {
      headers.set(data.getHeaders());
      if (!headers.hasContentLength()) {
        try {
          const knownLength = await require$$1.promisify(data.getLength).call(data);
          Number.isFinite(knownLength) && knownLength >= 0 && headers.setContentLength(knownLength);
        } catch (e) {
        }
      }
    } else if (utils$1.isBlob(data) || utils$1.isFile(data)) {
      data.size && headers.setContentType(data.type || "application/octet-stream");
      headers.setContentLength(data.size || 0);
      data = stream.Readable.from(readBlob(data));
    } else if (data && !utils$1.isStream(data)) {
      if (Buffer.isBuffer(data)) ;
      else if (utils$1.isArrayBuffer(data)) {
        data = Buffer.from(new Uint8Array(data));
      } else if (utils$1.isString(data)) {
        data = Buffer.from(data, "utf-8");
      } else {
        return reject(new AxiosError$1(
          "Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream",
          AxiosError$1.ERR_BAD_REQUEST,
          config
        ));
      }
      headers.setContentLength(data.length, false);
      if (config.maxBodyLength > -1 && data.length > config.maxBodyLength) {
        return reject(new AxiosError$1(
          "Request body larger than maxBodyLength limit",
          AxiosError$1.ERR_BAD_REQUEST,
          config
        ));
      }
    }
    const contentLength = utils$1.toFiniteNumber(headers.getContentLength());
    if (utils$1.isArray(maxRate)) {
      maxUploadRate = maxRate[0];
      maxDownloadRate = maxRate[1];
    } else {
      maxUploadRate = maxDownloadRate = maxRate;
    }
    if (data && (onUploadProgress || maxUploadRate)) {
      if (!utils$1.isStream(data)) {
        data = stream.Readable.from(data, { objectMode: false });
      }
      data = stream.pipeline([data, new AxiosTransformStream({
        maxRate: utils$1.toFiniteNumber(maxUploadRate)
      })], utils$1.noop);
      onUploadProgress && data.on("progress", flushOnFinish(
        data,
        progressEventDecorator(
          contentLength,
          progressEventReducer(asyncDecorator(onUploadProgress), false, 3)
        )
      ));
    }
    let auth = void 0;
    if (config.auth) {
      const username = config.auth.username || "";
      const password = config.auth.password || "";
      auth = username + ":" + password;
    }
    if (!auth && parsed.username) {
      const urlUsername = parsed.username;
      const urlPassword = parsed.password;
      auth = urlUsername + ":" + urlPassword;
    }
    auth && headers.delete("authorization");
    let path;
    try {
      path = buildURL(
        parsed.pathname + parsed.search,
        config.params,
        config.paramsSerializer
      ).replace(/^\?/, "");
    } catch (err) {
      const customErr = new Error(err.message);
      customErr.config = config;
      customErr.url = config.url;
      customErr.exists = true;
      return reject(customErr);
    }
    headers.set(
      "Accept-Encoding",
      "gzip, compress, deflate" + (isBrotliSupported ? ", br" : ""),
      false
    );
    const options = {
      path,
      method,
      headers: headers.toJSON(),
      agents: { http: config.httpAgent, https: config.httpsAgent },
      auth,
      protocol,
      family,
      beforeRedirect: dispatchBeforeRedirect,
      beforeRedirects: {}
    };
    !utils$1.isUndefined(lookup) && (options.lookup = lookup);
    if (config.socketPath) {
      options.socketPath = config.socketPath;
    } else {
      options.hostname = parsed.hostname.startsWith("[") ? parsed.hostname.slice(1, -1) : parsed.hostname;
      options.port = parsed.port;
      setProxy(options, config.proxy, protocol + "//" + parsed.hostname + (parsed.port ? ":" + parsed.port : "") + options.path);
    }
    let transport;
    const isHttpsRequest = isHttps.test(options.protocol);
    options.agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;
    if (config.transport) {
      transport = config.transport;
    } else if (config.maxRedirects === 0) {
      transport = isHttpsRequest ? require$$4 : require$$3;
    } else {
      if (config.maxRedirects) {
        options.maxRedirects = config.maxRedirects;
      }
      if (config.beforeRedirect) {
        options.beforeRedirects.config = config.beforeRedirect;
      }
      transport = isHttpsRequest ? httpsFollow : httpFollow;
    }
    if (config.maxBodyLength > -1) {
      options.maxBodyLength = config.maxBodyLength;
    } else {
      options.maxBodyLength = Infinity;
    }
    if (config.insecureHTTPParser) {
      options.insecureHTTPParser = config.insecureHTTPParser;
    }
    req = transport.request(options, function handleResponse(res) {
      if (req.destroyed) return;
      const streams = [res];
      const responseLength = +res.headers["content-length"];
      if (onDownloadProgress || maxDownloadRate) {
        const transformStream = new AxiosTransformStream({
          maxRate: utils$1.toFiniteNumber(maxDownloadRate)
        });
        onDownloadProgress && transformStream.on("progress", flushOnFinish(
          transformStream,
          progressEventDecorator(
            responseLength,
            progressEventReducer(asyncDecorator(onDownloadProgress), true, 3)
          )
        ));
        streams.push(transformStream);
      }
      let responseStream = res;
      const lastRequest = res.req || req;
      if (config.decompress !== false && res.headers["content-encoding"]) {
        if (method === "HEAD" || res.statusCode === 204) {
          delete res.headers["content-encoding"];
        }
        switch ((res.headers["content-encoding"] || "").toLowerCase()) {
          /*eslint default-case:0*/
          case "gzip":
          case "x-gzip":
          case "compress":
          case "x-compress":
            streams.push(zlib.createUnzip(zlibOptions));
            delete res.headers["content-encoding"];
            break;
          case "deflate":
            streams.push(new ZlibHeaderTransformStream());
            streams.push(zlib.createUnzip(zlibOptions));
            delete res.headers["content-encoding"];
            break;
          case "br":
            if (isBrotliSupported) {
              streams.push(zlib.createBrotliDecompress(brotliOptions));
              delete res.headers["content-encoding"];
            }
        }
      }
      responseStream = streams.length > 1 ? stream.pipeline(streams, utils$1.noop) : streams[0];
      const offListeners = stream.finished(responseStream, () => {
        offListeners();
        onFinished();
      });
      const response = {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: new AxiosHeaders$1(res.headers),
        config,
        request: lastRequest
      };
      if (responseType === "stream") {
        response.data = responseStream;
        settle(resolve, reject, response);
      } else {
        const responseBuffer = [];
        let totalResponseBytes = 0;
        responseStream.on("data", function handleStreamData(chunk) {
          responseBuffer.push(chunk);
          totalResponseBytes += chunk.length;
          if (config.maxContentLength > -1 && totalResponseBytes > config.maxContentLength) {
            rejected = true;
            responseStream.destroy();
            reject(new AxiosError$1(
              "maxContentLength size of " + config.maxContentLength + " exceeded",
              AxiosError$1.ERR_BAD_RESPONSE,
              config,
              lastRequest
            ));
          }
        });
        responseStream.on("aborted", function handlerStreamAborted() {
          if (rejected) {
            return;
          }
          const err = new AxiosError$1(
            "stream has been aborted",
            AxiosError$1.ERR_BAD_RESPONSE,
            config,
            lastRequest
          );
          responseStream.destroy(err);
          reject(err);
        });
        responseStream.on("error", function handleStreamError(err) {
          if (req.destroyed) return;
          reject(AxiosError$1.from(err, null, config, lastRequest));
        });
        responseStream.on("end", function handleStreamEnd() {
          try {
            let responseData = responseBuffer.length === 1 ? responseBuffer[0] : Buffer.concat(responseBuffer);
            if (responseType !== "arraybuffer") {
              responseData = responseData.toString(responseEncoding);
              if (!responseEncoding || responseEncoding === "utf8") {
                responseData = utils$1.stripBOM(responseData);
              }
            }
            response.data = responseData;
          } catch (err) {
            return reject(AxiosError$1.from(err, null, config, response.request, response));
          }
          settle(resolve, reject, response);
        });
      }
      emitter.once("abort", (err) => {
        if (!responseStream.destroyed) {
          responseStream.emit("error", err);
          responseStream.destroy();
        }
      });
    });
    emitter.once("abort", (err) => {
      reject(err);
      req.destroy(err);
    });
    req.on("error", function handleRequestError(err) {
      reject(AxiosError$1.from(err, null, config, req));
    });
    req.on("socket", function handleRequestSocket(socket) {
      socket.setKeepAlive(true, 1e3 * 60);
    });
    if (config.timeout) {
      const timeout = parseInt(config.timeout, 10);
      if (Number.isNaN(timeout)) {
        reject(new AxiosError$1(
          "error trying to parse `config.timeout` to int",
          AxiosError$1.ERR_BAD_OPTION_VALUE,
          config,
          req
        ));
        return;
      }
      req.setTimeout(timeout, function handleRequestTimeout() {
        if (isDone) return;
        let timeoutErrorMessage = config.timeout ? "timeout of " + config.timeout + "ms exceeded" : "timeout exceeded";
        const transitional2 = config.transitional || transitionalDefaults;
        if (config.timeoutErrorMessage) {
          timeoutErrorMessage = config.timeoutErrorMessage;
        }
        reject(new AxiosError$1(
          timeoutErrorMessage,
          transitional2.clarifyTimeoutError ? AxiosError$1.ETIMEDOUT : AxiosError$1.ECONNABORTED,
          config,
          req
        ));
        abort();
      });
    }
    if (utils$1.isStream(data)) {
      let ended = false;
      let errored = false;
      data.on("end", () => {
        ended = true;
      });
      data.once("error", (err) => {
        errored = true;
        req.destroy(err);
      });
      data.on("close", () => {
        if (!ended && !errored) {
          abort(new CanceledError$1("Request stream has been aborted", config, req));
        }
      });
      data.pipe(req);
    } else {
      req.end(data);
    }
  });
};
const isURLSameOrigin = platform.hasStandardBrowserEnv ? /* @__PURE__ */ ((origin2, isMSIE) => (url) => {
  url = new URL(url, platform.origin);
  return origin2.protocol === url.protocol && origin2.host === url.host && (isMSIE || origin2.port === url.port);
})(
  new URL(platform.origin),
  platform.navigator && /(msie|trident)/i.test(platform.navigator.userAgent)
) : () => true;
const cookies = platform.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(name, value, expires, path, domain, secure) {
      const cookie = [name + "=" + encodeURIComponent(value)];
      utils$1.isNumber(expires) && cookie.push("expires=" + new Date(expires).toGMTString());
      utils$1.isString(path) && cookie.push("path=" + path);
      utils$1.isString(domain) && cookie.push("domain=" + domain);
      secure === true && cookie.push("secure");
      document.cookie = cookie.join("; ");
    },
    read(name) {
      const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
      return match ? decodeURIComponent(match[3]) : null;
    },
    remove(name) {
      this.write(name, "", Date.now() - 864e5);
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);
const headersToObject = (thing) => thing instanceof AxiosHeaders$1 ? { ...thing } : thing;
function mergeConfig$1(config1, config2) {
  config2 = config2 || {};
  const config = {};
  function getMergedValue(target, source, prop, caseless) {
    if (utils$1.isPlainObject(target) && utils$1.isPlainObject(source)) {
      return utils$1.merge.call({ caseless }, target, source);
    } else if (utils$1.isPlainObject(source)) {
      return utils$1.merge({}, source);
    } else if (utils$1.isArray(source)) {
      return source.slice();
    }
    return source;
  }
  function mergeDeepProperties(a, b, prop, caseless) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(a, b, prop, caseless);
    } else if (!utils$1.isUndefined(a)) {
      return getMergedValue(void 0, a, prop, caseless);
    }
  }
  function valueFromConfig2(a, b) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(void 0, b);
    }
  }
  function defaultToConfig2(a, b) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(void 0, b);
    } else if (!utils$1.isUndefined(a)) {
      return getMergedValue(void 0, a);
    }
  }
  function mergeDirectKeys(a, b, prop) {
    if (prop in config2) {
      return getMergedValue(a, b);
    } else if (prop in config1) {
      return getMergedValue(void 0, a);
    }
  }
  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a, b, prop) => mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true)
  };
  utils$1.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop) {
    const merge2 = mergeMap[prop] || mergeDeepProperties;
    const configValue = merge2(config1[prop], config2[prop], prop);
    utils$1.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config[prop] = configValue);
  });
  return config;
}
const resolveConfig = (config) => {
  const newConfig = mergeConfig$1({}, config);
  let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;
  newConfig.headers = headers = AxiosHeaders$1.from(headers);
  newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);
  if (auth) {
    headers.set(
      "Authorization",
      "Basic " + btoa((auth.username || "") + ":" + (auth.password ? unescape(encodeURIComponent(auth.password)) : ""))
    );
  }
  let contentType;
  if (utils$1.isFormData(data)) {
    if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) {
      headers.setContentType(void 0);
    } else if ((contentType = headers.getContentType()) !== false) {
      const [type2, ...tokens] = contentType ? contentType.split(";").map((token) => token.trim()).filter(Boolean) : [];
      headers.setContentType([type2 || "multipart/form-data", ...tokens].join("; "));
    }
  }
  if (platform.hasStandardBrowserEnv) {
    withXSRFToken && utils$1.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
    if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin(newConfig.url)) {
      const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies.read(xsrfCookieName);
      if (xsrfValue) {
        headers.set(xsrfHeaderName, xsrfValue);
      }
    }
  }
  return newConfig;
};
const isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
const xhrAdapter = isXHRAdapterSupported && function(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    const _config = resolveConfig(config);
    let requestData = _config.data;
    const requestHeaders = AxiosHeaders$1.from(_config.headers).normalize();
    let { responseType, onUploadProgress, onDownloadProgress } = _config;
    let onCanceled;
    let uploadThrottled, downloadThrottled;
    let flushUpload, flushDownload;
    function done() {
      flushUpload && flushUpload();
      flushDownload && flushDownload();
      _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
      _config.signal && _config.signal.removeEventListener("abort", onCanceled);
    }
    let request = new XMLHttpRequest();
    request.open(_config.method.toUpperCase(), _config.url, true);
    request.timeout = _config.timeout;
    function onloadend() {
      if (!request) {
        return;
      }
      const responseHeaders = AxiosHeaders$1.from(
        "getAllResponseHeaders" in request && request.getAllResponseHeaders()
      );
      const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      };
      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);
      request = null;
    }
    if ("onloadend" in request) {
      request.onloadend = onloadend;
    } else {
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
          return;
        }
        setTimeout(onloadend);
      };
    }
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }
      reject(new AxiosError$1("Request aborted", AxiosError$1.ECONNABORTED, config, request));
      request = null;
    };
    request.onerror = function handleError() {
      reject(new AxiosError$1("Network Error", AxiosError$1.ERR_NETWORK, config, request));
      request = null;
    };
    request.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
      const transitional2 = _config.transitional || transitionalDefaults;
      if (_config.timeoutErrorMessage) {
        timeoutErrorMessage = _config.timeoutErrorMessage;
      }
      reject(new AxiosError$1(
        timeoutErrorMessage,
        transitional2.clarifyTimeoutError ? AxiosError$1.ETIMEDOUT : AxiosError$1.ECONNABORTED,
        config,
        request
      ));
      request = null;
    };
    requestData === void 0 && requestHeaders.setContentType(null);
    if ("setRequestHeader" in request) {
      utils$1.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
        request.setRequestHeader(key, val);
      });
    }
    if (!utils$1.isUndefined(_config.withCredentials)) {
      request.withCredentials = !!_config.withCredentials;
    }
    if (responseType && responseType !== "json") {
      request.responseType = _config.responseType;
    }
    if (onDownloadProgress) {
      [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
      request.addEventListener("progress", downloadThrottled);
    }
    if (onUploadProgress && request.upload) {
      [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
      request.upload.addEventListener("progress", uploadThrottled);
      request.upload.addEventListener("loadend", flushUpload);
    }
    if (_config.cancelToken || _config.signal) {
      onCanceled = (cancel) => {
        if (!request) {
          return;
        }
        reject(!cancel || cancel.type ? new CanceledError$1(null, config, request) : cancel);
        request.abort();
        request = null;
      };
      _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
      if (_config.signal) {
        _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
      }
    }
    const protocol = parseProtocol(_config.url);
    if (protocol && platform.protocols.indexOf(protocol) === -1) {
      reject(new AxiosError$1("Unsupported protocol " + protocol + ":", AxiosError$1.ERR_BAD_REQUEST, config));
      return;
    }
    request.send(requestData || null);
  });
};
const composeSignals = (signals, timeout) => {
  const { length } = signals = signals ? signals.filter(Boolean) : [];
  if (timeout || length) {
    let controller = new AbortController();
    let aborted;
    const onabort = function(reason) {
      if (!aborted) {
        aborted = true;
        unsubscribe();
        const err = reason instanceof Error ? reason : this.reason;
        controller.abort(err instanceof AxiosError$1 ? err : new CanceledError$1(err instanceof Error ? err.message : err));
      }
    };
    let timer = timeout && setTimeout(() => {
      timer = null;
      onabort(new AxiosError$1(`timeout ${timeout} of ms exceeded`, AxiosError$1.ETIMEDOUT));
    }, timeout);
    const unsubscribe = () => {
      if (signals) {
        timer && clearTimeout(timer);
        timer = null;
        signals.forEach((signal2) => {
          signal2.unsubscribe ? signal2.unsubscribe(onabort) : signal2.removeEventListener("abort", onabort);
        });
        signals = null;
      }
    };
    signals.forEach((signal2) => signal2.addEventListener("abort", onabort));
    const { signal } = controller;
    signal.unsubscribe = () => utils$1.asap(unsubscribe);
    return signal;
  }
};
const streamChunk = function* (chunk, chunkSize) {
  let len = chunk.byteLength;
  if (len < chunkSize) {
    yield chunk;
    return;
  }
  let pos = 0;
  let end;
  while (pos < len) {
    end = pos + chunkSize;
    yield chunk.slice(pos, end);
    pos = end;
  }
};
const readBytes = async function* (iterable, chunkSize) {
  for await (const chunk of readStream(iterable)) {
    yield* streamChunk(chunk, chunkSize);
  }
};
const readStream = async function* (stream2) {
  if (stream2[Symbol.asyncIterator]) {
    yield* stream2;
    return;
  }
  const reader = stream2.getReader();
  try {
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
  } finally {
    await reader.cancel();
  }
};
const trackStream = (stream2, chunkSize, onProgress, onFinish) => {
  const iterator2 = readBytes(stream2, chunkSize);
  let bytes = 0;
  let done;
  let _onFinish = (e) => {
    if (!done) {
      done = true;
      onFinish && onFinish(e);
    }
  };
  return new ReadableStream({
    async pull(controller) {
      try {
        const { done: done2, value } = await iterator2.next();
        if (done2) {
          _onFinish();
          controller.close();
          return;
        }
        let len = value.byteLength;
        if (onProgress) {
          let loadedBytes = bytes += len;
          onProgress(loadedBytes);
        }
        controller.enqueue(new Uint8Array(value));
      } catch (err) {
        _onFinish(err);
        throw err;
      }
    },
    cancel(reason) {
      _onFinish(reason);
      return iterator2.return();
    }
  }, {
    highWaterMark: 2
  });
};
const isFetchSupported = typeof fetch === "function" && typeof Request === "function" && typeof Response === "function";
const isReadableStreamSupported = isFetchSupported && typeof ReadableStream === "function";
const encodeText = isFetchSupported && (typeof TextEncoder === "function" ? /* @__PURE__ */ ((encoder) => (str) => encoder.encode(str))(new TextEncoder()) : async (str) => new Uint8Array(await new Response(str).arrayBuffer()));
const test = (fn, ...args) => {
  try {
    return !!fn(...args);
  } catch (e) {
    return false;
  }
};
const supportsRequestStream = isReadableStreamSupported && test(() => {
  let duplexAccessed = false;
  const hasContentType = new Request(platform.origin, {
    body: new ReadableStream(),
    method: "POST",
    get duplex() {
      duplexAccessed = true;
      return "half";
    }
  }).headers.has("Content-Type");
  return duplexAccessed && !hasContentType;
});
const DEFAULT_CHUNK_SIZE = 64 * 1024;
const supportsResponseStream = isReadableStreamSupported && test(() => utils$1.isReadableStream(new Response("").body));
const resolvers = {
  stream: supportsResponseStream && ((res) => res.body)
};
isFetchSupported && ((res) => {
  ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((type2) => {
    !resolvers[type2] && (resolvers[type2] = utils$1.isFunction(res[type2]) ? (res2) => res2[type2]() : (_, config) => {
      throw new AxiosError$1(`Response type '${type2}' is not supported`, AxiosError$1.ERR_NOT_SUPPORT, config);
    });
  });
})(new Response());
const getBodyLength = async (body) => {
  if (body == null) {
    return 0;
  }
  if (utils$1.isBlob(body)) {
    return body.size;
  }
  if (utils$1.isSpecCompliantForm(body)) {
    const _request = new Request(platform.origin, {
      method: "POST",
      body
    });
    return (await _request.arrayBuffer()).byteLength;
  }
  if (utils$1.isArrayBufferView(body) || utils$1.isArrayBuffer(body)) {
    return body.byteLength;
  }
  if (utils$1.isURLSearchParams(body)) {
    body = body + "";
  }
  if (utils$1.isString(body)) {
    return (await encodeText(body)).byteLength;
  }
};
const resolveBodyLength = async (headers, body) => {
  const length = utils$1.toFiniteNumber(headers.getContentLength());
  return length == null ? getBodyLength(body) : length;
};
const fetchAdapter = isFetchSupported && (async (config) => {
  let {
    url,
    method,
    data,
    signal,
    cancelToken,
    timeout,
    onDownloadProgress,
    onUploadProgress,
    responseType,
    headers,
    withCredentials = "same-origin",
    fetchOptions
  } = resolveConfig(config);
  responseType = responseType ? (responseType + "").toLowerCase() : "text";
  let composedSignal = composeSignals([signal, cancelToken && cancelToken.toAbortSignal()], timeout);
  let request;
  const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
    composedSignal.unsubscribe();
  });
  let requestContentLength;
  try {
    if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = await resolveBodyLength(headers, data)) !== 0) {
      let _request = new Request(url, {
        method: "POST",
        body: data,
        duplex: "half"
      });
      let contentTypeHeader;
      if (utils$1.isFormData(data) && (contentTypeHeader = _request.headers.get("content-type"))) {
        headers.setContentType(contentTypeHeader);
      }
      if (_request.body) {
        const [onProgress, flush] = progressEventDecorator(
          requestContentLength,
          progressEventReducer(asyncDecorator(onUploadProgress))
        );
        data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
      }
    }
    if (!utils$1.isString(withCredentials)) {
      withCredentials = withCredentials ? "include" : "omit";
    }
    const isCredentialsSupported = "credentials" in Request.prototype;
    request = new Request(url, {
      ...fetchOptions,
      signal: composedSignal,
      method: method.toUpperCase(),
      headers: headers.normalize().toJSON(),
      body: data,
      duplex: "half",
      credentials: isCredentialsSupported ? withCredentials : void 0
    });
    let response = await fetch(request, fetchOptions);
    const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
    if (supportsResponseStream && (onDownloadProgress || isStreamResponse && unsubscribe)) {
      const options = {};
      ["status", "statusText", "headers"].forEach((prop) => {
        options[prop] = response[prop];
      });
      const responseContentLength = utils$1.toFiniteNumber(response.headers.get("content-length"));
      const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
        responseContentLength,
        progressEventReducer(asyncDecorator(onDownloadProgress), true)
      ) || [];
      response = new Response(
        trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
          flush && flush();
          unsubscribe && unsubscribe();
        }),
        options
      );
    }
    responseType = responseType || "text";
    let responseData = await resolvers[utils$1.findKey(resolvers, responseType) || "text"](response, config);
    !isStreamResponse && unsubscribe && unsubscribe();
    return await new Promise((resolve, reject) => {
      settle(resolve, reject, {
        data: responseData,
        headers: AxiosHeaders$1.from(response.headers),
        status: response.status,
        statusText: response.statusText,
        config,
        request
      });
    });
  } catch (err) {
    unsubscribe && unsubscribe();
    if (err && err.name === "TypeError" && /Load failed|fetch/i.test(err.message)) {
      throw Object.assign(
        new AxiosError$1("Network Error", AxiosError$1.ERR_NETWORK, config, request),
        {
          cause: err.cause || err
        }
      );
    }
    throw AxiosError$1.from(err, err && err.code, config, request);
  }
});
const knownAdapters = {
  http: httpAdapter,
  xhr: xhrAdapter,
  fetch: fetchAdapter
};
utils$1.forEach(knownAdapters, (fn, value) => {
  if (fn) {
    try {
      Object.defineProperty(fn, "name", { value });
    } catch (e) {
    }
    Object.defineProperty(fn, "adapterName", { value });
  }
});
const renderReason = (reason) => `- ${reason}`;
const isResolvedHandle = (adapter) => utils$1.isFunction(adapter) || adapter === null || adapter === false;
const adapters = {
  getAdapter: (adapters2) => {
    adapters2 = utils$1.isArray(adapters2) ? adapters2 : [adapters2];
    const { length } = adapters2;
    let nameOrAdapter;
    let adapter;
    const rejectedReasons = {};
    for (let i = 0; i < length; i++) {
      nameOrAdapter = adapters2[i];
      let id;
      adapter = nameOrAdapter;
      if (!isResolvedHandle(nameOrAdapter)) {
        adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
        if (adapter === void 0) {
          throw new AxiosError$1(`Unknown adapter '${id}'`);
        }
      }
      if (adapter) {
        break;
      }
      rejectedReasons[id || "#" + i] = adapter;
    }
    if (!adapter) {
      const reasons = Object.entries(rejectedReasons).map(
        ([id, state]) => `adapter ${id} ` + (state === false ? "is not supported by the environment" : "is not available in the build")
      );
      let s = length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified";
      throw new AxiosError$1(
        `There is no suitable adapter to dispatch the request ` + s,
        "ERR_NOT_SUPPORT"
      );
    }
    return adapter;
  },
  adapters: knownAdapters
};
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
  if (config.signal && config.signal.aborted) {
    throw new CanceledError$1(null, config);
  }
}
function dispatchRequest(config) {
  throwIfCancellationRequested(config);
  config.headers = AxiosHeaders$1.from(config.headers);
  config.data = transformData.call(
    config,
    config.transformRequest
  );
  if (["post", "put", "patch"].indexOf(config.method) !== -1) {
    config.headers.setContentType("application/x-www-form-urlencoded", false);
  }
  const adapter = adapters.getAdapter(config.adapter || defaults.adapter);
  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);
    response.data = transformData.call(
      config,
      config.transformResponse,
      response
    );
    response.headers = AxiosHeaders$1.from(response.headers);
    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel$1(reason)) {
      throwIfCancellationRequested(config);
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          config.transformResponse,
          reason.response
        );
        reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
      }
    }
    return Promise.reject(reason);
  });
}
const validators$1 = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((type2, i) => {
  validators$1[type2] = function validator2(thing) {
    return typeof thing === type2 || "a" + (i < 1 ? "n " : " ") + type2;
  };
});
const deprecatedWarnings = {};
validators$1.transitional = function transitional(validator2, version, message) {
  function formatMessage(opt, desc) {
    return "[Axios v" + VERSION$1 + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
  }
  return (value, opt, opts) => {
    if (validator2 === false) {
      throw new AxiosError$1(
        formatMessage(opt, " has been removed" + (version ? " in " + version : "")),
        AxiosError$1.ERR_DEPRECATED
      );
    }
    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      console.warn(
        formatMessage(
          opt,
          " has been deprecated since v" + version + " and will be removed in the near future"
        )
      );
    }
    return validator2 ? validator2(value, opt, opts) : true;
  };
};
validators$1.spelling = function spelling(correctSpelling) {
  return (value, opt) => {
    console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
    return true;
  };
};
function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== "object") {
    throw new AxiosError$1("options must be an object", AxiosError$1.ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i = keys.length;
  while (i-- > 0) {
    const opt = keys[i];
    const validator2 = schema[opt];
    if (validator2) {
      const value = options[opt];
      const result = value === void 0 || validator2(value, opt, options);
      if (result !== true) {
        throw new AxiosError$1("option " + opt + " must be " + result, AxiosError$1.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError$1("Unknown option " + opt, AxiosError$1.ERR_BAD_OPTION);
    }
  }
}
const validator = {
  assertOptions,
  validators: validators$1
};
const validators = validator.validators;
let Axios$1 = class Axios {
  constructor(instanceConfig) {
    this.defaults = instanceConfig || {};
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(configOrUrl, config) {
    try {
      return await this._request(configOrUrl, config);
    } catch (err) {
      if (err instanceof Error) {
        let dummy = {};
        Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error();
        const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, "") : "";
        try {
          if (!err.stack) {
            err.stack = stack;
          } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ""))) {
            err.stack += "\n" + stack;
          }
        } catch (e) {
        }
      }
      throw err;
    }
  }
  _request(configOrUrl, config) {
    if (typeof configOrUrl === "string") {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }
    config = mergeConfig$1(this.defaults, config);
    const { transitional: transitional2, paramsSerializer, headers } = config;
    if (transitional2 !== void 0) {
      validator.assertOptions(transitional2, {
        silentJSONParsing: validators.transitional(validators.boolean),
        forcedJSONParsing: validators.transitional(validators.boolean),
        clarifyTimeoutError: validators.transitional(validators.boolean)
      }, false);
    }
    if (paramsSerializer != null) {
      if (utils$1.isFunction(paramsSerializer)) {
        config.paramsSerializer = {
          serialize: paramsSerializer
        };
      } else {
        validator.assertOptions(paramsSerializer, {
          encode: validators.function,
          serialize: validators.function
        }, true);
      }
    }
    if (config.allowAbsoluteUrls !== void 0) ;
    else if (this.defaults.allowAbsoluteUrls !== void 0) {
      config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
    } else {
      config.allowAbsoluteUrls = true;
    }
    validator.assertOptions(config, {
      baseUrl: validators.spelling("baseURL"),
      withXsrfToken: validators.spelling("withXSRFToken")
    }, true);
    config.method = (config.method || this.defaults.method || "get").toLowerCase();
    let contextHeaders = headers && utils$1.merge(
      headers.common,
      headers[config.method]
    );
    headers && utils$1.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (method) => {
        delete headers[method];
      }
    );
    config.headers = AxiosHeaders$1.concat(contextHeaders, headers);
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
        return;
      }
      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });
    let promise;
    let i = 0;
    let len;
    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), void 0];
      chain.unshift(...requestInterceptorChain);
      chain.push(...responseInterceptorChain);
      len = chain.length;
      promise = Promise.resolve(config);
      while (i < len) {
        promise = promise.then(chain[i++], chain[i++]);
      }
      return promise;
    }
    len = requestInterceptorChain.length;
    let newConfig = config;
    i = 0;
    while (i < len) {
      const onFulfilled = requestInterceptorChain[i++];
      const onRejected = requestInterceptorChain[i++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }
    try {
      promise = dispatchRequest.call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }
    i = 0;
    len = responseInterceptorChain.length;
    while (i < len) {
      promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
    }
    return promise;
  }
  getUri(config) {
    config = mergeConfig$1(this.defaults, config);
    const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
    return buildURL(fullPath, config.params, config.paramsSerializer);
  }
};
utils$1.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
  Axios$1.prototype[method] = function(url, config) {
    return this.request(mergeConfig$1(config || {}, {
      method,
      url,
      data: (config || {}).data
    }));
  };
});
utils$1.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config) {
      return this.request(mergeConfig$1(config || {}, {
        method,
        headers: isForm ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url,
        data
      }));
    };
  }
  Axios$1.prototype[method] = generateHTTPMethod();
  Axios$1.prototype[method + "Form"] = generateHTTPMethod(true);
});
let CancelToken$1 = class CancelToken {
  constructor(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("executor must be a function.");
    }
    let resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });
    const token = this;
    this.promise.then((cancel) => {
      if (!token._listeners) return;
      let i = token._listeners.length;
      while (i-- > 0) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });
    this.promise.then = (onfulfilled) => {
      let _resolve;
      const promise = new Promise((resolve) => {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);
      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };
      return promise;
    };
    executor(function cancel(message, config, request) {
      if (token.reason) {
        return;
      }
      token.reason = new CanceledError$1(message, config, request);
      resolvePromise(token.reason);
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }
    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }
  toAbortSignal() {
    const controller = new AbortController();
    const abort = (err) => {
      controller.abort(err);
    };
    this.subscribe(abort);
    controller.signal.unsubscribe = () => this.unsubscribe(abort);
    return controller.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let cancel;
    const token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token,
      cancel
    };
  }
};
function spread$1(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
}
function isAxiosError$1(payload) {
  return utils$1.isObject(payload) && payload.isAxiosError === true;
}
const HttpStatusCode$1 = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511
};
Object.entries(HttpStatusCode$1).forEach(([key, value]) => {
  HttpStatusCode$1[value] = key;
});
function createInstance(defaultConfig) {
  const context = new Axios$1(defaultConfig);
  const instance = bind(Axios$1.prototype.request, context);
  utils$1.extend(instance, Axios$1.prototype, context, { allOwnKeys: true });
  utils$1.extend(instance, context, null, { allOwnKeys: true });
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig$1(defaultConfig, instanceConfig));
  };
  return instance;
}
const axios = createInstance(defaults);
axios.Axios = Axios$1;
axios.CanceledError = CanceledError$1;
axios.CancelToken = CancelToken$1;
axios.isCancel = isCancel$1;
axios.VERSION = VERSION$1;
axios.toFormData = toFormData$1;
axios.AxiosError = AxiosError$1;
axios.Cancel = axios.CanceledError;
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = spread$1;
axios.isAxiosError = isAxiosError$1;
axios.mergeConfig = mergeConfig$1;
axios.AxiosHeaders = AxiosHeaders$1;
axios.formToJSON = (thing) => formDataToJSON(utils$1.isHTMLForm(thing) ? new FormData(thing) : thing);
axios.getAdapter = adapters.getAdapter;
axios.HttpStatusCode = HttpStatusCode$1;
axios.default = axios;
const {
  Axios: Axios2,
  AxiosError,
  CanceledError,
  isCancel,
  CancelToken: CancelToken2,
  VERSION,
  all: all2,
  Cancel,
  isAxiosError,
  spread,
  toFormData,
  AxiosHeaders: AxiosHeaders2,
  HttpStatusCode,
  formToJSON,
  getAdapter,
  mergeConfig
} = axios;
const DEVICE_ID_KEY = "purefumes:device-id";
const readStoredValue = (key) => {
  if (typeof window === "undefined") return "";
  try {
    return String(window.localStorage.getItem(key) || "");
  } catch (_error) {
    return "";
  }
};
const writeStoredValue = (key, value) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch (_error) {
  }
};
const getDeviceId = () => {
  const existing = readStoredValue(DEVICE_ID_KEY);
  if (existing) return existing;
  const nextId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  writeStoredValue(DEVICE_ID_KEY, nextId);
  return nextId;
};
const getDeviceName = () => {
  if (typeof navigator === "undefined") return "server";
  const userAgentData = "userAgentData" in navigator ? navigator.userAgentData : void 0;
  const uaPlatform = userAgentData?.platform || navigator.platform;
  const platform2 = String(uaPlatform || "browser").trim();
  return `${platform2}:${navigator.userAgent}`.slice(0, 160);
};
const AUTH_REFRESH_LOCK_NAME = "purefumes-auth-refresh";
const AUTH_REFRESH_LOCK_KEY = "purefumes:auth-refresh-lock";
const AUTH_REFRESH_LAST_SUCCESS_KEY = "purefumes:auth-refresh-last-success";
const AUTH_REFRESH_LOCK_TTL_MS = 1e4;
const AUTH_REFRESH_RECENT_SUCCESS_MS = 1500;
const AUTH_REFRESH_LOCK_POLL_MS = 120;
const AUTH_REFRESH_FAILURE_BACKOFF_MS = 15e3;
const apiBaseUrl = runtimeConfig.apiUrl.replace(/\/$/, "");
const authBaseUrl = runtimeConfig.authUrl.replace(/\/$/, "");
const client = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15e3,
  withCredentials: true,
  headers: {
    Accept: "application/json"
  }
});
const inflightRequests = /* @__PURE__ */ new Map();
let refreshPromise = null;
let refreshBackoffUntilMs = 0;
const isOffline$1 = () => typeof navigator !== "undefined" && navigator.onLine === false;
const normalizeError = (error) => {
  if (axios.isAxiosError(error)) {
    const apiMessage = error.response?.data && typeof error.response.data === "object" && "message" in error.response.data ? String(error.response.data.message || "") : "";
    const normalized = new Error(apiMessage || error.message || "Request failed");
    normalized.status = error.response?.status;
    return normalized;
  }
  return error instanceof Error ? error : new Error("Request failed");
};
const readStorageNumber = (key) => {
  if (typeof window === "undefined") return 0;
  try {
    return Number(window.localStorage.getItem(key) || 0) || 0;
  } catch (_error) {
    return 0;
  }
};
const writeStorageNumber = (key, value) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, String(value));
  } catch (_error) {
  }
};
const delay = (ms2) => new Promise((resolve) => window.setTimeout(resolve, ms2));
const markAuthRefreshSucceeded = () => {
  writeStorageNumber(AUTH_REFRESH_LAST_SUCCESS_KEY, Date.now());
};
const wasAuthRefreshRecentlyCompleted = (startedAt) => {
  const lastSuccessAt = readStorageNumber(AUTH_REFRESH_LAST_SUCCESS_KEY);
  return lastSuccessAt >= startedAt || lastSuccessAt > 0 && Date.now() - lastSuccessAt <= AUTH_REFRESH_RECENT_SUCCESS_MS;
};
const createLockId = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const tryAcquireStorageRefreshLock = (lockId) => {
  if (typeof window === "undefined") return true;
  try {
    const now = Date.now();
    const current = JSON.parse(window.localStorage.getItem(AUTH_REFRESH_LOCK_KEY) || "null");
    if (current?.expiresAt && current.expiresAt > now && current.id !== lockId) {
      return false;
    }
    window.localStorage.setItem(
      AUTH_REFRESH_LOCK_KEY,
      JSON.stringify({ id: lockId, expiresAt: now + AUTH_REFRESH_LOCK_TTL_MS })
    );
    const next = JSON.parse(window.localStorage.getItem(AUTH_REFRESH_LOCK_KEY) || "null");
    return next?.id === lockId;
  } catch (_error) {
    return true;
  }
};
const releaseStorageRefreshLock = (lockId) => {
  if (typeof window === "undefined") return;
  try {
    const current = JSON.parse(window.localStorage.getItem(AUTH_REFRESH_LOCK_KEY) || "null");
    if (current?.id === lockId) {
      window.localStorage.removeItem(AUTH_REFRESH_LOCK_KEY);
    }
  } catch (_error) {
  }
};
const runWithStorageRefreshLock = async (action) => {
  const lockId = createLockId();
  const deadline = Date.now() + AUTH_REFRESH_LOCK_TTL_MS + 2e3;
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
const runWithRefreshLock = async (action) => {
  const lockManager = typeof navigator !== "undefined" ? navigator.locks : void 0;
  if (lockManager?.request) {
    return lockManager.request(AUTH_REFRESH_LOCK_NAME, action);
  }
  return runWithStorageRefreshLock(action);
};
const getRequestPath = (url) => {
  try {
    return new URL(url, apiBaseUrl || "https://local.invalid").pathname;
  } catch (_error) {
    return url.split("?")[0];
  }
};
const ADMIN_SESSION_PATHS = /* @__PURE__ */ new Set([
  "/auth/me",
  "/payments/settings",
  "/orders"
]);
const ADMIN_SESSION_PREFIXES = [
  "/admin",
  "/analytics",
  "/products",
  "/categories",
  "/brands",
  "/coupons",
  "/banners",
  "/perfume-requests"
];
const isAdminSessionRequest = (url) => {
  const path = getRequestPath(url);
  return ADMIN_SESSION_PATHS.has(path) || ADMIN_SESSION_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)) || path.startsWith("/orders/unseen") || /^\/orders\/[^/]+(?:\/seen)?$/.test(path);
};
const shouldAttemptRefresh = (url) => isAdminSessionRequest(url) && Date.now() >= refreshBackoffUntilMs && getRequestPath(url) !== "/auth/login" && getRequestPath(url) !== "/auth/refresh";
const isPermissionError = (error) => {
  const message = error.response?.data && typeof error.response.data === "object" && "message" in error.response.data ? String(error.response.data.message || "") : "";
  return error.response?.status === 403 && message.toLowerCase().includes("permission");
};
const refreshAuthSession = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }
  const startedAt = Date.now();
  refreshPromise = runWithRefreshLock(async () => {
    if (wasAuthRefreshRecentlyCompleted(startedAt)) {
      return true;
    }
    if (isOffline$1()) {
      return false;
    }
    try {
      await client.post(
        `${authBaseUrl}/refresh`,
        void 0,
        {
          baseURL: "",
          skipAuthRefresh: true,
          timeout: 1e4
        }
      );
      refreshBackoffUntilMs = 0;
      markAuthRefreshSucceeded();
      return true;
    } catch (error) {
      const axiosError = error;
      if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
        refreshBackoffUntilMs = Date.now() + AUTH_REFRESH_FAILURE_BACKOFF_MS;
      }
      captureFrontendMessage("Authentication refresh failed", "warning", {
        source: "axios.refresh",
        status: axiosError.response?.status || 0
      });
      return false;
    }
  }).finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
};
client.interceptors.request.use((config) => {
  if (isOffline$1()) {
    return Promise.reject(new Error("You appear to be offline. Please reconnect and try again."));
  }
  const headers = AxiosHeaders2.from(config.headers ?? {});
  headers.set("X-Device-Id", getDeviceId());
  headers.set("X-Device-Name", getDeviceName());
  const method = String(config.method || "get").toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && !headers.has("Idempotency-Key")) {
    headers.set(
      "Idempotency-Key",
      typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
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
  async (error) => {
    const config = error.config || {};
    const normalizedUrl = String(config.url || "");
    const shouldRefreshStatus = error.response?.status === 401 || isPermissionError(error);
    if (shouldRefreshStatus && !config.skipAuthRefresh && !config._retry && shouldAttemptRefresh(normalizedUrl)) {
      config._retry = true;
      const refreshed = await refreshAuthSession();
      if (refreshed) {
        return client.request(config);
      }
      const sessionExpired = new Error("Session expired. Please sign in again.");
      sessionExpired.status = 401;
      captureFrontendException(sessionExpired, {
        source: "axios.response",
        path: normalizedUrl,
        status: error.response?.status || 0
      });
      throw sessionExpired;
    }
    const normalized = normalizeError(error);
    captureFrontendException(normalized, {
      source: "axios.response",
      path: normalizedUrl,
      status: error.response?.status || 0
    });
    throw normalized;
  }
);
const buildDedupeKey = (config) => [
  String(config.method || "get").toUpperCase(),
  String(config.url || ""),
  JSON.stringify(config.params || {}),
  typeof config.data === "string" ? config.data : JSON.stringify(config.data || {})
].join("::");
const unwrapEnvelope = (response) => {
  const payload = response.data;
  if (payload && typeof payload === "object" && "success" in payload) {
    const envelope = payload;
    if (envelope.success === false) {
      throw new Error(envelope.message || "Request failed");
    }
    return envelope.data;
  }
  return payload;
};
const requestJson = async (config) => {
  const method = String(config.method || "GET").toUpperCase();
  const dedupeEligible = method === "GET" || Boolean(config.dedupeKey);
  const dedupeKey = config.dedupeKey || buildDedupeKey(config);
  if (dedupeEligible) {
    const existing = inflightRequests.get(dedupeKey);
    if (existing) {
      return existing;
    }
  }
  const request = client.request(config).then((response) => unwrapEnvelope(response)).catch((error) => {
    throw normalizeError(error);
  }).finally(() => {
    inflightRequests.delete(dedupeKey);
  });
  if (dedupeEligible) {
    inflightRequests.set(dedupeKey, request);
  }
  return request;
};
const uploadMultipart = async (url, formData, config) => requestJson({
  ...config,
  url,
  data: formData,
  onUploadProgress(event) {
    if (typeof config.onUploadProgress === "function" && event.total) {
      config.onUploadProgress(Math.round(event.loaded / event.total * 100));
    }
  }
});
const clearHttpClientState = () => {
  inflightRequests.clear();
  refreshBackoffUntilMs = 0;
};
class EventBus {
  listeners = {};
  subscribe(eventName, listener) {
    const listeners2 = this.listeners[eventName] ||= /* @__PURE__ */ new Set();
    listeners2.add(listener);
    return () => {
      listeners2.delete(listener);
    };
  }
  publish(eventName, payload) {
    const listeners2 = this.listeners[eventName];
    if (!listeners2?.size) return;
    queueMicrotask(() => {
      listeners2.forEach((listener) => listener(payload));
    });
  }
  clear() {
    Object.values(this.listeners).forEach((listeners2) => listeners2?.clear());
  }
}
const frontendEventBus = new EventBus();
const frontendMediator = {
  publishCatalogChanged(scope) {
    frontendEventBus.publish("catalog:changed", { scope });
  },
  requestDashboardRefresh({
    reason,
    silent = true,
    refresh,
    cooldownMs = 900
  }) {
    frontendEventBus.publish("dashboard:refresh-requested", { reason, silent });
    return apiTrafficProxy.runExclusive({
      key: `dashboard:${reason}`,
      cooldownMs,
      action: refresh
    }).then((value) => {
      frontendEventBus.publish("dashboard:changed", {
        at: Date.now(),
        reason
      });
      return value;
    });
  },
  subscribeDashboardRefresh(listener) {
    return frontendEventBus.subscribe("dashboard:refresh-requested", listener);
  }
};
const cloudinaryBase = "https://res.cloudinary.com/dwddixz5b/image/upload";
const fastProductTransform = "f_auto,q_auto,w_520";
const cloudinaryStaticImages = {
  products: {
    pourHomme: `${cloudinaryBase}/${fastProductTransform}/v1779181846/pour_homme_urbcyu.webp`,
    ninePm: `${cloudinaryBase}/${fastProductTransform}/v1779181847/9pm_ukaiv4.jpg`,
    kingdomMan: `${cloudinaryBase}/${fastProductTransform}/v1779181847/the_kingdom_man_xozmpr.jpg`
  }
};
const normalizeKey = (value = "") => String(value).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, "-");
const productImageOverrides = [
  {
    match: ["9pm", "9-pm", "afnan-9pm", "afnan-9-pm"],
    image: cloudinaryStaticImages.products.ninePm,
    images: [cloudinaryStaticImages.products.ninePm]
  },
  {
    match: ["pour-homme", "pour-homme-edt", "versace-pour-homme"],
    image: cloudinaryStaticImages.products.pourHomme,
    images: [cloudinaryStaticImages.products.pourHomme]
  },
  {
    match: ["the-kingdom-man", "kingdom-man", "lattafa-the-kingdom-man"],
    image: cloudinaryStaticImages.products.kingdomMan,
    images: [cloudinaryStaticImages.products.kingdomMan]
  }
];
const createFallbackProduct = ({
  id,
  name,
  brand,
  price,
  image
}) => ({
  id,
  name,
  brand,
  brandId: null,
  brandDetails: null,
  categories: [],
  categoryIds: [],
  categoryNames: [],
  categorySlugs: [],
  primaryCategory: null,
  category: "Featured",
  categoryId: null,
  categorySlug: "featured",
  categoryDetails: null,
  price,
  gender: "Men",
  rating: 0,
  reviewCount: 0,
  reviewsCount: 0,
  image,
  images: [image],
  description: "",
  notes: [],
  topNotes: [],
  middleNotes: [],
  baseNotes: [],
  accords: [],
  sillage: "",
  usage: "Day & Night",
  timeOfDay: "Day & Night",
  bestTime: ["Day", "Night"],
  season: ["Spring", "Summer", "Autumn", "Winter"],
  seasons: ["Spring", "Summer", "Autumn", "Winter"],
  sizes: [{ size: "Standard", price }],
  stock: 1,
  isBestseller: true,
  isLatest: true,
  bestsellerOrder: 0,
  displayOrder: 0
});
const storefrontFallbackProducts = [
  createFallbackProduct({
    id: "fallback-kingdom-man",
    name: "THE KINGDOM MAN",
    brand: "LATTAFA",
    price: 2626,
    image: cloudinaryStaticImages.products.kingdomMan
  }),
  createFallbackProduct({
    id: "fallback-pour-homme-edt",
    name: "pour homme edt",
    brand: "AZZARO",
    price: 7299,
    image: cloudinaryStaticImages.products.pourHomme
  }),
  createFallbackProduct({
    id: "fallback-9pm",
    name: "9 pm",
    brand: "ARD AL ZAAFARAN",
    price: 8678,
    image: cloudinaryStaticImages.products.ninePm
  })
];
const applyProductImageOverride = (product) => {
  const productImages = (product.images || []).filter(Boolean);
  if (productImages.length || product.image) {
    return {
      ...product,
      images: productImages.length ? productImages : product.image ? [product.image] : []
    };
  }
  const productKeys = [
    normalizeKey(product.name),
    normalizeKey(product.brand ? `${product.brand} ${product.name}` : product.name)
  ];
  const override = productImageOverrides.find(
    ({ match }) => productKeys.some(
      (key) => match.some((candidate) => key === candidate || key.includes(candidate))
    )
  );
  if (!override) {
    return product;
  }
  return {
    ...product,
    image: override.image,
    images: override.images
  };
};
const toFiniteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};
const toPaise = (value) => Math.round((toFiniteNumber(value) + Number.EPSILON) * 100);
const addMoney = (...values) => values.reduce((sum, value) => sum + toPaise(value), 0) / 100;
const subtractMoney = (left, right) => (toPaise(left) - toPaise(right)) / 100;
const multiplyMoney = (value, multiplier) => Math.round(toPaise(value) * toFiniteNumber(multiplier)) / 100;
const normalizeMoney = (value) => Math.max(0, toPaise(value) / 100);
const formatINR = (value) => {
  const amount = normalizeMoney(value);
  return `₹${amount.toLocaleString("en-IN", {
    useGrouping: false,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2
  })}`;
};
const SHIPPING_THRESHOLD = 2499;
const SHIPPING_CHARGE = 100;
const calculateShippingCharge = (subtotal) => normalizeMoney(subtotal) < SHIPPING_THRESHOLD ? SHIPPING_CHARGE : 0;
const calculateCheckoutTotals = ({
  subtotal,
  discount = 0
}) => {
  const normalizedSubtotal = normalizeMoney(subtotal);
  const shippingCharge = calculateShippingCharge(normalizedSubtotal);
  const totalBeforeDiscount = normalizeMoney(addMoney(normalizedSubtotal, shippingCharge));
  const discountAmount = normalizeMoney(Math.min(normalizeMoney(discount), normalizedSubtotal));
  const totalAfterProductDiscount = normalizeMoney(subtractMoney(normalizedSubtotal, discountAmount));
  const finalPayable = normalizeMoney(addMoney(totalAfterProductDiscount, shippingCharge));
  return {
    subtotal: normalizedSubtotal,
    shippingCharge,
    totalBeforeDiscount,
    discount: discountAmount,
    finalPayable: normalizeMoney(finalPayable)
  };
};
const normalizePaymentStatus = (status) => {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "paid") return "paid";
  if (normalized === "success") return "paid";
  if (normalized === "completed") return "paid";
  if (normalized === "failed") return "failed";
  if (normalized === "refunded") return "refunded";
  return "pending";
};
const normalizeDisplayOrderStatus = (paymentStatus, status, orderStatus) => {
  const rawStatus = String(status || orderStatus || "Pending").trim();
  return normalizePaymentStatus(paymentStatus) === "paid" && rawStatus === "Pending" ? "Confirmed" : rawStatus;
};
const formatPaymentStatusLabel = (status) => {
  switch (normalizePaymentStatus(status)) {
    case "paid":
      return "Paid";
    case "failed":
      return "Failed";
    case "refunded":
      return "Refunded";
    default:
      return "Pending";
  }
};
const formatOrderStatusLabel = (status) => {
  const normalized = String(status || "Pending").trim();
  return normalized || "Pending";
};
const BASE = runtimeConfig.apiUrl.replace(/\/$/, "");
const CATALOG_CACHE_TTL_MS = 30 * 1e3;
const CATALOG_CACHE_SWR_MS = 2 * 60 * 1e3;
const CATALOG_CACHE_MAX_KEYS = 100;
const USER_CACHE_TTL_MS = 4 * 1e3;
const USER_CACHE_SWR_MS = 12 * 1e3;
const ADMIN_CACHE_TTL_MS = 5 * 1e3;
const ADMIN_CACHE_SWR_MS = 15 * 1e3;
const catalogResponseCache = /* @__PURE__ */ new Map();
const inflightCatalogRequests = /* @__PURE__ */ new Map();
let authCacheVersion = 0;
const PRODUCTS_CHANGED_EVENT = "purefumes:products-changed";
const BESTSELLERS_CHANGED_EVENT = "purefumes:bestsellers-changed";
const LATEST_PRODUCTS_CHANGED_EVENT = "purefumes:latest-products-changed";
const BANNERS_CHANGED_EVENT = "purefumes:banners-changed";
const DATA_EVENT_STORAGE_KEY = "purefumes:data-event";
const API_ORIGIN = runtimeConfig.apiOrigin;
const clearLegacyStoredAccessTokens = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("purefumes_access_token");
  window.localStorage.removeItem("token");
};
clearLegacyStoredAccessTokens();
let cachedPaymentConfig = null;
const emitDataEvent = (name) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(name));
    try {
      window.localStorage.setItem(
        DATA_EVENT_STORAGE_KEY,
        JSON.stringify({
          name,
          at: Date.now(),
          nonce: Math.random().toString(36).slice(2)
        })
      );
    } catch (_error) {
    }
  }
};
const requireBackend = () => {
  if (!BASE) {
    throw new Error(
      "API URL is required. Set VITE_API_URL to point the frontend at your Express API."
    );
  }
};
const shouldReportApiFailure = (path, status) => {
  if (!status) return true;
  if (status >= 500) return true;
  if (path.startsWith("/auth/refresh") && [401, 403].includes(status)) return true;
  if (path.startsWith("/payments") && status >= 400) return true;
  return false;
};
const reportApiFailure = (error, {
  method,
  path,
  phase,
  requestId,
  status
}) => {
  if (!shouldReportApiFailure(path, status)) return;
  captureFrontendException(error, {
    source: "api",
    phase,
    method,
    path: sanitizeFrontendUrl(path),
    status,
    requestId: requestId || ""
  });
};
const queryString = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== void 0 && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};
const isBannerCatalogPath = (path) => path === "/banners" || path.startsWith("/banners?");
const isCatalogPath = (path) => path.startsWith("/products") || path.startsWith("/brands") || path.startsWith("/categories") || isBannerCatalogPath(path);
const canCacheCatalogRequest = (method, path) => method === "GET" && isCatalogPath(path);
const isUserScopedPath = (path) => path === "/auth/me" || path.startsWith("/users") || path.startsWith("/cart") || path.startsWith("/orders/my-orders");
const isAdminScopedPath = (path) => path.startsWith("/admin") || path.startsWith("/orders?") || path === "/orders" || path.startsWith("/orders/unseen");
const canProxyRequest = (method, path) => method === "GET" && !isCatalogPath(path) && (path === "/auth/config" || isUserScopedPath(path) || isAdminScopedPath(path));
const getProxyCacheKey = (method, path) => {
  const scope = isUserScopedPath(path) || isAdminScopedPath(path) ? `session:${authCacheVersion}` : "public";
  return `${scope}:${method}:${path}`;
};
const getProxyCachePolicy = (path) => {
  if (isAdminScopedPath(path)) {
    return { ttlMs: ADMIN_CACHE_TTL_MS, swrMs: ADMIN_CACHE_SWR_MS };
  }
  if (isUserScopedPath(path)) {
    return { ttlMs: USER_CACHE_TTL_MS, swrMs: USER_CACHE_SWR_MS };
  }
  return { ttlMs: CATALOG_CACHE_TTL_MS, swrMs: CATALOG_CACHE_TTL_MS };
};
const getCatalogCacheKey = (method, path) => `${method}:${path}`;
const getCatalogCacheEntry = (key) => catalogResponseCache.get(key) ?? null;
const isFreshCatalogEntry = (entry) => Date.now() - entry.createdAt < CATALOG_CACHE_TTL_MS;
const isUsableCatalogEntry = (entry) => Date.now() - entry.createdAt < CATALOG_CACHE_TTL_MS + CATALOG_CACHE_SWR_MS;
const setCatalogCacheEntry = (key, data) => {
  if (catalogResponseCache.size >= CATALOG_CACHE_MAX_KEYS) {
    const oldestKey = catalogResponseCache.keys().next().value;
    if (oldestKey) {
      catalogResponseCache.delete(oldestKey);
      inflightCatalogRequests.delete(oldestKey);
    }
  }
  catalogResponseCache.set(key, {
    createdAt: Date.now(),
    data
  });
};
const clearCatalogCache = (pathPrefix) => {
  Array.from(catalogResponseCache.keys()).forEach((key) => {
    if (key.includes(`:${pathPrefix}`)) {
      catalogResponseCache.delete(key);
      inflightCatalogRequests.delete(key);
    }
  });
  apiTrafficProxy.invalidate((key) => key.includes(pathPrefix));
  frontendMediator.publishCatalogChanged(
    pathPrefix.startsWith("/products") ? "products" : pathPrefix.startsWith("/brands") ? "brands" : pathPrefix.startsWith("/banners") ? "banners" : pathPrefix.startsWith("/categories") ? "categories" : "all"
  );
};
const invalidateProxyCache = (...pathFragments) => {
  apiTrafficProxy.invalidate((key) => pathFragments.some((fragment) => key.includes(fragment)));
};
const bumpAuthCacheVersion = () => {
  authCacheVersion += 1;
  invalidateProxyCache("/auth/me", "/users", "/cart", "/orders", "/admin");
};
const invalidateDashboardCache = () => {
  invalidateProxyCache("/auth/me", "/users/dashboard", "/users/profile", "/users/addresses");
};
const invalidateWishlistCache = () => {
  invalidateProxyCache("/users/wishlist", "/users/dashboard");
};
const invalidateCartCache = () => {
  invalidateProxyCache("/cart", "/users/dashboard");
};
const invalidateOrdersCache = () => {
  invalidateProxyCache("/orders", "/users/dashboard", "/cart", "/admin/analytics");
};
const setStoredAccessToken = (_token) => {
  if (typeof window === "undefined") return;
  clearLegacyStoredAccessTokens();
  bumpAuthCacheVersion();
};
const clearStoredAccessToken = () => {
  if (typeof window === "undefined") return;
  clearLegacyStoredAccessTokens();
  clearHttpClientState();
  bumpAuthCacheVersion();
};
const isUsage = (value) => value === "Day" || value === "Night" || value === "Day & Night";
const isBestTime = (value) => value === "Morning" || value === "Day" || value === "Evening" || value === "Night";
const asStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => String(item).split(",")).map((item) => item.trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
};
const asImageStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    const image = value.trim();
    if (!image) return [];
    if (image.startsWith("[")) {
      try {
        const parsed = JSON.parse(image);
        return asImageStringArray(parsed);
      } catch (_error) {
        return [image];
      }
    }
    return [image];
  }
  return [];
};
const asBestTimeArray = (value) => Array.isArray(value) ? value.filter(isBestTime) : [];
const normalizeAccords = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((accord) => {
    if (!accord || typeof accord !== "object") return null;
    const source = accord;
    const name = String(source.name || "").trim();
    if (!name) return null;
    const percentage = Number(source.percentage ?? source.intensity ?? 0);
    return {
      name,
      percentage: Number.isFinite(percentage) ? Math.min(Math.max(percentage, 0), 100) : 0
    };
  }).filter((accord) => Boolean(accord));
};
const resolveImageUrl = (value) => {
  const image = String(value || "").trim();
  if (!image || image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:") || image.startsWith("blob:")) {
    return image;
  }
  return image.startsWith("/") ? `${API_ORIGIN}${image}` : image;
};
const normalizeBrand = (brand) => ({
  _id: brand._id,
  id: String(brand.id || brand._id || ""),
  name: String(brand.name || ""),
  logo: resolveImageUrl(brand.logo || ""),
  fallbackLetter: String(
    brand.fallbackLetter || brand.name?.toString()?.trim()?.charAt(0) || "#"
  ).toUpperCase(),
  category: String(brand.category || brand.categorySlug || "").trim(),
  categoryId: brand.categoryId ? String(brand.categoryId) : null,
  categoryName: String(brand.categoryName || "").trim(),
  categorySlug: String(brand.categorySlug || brand.category || "").trim(),
  productCount: Number.isFinite(Number(brand.productCount)) ? Number(brand.productCount) : 0,
  previewProducts: Array.isArray(brand.previewProducts) ? brand.previewProducts.map(
    (product) => ({
      _id: product?._id,
      id: String(product?.id || product?._id || ""),
      name: String(product?.name || ""),
      brand: String(product?.brand || ""),
      brandId: product?.brandId ? String(product.brandId) : null,
      category: String(product?.category || ""),
      image: resolveImageUrl(product?.image || ""),
      images: asImageStringArray(product?.images).map(resolveImageUrl),
      price: normalizeMoney(product?.price)
    })
  ) : [],
  createdAt: brand.createdAt,
  updatedAt: brand.updatedAt
});
const normalizeBanner = (banner) => ({
  _id: String(banner._id || banner.id || ""),
  id: String(banner.id || banner._id || ""),
  title: String(banner.title || ""),
  subtitle: String(banner.subtitle || ""),
  image: resolveImageUrl(banner.image || banner.imageUrl || ""),
  buttonText: String(banner.buttonText || ""),
  link: String(banner.link || ""),
  isActive: banner.isActive !== false,
  order: Number.isFinite(Number(banner.order)) ? Number(banner.order) : 0,
  createdAt: banner.createdAt,
  updatedAt: banner.updatedAt
});
const normalizeCategory = (category) => ({
  _id: category._id,
  id: String(category.id || category._id || ""),
  name: String(category.name || "").trim(),
  slug: String(category.slug || "").trim(),
  image: resolveImageUrl(category.image || ""),
  description: String(category.description || "").trim(),
  icon: String(category.icon || "").trim(),
  color: String(category.color || "#8b5f3d").trim() || "#8b5f3d",
  sortOrder: Number.isFinite(Number(category.sortOrder ?? category.displayOrder)) ? Number(category.sortOrder ?? category.displayOrder) : 0,
  displayOrder: Number.isFinite(Number(category.sortOrder ?? category.displayOrder)) ? Number(category.sortOrder ?? category.displayOrder) : 0,
  isActive: category.isActive ?? category.active !== false,
  active: category.isActive ?? category.active !== false,
  isDeleted: Boolean(category.isDeleted),
  featured: Boolean(category.featured),
  productCount: Number.isFinite(Number(category.productCount)) ? Number(category.productCount) : 0,
  createdAt: category.createdAt || null,
  updatedAt: category.updatedAt || null
});
const createDerivedCategory = (id, name = "", slug = "", overrides = {}) => ({
  id,
  _id: id,
  name: String(name || "").trim(),
  slug: String(slug || "").trim(),
  description: "",
  image: "",
  icon: "",
  color: "#8b5f3d",
  sortOrder: 0,
  displayOrder: 0,
  isActive: true,
  active: true,
  isDeleted: false,
  featured: false,
  productCount: 0,
  createdAt: null,
  updatedAt: null,
  ...overrides
});
const normalizeProduct = (product) => {
  const sizes = Array.isArray(product.sizes) ? product.sizes.map((size) => ({
    size: String(size?.size || "Standard").trim() || "Standard",
    price: normalizeMoney(size?.price)
  })).filter((size) => size.size) : [];
  const price = normalizeMoney(product.price ?? sizes[0]?.price ?? 0);
  const images = asImageStringArray(product.images).map(resolveImageUrl);
  const legacyImage = resolveImageUrl(product.image || "");
  const normalizedImages = images.length ? Array.from(new Set(images)) : legacyImage ? [legacyImage] : [];
  const image = normalizedImages[0] || legacyImage;
  const notes = asStringArray(product.notes);
  const seasons = Array.isArray(product.seasons) && product.seasons.length ? product.seasons : Array.isArray(product.season) ? product.season : [];
  const usage = isUsage(product.usage) ? product.usage : isUsage(product.timeOfDay) ? product.timeOfDay : "Day & Night";
  const brandDetails = product.brandDetails && typeof product.brandDetails === "object" ? normalizeBrand(product.brandDetails) : null;
  const categoryObjects = Array.isArray(product.categories) ? product.categories.reduce((collection, category) => {
    if (category && typeof category === "object") {
      collection.push(normalizeCategory(category));
    }
    return collection;
  }, []) : [];
  const categoryDetails = product.categoryDetails && typeof product.categoryDetails === "object" ? normalizeCategory(product.categoryDetails) : categoryObjects[0] || null;
  const categoryIds = Array.isArray(product.categoryIds) ? product.categoryIds.map((id) => String(id || "").trim()).filter(Boolean) : Array.isArray(product.categories) ? product.categories.map((category) => {
    if (!category) return "";
    if (typeof category === "object") {
      return String(
        category.id || category._id || ""
      ).trim();
    }
    return String(category || "").trim();
  }).filter(Boolean) : product.categoryId ? [String(product.categoryId).trim()] : categoryDetails?.id ? [categoryDetails.id] : [];
  const categoryNames = Array.isArray(product.categoryNames) ? product.categoryNames.map((name) => String(name || "").trim()).filter(Boolean) : categoryObjects.length ? categoryObjects.map((category) => category.name) : categoryDetails?.name ? [categoryDetails.name] : product.category ? [String(product.category).trim()] : [];
  const categorySlugs = Array.isArray(product.categorySlugs) ? product.categorySlugs.map((slug) => String(slug || "").trim()).filter(Boolean) : categoryObjects.length ? categoryObjects.map((category) => category.slug) : categoryDetails?.slug ? [categoryDetails.slug] : product.categorySlug ? [String(product.categorySlug).trim()] : [];
  const categories = categoryObjects.length ? categoryObjects : categoryIds.map(
    (id, index) => createDerivedCategory(
      id,
      categoryNames[index] || categoryNames[0] || "",
      categorySlugs[index] || ""
    )
  );
  const normalizedBrandId = String(product.brandId || brandDetails?.id || "").trim();
  const normalizedCategoryId = String(
    product.primaryCategory || product.categoryId || categoryDetails?.id || categoryIds[0] || ""
  ).trim();
  const normalizedCategory = String(
    product.category || categoryDetails?.name || categoryNames[0] || ""
  ).trim();
  return applyProductImageOverride({
    _id: product._id,
    id: String(product.id || product._id || ""),
    name: String(product.name || ""),
    brand: String(product.brand || brandDetails?.name || ""),
    brandId: normalizedBrandId || null,
    brandDetails,
    categories,
    categoryIds,
    categoryNames,
    categorySlugs,
    primaryCategory: normalizedCategoryId || null,
    category: normalizedCategory || "Uncategorized",
    categoryId: normalizedCategoryId || null,
    categorySlug: String(
      product.categorySlug || categoryDetails?.slug || categorySlugs[0] || ""
    ).trim(),
    categoryDetails,
    price,
    gender: String(product.gender || ""),
    rating: Number(product.rating || 0),
    reviewCount: Number(product.reviewCount ?? product.reviewsCount ?? 0),
    reviewsCount: Number(product.reviewsCount ?? product.reviewCount ?? 0),
    image,
    images: normalizedImages,
    description: String(product.description || ""),
    type: String(product.type || "").trim(),
    notes,
    topNotes: asStringArray(product.topNotes).length ? asStringArray(product.topNotes) : notes,
    middleNotes: asStringArray(product.middleNotes),
    baseNotes: asStringArray(product.baseNotes),
    accords: normalizeAccords(product.accords),
    sillage: String(product.sillage || ""),
    usage,
    timeOfDay: String(product.timeOfDay || usage),
    bestTime: asBestTimeArray(product.bestTime),
    season: seasons,
    seasons,
    sizes: sizes.length ? sizes : [{ size: "Standard", price }],
    stock: Number(product.stock ?? 0),
    originalPrice: product.originalPrice === void 0 || product.originalPrice === null ? void 0 : normalizeMoney(product.originalPrice),
    isBestseller: Boolean(product.isBestseller),
    isLatest: Boolean(product.isLatest),
    bestsellerOrder: Number(product.bestsellerOrder ?? product.displayOrder ?? 0),
    displayOrder: Number(product.displayOrder ?? product.bestsellerOrder ?? 0),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  });
};
const normalizeOrder = (order) => {
  const items = Array.isArray(order.items) ? order.items.map((item) => ({
    ...item,
    quantity: Number(item.quantity || 1),
    price: normalizeMoney(item.price ?? item.priceAtPurchase ?? 0),
    priceAtPurchase: normalizeMoney(item.priceAtPurchase ?? item.price ?? 0)
  })) : [];
  const firstItem = items[0];
  const paymentStatus = normalizePaymentStatus(order.paymentStatus);
  const displayStatus = normalizeDisplayOrderStatus(paymentStatus, order.status, order.orderStatus);
  return {
    ...order,
    customerName: String(order.customerName || order.shippingAddress?.fullName || "").trim(),
    email: String(order.email || "").trim().toLowerCase(),
    mobileNumber: String(order.mobileNumber || order.phone || "").trim(),
    phone: String(order.phone || order.mobileNumber || "").trim(),
    address: String(order.address || "").trim(),
    items,
    productName: order.productName ?? firstItem?.productName ?? "",
    brand: order.brand ?? firstItem?.brand ?? "",
    size: order.size ?? firstItem?.size ?? "",
    price: normalizeMoney(order.price ?? firstItem?.price ?? order.totalAmount),
    totalAmount: normalizeMoney(order.totalAmount ?? order.price ?? firstItem?.price),
    subtotalAmount: normalizeMoney(order.subtotalAmount ?? order.totalAmount),
    discountAmount: normalizeMoney(order.discountAmount ?? 0),
    shippingCharge: normalizeMoney(order.shippingCharge ?? 0),
    couponCode: order.couponCode ?? "",
    publicOrderId: String(order.publicOrderId || "").trim(),
    status: displayStatus,
    isSeen: Boolean(order.isSeen),
    orderStatus: displayStatus,
    paymentStatus,
    paymentId: order.paymentId ?? "",
    paymentMethod: order.paymentMethod ?? "",
    paymentGateway: order.paymentGateway ?? "",
    paymentOrderId: order.paymentOrderId ?? "",
    paymentSignature: order.paymentSignature ?? ""
  };
};
const normalizeAddress = (address = {}) => {
  const mobile = String(address.mobile || address.phone || "").trim();
  const line1 = String(address.line1 || address.street || "").trim();
  const line2 = String(address.line2 || address.landmark || "").trim();
  const postalCode = String(address.postalCode || address.pincode || "").trim();
  return {
    _id: address._id ? String(address._id) : void 0,
    label: String(address.label || "").trim(),
    fullName: String(address.fullName || "").trim(),
    mobile,
    phone: mobile,
    line1,
    street: line1,
    line2,
    landmark: line2,
    city: String(address.city || "").trim(),
    state: String(address.state || "").trim(),
    postalCode,
    pincode: postalCode,
    country: String(address.country || "India").trim(),
    isDefault: Boolean(address.isDefault)
  };
};
const normalizeAuthUser = (user) => ({
  ...user,
  id: String(user.id || ""),
  name: String(user.name || ""),
  email: String(user.email || ""),
  username: String(user.username || ""),
  mobile: String(user.mobile || ""),
  profileImage: String(user.profileImage || ""),
  addresses: Array.isArray(user.addresses) ? user.addresses.map(normalizeAddress) : [],
  totalOrders: Number(user.totalOrders || 0),
  totalSpent: Number(user.totalSpent || 0),
  emailVerified: Boolean(user.emailVerified),
  isBanned: Boolean(user.isBanned)
});
const normalizeDashboard = (dashboard) => {
  const user = normalizeAuthUser(dashboard.user);
  const addresses = Array.isArray(dashboard.addresses) ? dashboard.addresses.map(normalizeAddress) : user.addresses || [];
  return {
    ...dashboard,
    user: {
      ...user,
      addresses,
      totalOrders: Number(dashboard.stats?.totalOrders ?? user.totalOrders ?? 0),
      totalSpent: Number(dashboard.stats?.totalSpent ?? user.totalSpent ?? 0)
    },
    stats: {
      totalOrders: Number(dashboard.stats?.totalOrders || 0),
      totalSpent: Number(dashboard.stats?.totalSpent || 0),
      wishlistItems: Number(dashboard.stats?.wishlistItems || 0),
      addressCount: Number(dashboard.stats?.addressCount || addresses.length)
    },
    recentOrders: Array.isArray(dashboard.recentOrders) ? dashboard.recentOrders.map(normalizeOrder) : [],
    wishlist: Array.isArray(dashboard.wishlist) ? dashboard.wishlist.map(normalizeProduct) : [],
    addresses,
    defaultAddress: dashboard.defaultAddress ? normalizeAddress(dashboard.defaultAddress) : null
  };
};
const normalizeCoupon = (coupon) => ({
  _id: String(coupon._id || coupon.id || ""),
  id: String(coupon.id || coupon._id || ""),
  code: String(coupon.code || "").toUpperCase(),
  discountType: coupon.discountType === "fixed" ? "fixed" : "percentage",
  discountValue: normalizeMoney(coupon.discountValue || 0),
  minOrderAmount: normalizeMoney(coupon.minOrderAmount || 0),
  maxDiscount: coupon.maxDiscount === null || coupon.maxDiscount === void 0 ? null : normalizeMoney(coupon.maxDiscount || 0),
  expiryDate: coupon.expiryDate ? String(coupon.expiryDate) : null,
  isActive: Boolean(coupon.isActive),
  applicabilityType: coupon.applicabilityType === "selected" ? "selected" : "all",
  applicableProductIds: Array.from(
    new Set(
      [
        ...Array.isArray(coupon.applicableProductIds) ? coupon.applicableProductIds : [],
        ...Array.isArray(coupon.applicableProducts) ? coupon.applicableProducts.map(
          (product) => typeof product === "string" ? product : product.id || product._id || ""
        ) : []
      ].map((productId) => String(productId || "").trim()).filter(Boolean)
    )
  ),
  applicableProducts: Array.isArray(coupon.applicableProducts) ? coupon.applicableProducts.map((product) => {
    if (!product || typeof product === "string") {
      const productId2 = String(product || "").trim();
      return productId2 ? { _id: productId2, id: productId2, name: "", brand: "", image: "", images: [] } : null;
    }
    const productId = String(product.id || product._id || "").trim();
    if (!productId) return null;
    return {
      _id: productId,
      id: productId,
      name: String(product.name || ""),
      brand: String(product.brand || ""),
      image: resolveImageUrl(product.image || product.images?.[0] || ""),
      images: asImageStringArray(product.images).map(resolveImageUrl),
      price: normalizeMoney(product.price || 0)
    };
  }).filter((product) => Boolean(product)) : [],
  createdAt: String(coupon.createdAt || ""),
  updatedAt: String(coupon.updatedAt || "")
});
const isPerfumeRequestStatus = (value) => value === "new" || value === "contacted" || value === "sourced" || value === "closed";
const normalizePerfumeRequest = (perfumeRequest) => ({
  _id: String(perfumeRequest._id || perfumeRequest.id || ""),
  id: String(perfumeRequest.id || perfumeRequest._id || ""),
  perfumeName: String(perfumeRequest.perfumeName || ""),
  customerName: String(perfumeRequest.customerName || ""),
  phoneNumber: String(perfumeRequest.phoneNumber || ""),
  preferredSize: String(perfumeRequest.preferredSize || ""),
  budgetRange: String(perfumeRequest.budgetRange || ""),
  message: String(perfumeRequest.message || ""),
  images: asImageStringArray(perfumeRequest.images).map(resolveImageUrl),
  status: isPerfumeRequestStatus(perfumeRequest.status) ? perfumeRequest.status : "new",
  createdAt: String(perfumeRequest.createdAt || ""),
  updatedAt: String(perfumeRequest.updatedAt || "")
});
async function http(path, init2 = {}) {
  requireBackend();
  const { forceFresh = false, skipAuthRefresh = false, ...requestInit } = init2;
  const headers = new Headers(requestInit.headers);
  const method = (requestInit.method || "GET").toUpperCase();
  const cacheableCatalogRequest = canCacheCatalogRequest(method, path);
  const proxyRequest = canProxyRequest(method, path);
  const catalogCacheKey = cacheableCatalogRequest ? getCatalogCacheKey(method, path) : "";
  const cachedCatalogEntry = cacheableCatalogRequest ? getCatalogCacheEntry(catalogCacheKey) : null;
  if (!forceFresh && cachedCatalogEntry && isFreshCatalogEntry(cachedCatalogEntry)) {
    return cachedCatalogEntry.data;
  }
  if (!forceFresh && cachedCatalogEntry && isUsableCatalogEntry(cachedCatalogEntry)) {
    if (!inflightCatalogRequests.has(catalogCacheKey)) {
      void http(path, {
        ...init2,
        forceFresh: true
      }).catch(() => {
      });
    }
    return cachedCatalogEntry.data;
  }
  if (cacheableCatalogRequest && !forceFresh) {
    const inflightRequest = inflightCatalogRequests.get(catalogCacheKey);
    if (inflightRequest) {
      return inflightRequest;
    }
  }
  if (!(init2.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const executeRequest = async () => {
    const rawBody = requestInit.body;
    let requestBody = rawBody;
    try {
      if (typeof rawBody === "string" && headers.get("Content-Type")?.includes("application/json")) {
        try {
          requestBody = JSON.parse(rawBody);
        } catch (_error) {
          requestBody = rawBody;
        }
      }
      const data = await requestJson({
        url: path,
        method,
        headers: Object.fromEntries(headers.entries()),
        data: requestBody,
        signal: requestInit.signal ?? void 0,
        skipAuthRefresh
      });
      if (cacheableCatalogRequest) {
        setCatalogCacheEntry(catalogCacheKey, data);
      }
      return data;
    } catch (error) {
      reportApiFailure(error, {
        method,
        path,
        phase: "response",
        status: Number(error?.status || 0)
      });
      throw error;
    }
  };
  const request = proxyRequest ? apiTrafficProxy.readThrough({
    key: getProxyCacheKey(method, path),
    loader: executeRequest,
    forceFresh,
    retries: 1,
    ...getProxyCachePolicy(path)
  }) : perfInstrumentation.timeAsync(`api:${method}:${path}`, executeRequest, {
    metadata: { forceFresh, cacheableCatalogRequest }
  });
  if (cacheableCatalogRequest) {
    inflightCatalogRequests.set(catalogCacheKey, request);
  }
  try {
    return await request;
  } catch (error) {
    if (!forceFresh && cachedCatalogEntry) {
      return cachedCatalogEntry.data;
    }
    throw error;
  } finally {
    if (cacheableCatalogRequest) {
      inflightCatalogRequests.delete(catalogCacheKey);
    }
  }
}
async function uploadFormData(path, method, formData, options = {}) {
  requireBackend();
  try {
    const data = await uploadMultipart(path, formData, {
      method,
      skipAuthRefresh: options.skipAuthRefresh,
      onUploadProgress: options.onUploadProgress
    });
    options.onUploadProgress?.(100);
    return data;
  } catch (error) {
    reportApiFailure(error, {
      method,
      path,
      phase: "upload_response",
      status: Number(error?.status || 0)
    });
    throw error;
  }
}
const productsApi = {
  list: async (params = {}, options = {}) => {
    const data = await http(`/products${queryString(params)}`, {
      forceFresh: options.forceFresh
    });
    const products = Array.isArray(data) ? data : data.products;
    return products.map(normalizeProduct);
  },
  listPaginated: async (params = {}, options = {}) => {
    const data = await http(`/products${queryString(params)}`, {
      forceFresh: options.forceFresh
    });
    if (Array.isArray(data)) {
      return {
        products: data.map(normalizeProduct),
        pagination: {
          page: Number(params.page ?? 1),
          limit: Number(params.limit ?? data.length),
          total: data.length,
          pages: 1
        }
      };
    }
    return {
      products: data.products.map(normalizeProduct),
      pagination: data.pagination
    };
  },
  listBestsellers: async (options = {}) => {
    const products = await http("/bestsellers", {
      forceFresh: options.forceFresh ?? false
    });
    return products.map(normalizeProduct);
  },
  listLatest: async (options = {}) => {
    const products = await http("/products/latest", {
      forceFresh: options.forceFresh ?? false
    });
    return products.map(normalizeProduct);
  },
  get: async (id) => {
    const product = await http(`/products/${id}`);
    return normalizeProduct(product);
  },
  create: async (product) => {
    const createdProduct = await http("/products", {
      method: "POST",
      body: JSON.stringify(product)
    });
    clearCatalogCache("/products");
    clearCatalogCache("/brands");
    clearCatalogCache("/categories");
    const normalizedProduct = normalizeProduct(createdProduct);
    emitDataEvent(PRODUCTS_CHANGED_EVENT);
    if (normalizedProduct.isBestseller) {
      emitDataEvent(BESTSELLERS_CHANGED_EVENT);
    }
    emitDataEvent(LATEST_PRODUCTS_CHANGED_EVENT);
    return normalizedProduct;
  },
  createWithImages: async (formData, options = {}) => {
    const createdProduct = await uploadFormData(
      "/products",
      "POST",
      formData,
      options
    );
    clearCatalogCache("/products");
    clearCatalogCache("/brands");
    clearCatalogCache("/categories");
    const normalizedProduct = normalizeProduct(createdProduct);
    emitDataEvent(PRODUCTS_CHANGED_EVENT);
    if (normalizedProduct.isBestseller) {
      emitDataEvent(BESTSELLERS_CHANGED_EVENT);
    }
    emitDataEvent(LATEST_PRODUCTS_CHANGED_EVENT);
    return normalizedProduct;
  },
  bulkCreate: async (products) => {
    const result = await http("/products/bulk", {
      method: "POST",
      body: JSON.stringify({ products })
    });
    clearCatalogCache("/products");
    clearCatalogCache("/brands");
    clearCatalogCache("/categories");
    emitDataEvent(PRODUCTS_CHANGED_EVENT);
    emitDataEvent(LATEST_PRODUCTS_CHANGED_EVENT);
    return {
      ...result,
      createdProducts: result.createdProducts.map(normalizeProduct)
    };
  },
  update: async (id, product) => {
    const updatedProduct = await http(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product)
    });
    clearCatalogCache("/products");
    clearCatalogCache("/brands");
    clearCatalogCache("/categories");
    const normalizedProduct = normalizeProduct(updatedProduct);
    emitDataEvent(PRODUCTS_CHANGED_EVENT);
    if (normalizedProduct.isBestseller) {
      emitDataEvent(BESTSELLERS_CHANGED_EVENT);
    }
    emitDataEvent(LATEST_PRODUCTS_CHANGED_EVENT);
    return normalizedProduct;
  },
  updateWithImages: async (id, formData, options = {}) => {
    const updatedProduct = await uploadFormData(
      `/products/${id}`,
      "PUT",
      formData,
      options
    );
    clearCatalogCache("/products");
    clearCatalogCache("/brands");
    clearCatalogCache("/categories");
    const normalizedProduct = normalizeProduct(updatedProduct);
    emitDataEvent(PRODUCTS_CHANGED_EVENT);
    if (normalizedProduct.isBestseller) {
      emitDataEvent(BESTSELLERS_CHANGED_EVENT);
    }
    emitDataEvent(LATEST_PRODUCTS_CHANGED_EVENT);
    return normalizedProduct;
  },
  updateBestseller: async (id, payload) => {
    const updatedProduct = await http(`/products/${id}/bestseller`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
    clearCatalogCache("/products");
    const normalizedProduct = normalizeProduct(updatedProduct);
    emitDataEvent(PRODUCTS_CHANGED_EVENT);
    emitDataEvent(BESTSELLERS_CHANGED_EVENT);
    emitDataEvent(LATEST_PRODUCTS_CHANGED_EVENT);
    return normalizedProduct;
  },
  remove: async (id) => {
    await http(`/products/${id}`, { method: "DELETE" });
    clearCatalogCache("/products");
    clearCatalogCache("/brands");
    clearCatalogCache("/categories");
    emitDataEvent(PRODUCTS_CHANGED_EVENT);
    emitDataEvent(BESTSELLERS_CHANGED_EVENT);
    emitDataEvent(LATEST_PRODUCTS_CHANGED_EVENT);
  },
  wishlist: async () => {
    const products = await http("/users/wishlist");
    return products.map(normalizeProduct);
  },
  addToWishlist: async (productId) => {
    const products = await apiTrafficProxy.runExclusive({
      key: `wishlist:add:${productId}`,
      action: () => http(`/users/wishlist/${productId}`, {
        method: "POST"
      })
    });
    invalidateWishlistCache();
    return products.map(normalizeProduct);
  },
  removeFromWishlist: async (productId) => {
    const products = await apiTrafficProxy.runExclusive({
      key: `wishlist:remove:${productId}`,
      action: () => http(`/users/wishlist/${productId}`, {
        method: "DELETE"
      })
    });
    invalidateWishlistCache();
    return products.map(normalizeProduct);
  },
  clearWishlist: async () => {
    const products = await http("/users/wishlist", {
      method: "DELETE"
    });
    invalidateWishlistCache();
    return products.map(normalizeProduct);
  }
};
const brandsApi = {
  list: async (params = {}, options = {}) => {
    const data = await http(`/brands${queryString(params)}`, {
      forceFresh: options.forceFresh
    });
    return data.map(normalizeBrand);
  },
  get: async (id) => {
    const brand = await http(`/brands/${id}`);
    return normalizeBrand(brand);
  },
  createWithLogo: async (formData) => {
    const createdBrand = await http("/brands", {
      method: "POST",
      body: formData
    });
    clearCatalogCache("/brands");
    clearCatalogCache("/products");
    return normalizeBrand(createdBrand);
  },
  updateWithLogo: async (id, formData) => {
    const updatedBrand = await http(`/brands/${id}`, {
      method: "PUT",
      body: formData
    });
    clearCatalogCache("/brands");
    clearCatalogCache("/products");
    return normalizeBrand(updatedBrand);
  },
  bulkCreate: async (brands) => {
    const result = await http("/brands/bulk", {
      method: "POST",
      body: JSON.stringify({ brands })
    });
    clearCatalogCache("/brands");
    clearCatalogCache("/products");
    return {
      ...result,
      createdBrands: result.createdBrands.map(normalizeBrand)
    };
  },
  remove: async (id) => {
    await http(`/brands/${id}`, { method: "DELETE" });
    clearCatalogCache("/brands");
    clearCatalogCache("/products");
  }
};
const categoriesApi = {
  list: async (options = {}) => {
    const data = await http(
      `/categories${queryString({
        featured: options.featured ? "true" : void 0,
        search: options.search
      })}`
    );
    return data.map(normalizeCategory);
  },
  listAdmin: async (options = {}) => {
    const data = await http("/categories/manage", {
      forceFresh: options.forceFresh
    });
    return data.map(normalizeCategory);
  },
  listAdminPage: async (params = {}) => {
    const data = await http(`/categories/manage${queryString(params)}`);
    return {
      items: data.items.map(normalizeCategory),
      pagination: data.pagination,
      summary: data.summary
    };
  },
  getBySlug: async (slug) => {
    const data = await http(`/categories/slug/${slug}`);
    return normalizeCategory(data);
  },
  createWithAssets: async (formData) => {
    const createdCategory = await http("/categories", {
      method: "POST",
      body: formData
    });
    clearCatalogCache("/categories");
    clearCatalogCache("/products");
    return normalizeCategory(createdCategory);
  },
  updateWithAssets: async (id, formData) => {
    const updatedCategory = await http(`/categories/${id}`, {
      method: "PUT",
      body: formData
    });
    clearCatalogCache("/categories");
    clearCatalogCache("/products");
    return normalizeCategory(updatedCategory);
  },
  remove: async (id) => {
    await http(`/categories/${id}`, { method: "DELETE" });
    clearCatalogCache("/categories");
    clearCatalogCache("/products");
  }
};
const bannersApi = {
  listActive: async (options = {}) => {
    const data = await http("/banners", {
      forceFresh: options.forceFresh
    });
    return data.map(normalizeBanner).filter((banner) => banner.isActive && banner.image).sort((left, right) => left.order - right.order);
  },
  listAdmin: async () => {
    const data = await http("/banners/manage");
    return data.map(normalizeBanner);
  },
  createWithImage: async (formData) => {
    const banner = await http("/banners", {
      method: "POST",
      body: formData
    });
    clearCatalogCache("/banners");
    emitDataEvent(BANNERS_CHANGED_EVENT);
    return normalizeBanner(banner);
  },
  updateWithImage: async (id, formData) => {
    const banner = await http(`/banners/${id}`, {
      method: "PUT",
      body: formData
    });
    clearCatalogCache("/banners");
    emitDataEvent(BANNERS_CHANGED_EVENT);
    return normalizeBanner(banner);
  },
  toggle: async (id) => {
    const banner = await http(`/banners/${id}/toggle`, {
      method: "PATCH"
    });
    clearCatalogCache("/banners");
    emitDataEvent(BANNERS_CHANGED_EVENT);
    return normalizeBanner(banner);
  },
  remove: async (id) => {
    await http(`/banners/${id}`, {
      method: "DELETE"
    });
    clearCatalogCache("/banners");
    emitDataEvent(BANNERS_CHANGED_EVENT);
  }
};
const ordersApi = {
  list: async (params = {}) => {
    const data = await http(`/orders${queryString(params)}`);
    const orders = Array.isArray(data) ? data : data.orders;
    return orders.map(normalizeOrder);
  },
  listPaginated: async (params = {}) => {
    const data = await http(`/orders${queryString(params)}`);
    if (Array.isArray(data)) {
      return {
        orders: data.map(normalizeOrder),
        pagination: {
          page: Number(params.page || 1),
          limit: Number(params.limit || data.length || 12),
          total: data.length,
          pages: 1
        }
      };
    }
    return {
      ...data,
      orders: data.orders.map(normalizeOrder)
    };
  },
  unseen: async () => {
    const orders = await http("/orders/unseen");
    return orders.map(normalizeOrder);
  },
  create: async (input) => {
    const order = normalizeOrder(
      await http("/orders/create", { method: "POST", body: JSON.stringify(input) })
    );
    invalidateOrdersCache();
    emitDataEvent("purefumes:orders-changed");
    return order;
  },
  myOrders: async (params = {}) => {
    const data = await http(`/orders/my-orders${queryString(params)}`);
    return {
      ...data,
      orders: data.orders.map(normalizeOrder)
    };
  },
  get: async (id) => normalizeOrder(await http(`/orders/${id}`)),
  cancel: async (id) => {
    const order = normalizeOrder(await http(`/orders/${id}/cancel`, { method: "POST" }));
    invalidateOrdersCache();
    return order;
  },
  reorder: async (id) => {
    const cart = normalizeCartResponse(
      await http(`/orders/${id}/reorder`, { method: "POST" })
    );
    invalidateOrdersCache();
    return cart;
  },
  updateStatus: async (id, status) => {
    const order = normalizeOrder(
      await http(`/orders/${id}`, { method: "PUT", body: JSON.stringify({ status }) })
    );
    invalidateOrdersCache();
    return order;
  },
  markSeen: async (id) => {
    const order = normalizeOrder(await http(`/orders/${id}/seen`, { method: "PUT" }));
    invalidateOrdersCache();
    return order;
  }
};
const couponsApi = {
  list: async () => {
    const data = await http("/coupons");
    return data.map(normalizeCoupon);
  },
  create: async (payload) => {
    const coupon = await http("/coupons", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return normalizeCoupon(coupon);
  },
  update: async (id, payload) => {
    const coupon = await http(`/coupons/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    return normalizeCoupon(coupon);
  },
  apply: async (payload) => {
    const response = await http("/coupons/apply", {
      method: "POST",
      body: JSON.stringify(payload)
    }) || {};
    const coupon = response.coupon ? normalizeCoupon(response.coupon) : null;
    const fixedCouponDiscount = coupon?.discountType === "fixed" ? coupon.discountValue : response.coupon?.discountValue ?? response.coupon?.discount ?? 0;
    const requestedDiscount = normalizeMoney(
      coupon?.discountType === "fixed" ? fixedCouponDiscount : response.discount ?? fixedCouponDiscount
    );
    const subtotal = normalizeMoney(response.subtotal ?? payload.cartTotal ?? 0);
    const fallbackTotals = calculateCheckoutTotals({ subtotal, discount: requestedDiscount });
    const discount = fallbackTotals.discount;
    const finalTotal = fallbackTotals.finalPayable;
    return {
      success: response.success !== false,
      code: String(response.code || coupon?.code || payload.code || "").trim().toUpperCase(),
      discount,
      finalTotal,
      subtotal,
      shippingCharge: normalizeMoney(response.shippingCharge ?? fallbackTotals.shippingCharge),
      totalBeforeDiscount: normalizeMoney(
        response.totalBeforeDiscount ?? fallbackTotals.totalBeforeDiscount
      ),
      eligibleSubtotal: normalizeMoney(response.eligibleSubtotal ?? subtotal),
      ineligibleSubtotal: normalizeMoney(response.ineligibleSubtotal ?? 0),
      partialApplication: Boolean(response.partialApplication),
      message: response.message,
      coupon
    };
  },
  toggle: async (id) => {
    const coupon = await http(`/coupons/${id}/toggle`, {
      method: "PATCH"
    });
    return normalizeCoupon(coupon);
  },
  remove: async (id) => {
    await http(`/coupons/${id}`, {
      method: "DELETE"
    });
  }
};
const perfumeRequestsApi = {
  list: async (params = {}) => {
    const data = await http(`/perfume-requests${queryString(params)}`);
    const requests = Array.isArray(data) ? data : data.requests;
    return requests.map(normalizePerfumeRequest);
  },
  listPaginated: async (params = {}) => {
    const data = await http(`/perfume-requests${queryString(params)}`);
    if (Array.isArray(data)) {
      return {
        requests: data.map(normalizePerfumeRequest),
        pagination: {
          page: Number(params.page || 1),
          limit: Number(params.limit || data.length || 12),
          total: data.length,
          pages: 1
        }
      };
    }
    return {
      requests: data.requests.map(normalizePerfumeRequest),
      pagination: data.pagination
    };
  },
  create: async (payload) => {
    const perfumeRequest = normalizePerfumeRequest(
      await http("/perfume-requests", {
        method: "POST",
        body: payload
      })
    );
    emitDataEvent("purefumes:requests-changed");
    return perfumeRequest;
  },
  updateStatus: async (id, status) => {
    const perfumeRequest = normalizePerfumeRequest(
      await http(`/perfume-requests/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status })
      })
    );
    emitDataEvent("purefumes:requests-changed");
    return perfumeRequest;
  }
};
const accountApi = {
  authConfig: async () => http("/auth/config"),
  setAccessToken: (token) => {
    setStoredAccessToken();
  },
  clearAccessToken: () => {
    clearStoredAccessToken();
  },
  me: async () => {
    try {
      const response = await http("/auth/me");
      return normalizeAuthUser(response.user);
    } catch (_error) {
      return null;
    }
  },
  dashboard: async () => normalizeDashboard(await http("/users/dashboard")),
  updateProfile: async (payload) => {
    const response = await http("/users/profile", {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    invalidateDashboardCache();
    return normalizeAuthUser(response.user);
  },
  addAddress: async (payload) => {
    const response = await http("/users/addresses", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    invalidateDashboardCache();
    return normalizeAuthUser(response.user);
  },
  updateAddress: async (addressId, payload) => {
    const response = await http(`/users/addresses/${addressId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    invalidateDashboardCache();
    return normalizeAuthUser(response.user);
  },
  deleteAddress: async (addressId) => {
    const response = await http(`/users/addresses/${addressId}`, {
      method: "DELETE"
    });
    invalidateDashboardCache();
    return normalizeAuthUser(response.user);
  },
  setDefaultAddress: async (addressId) => {
    const response = await http(`/users/addresses/${addressId}/default`, {
      method: "PATCH"
    });
    invalidateDashboardCache();
    return normalizeAuthUser(response.user);
  },
  signup: async (payload) => {
    throw new Error(
      "Customer accounts are no longer required. Customers can place orders directly at checkout."
    );
  },
  login: async (identifier, password) => {
    const response = await http("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password })
    });
    bumpAuthCacheVersion();
    return normalizeAuthUser(response.user);
  },
  logout: async () => {
    try {
      await http("/auth/logout", { method: "POST" });
    } finally {
      clearStoredAccessToken();
    }
  },
  forgotPassword: async (email) => {
    throw new Error(
      "Customer accounts are no longer required. Customers can place orders directly at checkout."
    );
  },
  resetPassword: async (token, password) => {
    throw new Error(
      "Customer accounts are no longer required. Customers can place orders directly at checkout."
    );
  },
  verifyEmail: async (token) => {
    throw new Error(
      "Customer accounts are no longer required. Customers can place orders directly at checkout."
    );
  },
  googleUrl: (redirect2 = "/") => {
    throw new Error("Google sign-in is no longer available.");
  },
  adminUsers: async (params = {}) => {
    const response = await http(`/admin/users${queryString(params)}`);
    return response;
  },
  adminUserDetails: async (id) => http(`/admin/user/${id}`),
  adminUserOrders: async (id, params = {}) => {
    const response = await http(`/admin/user/${id}/orders${queryString(params)}`);
    return response;
  },
  adminBanUser: async (id, isBanned) => {
    const response = await http(`/admin/ban-user/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ isBanned })
    });
    invalidateProxyCache("/admin/users", `/admin/user/${id}`, "/admin/analytics");
    return response.user;
  },
  adminDeleteUser: async (id) => http(`/admin/user/${id}`, {
    method: "DELETE"
  }).then((response) => {
    invalidateProxyCache("/admin/users", `/admin/user/${id}`, "/admin/analytics");
    return response;
  }),
  adminAnalytics: async (params = {}, options = {}) => http(`/admin/analytics${queryString(params)}`, {
    forceFresh: options.forceFresh ?? true
  })
};
const normalizeCartItem = (item) => ({
  ...item,
  id: item.id ? String(item.id) : void 0,
  productId: String(item.productId || item.product?.id || item.product?._id || ""),
  product: normalizeProduct(item.product),
  selectedVariant: {
    size: String(item.selectedVariant?.size || item.size?.size || "Standard")
  },
  size: {
    size: String(item.size?.size || item.selectedVariant?.size || "Standard"),
    price: normalizeMoney(item.size?.price ?? item.currentPrice ?? item.product?.price ?? 0)
  },
  quantity: Number(item.quantity || 1),
  priceAtAddition: normalizeMoney(
    item.priceAtAddition ?? item.size?.price ?? item.product?.price ?? 0
  ),
  currentPrice: normalizeMoney(item.currentPrice ?? item.size?.price ?? item.product?.price ?? 0),
  lineTotal: normalizeMoney(
    item.lineTotal ?? multiplyMoney(
      item.currentPrice ?? item.size?.price ?? item.product?.price ?? 0,
      item.quantity || 1
    )
  ),
  key: String(
    item.key || `${item.productId || item.product?.id || item.product?._id}:${item.size?.size || item.selectedVariant?.size || "Standard"}`
  )
});
const normalizeCartResponse = (cart) => {
  const itemsSource = Array.isArray(cart.items) ? cart.items : Array.isArray(cart.products) ? cart.products : [];
  const items = itemsSource.map(normalizeCartItem);
  const subtotal = normalizeMoney(
    cart.subtotal ?? addMoney(...items.map((item) => item.lineTotal || 0))
  );
  const discount = normalizeMoney(cart.discount ?? 0);
  const checkoutTotals = calculateCheckoutTotals({ subtotal, discount });
  return {
    ...cart,
    items,
    products: items,
    totalItems: Number(cart.totalItems ?? items.reduce((sum, item) => sum + item.quantity, 0)),
    subtotal,
    discount,
    finalTotal: checkoutTotals.finalPayable
  };
};
const toCartPayload = (items) => ({
  items: items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    size: item.size || ""
  }))
});
const cartApi = {
  get: async () => normalizeCartResponse(await http("/cart")),
  merge: async (items) => {
    const cart = normalizeCartResponse(
      await http("/cart/merge", {
        method: "POST",
        body: JSON.stringify(toCartPayload(items))
      })
    );
    invalidateCartCache();
    return cart;
  },
  sync: async (items) => {
    const cart = normalizeCartResponse(
      await http("/cart/sync", {
        method: "PUT",
        body: JSON.stringify(toCartPayload(items))
      })
    );
    invalidateCartCache();
    return cart;
  },
  add: async (payload) => {
    const cart = normalizeCartResponse(
      await http("/cart/add", {
        method: "POST",
        body: JSON.stringify({
          productId: payload.productId,
          quantity: payload.quantity || 1,
          size: payload.size || ""
        })
      })
    );
    invalidateCartCache();
    return cart;
  },
  update: async (payload) => {
    const cart = normalizeCartResponse(
      await http("/cart/update", {
        method: "PUT",
        body: JSON.stringify({
          itemId: payload.itemId,
          productId: payload.productId,
          quantity: payload.quantity,
          size: payload.size || ""
        })
      })
    );
    invalidateCartCache();
    return cart;
  },
  remove: async (payload) => {
    const identifier = payload.itemId || payload.productId || "";
    const cart = normalizeCartResponse(
      await http(
        `/cart/remove/${identifier}${queryString({
          ...payload.itemId ? { itemId: payload.itemId } : {},
          ...payload.productId ? { productId: payload.productId } : {},
          ...payload.size ? { size: payload.size } : {}
        })}`,
        {
          method: "DELETE"
        }
      )
    );
    invalidateCartCache();
    return cart;
  },
  clear: async () => {
    const cart = normalizeCartResponse(
      await http("/cart/clear", { method: "DELETE" })
    );
    invalidateCartCache();
    return cart;
  }
};
const adminApi = {
  analytics: async (params = {}, options = {}) => http(`/admin/analytics${queryString(params)}`, {
    forceFresh: options.forceFresh ?? true
  }),
  clearAnalytics: async () => {
    const response = await http("/admin/analytics/clear-test-data", {
      method: "DELETE"
    });
    invalidateProxyCache("/admin", "/orders", "/users", "/cart");
    invalidateOrdersCache();
    emitDataEvent("purefumes:orders-changed");
    return response;
  },
  clearActivity: async () => {
    const response = await http("/admin/analytics/activity", {
      method: "DELETE"
    });
    invalidateProxyCache("/admin/analytics");
    return response;
  },
  clearOrders: async () => {
    const response = await http("/admin/orders", { method: "DELETE" });
    invalidateProxyCache("/admin", "/orders", "/users");
    invalidateOrdersCache();
    emitDataEvent("purefumes:orders-changed");
    return response;
  },
  clearUsers: async () => {
    const response = await http("/admin/users", { method: "DELETE" });
    invalidateProxyCache("/admin", "/users", "/cart");
    return response;
  },
  orders: async (params = {}) => {
    const data = await http(`/admin/orders${queryString(params)}`);
    return {
      ...data,
      orders: data.orders.map(normalizeOrder)
    };
  },
  users: async (params = {}) => http(`/admin/users${queryString(params)}`),
  userDetails: async (id) => http(`/admin/user/${id}`),
  userOrders: async (id, params = {}) => http(`/admin/user/${id}/orders${queryString(params)}`),
  banUser: async (id, isBanned) => {
    const response = await http(`/admin/ban-user/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ isBanned })
    });
    invalidateProxyCache("/admin/users", `/admin/user/${id}`, "/admin/analytics");
    return response.user;
  },
  deleteUser: async (id) => http(`/admin/user/${id}`, {
    method: "DELETE"
  }).then((response) => {
    invalidateProxyCache("/admin/users", `/admin/user/${id}`, "/admin/analytics");
    return response;
  })
};
const paymentsApi = {
  getConfig: async () => {
    if (cachedPaymentConfig) {
      return cachedPaymentConfig;
    }
    const data = await http("/payments/razorpay/config");
    cachedPaymentConfig = {
      keyId: String(data.keyId || "").trim(),
      bypassEnabled: Boolean(data.bypassEnabled),
      provider: String(data.provider || "razorpay"),
      mode: data.mode === "test" ? "test" : "live"
    };
    return cachedPaymentConfig;
  },
  getSettings: async () => {
    const data = await http("/payments/settings");
    return {
      id: data.id ? String(data.id) : void 0,
      paymentMode: data.paymentMode === "test" ? "test" : "live",
      isPersisted: Boolean(data.isPersisted),
      updatedAt: data.updatedAt || null
    };
  },
  updateSettings: async (paymentMode) => {
    const data = await http("/payments/settings", {
      method: "PUT",
      body: JSON.stringify({ paymentMode })
    });
    cachedPaymentConfig = {
      keyId: String(data.keyId || "").trim(),
      bypassEnabled: Boolean(data.bypassEnabled),
      provider: String(data.provider || "razorpay"),
      mode: data.mode === "test" ? "test" : "live"
    };
    return {
      id: data.id ? String(data.id) : void 0,
      paymentMode: data.paymentMode === "test" ? "test" : "live",
      isPersisted: Boolean(data.isPersisted),
      updatedAt: data.updatedAt || null,
      ...cachedPaymentConfig
    };
  },
  getRazorpayKey: async () => {
    const config = await paymentsApi.getConfig();
    return String(config.keyId || "").trim();
  },
  createOrder: async (input) => http("/payments/create-order", {
    method: "POST",
    body: JSON.stringify(input)
  }),
  verifyPayment: async (input) => http("/payments/verify-payment", {
    method: "POST",
    body: JSON.stringify(input)
  })
};
const isUsingMock = false;
const emptySet = /* @__PURE__ */ new Set();
const listeners = /* @__PURE__ */ new Set();
let wishlistToggleAction = null;
let snapshot = {
  cartCount: 0,
  cartTotal: 0,
  wishlistCount: 0,
  wishlistIds: emptySet,
  pendingWishlistIds: emptySet,
  userId: null,
  authReady: false,
  isAuthenticated: false
};
const normalizeIds = (ids) => new Set(
  Array.from(ids || []).map((id) => String(id || "").trim()).filter(Boolean)
);
const setsEqual = (left, right) => {
  if (left.size !== right.size) return false;
  for (const value of left) {
    if (!right.has(value)) return false;
  }
  return true;
};
const emit = () => {
  listeners.forEach((listener) => listener());
};
const subscribe = (listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const getSnapshot = () => snapshot;
const uiStateObserver = {
  subscribe,
  getSnapshot,
  updateCart(update) {
    const nextCount = Math.max(0, Math.trunc(Number(update.count) || 0));
    const nextTotal = Math.max(0, Number(update.total) || 0);
    if (snapshot.cartCount === nextCount && snapshot.cartTotal === nextTotal) {
      return;
    }
    snapshot = {
      ...snapshot,
      cartCount: nextCount,
      cartTotal: nextTotal
    };
    emit();
    frontendEventBus.publish("cart:changed", {
      count: nextCount,
      total: nextTotal
    });
  },
  updateWishlist(update) {
    const nextIds = normalizeIds(update.ids);
    const nextPendingIds = update.pendingIds ? normalizeIds(update.pendingIds) : snapshot.pendingWishlistIds;
    if (setsEqual(snapshot.wishlistIds, nextIds) && setsEqual(snapshot.pendingWishlistIds, nextPendingIds)) {
      return;
    }
    snapshot = {
      ...snapshot,
      wishlistCount: nextIds.size,
      wishlistIds: nextIds,
      pendingWishlistIds: nextPendingIds
    };
    emit();
    frontendEventBus.publish("wishlist:changed", {
      count: nextIds.size,
      ids: Array.from(nextIds)
    });
  },
  updatePendingWishlist(productId, pending) {
    const normalizedId = String(productId || "").trim();
    if (!normalizedId) return;
    const nextPendingIds = new Set(snapshot.pendingWishlistIds);
    if (pending) {
      nextPendingIds.add(normalizedId);
    } else {
      nextPendingIds.delete(normalizedId);
    }
    if (setsEqual(snapshot.pendingWishlistIds, nextPendingIds)) {
      return;
    }
    snapshot = {
      ...snapshot,
      pendingWishlistIds: nextPendingIds
    };
    emit();
  },
  updateAuth(update) {
    if (snapshot.userId === update.userId && snapshot.authReady === update.authReady && snapshot.isAuthenticated === update.isAuthenticated) {
      return;
    }
    snapshot = {
      ...snapshot,
      userId: update.userId,
      authReady: update.authReady,
      isAuthenticated: update.isAuthenticated
    };
    emit();
    frontendEventBus.publish("auth:changed", {
      userId: update.userId,
      isAuthenticated: update.isAuthenticated,
      ready: update.authReady
    });
  }
};
const uiActionObserver = {
  setWishlistToggle(action) {
    wishlistToggleAction = action;
    return () => {
      if (wishlistToggleAction === action) {
        wishlistToggleAction = null;
      }
    };
  },
  toggleWishlist(product) {
    return wishlistToggleAction?.(product) ?? false;
  }
};
function useNavbarCounters() {
  const cartCount = reactExports.useSyncExternalStore(subscribe, () => snapshot.cartCount, () => 0);
  const wishlistCount = reactExports.useSyncExternalStore(subscribe, () => snapshot.wishlistCount, () => 0);
  return reactExports.useMemo(
    () => ({
      cartCount,
      wishlistCount
    }),
    [cartCount, wishlistCount]
  );
}
function useWishlistStatus(productId) {
  const normalizedId = String(productId || "").trim();
  const active = reactExports.useSyncExternalStore(
    subscribe,
    () => Boolean(normalizedId && snapshot.wishlistIds.has(normalizedId)),
    () => false
  );
  const pending = reactExports.useSyncExternalStore(
    subscribe,
    () => Boolean(normalizedId && snapshot.pendingWishlistIds.has(normalizedId)),
    () => false
  );
  return reactExports.useMemo(
    () => ({
      active,
      pending
    }),
    [active, pending]
  );
}
const authQueryKey = ["auth", "session"];
const authSessionQueryOptions = () => ({
  queryKey: authQueryKey,
  queryFn: async () => accountApi.me(),
  retry: false,
  staleTime: 15e3
});
const AUTH_SNAPSHOT_KEY = "purefumes:auth-snapshot";
const AuthCtx = reactExports.createContext(null);
const readAuthSnapshot = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(AUTH_SNAPSHOT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
};
const writeAuthSnapshot = (user) => {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      window.sessionStorage.setItem(AUTH_SNAPSHOT_KEY, JSON.stringify(user));
    } else {
      window.sessionStorage.removeItem(AUTH_SNAPSHOT_KEY);
    }
  } catch (_error) {
  }
};
function AuthProvider({ children }) {
  const queryClient2 = useQueryClient();
  const authActionRef = reactExports.useRef(null);
  const sessionQuery = useQuery({
    ...authSessionQueryOptions(),
    initialData: readAuthSnapshot,
    initialDataUpdatedAt: 0
  });
  const user = sessionQuery.data ?? null;
  const authReady = sessionQuery.isFetched;
  reactExports.useEffect(() => {
    writeAuthSnapshot(user);
    uiStateObserver.updateAuth({
      userId: user?.id || null,
      authReady,
      isAuthenticated: Boolean(user)
    });
  }, [authReady, user]);
  const reloadUser = reactExports.useCallback(async () => {
    const nextUser = await queryClient2.fetchQuery(authSessionQueryOptions());
    queryClient2.setQueryData(authQueryKey, nextUser);
    return nextUser;
  }, [queryClient2]);
  const runLockedAuthAction = reactExports.useCallback(
    async (action) => {
      if (authActionRef.current) {
        return authActionRef.current;
      }
      authActionRef.current = action().finally(() => {
        authActionRef.current = null;
      });
      return authActionRef.current;
    },
    []
  );
  const login = reactExports.useCallback(
    async (identifier, password) => {
      const nextUser = await runLockedAuthAction(() => accountApi.login(identifier, password));
      queryClient2.setQueryData(authQueryKey, nextUser);
      return nextUser;
    },
    [queryClient2, runLockedAuthAction]
  );
  const signup = reactExports.useCallback(
    async (payload) => {
      const nextUser = await runLockedAuthAction(() => accountApi.signup(payload));
      queryClient2.setQueryData(authQueryKey, nextUser);
      return nextUser;
    },
    [queryClient2, runLockedAuthAction]
  );
  const logout = reactExports.useCallback(async () => {
    try {
      await accountApi.logout();
    } finally {
      queryClient2.setQueryData(authQueryKey, null);
    }
  }, [queryClient2]);
  const value = reactExports.useMemo(
    () => ({
      user,
      authReady,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout,
      reloadUser
    }),
    [authReady, login, logout, reloadUser, signup, user]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthCtx.Provider, { value, children });
}
function useAuth() {
  const ctx = reactExports.useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
const Ctx = reactExports.createContext(null);
const GUEST_CART_STORAGE_KEY = "purefumes_guest_cart";
const LEGACY_CART_STORAGE_KEY = "purefumes_cart";
const WISHLIST_STORAGE_KEY = "purefumes_wishlist";
const getCartKey = (product, size) => `${product.id}:${size.size}`;
const getProductKey = (product) => String(product.id || product._id || "").trim();
const dedupeProducts = (products) => {
  const seen = /* @__PURE__ */ new Set();
  return products.filter((product) => {
    const productId = getProductKey(product);
    if (!productId || seen.has(productId)) return false;
    seen.add(productId);
    return true;
  });
};
const clampQuantity = (quantity, stock) => {
  const max2 = Math.max(1, stock || 1);
  return Math.min(Math.max(1, Math.trunc(quantity) || 1), max2);
};
const readGuestCart = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_CART_STORAGE_KEY) || window.localStorage.getItem(LEGACY_CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => {
      if (!item?.product?.id || !item?.size?.size) return null;
      const price = normalizeMoney(item.size.price);
      const quantity = clampQuantity(Number(item.quantity), Number(item.product.stock || 1));
      if (!Number.isFinite(price)) return null;
      return {
        id: item.id ? String(item.id) : void 0,
        key: String(item.key || getCartKey(item.product, item.size)),
        product: item.product,
        size: { size: String(item.size.size), price },
        quantity
      };
    }).filter((item) => item !== null);
  } catch (_error) {
    return [];
  }
};
const writeGuestCart = (items) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
    window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
  } catch (_error) {
  }
};
const clearGuestCart = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
  } catch (_error) {
  }
};
const readStoredWishlist = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = /* @__PURE__ */ new Set();
    return parsed.map((product) => {
      if (!product || typeof product !== "object") return null;
      const nextProduct = product;
      const productId = getProductKey(nextProduct);
      if (!productId || seen.has(productId)) return null;
      seen.add(productId);
      return {
        ...nextProduct,
        id: productId,
        sizes: Array.isArray(nextProduct.sizes) && nextProduct.sizes.length ? nextProduct.sizes : [{ size: "Standard", price: normalizeMoney(nextProduct.price || 0) }]
      };
    }).filter((product) => Boolean(product));
  } catch (_error) {
    return [];
  }
};
function AppProvider({ children }) {
  const { user, authReady } = useAuth();
  const customerUser = user?.role === "user" ? user : null;
  const guestCartRef = reactExports.useRef(readGuestCart());
  const [cart, setCart] = reactExports.useState(guestCartRef.current);
  const [cartSummary, setCartSummary] = reactExports.useState({
    totalItems: guestCartRef.current.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: addMoney(
      ...guestCartRef.current.map((item) => multiplyMoney(item.size.price, item.quantity))
    ),
    discount: 0,
    finalTotal: addMoney(
      ...guestCartRef.current.map((item) => multiplyMoney(item.size.price, item.quantity))
    )
  });
  const [wishlist, setWishlist] = reactExports.useState(readStoredWishlist);
  const [checkoutOpen, setCheckoutOpen] = reactExports.useState(false);
  const [cartCoupon, setCartCoupon] = reactExports.useState(null);
  const [cartCouponMessage, setCartCouponMessage] = reactExports.useState("");
  const [cartCouponTone, setCartCouponTone] = reactExports.useState(null);
  const [cartCouponLoading, setCartCouponLoading] = reactExports.useState(false);
  const [pendingWishlistIds, setPendingWishlistIds] = reactExports.useState(() => /* @__PURE__ */ new Set());
  const mergedUserIdRef = reactExports.useRef(null);
  const syncedWishlistUserIdRef = reactExports.useRef(null);
  const pendingWishlistIdsRef = reactExports.useRef(/* @__PURE__ */ new Set());
  const cartMutationSeqRef = reactExports.useRef(0);
  const cartToApiItems = reactExports.useCallback(
    (items) => items.map((item) => ({
      productId: item.product.id || item.product._id || "",
      quantity: item.quantity,
      size: item.size.size
    })).filter((item) => item.productId),
    []
  );
  const apiCartToLocal = reactExports.useCallback((apiCart) => {
    return apiCart.products.map((item) => ({
      id: item.id,
      key: item.key || `${item.product.id}:${item.size.size}`,
      product: item.product,
      size: item.size,
      quantity: item.quantity
    }));
  }, []);
  const applyServerCart = reactExports.useCallback(
    (serverCart) => {
      setCart(apiCartToLocal(serverCart));
      setCartSummary({
        totalItems: serverCart.totalItems,
        subtotal: serverCart.subtotal,
        discount: serverCart.discount,
        finalTotal: serverCart.finalTotal
      });
    },
    [apiCartToLocal]
  );
  const applyGuestCart = reactExports.useCallback((items) => {
    guestCartRef.current = items;
    writeGuestCart(items);
    setCart(items);
    const subtotal = addMoney(...items.map((item) => multiplyMoney(item.size.price, item.quantity)));
    setCartSummary({
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      discount: 0,
      finalTotal: subtotal
    });
  }, []);
  reactExports.useEffect(() => {
    if (!authReady) return;
    if (!customerUser) {
      mergedUserIdRef.current = null;
      const nextGuestCart = readGuestCart();
      guestCartRef.current = nextGuestCart;
      applyGuestCart(nextGuestCart);
      return;
    }
    if (mergedUserIdRef.current === customerUser.id) {
      return;
    }
    mergedUserIdRef.current = customerUser.id;
    const synchronizeCart = async () => {
      const guestItems = guestCartRef.current;
      const serverCart = guestItems.length ? await cartApi.merge(cartToApiItems(guestItems)) : await cartApi.get();
      applyServerCart(serverCart);
      clearGuestCart();
      guestCartRef.current = [];
    };
    void synchronizeCart().catch(() => {
      mergedUserIdRef.current = null;
    });
  }, [applyGuestCart, applyServerCart, authReady, cartToApiItems, customerUser]);
  reactExports.useEffect(() => {
    if (!authReady) return;
    if (customerUser) {
      syncedWishlistUserIdRef.current = null;
      return;
    }
    setWishlist(readStoredWishlist());
  }, [authReady, customerUser]);
  reactExports.useEffect(() => {
    if (!authReady || !customerUser) return;
    if (syncedWishlistUserIdRef.current === customerUser.id) {
      return;
    }
    syncedWishlistUserIdRef.current = customerUser.id;
    const synchronizeWishlist = async () => {
      const guestWishlist = readStoredWishlist();
      const guestProductIds = guestWishlist.map(getProductKey).filter(Boolean);
      if (guestProductIds.length) {
        await Promise.allSettled(
          Array.from(new Set(guestProductIds)).map(
            (productId) => productsApi.addToWishlist(productId)
          )
        );
        try {
          window.localStorage.removeItem(WISHLIST_STORAGE_KEY);
        } catch (_error) {
        }
      }
      setWishlist(dedupeProducts(await productsApi.wishlist()));
    };
    void synchronizeWishlist().catch(async () => {
      syncedWishlistUserIdRef.current = null;
      try {
        setWishlist(dedupeProducts(await productsApi.wishlist()));
      } catch (_error) {
      }
    });
  }, [authReady, customerUser]);
  reactExports.useEffect(() => {
    if (!authReady || customerUser) return;
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (_error) {
    }
  }, [authReady, customerUser, wishlist]);
  const wishlistIdSet = reactExports.useMemo(
    () => new Set(wishlist.map((product) => getProductKey(product)).filter(Boolean)),
    [wishlist]
  );
  const isWishlisted = reactExports.useCallback(
    (productId) => Boolean(productId && wishlistIdSet.has(productId)),
    [wishlistIdSet]
  );
  const setWishlistPending = reactExports.useCallback((productId, pending) => {
    const nextPendingIds = new Set(pendingWishlistIdsRef.current);
    if (pending) {
      nextPendingIds.add(productId);
    } else {
      nextPendingIds.delete(productId);
    }
    pendingWishlistIdsRef.current = nextPendingIds;
    setPendingWishlistIds(nextPendingIds);
    uiStateObserver.updatePendingWishlist(productId, pending);
  }, []);
  const isWishlistPending = reactExports.useCallback(
    (productId) => Boolean(productId && pendingWishlistIds.has(productId)),
    [pendingWishlistIds]
  );
  const toggleWishlist = reactExports.useCallback(
    (product) => {
      const productId = getProductKey(product);
      if (!productId) return false;
      if (pendingWishlistIdsRef.current.has(productId)) {
        return isWishlisted(productId);
      }
      const added = !wishlist.some((item) => getProductKey(item) === productId);
      const previousWishlist = wishlist;
      setWishlist((current) => {
        const exists = current.some((item) => getProductKey(item) === productId);
        if (exists) {
          return current.filter((item) => getProductKey(item) !== productId);
        }
        return [{ ...product, id: productId }, ...current];
      });
      if (customerUser) {
        setWishlistPending(productId, true);
        const mutation = added ? productsApi.addToWishlist(productId) : productsApi.removeFromWishlist(productId);
        void mutation.then((nextWishlist) => setWishlist(dedupeProducts(nextWishlist))).catch(async () => {
          try {
            setWishlist(dedupeProducts(await productsApi.wishlist()));
          } catch (_error) {
            setWishlist(previousWishlist);
          }
        }).finally(() => {
          setWishlistPending(productId, false);
        });
      }
      return added;
    },
    [customerUser, isWishlisted, setWishlistPending, wishlist]
  );
  const removeFromWishlist = reactExports.useCallback(
    async (productId) => {
      if (pendingWishlistIdsRef.current.has(productId)) {
        return wishlist;
      }
      const previousWishlist = wishlist;
      setWishlist((current) => current.filter((item) => getProductKey(item) !== productId));
      if (customerUser) {
        setWishlistPending(productId, true);
        try {
          const nextWishlist = dedupeProducts(await productsApi.removeFromWishlist(productId));
          setWishlist(nextWishlist);
          return nextWishlist;
        } catch (error) {
          try {
            const nextWishlist = dedupeProducts(await productsApi.wishlist());
            setWishlist(nextWishlist);
            return nextWishlist;
          } catch (_error) {
            setWishlist(previousWishlist);
          }
          throw error;
        } finally {
          setWishlistPending(productId, false);
        }
      }
      return void 0;
    },
    [customerUser, setWishlistPending, wishlist]
  );
  const clearWishlist = reactExports.useCallback(() => {
    const previousWishlist = wishlist;
    setWishlist([]);
    if (customerUser) {
      void productsApi.clearWishlist().then((nextWishlist) => setWishlist(dedupeProducts(nextWishlist))).catch(() => setWishlist(previousWishlist));
    }
  }, [customerUser, wishlist]);
  const clearCartCoupon = reactExports.useCallback(() => {
    setCartCoupon(null);
    setCartCouponMessage("");
    setCartCouponTone(null);
    setCartCouponLoading(false);
  }, []);
  const invalidateCartCoupon = reactExports.useCallback(() => {
    if (!cartCoupon) {
      return;
    }
    setCartCoupon(null);
    setCartCouponLoading(false);
    setCartCouponMessage("Coupon removed because cart changed. Apply it again to recalculate.");
    setCartCouponTone("info");
  }, [cartCoupon]);
  const applyCartCoupon = reactExports.useCallback(
    async (couponCode) => {
      const trimmedCode = couponCode.trim();
      if (!trimmedCode) {
        setCartCoupon(null);
        setCartCouponMessage("Enter a coupon code.");
        setCartCouponTone("error");
        return false;
      }
      if (!cart.length) {
        setCartCoupon(null);
        setCartCouponMessage("Add items to your cart before applying a coupon.");
        setCartCouponTone("error");
        return false;
      }
      setCartCouponLoading(true);
      try {
        const result = await couponsApi.apply({
          code: trimmedCode,
          items: cart.map((item) => ({
            productId: item.product.id || item.product._id || "",
            name: item.product.name,
            price: item.size.price,
            quantity: item.quantity,
            size: item.size.size
          }))
        });
        if (!result || result.success === false) {
          setCartCoupon(null);
          setCartCouponMessage(result?.message || "Invalid coupon code");
          setCartCouponTone("error");
          return false;
        }
        const discountAmount = normalizeMoney(
          result.discount ?? result.coupon?.discountValue ?? 0
        );
        const resultSubtotal = normalizeMoney(result.subtotal ?? cartSummary.subtotal);
        const fallbackTotals = calculateCheckoutTotals({
          subtotal: resultSubtotal,
          discount: discountAmount
        });
        const resultFinalTotal = normalizeMoney(result.finalTotal ?? fallbackTotals.finalPayable);
        setCartCoupon({
          code: result.coupon?.code || result.code || trimmedCode.toUpperCase(),
          discount: discountAmount,
          finalTotal: resultFinalTotal,
          subtotal: resultSubtotal
        });
        setCartCouponMessage(result.message || "Coupon applied successfully");
        setCartCouponTone("success");
        return true;
      } catch (error) {
        setCartCoupon(null);
        setCartCouponMessage(
          error instanceof Error ? error.message : "Coupon could not be applied."
        );
        setCartCouponTone("error");
        return false;
      } finally {
        setCartCouponLoading(false);
      }
    },
    [cart, cartSummary.subtotal]
  );
  const removeCartCoupon = reactExports.useCallback(() => {
    clearCartCoupon();
  }, [clearCartCoupon]);
  const syncAuthenticatedMutation = reactExports.useCallback(
    async (mutation) => {
      const sequence = ++cartMutationSeqRef.current;
      try {
        const serverCart = await mutation();
        if (sequence === cartMutationSeqRef.current) {
          applyServerCart(serverCart);
        }
      } catch (_error) {
        if (customerUser && sequence === cartMutationSeqRef.current) {
          const refreshed = await cartApi.get();
          applyServerCart(refreshed);
        }
      }
    },
    [applyServerCart, customerUser]
  );
  const addToCart = reactExports.useCallback(
    (product, size, quantity = 1) => {
      invalidateCartCoupon();
      if (customerUser) {
        void syncAuthenticatedMutation(
          () => cartApi.add({
            productId: product.id || product._id || "",
            quantity: clampQuantity(quantity, product.stock),
            size: size.size
          })
        );
        return;
      }
      const nextGuestCart = (() => {
        const current = [...guestCartRef.current];
        const key = getCartKey(product, size);
        const existing = current.find((item) => item.key === key);
        if (existing) {
          return current.map(
            (item) => item.key === key ? { ...item, quantity: clampQuantity(item.quantity + quantity, product.stock) } : item
          );
        }
        return [
          ...current,
          {
            key,
            product,
            size,
            quantity: clampQuantity(quantity, product.stock)
          }
        ];
      })();
      applyGuestCart(nextGuestCart);
    },
    [applyGuestCart, customerUser, invalidateCartCoupon, syncAuthenticatedMutation]
  );
  const updateCartQuantity = reactExports.useCallback(
    (key, quantity) => {
      invalidateCartCoupon();
      if (customerUser) {
        const item = cart.find((candidate) => candidate.key === key);
        if (!item) return;
        void syncAuthenticatedMutation(
          () => cartApi.update({
            itemId: item.id,
            productId: item.product.id || item.product._id || "",
            quantity: clampQuantity(quantity, item.product.stock),
            size: item.size.size
          })
        );
        return;
      }
      const nextGuestCart = guestCartRef.current.map(
        (item) => item.key === key ? { ...item, quantity: clampQuantity(quantity, item.product.stock) } : item
      );
      applyGuestCart(nextGuestCart);
    },
    [applyGuestCart, cart, customerUser, invalidateCartCoupon, syncAuthenticatedMutation]
  );
  const removeFromCart = reactExports.useCallback(
    (key) => {
      invalidateCartCoupon();
      if (customerUser) {
        const item = cart.find((candidate) => candidate.key === key);
        if (!item) return;
        void syncAuthenticatedMutation(
          () => cartApi.remove({
            itemId: item.id,
            productId: item.product.id || item.product._id || "",
            size: item.size.size
          })
        );
        return;
      }
      applyGuestCart(guestCartRef.current.filter((item) => item.key !== key));
    },
    [applyGuestCart, cart, customerUser, invalidateCartCoupon, syncAuthenticatedMutation]
  );
  const clearCart = reactExports.useCallback(() => {
    clearCartCoupon();
    if (customerUser) {
      void syncAuthenticatedMutation(() => cartApi.clear());
      return;
    }
    guestCartRef.current = [];
    clearGuestCart();
    applyGuestCart([]);
  }, [applyGuestCart, clearCartCoupon, customerUser, syncAuthenticatedMutation]);
  const reloadCart = reactExports.useCallback(async () => {
    if (customerUser) {
      applyServerCart(await cartApi.get());
      return;
    }
    const nextGuestCart = readGuestCart();
    guestCartRef.current = nextGuestCart;
    applyGuestCart(nextGuestCart);
  }, [applyGuestCart, applyServerCart, customerUser]);
  const openCheckout = reactExports.useCallback(() => {
    setCheckoutOpen(true);
  }, []);
  const closeCheckout = reactExports.useCallback(() => {
    setCheckoutOpen(false);
  }, []);
  const guestCartCount = reactExports.useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const guestSubtotal = reactExports.useMemo(
    () => addMoney(...cart.map((item) => multiplyMoney(item.size.price, item.quantity))),
    [cart, cartSummary.subtotal]
  );
  const cartCount = customerUser ? cartSummary.totalItems : guestCartCount;
  const cartTotal = customerUser ? cartSummary.subtotal : guestSubtotal;
  const cartDiscount = cartCoupon?.discount ?? 0;
  const fallbackCartTotals = calculateCheckoutTotals({
    subtotal: cartTotal,
    discount: cartDiscount
  });
  const cartFinalTotal = cartCoupon?.finalTotal ?? fallbackCartTotals.finalPayable;
  const cartCouponCode = cartCoupon?.code ?? "";
  const wishlistCount = wishlist.length;
  reactExports.useEffect(() => uiActionObserver.setWishlistToggle(toggleWishlist), [toggleWishlist]);
  reactExports.useEffect(() => {
    uiStateObserver.updateCart({
      count: cartCount,
      total: cartTotal
    });
  }, [cartCount, cartTotal]);
  reactExports.useEffect(() => {
    uiStateObserver.updateWishlist({
      ids: wishlist.map(getProductKey),
      pendingIds: Array.from(pendingWishlistIds)
    });
  }, [pendingWishlistIds, wishlist]);
  const value = reactExports.useMemo(
    () => ({
      cart,
      cartCount,
      cartTotal,
      cartDiscount,
      cartFinalTotal,
      cartCouponCode,
      cartCouponMessage,
      cartCouponTone,
      cartCouponLoading,
      wishlist,
      wishlistCount,
      isWishlisted,
      isWishlistPending,
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
      applyCartCoupon,
      removeCartCoupon,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      reloadCart,
      checkoutOpen,
      openCheckout,
      closeCheckout
    }),
    [
      addToCart,
      applyCartCoupon,
      cart,
      cartCount,
      cartCouponCode,
      cartCouponLoading,
      cartCouponMessage,
      cartCouponTone,
      cartDiscount,
      cartFinalTotal,
      cartTotal,
      checkoutOpen,
      clearCart,
      clearWishlist,
      closeCheckout,
      isWishlisted,
      isWishlistPending,
      openCheckout,
      reloadCart,
      removeCartCoupon,
      removeFromCart,
      removeFromWishlist,
      toggleWishlist,
      updateCartQuantity,
      wishlist,
      wishlistCount
    ]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Ctx.Provider, { value, children });
}
function useApp() {
  const ctx = reactExports.useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
const NotificationContext = reactExports.createContext(null);
const NOTIFICATION_DURATION_MS = 3e3;
const getNotificationIcon = (type2) => {
  if (type2 === "error") return CircleAlert;
  if (type2 === "info") return Info;
  return CircleCheck;
};
const typeStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-sky-200 bg-sky-50 text-sky-900"
};
function NotificationProvider({ children }) {
  const [notifications, setNotifications] = reactExports.useState([]);
  const timeoutsRef = reactExports.useRef(/* @__PURE__ */ new Map());
  const removeNotification = reactExports.useCallback((id) => {
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);
  const addNotification = reactExports.useCallback(
    (message, type2 = "success") => {
      const cleanMessage = message.trim();
      if (!cleanMessage) return;
      const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      setNotifications((current) => [...current, { id, message: cleanMessage, type: type2 }]);
      const timeoutId = window.setTimeout(() => {
        removeNotification(id);
      }, NOTIFICATION_DURATION_MS);
      timeoutsRef.current.set(id, timeoutId);
    },
    [removeNotification]
  );
  reactExports.useEffect(
    () => () => {
      timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutsRef.current.clear();
    },
    []
  );
  const value = reactExports.useMemo(
    () => ({ addNotification, removeNotification }),
    [addNotification, removeNotification]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(NotificationContext.Provider, { value, children: [
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed right-5 top-5 z-[140] w-[min(24rem,calc(100vw-2.5rem))] space-y-3", children: notifications.map((notification) => {
      const Icon = getNotificationIcon(notification.type);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `flex items-start gap-3 rounded-lg border px-4 py-3 shadow-luxe transition ${typeStyles[notification.type]}`,
          role: "status",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "mt-0.5 h-4 w-4 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "flex-1 text-sm leading-5", children: notification.message }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => removeNotification(notification.id),
                className: "rounded-full p-1 opacity-60 transition hover:bg-white/60 hover:opacity-100",
                "aria-label": "Dismiss notification",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
              }
            )
          ]
        },
        notification.id
      );
    }) })
  ] });
}
function useNotification() {
  const context = reactExports.useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
const isOffline = () => typeof navigator !== "undefined" && navigator.onLine === false;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3e4,
      gcTime: 5 * 6e4,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry(failureCount, error) {
        if (isOffline()) return false;
        if (failureCount >= 1) return false;
        const status = Number(error?.status || 0);
        if (status >= 400 && status < 500) return false;
        return true;
      }
    },
    mutations: {
      retry: 0
    }
  }
});
const brandIconUrl = "/assets/purefumes-hyderabad-logo-circle-Bb6k8MEB.png";
const appCss = "/assets/styles-5iLAqbdQ.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-7xl text-gold", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 font-display text-2xl", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "This fragrance has eluded us." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center bg-gold text-ink px-6 py-3 text-xs uppercase tracking-[0.3em]",
        children: "Return Home"
      }
    ) })
  ] }) });
}
const Route$G = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Purefumes Hyderabad - Authentic Perfumes Online in India" },
      {
        name: "description",
        content: "Shop authentic perfumes, deodorants, and personal care products from Purefumes Hyderabad with secure checkout, support, and fast delivery across India."
      },
      { name: "theme-color", content: "#fffaf4" },
      { property: "og:site_name", content: "Purefumes Hyderabad" },
      { property: "og:title", content: "Purefumes Hyderabad - Authentic Perfumes Online" },
      {
        property: "og:description",
        content: "Authentic perfumes, secure checkout, customer support, and fast delivery across India from Purefumes Hyderabad."
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: brandIconUrl },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Purefumes Hyderabad" },
      {
        name: "twitter:description",
        content: "Shop authentic fragrances online with Purefumes Hyderabad."
      },
      { name: "twitter:image", content: brandIconUrl }
    ],
    links: [
      { rel: "icon", href: brandIconUrl, type: "image/png" },
      { rel: "apple-touch-icon", href: brandIconUrl },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: appCss }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    ErrorBoundary,
    {
      beforeCapture: (scope) => {
        scope.setTag("area", "react");
      },
      fallback: ({ error, resetError }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Something went wrong" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "An unexpected error occurred. Please try again." }),
        false,
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: resetError,
            className: "mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
            children: "Try again"
          }
        )
      ] }) }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuthProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AppProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        reactExports.Suspense,
        {
          fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-2xl text-navy", children: "Loading..." }) }) }),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {})
        }
      ) }) }) }) })
    }
  );
}
const $$splitComponentImporter$F = () => import("./wishlist-CfC4b8xU.js");
const Route$F = createFileRoute("/wishlist")({
  component: lazyRouteComponent($$splitComponentImporter$F, "component")
});
function Container({ children, className = "" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `mx-auto w-full min-w-0 max-w-[var(--container-max)] px-[var(--page-gutter)] ${className}`,
      children
    }
  );
}
const promoMessage = "Luxury Fragrances Delivered Across India + Free Shipping Above ₹2499";
const StickyOfferBar = reactExports.memo(function StickyOfferBar2() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "promo-bar", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "promo-bar__inner px-4 uppercase", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "promo-bar__viewport", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: promoMessage }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "promo-bar__track", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "promo-bar__text", children: promoMessage }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "promo-bar__text promo-bar__text--duplicate", children: promoMessage })
    ] })
  ] }) }) });
});
const genderCategoryPattern = /(^|\s)(men|mens|women|womens|unisex)(\s|$)/;
const normalizeCategoryValue = (value = "") => value.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const isGenderCategory = (category) => {
  const name = normalizeCategoryValue(category.name);
  const slug = normalizeCategoryValue(category.slug);
  return genderCategoryPattern.test(name) || genderCategoryPattern.test(slug);
};
const filterStorefrontCategories = (categories) => categories.filter((category) => category.isActive && !category.isDeleted && !isGenderCategory(category));
function CategoryRail({
  categories,
  activeSlug = "",
  allLabel = "All",
  allHref = "/shop",
  className = "",
  hrefBuilder
}) {
  const visibleCategories = categories.filter((category) => !isGenderCategory(category));
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `overflow-x-auto pb-1 no-scrollbar ${className}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-max gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "a",
      {
        href: allHref,
        className: `rounded-full border px-4 py-2.5 text-xs uppercase tracking-[0.18em] transition ${!activeSlug ? "border-navy bg-navy text-beige" : "border-border bg-[#fffaf4] text-navy/70 hover:border-navy/25 hover:text-navy"}`,
        children: allLabel
      }
    ),
    visibleCategories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "a",
      {
        href: hrefBuilder ? hrefBuilder(category) : `/category/${category.slug}`,
        className: `rounded-full border px-4 py-2.5 text-xs uppercase tracking-[0.18em] transition ${activeSlug === category.slug ? "border-navy bg-navy text-beige" : "border-border bg-[#fffaf4] text-navy/70 hover:border-navy/25 hover:text-navy"}`,
        children: category.name
      },
      category.id
    ))
  ] }) });
}
function useSearch(products) {
  const [query, setQuery] = reactExports.useState("");
  const [debouncedQuery, setDebouncedQuery] = reactExports.useState("");
  reactExports.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
    }, 180);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);
  const results = reactExports.useMemo(() => {
    if (!debouncedQuery) return [];
    return products.filter(
      (p) => p.name.toLowerCase().includes(debouncedQuery) || p.brand.toLowerCase().includes(debouncedQuery)
    );
  }, [debouncedQuery, products]);
  const onChange = reactExports.useCallback((v) => setQuery(v), []);
  const clear = reactExports.useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
  }, []);
  return { query, setQuery: onChange, clear, results };
}
const concatArrays = (array1, array2) => {
  const combinedArray = new Array(array1.length + array2.length);
  for (let i = 0; i < array1.length; i++) {
    combinedArray[i] = array1[i];
  }
  for (let i = 0; i < array2.length; i++) {
    combinedArray[array1.length + i] = array2[i];
  }
  return combinedArray;
};
const createClassValidatorObject = (classGroupId, validator2) => ({
  classGroupId,
  validator: validator2
});
const createClassPartObject = (nextPart = /* @__PURE__ */ new Map(), validators2 = null, classGroupId) => ({
  nextPart,
  validators: validators2,
  classGroupId
});
const CLASS_PART_SEPARATOR = "-";
const EMPTY_CONFLICTS = [];
const ARBITRARY_PROPERTY_PREFIX = "arbitrary..";
const createClassGroupUtils = (config) => {
  const classMap = createClassMap(config);
  const {
    conflictingClassGroups,
    conflictingClassGroupModifiers
  } = config;
  const getClassGroupId = (className) => {
    if (className.startsWith("[") && className.endsWith("]")) {
      return getGroupIdForArbitraryProperty(className);
    }
    const classParts = className.split(CLASS_PART_SEPARATOR);
    const startIndex = classParts[0] === "" && classParts.length > 1 ? 1 : 0;
    return getGroupRecursive(classParts, startIndex, classMap);
  };
  const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
    if (hasPostfixModifier) {
      const modifierConflicts = conflictingClassGroupModifiers[classGroupId];
      const baseConflicts = conflictingClassGroups[classGroupId];
      if (modifierConflicts) {
        if (baseConflicts) {
          return concatArrays(baseConflicts, modifierConflicts);
        }
        return modifierConflicts;
      }
      return baseConflicts || EMPTY_CONFLICTS;
    }
    return conflictingClassGroups[classGroupId] || EMPTY_CONFLICTS;
  };
  return {
    getClassGroupId,
    getConflictingClassGroupIds
  };
};
const getGroupRecursive = (classParts, startIndex, classPartObject) => {
  const classPathsLength = classParts.length - startIndex;
  if (classPathsLength === 0) {
    return classPartObject.classGroupId;
  }
  const currentClassPart = classParts[startIndex];
  const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
  if (nextClassPartObject) {
    const result = getGroupRecursive(classParts, startIndex + 1, nextClassPartObject);
    if (result) return result;
  }
  const validators2 = classPartObject.validators;
  if (validators2 === null) {
    return void 0;
  }
  const classRest = startIndex === 0 ? classParts.join(CLASS_PART_SEPARATOR) : classParts.slice(startIndex).join(CLASS_PART_SEPARATOR);
  const validatorsLength = validators2.length;
  for (let i = 0; i < validatorsLength; i++) {
    const validatorObj = validators2[i];
    if (validatorObj.validator(classRest)) {
      return validatorObj.classGroupId;
    }
  }
  return void 0;
};
const getGroupIdForArbitraryProperty = (className) => className.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
  const content = className.slice(1, -1);
  const colonIndex = content.indexOf(":");
  const property = content.slice(0, colonIndex);
  return property ? ARBITRARY_PROPERTY_PREFIX + property : void 0;
})();
const createClassMap = (config) => {
  const {
    theme,
    classGroups
  } = config;
  return processClassGroups(classGroups, theme);
};
const processClassGroups = (classGroups, theme) => {
  const classMap = createClassPartObject();
  for (const classGroupId in classGroups) {
    const group = classGroups[classGroupId];
    processClassesRecursively(group, classMap, classGroupId, theme);
  }
  return classMap;
};
const processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
  const len = classGroup.length;
  for (let i = 0; i < len; i++) {
    const classDefinition = classGroup[i];
    processClassDefinition(classDefinition, classPartObject, classGroupId, theme);
  }
};
const processClassDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  if (typeof classDefinition === "string") {
    processStringDefinition(classDefinition, classPartObject, classGroupId);
    return;
  }
  if (typeof classDefinition === "function") {
    processFunctionDefinition(classDefinition, classPartObject, classGroupId, theme);
    return;
  }
  processObjectDefinition(classDefinition, classPartObject, classGroupId, theme);
};
const processStringDefinition = (classDefinition, classPartObject, classGroupId) => {
  const classPartObjectToEdit = classDefinition === "" ? classPartObject : getPart(classPartObject, classDefinition);
  classPartObjectToEdit.classGroupId = classGroupId;
};
const processFunctionDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  if (isThemeGetter(classDefinition)) {
    processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
    return;
  }
  if (classPartObject.validators === null) {
    classPartObject.validators = [];
  }
  classPartObject.validators.push(createClassValidatorObject(classGroupId, classDefinition));
};
const processObjectDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  const entries = Object.entries(classDefinition);
  const len = entries.length;
  for (let i = 0; i < len; i++) {
    const [key, value] = entries[i];
    processClassesRecursively(value, getPart(classPartObject, key), classGroupId, theme);
  }
};
const getPart = (classPartObject, path) => {
  let current = classPartObject;
  const parts = path.split(CLASS_PART_SEPARATOR);
  const len = parts.length;
  for (let i = 0; i < len; i++) {
    const part = parts[i];
    let next = current.nextPart.get(part);
    if (!next) {
      next = createClassPartObject();
      current.nextPart.set(part, next);
    }
    current = next;
  }
  return current;
};
const isThemeGetter = (func) => "isThemeGetter" in func && func.isThemeGetter === true;
const createLruCache = (maxCacheSize) => {
  if (maxCacheSize < 1) {
    return {
      get: () => void 0,
      set: () => {
      }
    };
  }
  let cacheSize = 0;
  let cache2 = /* @__PURE__ */ Object.create(null);
  let previousCache = /* @__PURE__ */ Object.create(null);
  const update = (key, value) => {
    cache2[key] = value;
    cacheSize++;
    if (cacheSize > maxCacheSize) {
      cacheSize = 0;
      previousCache = cache2;
      cache2 = /* @__PURE__ */ Object.create(null);
    }
  };
  return {
    get(key) {
      let value = cache2[key];
      if (value !== void 0) {
        return value;
      }
      if ((value = previousCache[key]) !== void 0) {
        update(key, value);
        return value;
      }
    },
    set(key, value) {
      if (key in cache2) {
        cache2[key] = value;
      } else {
        update(key, value);
      }
    }
  };
};
const IMPORTANT_MODIFIER = "!";
const MODIFIER_SEPARATOR = ":";
const EMPTY_MODIFIERS = [];
const createResultObject = (modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition, isExternal) => ({
  modifiers,
  hasImportantModifier,
  baseClassName,
  maybePostfixModifierPosition,
  isExternal
});
const createParseClassName = (config) => {
  const {
    prefix,
    experimentalParseClassName
  } = config;
  let parseClassName = (className) => {
    const modifiers = [];
    let bracketDepth = 0;
    let parenDepth = 0;
    let modifierStart = 0;
    let postfixModifierPosition;
    const len = className.length;
    for (let index = 0; index < len; index++) {
      const currentCharacter = className[index];
      if (bracketDepth === 0 && parenDepth === 0) {
        if (currentCharacter === MODIFIER_SEPARATOR) {
          modifiers.push(className.slice(modifierStart, index));
          modifierStart = index + 1;
          continue;
        }
        if (currentCharacter === "/") {
          postfixModifierPosition = index;
          continue;
        }
      }
      if (currentCharacter === "[") bracketDepth++;
      else if (currentCharacter === "]") bracketDepth--;
      else if (currentCharacter === "(") parenDepth++;
      else if (currentCharacter === ")") parenDepth--;
    }
    const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.slice(modifierStart);
    let baseClassName = baseClassNameWithImportantModifier;
    let hasImportantModifier = false;
    if (baseClassNameWithImportantModifier.endsWith(IMPORTANT_MODIFIER)) {
      baseClassName = baseClassNameWithImportantModifier.slice(0, -1);
      hasImportantModifier = true;
    } else if (
      /**
       * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
       * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
       */
      baseClassNameWithImportantModifier.startsWith(IMPORTANT_MODIFIER)
    ) {
      baseClassName = baseClassNameWithImportantModifier.slice(1);
      hasImportantModifier = true;
    }
    const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : void 0;
    return createResultObject(modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition);
  };
  if (prefix) {
    const fullPrefix = prefix + MODIFIER_SEPARATOR;
    const parseClassNameOriginal = parseClassName;
    parseClassName = (className) => className.startsWith(fullPrefix) ? parseClassNameOriginal(className.slice(fullPrefix.length)) : createResultObject(EMPTY_MODIFIERS, false, className, void 0, true);
  }
  if (experimentalParseClassName) {
    const parseClassNameOriginal = parseClassName;
    parseClassName = (className) => experimentalParseClassName({
      className,
      parseClassName: parseClassNameOriginal
    });
  }
  return parseClassName;
};
const createSortModifiers = (config) => {
  const modifierWeights = /* @__PURE__ */ new Map();
  config.orderSensitiveModifiers.forEach((mod, index) => {
    modifierWeights.set(mod, 1e6 + index);
  });
  return (modifiers) => {
    const result = [];
    let currentSegment = [];
    for (let i = 0; i < modifiers.length; i++) {
      const modifier = modifiers[i];
      const isArbitrary = modifier[0] === "[";
      const isOrderSensitive = modifierWeights.has(modifier);
      if (isArbitrary || isOrderSensitive) {
        if (currentSegment.length > 0) {
          currentSegment.sort();
          result.push(...currentSegment);
          currentSegment = [];
        }
        result.push(modifier);
      } else {
        currentSegment.push(modifier);
      }
    }
    if (currentSegment.length > 0) {
      currentSegment.sort();
      result.push(...currentSegment);
    }
    return result;
  };
};
const createConfigUtils = (config) => ({
  cache: createLruCache(config.cacheSize),
  parseClassName: createParseClassName(config),
  sortModifiers: createSortModifiers(config),
  ...createClassGroupUtils(config)
});
const SPLIT_CLASSES_REGEX = /\s+/;
const mergeClassList = (classList, configUtils) => {
  const {
    parseClassName,
    getClassGroupId,
    getConflictingClassGroupIds,
    sortModifiers
  } = configUtils;
  const classGroupsInConflict = [];
  const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
  let result = "";
  for (let index = classNames.length - 1; index >= 0; index -= 1) {
    const originalClassName = classNames[index];
    const {
      isExternal,
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    } = parseClassName(originalClassName);
    if (isExternal) {
      result = originalClassName + (result.length > 0 ? " " + result : result);
      continue;
    }
    let hasPostfixModifier = !!maybePostfixModifierPosition;
    let classGroupId = getClassGroupId(hasPostfixModifier ? baseClassName.substring(0, maybePostfixModifierPosition) : baseClassName);
    if (!classGroupId) {
      if (!hasPostfixModifier) {
        result = originalClassName + (result.length > 0 ? " " + result : result);
        continue;
      }
      classGroupId = getClassGroupId(baseClassName);
      if (!classGroupId) {
        result = originalClassName + (result.length > 0 ? " " + result : result);
        continue;
      }
      hasPostfixModifier = false;
    }
    const variantModifier = modifiers.length === 0 ? "" : modifiers.length === 1 ? modifiers[0] : sortModifiers(modifiers).join(":");
    const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
    const classId = modifierId + classGroupId;
    if (classGroupsInConflict.indexOf(classId) > -1) {
      continue;
    }
    classGroupsInConflict.push(classId);
    const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
    for (let i = 0; i < conflictGroups.length; ++i) {
      const group = conflictGroups[i];
      classGroupsInConflict.push(modifierId + group);
    }
    result = originalClassName + (result.length > 0 ? " " + result : result);
  }
  return result;
};
const twJoin = (...classLists) => {
  let index = 0;
  let argument;
  let resolvedValue;
  let string = "";
  while (index < classLists.length) {
    if (argument = classLists[index++]) {
      if (resolvedValue = toValue(argument)) {
        string && (string += " ");
        string += resolvedValue;
      }
    }
  }
  return string;
};
const toValue = (mix) => {
  if (typeof mix === "string") {
    return mix;
  }
  let resolvedValue;
  let string = "";
  for (let k = 0; k < mix.length; k++) {
    if (mix[k]) {
      if (resolvedValue = toValue(mix[k])) {
        string && (string += " ");
        string += resolvedValue;
      }
    }
  }
  return string;
};
const createTailwindMerge = (createConfigFirst, ...createConfigRest) => {
  let configUtils;
  let cacheGet;
  let cacheSet;
  let functionToCall;
  const initTailwindMerge = (classList) => {
    const config = createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst());
    configUtils = createConfigUtils(config);
    cacheGet = configUtils.cache.get;
    cacheSet = configUtils.cache.set;
    functionToCall = tailwindMerge;
    return tailwindMerge(classList);
  };
  const tailwindMerge = (classList) => {
    const cachedResult = cacheGet(classList);
    if (cachedResult) {
      return cachedResult;
    }
    const result = mergeClassList(classList, configUtils);
    cacheSet(classList, result);
    return result;
  };
  functionToCall = initTailwindMerge;
  return (...args) => functionToCall(twJoin(...args));
};
const fallbackThemeArr = [];
const fromTheme = (key) => {
  const themeGetter = (theme) => theme[key] || fallbackThemeArr;
  themeGetter.isThemeGetter = true;
  return themeGetter;
};
const arbitraryValueRegex = /^\[(?:(\w[\w-]*):)?(.+)\]$/i;
const arbitraryVariableRegex = /^\((?:(\w[\w-]*):)?(.+)\)$/i;
const fractionRegex = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/;
const tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
const lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
const colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/;
const shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
const imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
const isFraction = (value) => fractionRegex.test(value);
const isNumber = (value) => !!value && !Number.isNaN(Number(value));
const isInteger = (value) => !!value && Number.isInteger(Number(value));
const isPercent = (value) => value.endsWith("%") && isNumber(value.slice(0, -1));
const isTshirtSize = (value) => tshirtUnitRegex.test(value);
const isAny = () => true;
const isLengthOnly = (value) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  lengthUnitRegex.test(value) && !colorFunctionRegex.test(value)
);
const isNever = () => false;
const isShadow = (value) => shadowRegex.test(value);
const isImage = (value) => imageRegex.test(value);
const isAnyNonArbitrary = (value) => !isArbitraryValue(value) && !isArbitraryVariable(value);
const isArbitrarySize = (value) => getIsArbitraryValue(value, isLabelSize, isNever);
const isArbitraryValue = (value) => arbitraryValueRegex.test(value);
const isArbitraryLength = (value) => getIsArbitraryValue(value, isLabelLength, isLengthOnly);
const isArbitraryNumber = (value) => getIsArbitraryValue(value, isLabelNumber, isNumber);
const isArbitraryWeight = (value) => getIsArbitraryValue(value, isLabelWeight, isAny);
const isArbitraryFamilyName = (value) => getIsArbitraryValue(value, isLabelFamilyName, isNever);
const isArbitraryPosition = (value) => getIsArbitraryValue(value, isLabelPosition, isNever);
const isArbitraryImage = (value) => getIsArbitraryValue(value, isLabelImage, isImage);
const isArbitraryShadow = (value) => getIsArbitraryValue(value, isLabelShadow, isShadow);
const isArbitraryVariable = (value) => arbitraryVariableRegex.test(value);
const isArbitraryVariableLength = (value) => getIsArbitraryVariable(value, isLabelLength);
const isArbitraryVariableFamilyName = (value) => getIsArbitraryVariable(value, isLabelFamilyName);
const isArbitraryVariablePosition = (value) => getIsArbitraryVariable(value, isLabelPosition);
const isArbitraryVariableSize = (value) => getIsArbitraryVariable(value, isLabelSize);
const isArbitraryVariableImage = (value) => getIsArbitraryVariable(value, isLabelImage);
const isArbitraryVariableShadow = (value) => getIsArbitraryVariable(value, isLabelShadow, true);
const isArbitraryVariableWeight = (value) => getIsArbitraryVariable(value, isLabelWeight, true);
const getIsArbitraryValue = (value, testLabel, testValue) => {
  const result = arbitraryValueRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return testValue(result[2]);
  }
  return false;
};
const getIsArbitraryVariable = (value, testLabel, shouldMatchNoLabel = false) => {
  const result = arbitraryVariableRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return shouldMatchNoLabel;
  }
  return false;
};
const isLabelPosition = (label) => label === "position" || label === "percentage";
const isLabelImage = (label) => label === "image" || label === "url";
const isLabelSize = (label) => label === "length" || label === "size" || label === "bg-size";
const isLabelLength = (label) => label === "length";
const isLabelNumber = (label) => label === "number";
const isLabelFamilyName = (label) => label === "family-name";
const isLabelWeight = (label) => label === "number" || label === "weight";
const isLabelShadow = (label) => label === "shadow";
const getDefaultConfig = () => {
  const themeColor = fromTheme("color");
  const themeFont = fromTheme("font");
  const themeText = fromTheme("text");
  const themeFontWeight = fromTheme("font-weight");
  const themeTracking = fromTheme("tracking");
  const themeLeading = fromTheme("leading");
  const themeBreakpoint = fromTheme("breakpoint");
  const themeContainer = fromTheme("container");
  const themeSpacing = fromTheme("spacing");
  const themeRadius = fromTheme("radius");
  const themeShadow = fromTheme("shadow");
  const themeInsetShadow = fromTheme("inset-shadow");
  const themeTextShadow = fromTheme("text-shadow");
  const themeDropShadow = fromTheme("drop-shadow");
  const themeBlur = fromTheme("blur");
  const themePerspective = fromTheme("perspective");
  const themeAspect = fromTheme("aspect");
  const themeEase = fromTheme("ease");
  const themeAnimate = fromTheme("animate");
  const scaleBreak = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"];
  const scalePosition = () => [
    "center",
    "top",
    "bottom",
    "left",
    "right",
    "top-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-top",
    "top-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-top",
    "bottom-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-bottom",
    "bottom-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-bottom"
  ];
  const scalePositionWithArbitrary = () => [...scalePosition(), isArbitraryVariable, isArbitraryValue];
  const scaleOverflow = () => ["auto", "hidden", "clip", "visible", "scroll"];
  const scaleOverscroll = () => ["auto", "contain", "none"];
  const scaleUnambiguousSpacing = () => [isArbitraryVariable, isArbitraryValue, themeSpacing];
  const scaleInset = () => [isFraction, "full", "auto", ...scaleUnambiguousSpacing()];
  const scaleGridTemplateColsRows = () => [isInteger, "none", "subgrid", isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartAndEnd = () => ["auto", {
    span: ["full", isInteger, isArbitraryVariable, isArbitraryValue]
  }, isInteger, isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartOrEnd = () => [isInteger, "auto", isArbitraryVariable, isArbitraryValue];
  const scaleGridAutoColsRows = () => ["auto", "min", "max", "fr", isArbitraryVariable, isArbitraryValue];
  const scaleAlignPrimaryAxis = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"];
  const scaleAlignSecondaryAxis = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"];
  const scaleMargin = () => ["auto", ...scaleUnambiguousSpacing()];
  const scaleSizing = () => [isFraction, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleSizingInline = () => [isFraction, "screen", "full", "dvw", "lvw", "svw", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleSizingBlock = () => [isFraction, "screen", "full", "lh", "dvh", "lvh", "svh", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleColor = () => [themeColor, isArbitraryVariable, isArbitraryValue];
  const scaleBgPosition = () => [...scalePosition(), isArbitraryVariablePosition, isArbitraryPosition, {
    position: [isArbitraryVariable, isArbitraryValue]
  }];
  const scaleBgRepeat = () => ["no-repeat", {
    repeat: ["", "x", "y", "space", "round"]
  }];
  const scaleBgSize = () => ["auto", "cover", "contain", isArbitraryVariableSize, isArbitrarySize, {
    size: [isArbitraryVariable, isArbitraryValue]
  }];
  const scaleGradientStopPosition = () => [isPercent, isArbitraryVariableLength, isArbitraryLength];
  const scaleRadius = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    "full",
    themeRadius,
    isArbitraryVariable,
    isArbitraryValue
  ];
  const scaleBorderWidth = () => ["", isNumber, isArbitraryVariableLength, isArbitraryLength];
  const scaleLineStyle = () => ["solid", "dashed", "dotted", "double"];
  const scaleBlendMode = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];
  const scaleMaskImagePosition = () => [isNumber, isPercent, isArbitraryVariablePosition, isArbitraryPosition];
  const scaleBlur = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    themeBlur,
    isArbitraryVariable,
    isArbitraryValue
  ];
  const scaleRotate = () => ["none", isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleScale = () => ["none", isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleSkew = () => [isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleTranslate = () => [isFraction, "full", ...scaleUnambiguousSpacing()];
  return {
    cacheSize: 500,
    theme: {
      animate: ["spin", "ping", "pulse", "bounce"],
      aspect: ["video"],
      blur: [isTshirtSize],
      breakpoint: [isTshirtSize],
      color: [isAny],
      container: [isTshirtSize],
      "drop-shadow": [isTshirtSize],
      ease: ["in", "out", "in-out"],
      font: [isAnyNonArbitrary],
      "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
      "inset-shadow": [isTshirtSize],
      leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
      perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
      radius: [isTshirtSize],
      shadow: [isTshirtSize],
      spacing: ["px", isNumber],
      text: [isTshirtSize],
      "text-shadow": [isTshirtSize],
      tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"]
    },
    classGroups: {
      // --------------
      // --- Layout ---
      // --------------
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", isFraction, isArbitraryValue, isArbitraryVariable, themeAspect]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       * @deprecated since Tailwind CSS v4.0.0
       */
      container: ["container"],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [isNumber, isArbitraryValue, isArbitraryVariable, themeContainer]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": scaleBreak()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": scaleBreak()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      "break-inside": [{
        "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      "box-decoration": [{
        "box-decoration": ["slice", "clone"]
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ["border", "content"]
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
      /**
       * Screen Reader Only
       * @see https://tailwindcss.com/docs/display#screen-reader-only
       */
      sr: ["sr-only", "not-sr-only"],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ["right", "left", "none", "start", "end"]
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ["left", "right", "both", "none", "start", "end"]
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ["isolate", "isolation-auto"],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      "object-fit": [{
        object: ["contain", "cover", "fill", "none", "scale-down"]
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      "object-position": [{
        object: scalePositionWithArbitrary()
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: scaleOverflow()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": scaleOverflow()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": scaleOverflow()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: scaleOverscroll()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": scaleOverscroll()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": scaleOverscroll()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ["static", "fixed", "absolute", "relative", "sticky"],
      /**
       * Inset
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: scaleInset()
      }],
      /**
       * Inset Inline
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": scaleInset()
      }],
      /**
       * Inset Block
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": scaleInset()
      }],
      /**
       * Inset Inline Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-s` in next major release
       */
      start: [{
        "inset-s": scaleInset(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-s-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        start: scaleInset()
      }],
      /**
       * Inset Inline End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-e` in next major release
       */
      end: [{
        "inset-e": scaleInset(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-e-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        end: scaleInset()
      }],
      /**
       * Inset Block Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-bs": [{
        "inset-bs": scaleInset()
      }],
      /**
       * Inset Block End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-be": [{
        "inset-be": scaleInset()
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: scaleInset()
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: scaleInset()
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: scaleInset()
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: scaleInset()
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ["visible", "invisible", "collapse"],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: [isInteger, "auto", isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [isFraction, "full", "auto", themeContainer, ...scaleUnambiguousSpacing()]
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      "flex-direction": [{
        flex: ["row", "row-reverse", "col", "col-reverse"]
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      "flex-wrap": [{
        flex: ["nowrap", "wrap", "wrap-reverse"]
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: [isNumber, isFraction, "auto", "initial", "none", isArbitraryValue]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [isInteger, "first", "last", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": scaleGridTemplateColsRows()
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": scaleGridTemplateColsRows()
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      "grid-flow": [{
        "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      "auto-cols": [{
        "auto-cols": scaleGridAutoColsRows()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": scaleGridAutoColsRows()
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: scaleUnambiguousSpacing()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": scaleUnambiguousSpacing()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": scaleUnambiguousSpacing()
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: [...scaleAlignPrimaryAxis(), "normal"]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      "justify-items": [{
        "justify-items": [...scaleAlignSecondaryAxis(), "normal"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", ...scaleAlignSecondaryAxis()]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      "align-content": [{
        content: ["normal", ...scaleAlignPrimaryAxis()]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      "align-items": [{
        items: [...scaleAlignSecondaryAxis(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", ...scaleAlignSecondaryAxis(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      "place-content": [{
        "place-content": scaleAlignPrimaryAxis()
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      "place-items": [{
        "place-items": [...scaleAlignSecondaryAxis(), "baseline"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", ...scaleAlignSecondaryAxis()]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block Start
       * @see https://tailwindcss.com/docs/padding
       */
      pbs: [{
        pbs: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block End
       * @see https://tailwindcss.com/docs/padding
       */
      pbe: [{
        pbe: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: scaleUnambiguousSpacing()
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: scaleMargin()
      }],
      /**
       * Margin Inline
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: scaleMargin()
      }],
      /**
       * Margin Block
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: scaleMargin()
      }],
      /**
       * Margin Inline Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: scaleMargin()
      }],
      /**
       * Margin Inline End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: scaleMargin()
      }],
      /**
       * Margin Block Start
       * @see https://tailwindcss.com/docs/margin
       */
      mbs: [{
        mbs: scaleMargin()
      }],
      /**
       * Margin Block End
       * @see https://tailwindcss.com/docs/margin
       */
      mbe: [{
        mbe: scaleMargin()
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: scaleMargin()
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: scaleMargin()
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: scaleMargin()
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: scaleMargin()
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x": [{
        "space-x": scaleUnambiguousSpacing()
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x-reverse": ["space-x-reverse"],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y": [{
        "space-y": scaleUnambiguousSpacing()
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y-reverse": ["space-y-reverse"],
      // --------------
      // --- Sizing ---
      // --------------
      /**
       * Size
       * @see https://tailwindcss.com/docs/width#setting-both-width-and-height
       */
      size: [{
        size: scaleSizing()
      }],
      /**
       * Inline Size
       * @see https://tailwindcss.com/docs/width
       */
      "inline-size": [{
        inline: ["auto", ...scaleSizingInline()]
      }],
      /**
       * Min-Inline Size
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-inline-size": [{
        "min-inline": ["auto", ...scaleSizingInline()]
      }],
      /**
       * Max-Inline Size
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-inline-size": [{
        "max-inline": ["none", ...scaleSizingInline()]
      }],
      /**
       * Block Size
       * @see https://tailwindcss.com/docs/height
       */
      "block-size": [{
        block: ["auto", ...scaleSizingBlock()]
      }],
      /**
       * Min-Block Size
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-block-size": [{
        "min-block": ["auto", ...scaleSizingBlock()]
      }],
      /**
       * Max-Block Size
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-block-size": [{
        "max-block": ["none", ...scaleSizingBlock()]
      }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: [themeContainer, "screen", ...scaleSizing()]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [
          themeContainer,
          "screen",
          /** Deprecated. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "none",
          ...scaleSizing()
        ]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [
          themeContainer,
          "screen",
          "none",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "prose",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          {
            screen: [themeBreakpoint]
          },
          ...scaleSizing()
        ]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: ["screen", "lh", ...scaleSizing()]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": ["screen", "lh", "none", ...scaleSizing()]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": ["screen", "lh", ...scaleSizing()]
      }],
      // ------------------
      // --- Typography ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", themeText, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      "font-smoothing": ["antialiased", "subpixel-antialiased"],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      "font-style": ["italic", "not-italic"],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      "font-weight": [{
        font: [themeFontWeight, isArbitraryVariableWeight, isArbitraryWeight]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      "font-stretch": [{
        "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", isPercent, isArbitraryValue]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [isArbitraryVariableFamilyName, isArbitraryFamilyName, themeFont]
      }],
      /**
       * Font Feature Settings
       * @see https://tailwindcss.com/docs/font-feature-settings
       */
      "font-features": [{
        "font-features": [isArbitraryValue]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-normal": ["normal-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-ordinal": ["ordinal"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-slashed-zero": ["slashed-zero"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-figure": ["lining-nums", "oldstyle-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-spacing": ["proportional-nums", "tabular-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: [themeTracking, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": [isNumber, "none", isArbitraryVariable, isArbitraryNumber]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          themeLeading,
          ...scaleUnambiguousSpacing()
        ]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      "list-style-position": [{
        list: ["inside", "outside"]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["disc", "decimal", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      "text-alignment": [{
        text: ["left", "center", "right", "justify", "start", "end"]
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://v3.tailwindcss.com/docs/placeholder-color
       */
      "placeholder-color": [{
        placeholder: scaleColor()
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: scaleColor()
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      "text-decoration": ["underline", "overline", "line-through", "no-underline"],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      "text-decoration-style": [{
        decoration: [...scaleLineStyle(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: [isNumber, "from-font", "auto", isArbitraryVariable, isArbitraryLength]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: scaleColor()
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": [isNumber, "auto", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      "text-wrap": [{
        text: ["wrap", "nowrap", "balance", "pretty"]
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: scaleUnambiguousSpacing()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ["normal", "words", "all", "keep"]
      }],
      /**
       * Overflow Wrap
       * @see https://tailwindcss.com/docs/overflow-wrap
       */
      wrap: [{
        wrap: ["break-word", "anywhere", "normal"]
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ["none", "manual", "auto"]
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ["none", isArbitraryVariable, isArbitraryValue]
      }],
      // -------------------
      // --- Backgrounds ---
      // -------------------
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      "bg-attachment": [{
        bg: ["fixed", "local", "scroll"]
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      "bg-clip": [{
        "bg-clip": ["border", "padding", "content", "text"]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      "bg-origin": [{
        "bg-origin": ["border", "padding", "content"]
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      "bg-position": [{
        bg: scaleBgPosition()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: scaleBgRepeat()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: scaleBgSize()
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          linear: [{
            to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
          }, isInteger, isArbitraryVariable, isArbitraryValue],
          radial: ["", isArbitraryVariable, isArbitraryValue],
          conic: [isInteger, isArbitraryVariable, isArbitraryValue]
        }, isArbitraryVariableImage, isArbitraryImage]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: scaleColor()
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: scaleColor()
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: scaleColor()
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: scaleColor()
      }],
      // ---------------
      // --- Borders ---
      // ---------------
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: scaleRadius()
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": scaleRadius()
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": scaleRadius()
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": scaleRadius()
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": scaleRadius()
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": scaleRadius()
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": scaleRadius()
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": scaleRadius()
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": scaleRadius()
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": scaleRadius()
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": scaleRadius()
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": scaleRadius()
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": scaleRadius()
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": scaleRadius()
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": scaleRadius()
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: scaleBorderWidth()
      }],
      /**
       * Border Width Inline
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": scaleBorderWidth()
      }],
      /**
       * Border Width Block
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": scaleBorderWidth()
      }],
      /**
       * Border Width Inline Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": scaleBorderWidth()
      }],
      /**
       * Border Width Inline End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": scaleBorderWidth()
      }],
      /**
       * Border Width Block Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-bs": [{
        "border-bs": scaleBorderWidth()
      }],
      /**
       * Border Width Block End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-be": [{
        "border-be": scaleBorderWidth()
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": scaleBorderWidth()
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": scaleBorderWidth()
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": scaleBorderWidth()
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": scaleBorderWidth()
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x": [{
        "divide-x": scaleBorderWidth()
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x-reverse": ["divide-x-reverse"],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y": [{
        "divide-y": scaleBorderWidth()
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y-reverse": ["divide-y-reverse"],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [...scaleLineStyle(), "hidden", "none"]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      "divide-style": [{
        divide: [...scaleLineStyle(), "hidden", "none"]
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: scaleColor()
      }],
      /**
       * Border Color Inline
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": scaleColor()
      }],
      /**
       * Border Color Block
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": scaleColor()
      }],
      /**
       * Border Color Inline Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": scaleColor()
      }],
      /**
       * Border Color Inline End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": scaleColor()
      }],
      /**
       * Border Color Block Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-bs": [{
        "border-bs": scaleColor()
      }],
      /**
       * Border Color Block End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-be": [{
        "border-be": scaleColor()
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": scaleColor()
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": scaleColor()
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": scaleColor()
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": scaleColor()
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: scaleColor()
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: [...scaleLineStyle(), "none", "hidden"]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: ["", isNumber, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: scaleColor()
      }],
      // ---------------
      // --- Effects ---
      // ---------------
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          themeShadow,
          isArbitraryVariableShadow,
          isArbitraryShadow
        ]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
       */
      "shadow-color": [{
        shadow: scaleColor()
      }],
      /**
       * Inset Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
       */
      "inset-shadow": [{
        "inset-shadow": ["none", themeInsetShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Inset Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
       */
      "inset-shadow-color": [{
        "inset-shadow": scaleColor()
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
       */
      "ring-w": [{
        ring: scaleBorderWidth()
      }],
      /**
       * Ring Width Inset
       * @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-w-inset": ["ring-inset"],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
       */
      "ring-color": [{
        ring: scaleColor()
      }],
      /**
       * Ring Offset Width
       * @see https://v3.tailwindcss.com/docs/ring-offset-width
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-w": [{
        "ring-offset": [isNumber, isArbitraryLength]
      }],
      /**
       * Ring Offset Color
       * @see https://v3.tailwindcss.com/docs/ring-offset-color
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-color": [{
        "ring-offset": scaleColor()
      }],
      /**
       * Inset Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
       */
      "inset-ring-w": [{
        "inset-ring": scaleBorderWidth()
      }],
      /**
       * Inset Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
       */
      "inset-ring-color": [{
        "inset-ring": scaleColor()
      }],
      /**
       * Text Shadow
       * @see https://tailwindcss.com/docs/text-shadow
       */
      "text-shadow": [{
        "text-shadow": ["none", themeTextShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Text Shadow Color
       * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
       */
      "text-shadow-color": [{
        "text-shadow": scaleColor()
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...scaleBlendMode(), "plus-darker", "plus-lighter"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": scaleBlendMode()
      }],
      /**
       * Mask Clip
       * @see https://tailwindcss.com/docs/mask-clip
       */
      "mask-clip": [{
        "mask-clip": ["border", "padding", "content", "fill", "stroke", "view"]
      }, "mask-no-clip"],
      /**
       * Mask Composite
       * @see https://tailwindcss.com/docs/mask-composite
       */
      "mask-composite": [{
        mask: ["add", "subtract", "intersect", "exclude"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image-linear-pos": [{
        "mask-linear": [isNumber]
      }],
      "mask-image-linear-from-pos": [{
        "mask-linear-from": scaleMaskImagePosition()
      }],
      "mask-image-linear-to-pos": [{
        "mask-linear-to": scaleMaskImagePosition()
      }],
      "mask-image-linear-from-color": [{
        "mask-linear-from": scaleColor()
      }],
      "mask-image-linear-to-color": [{
        "mask-linear-to": scaleColor()
      }],
      "mask-image-t-from-pos": [{
        "mask-t-from": scaleMaskImagePosition()
      }],
      "mask-image-t-to-pos": [{
        "mask-t-to": scaleMaskImagePosition()
      }],
      "mask-image-t-from-color": [{
        "mask-t-from": scaleColor()
      }],
      "mask-image-t-to-color": [{
        "mask-t-to": scaleColor()
      }],
      "mask-image-r-from-pos": [{
        "mask-r-from": scaleMaskImagePosition()
      }],
      "mask-image-r-to-pos": [{
        "mask-r-to": scaleMaskImagePosition()
      }],
      "mask-image-r-from-color": [{
        "mask-r-from": scaleColor()
      }],
      "mask-image-r-to-color": [{
        "mask-r-to": scaleColor()
      }],
      "mask-image-b-from-pos": [{
        "mask-b-from": scaleMaskImagePosition()
      }],
      "mask-image-b-to-pos": [{
        "mask-b-to": scaleMaskImagePosition()
      }],
      "mask-image-b-from-color": [{
        "mask-b-from": scaleColor()
      }],
      "mask-image-b-to-color": [{
        "mask-b-to": scaleColor()
      }],
      "mask-image-l-from-pos": [{
        "mask-l-from": scaleMaskImagePosition()
      }],
      "mask-image-l-to-pos": [{
        "mask-l-to": scaleMaskImagePosition()
      }],
      "mask-image-l-from-color": [{
        "mask-l-from": scaleColor()
      }],
      "mask-image-l-to-color": [{
        "mask-l-to": scaleColor()
      }],
      "mask-image-x-from-pos": [{
        "mask-x-from": scaleMaskImagePosition()
      }],
      "mask-image-x-to-pos": [{
        "mask-x-to": scaleMaskImagePosition()
      }],
      "mask-image-x-from-color": [{
        "mask-x-from": scaleColor()
      }],
      "mask-image-x-to-color": [{
        "mask-x-to": scaleColor()
      }],
      "mask-image-y-from-pos": [{
        "mask-y-from": scaleMaskImagePosition()
      }],
      "mask-image-y-to-pos": [{
        "mask-y-to": scaleMaskImagePosition()
      }],
      "mask-image-y-from-color": [{
        "mask-y-from": scaleColor()
      }],
      "mask-image-y-to-color": [{
        "mask-y-to": scaleColor()
      }],
      "mask-image-radial": [{
        "mask-radial": [isArbitraryVariable, isArbitraryValue]
      }],
      "mask-image-radial-from-pos": [{
        "mask-radial-from": scaleMaskImagePosition()
      }],
      "mask-image-radial-to-pos": [{
        "mask-radial-to": scaleMaskImagePosition()
      }],
      "mask-image-radial-from-color": [{
        "mask-radial-from": scaleColor()
      }],
      "mask-image-radial-to-color": [{
        "mask-radial-to": scaleColor()
      }],
      "mask-image-radial-shape": [{
        "mask-radial": ["circle", "ellipse"]
      }],
      "mask-image-radial-size": [{
        "mask-radial": [{
          closest: ["side", "corner"],
          farthest: ["side", "corner"]
        }]
      }],
      "mask-image-radial-pos": [{
        "mask-radial-at": scalePosition()
      }],
      "mask-image-conic-pos": [{
        "mask-conic": [isNumber]
      }],
      "mask-image-conic-from-pos": [{
        "mask-conic-from": scaleMaskImagePosition()
      }],
      "mask-image-conic-to-pos": [{
        "mask-conic-to": scaleMaskImagePosition()
      }],
      "mask-image-conic-from-color": [{
        "mask-conic-from": scaleColor()
      }],
      "mask-image-conic-to-color": [{
        "mask-conic-to": scaleColor()
      }],
      /**
       * Mask Mode
       * @see https://tailwindcss.com/docs/mask-mode
       */
      "mask-mode": [{
        mask: ["alpha", "luminance", "match"]
      }],
      /**
       * Mask Origin
       * @see https://tailwindcss.com/docs/mask-origin
       */
      "mask-origin": [{
        "mask-origin": ["border", "padding", "content", "fill", "stroke", "view"]
      }],
      /**
       * Mask Position
       * @see https://tailwindcss.com/docs/mask-position
       */
      "mask-position": [{
        mask: scaleBgPosition()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      "mask-repeat": [{
        mask: scaleBgRepeat()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      "mask-size": [{
        mask: scaleBgSize()
      }],
      /**
       * Mask Type
       * @see https://tailwindcss.com/docs/mask-type
       */
      "mask-type": [{
        "mask-type": ["alpha", "luminance"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image": [{
        mask: ["none", isArbitraryVariable, isArbitraryValue]
      }],
      // ---------------
      // --- Filters ---
      // ---------------
      /**
       * Filter
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          isArbitraryVariable,
          isArbitraryValue
        ]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: scaleBlur()
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      "drop-shadow": [{
        "drop-shadow": [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          themeDropShadow,
          isArbitraryVariableShadow,
          isArbitraryShadow
        ]
      }],
      /**
       * Drop Shadow Color
       * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
       */
      "drop-shadow-color": [{
        "drop-shadow": scaleColor()
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Filter
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      "backdrop-filter": [{
        "backdrop-filter": [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          isArbitraryVariable,
          isArbitraryValue
        ]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      "backdrop-blur": [{
        "backdrop-blur": scaleBlur()
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      // --------------
      // --- Tables ---
      // --------------
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      "border-collapse": [{
        border: ["collapse", "separate"]
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing": [{
        "border-spacing": scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": scaleUnambiguousSpacing()
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      "table-layout": [{
        table: ["auto", "fixed"]
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ["top", "bottom"]
      }],
      // ---------------------------------
      // --- Transitions and Animation ---
      // ---------------------------------
      /**
       * Transition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Behavior
       * @see https://tailwindcss.com/docs/transition-behavior
       */
      "transition-behavior": [{
        transition: ["normal", "discrete"]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: [isNumber, "initial", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "initial", themeEase, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", themeAnimate, isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------
      // --- Transforms ---
      // ------------------
      /**
       * Backface Visibility
       * @see https://tailwindcss.com/docs/backface-visibility
       */
      backface: [{
        backface: ["hidden", "visible"]
      }],
      /**
       * Perspective
       * @see https://tailwindcss.com/docs/perspective
       */
      perspective: [{
        perspective: [themePerspective, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Perspective Origin
       * @see https://tailwindcss.com/docs/perspective-origin
       */
      "perspective-origin": [{
        "perspective-origin": scalePositionWithArbitrary()
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: scaleRotate()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-x": [{
        "rotate-x": scaleRotate()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-y": [{
        "rotate-y": scaleRotate()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-z": [{
        "rotate-z": scaleRotate()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: scaleScale()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": scaleScale()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": scaleScale()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-z": [{
        "scale-z": scaleScale()
      }],
      /**
       * Scale 3D
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-3d": ["scale-3d"],
      /**
       * Skew
       * @see https://tailwindcss.com/docs/skew
       */
      skew: [{
        skew: scaleSkew()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": scaleSkew()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": scaleSkew()
      }],
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: [isArbitraryVariable, isArbitraryValue, "", "none", "gpu", "cpu"]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: scalePositionWithArbitrary()
      }],
      /**
       * Transform Style
       * @see https://tailwindcss.com/docs/transform-style
       */
      "transform-style": [{
        transform: ["3d", "flat"]
      }],
      /**
       * Translate
       * @see https://tailwindcss.com/docs/translate
       */
      translate: [{
        translate: scaleTranslate()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": scaleTranslate()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": scaleTranslate()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-z": [{
        "translate-z": scaleTranslate()
      }],
      /**
       * Translate None
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-none": ["translate-none"],
      // ---------------------
      // --- Interactivity ---
      // ---------------------
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: scaleColor()
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ["none", "auto"]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      "caret-color": [{
        caret: scaleColor()
      }],
      /**
       * Color Scheme
       * @see https://tailwindcss.com/docs/color-scheme
       */
      "color-scheme": [{
        scheme: ["normal", "dark", "light", "light-dark", "only-dark", "only-light"]
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Field Sizing
       * @see https://tailwindcss.com/docs/field-sizing
       */
      "field-sizing": [{
        "field-sizing": ["fixed", "content"]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      "pointer-events": [{
        "pointer-events": ["auto", "none"]
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ["none", "", "y", "x"]
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      "scroll-behavior": [{
        scroll: ["auto", "smooth"]
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-m": [{
        "scroll-m": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbs": [{
        "scroll-mbs": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbe": [{
        "scroll-mbe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbs": [{
        "scroll-pbs": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbe": [{
        "scroll-pbe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      "snap-align": [{
        snap: ["start", "end", "center", "align-none"]
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      "snap-stop": [{
        snap: ["normal", "always"]
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-type": [{
        snap: ["none", "x", "y", "both"]
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-strictness": [{
        snap: ["mandatory", "proximity"]
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ["auto", "none", "manipulation"]
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-x": [{
        "touch-pan": ["x", "left", "right"]
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-y": [{
        "touch-pan": ["y", "up", "down"]
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-pz": ["touch-pinch-zoom"],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ["none", "text", "all", "auto"]
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      "will-change": [{
        "will-change": ["auto", "scroll", "contents", "transform", isArbitraryVariable, isArbitraryValue]
      }],
      // -----------
      // --- SVG ---
      // -----------
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: ["none", ...scaleColor()]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [isNumber, isArbitraryVariableLength, isArbitraryLength, isArbitraryNumber]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: ["none", ...scaleColor()]
      }],
      // ---------------------
      // --- Accessibility ---
      // ---------------------
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      "forced-color-adjust": [{
        "forced-color-adjust": ["auto", "none"]
      }]
    },
    conflictingClassGroups: {
      overflow: ["overflow-x", "overflow-y"],
      overscroll: ["overscroll-x", "overscroll-y"],
      inset: ["inset-x", "inset-y", "inset-bs", "inset-be", "start", "end", "top", "right", "bottom", "left"],
      "inset-x": ["right", "left"],
      "inset-y": ["top", "bottom"],
      flex: ["basis", "grow", "shrink"],
      gap: ["gap-x", "gap-y"],
      p: ["px", "py", "ps", "pe", "pbs", "pbe", "pt", "pr", "pb", "pl"],
      px: ["pr", "pl"],
      py: ["pt", "pb"],
      m: ["mx", "my", "ms", "me", "mbs", "mbe", "mt", "mr", "mb", "ml"],
      mx: ["mr", "ml"],
      my: ["mt", "mb"],
      size: ["w", "h"],
      "font-size": ["leading"],
      "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
      "fvn-ordinal": ["fvn-normal"],
      "fvn-slashed-zero": ["fvn-normal"],
      "fvn-figure": ["fvn-normal"],
      "fvn-spacing": ["fvn-normal"],
      "fvn-fraction": ["fvn-normal"],
      "line-clamp": ["display", "overflow"],
      rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
      "rounded-s": ["rounded-ss", "rounded-es"],
      "rounded-e": ["rounded-se", "rounded-ee"],
      "rounded-t": ["rounded-tl", "rounded-tr"],
      "rounded-r": ["rounded-tr", "rounded-br"],
      "rounded-b": ["rounded-br", "rounded-bl"],
      "rounded-l": ["rounded-tl", "rounded-bl"],
      "border-spacing": ["border-spacing-x", "border-spacing-y"],
      "border-w": ["border-w-x", "border-w-y", "border-w-s", "border-w-e", "border-w-bs", "border-w-be", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
      "border-w-x": ["border-w-r", "border-w-l"],
      "border-w-y": ["border-w-t", "border-w-b"],
      "border-color": ["border-color-x", "border-color-y", "border-color-s", "border-color-e", "border-color-bs", "border-color-be", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
      "border-color-x": ["border-color-r", "border-color-l"],
      "border-color-y": ["border-color-t", "border-color-b"],
      translate: ["translate-x", "translate-y", "translate-none"],
      "translate-none": ["translate", "translate-x", "translate-y", "translate-z"],
      "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mbs", "scroll-mbe", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
      "scroll-mx": ["scroll-mr", "scroll-ml"],
      "scroll-my": ["scroll-mt", "scroll-mb"],
      "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pbs", "scroll-pbe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
      "scroll-px": ["scroll-pr", "scroll-pl"],
      "scroll-py": ["scroll-pt", "scroll-pb"],
      touch: ["touch-x", "touch-y", "touch-pz"],
      "touch-x": ["touch"],
      "touch-y": ["touch"],
      "touch-pz": ["touch"]
    },
    conflictingClassGroupModifiers: {
      "font-size": ["leading"]
    },
    orderSensitiveModifiers: ["*", "**", "after", "backdrop", "before", "details-content", "file", "first-letter", "first-line", "marker", "placeholder", "selection"]
  };
};
const twMerge = /* @__PURE__ */ createTailwindMerge(getDefaultConfig);
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const OptimizedImage = reactExports.memo(function OptimizedImage2({
  src: src2,
  alt,
  className,
  wrapperClassName,
  placeholderSrc,
  revealImmediately = false,
  fallback,
  loading = "lazy",
  decoding = "async",
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  onLoad,
  onError,
  ...props
}) {
  const imageRef = reactExports.useRef(null);
  const [loaded, setLoaded] = reactExports.useState(false);
  const [failed, setFailed] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setFailed(false);
    setLoaded(false);
    const image = imageRef.current;
    if (!src2 || !image) return;
    if (image.complete) {
      if (image.naturalWidth > 0) {
        setLoaded(true);
      } else {
        setFailed(true);
      }
    }
  }, [src2]);
  if (!src2 || failed) {
    return fallback ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: fallback }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn(
          "flex h-full w-full items-center justify-center rounded-3xl bg-beige/80 text-navy/30",
          wrapperClassName
        ),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex h-3.5 w-3.5 rounded-full bg-navy/20" })
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("relative block h-full w-full overflow-hidden", wrapperClassName), children: [
    !loaded && !revealImmediately ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 animate-pulse bg-[linear-gradient(110deg,rgba(235,222,212,0.85),rgba(255,255,255,0.72),rgba(235,222,212,0.85))] bg-[length:220%_100%]" }) : null,
    placeholderSrc && !loaded && !revealImmediately ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: placeholderSrc,
        alt: "",
        "aria-hidden": "true",
        className: cn("absolute inset-0 h-full w-full scale-105 object-cover blur-lg", className),
        loading: "lazy",
        decoding: "async"
      }
    ) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        ref: imageRef,
        ...props,
        src: src2,
        alt,
        loading,
        decoding,
        sizes,
        onLoad: (event) => {
          setLoaded(true);
          onLoad?.(event);
        },
        onError: (event) => {
          setFailed(true);
          onError?.(event);
        },
        className: cn(
          className,
          "transition-[filter,opacity,transform] duration-500 ease-out",
          loaded || revealImmediately ? "opacity-100 blur-0" : "opacity-0 blur-sm"
        )
      }
    )
  ] });
});
const SearchBar = reactExports.memo(function SearchBar2({ open, onClose }) {
  const [products, setProducts] = reactExports.useState([]);
  const { query, setQuery, results, clear } = useSearch(products);
  const inputRef = reactExports.useRef(null);
  const navigate = useNavigate();
  const handleClose = reactExports.useCallback(() => {
    clear();
    onClose();
  }, [clear, onClose]);
  reactExports.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);
  reactExports.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [handleClose, open]);
  reactExports.useEffect(() => {
    if (!open || products.length) return;
    productsApi.list().then(setProducts).catch(() => setProducts([]));
  }, [open, products.length]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-[80] bg-[#1e1b18]/88 text-[#fffaf4] backdrop-blur-xl",
      onMouseDown: (event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: handleClose,
            "aria-label": "Close search",
            className: "absolute right-5 top-5 flex h-11 w-11 items-center justify-center border border-[#fffaf4]/25 bg-[#fffaf4]/10 text-[#fffaf4] shadow-lg transition-colors hover:border-[#c89b63] hover:bg-[#c89b63] hover:text-[#1e1b18] focus:outline-none focus:ring-2 focus:ring-[#c89b63] md:right-8 md:top-8",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl px-6 pt-28 md:pt-32", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-5 text-center text-[0.68rem] uppercase tracking-[0.38em] text-[#c89b63]", children: "Search the collection" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 border-b border-[#c89b63]/45 pb-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-5 w-5 text-[#c89b63]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: inputRef,
                value: query,
                onChange: (event) => setQuery(event.target.value),
                placeholder: "Search perfumes, brands...",
                className: "flex-1 bg-transparent font-display text-3xl text-[#fffaf4] outline-none placeholder:text-[#fffaf4]/45"
              }
            ),
            query ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: clear,
                "aria-label": "Clear search",
                className: "flex h-9 w-9 items-center justify-center text-[#fffaf4]/70 transition-colors hover:bg-[#fffaf4]/10 hover:text-[#c89b63] focus:outline-none focus:ring-2 focus:ring-[#c89b63]",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
              }
            ) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 max-h-[60vh] overflow-y-auto no-scrollbar", children: [
            results.length === 0 && query && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-12 text-center text-sm text-[#fffaf4]/60", children: "No fragrances found." }),
            results.map((product) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => {
                  if (!product.id) return;
                  handleClose();
                  navigate({ to: "/product/$id", params: { id: product.id } });
                },
                className: "flex w-full items-center justify-between gap-4 border-b border-[#fffaf4]/14 px-3 py-4 text-left transition-colors hover:bg-[#fffaf4]/10",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      OptimizedImage,
                      {
                        src: product.image,
                        alt: product.name,
                        width: 72,
                        height: 90,
                        sizes: "4.5rem",
                        wrapperClassName: "h-[4.5rem] w-[3.7rem] shrink-0 bg-[#efe7dc]",
                        className: "h-full w-full object-contain p-1"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-display text-xl text-[#fffaf4]", children: product.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs uppercase tracking-[0.25em] text-[#fffaf4]/60", children: product.brand })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden shrink-0 text-xs uppercase tracking-widest text-[#c89b63] sm:block", children: product.category })
                ]
              },
              product.id
            ))
          ] })
        ] })
      ]
    }
  ) });
});
const useRenderInstrumentation = (componentName) => {
  reactExports.useRef(0);
  reactExports.useRef(0);
  reactExports.useEffect(() => {
    return;
  });
};
const createCatalogSlug = (value = "") => String(value || "").trim().toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
const getCategoryId = (category) => {
  if (!category || typeof category === "string") return "";
  return String(category.id || category._id || "").trim();
};
const getCategorySlug = (category) => {
  if (!category) return "";
  if (typeof category === "string") return createCatalogSlug(category);
  return createCatalogSlug(category.slug || category.name || "");
};
const getBrandCategoryId = (brand) => String(brand.categoryId || "").trim();
const getBrandCategorySlug = (brand) => createCatalogSlug(brand.categorySlug || brand.category || brand.categoryName || "");
const brandBelongsToCategory = (brand, category) => {
  if (!category || category === "all") return true;
  const categoryId = getCategoryId(category);
  const brandCategoryId = getBrandCategoryId(brand);
  if (categoryId && brandCategoryId) {
    return categoryId === brandCategoryId;
  }
  const categorySlug = getCategorySlug(category);
  const brandCategorySlug = getBrandCategorySlug(brand);
  return Boolean(categorySlug && brandCategorySlug && categorySlug === brandCategorySlug);
};
const filterBrandsByCategory = (brands, category) => [...brands].filter((brand) => brandBelongsToCategory(brand, category)).sort((left, right) => left.name.localeCompare(right.name));
const scheduleIdleTask = (callback, options = {}) => {
  if (typeof window === "undefined") {
    callback();
    return () => void 0;
  }
  const idleWindow = window;
  if (idleWindow.requestIdleCallback) {
    const handle = idleWindow.requestIdleCallback(
      () => {
        callback();
      },
      { timeout: options.timeoutMs ?? 1500 }
    );
    return () => idleWindow.cancelIdleCallback?.(handle);
  }
  const timeoutId = window.setTimeout(callback, Math.min(options.timeoutMs ?? 1500, 250));
  return () => window.clearTimeout(timeoutId);
};
const throttle = (callback, waitMs) => {
  let lastRun = 0;
  let trailingTimeout = null;
  let lastArgs = null;
  const run = (args) => {
    lastRun = Date.now();
    trailingTimeout = null;
    lastArgs = null;
    callback(...args);
  };
  const throttled = (...args) => {
    const remaining = waitMs - (Date.now() - lastRun);
    lastArgs = args;
    if (remaining <= 0) {
      if (trailingTimeout !== null && typeof window !== "undefined") {
        window.clearTimeout(trailingTimeout);
      }
      run(args);
      return;
    }
    if (trailingTimeout === null && typeof window !== "undefined") {
      trailingTimeout = window.setTimeout(() => {
        if (lastArgs) {
          run(lastArgs);
        }
      }, remaining);
    }
  };
  throttled.cancel = () => {
    if (trailingTimeout !== null && typeof window !== "undefined") {
      window.clearTimeout(trailingTimeout);
    }
    trailingTimeout = null;
    lastArgs = null;
  };
  return throttled;
};
const dropdownVariants = {
  hidden: { opacity: 0, y: 10, pointerEvents: "none" },
  show: { opacity: 1, y: 0, pointerEvents: "auto" }
};
const getBrandHref = (brand) => `/brand/${brand.id || brand._id || ""}`;
const BrandWordmark = reactExports.memo(function BrandWordmark2({
  compact = false,
  inline = false
}) {
  if (inline) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mobile-brand-wordmark flex min-w-0 flex-col justify-center text-[#7d5437]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate whitespace-nowrap font-display uppercase", children: "Purefumes Hyderabad" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "brand-tagline truncate whitespace-nowrap font-sans uppercase", children: "Redefine Your Presence" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block min-w-0 text-center leading-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: `block truncate font-display uppercase tracking-[0.28em] text-[#8b5f3d] ${compact ? "text-[clamp(1rem,1vw+0.8rem,1.22rem)]" : "text-[clamp(1.15rem,1vw+0.95rem,1.6rem)]"}`,
        children: "Purefumes"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[clamp(0.62rem,0.18vw+0.58rem,0.74rem)] tracking-[0.2em] text-[#8b6b56]", children: "Hyderabad" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "brand-tagline mt-0.5 block truncate font-sans uppercase text-[#8b6b56]", children: "Redefine Your Presence" })
  ] });
});
const Navbar = reactExports.memo(function Navbar2() {
  useRenderInstrumentation();
  const { cartCount, wishlistCount } = useNavbarCounters();
  const [megaOpen, setMegaOpen] = reactExports.useState(null);
  const [mobile, setMobile] = reactExports.useState(false);
  const [search, setSearch] = reactExports.useState(false);
  const [scrolled, setScrolled] = reactExports.useState(false);
  const [brands, setBrands] = reactExports.useState([]);
  const [categories, setCategories] = reactExports.useState([]);
  const [mobileBrandQuery, setMobileBrandQuery] = reactExports.useState("");
  const closeMobileMenu = reactExports.useCallback(() => {
    setMobile(false);
    setMobileBrandQuery("");
  }, []);
  const handleSectionNavigation = reactExports.useCallback(
    (sectionId) => {
      closeMobileMenu();
      if (typeof window === "undefined") return;
      if (window.location.pathname === "/") {
        window.history.replaceState(null, "", `/#${sectionId}`);
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
        return;
      }
      window.location.assign(`/#${sectionId}`);
    },
    [closeMobileMenu]
  );
  const mobileBrandMatches = reactExports.useMemo(() => {
    const query = mobileBrandQuery.trim().toLowerCase();
    if (!query) return [];
    return brands.filter((brand) => brand.name.toLowerCase().includes(query)).slice(0, 6);
  }, [brands, mobileBrandQuery]);
  const navigationCategories = reactExports.useMemo(
    () => filterStorefrontCategories(categories).sort(
      (left, right) => left.sortOrder - right.sortOrder
    ),
    [categories]
  );
  const groupedBrands = reactExports.useMemo(
    () => navigationCategories.map((category) => ({
      category,
      brands: filterBrandsByCategory(brands, category)
    })),
    [brands, navigationCategories]
  );
  const quickCategories = reactExports.useMemo(() => {
    const featured = navigationCategories.filter((category) => category.featured);
    return (featured.length ? featured : navigationCategories).slice(0, 7);
  }, [navigationCategories]);
  reactExports.useEffect(() => {
    brandsApi.list().then((nextBrands) => setBrands([...nextBrands].sort((a, b) => a.name.localeCompare(b.name)))).catch(() => setBrands([]));
  }, []);
  reactExports.useEffect(() => {
    categoriesApi.list().then((nextCategories) => setCategories(nextCategories)).catch(() => setCategories([]));
  }, []);
  reactExports.useEffect(() => {
    const handleScroll = throttle(() => setScrolled(window.scrollY > 16), 100);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      handleScroll.cancel();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  reactExports.useEffect(() => {
    if (typeof document === "undefined" || !mobile) {
      return void 0;
    }
    const scrollY = window.scrollY;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
      window.scrollTo(0, scrollY);
    };
  }, [mobile]);
  reactExports.useEffect(() => {
    if (!mobile) return void 0;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMobileMenu, mobile]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "header",
      {
        className: `navbar inset-x-0 text-[#5b3a29] ${scrolled ? "navbar-scrolled" : ""}`,
        onMouseLeave: () => setMegaOpen(null),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { className: "hidden h-[5.1rem] items-center gap-5 xl:flex", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Link,
              {
                to: "/",
                className: "flex h-14 w-[13.5rem] flex-none items-center justify-center",
                "aria-label": "Purefumes Hyderabad home",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrandWordmark, {})
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "hidden min-w-0 flex-1 items-center justify-center gap-4 whitespace-nowrap text-[0.68rem] uppercase tracking-[0.14em] xl:flex xl:gap-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Link,
                {
                  to: "/",
                  className: "nav-link font-medium uppercase",
                  activeProps: { className: "text-gold" },
                  activeOptions: { exact: true },
                  children: "Home"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", onMouseEnter: () => setMegaOpen("brands"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Link,
                {
                  to: "/brands",
                  className: "nav-link inline-flex items-center gap-1 font-medium uppercase",
                  activeProps: { className: "text-gold" },
                  children: [
                    "Brands",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5" })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => handleSectionNavigation("bestsellers"),
                  className: "nav-link border-0 bg-transparent p-0 font-medium uppercase",
                  children: "Best Sellers"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => handleSectionNavigation("latest-arrivals"),
                  className: "nav-link border-0 bg-transparent p-0 font-medium uppercase",
                  children: "Latest Arrivals"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/about", className: "nav-link font-medium uppercase", children: "About" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/contact", className: "nav-link font-medium uppercase", children: "Contact" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setSearch(true),
                  "aria-label": "Search",
                  className: "nav-icon touch-target flex h-11 w-11 items-center justify-center border border-[#5b3a29]/10 bg-[#fffaf4]/45 text-[#5b3a29] hover:border-[#c89b63] hover:text-[#c89b63]",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4.5 w-4.5" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Link,
                {
                  to: "/wishlist",
                  "aria-label": "Wishlist",
                  className: "nav-icon touch-target relative flex h-11 w-11 items-center justify-center border border-[#5b3a29]/10 bg-[#fffaf4]/45 text-[#5b3a29] hover:border-[#c89b63] hover:text-[#c89b63]",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-4.5 w-4.5" }),
                    wishlistCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-semibold leading-none text-[#1e1b18]", children: wishlistCount })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Link,
                {
                  to: "/cart",
                  "aria-label": "Cart",
                  className: "nav-icon touch-target relative flex h-11 w-11 items-center justify-center border border-[#5b3a29]/10 bg-[#fffaf4]/45 text-[#5b3a29] hover:border-[#c89b63] hover:text-[#c89b63]",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-4.5 w-4.5" }),
                    cartCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-semibold leading-none text-[#1e1b18]", children: cartCount })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: megaOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              variants: dropdownVariants,
              initial: "hidden",
              animate: "show",
              exit: "hidden",
              transition: { duration: 0.22 },
              className: "absolute left-1/2 top-full z-40 hidden w-[min(72rem,calc(100vw-2rem))] -translate-x-1/2 border border-[#5b3a29]/10 bg-[#fffaf4]/95 p-6 text-[#5b3a29] shadow-[0_26px_70px_-38px_rgba(91,58,41,0.38)] backdrop-blur-xl xl:block",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-8 lg:grid-cols-3", children: groupedBrands.map(({ category, brands: categoryBrands }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.68rem] uppercase tracking-[0.34em] text-[#c89b63]", children: category.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 max-h-72 space-y-1 overflow-y-auto pr-2", children: categoryBrands.length ? categoryBrands.map((brand) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "a",
                  {
                    href: getBrandHref(brand),
                    className: "block border-b border-[#5b3a29]/10 py-2 text-sm text-[#5b3a29]/82 transition hover:text-[#c89b63]",
                    children: brand.name
                  },
                  brand.id
                )) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-2 text-sm text-[#8b6b56]", children: "No brands yet." }) })
              ] }, category.id)) })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { className: "mobile-header-bar xl:hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Link,
              {
                to: "/",
                className: "flex min-w-0 flex-1 items-center justify-start",
                "aria-label": "Purefumes Hyderabad home",
                onClick: closeMobileMenu,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrandWordmark, { inline: true })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setMobile((value) => !value),
                type: "button",
                className: "mobile-menu-trigger touch-target flex shrink-0 items-center justify-center rounded-full border border-[#5b3a29]/12 bg-[#fffaf4] text-[#5b3a29] transition hover:border-[#c89b63] hover:text-[#c89b63]",
                "aria-label": "Menu",
                children: mobile ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-5 w-5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: mobile && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
              transition: { duration: 0.22 },
              className: "fixed inset-0 z-[2500] h-[100dvh] overflow-hidden bg-[#1e1b18]/55 backdrop-blur-sm xl:hidden",
              onClick: closeMobileMenu,
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.aside,
                {
                  initial: { x: "100%" },
                  animate: { x: 0 },
                  exit: { x: "100%" },
                  transition: { type: "spring", damping: 30, stiffness: 260 },
                  className: "mobile-menu-panel ml-auto flex h-[100dvh] max-h-[100dvh] w-[min(92vw,26rem)] min-w-0 flex-col overflow-hidden bg-[#fffaf4] text-[#5b3a29] shadow-[0_28px_90px_-28px_rgba(30,27,24,0.72)]",
                  onClick: (event) => event.stopPropagation(),
                  role: "dialog",
                  "aria-modal": "true",
                  "aria-label": "Mobile menu",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center justify-between gap-3 border-b border-[#5b3a29]/10 bg-[#fffaf4]/95 px-5 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] backdrop-blur", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(BrandWordmark, { compact: true }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          type: "button",
                          onClick: closeMobileMenu,
                          className: "touch-target inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#5b3a29]/12 bg-[#f7f3ed] text-[#5b3a29] transition hover:border-[#c89b63] hover:text-[#c89b63]",
                          "aria-label": "Close menu",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" })
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mobile-menu-scroll flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-5 text-sm uppercase tracking-[0.2em]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "relative block rounded-[1.25rem] border border-[#5b3a29]/12 bg-[#f7f3ed] p-3 shadow-[0_18px_44px_-34px_rgba(91,58,41,0.5)]", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-7 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#8b6b56]" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            value: mobileBrandQuery,
                            onChange: (event) => setMobileBrandQuery(event.target.value),
                            placeholder: "Search brands...",
                            className: "min-h-11 w-full rounded-xl border border-[#5b3a29]/10 bg-[#fffaf4] py-3 pl-11 pr-4 text-[0.82rem] normal-case tracking-[0.04em] text-[#5b3a29] outline-none transition focus:border-[#c89b63]"
                          }
                        )
                      ] }),
                      mobileBrandQuery.trim() ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-[1.25rem] border border-[#5b3a29]/10 bg-[#fffaf4] p-2 shadow-soft", children: mobileBrandMatches.length > 0 ? mobileBrandMatches.map((brand) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "a",
                        {
                          href: getBrandHref(brand),
                          onClick: closeMobileMenu,
                          className: "block rounded-xl px-4 py-3 text-[0.72rem] tracking-[0.18em] text-[#5b3a29]/78 transition hover:bg-[#efe7dc] hover:text-[#c89b63]",
                          children: brand.name
                        },
                        brand.id
                      )) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-4 py-3 text-[0.72rem] text-[#8b6b56]", children: "No matching brands found." }) }) : null,
                      [
                        { label: "Home", href: "/" },
                        { label: "Shop", href: "/shop" },
                        { label: "Brands", href: "/brands" },
                        { label: "Wishlist", href: "/wishlist" },
                        { label: "Best Sellers", href: "/shop?sort=bestseller" },
                        { label: "Latest Arrivals", href: "/shop?sort=latest" },
                        { label: "About", href: "/about" },
                        { label: "Contact", href: "/contact" }
                      ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "a",
                        {
                          href: item.href,
                          onClick: closeMobileMenu,
                          className: "block rounded-[1.15rem] border border-[#5b3a29]/10 bg-[#fffaf4] px-4 py-3.5 text-[0.74rem] tracking-[0.22em] text-[#5b3a29]/82 shadow-[0_10px_28px_-24px_rgba(91,58,41,0.55)] transition hover:border-[#c89b63] hover:text-[#c89b63]",
                          children: item.label
                        },
                        item.href
                      )),
                      quickCategories.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-1 pb-2 text-[0.62rem] tracking-[0.28em] text-[#c89b63]", children: "Collections" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: quickCategories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "a",
                          {
                            href: `/category/${category.slug}`,
                            onClick: closeMobileMenu,
                            className: "block rounded-[1.15rem] border border-[#5b3a29]/10 bg-[#fffaf4] px-4 py-3.5 text-[0.74rem] tracking-[0.22em] text-[#5b3a29]/82 shadow-[0_10px_28px_-24px_rgba(91,58,41,0.55)] transition hover:border-[#c89b63] hover:text-[#c89b63]",
                            children: category.name
                          },
                          category.id
                        )) })
                      ] }) : null
                    ] }) })
                  ]
                }
              )
            }
          ) }),
          quickCategories.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden border-t border-[#5b3a29]/10 bg-[#f7f3ed]/85 backdrop-blur xl:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryRail, { categories: quickCategories, allLabel: "Shop All", allHref: "/shop" }) }) }) : null
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "mobile-bottom-nav xl:hidden", "aria-label": "Mobile", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/",
          "aria-label": "Home",
          onClick: closeMobileMenu,
          className: "mobile-bottom-nav__item",
          activeProps: { className: "mobile-bottom-nav__item mobile-bottom-nav__item--active" },
          activeOptions: { exact: true },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(House, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Home" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/shop",
          "aria-label": "Shop",
          onClick: closeMobileMenu,
          className: "mobile-bottom-nav__item",
          activeProps: { className: "mobile-bottom-nav__item mobile-bottom-nav__item--active" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Store, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Shop" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          "aria-label": "Search",
          onClick: () => {
            closeMobileMenu();
            setSearch(true);
          },
          className: "mobile-bottom-nav__item",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Search" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/wishlist",
          "aria-label": "Wishlist",
          onClick: closeMobileMenu,
          className: "mobile-bottom-nav__item",
          activeProps: { className: "mobile-bottom-nav__item mobile-bottom-nav__item--active" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Wishlist" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/cart",
          "aria-label": "Cart",
          onClick: closeMobileMenu,
          className: "mobile-bottom-nav__item",
          activeProps: { className: "mobile-bottom-nav__item mobile-bottom-nav__item--active" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Cart" }),
            cartCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mobile-bottom-nav__badge", children: cartCount })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SearchBar, { open: search, onClose: () => setSearch(false) })
  ] });
});
const companyLinks = [
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Shipping Policy", to: "/shipping-policy" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms & Conditions", to: "/terms-and-conditions" },
  { label: "Refund & Cancellation Policy", to: "/refund-policy" },
  { label: "Return Policy", to: "/return-policy" }
];
const shopLinks = [
  { label: "All Fragrances", href: "/shop" },
  { label: "Best Sellers", href: "/shop?sort=bestseller" },
  { label: "Latest Arrivals", href: "/shop?sort=latest" }
];
const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/18pRD83qWQ/?mibextid=wwXIfr",
    Icon: Facebook
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/purefumes.hyderabad?igsh=MW00bGIzMGxleHo5dw==",
    Icon: Instagram
  }
];
const trustItems = [
  { label: "Secure Checkout", Icon: ShieldCheck },
  { label: "Authentic Perfumes", Icon: BadgeCheck },
  { label: "Customer Support", Icon: Headphones },
  { label: "Fast Delivery Across India", Icon: Truck }
];
const WhatsAppIcon = ({ className = "" }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 32 32", className, "aria-hidden": "true", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19.11 17.42c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14s-.7.88-.86 1.06c-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.16-1.35-.8-.72-1.33-1.61-1.49-1.88-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27 0 1.33.98 2.62 1.11 2.8.14.18 1.91 2.92 4.63 4.1.65.28 1.16.45 1.55.58.65.2 1.24.17 1.71.1.52-.08 1.6-.65 1.82-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32Z" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M27.06 4.91A15.86 15.86 0 0 0 16 0C7.18 0 0 7.18 0 16c0 2.82.74 5.57 2.14 7.99L0 32l8.24-2.11A15.92 15.92 0 0 0 16 32c8.82 0 16-7.18 16-16 0-4.27-1.66-8.28-4.94-11.09ZM16 29.29c-2.4 0-4.75-.64-6.81-1.84l-.49-.29-4.89 1.25 1.31-4.76-.32-.5A13.23 13.23 0 0 1 2.71 16C2.71 8.67 8.67 2.71 16 2.71S29.29 8.67 29.29 16 23.33 29.29 16 29.29Z" })
] });
const Footer = reactExports.memo(function Footer2() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t border-border bg-[#fffaf4] text-[#5b3a29]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { className: "py-[clamp(2.75rem,5vw,4.75rem)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 border-b border-[#5b3a29]/10 pb-8 sm:grid-cols-2 lg:grid-cols-4", children: trustItems.map(({ label, Icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex min-h-16 items-center gap-3 rounded-xl border border-[#5b3a29]/10 bg-[#f7f3ed] px-4 py-3",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c89b63]/16 text-[#8b5f3d]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4.5 w-4.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-[#5b3a29]", children: label })
        ]
      },
      label
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-10 pt-10 lg:grid-cols-[1.15fr_0.75fr_1fr_1fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-[clamp(2rem,2vw+1.1rem,3rem)] uppercase tracking-[0.24em] text-[#8b5f3d]", children: [
          "Purefumes",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "fluid-eyebrow mt-2 block uppercase tracking-[0.5em] text-[#8b6b56]", children: "Hyderabad" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 max-w-sm text-sm leading-7 text-[#8b6b56]", children: "Purefumes Hyderabad offers authentic perfumes and personal care products with secure checkout, careful packing, and delivery support across India." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "footer-socials", children: socialLinks.map(({ label, href, Icon }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href,
            target: "_blank",
            rel: "noopener noreferrer",
            "aria-label": label,
            className: "footer-social-link",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" })
          },
          label
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-eyebrow mb-4 uppercase tracking-[0.36em] text-[#8b5f3d]", children: "Shop" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3 text-sm text-[#8b6b56]", children: shopLinks.map((link) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: link.href, className: "transition hover:text-[#c89b63]", children: link.label }) }, link.href)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-eyebrow mb-4 uppercase tracking-[0.36em] text-[#8b5f3d]", children: "Company Links" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "grid gap-3 text-sm text-[#8b6b56] sm:grid-cols-2 lg:grid-cols-1", children: companyLinks.map((link) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: link.to, className: "transition hover:text-[#c89b63]", children: link.label }) }, link.to)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-eyebrow mb-4 uppercase tracking-[0.36em] text-[#8b5f3d]", children: "Contact" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-4 text-sm text-[#8b6b56]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "mt-0.5 h-4 w-4 shrink-0 text-[#c89b63]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "tel:+918686003446", className: "transition hover:text-[#c89b63]", children: "+91-8686 003 446" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "a",
            {
              href: "https://wa.me/918341174677",
              target: "_blank",
              rel: "noopener noreferrer",
              "aria-label": "Chat on WhatsApp at +91 83411 74677",
              className: "flex items-start gap-3 transition hover:text-[#c89b63]",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(WhatsAppIcon, { className: "mt-0.5 h-4 w-4 shrink-0 fill-current text-[#c89b63]" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "WhatsApp: +91 83411 74677" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "mt-0.5 h-4 w-4 shrink-0 text-[#c89b63]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Monday to Saturday | 11:00 AM – 6:00 PM" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3 break-all", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "mt-0.5 h-4 w-4 shrink-0 text-[#c89b63]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                href: "mailto:purefumes.hyderabad@gmail.com",
                className: "transition hover:text-[#c89b63]",
                children: "purefumes.hyderabad@gmail.com"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "mt-0.5 h-4 w-4 shrink-0 text-[#c89b63]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Hyderabad, Telangana, India" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 border-t border-border pt-6 text-[clamp(0.75rem,0.16vw+0.72rem,0.82rem)] text-[#8b6b56]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "© 2026 Purefumes Hyderabad. All rights reserved." }) })
  ] }) });
});
const whatsappUrl = "https://wa.me/918341174677";
const whatsappNumber = "+91 8341174677";
const WhatsAppFloat = reactExports.memo(function WhatsAppFloat2() {
  const dragRef = reactExports.useRef({
    dragging: false,
    moved: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    startRight: 16,
    startBottom: 112
  });
  const [position, setPosition] = reactExports.useState({ right: 16, bottom: 112 });
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("purefumes_whatsapp_pos");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (typeof parsed.right === "number" && typeof parsed.bottom === "number") {
        setPosition({ right: parsed.right, bottom: parsed.bottom });
      }
    } catch (_error) {
    }
  }, []);
  const persistPosition = (next) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("purefumes_whatsapp_pos", JSON.stringify(next));
  };
  const clampPosition = (nextRight, nextBottom) => {
    const buttonSize = 48;
    const margin = 8;
    const maxRight = Math.max(margin, window.innerWidth - buttonSize - margin);
    const maxBottom = Math.max(margin, window.innerHeight - buttonSize - margin);
    return {
      right: Math.min(Math.max(nextRight, margin), maxRight),
      bottom: Math.min(Math.max(nextBottom, margin), maxBottom)
    };
  };
  const onPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragRef.current = {
      dragging: true,
      moved: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startRight: position.right,
      startBottom: position.bottom
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag.dragging || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      drag.moved = true;
    }
    const next = clampPosition(drag.startRight - dx, drag.startBottom - dy);
    setPosition(next);
  };
  const onPointerUp = (event) => {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId) return;
    drag.dragging = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
    persistPosition(position);
  };
  const onClick = (event) => {
    if (dragRef.current.moved) {
      event.preventDefault();
      dragRef.current.moved = false;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "a",
    {
      href: whatsappUrl,
      target: "_blank",
      rel: "noreferrer",
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onClick,
      className: "fixed z-[1100] inline-flex h-12 w-12 touch-none select-none items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_20px_40px_-18px_rgba(37,211,102,0.8)] transition duration-300 ease-in-out hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#25D366] md:h-14 md:w-14",
      style: { right: `${position.right}px`, bottom: `${position.bottom}px` },
      "aria-label": `Chat on WhatsApp at ${whatsappNumber}`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 32 32", className: "h-6 w-6 fill-white md:h-7 md:w-7", "aria-hidden": "true", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19.11 17.42c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14s-.7.88-.86 1.06c-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.16-1.35-.8-.72-1.33-1.61-1.49-1.88-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27 0 1.33.98 2.62 1.11 2.8.14.18 1.91 2.92 4.63 4.1.65.28 1.16.45 1.55.58.65.2 1.24.17 1.71.1.52-.08 1.6-.65 1.82-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32Z" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M27.06 4.91A15.86 15.86 0 0 0 16 0C7.18 0 0 7.18 0 16c0 2.82.74 5.57 2.14 7.99L0 32l8.24-2.11A15.92 15.92 0 0 0 16 32c8.82 0 16-7.18 16-16 0-4.27-1.66-8.28-4.94-11.09ZM16 29.29c-2.4 0-4.75-.64-6.81-1.84l-.49-.29-4.89 1.25 1.31-4.76-.32-.5A13.23 13.23 0 0 1 2.71 16C2.71 8.67 8.67 2.71 16 2.71S29.29 8.67 29.29 16 23.33 29.29 16 29.29Z" })
      ] })
    }
  );
});
const Button = reactExports.memo(function Button2({
  variant = "navy",
  size = "md",
  className = "",
  children,
  ...rest
}) {
  const base = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl font-medium uppercase transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    navy: "bg-navy text-beige shadow-soft hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[0_0_15px_rgba(212,175,55,0.38)]",
    gold: "bg-gold text-navy shadow-luxe hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(212,175,55,0.48)]",
    outline: "border border-navy text-navy hover:-translate-y-0.5 hover:bg-navy hover:text-beige hover:shadow-[0_0_15px_rgba(212,175,55,0.28)]",
    ghost: "text-navy hover:-translate-y-0.5 hover:text-gold",
    destructive: "bg-red-600 text-white shadow-soft hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)]",
    soft: "border border-white/70 bg-white/80 text-navy shadow-[0_12px_28px_rgba(7,31,63,0.08)] hover:-translate-y-0.5 hover:bg-white"
  };
  const sizes = {
    sm: "px-[clamp(0.9rem,1vw,1.15rem)] py-[clamp(0.6rem,0.8vw,0.72rem)] fluid-button-label tracking-[0.22em]",
    md: "px-[clamp(1rem,1.4vw,1.5rem)] py-[clamp(0.72rem,0.95vw,0.92rem)] fluid-button-label tracking-[0.24em]",
    lg: "px-[clamp(1.1rem,1.8vw,1.8rem)] py-[clamp(0.82rem,1.2vw,1rem)] text-[clamp(0.78rem,0.22vw+0.72rem,0.96rem)] tracking-[0.26em]"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: `${base} ${sizes[size]} ${variants[variant]} ${className}`, ...rest, children });
});
const DEFAULT_MINIMUM = 3e3;
const AutoCouponSuggestion = reactExports.memo(function AutoCouponSuggestion2({
  subtotal,
  appliedCode = "",
  onApply,
  className = "",
  tone = "light"
}) {
  if (subtotal < DEFAULT_MINIMUM || appliedCode) {
    return null;
  }
});
const inputClass = "w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition duration-300 ease-in-out placeholder:text-navy/38 focus:border-gold";
const textareaClass = "w-full resize-none rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition duration-300 ease-in-out placeholder:text-navy/38 focus:border-gold";
const SectionLabel = ({ children }) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.62rem] uppercase tracking-[0.24em] text-navy/55", children });
const createEmptyDeliveryForm = () => ({
  name: "",
  email: "",
  phone: "",
  alternatePhone: "",
  houseNumber: "",
  building: "",
  area: "",
  landmark1: "",
  landmark2: "",
  city: "Hyderabad",
  state: "Telangana",
  pincode: "",
  deliveryInstructions: "",
  preferredDeliveryTime: "",
  address: ""
});
const createDeliveryFormFromUser = (user) => {
  const defaultAddress = user?.addresses?.[0];
  return {
    ...createEmptyDeliveryForm(),
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.mobile || "",
    houseNumber: defaultAddress?.line1 || defaultAddress?.street || "",
    building: defaultAddress?.line2 || defaultAddress?.landmark || "",
    city: defaultAddress?.city || "Hyderabad",
    state: defaultAddress?.state || "Telangana",
    pincode: defaultAddress?.postalCode || defaultAddress?.pincode || "",
    address: defaultAddress ? [
      defaultAddress.line1 || defaultAddress.street,
      defaultAddress.line2 || defaultAddress.landmark,
      defaultAddress.city,
      defaultAddress.state,
      defaultAddress.postalCode || defaultAddress.pincode
    ].filter(Boolean).join(", ") : ""
  };
};
const clean = (value) => value.trim();
const isDeliveryFormComplete = (form) => Boolean(
  clean(form.name) && clean(form.email) && clean(form.phone) && clean(form.houseNumber) && clean(form.area) && clean(form.city) && clean(form.state) && clean(form.pincode)
);
const buildDeliveryAddressText = (form) => {
  const line1 = [form.houseNumber, form.building, form.area].map(clean).filter(Boolean).join(", ");
  const line2 = [
    form.landmark1 ? `Landmark 1: ${clean(form.landmark1)}` : "",
    form.landmark2 ? `Landmark 2: ${clean(form.landmark2)}` : "",
    form.alternatePhone ? `Alternate phone: ${clean(form.alternatePhone)}` : "",
    form.preferredDeliveryTime ? `Preferred delivery: ${clean(form.preferredDeliveryTime)}` : "",
    form.deliveryInstructions ? `Notes: ${clean(form.deliveryInstructions)}` : ""
  ].filter(Boolean).join(" | ");
  const cityLine = [form.city, form.state, form.pincode].map(clean).filter(Boolean).join(", ");
  return [line1, line2, cityLine].filter(Boolean).join("\n");
};
const buildShippingAddress = (form) => ({
  fullName: clean(form.name),
  mobile: clean(form.phone),
  phone: clean(form.phone),
  line1: [form.houseNumber, form.building, form.area].map(clean).filter(Boolean).join(", "),
  street: clean(form.area),
  line2: [
    form.landmark1 ? `Landmark 1: ${clean(form.landmark1)}` : "",
    form.landmark2 ? `Landmark 2: ${clean(form.landmark2)}` : "",
    form.alternatePhone ? `Alternate phone: ${clean(form.alternatePhone)}` : "",
    form.preferredDeliveryTime ? `Preferred delivery: ${clean(form.preferredDeliveryTime)}` : "",
    form.deliveryInstructions ? `Notes: ${clean(form.deliveryInstructions)}` : ""
  ].filter(Boolean).join(" | "),
  landmark: [form.landmark1, form.landmark2].map(clean).filter(Boolean).join(", "),
  city: clean(form.city),
  state: clean(form.state),
  postalCode: clean(form.pincode),
  pincode: clean(form.pincode),
  country: "India"
});
const DeliveryDetailsFields = reactExports.memo(function DeliveryDetailsFields2({
  form,
  onChange,
  dense = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: dense ? "space-y-4" : "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Contact Details" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            required: true,
            value: form.name,
            onChange: onChange("name"),
            placeholder: "Full name",
            autoComplete: "name",
            className: inputClass
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            required: true,
            type: "email",
            value: form.email,
            onChange: onChange("email"),
            placeholder: "Email address",
            autoComplete: "email",
            className: inputClass
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            required: true,
            type: "tel",
            value: form.phone,
            onChange: onChange("phone"),
            placeholder: "Mobile number",
            autoComplete: "tel",
            className: "w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition duration-300 ease-in-out placeholder:text-navy/38 focus:border-gold sm:col-span-2"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "tel",
            value: form.alternatePhone,
            onChange: onChange("alternatePhone"),
            placeholder: "Alternate phone number",
            autoComplete: "tel",
            className: "w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition duration-300 ease-in-out placeholder:text-navy/38 focus:border-gold sm:col-span-2"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Delivery Address" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            required: true,
            value: form.houseNumber,
            onChange: onChange("houseNumber"),
            placeholder: "House / flat / apartment number",
            autoComplete: "address-line1",
            className: inputClass
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: form.building,
            onChange: onChange("building"),
            placeholder: "Building / floor / tower",
            autoComplete: "address-line2",
            className: inputClass
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            required: true,
            value: form.area,
            onChange: onChange("area"),
            placeholder: "Area / street / locality",
            className: "w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition duration-300 ease-in-out placeholder:text-navy/38 focus:border-gold sm:col-span-2"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: form.landmark1,
            onChange: onChange("landmark1"),
            placeholder: "Landmark 1",
            className: inputClass
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: form.landmark2,
            onChange: onChange("landmark2"),
            placeholder: "Landmark 2",
            className: inputClass
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            required: true,
            value: form.city,
            onChange: onChange("city"),
            placeholder: "City",
            autoComplete: "address-level2",
            className: inputClass
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            required: true,
            value: form.state,
            onChange: onChange("state"),
            placeholder: "State",
            autoComplete: "address-level1",
            className: inputClass
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            required: true,
            inputMode: "numeric",
            value: form.pincode,
            onChange: onChange("pincode"),
            placeholder: "Pincode / ZIP code",
            autoComplete: "postal-code",
            className: "w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition duration-300 ease-in-out placeholder:text-navy/38 focus:border-gold sm:col-span-2"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Delivery Preferences" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: form.preferredDeliveryTime,
            onChange: onChange("preferredDeliveryTime"),
            placeholder: "Preferred delivery time (optional)",
            className: inputClass
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: form.deliveryInstructions,
            onChange: onChange("deliveryInstructions"),
            rows: dense ? 2 : 3,
            placeholder: "Delivery instructions / notes",
            className: `${textareaClass} sm:col-span-2`
          }
        )
      ] })
    ] })
  ] });
});
const CheckoutModal = reactExports.memo(function CheckoutModal2() {
  const {
    cart,
    cartTotal,
    cartDiscount,
    cartFinalTotal,
    cartCouponCode,
    cartCouponMessage,
    cartCouponTone,
    cartCouponLoading,
    checkoutOpen,
    closeCheckout,
    clearCart,
    applyCartCoupon,
    removeCartCoupon
  } = useApp();
  const { addNotification } = useNotification();
  const [form, setForm] = reactExports.useState(() => createEmptyDeliveryForm());
  const [couponCode, setCouponCode] = reactExports.useState(cartCouponCode);
  const [done, setDone] = reactExports.useState(false);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const closeTimeoutRef = reactExports.useRef(null);
  const cartTotals = calculateCheckoutTotals({ subtotal: cartTotal, discount: cartDiscount });
  const shippingCharge = cartTotals.shippingCharge;
  const payableTotal = cartCouponCode ? cartFinalTotal : cartTotals.finalPayable;
  reactExports.useEffect(() => {
    setCouponCode(cartCouponCode);
  }, [cartCouponCode]);
  const applySuggestedCoupon = reactExports.useCallback(
    (code) => {
      setCouponCode(code);
      void applyCartCoupon(code);
    },
    [applyCartCoupon]
  );
  reactExports.useEffect(
    () => () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    },
    []
  );
  const update = reactExports.useCallback(
    (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value })),
    []
  );
  const resetAndClose = reactExports.useCallback(() => {
    setDone(false);
    setError("");
    closeCheckout();
  }, [closeCheckout]);
  const submit = reactExports.useCallback(
    async (e) => {
      e.preventDefault();
      if (!cart.length) return;
      if (!isDeliveryFormComplete(form)) {
        setError("Please fill all required delivery details.");
        return;
      }
      setSubmitting(true);
      setError("");
      try {
        await ordersApi.create({
          customerName: form.name.trim(),
          phone: form.phone.trim(),
          address: buildDeliveryAddressText(form),
          shippingAddress: buildShippingAddress(form),
          couponCode: cartCouponCode || void 0,
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            size: item.size.size
          }))
        });
        addNotification("Order placed.");
        clearCart();
        setDone(true);
        if (closeTimeoutRef.current) {
          window.clearTimeout(closeTimeoutRef.current);
        }
        closeTimeoutRef.current = window.setTimeout(() => {
          setForm(createEmptyDeliveryForm());
          resetAndClose();
        }, 2200);
      } catch (ex) {
        const message = ex instanceof Error ? ex.message : "Order could not be placed.";
        setError(message);
        addNotification(message, "error");
      } finally {
        setSubmitting(false);
      }
    },
    [addNotification, cart, cartCouponCode, clearCart, form, resetAndClose]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: checkoutOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      onClick: resetAndClose,
      className: "fixed inset-0 z-[95] overflow-y-auto bg-navy/60 backdrop-blur-md",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { y: 30, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: 30, opacity: 0 },
          onClick: (e) => e.stopPropagation(),
          className: "relative mx-3 my-4 w-auto max-w-[min(100vw-1.5rem,34rem)] rounded-2xl border border-border bg-card p-5 shadow-luxe sm:mx-auto sm:my-10 sm:p-6 md:p-8",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: resetAndClose,
                className: "absolute right-4 top-4 rounded-full bg-beige/60 p-2 text-navy hover:bg-beige",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
              }
            ),
            done ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-12 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold text-navy", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-7 w-7" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display mt-6 text-3xl text-navy", children: "Order placed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-navy/60", children: "We'll reach out shortly to confirm." })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.4em] text-gold", children: "Checkout" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-2 font-display text-2xl text-navy sm:text-3xl", children: "Confirm your order" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-3 rounded-lg border border-border bg-beige/40 p-4", children: [
                cart.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-navy", children: item.product.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs uppercase tracking-widest text-navy/50", children: [
                      item.size.size,
                      " x ",
                      item.quantity
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-xl text-gold", children: formatINR(multiplyMoney(item.size.price, item.quantity)) })
                ] }, item.key)),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border pt-3 text-sm text-navy/70", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Subtotal" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatINR(cartTotal) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Discount" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cartDiscount > 0 ? "text-green-700" : "", children: [
                      "-",
                      formatINR(cartDiscount)
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Shipping Charges" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: shippingCharge > 0 ? formatINR(shippingCharge) : "Free" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t border-border pt-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.25em] text-navy/60", children: "Final Total" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-2xl text-navy", children: formatINR(payableTotal) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-lg border border-border bg-beige/30 p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.24em] text-navy/55", children: "Coupon Code" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  AutoCouponSuggestion,
                  {
                    subtotal: cartTotal,
                    appliedCode: cartCouponCode,
                    onApply: applySuggestedCoupon,
                    className: "mt-3"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-col gap-3 sm:flex-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "text",
                      value: couponCode,
                      onChange: (event) => setCouponCode(event.target.value.toUpperCase()),
                      placeholder: "Coupon code",
                      className: "w-full rounded-lg border border-border bg-white/70 px-4 py-3 text-sm uppercase text-navy outline-none focus:border-navy"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => void applyCartCoupon(couponCode),
                      disabled: cartCouponLoading || !cart.length,
                      className: "rounded-lg bg-navy px-4 py-3 text-xs uppercase tracking-[0.2em] text-beige transition hover:opacity-90 disabled:opacity-50",
                      children: cartCouponLoading ? "Applying..." : "Apply Coupon"
                    }
                  )
                ] }),
                cartCouponCode ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between gap-3 rounded-lg bg-white/70 px-4 py-3 text-sm text-navy/75", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Applied: ",
                    cartCouponCode
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: removeCartCoupon,
                      className: "text-xs uppercase tracking-[0.2em] text-red-600 transition hover:text-red-700",
                      children: "Remove"
                    }
                  )
                ] }) : null,
                cartCouponMessage ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: `mt-3 text-sm ${cartCouponTone === "error" ? "text-red-600" : cartCouponTone === "info" ? "text-navy/60" : "text-green-700"}`,
                    children: cartCouponMessage
                  }
                ) : null
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "mt-6 space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(DeliveryDetailsFields, { form, onChange: update, dense: true }),
                error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600", children: error }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "submit",
                    disabled: submitting || !cart.length,
                    className: "mt-4 w-full",
                    children: submitting ? "Placing..." : `Place Order ${formatINR(payableTotal)}`
                  }
                )
              ] })
            ] })
          ]
        }
      )
    }
  ) });
});
function SiteShell({ children }) {
  const cursorLightRef = reactExports.useRef(null);
  const mainRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const light = cursorLightRef.current;
    if (!light) {
      return void 0;
    }
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (prefersReducedMotion || !supportsFinePointer) {
      light.style.display = "none";
      return void 0;
    }
    let rafId = 0;
    let nextX = window.innerWidth / 2;
    let nextY = window.innerHeight / 2;
    const render = () => {
      rafId = 0;
      light.style.transform = `translate3d(${nextX}px, ${nextY}px, 0) translate(-50%, -50%)`;
      light.style.opacity = "1";
    };
    const handleMouseMove = (event) => {
      nextX = event.clientX;
      nextY = event.clientY;
      if (!rafId) {
        rafId = window.requestAnimationFrame(render);
      }
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);
  reactExports.useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) {
      return void 0;
    }
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observedSections = /* @__PURE__ */ new WeakSet();
    const getSections = () => Array.from(mainElement.querySelectorAll("section"));
    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      const revealSections = () => {
        getSections().forEach((section) => {
          section.classList.add("section-reveal", "section-reveal--visible");
        });
      };
      const mutationObserver2 = new MutationObserver(revealSections);
      revealSections();
      mutationObserver2.observe(mainElement, { childList: true, subtree: true });
      return () => {
        mutationObserver2.disconnect();
      };
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("section-reveal--visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px"
      }
    );
    const observeSections = () => {
      getSections().forEach((section, index) => {
        if (observedSections.has(section)) {
          return;
        }
        observedSections.add(section);
        section.classList.add("section-reveal");
        if (index === 0) {
          section.classList.add("section-reveal--visible");
          return;
        }
        observer.observe(section);
      });
    };
    const mutationObserver = new MutationObserver(observeSections);
    observeSections();
    mutationObserver.observe(mainElement, { childList: true, subtree: true });
    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "site-shell relative isolate flex min-h-screen min-w-0 flex-col overflow-x-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: cursorLightRef, className: "cursor-light", "aria-hidden": "true" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "site-shell__content relative z-[1] flex min-h-screen min-w-0 flex-1 flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "site-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StickyOfferBar, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { ref: mainRef, className: "site-main min-w-0 flex-1", children }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(WhatsAppFloat, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CheckoutModal, {})
    ] })
  ] });
}
const $$splitComponentImporter$E = () => import("./verify-email-rhlV5wT9.js");
const Route$E = createFileRoute("/verify-email")({
  beforeLoad: () => {
    throw redirect({
      to: "/"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$E, "component")
});
const $$splitComponentImporter$D = () => import("./terms-and-conditions-B04_ukW3.js");
const Route$D = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [{
      title: "Terms & Conditions | Purefumes Hyderabad"
    }, {
      name: "description",
      content: "Review Purefumes Hyderabad website terms for product information, pricing, availability, order acceptance, customer responsibilities, liability, and governing law."
    }, {
      property: "og:title",
      content: "Terms & Conditions | Purefumes Hyderabad"
    }, {
      property: "og:description",
      content: "Purefumes Hyderabad ecommerce terms covering browsing, ordering, payments, delivery, and customer responsibilities."
    }, {
      property: "og:type",
      content: "website"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$D, "component")
});
const $$splitComponentImporter$C = () => import("./success-BuxKIVnh.js");
const Route$C = createFileRoute("/success")({
  component: lazyRouteComponent($$splitComponentImporter$C, "component")
});
const $$splitComponentImporter$B = () => import("./signup-YoSzZpzv.js");
const Route$B = createFileRoute("/signup")({
  beforeLoad: () => {
    throw redirect({
      to: "/"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$B, "component")
});
const $$splitComponentImporter$A = () => import("./shop-7vjwepmv.js");
const Route$A = createFileRoute("/shop")({
  head: () => ({
    meta: [{
      title: "Shop Perfumes Online | Purefumes Hyderabad"
    }, {
      name: "description",
      content: "Browse clearly visible perfumes and personal care products from Purefumes Hyderabad with brand, category, search, and sorting filters."
    }, {
      property: "og:title",
      content: "Shop Perfumes Online | Purefumes Hyderabad"
    }, {
      property: "og:description",
      content: "Explore authentic perfumes from Purefumes Hyderabad with secure checkout and delivery across India."
    }, {
      property: "og:type",
      content: "website"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$A, "component")
});
const $$splitComponentImporter$z = () => import("./shipping-policy-BbgByZML.js");
const Route$z = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [{
      title: "Shipping Policy | Purefumes Hyderabad"
    }, {
      name: "description",
      content: "Read the Purefumes Hyderabad Shipping Policy covering order processing, 1-3 business day dispatch, India delivery timelines, courier delays, and tracking details."
    }, {
      property: "og:title",
      content: "Shipping Policy | Purefumes Hyderabad"
    }, {
      property: "og:description",
      content: "Purefumes Hyderabad shipping details, processing timelines, delivery expectations across India, and support information."
    }, {
      property: "og:type",
      content: "website"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$z, "component")
});
const $$splitComponentImporter$y = () => import("./return-policy-DRjU9YNc.js");
const Route$y = createFileRoute("/return-policy")({
  head: () => ({
    meta: [{
      title: "Return Policy | Purefumes Hyderabad"
    }, {
      name: "description",
      content: "Read the Purefumes Hyderabad Return Policy for return eligibility, timelines, product condition rules, non-returnable items, replacements, and return shipping."
    }, {
      property: "og:title",
      content: "Return Policy | Purefumes Hyderabad"
    }, {
      property: "og:description",
      content: "Purefumes Hyderabad return eligibility, replacement rules, inspection requirements, cancellations, refunds, and support details."
    }, {
      property: "og:type",
      content: "website"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$y, "component")
});
const $$splitComponentImporter$x = () => import("./reset-password-CGf9mAOt.js");
const Route$x = createFileRoute("/reset-password")({
  beforeLoad: () => {
    throw redirect({
      to: "/"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$x, "component")
});
const $$splitComponentImporter$w = () => import("./refund-policy-B6IIlGna.js");
const Route$w = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [{
      title: "Refund & Cancellation Policy | Purefumes Hyderabad"
    }, {
      name: "description",
      content: "Understand Purefumes Hyderabad refund and cancellation rules, including cancellation windows, refund eligibility, processing time, damaged product handling, and payment reversals."
    }, {
      property: "og:title",
      content: "Refund & Cancellation Policy | Purefumes Hyderabad"
    }, {
      property: "og:description",
      content: "Purefumes Hyderabad refund timelines, cancellation windows, payment reversals, and damaged or missing item verification."
    }, {
      property: "og:type",
      content: "website"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$w, "component")
});
const $$splitComponentImporter$v = () => import("./profile-o3Wiw2tV.js");
const Route$v = createFileRoute("/profile")({
  beforeLoad: () => {
    throw redirect({
      to: "/"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$v, "component")
});
const $$splitComponentImporter$u = () => import("./privacy-policy-CbYr9ywA.js");
const Route$u = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [{
      title: "Privacy Policy | Purefumes Hyderabad"
    }, {
      name: "description",
      content: "Read the Purefumes Hyderabad Privacy Policy covering customer data, account information, payment security, cookies, third-party services, and user rights."
    }, {
      property: "og:title",
      content: "Privacy Policy | Purefumes Hyderabad"
    }, {
      property: "og:description",
      content: "Purefumes Hyderabad customer privacy, payment security, data use, cookies, and support contact information."
    }, {
      property: "og:type",
      content: "website"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$u, "component")
});
const $$splitComponentImporter$t = () => import("./my-orders-CcaiViIS.js");
const Route$t = createFileRoute("/my-orders")({
  beforeLoad: () => {
    throw redirect({
      to: "/"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$t, "component")
});
const $$splitComponentImporter$s = () => import("./login-CcaiViIS.js");
const Route$s = createFileRoute("/login")({
  beforeLoad: () => {
    throw redirect({
      to: "/"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$s, "component")
});
const $$splitComponentImporter$r = () => import("./forgot-password-CcaiViIS.js");
const Route$r = createFileRoute("/forgot-password")({
  beforeLoad: () => {
    throw redirect({
      to: "/"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$r, "component")
});
const $$splitComponentImporter$q = () => import("./contact-Dti7cqI9.js");
const Route$q = createFileRoute("/contact")({
  component: lazyRouteComponent($$splitComponentImporter$q, "component")
});
const $$splitComponentImporter$p = () => import("./checkout-CN9d497h.js");
const Route$p = createFileRoute("/checkout")({
  component: lazyRouteComponent($$splitComponentImporter$p, "component")
});
const $$splitComponentImporter$o = () => import("./cart-B0wGoebw.js");
const Route$o = createFileRoute("/cart")({
  component: lazyRouteComponent($$splitComponentImporter$o, "component")
});
const $$splitComponentImporter$n = () => import("./brands-QN5cMk2R.js");
const Route$n = createFileRoute("/brands")({
  component: lazyRouteComponent($$splitComponentImporter$n, "component")
});
const $$splitComponentImporter$m = () => import("./admin-DMCgcu6U.js");
const Route$m = createFileRoute("/admin")({
  beforeLoad: async ({
    location
  }) => {
    if (location.pathname === "/admin/login") {
      return;
    }
    const user = await queryClient.ensureQueryData(authSessionQueryOptions());
    if (!user || user.role !== "admin") {
      throw redirect({
        to: "/admin/login",
        search: {
          redirect: location.pathname
        }
      });
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$m, "component")
});
const $$splitComponentImporter$l = () => import("./about-L7XrrghR.js");
const Route$l = createFileRoute("/about")({
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./index-CkYPT3pc.js");
const Route$k = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Purefumes Hyderabad | Authentic Perfumes Online"
    }, {
      name: "description",
      content: "Shop authentic perfumes and personal care products from Purefumes Hyderabad with secure checkout, customer support, and fast delivery across India."
    }, {
      property: "og:title",
      content: "Purefumes Hyderabad | Authentic Perfumes Online"
    }, {
      property: "og:description",
      content: "Discover authentic fragrances, bestsellers, latest arrivals, and trusted ecommerce support from Purefumes Hyderabad."
    }, {
      property: "og:type",
      content: "website"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./admin.index-ChnjqqqM.js");
const Route$j = createFileRoute("/admin/")({
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("animate-pulse rounded-md bg-primary/10", className), ...props });
}
function ProductPageSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SiteShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "pb-56 pt-10 sm:pt-12 lg:pb-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-40" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,0.82fr)_minmax(22rem,1fr)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto grid w-full max-w-[42rem] gap-3 sm:gap-4 xl:max-w-none xl:grid-cols-[4.5rem_minmax(0,1fr)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "order-2 flex gap-3 xl:order-1 xl:flex-col", children: Array.from({ length: 4 }).map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 w-16 rounded-2xl sm:h-20 sm:w-20 xl:h-[4.5rem] xl:w-[4.5rem]" }, index)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "order-1 aspect-square rounded-[2rem] xl:order-2" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-28" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-3/4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-5/6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-56 rounded-[2rem]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-28 rounded-[1.5rem]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-48 rounded-[1.75rem]" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "mt-10 h-44 rounded-[2rem]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "mt-10 h-[28rem] rounded-[2rem]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-14", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "mt-3 h-10 w-72" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 flex gap-6 overflow-x-auto no-scrollbar", children: Array.from({ length: 3 }).map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[78vw] shrink-0 sm:min-w-[20rem] lg:min-w-[22rem]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "aspect-[3/4] rounded-xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "mt-4 h-3 w-20" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "mt-3 h-6 w-40" })
      ] }, index)) })
    ] })
  ] }) }) });
}
const $$splitErrorComponentImporter$3 = () => import("./product._id-DZo0Oy7D.js");
const $$splitNotFoundComponentImporter$2 = () => import("./product._id-Bj-ZxWIU.js");
const $$splitComponentImporter$i = () => import("./product._id-Dx44X3DI.js");
const Route$i = createFileRoute("/product/$id")({
  loader: async ({
    params
  }) => {
    const product = await productsApi.get(params.id);
    if (!product) throw notFound();
    return {
      product
    };
  },
  pendingComponent: ProductPending,
  component: lazyRouteComponent($$splitComponentImporter$i, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$2, "notFoundComponent"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$3, "errorComponent")
});
function ProductPending() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ProductPageSkeleton, {});
}
const $$splitComponentImporter$h = () => import("./login.success-Bx2Yuaa5.js");
const Route$h = createFileRoute("/login/success")({
  beforeLoad: () => {
    throw redirect({
      to: "/"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./category._slug-Bs7Uunw5.js");
const Route$g = createFileRoute("/category/$slug")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const PAGE_SIZE = 12;
const $$splitErrorComponentImporter$2 = () => import("./brand._brandId-CMYLkqhW.js");
const $$splitNotFoundComponentImporter$1 = () => import("./brand._brandId-Ckr7DRZ6.js");
const $$splitComponentImporter$f = () => import("./brand._brandId-tYx5sfKl.js");
const Route$f = createFileRoute("/brand/$brandId")({
  loader: async ({
    params
  }) => {
    try {
      const [brand, products] = await Promise.all([brandsApi.get(params.brandId), productsApi.listPaginated({
        brandId: params.brandId,
        page: 1,
        limit: PAGE_SIZE
      })]);
      if (!brand) {
        throw notFound();
      }
      return {
        brand,
        products
      };
    } catch (error) {
      if (error instanceof Error && /brand not found|invalid brand id/i.test(error.message)) {
        throw notFound();
      }
      throw error;
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$f, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$1, "notFoundComponent"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$2, "errorComponent")
});
const $$splitComponentImporter$e = () => import("./auth.google-DKR0Lcyr.js");
const Route$e = createFileRoute("/auth/google")({
  beforeLoad: () => {
    throw redirect({
      to: "/"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitErrorComponentImporter$1 = () => import("./admin.users-ewe9turo.js");
const $$splitComponentImporter$d = () => import("./admin.users-DRDQBjxb.js");
const Route$d = createFileRoute("/admin/users")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$1, "errorComponent")
});
const $$splitComponentImporter$c = () => import("./admin.settings-D-T_dx5m.js");
const Route$c = createFileRoute("/admin/settings")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./admin.requests-BTQua9D0.js");
const Route$b = createFileRoute("/admin/requests")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./admin.products-C5CfuULH.js");
const Route$a = createFileRoute("/admin/products")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./admin.orders-CpCnontn.js");
const Route$9 = createFileRoute("/admin/orders")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./admin.login-i-pQ6NRw.js");
const Route$8 = createFileRoute("/admin/login")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./admin.coupons-BEwLYffq.js");
const Route$7 = createFileRoute("/admin/coupons")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./admin.categories-ux20MGuf.js");
const Route$6 = createFileRoute("/admin/categories")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./admin.brands-jfLVlDU7.js");
const Route$5 = createFileRoute("/admin/brands")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./admin.bestsellers-CvYGv4Ti.js");
const Route$4 = createFileRoute("/admin/bestsellers")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./admin.banners-YEIb5HRo.js");
const Route$3 = createFileRoute("/admin/banners")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./admin.analytics-B5JP_K_M.js");
const Route$2 = createFileRoute("/admin/analytics")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./admin.products.new-DiGlG_hH.js");
const Route$1 = createFileRoute("/admin/products/new")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitErrorComponentImporter = () => import("./admin.products._id-CqSEZVp2.js");
const $$splitNotFoundComponentImporter = () => import("./admin.products._id-C0Tbn2FK.js");
const $$splitComponentImporter = () => import("./admin.products._id-DZbYlKiE.js");
const Route = createFileRoute("/admin/products/$id")({
  loader: async ({
    params
  }) => {
    const product = await productsApi.get(params.id);
    if (!product) throw notFound();
    return {
      product
    };
  },
  component: lazyRouteComponent($$splitComponentImporter, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent")
});
const WishlistRoute = Route$F.update({
  id: "/wishlist",
  path: "/wishlist",
  getParentRoute: () => Route$G
});
const VerifyEmailRoute = Route$E.update({
  id: "/verify-email",
  path: "/verify-email",
  getParentRoute: () => Route$G
});
const TermsAndConditionsRoute = Route$D.update({
  id: "/terms-and-conditions",
  path: "/terms-and-conditions",
  getParentRoute: () => Route$G
});
const SuccessRoute = Route$C.update({
  id: "/success",
  path: "/success",
  getParentRoute: () => Route$G
});
const SignupRoute = Route$B.update({
  id: "/signup",
  path: "/signup",
  getParentRoute: () => Route$G
});
const ShopRoute = Route$A.update({
  id: "/shop",
  path: "/shop",
  getParentRoute: () => Route$G
});
const ShippingPolicyRoute = Route$z.update({
  id: "/shipping-policy",
  path: "/shipping-policy",
  getParentRoute: () => Route$G
});
const ReturnPolicyRoute = Route$y.update({
  id: "/return-policy",
  path: "/return-policy",
  getParentRoute: () => Route$G
});
const ResetPasswordRoute = Route$x.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$G
});
const RefundPolicyRoute = Route$w.update({
  id: "/refund-policy",
  path: "/refund-policy",
  getParentRoute: () => Route$G
});
const ProfileRoute = Route$v.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => Route$G
});
const PrivacyPolicyRoute = Route$u.update({
  id: "/privacy-policy",
  path: "/privacy-policy",
  getParentRoute: () => Route$G
});
const MyOrdersRoute = Route$t.update({
  id: "/my-orders",
  path: "/my-orders",
  getParentRoute: () => Route$G
});
const LoginRoute = Route$s.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$G
});
const ForgotPasswordRoute = Route$r.update({
  id: "/forgot-password",
  path: "/forgot-password",
  getParentRoute: () => Route$G
});
const ContactRoute = Route$q.update({
  id: "/contact",
  path: "/contact",
  getParentRoute: () => Route$G
});
const CheckoutRoute = Route$p.update({
  id: "/checkout",
  path: "/checkout",
  getParentRoute: () => Route$G
});
const CartRoute = Route$o.update({
  id: "/cart",
  path: "/cart",
  getParentRoute: () => Route$G
});
const BrandsRoute = Route$n.update({
  id: "/brands",
  path: "/brands",
  getParentRoute: () => Route$G
});
const AdminRoute = Route$m.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$G
});
const AboutRoute = Route$l.update({
  id: "/about",
  path: "/about",
  getParentRoute: () => Route$G
});
const IndexRoute = Route$k.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$G
});
const AdminIndexRoute = Route$j.update({
  id: "/",
  path: "/",
  getParentRoute: () => AdminRoute
});
const ProductIdRoute = Route$i.update({
  id: "/product/$id",
  path: "/product/$id",
  getParentRoute: () => Route$G
});
const LoginSuccessRoute = Route$h.update({
  id: "/success",
  path: "/success",
  getParentRoute: () => LoginRoute
});
const CategorySlugRoute = Route$g.update({
  id: "/category/$slug",
  path: "/category/$slug",
  getParentRoute: () => Route$G
});
const BrandBrandIdRoute = Route$f.update({
  id: "/brand/$brandId",
  path: "/brand/$brandId",
  getParentRoute: () => Route$G
});
const AuthGoogleRoute = Route$e.update({
  id: "/auth/google",
  path: "/auth/google",
  getParentRoute: () => Route$G
});
const AdminUsersRoute = Route$d.update({
  id: "/users",
  path: "/users",
  getParentRoute: () => AdminRoute
});
const AdminSettingsRoute = Route$c.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => AdminRoute
});
const AdminRequestsRoute = Route$b.update({
  id: "/requests",
  path: "/requests",
  getParentRoute: () => AdminRoute
});
const AdminProductsRoute = Route$a.update({
  id: "/products",
  path: "/products",
  getParentRoute: () => AdminRoute
});
const AdminOrdersRoute = Route$9.update({
  id: "/orders",
  path: "/orders",
  getParentRoute: () => AdminRoute
});
const AdminLoginRoute = Route$8.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => AdminRoute
});
const AdminCouponsRoute = Route$7.update({
  id: "/coupons",
  path: "/coupons",
  getParentRoute: () => AdminRoute
});
const AdminCategoriesRoute = Route$6.update({
  id: "/categories",
  path: "/categories",
  getParentRoute: () => AdminRoute
});
const AdminBrandsRoute = Route$5.update({
  id: "/brands",
  path: "/brands",
  getParentRoute: () => AdminRoute
});
const AdminBestsellersRoute = Route$4.update({
  id: "/bestsellers",
  path: "/bestsellers",
  getParentRoute: () => AdminRoute
});
const AdminBannersRoute = Route$3.update({
  id: "/banners",
  path: "/banners",
  getParentRoute: () => AdminRoute
});
const AdminAnalyticsRoute = Route$2.update({
  id: "/analytics",
  path: "/analytics",
  getParentRoute: () => AdminRoute
});
const AdminProductsNewRoute = Route$1.update({
  id: "/new",
  path: "/new",
  getParentRoute: () => AdminProductsRoute
});
const AdminProductsIdRoute = Route.update({
  id: "/$id",
  path: "/$id",
  getParentRoute: () => AdminProductsRoute
});
const AdminProductsRouteChildren = {
  AdminProductsIdRoute,
  AdminProductsNewRoute
};
const AdminProductsRouteWithChildren = AdminProductsRoute._addFileChildren(
  AdminProductsRouteChildren
);
const AdminRouteChildren = {
  AdminAnalyticsRoute,
  AdminBannersRoute,
  AdminBestsellersRoute,
  AdminBrandsRoute,
  AdminCategoriesRoute,
  AdminCouponsRoute,
  AdminLoginRoute,
  AdminOrdersRoute,
  AdminProductsRoute: AdminProductsRouteWithChildren,
  AdminRequestsRoute,
  AdminSettingsRoute,
  AdminUsersRoute,
  AdminIndexRoute
};
const AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);
const LoginRouteChildren = {
  LoginSuccessRoute
};
const LoginRouteWithChildren = LoginRoute._addFileChildren(LoginRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AboutRoute,
  AdminRoute: AdminRouteWithChildren,
  BrandsRoute,
  CartRoute,
  CheckoutRoute,
  ContactRoute,
  ForgotPasswordRoute,
  LoginRoute: LoginRouteWithChildren,
  MyOrdersRoute,
  PrivacyPolicyRoute,
  ProfileRoute,
  RefundPolicyRoute,
  ResetPasswordRoute,
  ReturnPolicyRoute,
  ShippingPolicyRoute,
  ShopRoute,
  SignupRoute,
  SuccessRoute,
  TermsAndConditionsRoute,
  VerifyEmailRoute,
  WishlistRoute,
  AuthGoogleRoute,
  BrandBrandIdRoute,
  CategorySlugRoute,
  ProductIdRoute
};
const routeTree = Route$G._addFileChildren(rootRouteChildren)._addFileTypes();
function DefaultErrorComponent({ error, reset }) {
  const router2 = useRouter();
  reactExports.useEffect(() => {
    captureFrontendException(error, {
      source: "router.defaultErrorComponent",
      path: typeof window === "undefined" ? "" : window.location.pathname
    });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-8 w-8 text-destructive",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Something went wrong" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "An unexpected error occurred. Please try again." }),
    false,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center justify-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route as $,
  AutoCouponSuggestion as A,
  Button as B,
  Container as C,
  DeliveryDetailsFields as D,
  useRenderInstrumentation as E,
  BESTSELLERS_CHANGED_EVENT as F,
  storefrontFallbackProducts as G,
  scheduleIdleTask as H,
  cloudinaryStaticImages as I,
  adminApi as J,
  cn as K,
  useWishlistStatus as L,
  uiActionObserver as M,
  useAuth as N,
  OptimizedImage as O,
  isUsingMock as P,
  Route$g as Q,
  Route$i as R,
  SiteShell as S,
  isGenderCategory as T,
  Route$f as U,
  PAGE_SIZE as V,
  perfumeRequestsApi as W,
  getBrandCategoryId as X,
  getBrandCategorySlug as Y,
  PRODUCTS_CHANGED_EVENT as Z,
  bannersApi as _,
  useNotification as a,
  LATEST_PRODUCTS_CHANGED_EVENT as a0,
  router as a1,
  formatPaymentStatusLabel as b,
  formatOrderStatusLabel as c,
  categoriesApi as d,
  createCatalogSlug as e,
  formatINR as f,
  brandsApi as g,
  filterStorefrontCategories as h,
  filterBrandsByCategory as i,
  CategoryRail as j,
  Skeleton as k,
  createDeliveryFormFromUser as l,
  multiplyMoney as m,
  calculateCheckoutTotals as n,
  couponsApi as o,
  productsApi as p,
  normalizeMoney as q,
  isDeliveryFormComplete as r,
  buildDeliveryAddressText as s,
  buildShippingAddress as t,
  useApp as u,
  ordersApi as v,
  paymentsApi as w,
  frontendEventBus as x,
  BANNERS_CHANGED_EVENT as y,
  DATA_EVENT_STORAGE_KEY as z
};
