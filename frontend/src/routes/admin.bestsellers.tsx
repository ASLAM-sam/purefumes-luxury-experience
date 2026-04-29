import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw, Search, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useNotification } from "@/context/NotificationContext";
import type { Product } from "@/data/products";
import {
  BESTSELLERS_CHANGED_EVENT,
  DATA_EVENT_STORAGE_KEY,
  PRODUCTS_CHANGED_EVENT,
  productsApi,
} from "@/services/api";

export const Route = createFileRoute("/admin/bestsellers")({
  component: AdminBestsellers,
});

type CategoryFilter = "all" | Product["category"];

const productCategories: Product["category"][] = ["Middle Eastern", "Designer", "Niche"];

const controlCls =
  "w-full rounded-lg border border-border bg-beige/35 px-4 py-3 text-sm text-navy outline-none transition focus:border-navy";

const getProductPrice = (product: Product) => product.price ?? product.sizes[0]?.price ?? 0;

const compareBestsellers = (left: Product, right: Product) => {
  const orderDelta = (left.bestsellerOrder ?? 0) - (right.bestsellerOrder ?? 0);
  if (orderDelta !== 0) return orderDelta;

  return left.name.localeCompare(right.name);
};

type LoadOptions = {
  silent?: boolean;
  forceFresh?: boolean;
  notifyOnError?: boolean;
};

function AdminBestsellers() {
  const { addNotification } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [orderDrafts, setOrderDrafts] = useState<Record<string, string>>({});

  const syncOrderDrafts = useCallback((catalog: Product[]) => {
    const nextDrafts: Record<string, string> = {};

    catalog
      .filter((product) => product.isBestseller)
      .sort(compareBestsellers)
      .forEach((product) => {
        nextDrafts[product.id] = String(product.bestsellerOrder ?? 0);
      });

    setOrderDrafts(nextDrafts);
  }, []);

  const load = useCallback(
    async ({ silent = false, forceFresh = false, notifyOnError = silent } = {} as LoadOptions) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        if (import.meta.env.DEV && forceFresh) {
          console.debug("[AdminBestsellers] Fetching fresh catalog...");
        }

        const nextProducts = await productsApi.list({}, { forceFresh });
        setProducts(nextProducts);
        syncOrderDrafts(nextProducts);
      } catch (ex) {
        const message = ex instanceof Error ? ex.message : "Products could not be loaded.";

        if (notifyOnError) {
          addNotification(message, "error");
        }

        if (!silent) {
          setError(message);
          setProducts([]);
          syncOrderDrafts([]);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [addNotification, syncOrderDrafts],
  );

  useEffect(() => {
    void load({ forceFresh: true });
  }, [load]);

  useEffect(() => {
    const refreshFromSignals = () => {
      void load({ silent: true, forceFresh: true });
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== DATA_EVENT_STORAGE_KEY || !event.newValue) {
        return;
      }

      try {
        const payload = JSON.parse(event.newValue) as { name?: string };

        if (
          payload.name === BESTSELLERS_CHANGED_EVENT ||
          payload.name === PRODUCTS_CHANGED_EVENT
        ) {
          refreshFromSignals();
        }
      } catch (_error) {
        // Ignore malformed storage events from older sessions.
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshFromSignals();
      }
    };

    const intervalId = window.setInterval(refreshFromSignals, 5000);

    window.addEventListener(BESTSELLERS_CHANGED_EVENT, refreshFromSignals);
    window.addEventListener(PRODUCTS_CHANGED_EVENT, refreshFromSignals);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refreshFromSignals);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(BESTSELLERS_CHANGED_EVENT, refreshFromSignals);
      window.removeEventListener(PRODUCTS_CHANGED_EVENT, refreshFromSignals);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refreshFromSignals);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [load]);

  const bestsellers = useMemo(
    () => products.filter((product) => product.isBestseller).sort(compareBestsellers),
    [products],
  );

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...products]
      .filter((product) => {
        if (categoryFilter !== "all" && product.category !== categoryFilter) {
          return false;
        }

        if (!query) {
          return true;
        }

        return [product.name, product.brand, product.category]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [categoryFilter, products, search]);

  const nextDisplayOrder = useMemo(() => {
    if (!bestsellers.length) {
      return 1;
    }

    return Math.max(...bestsellers.map((product) => product.bestsellerOrder ?? 0)) + 1;
  }, [bestsellers]);

  const toggleBestseller = useCallback(
    async (product: Product, nextValue: boolean) => {
      setUpdatingId(product.id);

      try {
        await productsApi.updateBestseller(product.id, { isBestseller: nextValue });
        addNotification(
          nextValue
            ? `${product.name} added to Bestsellers.`
            : `${product.name} removed from Bestsellers.`,
        );
        await load({ silent: true, forceFresh: true, notifyOnError: true });
      } catch (ex) {
        addNotification(
          ex instanceof Error ? ex.message : "Bestseller status could not be updated.",
          "error",
        );
      } finally {
        setUpdatingId(null);
      }
    },
    [addNotification, load],
  );

  const saveOrder = useCallback(
    async (product: Product) => {
      const rawValue = orderDrafts[product.id] ?? String(product.bestsellerOrder ?? 0);
      const nextOrder = Number(rawValue);

      if (!Number.isInteger(nextOrder) || nextOrder < 0) {
        addNotification("Display order must be a non-negative whole number.", "error");
        return;
      }

      setSavingOrderId(product.id);

      try {
        await productsApi.updateBestseller(product.id, {
          isBestseller: true,
          bestsellerOrder: nextOrder,
        });
        addNotification(`Display order updated for ${product.name}.`);
        await load({ silent: true, forceFresh: true, notifyOnError: true });
      } catch (ex) {
        addNotification(
          ex instanceof Error ? ex.message : "Display order could not be updated.",
          "error",
        );
      } finally {
        setSavingOrderId(null);
      }
    },
    [addNotification, load, orderDrafts],
  );

  const handleRefresh = useCallback(async () => {
    await load({ silent: true, forceFresh: true, notifyOnError: true });
  }, [load]);

  return (
    <AdminShell>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.65rem] tracking-[0.4em] uppercase text-navy/50">Homepage</p>
          <h1 className="mt-1 font-display text-4xl text-navy">Bestsellers</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-navy/60">
            Curate which existing products appear in the homepage Bestsellers section. Lower
            display-order numbers appear first.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-navy px-4 py-2.5 text-xs uppercase tracking-[0.22em] text-navy transition hover:bg-navy hover:text-beige disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
          <p className="text-xs uppercase tracking-[0.18em] text-navy/50">Live on Homepage</p>
          <p className="mt-2 font-display text-4xl text-navy">{bestsellers.length}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
          <p className="text-xs uppercase tracking-[0.18em] text-navy/50">Catalog Products</p>
          <p className="mt-2 font-display text-4xl text-navy">{products.length}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
          <p className="text-xs uppercase tracking-[0.18em] text-navy/50">Next Display Order</p>
          <p className="mt-2 font-display text-4xl text-navy">{nextDisplayOrder}</p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_auto]">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-navy/55">Search</span>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by product, brand, or category"
                className={`${controlCls} pl-11`}
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-navy/55">Category</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
              className={`${controlCls} mt-2`}
            >
              <option value="all">All Categories</option>
              {productCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <div className="w-full rounded-xl border border-border bg-beige/30 px-4 py-3 text-sm text-navy/70 lg:w-auto">
              Showing <span className="font-medium text-navy">{visibleProducts.length}</span>{" "}
              products
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-border/60 bg-card shadow-soft">
        <div className="flex items-center gap-3 border-b border-border/70 px-6 py-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-gold">
            <Star className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-2xl text-navy">Current Bestsellers</h2>
            <p className="text-sm text-navy/55">These products feed the homepage section.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-beige/50 text-xs uppercase tracking-[0.2em] text-navy/70">
              <tr>
                <th className="px-6 py-4 text-left">Product</th>
                <th className="px-6 py-4 text-left">Brand</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-left">Display Order</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-navy/50">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && bestsellers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-navy/50">
                    No bestsellers selected yet.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                bestsellers.map((product) => {
                  const price = getProductPrice(product);
                  const orderValue = orderDrafts[product.id] ?? String(product.bestsellerOrder ?? 0);
                  const orderChanged = Number(orderValue) !== (product.bestsellerOrder ?? 0);

                  return (
                    <tr key={product.id} className="align-top transition-colors hover:bg-beige/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              loading="lazy"
                              decoding="async"
                              className="h-12 w-12 rounded-lg bg-beige object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg border border-border bg-beige" />
                          )}
                          <div>
                            <p className="font-medium text-navy">{product.name}</p>
                            <p className="text-xs text-navy/50">
                              ID: {product.id.slice(-6).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-navy/70">{product.brand}</td>
                      <td className="px-6 py-4 text-navy/70">{product.category}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            value={orderValue}
                            onChange={(event) =>
                              setOrderDrafts((current) => ({
                                ...current,
                                [product.id]: event.target.value,
                              }))
                            }
                            className="w-24 rounded-lg border border-border bg-beige/35 px-3 py-2 text-sm text-navy outline-none transition focus:border-navy"
                          />
                          <button
                            type="button"
                            onClick={() => saveOrder(product)}
                            disabled={!orderChanged || savingOrderId === product.id}
                            className="rounded-lg border border-border bg-card px-3 py-2 text-xs uppercase tracking-[0.18em] text-navy transition hover:bg-beige/40 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {savingOrderId === product.id ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gold">
                        Rs. {price.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => toggleBestseller(product, false)}
                            disabled={updatingId === product.id}
                            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs uppercase tracking-[0.18em] text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {updatingId === product.id ? "Updating..." : "Remove"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-border/60 bg-card shadow-soft">
        <div className="border-b border-border/70 px-6 py-5">
          <h2 className="font-display text-2xl text-navy">Catalog Search</h2>
          <p className="mt-2 text-sm text-navy/55">
            Add or remove existing products without creating duplicates.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-beige/50 text-xs uppercase tracking-[0.2em] text-navy/70">
              <tr>
                <th className="px-6 py-4 text-left">Product</th>
                <th className="px-6 py-4 text-left">Brand</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-navy/50">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && visibleProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-navy/50">
                    No products match the current search.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                visibleProducts.map((product) => {
                  const price = getProductPrice(product);

                  return (
                    <tr key={product.id} className="align-top transition-colors hover:bg-beige/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              loading="lazy"
                              decoding="async"
                              className="h-12 w-12 rounded-lg bg-beige object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg border border-border bg-beige" />
                          )}
                          <span className="font-medium text-navy">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-navy/70">{product.brand}</td>
                      <td className="px-6 py-4 text-navy/70">{product.category}</td>
                      <td className="px-6 py-4 text-right font-medium text-gold">
                        Rs. {price.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] ${
                            product.isBestseller
                              ? "bg-gold/15 text-navy"
                              : "bg-beige/70 text-navy/60"
                          }`}
                        >
                          {product.isBestseller ? "Live on homepage" : "Available"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => toggleBestseller(product, !product.isBestseller)}
                            disabled={updatingId === product.id}
                            className={`rounded-lg px-4 py-2 text-xs uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              product.isBestseller
                                ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                : "border border-navy bg-navy text-beige hover:opacity-90"
                            }`}
                          >
                            {updatingId === product.id
                              ? "Updating..."
                              : product.isBestseller
                                ? "Remove"
                                : "Add"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
