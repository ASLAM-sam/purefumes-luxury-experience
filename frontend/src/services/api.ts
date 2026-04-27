/**
 * API service layer for the Purefumes Hyderabad backend.
 * Product, category, and order data must come from MongoDB through VITE_API_BASE_URL.
 */

import type { Brand, BrandPreviewProduct } from "@/data/brands";
import type { Accord, BestTime, Product } from "@/data/products";

const BASE = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://localhost:5000/api"
).replace(/\/$/, "");
const TOKEN_KEY = "purefumes_admin_token";
const CATALOG_CACHE_TTL_MS = 30 * 1000;
const CATALOG_CACHE_MAX_KEYS = 100;
const catalogResponseCache = new Map<string, CatalogCacheEntry>();
const inflightCatalogRequests = new Map<string, Promise<unknown>>();

const API_ORIGIN = (() => {
  try {
    return new URL(BASE).origin;
  } catch (_error) {
    return BASE.replace(/\/api$/, "");
  }
})();

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
  minPrice?: number;
  maxPrice?: number;
};

type BrandListParams = {
  category?: Brand["category"];
};

type ProductPayload = Partial<Product> & {
  _id?: string;
  id?: string;
  notes?: string[];
  season?: Product["seasons"];
  timeOfDay?: Product["usage"] | string;
  accords?: Array<Partial<Accord> & { color?: string; intensity?: number }>;
};

type BrandPayload = Partial<Brand> & {
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
  price: string | number;
  stock: string | number;
  description?: string;
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
  status: "Pending" | "Shipped" | "Delivered";
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

export type LoginResponse = { token: string };

type RazorpayConfig = {
  keyId: string;
};

export type CreateOrderInput = {
  customerName: string;
  phone: string;
  address: string;
  items: Array<{ productId: string; quantity: number; size?: string }>;
  paymentId?: string;
  paymentMethod?: string;
  paymentGateway?: string;
  paymentOrderId?: string;
  paymentSignature?: string;
};

let cachedRazorpayKey = "";

const emitDataEvent = (name: string) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(name));
  }
};

export const auth = {
  getToken: () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY)),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
  isLoggedIn: () => !!auth.getToken(),
};

const requireBackend = () => {
  if (!BASE) {
    throw new Error("API URL is required. Point the frontend to your Express API.");
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

const isCatalogPath = (path: string) =>
  path.startsWith("/products") || path.startsWith("/brands") || path.startsWith("/categories");

const canCacheCatalogRequest = (method: string, path: string) =>
  method === "GET" && isCatalogPath(path);

const getCatalogCacheKey = (method: string, path: string, token: string | null) =>
  `${method}:${token ? "auth" : "public"}:${path}`;

const getCatalogCacheEntry = (key: string) => catalogResponseCache.get(key) ?? null;

const isFreshCatalogEntry = (entry: CatalogCacheEntry) =>
  Date.now() - entry.createdAt < CATALOG_CACHE_TTL_MS;

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
};

const isCategory = (value: unknown): value is Product["category"] =>
  value === "Middle Eastern" || value === "Designer" || value === "Niche";

const isBrandCategory = (value: unknown): value is Brand["category"] =>
  value === "middle-eastern" || value === "designer" || value === "niche";

const isUsage = (value: unknown): value is Product["usage"] =>
  value === "Day" || value === "Night" || value === "Day & Night";

const isBestTime = (value: unknown): value is BestTime =>
  value === "Morning" || value === "Day" || value === "Evening" || value === "Night";

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : [];

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
  const normalizedBrandId = String(product.brandId || brandDetails?.id || "").trim();

  return {
    _id: product._id,
    id: String(product.id || product._id || ""),
    name: String(product.name || ""),
    brand: String(product.brand || brandDetails?.name || ""),
    brandId: normalizedBrandId || null,
    brandDetails,
    category: isCategory(product.category) ? product.category : "Designer",
    price,
    image,
    images: normalizedImages,
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
  isSeen: Boolean(order.isSeen),
  paymentId: order.paymentId ?? "",
  paymentMethod: order.paymentMethod ?? "",
  paymentGateway: order.paymentGateway ?? "",
  paymentOrderId: order.paymentOrderId ?? "",
  paymentSignature: order.paymentSignature ?? "",
});

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  requireBackend();

  const token = auth.getToken();
  const headers = new Headers(init.headers);
  const method = (init.method || "GET").toUpperCase();
  const cacheableCatalogRequest = canCacheCatalogRequest(method, path);
  const catalogCacheKey = cacheableCatalogRequest ? getCatalogCacheKey(method, path, token) : "";
  const cachedCatalogEntry = cacheableCatalogRequest ? getCatalogCacheEntry(catalogCacheKey) : null;

  if (cachedCatalogEntry && isFreshCatalogEntry(cachedCatalogEntry)) {
    return cachedCatalogEntry.data as T;
  }

  if (cacheableCatalogRequest) {
    const inflightRequest = inflightCatalogRequests.get(catalogCacheKey);

    if (inflightRequest) {
      return inflightRequest as Promise<T>;
    }
  }

  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (import.meta.env.DEV) {
    console.debug(`[API] ${method} ${BASE}${path}`);
  }

  const request = (async () => {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      cache: init.cache ?? (cacheableCatalogRequest ? "default" : "no-store"),
      headers,
    });

    const payload = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

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
  })();

  if (cacheableCatalogRequest) {
    inflightCatalogRequests.set(catalogCacheKey, request as Promise<unknown>);
  }

  try {
    return await request;
  } catch (error) {
    if (cachedCatalogEntry) {
      return cachedCatalogEntry.data as T;
    }

    throw error;
  } finally {
    if (cacheableCatalogRequest) {
      inflightCatalogRequests.delete(catalogCacheKey);
    }
  }
}

export const productsApi = {
  list: async (params: ProductListParams = {}): Promise<Product[]> => {
    const data = await http<PaginatedProducts | Product[]>(`/products${queryString(params)}`);
    const products = Array.isArray(data) ? data : data.products;
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
    return normalizeProduct(createdProduct);
  },
  createWithImages: async (formData: FormData): Promise<Product> => {
    const createdProduct = await http<ProductPayload>("/products", {
      method: "POST",
      body: formData,
    });
    clearCatalogCache("/products");
    clearCatalogCache("/brands");
    clearCatalogCache("/categories");
    return normalizeProduct(createdProduct);
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
    return normalizeProduct(updatedProduct);
  },
  updateWithImages: async (id: string, formData: FormData): Promise<Product> => {
    const updatedProduct = await http<ProductPayload>(`/products/${id}`, {
      method: "PUT",
      body: formData,
    });
    clearCatalogCache("/products");
    clearCatalogCache("/brands");
    clearCatalogCache("/categories");
    return normalizeProduct(updatedProduct);
  },
  remove: async (id: string): Promise<void> => {
    await http<{ id: string }>(`/products/${id}`, { method: "DELETE" });
    clearCatalogCache("/products");
    clearCatalogCache("/brands");
    clearCatalogCache("/categories");
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

export const ordersApi = {
  list: async (): Promise<Order[]> => {
    const data = await http<PaginatedOrders | Order[]>("/orders");
    const orders = Array.isArray(data) ? data : data.orders;
    return orders.map(normalizeOrder);
  },
  unseen: async (): Promise<Order[]> => {
    const orders = await http<Order[]>("/orders/unseen");
    return orders.map(normalizeOrder);
  },
  create: async (input: CreateOrderInput): Promise<Order> => {
    const order = normalizeOrder(
      await http<Order>("/orders", { method: "POST", body: JSON.stringify(input) }),
    );
    emitDataEvent("purefumes:orders-changed");
    return order;
  },
  updateStatus: async (id: string, status: Order["status"]): Promise<Order> =>
    normalizeOrder(
      await http<Order>(`/orders/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),
    ),
  markSeen: async (id: string): Promise<Order> =>
    normalizeOrder(await http<Order>(`/orders/${id}/seen`, { method: "PUT" })),
};

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await http<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    auth.setToken(response.token);
    return response;
  },
  logout: () => auth.clear(),
};

export const paymentsApi = {
  getRazorpayKey: async (): Promise<string> => {
    if (cachedRazorpayKey) {
      return cachedRazorpayKey;
    }

    const data = await http<RazorpayConfig>("/payments/razorpay/config");
    cachedRazorpayKey = String(data.keyId || "").trim();
    return cachedRazorpayKey;
  },
};

export const isUsingMock = false;
export const isBackendConfigured = !!BASE;
