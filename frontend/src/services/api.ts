/**
 * API service layer for the Purefumes Hyderabad backend.
 * Product, category, and order data must come from MongoDB through VITE_API_URL.
 */

import type { Brand, BrandPreviewProduct } from "@/data/brands";
import type { Category } from "@/data/categories";
import type { Accord, BestTime, Product, Size } from "@/data/products";
import { apiTrafficProxy } from "@/lib/performance/api-proxy";
import { perfInstrumentation } from "@/lib/performance/instrumentation";
import { frontendMediator } from "@/lib/performance/mediator";
import runtimeConfig from "@/lib/runtime-config";

const BASE = runtimeConfig.apiUrl.replace(/\/$/, "");
const CATALOG_CACHE_TTL_MS = 30 * 1000;
const CATALOG_CACHE_SWR_MS = 2 * 60 * 1000;
const CATALOG_CACHE_MAX_KEYS = 100;
const USER_CACHE_TTL_MS = 4 * 1000;
const USER_CACHE_SWR_MS = 12 * 1000;
const ADMIN_CACHE_TTL_MS = 5 * 1000;
const ADMIN_CACHE_SWR_MS = 15 * 1000;
const catalogResponseCache = new Map<string, CatalogCacheEntry>();
const inflightCatalogRequests = new Map<string, Promise<unknown>>();
let authCacheVersion = 0;
let csrfTokenCache = "";
let csrfTokenRequest: Promise<string> | null = null;
export const PRODUCTS_CHANGED_EVENT = "purefumes:products-changed";
export const BESTSELLERS_CHANGED_EVENT = "purefumes:bestsellers-changed";
export const LATEST_PRODUCTS_CHANGED_EVENT = "purefumes:latest-products-changed";
export const DATA_EVENT_STORAGE_KEY = "purefumes:data-event";

const API_ORIGIN = runtimeConfig.apiOrigin;
const AUTH_URL = runtimeConfig.authUrl;

const clearLegacyStoredAccessTokens = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("purefumes_access_token");
  window.localStorage.removeItem("token");
};

clearLegacyStoredAccessTokens();

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type CatalogCacheEntry = {
  createdAt: number;
  data: unknown;
};

type PaginatedProducts = {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

type ProductListParams = {
  page?: number;
  limit?: number;
  sort?: string;
  category?: Product["category"];
  brandId?: string;
  brand?: string;
  search?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
};

type CatalogRequestOptions = {
  forceFresh?: boolean;
};

type BrandListParams = {
  category?: Brand["category"];
};

type CategoryListOptions = {
  featured?: boolean;
  includeInactive?: boolean;
  search?: string;
};

type ProductPayload = Partial<Product> & {
  _id?: string;
  id?: string;
  notes?: string[];
  season?: Product["seasons"];
  timeOfDay?: Product["usage"] | string;
  accords?: Array<Partial<Accord> & { color?: string; intensity?: number }>;
  categories?: Array<CategoryPayload | string>;
  categoryIds?: string[];
  categoryNames?: string[];
  categorySlugs?: string[];
  primaryCategory?: string | null;
};

type BrandPayload = Partial<Brand> & {
  _id?: string;
  id?: string;
};

type CategoryPayload = Partial<Category> & {
  _id?: string;
  id?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
  isDeleted?: boolean;
  productCount?: number;
};

export type AdminCategoryListResponse = {
  items: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  summary: {
    total: number;
    active: number;
    inactive: number;
    featured: number;
    deleted: number;
  };
};

export type Banner = {
  _id: string;
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  link: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
};

type BannerPayload = Partial<Banner> & {
  _id?: string;
  id?: string;
};

export type BulkBrandImportRow = {
  rowNumber?: number;
  name: string;
  category: string;
  logo?: string;
};

export type BulkBrandImportIssue = {
  rowNumber: number;
  name: string;
  category: string;
  logo: string;
  status: "skipped" | "failed";
  reason: string;
};

export type BulkBrandImportResult = {
  totalRows: number;
  createdCount: number;
  skippedCount: number;
  failedCount: number;
  createdBrands: Brand[];
  skippedRows: BulkBrandImportIssue[];
  failedRows: BulkBrandImportIssue[];
  batchSize: number;
};

export type BulkProductImportRow = {
  rowNumber?: number;
  name: string;
  brand: string;
  category?: string;
  price: string | number;
  stock: string | number;
  description?: string;
  image?: string;
  imageUrls?: string[] | string;
  sizes?: Array<{ size: string; price: number }> | string;
};

export type BulkProductImportIssue = {
  rowNumber: number;
  name: string;
  brand: string;
  category: string;
  price: string | number;
  stock: string | number;
  description: string;
  status: "skipped" | "failed";
  reason: string;
};

export type BulkProductImportResult = {
  totalRows: number;
  createdCount: number;
  skippedCount: number;
  failedCount: number;
  createdProducts: Product[];
  skippedRows: BulkProductImportIssue[];
  failedRows: BulkProductImportIssue[];
  batchSize: number;
};

export type OrderItem = {
  productId: string;
  productName: string;
  brand: string;
  quantity: number;
  price: number;
  priceAtPurchase?: number;
  productImage?: string;
  size?: string;
};

export type Order = {
  _id: string;
  id?: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  subtotalAmount?: number;
  discountAmount?: number;
  couponCode?: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  orderStatus?: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
  product?: string;
  productId?: string;
  productName?: string;
  brand?: string;
  size?: string;
  price?: number;
  isSeen?: boolean;
  paymentId?: string;
  paymentMethod?: string;
  paymentGateway?: string;
  paymentOrderId?: string;
  paymentSignature?: string;
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
};

export type CouponDiscountType = "percentage" | "fixed";

export type Coupon = {
  _id: string;
  id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  expiryDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type CouponPayload = Partial<Coupon> & {
  _id?: string;
  id?: string;
};

export type CouponOrderItemInput = {
  productId: string;
  quantity: number;
  size?: string;
};

export type ApplyCouponInput = {
  code: string;
  cartTotal?: number;
  items?: CouponOrderItemInput[];
};

export type ApplyCouponResult = {
  success: boolean;
  code: string;
  discount: number;
  finalTotal: number;
  subtotal: number;
  message?: string;
  coupon?: Coupon | null;
};

export type PerfumeRequestStatus = "new" | "contacted" | "sourced" | "closed";

export type PerfumeRequest = {
  _id: string;
  id: string;
  perfumeName: string;
  customerName: string;
  phoneNumber: string;
  preferredSize: string;
  budgetRange: string;
  message: string;
  images: string[];
  status: PerfumeRequestStatus;
  createdAt: string;
  updatedAt: string;
};

type PerfumeRequestPayload = Partial<PerfumeRequest> & {
  _id?: string;
  id?: string;
};

type HttpOptions = RequestInit & {
  forceFresh?: boolean;
  skipAuthRefresh?: boolean;
};

type UploadRequestOptions = {
  onUploadProgress?: (progress: number) => void;
  skipAuthRefresh?: boolean;
};

type PaginatedOrders = {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

type DateRangeParams = {
  range?: AnalyticsRangeKey;
  from?: string;
  to?: string;
};

type OrderListParams = DateRangeParams & {
  page?: number;
  limit?: number;
  status?: Order["status"] | "";
};

type PerfumeRequestListParams = DateRangeParams & {
  page?: number;
  limit?: number;
  status?: PerfumeRequestStatus | "";
};

type PaginatedPerfumeRequests = {
  requests: PerfumeRequest[];
  pagination: PaginatedOrders["pagination"];
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  username?: string;
  mobile: string;
  role: "user" | "admin";
  profileImage?: string;
  addresses?: Address[];
  totalOrders?: number;
  totalSpent?: number;
  emailVerified?: boolean;
  isBanned?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminUser = AuthUser & {
  username?: string;
  phone?: string;
  lastLogin?: string | null;
};

export type AdminUserStats = {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  newUsersToday: number;
  premiumCustomers: number;
  revenueGenerated: number;
};

export type AdminUsersResponse = {
  users: AdminUser[];
  stats: AdminUserStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type AdminUserDetailsResponse = {
  user: AdminUser;
  recentOrders: Order[];
  summary: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    firstOrderAt: string | null;
    lastOrderAt: string | null;
    recentRevenue: number;
  };
};

export type Address = {
  _id?: string;
  label?: string;
  fullName: string;
  mobile: string;
  phone?: string;
  line1: string;
  street?: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode?: string;
  pincode?: string;
  country: string;
  isDefault?: boolean;
};

type AuthUserResponse = { user: AuthUser };
export type DashboardStats = {
  totalOrders: number;
  totalSpent: number;
  wishlistItems: number;
  addressCount: number;
};
export type DashboardResponse = {
  user: AuthUser;
  stats: DashboardStats;
  recentOrders: Order[];
  wishlist: Product[];
  addresses: Address[];
  defaultAddress: Address | null;
};
type AuthConfigResponse = {
  google: {
    enabled: boolean;
    missing: string[];
    callbackUrl: string;
    backendUrl: string;
    frontendUrl: string;
  };
};

export type PaymentConfig = {
  keyId: string;
  bypassEnabled: boolean;
  provider: string;
  mode?: "live" | "test";
};

export type PaymentModeSettings = {
  id?: string;
  paymentMode: "live" | "test";
  isPersisted?: boolean;
  updatedAt?: string | null;
};

export type CreateOrderInput = {
  customerName: string;
  phone: string;
  address: string;
  shippingAddress?: Partial<Address>;
  items: Array<{ productId: string; quantity: number; size?: string }>;
  couponCode?: string;
  paymentId?: string;
  paymentMethod?: string;
  paymentGateway?: string;
  paymentOrderId?: string;
  paymentSignature?: string;
  paymentStatus?: "paid" | "failed" | "pending" | "cod";
  clearCart?: boolean;
};

let cachedPaymentConfig: PaymentConfig | null = null;

const emitDataEvent = (name: string) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(name));

    try {
      window.localStorage.setItem(
        DATA_EVENT_STORAGE_KEY,
        JSON.stringify({
          name,
          at: Date.now(),
          nonce: Math.random().toString(36).slice(2),
        }),
      );
    } catch (_error) {
      // Cross-tab sync should never block the main action flow.
    }
  }
};

const requireBackend = () => {
  if (!BASE) {
    throw new Error(
      "API URL is required. Set VITE_API_URL to point the frontend at your Express API.",
    );
  }
};

const queryString = (params: Record<string, unknown> = {}) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });

  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

const isBannerCatalogPath = (path: string) => path === "/banners" || path.startsWith("/banners?");

const isCatalogPath = (path: string) =>
  path.startsWith("/products") ||
  path.startsWith("/brands") ||
  path.startsWith("/categories") ||
  isBannerCatalogPath(path);

const canCacheCatalogRequest = (method: string, path: string) =>
  method === "GET" && isCatalogPath(path);

const isUserScopedPath = (path: string) =>
  path === "/auth/me" ||
  path.startsWith("/users") ||
  path.startsWith("/cart") ||
  path.startsWith("/orders/my-orders");

const isAdminScopedPath = (path: string) =>
  path.startsWith("/admin") ||
  path.startsWith("/orders?") ||
  path === "/orders" ||
  path.startsWith("/orders/unseen");

const canProxyRequest = (method: string, path: string) =>
  method === "GET" &&
  !isCatalogPath(path) &&
  (path === "/auth/config" || isUserScopedPath(path) || isAdminScopedPath(path));

const getProxyCacheKey = (method: string, path: string) => {
  const scope =
    isUserScopedPath(path) || isAdminScopedPath(path) ? `session:${authCacheVersion}` : "public";
  return `${scope}:${method}:${path}`;
};

const getProxyCachePolicy = (path: string) => {
  if (isAdminScopedPath(path)) {
    return { ttlMs: ADMIN_CACHE_TTL_MS, swrMs: ADMIN_CACHE_SWR_MS };
  }

  if (isUserScopedPath(path)) {
    return { ttlMs: USER_CACHE_TTL_MS, swrMs: USER_CACHE_SWR_MS };
  }

  return { ttlMs: CATALOG_CACHE_TTL_MS, swrMs: CATALOG_CACHE_TTL_MS };
};

const getCatalogCacheKey = (method: string, path: string) => `${method}:${path}`;

const getCatalogCacheEntry = (key: string) => catalogResponseCache.get(key) ?? null;

const isFreshCatalogEntry = (entry: CatalogCacheEntry) =>
  Date.now() - entry.createdAt < CATALOG_CACHE_TTL_MS;

const isUsableCatalogEntry = (entry: CatalogCacheEntry) =>
  Date.now() - entry.createdAt < CATALOG_CACHE_TTL_MS + CATALOG_CACHE_SWR_MS;

const setCatalogCacheEntry = (key: string, data: unknown) => {
  if (catalogResponseCache.size >= CATALOG_CACHE_MAX_KEYS) {
    const oldestKey = catalogResponseCache.keys().next().value;

    if (oldestKey) {
      catalogResponseCache.delete(oldestKey);
      inflightCatalogRequests.delete(oldestKey);
    }
  }

  catalogResponseCache.set(key, {
    createdAt: Date.now(),
    data,
  });
};

const clearCatalogCache = (pathPrefix: string) => {
  Array.from(catalogResponseCache.keys()).forEach((key) => {
    if (key.includes(`:${pathPrefix}`)) {
      catalogResponseCache.delete(key);
      inflightCatalogRequests.delete(key);
    }
  });

  apiTrafficProxy.invalidate((key) => key.includes(pathPrefix));
  frontendMediator.publishCatalogChanged(
    pathPrefix.startsWith("/products")
      ? "products"
      : pathPrefix.startsWith("/brands")
        ? "brands"
        : pathPrefix.startsWith("/banners")
          ? "banners"
          : pathPrefix.startsWith("/categories")
            ? "categories"
            : "all",
  );
};

const invalidateProxyCache = (...pathFragments: string[]) => {
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

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") return "";

  return (
    document.cookie
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${name}=`))
      ?.split("=")
      .slice(1)
      .join("=") ?? ""
  );
};

const getCsrfToken = () => {
  const cookieToken = getCookieValue("csrfToken");
  return cookieToken ? decodeURIComponent(cookieToken) : csrfTokenCache;
};

const rememberCsrfToken = (token: string) => {
  csrfTokenCache = token || csrfTokenCache;
  return csrfTokenCache;
};

const fetchCsrfToken = async () => {
  const response = await fetch(`${BASE}/auth/csrf-token`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const payload = (await response.json().catch(() => null)) as
    | ApiEnvelope<{ csrfToken?: string }>
    | null;
  const responseToken = response.headers.get("X-CSRF-Token") || payload?.data?.csrfToken || "";

  if (!response.ok || payload?.success === false || !responseToken) {
    throw new Error(payload?.message || "Unable to initialize CSRF token");
  }

  return rememberCsrfToken(responseToken);
};

const ensureCsrfToken = async () => {
  const currentToken = getCsrfToken();
  if (currentToken) return currentToken;

  csrfTokenRequest = csrfTokenRequest || fetchCsrfToken().finally(() => {
    csrfTokenRequest = null;
  });

  return csrfTokenRequest;
};

const setStoredAccessToken = (_token: string) => {
  if (typeof window === "undefined") return;
  // Auth is cookie based; never persist bearer tokens in browser storage.
  clearLegacyStoredAccessTokens();
  bumpAuthCacheVersion();
};

const clearStoredAccessToken = () => {
  if (typeof window === "undefined") return;
  clearLegacyStoredAccessTokens();
  csrfTokenCache = "";
  bumpAuthCacheVersion();
};

const isMutationMethod = (method: string) => !["GET", "HEAD", "OPTIONS"].includes(method);

const shouldAttemptRefresh = (path: string) =>
  !path.startsWith("/auth/login") &&
  !path.startsWith("/auth/signup") &&
  !path.startsWith("/auth/refresh") &&
  !path.startsWith("/auth/forgot-password") &&
  !path.startsWith("/auth/reset-password") &&
  !path.startsWith("/auth/verify-email");

const refreshAuthSession = async () => {
  const headers = new Headers({ "Content-Type": "application/json" });
  const csrfToken = await ensureCsrfToken().catch((error) => {
    if (import.meta.env.DEV) {
      console.debug("[API] CSRF bootstrap before refresh failed", error);
    }

    return "";
  });

  if (csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }

  const response = await fetch(`${BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers,
  });

  rememberCsrfToken(response.headers.get("X-CSRF-Token") || "");

  return response.ok;
};

const isBrandCategory = (value: unknown): value is Brand["category"] =>
  value === "middle-eastern" || value === "designer" || value === "niche";

const isUsage = (value: unknown): value is Product["usage"] =>
  value === "Day" || value === "Night" || value === "Day & Night";

const isBestTime = (value: unknown): value is BestTime =>
  value === "Morning" || value === "Day" || value === "Evening" || value === "Night";

const asStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => String(item).split(","))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const asBestTimeArray = (value: unknown): BestTime[] =>
  Array.isArray(value) ? value.filter(isBestTime) : [];

const normalizeAccords = (value: unknown): Accord[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((accord) => {
      if (!accord || typeof accord !== "object") return null;

      const source = accord as Partial<Accord> & { intensity?: number };
      const name = String(source.name || "").trim();
      if (!name) return null;

      const percentage = Number(source.percentage ?? source.intensity ?? 0);

      return {
        name,
        percentage: Number.isFinite(percentage) ? Math.min(Math.max(percentage, 0), 100) : 0,
      };
    })
    .filter((accord): accord is Accord => Boolean(accord));
};

const resolveImageUrl = (value: unknown) => {
  const image = String(value || "").trim();

  if (
    !image ||
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  return image.startsWith("/") ? `${API_ORIGIN}${image}` : image;
};

const normalizeBrand = (brand: BrandPayload): Brand => ({
  _id: brand._id,
  id: String(brand.id || brand._id || ""),
  name: String(brand.name || ""),
  logo: resolveImageUrl(brand.logo || ""),
  fallbackLetter: String(
    brand.fallbackLetter || brand.name?.toString()?.trim()?.charAt(0) || "#",
  ).toUpperCase(),
  category: isBrandCategory(brand.category) ? brand.category : "designer",
  productCount: Number.isFinite(Number(brand.productCount)) ? Number(brand.productCount) : 0,
  previewProducts: Array.isArray(brand.previewProducts)
    ? brand.previewProducts.map(
        (product) =>
          ({
            _id: product?._id,
            id: String(product?.id || product?._id || ""),
            name: String(product?.name || ""),
            brand: String(product?.brand || ""),
            brandId: product?.brandId ? String(product.brandId) : null,
            category: String(product?.category || ""),
            image: resolveImageUrl(product?.image || ""),
            images: asStringArray(product?.images).map(resolveImageUrl),
            price: Number.isFinite(Number(product?.price)) ? Number(product?.price) : 0,
          }) satisfies BrandPreviewProduct,
      )
    : [],
  createdAt: brand.createdAt,
  updatedAt: brand.updatedAt,
});

const normalizeBanner = (banner: BannerPayload): Banner => ({
  _id: String(banner._id || banner.id || ""),
  id: String(banner.id || banner._id || ""),
  title: String(banner.title || ""),
  subtitle: String(banner.subtitle || ""),
  image: resolveImageUrl(banner.image || ""),
  buttonText: String(banner.buttonText || ""),
  link: String(banner.link || ""),
  isActive: banner.isActive !== false,
  order: Number.isFinite(Number(banner.order)) ? Number(banner.order) : 0,
  createdAt: banner.createdAt,
  updatedAt: banner.updatedAt,
});

const normalizeCategory = (category: CategoryPayload): Category => ({
  _id: category._id,
  id: String(category.id || category._id || ""),
  name: String(category.name || "").trim(),
  slug: String(category.slug || "").trim(),
  image: resolveImageUrl(category.image || ""),
  description: String(category.description || "").trim(),
  icon: String(category.icon || "").trim(),
  color: String(category.color || "#8b5f3d").trim() || "#8b5f3d",
  sortOrder: Number.isFinite(Number(category.sortOrder ?? category.displayOrder))
    ? Number(category.sortOrder ?? category.displayOrder)
    : 0,
  displayOrder: Number.isFinite(Number(category.sortOrder ?? category.displayOrder))
    ? Number(category.sortOrder ?? category.displayOrder)
    : 0,
  isActive: category.isActive ?? category.active !== false,
  active: category.isActive ?? category.active !== false,
  isDeleted: Boolean(category.isDeleted),
  featured: Boolean(category.featured),
  productCount: Number.isFinite(Number(category.productCount)) ? Number(category.productCount) : 0,
  createdAt: category.createdAt || null,
  updatedAt: category.updatedAt || null,
});

const createDerivedCategory = (
  id: string,
  name = "",
  slug = "",
  overrides: Partial<Category> = {},
): Category => ({
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
  ...overrides,
});

const normalizeProduct = (product: ProductPayload): Product => {
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const price = Number(product.price ?? sizes[0]?.price ?? 0);
  const images = asStringArray(product.images).map(resolveImageUrl);
  const legacyImage = resolveImageUrl(product.image || "");
  const normalizedImages = images.length
    ? Array.from(new Set(images))
    : legacyImage
      ? [legacyImage]
      : [];
  const image = normalizedImages[0] || legacyImage;
  const notes = asStringArray(product.notes);
  const seasons =
    Array.isArray(product.seasons) && product.seasons.length
      ? product.seasons
      : Array.isArray(product.season)
        ? product.season
        : [];
  const usage = isUsage(product.usage)
    ? product.usage
    : isUsage(product.timeOfDay)
      ? product.timeOfDay
      : "Day & Night";
  const brandDetails =
    product.brandDetails && typeof product.brandDetails === "object"
      ? normalizeBrand(product.brandDetails as BrandPayload)
      : null;
  const categoryObjects = Array.isArray(product.categories)
    ? product.categories.reduce<Category[]>((collection, category) => {
        if (category && typeof category === "object") {
          collection.push(normalizeCategory(category as CategoryPayload));
        }

        return collection;
      }, [])
    : [];
  const categoryDetails =
    product.categoryDetails && typeof product.categoryDetails === "object"
      ? normalizeCategory(product.categoryDetails as CategoryPayload)
      : categoryObjects[0] || null;
  const categoryIds = Array.isArray(product.categoryIds)
    ? product.categoryIds.map((id) => String(id || "").trim()).filter(Boolean)
    : Array.isArray(product.categories)
      ? product.categories
          .map((category) => {
            if (!category) return "";
            if (typeof category === "object") {
              return String((category as CategoryPayload).id || (category as CategoryPayload)._id || "").trim();
            }

            return String(category || "").trim();
          })
          .filter(Boolean)
      : product.categoryId
        ? [String(product.categoryId).trim()]
        : categoryDetails?.id
          ? [categoryDetails.id]
          : [];
  const categoryNames = Array.isArray(product.categoryNames)
    ? product.categoryNames.map((name) => String(name || "").trim()).filter(Boolean)
    : categoryObjects.length
      ? categoryObjects.map((category) => category.name)
      : categoryDetails?.name
        ? [categoryDetails.name]
        : product.category
          ? [String(product.category).trim()]
          : [];
  const categorySlugs = Array.isArray(product.categorySlugs)
    ? product.categorySlugs.map((slug) => String(slug || "").trim()).filter(Boolean)
    : categoryObjects.length
      ? categoryObjects.map((category) => category.slug)
      : categoryDetails?.slug
        ? [categoryDetails.slug]
        : product.categorySlug
          ? [String(product.categorySlug).trim()]
          : [];
  const categories = categoryObjects.length
    ? categoryObjects
    : categoryIds.map((id, index) =>
        createDerivedCategory(id, categoryNames[index] || categoryNames[0] || "", categorySlugs[index] || ""),
      );
  const normalizedBrandId = String(product.brandId || brandDetails?.id || "").trim();
  const normalizedCategoryId = String(
    product.primaryCategory ||
      product.categoryId ||
      categoryDetails?.id ||
      categoryIds[0] ||
      "",
  ).trim();
  const normalizedCategory = String(
    product.category || categoryDetails?.name || categoryNames[0] || "",
  ).trim();

  return {
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
    categorySlug: String(product.categorySlug || categoryDetails?.slug || categorySlugs[0] || "").trim(),
    categoryDetails,
    price,
    gender: String(product.gender || ""),
    rating: Number(product.rating || 0),
    reviewCount: Number(product.reviewCount ?? product.reviewsCount ?? 0),
    reviewsCount: Number(product.reviewsCount ?? product.reviewCount ?? 0),
    image,
    images: normalizedImages,
    videoUrl: String(product.videoUrl || ""),
    description: String(product.description || ""),
    notes,
    topNotes: asStringArray(product.topNotes).length ? asStringArray(product.topNotes) : notes,
    middleNotes: asStringArray(product.middleNotes),
    baseNotes: asStringArray(product.baseNotes),
    accords: normalizeAccords(product.accords),
    longevity: String(product.longevity || ""),
    sillage: String(product.sillage || ""),
    usage,
    timeOfDay: String(product.timeOfDay || usage),
    bestTime: asBestTimeArray(product.bestTime),
    season: seasons,
    seasons,
    sizes: sizes.length ? sizes : [{ size: "Standard", price }],
    stock: Number(product.stock ?? 0),
    originalPrice: product.originalPrice,
    isBestseller: Boolean(product.isBestseller),
    isLatest: Boolean(product.isLatest),
    bestsellerOrder: Number(product.bestsellerOrder ?? product.displayOrder ?? 0),
    displayOrder: Number(product.displayOrder ?? product.bestsellerOrder ?? 0),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

const normalizeOrder = (order: Order): Order => ({
  ...order,
  productName: order.productName ?? order.items?.[0]?.productName ?? "",
  brand: order.brand ?? order.items?.[0]?.brand ?? "",
  size: order.size ?? order.items?.[0]?.size ?? "",
  price: order.price ?? order.items?.[0]?.price ?? order.totalAmount,
  subtotalAmount: order.subtotalAmount ?? order.totalAmount,
  discountAmount: order.discountAmount ?? 0,
  couponCode: order.couponCode ?? "",
  isSeen: Boolean(order.isSeen),
  orderStatus: order.orderStatus ?? order.status,
  paymentId: order.paymentId ?? "",
  paymentMethod: order.paymentMethod ?? "",
  paymentGateway: order.paymentGateway ?? "",
  paymentOrderId: order.paymentOrderId ?? "",
  paymentSignature: order.paymentSignature ?? "",
});

const normalizeAddress = (address: Partial<Address> = {}): Address => {
  const mobile = String(address.mobile || address.phone || "").trim();
  const line1 = String(address.line1 || address.street || "").trim();
  const line2 = String(address.line2 || address.landmark || "").trim();
  const postalCode = String(address.postalCode || address.pincode || "").trim();

  return {
    _id: address._id ? String(address._id) : undefined,
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
    isDefault: Boolean(address.isDefault),
  };
};

const normalizeAuthUser = (user: AuthUser): AuthUser => ({
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
  isBanned: Boolean(user.isBanned),
});

const normalizeDashboard = (dashboard: DashboardResponse): DashboardResponse => {
  const user = normalizeAuthUser(dashboard.user);
  const addresses = Array.isArray(dashboard.addresses)
    ? dashboard.addresses.map(normalizeAddress)
    : user.addresses || [];

  return {
    ...dashboard,
    user: {
      ...user,
      addresses,
      totalOrders: Number(dashboard.stats?.totalOrders ?? user.totalOrders ?? 0),
      totalSpent: Number(dashboard.stats?.totalSpent ?? user.totalSpent ?? 0),
    },
    stats: {
      totalOrders: Number(dashboard.stats?.totalOrders || 0),
      totalSpent: Number(dashboard.stats?.totalSpent || 0),
      wishlistItems: Number(dashboard.stats?.wishlistItems || 0),
      addressCount: Number(dashboard.stats?.addressCount || addresses.length),
    },
    recentOrders: Array.isArray(dashboard.recentOrders)
      ? dashboard.recentOrders.map(normalizeOrder)
      : [],
    wishlist: Array.isArray(dashboard.wishlist) ? dashboard.wishlist.map(normalizeProduct) : [],
    addresses,
    defaultAddress: dashboard.defaultAddress ? normalizeAddress(dashboard.defaultAddress) : null,
  };
};

const normalizeCoupon = (coupon: CouponPayload): Coupon => ({
  _id: String(coupon._id || coupon.id || ""),
  id: String(coupon.id || coupon._id || ""),
  code: String(coupon.code || "").toUpperCase(),
  discountType: coupon.discountType === "fixed" ? "fixed" : "percentage",
  discountValue: Number(coupon.discountValue || 0),
  minOrderAmount: Number(coupon.minOrderAmount || 0),
  maxDiscount:
    coupon.maxDiscount === null || coupon.maxDiscount === undefined
      ? null
      : Number(coupon.maxDiscount || 0),
  expiryDate: coupon.expiryDate ? String(coupon.expiryDate) : null,
  isActive: Boolean(coupon.isActive),
  createdAt: String(coupon.createdAt || ""),
  updatedAt: String(coupon.updatedAt || ""),
});

const isPerfumeRequestStatus = (value: unknown): value is PerfumeRequestStatus =>
  value === "new" || value === "contacted" || value === "sourced" || value === "closed";

const normalizePerfumeRequest = (perfumeRequest: PerfumeRequestPayload): PerfumeRequest => ({
  _id: String(perfumeRequest._id || perfumeRequest.id || ""),
  id: String(perfumeRequest.id || perfumeRequest._id || ""),
  perfumeName: String(perfumeRequest.perfumeName || ""),
  customerName: String(perfumeRequest.customerName || ""),
  phoneNumber: String(perfumeRequest.phoneNumber || ""),
  preferredSize: String(perfumeRequest.preferredSize || ""),
  budgetRange: String(perfumeRequest.budgetRange || ""),
  message: String(perfumeRequest.message || ""),
  images: asStringArray(perfumeRequest.images).map(resolveImageUrl),
  status: isPerfumeRequestStatus(perfumeRequest.status) ? perfumeRequest.status : "new",
  createdAt: String(perfumeRequest.createdAt || ""),
  updatedAt: String(perfumeRequest.updatedAt || ""),
});

async function http<T>(path: string, init: HttpOptions = {}): Promise<T> {
  requireBackend();

  const { forceFresh = false, skipAuthRefresh = false, ...requestInit } = init;
  const headers = new Headers(requestInit.headers);
  const method = (requestInit.method || "GET").toUpperCase();
  const cacheableCatalogRequest = canCacheCatalogRequest(method, path);
  const proxyRequest = canProxyRequest(method, path);
  const catalogCacheKey = cacheableCatalogRequest ? getCatalogCacheKey(method, path) : "";
  const cachedCatalogEntry = cacheableCatalogRequest ? getCatalogCacheEntry(catalogCacheKey) : null;

  if (!forceFresh && cachedCatalogEntry && isFreshCatalogEntry(cachedCatalogEntry)) {
    return cachedCatalogEntry.data as T;
  }

  if (!forceFresh && cachedCatalogEntry && isUsableCatalogEntry(cachedCatalogEntry)) {
    if (!inflightCatalogRequests.has(catalogCacheKey)) {
      void http<T>(path, {
        ...init,
        forceFresh: true,
      }).catch(() => {
        // Stale-while-revalidate should never block the current render path.
      });
    }

    return cachedCatalogEntry.data as T;
  }

  if (cacheableCatalogRequest && !forceFresh) {
    const inflightRequest = inflightCatalogRequests.get(catalogCacheKey);

    if (inflightRequest) {
      return inflightRequest as Promise<T>;
    }
  }

  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (isMutationMethod(method)) {
    const csrfToken = await ensureCsrfToken().catch((error) => {
      if (import.meta.env.DEV) {
        console.debug(`[API] CSRF bootstrap before ${method} ${path} failed`, error);
      }

      return "";
    });

    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }
  }

  if (import.meta.env.DEV) {
    console.debug(`[API] ${method} ${BASE}${path}`);
  }

  const executeRequest = async () => {
    const res = await fetch(`${BASE}${path}`, {
      ...requestInit,
      cache: requestInit.cache ?? (cacheableCatalogRequest && !forceFresh ? "default" : "no-store"),
      credentials: requestInit.credentials ?? "include",
      headers,
    });
    rememberCsrfToken(res.headers.get("X-CSRF-Token") || "");

    const payload = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

    if (res.status === 401 && !skipAuthRefresh && shouldAttemptRefresh(path)) {
      const refreshed = await refreshAuthSession();

      if (refreshed) {
        return http<T>(path, {
          ...init,
          skipAuthRefresh: true,
          forceFresh: true,
        });
      }
    }

    if (!res.ok || payload?.success === false) {
      const firstError =
        Array.isArray((payload as { errors?: Array<{ message?: string }> } | null)?.errors) &&
        (payload as { errors?: Array<{ message?: string }> }).errors?.[0]?.message;

      throw new Error(firstError || payload?.message || `${res.status} ${res.statusText}`);
    }

    const data =
      payload && typeof payload === "object" && "data" in payload ? payload.data : (payload as T);

    if (cacheableCatalogRequest) {
      setCatalogCacheEntry(catalogCacheKey, data);
    }

    return data as T;
  };

  const request = proxyRequest
    ? apiTrafficProxy.readThrough<T>({
        key: getProxyCacheKey(method, path),
        loader: executeRequest,
        forceFresh,
        retries: 1,
        ...getProxyCachePolicy(path),
      })
    : perfInstrumentation.timeAsync(`api:${method}:${path}`, executeRequest, {
        metadata: { forceFresh, cacheableCatalogRequest },
      });

  if (cacheableCatalogRequest) {
    inflightCatalogRequests.set(catalogCacheKey, request as Promise<unknown>);
  }

  try {
    return await request;
  } catch (error) {
    if (!forceFresh && cachedCatalogEntry) {
      return cachedCatalogEntry.data as T;
    }

    throw error;
  } finally {
    if (cacheableCatalogRequest) {
      inflightCatalogRequests.delete(catalogCacheKey);
    }
  }
}

const parseUploadPayload = <T,>(responseText: string): ApiEnvelope<T> | null => {
  try {
    return responseText ? (JSON.parse(responseText) as ApiEnvelope<T>) : null;
  } catch (_error) {
    return null;
  }
};

async function uploadFormData<T>(
  path: string,
  method: "POST" | "PUT",
  formData: FormData,
  options: UploadRequestOptions = {},
): Promise<T> {
  requireBackend();

  const csrfToken = await ensureCsrfToken().catch((error) => {
    if (import.meta.env.DEV) {
      console.debug(`[API] CSRF bootstrap before ${method} ${path} failed`, error);
    }

    return "";
  });

  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(method, `${BASE}${path}`, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Accept", "application/json");

    if (csrfToken) {
      xhr.setRequestHeader("X-CSRF-Token", csrfToken);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        options.onUploadProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = async () => {
      rememberCsrfToken(xhr.getResponseHeader("X-CSRF-Token") || "");

      const payload = parseUploadPayload<T>(xhr.responseText);

      if (xhr.status === 401 && !options.skipAuthRefresh && shouldAttemptRefresh(path)) {
        const refreshed = await refreshAuthSession();

        if (refreshed) {
          try {
            const retryResult = await uploadFormData<T>(path, method, formData, {
              ...options,
              skipAuthRefresh: true,
            });
            resolve(retryResult);
          } catch (error) {
            reject(error);
          }
          return;
        }
      }

      if (xhr.status < 200 || xhr.status >= 300 || payload?.success === false) {
        const firstError =
          Array.isArray((payload as { errors?: Array<{ message?: string }> } | null)?.errors) &&
          (payload as { errors?: Array<{ message?: string }> }).errors?.[0]?.message;

        reject(new Error(firstError || payload?.message || `${xhr.status} ${xhr.statusText}`));
        return;
      }

      options.onUploadProgress?.(100);
      const data =
        payload && typeof payload === "object" && "data" in payload
          ? payload.data
          : (payload as T);
      resolve(data as T);
    };

    xhr.onerror = () => reject(new Error("Upload failed. Check your connection and try again."));
    xhr.onabort = () => reject(new Error("Upload was cancelled."));
    xhr.send(formData);
  });
}

export const productsApi = {
  list: async (
    params: ProductListParams = {},
    options: CatalogRequestOptions = {},
  ): Promise<Product[]> => {
    const data = await http<PaginatedProducts | Product[]>(`/products${queryString(params)}`, {
      forceFresh: options.forceFresh,
    });
    const products = Array.isArray(data) ? data : data.products;
    return products.map(normalizeProduct);
  },
  listPaginated: async (
    params: ProductListParams = {},
    options: CatalogRequestOptions = {},
  ): Promise<PaginatedProducts> => {
    const data = await http<PaginatedProducts | Product[]>(`/products${queryString(params)}`, {
      forceFresh: options.forceFresh,
    });

    if (Array.isArray(data)) {
      return {
        products: data.map(normalizeProduct),
        pagination: {
          page: Number(params.page ?? 1),
          limit: Number(params.limit ?? data.length),
          total: data.length,
          pages: 1,
        },
      };
    }

    return {
      products: data.products.map(normalizeProduct),
      pagination: data.pagination,
    };
  },
  listBestsellers: async (options: CatalogRequestOptions = {}): Promise<Product[]> => {
    const products = await http<ProductPayload[]>("/bestsellers", {
      forceFresh: options.forceFresh ?? false,
    });
    return products.map(normalizeProduct);
  },
  listLatest: async (options: CatalogRequestOptions = {}): Promise<Product[]> => {
    const products = await http<ProductPayload[]>("/products/latest", {
      forceFresh: options.forceFresh ?? false,
    });
    return products.map(normalizeProduct);
  },
  get: async (id: string): Promise<Product | undefined> => {
    const product = await http<ProductPayload>(`/products/${id}`);
    return normalizeProduct(product);
  },
  create: async (product: Omit<Product, "id">): Promise<Product> => {
    const createdProduct = await http<ProductPayload>("/products", {
      method: "POST",
      body: JSON.stringify(product),
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
  createWithImages: async (
    formData: FormData,
    options: UploadRequestOptions = {},
  ): Promise<Product> => {
    const createdProduct = await uploadFormData<ProductPayload>(
      "/products",
      "POST",
      formData,
      options,
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
  bulkCreate: async (products: BulkProductImportRow[]): Promise<BulkProductImportResult> => {
    const result = await http<
      Omit<BulkProductImportResult, "createdProducts"> & { createdProducts: ProductPayload[] }
    >("/products/bulk", {
      method: "POST",
      body: JSON.stringify({ products }),
    });
    clearCatalogCache("/products");
    clearCatalogCache("/brands");
    clearCatalogCache("/categories");
    emitDataEvent(PRODUCTS_CHANGED_EVENT);
    emitDataEvent(LATEST_PRODUCTS_CHANGED_EVENT);
    return {
      ...result,
      createdProducts: result.createdProducts.map(normalizeProduct),
    };
  },
  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    const updatedProduct = await http<ProductPayload>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
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
  updateWithImages: async (
    id: string,
    formData: FormData,
    options: UploadRequestOptions = {},
  ): Promise<Product> => {
    const updatedProduct = await uploadFormData<ProductPayload>(
      `/products/${id}`,
      "PUT",
      formData,
      options,
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
  updateBestseller: async (
    id: string,
    payload: { isBestseller?: boolean; bestsellerOrder?: number },
  ): Promise<Product> => {
    const updatedProduct = await http<ProductPayload>(`/products/${id}/bestseller`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    clearCatalogCache("/products");
    const normalizedProduct = normalizeProduct(updatedProduct);
    emitDataEvent(PRODUCTS_CHANGED_EVENT);
    emitDataEvent(BESTSELLERS_CHANGED_EVENT);
    emitDataEvent(LATEST_PRODUCTS_CHANGED_EVENT);
    return normalizedProduct;
  },
  remove: async (id: string): Promise<void> => {
    await http<{ id: string }>(`/products/${id}`, { method: "DELETE" });
    clearCatalogCache("/products");
    clearCatalogCache("/brands");
    clearCatalogCache("/categories");
    emitDataEvent(PRODUCTS_CHANGED_EVENT);
    emitDataEvent(BESTSELLERS_CHANGED_EVENT);
    emitDataEvent(LATEST_PRODUCTS_CHANGED_EVENT);
  },
  wishlist: async (): Promise<Product[]> => {
    const products = await http<ProductPayload[]>("/users/wishlist");
    return products.map(normalizeProduct);
  },
  addToWishlist: async (productId: string): Promise<Product[]> => {
    const products = await apiTrafficProxy.runExclusive({
      key: `wishlist:add:${productId}`,
      action: () =>
        http<ProductPayload[]>(`/users/wishlist/${productId}`, {
          method: "POST",
        }),
    });
    invalidateWishlistCache();
    return products.map(normalizeProduct);
  },
  removeFromWishlist: async (productId: string): Promise<Product[]> => {
    const products = await apiTrafficProxy.runExclusive({
      key: `wishlist:remove:${productId}`,
      action: () =>
        http<ProductPayload[]>(`/users/wishlist/${productId}`, {
          method: "DELETE",
        }),
    });
    invalidateWishlistCache();
    return products.map(normalizeProduct);
  },
  clearWishlist: async (): Promise<Product[]> => {
    const products = await http<ProductPayload[]>("/users/wishlist", {
      method: "DELETE",
    });
    invalidateWishlistCache();
    return products.map(normalizeProduct);
  },
};

export const brandsApi = {
  list: async (params: BrandListParams = {}): Promise<Brand[]> => {
    const data = await http<BrandPayload[]>(`/brands${queryString(params)}`);
    return data.map(normalizeBrand);
  },
  get: async (id: string): Promise<Brand | undefined> => {
    const brand = await http<BrandPayload>(`/brands/${id}`);
    return normalizeBrand(brand);
  },
  createWithLogo: async (formData: FormData): Promise<Brand> => {
    const createdBrand = await http<BrandPayload>("/brands", {
      method: "POST",
      body: formData,
    });
    clearCatalogCache("/brands");
    clearCatalogCache("/products");
    return normalizeBrand(createdBrand);
  },
  updateWithLogo: async (id: string, formData: FormData): Promise<Brand> => {
    const updatedBrand = await http<BrandPayload>(`/brands/${id}`, {
      method: "PUT",
      body: formData,
    });
    clearCatalogCache("/brands");
    clearCatalogCache("/products");
    return normalizeBrand(updatedBrand);
  },
  bulkCreate: async (brands: BulkBrandImportRow[]): Promise<BulkBrandImportResult> => {
    const result = await http<BulkBrandImportResult>("/brands/bulk", {
      method: "POST",
      body: JSON.stringify({ brands }),
    });
    clearCatalogCache("/brands");
    clearCatalogCache("/products");
    return {
      ...result,
      createdBrands: result.createdBrands.map(normalizeBrand),
    };
  },
  remove: async (id: string): Promise<void> => {
    await http<{ id: string }>(`/brands/${id}`, { method: "DELETE" });
    clearCatalogCache("/brands");
    clearCatalogCache("/products");
  },
};

export const categoriesApi = {
  list: async (options: CategoryListOptions = {}): Promise<Category[]> => {
    const data = await http<CategoryPayload[]>(
      `/categories${queryString({
        featured: options.featured ? "true" : undefined,
        search: options.search,
      })}`,
    );
    return data.map(normalizeCategory);
  },
  listAdmin: async (_options: CategoryListOptions = {}): Promise<Category[]> => {
    const data = await http<CategoryPayload[]>("/categories/manage");
    return data.map(normalizeCategory);
  },
  listAdminPage: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      featured?: "featured" | "standard";
      state?: "active" | "inactive" | "deleted";
    } = {},
  ): Promise<AdminCategoryListResponse> => {
    const data = await http<{
      items: CategoryPayload[];
      pagination: AdminCategoryListResponse["pagination"];
      summary: AdminCategoryListResponse["summary"];
    }>(`/categories/manage${queryString(params)}`);

    return {
      items: data.items.map(normalizeCategory),
      pagination: data.pagination,
      summary: data.summary,
    };
  },
  getBySlug: async (slug: string): Promise<Category> => {
    const data = await http<CategoryPayload>(`/categories/slug/${slug}`);
    return normalizeCategory(data);
  },
  createWithAssets: async (formData: FormData): Promise<Category> => {
    const createdCategory = await http<CategoryPayload>("/categories", {
      method: "POST",
      body: formData,
    });
    clearCatalogCache("/categories");
    clearCatalogCache("/products");
    return normalizeCategory(createdCategory);
  },
  updateWithAssets: async (id: string, formData: FormData): Promise<Category> => {
    const updatedCategory = await http<CategoryPayload>(`/categories/${id}`, {
      method: "PUT",
      body: formData,
    });
    clearCatalogCache("/categories");
    clearCatalogCache("/products");
    return normalizeCategory(updatedCategory);
  },
  reorder: async (
    items: Array<{ id: string; displayOrder?: number; sortOrder?: number }>,
  ): Promise<Category[]> => {
    const data = await http<CategoryPayload[]>("/categories/reorder", {
      method: "PATCH",
      body: JSON.stringify({ items }),
    });
    clearCatalogCache("/categories");
    clearCatalogCache("/products");
    return data.map(normalizeCategory);
  },
  remove: async (id: string): Promise<void> => {
    await http<{ id: string }>(`/categories/${id}`, { method: "DELETE" });
    clearCatalogCache("/categories");
    clearCatalogCache("/products");
  },
};

export const bannersApi = {
  listActive: async (): Promise<Banner[]> => {
    const data = await http<BannerPayload[]>("/banners");
    return data.map(normalizeBanner);
  },
  listAdmin: async (): Promise<Banner[]> => {
    const data = await http<BannerPayload[]>("/banners/manage");
    return data.map(normalizeBanner);
  },
  createWithImage: async (formData: FormData): Promise<Banner> => {
    const banner = await http<BannerPayload>("/banners", {
      method: "POST",
      body: formData,
    });
    clearCatalogCache("/banners");
    return normalizeBanner(banner);
  },
  updateWithImage: async (id: string, formData: FormData): Promise<Banner> => {
    const banner = await http<BannerPayload>(`/banners/${id}`, {
      method: "PUT",
      body: formData,
    });
    clearCatalogCache("/banners");
    return normalizeBanner(banner);
  },
  toggle: async (id: string): Promise<Banner> => {
    const banner = await http<BannerPayload>(`/banners/${id}/toggle`, {
      method: "PATCH",
    });
    clearCatalogCache("/banners");
    return normalizeBanner(banner);
  },
  remove: async (id: string): Promise<void> => {
    await http<{ id: string }>(`/banners/${id}`, {
      method: "DELETE",
    });
    clearCatalogCache("/banners");
  },
};

export const ordersApi = {
  list: async (params: OrderListParams = {}): Promise<Order[]> => {
    const data = await http<PaginatedOrders | Order[]>(`/orders${queryString(params)}`);
    const orders = Array.isArray(data) ? data : data.orders;
    return orders.map(normalizeOrder);
  },
  listPaginated: async (params: OrderListParams = {}): Promise<PaginatedOrders> => {
    const data = await http<PaginatedOrders | Order[]>(`/orders${queryString(params)}`);

    if (Array.isArray(data)) {
      return {
        orders: data.map(normalizeOrder),
        pagination: {
          page: Number(params.page || 1),
          limit: Number(params.limit || data.length || 12),
          total: data.length,
          pages: 1,
        },
      };
    }

    return {
      ...data,
      orders: data.orders.map(normalizeOrder),
    };
  },
  unseen: async (): Promise<Order[]> => {
    const orders = await http<Order[]>("/orders/unseen");
    return orders.map(normalizeOrder);
  },
  create: async (input: CreateOrderInput): Promise<Order> => {
    const order = normalizeOrder(
      await http<Order>("/orders/create", { method: "POST", body: JSON.stringify(input) }),
    );
    invalidateOrdersCache();
    emitDataEvent("purefumes:orders-changed");
    return order;
  },
  myOrders: async (params: { page?: number; limit?: number } = {}): Promise<PaginatedOrders> => {
    const data = await http<PaginatedOrders>(`/orders/my-orders${queryString(params)}`);
    return {
      ...data,
      orders: data.orders.map(normalizeOrder),
    };
  },
  get: async (id: string): Promise<Order> => normalizeOrder(await http<Order>(`/orders/${id}`)),
  cancel: async (id: string): Promise<Order> => {
    const order = normalizeOrder(await http<Order>(`/orders/${id}/cancel`, { method: "POST" }));
    invalidateOrdersCache();
    return order;
  },
  reorder: async (id: string): Promise<CartApiResponse> => {
    const cart = normalizeCartResponse(
      await http<CartApiResponse>(`/orders/${id}/reorder`, { method: "POST" }),
    );
    invalidateOrdersCache();
    return cart;
  },
  updateStatus: async (id: string, status: Order["status"]): Promise<Order> => {
    const order = normalizeOrder(
      await http<Order>(`/orders/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),
    );
    invalidateOrdersCache();
    return order;
  },
  markSeen: async (id: string): Promise<Order> => {
    const order = normalizeOrder(await http<Order>(`/orders/${id}/seen`, { method: "PUT" }));
    invalidateOrdersCache();
    return order;
  },
};

export const couponsApi = {
  list: async (): Promise<Coupon[]> => {
    const data = await http<CouponPayload[]>("/coupons");
    return data.map(normalizeCoupon);
  },
  create: async (payload: {
    code: string;
    discountType: CouponDiscountType;
    discountValue: number;
    minOrderAmount?: number;
    maxDiscount?: number | null;
    expiryDate?: string | null;
    isActive?: boolean;
  }): Promise<Coupon> => {
    const coupon = await http<CouponPayload>("/coupons", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return normalizeCoupon(coupon);
  },
  apply: async (payload: ApplyCouponInput): Promise<ApplyCouponResult> => {
    const response = await http<ApplyCouponResult>("/coupons/apply", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      ...response,
      coupon: response.coupon ? normalizeCoupon(response.coupon) : null,
    };
  },
  toggle: async (id: string): Promise<Coupon> => {
    const coupon = await http<CouponPayload>(`/coupons/${id}/toggle`, {
      method: "PATCH",
    });
    return normalizeCoupon(coupon);
  },
  remove: async (id: string): Promise<void> => {
    await http<{ id: string }>(`/coupons/${id}`, {
      method: "DELETE",
    });
  },
};

export const perfumeRequestsApi = {
  list: async (params: PerfumeRequestListParams = {}): Promise<PerfumeRequest[]> => {
    const data = await http<
      | PerfumeRequestPayload[]
      | {
          requests: PerfumeRequestPayload[];
          pagination: PaginatedOrders["pagination"];
        }
    >(`/perfume-requests${queryString(params)}`);
    const requests = Array.isArray(data) ? data : data.requests;
    return requests.map(normalizePerfumeRequest);
  },
  listPaginated: async (
    params: PerfumeRequestListParams = {},
  ): Promise<PaginatedPerfumeRequests> => {
    const data = await http<
      | PerfumeRequestPayload[]
      | {
          requests: PerfumeRequestPayload[];
          pagination: PaginatedOrders["pagination"];
        }
    >(`/perfume-requests${queryString(params)}`);

    if (Array.isArray(data)) {
      return {
        requests: data.map(normalizePerfumeRequest),
        pagination: {
          page: Number(params.page || 1),
          limit: Number(params.limit || data.length || 12),
          total: data.length,
          pages: 1,
        },
      };
    }

    return {
      requests: data.requests.map(normalizePerfumeRequest),
      pagination: data.pagination,
    };
  },
  create: async (payload: FormData): Promise<PerfumeRequest> => {
    const perfumeRequest = normalizePerfumeRequest(
      await http<PerfumeRequestPayload>("/perfume-requests", {
        method: "POST",
        body: payload,
      }),
    );
    emitDataEvent("purefumes:requests-changed");
    return perfumeRequest;
  },
  updateStatus: async (id: string, status: PerfumeRequestStatus): Promise<PerfumeRequest> => {
    const perfumeRequest = normalizePerfumeRequest(
      await http<PerfumeRequestPayload>(`/perfume-requests/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    );
    emitDataEvent("purefumes:requests-changed");
    return perfumeRequest;
  },
};

export const accountApi = {
  authConfig: async (): Promise<AuthConfigResponse> => http<AuthConfigResponse>("/auth/config"),
  setAccessToken: (token: string) => {
    setStoredAccessToken(token);
  },
  clearAccessToken: () => {
    clearStoredAccessToken();
  },
  me: async (): Promise<AuthUser | null> => {
    try {
      const response = await http<AuthUserResponse>("/auth/me");
      return normalizeAuthUser(response.user);
    } catch (_error) {
      return null;
    }
  },
  dashboard: async (): Promise<DashboardResponse> =>
    normalizeDashboard(await http<DashboardResponse>("/users/dashboard")),
  updateProfile: async (payload: {
    name?: string;
    email?: string;
    username?: string;
    mobile?: string;
    phone?: string;
    profileImage?: string;
  }): Promise<AuthUser> => {
    const response = await http<AuthUserResponse>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    invalidateDashboardCache();
    return normalizeAuthUser(response.user);
  },
  addAddress: async (payload: Partial<Address>): Promise<AuthUser> => {
    const response = await http<AuthUserResponse>("/users/addresses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    invalidateDashboardCache();
    return normalizeAuthUser(response.user);
  },
  updateAddress: async (addressId: string, payload: Partial<Address>): Promise<AuthUser> => {
    const response = await http<AuthUserResponse>(`/users/addresses/${addressId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    invalidateDashboardCache();
    return normalizeAuthUser(response.user);
  },
  deleteAddress: async (addressId: string): Promise<AuthUser> => {
    const response = await http<AuthUserResponse>(`/users/addresses/${addressId}`, {
      method: "DELETE",
    });
    invalidateDashboardCache();
    return normalizeAuthUser(response.user);
  },
  setDefaultAddress: async (addressId: string): Promise<AuthUser> => {
    const response = await http<AuthUserResponse>(`/users/addresses/${addressId}/default`, {
      method: "PATCH",
    });
    invalidateDashboardCache();
    return normalizeAuthUser(response.user);
  },
  signup: async (payload: {
    name: string;
    email: string;
    username: string;
    mobile: string;
    password: string;
    confirmPassword: string;
  }): Promise<AuthUser> => {
    const response = await http<AuthUserResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    bumpAuthCacheVersion();
    return normalizeAuthUser(response.user);
  },
  login: async (identifier: string, password: string): Promise<AuthUser> => {
    const response = await http<AuthUserResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });
    bumpAuthCacheVersion();
    return normalizeAuthUser(response.user);
  },
  logout: async (): Promise<void> => {
    try {
      await http<{ message: string }>("/auth/logout", { method: "POST" });
    } finally {
      clearStoredAccessToken();
    }
  },
  forgotPassword: async (email: string): Promise<void> => {
    await http<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
  resetPassword: async (token: string, password: string): Promise<void> => {
    await http<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  },
  verifyEmail: async (token: string): Promise<AuthUser> => {
    const response = await http<AuthUserResponse>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    bumpAuthCacheVersion();
    return normalizeAuthUser(response.user);
  },
  googleUrl: (redirect = "/") => {
    requireBackend();
    return `${AUTH_URL.replace(/\/$/, "")}/google${queryString({
      redirect: redirect.startsWith("/") ? redirect : "/",
    })}`;
  },
  adminUsers: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {},
  ): Promise<AdminUsersResponse> => {
    const response = await http<AdminUsersResponse>(`/admin/users${queryString(params)}`);
    return response;
  },
  adminUserDetails: async (id: string): Promise<AdminUserDetailsResponse> =>
    http<AdminUserDetailsResponse>(`/admin/user/${id}`),
  adminUserOrders: async (
    id: string,
    params: { page?: number; limit?: number } = {},
  ): Promise<{
    orders: Order[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> => {
    const response = await http<{
      orders: Order[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>(`/admin/user/${id}/orders${queryString(params)}`);
    return response;
  },
  adminBanUser: async (id: string, isBanned: boolean): Promise<AdminUser> => {
    const response = await http<{ user: AdminUser }>(`/admin/ban-user/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ isBanned }),
    });
    invalidateProxyCache("/admin/users", `/admin/user/${id}`, "/admin/analytics");
    return response.user;
  },
  adminDeleteUser: async (id: string): Promise<{ userId: string; deleted: boolean }> =>
    http<{ userId: string; deleted: boolean }>(`/admin/user/${id}`, {
      method: "DELETE",
    }).then((response) => {
      invalidateProxyCache("/admin/users", `/admin/user/${id}`, "/admin/analytics");
      return response;
    }),
  adminAnalytics: async (
    params: {
      range?: AnalyticsRangeKey;
      from?: string;
      to?: string;
    } = {},
  ): Promise<AdminAnalytics> => http<AdminAnalytics>(`/admin/analytics${queryString(params)}`),
};

export type CartApiItem = {
  id?: string;
  key: string;
  productId: string;
  product: Product;
  selectedVariant?: {
    size: string;
  };
  size: Size;
  quantity: number;
  priceAtAddition?: number;
  currentPrice?: number;
  lineTotal?: number;
  addedAt?: string | null;
  updatedAt?: string | null;
};

export type CartApiResponse = {
  id: string;
  userId: string;
  items: CartApiItem[];
  products: CartApiItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  finalTotal: number;
  createdAt?: string | null;
  updatedAt?: string;
};

const normalizeCartItem = (item: CartApiItem): CartApiItem => ({
  ...item,
  id: item.id ? String(item.id) : undefined,
  productId: String(item.productId || item.product?.id || item.product?._id || ""),
  product: normalizeProduct(item.product),
  selectedVariant: {
    size: String(item.selectedVariant?.size || item.size?.size || "Standard"),
  },
  size: {
    size: String(item.size?.size || item.selectedVariant?.size || "Standard"),
    price: Number(item.size?.price || item.currentPrice || item.product?.price || 0),
  },
  quantity: Number(item.quantity || 1),
  priceAtAddition: Number(item.priceAtAddition || item.size?.price || item.product?.price || 0),
  currentPrice: Number(item.currentPrice || item.size?.price || item.product?.price || 0),
  lineTotal: Number(
    item.lineTotal ||
      Number(item.currentPrice || item.size?.price || item.product?.price || 0) *
        Number(item.quantity || 1),
  ),
  key: String(
    item.key ||
      `${item.productId || item.product?.id || item.product?._id}:${item.size?.size || item.selectedVariant?.size || "Standard"}`,
  ),
});

const normalizeCartResponse = (cart: CartApiResponse): CartApiResponse => {
  const itemsSource = Array.isArray(cart.items)
    ? cart.items
    : Array.isArray(cart.products)
      ? cart.products
      : [];
  const items = itemsSource.map(normalizeCartItem);

  return {
    ...cart,
    items,
    products: items,
    totalItems: Number(cart.totalItems ?? items.reduce((sum, item) => sum + item.quantity, 0)),
    subtotal: Number(cart.subtotal ?? items.reduce((sum, item) => sum + (item.lineTotal || 0), 0)),
    discount: Number(cart.discount ?? 0),
    finalTotal: Number(cart.finalTotal ?? Number(cart.subtotal ?? 0) - Number(cart.discount ?? 0)),
  };
};

const toCartPayload = (items: Array<{ productId: string; quantity: number; size?: string }>) => ({
  items: items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    size: item.size || "",
  })),
});

export const cartApi = {
  get: async (): Promise<CartApiResponse> =>
    normalizeCartResponse(await http<CartApiResponse>("/cart")),
  merge: async (
    items: Array<{ productId: string; quantity: number; size?: string }>,
  ): Promise<CartApiResponse> => {
    const cart = normalizeCartResponse(
      await http<CartApiResponse>("/cart/merge", {
        method: "POST",
        body: JSON.stringify(toCartPayload(items)),
      }),
    );
    invalidateCartCache();
    return cart;
  },
  sync: async (
    items: Array<{ productId: string; quantity: number; size?: string }>,
  ): Promise<CartApiResponse> => {
    const cart = normalizeCartResponse(
      await http<CartApiResponse>("/cart/sync", {
        method: "PUT",
        body: JSON.stringify(toCartPayload(items)),
      }),
    );
    invalidateCartCache();
    return cart;
  },
  add: async (payload: {
    productId: string;
    quantity?: number;
    size?: string;
  }): Promise<CartApiResponse> => {
    const cart = normalizeCartResponse(
      await http<CartApiResponse>("/cart/add", {
        method: "POST",
        body: JSON.stringify({
          productId: payload.productId,
          quantity: payload.quantity || 1,
          size: payload.size || "",
        }),
      }),
    );
    invalidateCartCache();
    return cart;
  },
  update: async (payload: {
    itemId?: string;
    productId?: string;
    quantity: number;
    size?: string;
  }): Promise<CartApiResponse> => {
    const cart = normalizeCartResponse(
      await http<CartApiResponse>("/cart/update", {
        method: "PUT",
        body: JSON.stringify({
          itemId: payload.itemId,
          productId: payload.productId,
          quantity: payload.quantity,
          size: payload.size || "",
        }),
      }),
    );
    invalidateCartCache();
    return cart;
  },
  remove: async (payload: {
    itemId?: string;
    productId?: string;
    size?: string;
  }): Promise<CartApiResponse> => {
    const identifier = payload.itemId || payload.productId || "";
    const cart = normalizeCartResponse(
      await http<CartApiResponse>(
        `/cart/remove/${identifier}${queryString({
          ...(payload.itemId ? { itemId: payload.itemId } : {}),
          ...(payload.productId ? { productId: payload.productId } : {}),
          ...(payload.size ? { size: payload.size } : {}),
        })}`,
        {
          method: "DELETE",
        },
      ),
    );
    invalidateCartCache();
    return cart;
  },
  clear: async (): Promise<CartApiResponse> => {
    const cart = normalizeCartResponse(
      await http<CartApiResponse>("/cart/clear", { method: "DELETE" }),
    );
    invalidateCartCache();
    return cart;
  },
};

export type AnalyticsRangeKey =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "2m"
  | "3m"
  | "6m"
  | "1y"
  | "custom";

export type AdminAnalytics = {
  range: {
    key: AnalyticsRangeKey | string;
    from: string;
    to: string;
  };
  summary: {
    totalRevenue: number;
    revenueToday: number;
    monthlyRevenue: number;
    revenueInRange: number;
    totalOrders: number;
    ordersInRange: number;
    averageOrderValue: number;
    conversionRate: number;
    repeatCustomers: number;
    activeUsers: number;
    abandonedCarts: number;
    lowStockAlerts: number;
    totalUsers: number;
    blockedUsers: number;
    newUsersToday: number;
    premiumCustomers: number;
    pendingOrders: number;
  };
  trends: {
    revenue: Array<{ label: string; revenue: number; orders: number }>;
    users: Array<{ label: string; value: number }>;
  };
  topProducts: Array<{
    productId: string;
    productName: string;
    brand: string;
    image: string;
    quantity: number;
    revenue: number;
  }>;
  topCustomers: Array<{
    id: string;
    name: string;
    email: string;
    mobile: string;
    totalOrders: number;
    totalSpent: number;
    lastLogin?: string;
    createdAt?: string | null;
      emailVerified?: boolean;
      isBanned?: boolean;
  }>;
  recentActivity: Array<{
    id: string;
    title: string;
    description: string;
    amount: number;
    at: string | null;
    type: string;
  }>;
};

export const adminApi = {
  analytics: async (
    params: {
      range?: AnalyticsRangeKey;
      from?: string;
      to?: string;
    } = {},
  ): Promise<AdminAnalytics> => http<AdminAnalytics>(`/admin/analytics${queryString(params)}`),
  users: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {},
  ): Promise<AdminUsersResponse> => http<AdminUsersResponse>(`/admin/users${queryString(params)}`),
  userDetails: async (id: string): Promise<AdminUserDetailsResponse> =>
    http<AdminUserDetailsResponse>(`/admin/user/${id}`),
  userOrders: async (id: string, params: { page?: number; limit?: number } = {}) =>
    http<{
      orders: Order[];
      pagination: PaginatedOrders["pagination"];
    }>(`/admin/user/${id}/orders${queryString(params)}`),
  banUser: async (id: string, isBanned: boolean): Promise<AdminUser> => {
    const response = await http<{ user: AdminUser }>(`/admin/ban-user/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ isBanned }),
    });
    invalidateProxyCache("/admin/users", `/admin/user/${id}`, "/admin/analytics");
    return response.user;
  },
  deleteUser: async (id: string): Promise<{ userId: string; deleted: boolean }> =>
    http<{ userId: string; deleted: boolean }>(`/admin/user/${id}`, {
      method: "DELETE",
    }).then((response) => {
      invalidateProxyCache("/admin/users", `/admin/user/${id}`, "/admin/analytics");
      return response;
    }),
};

export const paymentsApi = {
  getConfig: async (): Promise<PaymentConfig> => {
    if (cachedPaymentConfig) {
      return cachedPaymentConfig;
    }

    const data = await http<PaymentConfig>("/payments/razorpay/config");
    cachedPaymentConfig = {
      keyId: String(data.keyId || "").trim(),
      bypassEnabled: Boolean(data.bypassEnabled),
      provider: String(data.provider || "razorpay"),
      mode: data.mode === "test" ? "test" : "live",
    };
    return cachedPaymentConfig;
  },
  getSettings: async (): Promise<PaymentModeSettings> => {
    const data = await http<PaymentModeSettings>("/payments/settings");
    return {
      id: data.id ? String(data.id) : undefined,
      paymentMode: data.paymentMode === "test" ? "test" : "live",
      isPersisted: Boolean(data.isPersisted),
      updatedAt: data.updatedAt || null,
    };
  },
  updateSettings: async (paymentMode: "live" | "test"): Promise<PaymentModeSettings & PaymentConfig> => {
    const data = await http<PaymentModeSettings & PaymentConfig>("/payments/settings", {
      method: "PUT",
      body: JSON.stringify({ paymentMode }),
    });
    cachedPaymentConfig = {
      keyId: String(data.keyId || "").trim(),
      bypassEnabled: Boolean(data.bypassEnabled),
      provider: String(data.provider || "razorpay"),
      mode: data.mode === "test" ? "test" : "live",
    };
    return {
      id: data.id ? String(data.id) : undefined,
      paymentMode: data.paymentMode === "test" ? "test" : "live",
      isPersisted: Boolean(data.isPersisted),
      updatedAt: data.updatedAt || null,
      ...cachedPaymentConfig,
    };
  },
  getRazorpayKey: async (): Promise<string> => {
    const config = await paymentsApi.getConfig();
    return String(config.keyId || "").trim();
  },
};

export const frontendApiFacade = {
  products: productsApi,
  brands: brandsApi,
  categories: categoriesApi,
  banners: bannersApi,
  cart: cartApi,
  coupons: couponsApi,
  orders: ordersApi,
  profile: {
    me: accountApi.me,
    dashboard: accountApi.dashboard,
    update: accountApi.updateProfile,
    addAddress: accountApi.addAddress,
    updateAddress: accountApi.updateAddress,
    deleteAddress: accountApi.deleteAddress,
    setDefaultAddress: accountApi.setDefaultAddress,
  },
  wishlist: {
    list: productsApi.wishlist,
    add: productsApi.addToWishlist,
    remove: productsApi.removeFromWishlist,
    clear: productsApi.clearWishlist,
  },
  dashboard: {
    user: accountApi.dashboard,
    adminAnalytics: adminApi.analytics,
  },
};

export const isUsingMock = false;
export const isBackendConfigured = !!BASE;
