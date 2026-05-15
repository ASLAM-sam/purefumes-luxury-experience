import { useMemo, useSyncExternalStore } from "react";
import type { Product } from "@/data/products";
import { frontendEventBus } from "@/lib/performance/event-bus";

type UiStateSnapshot = {
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  wishlistIds: ReadonlySet<string>;
  pendingWishlistIds: ReadonlySet<string>;
  userId: string | null;
  authReady: boolean;
  isAuthenticated: boolean;
};

type CartUpdate = {
  count: number;
  total: number;
};

type WishlistUpdate = {
  ids: Iterable<string>;
  pendingIds?: Iterable<string>;
};

type AuthUpdate = {
  userId: string | null;
  authReady: boolean;
  isAuthenticated: boolean;
};

const emptySet = new Set<string>();
const listeners = new Set<() => void>();
let wishlistToggleAction: ((product: Product) => boolean) | null = null;

let snapshot: UiStateSnapshot = {
  cartCount: 0,
  cartTotal: 0,
  wishlistCount: 0,
  wishlistIds: emptySet,
  pendingWishlistIds: emptySet,
  userId: null,
  authReady: false,
  isAuthenticated: false,
};

const normalizeIds = (ids: Iterable<string> | undefined) =>
  new Set(
    Array.from(ids || [])
      .map((id) => String(id || "").trim())
      .filter(Boolean),
  );

const setsEqual = (left: ReadonlySet<string>, right: ReadonlySet<string>) => {
  if (left.size !== right.size) return false;

  for (const value of left) {
    if (!right.has(value)) return false;
  }

  return true;
};

const emit = () => {
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => snapshot;

export const uiStateObserver = {
  subscribe,
  getSnapshot,

  updateCart(update: CartUpdate) {
    const nextCount = Math.max(0, Math.trunc(Number(update.count) || 0));
    const nextTotal = Math.max(0, Number(update.total) || 0);

    if (snapshot.cartCount === nextCount && snapshot.cartTotal === nextTotal) {
      return;
    }

    snapshot = {
      ...snapshot,
      cartCount: nextCount,
      cartTotal: nextTotal,
    };
    emit();
    frontendEventBus.publish("cart:changed", {
      count: nextCount,
      total: nextTotal,
    });
  },

  updateWishlist(update: WishlistUpdate) {
    const nextIds = normalizeIds(update.ids);
    const nextPendingIds = update.pendingIds
      ? normalizeIds(update.pendingIds)
      : snapshot.pendingWishlistIds;

    if (
      setsEqual(snapshot.wishlistIds, nextIds) &&
      setsEqual(snapshot.pendingWishlistIds, nextPendingIds)
    ) {
      return;
    }

    snapshot = {
      ...snapshot,
      wishlistCount: nextIds.size,
      wishlistIds: nextIds,
      pendingWishlistIds: nextPendingIds,
    };
    emit();
    frontendEventBus.publish("wishlist:changed", {
      count: nextIds.size,
      ids: Array.from(nextIds),
    });
  },

  updatePendingWishlist(productId: string, pending: boolean) {
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
      pendingWishlistIds: nextPendingIds,
    };
    emit();
  },

  updateAuth(update: AuthUpdate) {
    if (
      snapshot.userId === update.userId &&
      snapshot.authReady === update.authReady &&
      snapshot.isAuthenticated === update.isAuthenticated
    ) {
      return;
    }

    snapshot = {
      ...snapshot,
      userId: update.userId,
      authReady: update.authReady,
      isAuthenticated: update.isAuthenticated,
    };
    emit();
    frontendEventBus.publish("auth:changed", {
      userId: update.userId,
      isAuthenticated: update.isAuthenticated,
      ready: update.authReady,
    });
  },
};

export const uiActionObserver = {
  setWishlistToggle(action: ((product: Product) => boolean) | null) {
    wishlistToggleAction = action;

    return () => {
      if (wishlistToggleAction === action) {
        wishlistToggleAction = null;
      }
    };
  },

  toggleWishlist(product: Product) {
    return wishlistToggleAction?.(product) ?? false;
  },
};

export function useNavbarCounters() {
  const cartCount = useSyncExternalStore(subscribe, () => snapshot.cartCount, () => 0);
  const wishlistCount = useSyncExternalStore(subscribe, () => snapshot.wishlistCount, () => 0);

  return useMemo(
    () => ({
      cartCount,
      wishlistCount,
    }),
    [cartCount, wishlistCount],
  );
}

export function useWishlistStatus(productId?: string | null) {
  const normalizedId = String(productId || "").trim();
  const active = useSyncExternalStore(
    subscribe,
    () => Boolean(normalizedId && snapshot.wishlistIds.has(normalizedId)),
    () => false,
  );
  const pending = useSyncExternalStore(
    subscribe,
    () => Boolean(normalizedId && snapshot.pendingWishlistIds.has(normalizedId)),
    () => false,
  );

  return useMemo(
    () => ({
      active,
      pending,
    }),
    [active, pending],
  );
}

export function useAuthSnapshot() {
  const userId = useSyncExternalStore(subscribe, () => snapshot.userId, () => null);
  const authReady = useSyncExternalStore(subscribe, () => snapshot.authReady, () => false);
  const isAuthenticated = useSyncExternalStore(
    subscribe,
    () => snapshot.isAuthenticated,
    () => false,
  );

  return useMemo(
    () => ({
      userId,
      authReady,
      isAuthenticated,
    }),
    [authReady, isAuthenticated, userId],
  );
}
