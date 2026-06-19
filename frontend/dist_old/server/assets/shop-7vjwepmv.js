import { r as reactExports, j as jsxRuntimeExports, S as Search, L as SlidersHorizontal, N as Funnel, X } from "./vendor-react-98xxEzFV.js";
import { d as categoriesApi, e as createCatalogSlug, g as brandsApi, h as filterStorefrontCategories, i as filterBrandsByCategory, S as SiteShell, C as Container, j as CategoryRail, k as Skeleton, p as productsApi } from "./router-DvCKRw9U.js";
import { P as ProductCard } from "./ProductCard-BH3E7mti.js";
import "./vendor-tanstack-DkD25YnA.js";
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
const PAGE_SIZE = 12;
const sortOptions = [{
  label: "Featured",
  value: "featured"
}, {
  label: "Latest Arrivals",
  value: "latest"
}, {
  label: "Best Sellers",
  value: "bestseller"
}, {
  label: "Price Low to High",
  value: "price-low"
}, {
  label: "Price High to Low",
  value: "price-high"
}, {
  label: "Name A-Z",
  value: "name"
}];
const categoryToApi = (category) => {
  const normalizedCategory = createCatalogSlug(category);
  return !normalizedCategory || normalizedCategory === "all" ? void 0 : normalizedCategory;
};
const getInitialFilters = () => {
  if (typeof window === "undefined") {
    return {
      q: "",
      category: "all",
      brand: "",
      sort: "featured"
    };
  }
  const searchParams = new URLSearchParams(window.location.search);
  return {
    q: searchParams.get("q") || "",
    category: createCatalogSlug(searchParams.get("category") || "all") || "all",
    brand: searchParams.get("brand") || "",
    sort: searchParams.get("sort") || "featured"
  };
};
const syncFiltersToUrl = (filters) => {
  if (typeof window === "undefined") return;
  const searchParams = new URLSearchParams();
  if (filters.q.trim()) searchParams.set("q", filters.q.trim());
  if (filters.category !== "all") searchParams.set("category", filters.category);
  if (filters.brand) searchParams.set("brand", filters.brand);
  if (filters.sort !== "featured") searchParams.set("sort", filters.sort);
  const nextUrl = searchParams.toString() ? `/shop?${searchParams}` : "/shop";
  window.history.replaceState(null, "", nextUrl);
};
const getPrice = (product) => product.sizes[0]?.price ?? product.price ?? 0;
const sortProducts = (products, sort) => {
  const nextProducts = [...products];
  if (sort === "price-low") {
    return nextProducts.sort((a, b) => getPrice(a) - getPrice(b));
  }
  if (sort === "price-high") {
    return nextProducts.sort((a, b) => getPrice(b) - getPrice(a));
  }
  if (sort === "name") {
    return nextProducts.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sort === "latest") {
    return nextProducts.sort((a, b) => {
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }
  if (sort === "bestseller") {
    return nextProducts.sort((a, b) => {
      if (a.isBestseller !== b.isBestseller) return a.isBestseller ? -1 : 1;
      return (a.bestsellerOrder || 0) - (b.bestsellerOrder || 0);
    });
  }
  return nextProducts;
};
function ShopPage() {
  const [filters, setFilters] = reactExports.useState(getInitialFilters);
  const [products, setProducts] = reactExports.useState([]);
  const [brands, setBrands] = reactExports.useState([]);
  const [categories, setCategories] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [brandsLoading, setBrandsLoading] = reactExports.useState(true);
  const [categoriesLoading, setCategoriesLoading] = reactExports.useState(true);
  const [loadingMore, setLoadingMore] = reactExports.useState(false);
  const [page, setPage] = reactExports.useState(1);
  const [totalPages, setTotalPages] = reactExports.useState(1);
  const [totalProducts, setTotalProducts] = reactExports.useState(0);
  const [error, setError] = reactExports.useState("");
  reactExports.useEffect(() => {
    let active = true;
    categoriesApi.list().then((nextCategories) => {
      if (active) {
        setCategories(nextCategories);
      }
    }).catch(() => {
      if (active) setCategories([]);
    }).finally(() => {
      if (active) setCategoriesLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);
  reactExports.useEffect(() => {
    let active = true;
    const normalizedCategory = createCatalogSlug(filters.category) || "all";
    const brandCategory = categoryToApi(normalizedCategory);
    setBrandsLoading(true);
    brandsApi.list(brandCategory ? {
      category: brandCategory
    } : {}).then((nextBrands) => {
      if (active) {
        setBrands(nextBrands);
      }
    }).catch(() => {
      if (active) setBrands([]);
    }).finally(() => {
      if (active) setBrandsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [filters.category]);
  reactExports.useEffect(() => {
    const handlePopState = () => setFilters(getInitialFilters());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  reactExports.useEffect(() => {
    let active = true;
    const loadProducts = async () => {
      setLoading(true);
      setError("");
      syncFiltersToUrl(filters);
      try {
        const response = await productsApi.listPaginated({
          page: 1,
          limit: PAGE_SIZE,
          search: filters.q.trim() || void 0,
          category: categoryToApi(filters.category),
          brandId: filters.brand || void 0,
          sort: filters.sort
        });
        if (!active) return;
        setProducts(response.products);
        setPage(response.pagination.page);
        setTotalPages(response.pagination.pages);
        setTotalProducts(response.pagination.total);
      } catch (loadError) {
        if (!active) return;
        setProducts([]);
        setTotalProducts(0);
        setError(loadError instanceof Error ? loadError.message : "Products could not be loaded.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    void loadProducts();
    return () => {
      active = false;
    };
  }, [filters]);
  const displayedProducts = reactExports.useMemo(() => sortProducts(products, filters.sort), [filters.sort, products]);
  const storefrontCategories = reactExports.useMemo(() => filterStorefrontCategories(categories).map((category) => ({
    ...category,
    slug: category.slug || createCatalogSlug(category.name)
  })), [categories]);
  const activeCategory = storefrontCategories.find((category) => category.slug === filters.category);
  const availableBrands = reactExports.useMemo(() => filters.category === "all" ? [...brands].sort((left, right) => left.name.localeCompare(right.name)) : filterBrandsByCategory(brands, activeCategory || filters.category), [activeCategory, brands, filters.category]);
  const activeBrand = availableBrands.find((brand) => brand.id === filters.brand);
  const categoryOptions = reactExports.useMemo(() => [{
    label: "All Categories",
    value: "all"
  }, ...storefrontCategories.map((category) => ({
    label: category.name,
    value: category.slug
  }))], [storefrontCategories]);
  const activeCategoryLabel = categoryOptions.find((option) => option.value === filters.category)?.label || "All Categories";
  const hasActiveFilters = filters.q.trim() || filters.category !== "all" || filters.brand || filters.sort !== "featured";
  reactExports.useEffect(() => {
    if (!filters.brand || brandsLoading) return;
    const selectedBrandStillAvailable = availableBrands.some((brand) => brand.id === filters.brand);
    if (!selectedBrandStillAvailable) {
      setFilters((current) => current.brand ? {
        ...current,
        brand: ""
      } : current);
    }
  }, [availableBrands, brandsLoading, filters.brand]);
  const setFilter = (key, value) => {
    setFilters((current) => {
      if (key === "category") {
        return {
          ...current,
          category: createCatalogSlug(value) || "all",
          brand: ""
        };
      }
      return {
        ...current,
        [key]: value
      };
    });
  };
  const clearFilters = () => {
    setFilters({
      q: "",
      category: "all",
      brand: "",
      sort: "featured"
    });
  };
  const handleLoadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    setError("");
    try {
      const response = await productsApi.listPaginated({
        page: page + 1,
        limit: PAGE_SIZE,
        search: filters.q.trim() || void 0,
        category: categoryToApi(filters.category),
        brandId: filters.brand || void 0,
        sort: filters.sort
      });
      setProducts((currentProducts) => {
        const seen = new Set(currentProducts.map((product) => product.id));
        return [...currentProducts, ...response.products.filter((product) => {
          if (seen.has(product.id)) return false;
          seen.add(product.id);
          return true;
        })];
      });
      setPage(response.pagination.page);
      setTotalPages(response.pagination.pages);
      setTotalProducts(response.pagination.total);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load more products.");
    } finally {
      setLoadingMore(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SiteShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "bg-[#f7f3ed] py-6 md:py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-[var(--radius-panel)] border border-border/70 bg-[#fffaf4] shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        activeCategory?.image ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: activeCategory.image, alt: activeCategory.name, className: "h-48 w-full object-cover object-center sm:h-56" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-44 w-full bg-[linear-gradient(135deg,#f4ede2,#efe7dc)] sm:h-52" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-[#1e1b18]/78 via-[#1e1b18]/20 to-transparent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 bottom-0 p-4 text-[#fffaf4] sm:p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[0.65rem] uppercase tracking-[0.28em] text-[#e6c79c]", children: [
            "Home / Shop",
            activeCategory ? ` / ${activeCategory.name}` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 font-display text-3xl sm:text-4xl md:text-5xl", children: activeBrand?.name || (filters.category === "all" ? "All Fragrances" : activeCategoryLabel) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-2xl text-sm leading-7 text-[#fffaf4]/82", children: activeCategory?.description || "Browse a dynamically managed fragrance catalogue shaped by live categories, brands, and quick filters." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border/60 bg-[#f8f3ec] px-4 py-4 sm:px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryRail, { categories: storefrontCategories, activeSlug: filters.category === "all" ? "" : filters.category, allLabel: "All Fragrances", allHref: "/shop", hrefBuilder: (category) => `/shop?category=${category.slug || createCatalogSlug(category.name)}` }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-[7.3rem] z-20 mt-4 rounded-[1.35rem] border border-border/70 bg-[#fffaf4]/95 p-4 shadow-[0_16px_36px_rgba(91,58,41,0.12)] backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "relative block min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b6b56]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: filters.q, onChange: (event) => setFilter("q", event.target.value), placeholder: "Search fragrances", className: "min-h-11 w-full rounded-xl border border-border bg-[#f7f3ed] py-3 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-gold" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 rounded-xl border border-border bg-[#f7f3ed] px-4 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "h-4 w-4 text-[#c89b63]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: filters.sort, onChange: (event) => setFilter("sort", event.target.value), className: "min-h-8 bg-transparent text-sm text-foreground outline-none", children: sortOptions.map((sort) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: sort.value, children: sort.label }, sort.value)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: clearFilters, className: "min-h-11 rounded-xl border border-border bg-[#f7f3ed] px-4 text-xs uppercase tracking-[0.18em] text-[#5b3a29] transition hover:border-[#c89b63]", children: "Clear" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.18em] text-[#8b6b56]", children: loading ? "Loading products" : `${totalProducts || products.length} products` })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-6 xl:grid-cols-[17rem_minmax(0,1fr)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "hidden min-w-0 xl:block xl:sticky xl:top-[13rem] xl:h-fit", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[var(--radius-panel)] border border-border bg-[#fffaf4] p-4 shadow-soft", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "fluid-eyebrow flex items-center gap-2 uppercase text-[#8b5f3d]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "h-4 w-4" }),
            "Filter"
          ] }),
          hasActiveFilters ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: clearFilters, className: "touch-target inline-flex items-center gap-1 text-[0.72rem] uppercase tracking-[0.18em] text-[#8b6b56] hover:text-[#c89b63]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }),
            "Clear"
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-eyebrow uppercase text-[#8b5f3d]", children: "Categories" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-2", children: [
              categoryOptions.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setFilter("category", category.value), className: `touch-target block w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${filters.category === category.value ? "bg-[#f7f0e5] text-[#c89b63]" : "text-[#5b3a29]/75 hover:bg-[#f7f0e5] hover:text-[#c89b63]"}`, children: category.label }, category.value)),
              !categoriesLoading && categories.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-3 py-2.5 text-sm text-[#8b6b56]", children: "No categories available yet." }) : null
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-eyebrow uppercase text-[#8b5f3d]", children: "Brands" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 max-h-72 space-y-2 overflow-y-auto pr-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setFilter("brand", ""), className: `touch-target block w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${!filters.brand ? "bg-[#f7f0e5] text-[#c89b63]" : "text-[#5b3a29]/75 hover:bg-[#f7f0e5] hover:text-[#c89b63]"}`, children: "All Brands" }),
              brandsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: Array.from({
                length: 6
              }).map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }, index)) }) : availableBrands.map((brand) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setFilter("brand", brand.id), className: `touch-target block w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${filters.brand === brand.id ? "bg-[#f7f0e5] text-[#c89b63]" : "text-[#5b3a29]/75 hover:bg-[#f7f0e5] hover:text-[#c89b63]"}`, children: brand.name }, brand.id))
            ] })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#8b6b56]", children: loading ? "Loading fragrances" : `${totalProducts || products.length} fragrances` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: hasActiveFilters ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            filters.category !== "all" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-[#f7f0e5] px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#8b5f3d]", children: activeCategoryLabel }) : null,
            activeBrand ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-[#f7f0e5] px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#8b5f3d]", children: activeBrand.name }) : null
          ] }) : null })
        ] }),
        error ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-700", children: error }) : null,
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "product-grid mt-6", children: Array.from({
          length: 6
        }).map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "aspect-[4/5] rounded-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "mx-auto h-3 w-24" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "mx-auto h-5 w-40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "mx-auto h-3 w-28" })
        ] }, index)) }) : null,
        !loading && !error && displayedProducts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 border border-dashed border-border bg-[#fffaf4] px-6 py-12 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-3xl text-foreground", children: "No fragrances found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-3 max-w-md text-sm leading-7 text-[#8b6b56]", children: "Products added from the admin panel will appear here automatically when they match your filters." })
        ] }) : null,
        !loading && !error && displayedProducts.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "product-grid mt-6", children: displayedProducts.map((product, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { product, showSize: true, imageLoading: index < 8 ? "eager" : "lazy", imageFetchPriority: index < 8 ? "high" : "auto" }, product.id)) }),
          page < totalPages ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleLoadMore, disabled: loadingMore, className: "min-h-11 rounded-full border border-[#8b5f3d] px-6 text-[0.72rem] uppercase tracking-[0.24em] text-[#5b3a29] transition hover:bg-[#8b5f3d] hover:text-[#fffaf4] disabled:opacity-50", children: loadingMore ? "Loading..." : "Load More" }) }) : null
        ] }) : null
      ] })
    ] })
  ] }) }) });
}
export {
  ShopPage as component
};
