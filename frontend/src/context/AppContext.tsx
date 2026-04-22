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

export type CartItem = {
  key: string;
  product: Product;
  size: Size;
  quantity: number;
};

type AppState = {
  activeProduct: Product | null;
  openProduct: (p: Product) => void;
  closeProduct: () => void;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
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

const getCartKey = (product: Product, size: Size) => `${product.id}:${size.size}`;
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>(readStoredCart);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (_error) {
      // Cart persistence should never break shopping actions.
    }
  }, [cart]);

  const openProduct = useCallback((p: Product) => setActiveProduct(p), []);
  const closeProduct = useCallback(() => setActiveProduct(null), []);

  const addToCart = useCallback((product: Product, size: Size, quantity = 1) => {
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
  }, []);

  const updateCartQuantity = useCallback((key: string, quantity: number) => {
    setCart((current) =>
      current.map((item) =>
        item.key === key
          ? { ...item, quantity: clampQuantity(quantity, item.product.stock) }
          : item,
      ),
    );
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setCart((current) => current.filter((item) => item.key !== key));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

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

  const value = useMemo(
    () => ({
      activeProduct,
      openProduct,
      closeProduct,
      cart,
      cartCount,
      cartTotal,
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
