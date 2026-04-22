/**
 * API service layer for the Purefumes Hyderabad backend.
 * Product, category, and order data must come from MongoDB through VITE_API_BASE_URL.
 */

import type { Accord, BestTime, Product } from "@/data/products";

const BASE = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://localhost:5000/api"
).replace(/\/$/, "");
const TOKEN_KEY = "purefumes_admin_token";

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
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
};

type ProductPayload = Partial<Product> & {
  _id?: string;
  id?: string;
  notes?: string[];
  season?: Product["seasons"];
  timeOfDay?: Product["usage"] | string;
  accords?: Array<Partial<Accord> & { color?: string; intensity?: number }>;
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

export type CreateOrderInput = {
  customerName: string;
  phone: string;
  address: string;
  items: Array<{ productId: string; quantity: number; size?: string }>;
};

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

const queryString = (params: ProductListParams = {}) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });

  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

const isCategory = (value: unknown): value is Product["category"] =>
  value === "Middle Eastern" || value === "Designer" || value === "Niche";

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

  return {
    _id: product._id,
    id: String(product.id || product._id || ""),
    name: String(product.name || ""),
    brand: String(product.brand || ""),
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
});

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  requireBackend();

  const token = auth.getToken();
  const headers = new Headers(init.headers);
  const method = init.method || "GET";

  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (import.meta.env.DEV) {
    console.debug(`[API] ${method} ${BASE}${path}`);
  }

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers,
  });

  const payload = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!res.ok || payload?.success === false) {
    throw new Error(payload?.message || `${res.status} ${res.statusText}`);
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }

  return payload as T;
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
  create: async (product: Omit<Product, "id">): Promise<Product> =>
    normalizeProduct(
      await http<ProductPayload>("/products", { method: "POST", body: JSON.stringify(product) }),
    ),
  createWithImages: async (formData: FormData): Promise<Product> =>
    normalizeProduct(await http<ProductPayload>("/products", { method: "POST", body: formData })),
  update: async (id: string, product: Partial<Product>): Promise<Product> =>
    normalizeProduct(
      await http<ProductPayload>(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(product),
      }),
    ),
  updateWithImages: async (id: string, formData: FormData): Promise<Product> =>
    normalizeProduct(
      await http<ProductPayload>(`/products/${id}`, { method: "PUT", body: formData }),
    ),
  remove: async (id: string): Promise<void> => {
    await http<{ id: string }>(`/products/${id}`, { method: "DELETE" });
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

export const isUsingMock = false;
export const isBackendConfigured = !!BASE;
