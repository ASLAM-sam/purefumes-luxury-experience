/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Product, Size } from "@/data/products";
import {
  cartApi,
  couponsApi,
  productsApi,
  type ApplyCouponResult,
  type CartApiResponse,
} from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { addMoney, multiplyMoney, normalizeMoney, subtractMoney } from "@/lib/money";
import { uiActionObserver, uiStateObserver } from "@/lib/performance/state-observers";

export type CartItem = {
  id?: string;
  key: string;
  product: Product;
  size: Size;
  quantity: number;
};

type CouponFeedbackTone = "success" | "error" | "info";

type CartCoupon = Pick<ApplyCouponResult, "code" | "discount" | "finalTotal" | "subtotal">;
type CartSummary = Pick<CartApiResponse, "totalItems" | "subtotal" | "discount" | "finalTotal">;

type AppState = {
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
  isWishlistPending: (productId?: string | null) => boolean;
  toggleWishlist: (product: Product) => boolean;
  removeFromWishlist: (productId: string) => Promise<Product[] | void>;
  clearWishlist: () => void;
  applyCartCoupon: (couponCode: string) => Promise<boolean>;
  removeCartCoupon: () => void;
  addToCart: (product: Product, size: Size, quantity?: number) => void;
  updateCartQuantity: (key: string, quantity: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  reloadCart: () => Promise<void>;
  checkoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
};

const Ctx = createContext<AppState | null>(null);
const GUEST_CART_STORAGE_KEY = "purefumes_guest_cart";
const LEGACY_CART_STORAGE_KEY = "purefumes_cart";
const WISHLIST_STORAGE_KEY = "purefumes_wishlist";

const getCartKey = (product: Product, size: Size) => `${product.id}:${size.size}`;
const getProductKey = (product: Product) => String(product.id || product._id || "").trim();
const dedupeProducts = (products: Product[]) => {
  const seen = new Set<string>();

  return products.filter((product) => {
    const productId = getProductKey(product);
    if (!productId || seen.has(productId)) return false;
    seen.add(productId);
    return true;
  });
};
const clampQuantity = (quantity: number, stock: number) => {
  const max = Math.max(1, stock || 1);
  return Math.min(Math.max(1, Math.trunc(quantity) || 1), max);
};

const readGuestCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw =
      window.localStorage.getItem(GUEST_CART_STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map<CartItem | null>((item) => {
        if (!item?.product?.id || !item?.size?.size) return null;

        const price = normalizeMoney(item.size.price);
        const quantity = clampQuantity(Number(item.quantity), Number(item.product.stock || 1));

        if (!Number.isFinite(price)) return null;

        return {
          id: item.id ? String(item.id) : undefined,
          key: String(item.key || getCartKey(item.product, item.size)),
          product: item.product as Product,
          size: { size: String(item.size.size), price },
          quantity,
        };
      })
      .filter((item): item is CartItem => item !== null);
  } catch (_error) {
    return [];
  }
};

const writeGuestCart = (items: CartItem[]) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
    window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
  } catch (_error) {
    // Guest cart persistence should never block shopping actions.
  }
};

const clearGuestCart = () => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
  } catch (_error) {
    // Guest cart cleanup should never block auth flows.
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
          sizes:
            Array.isArray(nextProduct.sizes) && nextProduct.sizes.length
              ? nextProduct.sizes
              : [{ size: "Standard", price: normalizeMoney(nextProduct.price || 0) }],
        };
      })
      .filter((product): product is Product => Boolean(product));
  } catch (_error) {
    return [];
  }
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, authReady } = useAuth();
  const guestCartRef = useRef<CartItem[]>(readGuestCart());
  const [cart, setCart] = useState<CartItem[]>(guestCartRef.current);
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    totalItems: guestCartRef.current.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: addMoney(
      ...guestCartRef.current.map((item) => multiplyMoney(item.size.price, item.quantity)),
    ),
    discount: 0,
    finalTotal: addMoney(
      ...guestCartRef.current.map((item) => multiplyMoney(item.size.price, item.quantity)),
    ),
  });
  const [wishlist, setWishlist] = useState<Product[]>(readStoredWishlist);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cartCoupon, setCartCoupon] = useState<CartCoupon | null>(null);
  const [cartCouponMessage, setCartCouponMessage] = useState("");
  const [cartCouponTone, setCartCouponTone] = useState<CouponFeedbackTone | null>(null);
  const [cartCouponLoading, setCartCouponLoading] = useState(false);
  const [pendingWishlistIds, setPendingWishlistIds] = useState<Set<string>>(() => new Set());
  const mergedUserIdRef = useRef<string | null>(null);
  const syncedWishlistUserIdRef = useRef<string | null>(null);
  const pendingWishlistIdsRef = useRef<Set<string>>(new Set());
  const cartMutationSeqRef = useRef(0);

  const cartToApiItems = useCallback(
    (items: CartItem[]) =>
      items
        .map((item) => ({
          productId: item.product.id || item.product._id || "",
          quantity: item.quantity,
          size: item.size.size,
        }))
        .filter((item) => item.productId),
    [],
  );

  const apiCartToLocal = useCallback((apiCart: CartApiResponse): CartItem[] => {
    return apiCart.products.map((item) => ({
      id: item.id,
      key: item.key || `${item.product.id}:${item.size.size}`,
      product: item.product,
      size: item.size,
      quantity: item.quantity,
    }));
  }, []);

  const applyServerCart = useCallback(
    (serverCart: CartApiResponse) => {
      setCart(apiCartToLocal(serverCart));
      setCartSummary({
        totalItems: serverCart.totalItems,
        subtotal: serverCart.subtotal,
        discount: serverCart.discount,
        finalTotal: serverCart.finalTotal,
      });
    },
    [apiCartToLocal],
  );

  const applyGuestCart = useCallback((items: CartItem[]) => {
    guestCartRef.current = items;
    writeGuestCart(items);
    setCart(items);
    const subtotal = addMoney(...items.map((item) => multiplyMoney(item.size.price, item.quantity)));
    setCartSummary({
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      discount: 0,
      finalTotal: subtotal,
    });
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      mergedUserIdRef.current = null;
      const nextGuestCart = readGuestCart();
      guestCartRef.current = nextGuestCart;
      applyGuestCart(nextGuestCart);
      return;
    }

    if (mergedUserIdRef.current === user.id) {
      return;
    }

    mergedUserIdRef.current = user.id;

    const synchronizeCart = async () => {
      const guestItems = guestCartRef.current;
      const serverCart = guestItems.length
        ? await cartApi.merge(cartToApiItems(guestItems))
        : await cartApi.get();

      applyServerCart(serverCart);
      clearGuestCart();
      guestCartRef.current = [];
    };

    void synchronizeCart().catch(() => {
      mergedUserIdRef.current = null;
    });
  }, [applyGuestCart, applyServerCart, authReady, cartToApiItems, user]);

  useEffect(() => {
    if (!authReady) return;

    if (user) {
      syncedWishlistUserIdRef.current = null;
      return;
    }

    setWishlist(readStoredWishlist());
  }, [authReady, user]);

  useEffect(() => {
    if (!authReady || !user) return;

    if (syncedWishlistUserIdRef.current === user.id) {
      return;
    }

    syncedWishlistUserIdRef.current = user.id;

    const synchronizeWishlist = async () => {
      const guestWishlist = readStoredWishlist();
      const guestProductIds = guestWishlist.map(getProductKey).filter(Boolean);

      if (guestProductIds.length) {
        await Promise.allSettled(
          Array.from(new Set(guestProductIds)).map((productId) =>
            productsApi.addToWishlist(productId),
          ),
        );

        try {
          window.localStorage.removeItem(WISHLIST_STORAGE_KEY);
        } catch (_error) {
          // Guest wishlist cleanup should never block login.
        }
      }

      setWishlist(dedupeProducts(await productsApi.wishlist()));
    };

    void synchronizeWishlist().catch(async () => {
      syncedWishlistUserIdRef.current = null;

      try {
        setWishlist(dedupeProducts(await productsApi.wishlist()));
      } catch (_error) {
        // Keep the current optimistic view if the network is temporarily unavailable.
      }
    });
  }, [authReady, user]);

  useEffect(() => {
    if (!authReady || user) return;

    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (_error) {
      // Wishlist persistence should never break shopping actions.
    }
  }, [authReady, user, wishlist]);

  const wishlistIdSet = useMemo(
    () => new Set(wishlist.map((product) => getProductKey(product)).filter(Boolean)),
    [wishlist],
  );

  const isWishlisted = useCallback(
    (productId?: string | null) => Boolean(productId && wishlistIdSet.has(productId)),
    [wishlistIdSet],
  );

  const setWishlistPending = useCallback((productId: string, pending: boolean) => {
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

  const isWishlistPending = useCallback(
    (productId?: string | null) => Boolean(productId && pendingWishlistIds.has(productId)),
    [pendingWishlistIds],
  );

  const toggleWishlist = useCallback(
    (product: Product) => {
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

      if (user) {
        setWishlistPending(productId, true);
        const mutation = added
          ? productsApi.addToWishlist(productId)
          : productsApi.removeFromWishlist(productId);

        void mutation
          .then((nextWishlist) => setWishlist(dedupeProducts(nextWishlist)))
          .catch(async () => {
            try {
              setWishlist(dedupeProducts(await productsApi.wishlist()));
            } catch (_error) {
              setWishlist(previousWishlist);
            }
          })
          .finally(() => {
            setWishlistPending(productId, false);
          });
      }

      return added;
    },
    [isWishlisted, setWishlistPending, user, wishlist],
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (pendingWishlistIdsRef.current.has(productId)) {
        return wishlist;
      }

      const previousWishlist = wishlist;
      setWishlist((current) => current.filter((item) => getProductKey(item) !== productId));

      if (user) {
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

      return undefined;
    },
    [setWishlistPending, user, wishlist],
  );

  const clearWishlist = useCallback(() => {
    const previousWishlist = wishlist;
    setWishlist([]);

    if (user) {
      void productsApi
        .clearWishlist()
        .then((nextWishlist) => setWishlist(dedupeProducts(nextWishlist)))
        .catch(() => setWishlist(previousWishlist));
    }
  }, [user, wishlist]);

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

  const applyCartCoupon = useCallback(
    async (couponCode: string) => {
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
            size: item.size.size,
          })),
        });

        if (!result || result.success === false) {
          setCartCoupon(null);
          setCartCouponMessage(result?.message || "Invalid coupon code");
          setCartCouponTone("error");
          return false;
        }

        const discountAmount = normalizeMoney(
          result.discount ?? result.coupon?.discountValue ?? 0,
        );
        const resultSubtotal = normalizeMoney(result.subtotal ?? cartSummary.subtotal);
        const resultFinalTotal = normalizeMoney(
          result.finalTotal ?? subtractMoney(resultSubtotal, discountAmount),
        );

        setCartCoupon({
          code: result.coupon?.code || result.code || trimmedCode.toUpperCase(),
          discount: discountAmount,
          finalTotal: resultFinalTotal,
          subtotal: resultSubtotal,
        });
        setCartCouponMessage(result.message || "Coupon applied successfully");
        setCartCouponTone("success");
        return true;
      } catch (error) {
        setCartCoupon(null);
        setCartCouponMessage(
          error instanceof Error ? error.message : "Coupon could not be applied.",
        );
        setCartCouponTone("error");
        return false;
      } finally {
        setCartCouponLoading(false);
      }
    },
    [cart, cartSummary.subtotal],
  );

  const removeCartCoupon = useCallback(() => {
    clearCartCoupon();
  }, [clearCartCoupon]);

  const syncAuthenticatedMutation = useCallback(
    async (mutation: () => Promise<CartApiResponse>) => {
      const sequence = ++cartMutationSeqRef.current;

      try {
        const serverCart = await mutation();
        if (sequence === cartMutationSeqRef.current) {
          applyServerCart(serverCart);
        }
      } catch (_error) {
        if (user && sequence === cartMutationSeqRef.current) {
          const refreshed = await cartApi.get();
          applyServerCart(refreshed);
        }
      }
    },
    [applyServerCart, user],
  );

  const addToCart = useCallback(
    (product: Product, size: Size, quantity = 1) => {
      invalidateCartCoupon();

      if (user) {
        void syncAuthenticatedMutation(() =>
          cartApi.add({
            productId: product.id || product._id || "",
            quantity: clampQuantity(quantity, product.stock),
            size: size.size,
          }),
        );
        return;
      }

      const nextGuestCart = (() => {
        const current = [...guestCartRef.current];
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
      })();

      applyGuestCart(nextGuestCart);
    },
    [applyGuestCart, invalidateCartCoupon, syncAuthenticatedMutation, user],
  );

  const updateCartQuantity = useCallback(
    (key: string, quantity: number) => {
      invalidateCartCoupon();

      if (user) {
        const item = cart.find((candidate) => candidate.key === key);
        if (!item) return;

        void syncAuthenticatedMutation(() =>
          cartApi.update({
            itemId: item.id,
            productId: item.product.id || item.product._id || "",
            quantity: clampQuantity(quantity, item.product.stock),
            size: item.size.size,
          }),
        );
        return;
      }

      const nextGuestCart = guestCartRef.current.map((item) =>
        item.key === key
          ? { ...item, quantity: clampQuantity(quantity, item.product.stock) }
          : item,
      );

      applyGuestCart(nextGuestCart);
    },
    [applyGuestCart, cart, invalidateCartCoupon, syncAuthenticatedMutation, user],
  );

  const removeFromCart = useCallback(
    (key: string) => {
      invalidateCartCoupon();

      if (user) {
        const item = cart.find((candidate) => candidate.key === key);
        if (!item) return;

        void syncAuthenticatedMutation(() =>
          cartApi.remove({
            itemId: item.id,
            productId: item.product.id || item.product._id || "",
            size: item.size.size,
          }),
        );
        return;
      }

      applyGuestCart(guestCartRef.current.filter((item) => item.key !== key));
    },
    [applyGuestCart, cart, invalidateCartCoupon, syncAuthenticatedMutation, user],
  );

  const clearCart = useCallback(() => {
    clearCartCoupon();

    if (user) {
      void syncAuthenticatedMutation(() => cartApi.clear());
      return;
    }

    guestCartRef.current = [];
    clearGuestCart();
    applyGuestCart([]);
  }, [applyGuestCart, clearCartCoupon, syncAuthenticatedMutation, user]);

  const reloadCart = useCallback(async () => {
    if (user) {
      applyServerCart(await cartApi.get());
      return;
    }

    const nextGuestCart = readGuestCart();
    guestCartRef.current = nextGuestCart;
    applyGuestCart(nextGuestCart);
  }, [applyGuestCart, applyServerCart, user]);

  const openCheckout = useCallback(() => {
    setCheckoutOpen(true);
  }, []);

  const closeCheckout = useCallback(() => {
    setCheckoutOpen(false);
  }, []);

  const guestCartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const guestSubtotal = useMemo(
    () => addMoney(...cart.map((item) => multiplyMoney(item.size.price, item.quantity))),
    [cart, cartSummary.subtotal],
  );
  const cartCount = user ? cartSummary.totalItems : guestCartCount;
  const cartTotal = user ? cartSummary.subtotal : guestSubtotal;
  const cartDiscount = cartCoupon?.discount ?? 0;
  const cartFinalTotal = cartCoupon?.finalTotal ?? (user ? cartSummary.finalTotal : guestSubtotal);
  const cartCouponCode = cartCoupon?.code ?? "";
  const wishlistCount = wishlist.length;

  useEffect(() => uiActionObserver.setWishlistToggle(toggleWishlist), [toggleWishlist]);

  useEffect(() => {
    uiStateObserver.updateCart({
      count: cartCount,
      total: cartTotal,
    });
  }, [cartCount, cartTotal]);

  useEffect(() => {
    uiStateObserver.updateWishlist({
      ids: wishlist.map(getProductKey),
      pendingIds: Array.from(pendingWishlistIds),
    });
  }, [pendingWishlistIds, wishlist]);

  const value = useMemo(
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
      closeCheckout,
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
      wishlistCount,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
