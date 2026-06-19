import { r as reactExports, j as jsxRuntimeExports, V as RefreshCw, S as Search, a7 as Star } from "./vendor-react-98xxEzFV.js";
import { L as Link } from "./vendor-tanstack-DkD25YnA.js";
import { A as AdminShell } from "./AdminShell-P9dOFq5Y.js";
import { a as useNotification, p as productsApi, d as categoriesApi, F as BESTSELLERS_CHANGED_EVENT, Z as PRODUCTS_CHANGED_EVENT, f as formatINR, z as DATA_EVENT_STORAGE_KEY } from "./router-DvCKRw9U.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "util";
import "stream";
import "path";
import "http";
import "https";
import "url";
import "fs";
import "crypto";
import "assert";
import "./worker-entry-8w9vAzi1.js";
import "node:events";
import "os";
import "zlib";
import "events";
import "./vendor-motion-3kNaalGV.js";
import "./vendor-charts-Ot63D9Dz.js";
const controlCls = "w-full rounded-lg border border-border bg-beige/35 px-4 py-3 text-sm text-navy outline-none transition focus:border-navy";
const getProductPrice = (product) => product.price ?? product.sizes[0]?.price ?? 0;
const compareBestsellers = (left, right) => {
  const orderDelta = (left.bestsellerOrder ?? 0) - (right.bestsellerOrder ?? 0);
  if (orderDelta !== 0) return orderDelta;
  return left.name.localeCompare(right.name);
};
function AdminBestsellers() {
  const {
    addNotification
  } = useNotification();
  const [products, setProducts] = reactExports.useState([]);
  const [categories, setCategories] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [refreshing, setRefreshing] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [search, setSearch] = reactExports.useState("");
  const [categoryFilter, setCategoryFilter] = reactExports.useState("all");
  const [updatingId, setUpdatingId] = reactExports.useState(null);
  const [savingOrderId, setSavingOrderId] = reactExports.useState(null);
  const [orderDrafts, setOrderDrafts] = reactExports.useState({});
  const syncOrderDrafts = reactExports.useCallback((catalog) => {
    const nextDrafts = {};
    catalog.filter((product) => product.isBestseller).sort(compareBestsellers).forEach((product) => {
      nextDrafts[product.id] = String(product.bestsellerOrder ?? 0);
    });
    setOrderDrafts(nextDrafts);
  }, []);
  const load = reactExports.useCallback(async ({
    silent = false,
    forceFresh = false,
    notifyOnError = silent
  } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");
    try {
      if (false) ;
      const nextProducts = await productsApi.list({}, {
        forceFresh
      });
      const nextCategories = await categoriesApi.listAdmin();
      setProducts(nextProducts);
      setCategories(nextCategories);
      syncOrderDrafts(nextProducts);
    } catch (ex) {
      const message = ex instanceof Error ? ex.message : "Products could not be loaded.";
      if (notifyOnError) {
        addNotification(message, "error");
      }
      if (!silent) {
        setError(message);
        setProducts([]);
        setCategories([]);
        syncOrderDrafts([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addNotification, syncOrderDrafts]);
  reactExports.useEffect(() => {
    void load({
      forceFresh: true
    });
  }, [load]);
  reactExports.useEffect(() => {
    const refreshFromSignals = () => {
      void load({
        silent: true,
        forceFresh: true
      });
    };
    const handleStorage = (event) => {
      if (event.key !== DATA_EVENT_STORAGE_KEY || !event.newValue) {
        return;
      }
      try {
        const payload = JSON.parse(event.newValue);
        if (payload.name === BESTSELLERS_CHANGED_EVENT || payload.name === PRODUCTS_CHANGED_EVENT) {
          refreshFromSignals();
        }
      } catch (_error) {
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshFromSignals();
      }
    };
    const intervalId = window.setInterval(refreshFromSignals, 5e3);
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
  const bestsellers = reactExports.useMemo(() => products.filter((product) => product.isBestseller).sort(compareBestsellers), [products]);
  const visibleProducts = reactExports.useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...products].filter((product) => {
      if (categoryFilter !== "all" && product.category !== categoryFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [product.name, product.brand, product.category].filter(Boolean).some((value) => value.toLowerCase().includes(query));
    }).sort((left, right) => left.name.localeCompare(right.name));
  }, [categoryFilter, products, search]);
  const nextDisplayOrder = reactExports.useMemo(() => {
    if (!bestsellers.length) {
      return 1;
    }
    return Math.max(...bestsellers.map((product) => product.bestsellerOrder ?? 0)) + 1;
  }, [bestsellers]);
  const toggleBestseller = reactExports.useCallback(async (product, nextValue) => {
    setUpdatingId(product.id);
    try {
      await productsApi.updateBestseller(product.id, {
        isBestseller: nextValue
      });
      addNotification(nextValue ? `${product.name} added to Bestsellers.` : `${product.name} removed from Bestsellers.`);
      await load({
        silent: true,
        forceFresh: true,
        notifyOnError: true
      });
    } catch (ex) {
      addNotification(ex instanceof Error ? ex.message : "Bestseller status could not be updated.", "error");
    } finally {
      setUpdatingId(null);
    }
  }, [addNotification, load]);
  const saveOrder = reactExports.useCallback(async (product) => {
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
        bestsellerOrder: nextOrder
      });
      addNotification(`Display order updated for ${product.name}.`);
      await load({
        silent: true,
        forceFresh: true,
        notifyOnError: true
      });
    } catch (ex) {
      addNotification(ex instanceof Error ? ex.message : "Display order could not be updated.", "error");
    } finally {
      setSavingOrderId(null);
    }
  }, [addNotification, load, orderDrafts]);
  const handleRefresh = reactExports.useCallback(async () => {
    await load({
      silent: true,
      forceFresh: true,
      notifyOnError: true
    });
  }, [load]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] tracking-[0.4em] uppercase text-navy/50", children: "Homepage" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 font-display text-4xl text-navy", children: "Bestsellers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-2xl text-sm leading-7 text-navy/60", children: "Curate which existing products appear in the homepage Bestsellers section. Lower display-order numbers appear first." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleRefresh, disabled: refreshing, className: "inline-flex items-center gap-2 rounded-lg border border-navy px-4 py-2.5 text-xs uppercase tracking-[0.22em] text-navy transition hover:bg-navy hover:text-beige disabled:opacity-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-4 w-4 ${refreshing ? "animate-spin" : ""}` }),
        "Refresh"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-8 grid gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/70 bg-card p-5 shadow-soft", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.18em] text-navy/50", children: "Live on Homepage" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-4xl text-navy", children: bestsellers.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/70 bg-card p-5 shadow-soft", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.18em] text-navy/50", children: "Catalog Products" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-4xl text-navy", children: products.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/70 bg-card p-5 shadow-soft", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.18em] text-navy/50", children: "Next Display Order" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-4xl text-navy", children: nextDisplayOrder })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-6 rounded-2xl border border-border/70 bg-card p-5 shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_auto]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.18em] text-navy/55", children: "Search" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: search, onChange: (event) => setSearch(event.target.value), placeholder: "Search by product, brand, or category", className: `${controlCls} pl-11` })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.18em] text-navy/55", children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: categoryFilter, onChange: (event) => setCategoryFilter(event.target.value), className: `${controlCls} mt-2`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Categories" }),
          categories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: category.name, children: category.name }, category.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full rounded-xl border border-border bg-beige/30 px-4 py-3 text-sm text-navy/70 lg:w-auto", children: [
        "Showing ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-navy", children: visibleProducts.length }),
        " ",
        "products"
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-8 rounded-2xl border border-border/60 bg-card shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 border-b border-border/70 px-6 py-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-navy text-gold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl text-navy", children: "Current Bestsellers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-navy/55", children: "These products feed the homepage section." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-beige/50 text-xs uppercase tracking-[0.2em] text-navy/70", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Brand" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Display Order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Price" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
          loading && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-6 py-10 text-center text-navy/50", children: "Loading..." }) }),
          !loading && error && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-6 py-10 text-center text-red-600", children: error }) }),
          !loading && !error && bestsellers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-6 py-10 text-center text-navy/50", children: "No bestsellers selected yet." }) }),
          !loading && !error && bestsellers.map((product) => {
            const price = getProductPrice(product);
            const orderValue = orderDrafts[product.id] ?? String(product.bestsellerOrder ?? 0);
            const orderChanged = Number(orderValue) !== (product.bestsellerOrder ?? 0);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "align-top transition-colors hover:bg-beige/30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                product.image ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "product-fit-frame h-12 w-12 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: product.image, alt: product.name, loading: "lazy", decoding: "async", className: "product-fit-image" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-lg border border-border bg-beige" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-navy", children: product.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-navy/50", children: [
                    "ID: ",
                    product.id.slice(-6).toUpperCase()
                  ] })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-navy/70", children: product.brand }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-navy/70", children: product.category }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 0, value: orderValue, onChange: (event) => setOrderDrafts((current) => ({
                  ...current,
                  [product.id]: event.target.value
                })), className: "w-24 rounded-lg border border-border bg-beige/35 px-3 py-2 text-sm text-navy outline-none transition focus:border-navy" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => saveOrder(product), disabled: !orderChanged || savingOrderId === product.id, className: "rounded-lg border border-border bg-card px-3 py-2 text-xs uppercase tracking-[0.18em] text-navy transition hover:bg-beige/40 disabled:cursor-not-allowed disabled:opacity-50", children: savingOrderId === product.id ? "Saving..." : "Save" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right font-medium text-gold", children: formatINR(price) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/product/$id", params: {
                  id: product.id
                }, className: "rounded-lg border border-border bg-card px-4 py-2 text-xs uppercase tracking-[0.18em] text-navy transition hover:bg-beige/40", children: "Preview" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => toggleBestseller(product, false), disabled: updatingId === product.id, className: "rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs uppercase tracking-[0.18em] text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50", children: updatingId === product.id ? "Updating..." : "Remove" })
              ] }) })
            ] }, product.id);
          })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-8 rounded-2xl border border-border/60 bg-card shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border/70 px-6 py-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl text-navy", children: "Catalog Search" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-navy/55", children: "Add or remove existing products without creating duplicates." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-beige/50 text-xs uppercase tracking-[0.2em] text-navy/70", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Brand" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Price" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Action" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
          loading && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-6 py-10 text-center text-navy/50", children: "Loading..." }) }),
          !loading && error && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-6 py-10 text-center text-red-600", children: error }) }),
          !loading && !error && visibleProducts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-6 py-10 text-center text-navy/50", children: "No products match the current search." }) }),
          !loading && !error && visibleProducts.map((product) => {
            const price = getProductPrice(product);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "align-top transition-colors hover:bg-beige/30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                product.image ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "product-fit-frame h-12 w-12 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: product.image, alt: product.name, loading: "lazy", decoding: "async", className: "product-fit-image" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-lg border border-border bg-beige" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-navy", children: product.name })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-navy/70", children: product.brand }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-navy/70", children: product.category }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right font-medium text-gold", children: formatINR(price) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] ${product.isBestseller ? "bg-gold/15 text-navy" : "bg-beige/70 text-navy/60"}`, children: product.isBestseller ? "Live on homepage" : "Available" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => toggleBestseller(product, !product.isBestseller), disabled: updatingId === product.id, className: `rounded-lg px-4 py-2 text-xs uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-50 ${product.isBestseller ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100" : "border border-navy bg-navy text-beige hover:opacity-90"}`, children: updatingId === product.id ? "Updating..." : product.isBestseller ? "Remove" : "Add" }) }) })
            ] }, product.id);
          })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  AdminBestsellers as component
};
