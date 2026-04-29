/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product, Size } from "@/data/products";
import { couponsApi, type ApplyCouponResult } from "@/services/api";

export type CartItem = {
  key: string;
  product: Product;
  size: Size;
  quantity: number;
};

type CouponFeedbackTone = "success" | "error" | "info";

type CartCoupon = Pick<ApplyCouponResult, "code" | "discount" | "finalTotal" | "subtotal">;

type AppState = {
  activeProduct: Product | null;
  openProduct: (p: Product) => void;
  closeProduct: () => void;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  cartDiscount: number;
  cartFinalTotal: number;
  cartCouponCode: string;
  cartCouponMessage: string;
  cartCouponTone: CouponFeedbackTone | null;
  cartCouponLoading: boolean;
  wishlist: Product[];
  wishlistCount: number;
  isWishlisted: (productId?: string | null) => boolean;
  toggleWishlist: (product: Product) => boolean;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  applyCartCoupon: (couponCode: string) => Promise<boolean>;
  removeCartCoupon: () => void;
  addToCart: (product: Product, size: Size, quantity?: number) => void;
  updateCartQuantity: (key: string, quantity: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  checkoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
};

const Ctx = createContext<AppState | null>(null);
const CART_STORAGE_KEY = "purefumes_cart";
const WISHLIST_STORAGE_KEY = "purefumes_wishlist";

const getCartKey = (product: Product, size: Size) => `${product.id}:${size.size}`;
const getProductKey = (product: Product) => String(product.id || product._id || "").trim();
const clampQuantity = (quantity: number, stock: number) => {
  const max = Math.max(1, stock || 1);
  return Math.min(Math.max(1, Math.trunc(quantity) || 1), max);
};

const readStoredCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        if (!item?.product?.id || !item?.size?.size) return null;

        const price = Number(item.size.price);
        const quantity = clampQuantity(Number(item.quantity), Number(item.product.stock || 1));

        if (!Number.isFinite(price)) return null;

        return {
          key: String(item.key || getCartKey(item.product, item.size)),
          product: item.product as Product,
          size: { size: String(item.size.size), price },
          quantity,
        };
      })
      .filter((item): item is CartItem => Boolean(item));
  } catch (_error) {
    return [];
  }
};

const readStoredWishlist = (): Product[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const seen = new Set<string>();

    return parsed
      .map((product) => {
        if (!product || typeof product !== "object") return null;

        const nextProduct = product as Product;
        const productId = getProductKey(nextProduct);
        if (!productId || seen.has(productId)) return null;

        seen.add(productId);
        return {
          ...nextProduct,
          id: productId,
          sizes: Array.isArray(nextProduct.sizes) && nextProduct.sizes.length
            ? nextProduct.sizes
            : [{ size: "Standard", price: Number(nextProduct.price || 0) }],
        };
      })
      .filter((product): product is Product => Boolean(product));
  } catch (_error) {
    return [];
  }
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>(readStoredCart);
  const [wishlist, setWishlist] = useState<Product[]>(readStoredWishlist);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cartCoupon, setCartCoupon] = useState<CartCoupon | null>(null);
  const [cartCouponMessage, setCartCouponMessage] = useState("");
  const [cartCouponTone, setCartCouponTone] = useState<CouponFeedbackTone | null>(null);
  const [cartCouponLoading, setCartCouponLoading] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (_error) {
      // Cart persistence should never break shopping actions.
    }
  }, [cart]);

  useEffect(() => {
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (_error) {
      // Wishlist persistence should never break shopping actions.
    }
  }, [wishlist]);

  const openProduct = useCallback((p: Product) => setActiveProduct(p), []);
  const closeProduct = useCallback(() => setActiveProduct(null), []);

  const wishlistIdSet = useMemo(
    () => new Set(wishlist.map((product) => getProductKey(product)).filter(Boolean)),
    [wishlist],
  );

  const isWishlisted = useCallback(
    (productId?: string | null) => Boolean(productId && wishlistIdSet.has(productId)),
    [wishlistIdSet],
  );

  const toggleWishlist = useCallback((product: Product) => {
    const productId = getProductKey(product);
    if (!productId) return false;

    const added = !wishlist.some((item) => getProductKey(item) === productId);

    setWishlist((current) => {
      const exists = current.some((item) => getProductKey(item) === productId);

      if (exists) {
        return current.filter((item) => getProductKey(item) !== productId);
      }

      return [{ ...product, id: productId }, ...current];
    });

    return added;
  }, [wishlist]);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((current) => current.filter((item) => getProductKey(item) !== productId));
  }, []);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  const clearCartCoupon = useCallback(() => {
    setCartCoupon(null);
    setCartCouponMessage("");
    setCartCouponTone(null);
    setCartCouponLoading(false);
  }, []);

  const invalidateCartCoupon = useCallback(() => {
    if (!cartCoupon) {
      return;
    }

    setCartCoupon(null);
    setCartCouponLoading(false);
    setCartCouponMessage("Coupon removed because cart changed. Apply it again to recalculate.");
    setCartCouponTone("info");
  }, [cartCoupon]);

  const applyCartCoupon = useCallback(async (couponCode: string) => {
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
          quantity: item.quantity,
          size: item.size.size,
        })),
      });

      setCartCoupon({
        code: result.code,
        discount: result.discount,
        finalTotal: result.finalTotal,
        subtotal: result.subtotal,
      });
      setCartCouponMessage(result.message || "Coupon applied successfully");
      setCartCouponTone("success");
      return true;
    } catch (error) {
      setCartCoupon(null);
      setCartCouponMessage(error instanceof Error ? error.message : "Coupon could not be applied.");
      setCartCouponTone("error");
      return false;
    } finally {
      setCartCouponLoading(false);
    }
  }, [cart]);

  const removeCartCoupon = useCallback(() => {
    clearCartCoupon();
  }, [clearCartCoupon]);

  const addToCart = useCallback((product: Product, size: Size, quantity = 1) => {
    invalidateCartCoupon();
    setCart((current) => {
      const key = getCartKey(product, size);
      const existing = current.find((item) => item.key === key);

      if (existing) {
        return current.map((item) =>
          item.key === key
            ? { ...item, quantity: clampQuantity(item.quantity + quantity, product.stock) }
            : item,
        );
      }

      return [
        ...current,
        {
          key,
          product,
          size,
          quantity: clampQuantity(quantity, product.stock),
        },
      ];
    });
  }, [invalidateCartCoupon]);

  const updateCartQuantity = useCallback((key: string, quantity: number) => {
    invalidateCartCoupon();
    setCart((current) =>
      current.map((item) =>
        item.key === key
          ? { ...item, quantity: clampQuantity(quantity, item.product.stock) }
          : item,
      ),
    );
  }, [invalidateCartCoupon]);

  const removeFromCart = useCallback((key: string) => {
    invalidateCartCoupon();
    setCart((current) => current.filter((item) => item.key !== key));
  }, [invalidateCartCoupon]);

  const clearCart = useCallback(() => {
    clearCartCoupon();
    setCart([]);
  }, [clearCartCoupon]);

  const openCheckout = useCallback(() => {
    setActiveProduct(null);
    setCheckoutOpen(true);
  }, []);

  const closeCheckout = useCallback(() => {
    setCheckoutOpen(false);
  }, []);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.size.price * item.quantity, 0),
    [cart],
  );
  const cartDiscount = cartCoupon?.discount ?? 0;
  const cartFinalTotal = cartCoupon?.finalTotal ?? cartTotal;
  const cartCouponCode = cartCoupon?.code ?? "";
  const wishlistCount = wishlist.length;

  const value = useMemo(
    () => ({
      activeProduct,
      openProduct,
      closeProduct,
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
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
      applyCartCoupon,
      removeCartCoupon,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      checkoutOpen,
      openCheckout,
      closeCheckout,
    }),
    [
      activeProduct,
      openProduct,
      closeProduct,
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
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
      applyCartCoupon,
      removeCartCoupon,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      checkoutOpen,
      openCheckout,
      closeCheckout,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
