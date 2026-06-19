import { r as reactExports, j as jsxRuntimeExports } from "./vendor-react-98xxEzFV.js";
import { Q as Route, S as SiteShell, C as Container, j as CategoryRail, B as Button, d as categoriesApi, p as productsApi, T as isGenderCategory, h as filterStorefrontCategories } from "./router-DvCKRw9U.js";
import { S as SectionTitle } from "./SectionTitle-CUOodH3k.js";
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
function CategoryPage() {
  const {
    slug
  } = Route.useParams();
  const [category, setCategory] = reactExports.useState(null);
  const [categories, setCategories] = reactExports.useState([]);
  const [products, setProducts] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [isLoadingMore, setIsLoadingMore] = reactExports.useState(false);
  const [page, setPage] = reactExports.useState(1);
  const [totalPages, setTotalPages] = reactExports.useState(1);
  const [error, setError] = reactExports.useState("");
  reactExports.useEffect(() => {
    let isActive = true;
    const loadCategory = async () => {
      setIsLoading(true);
      setError("");
      setPage(1);
      setTotalPages(1);
      try {
        const [categoryResponse, productsResponse, categoriesResponse] = await Promise.all([categoriesApi.getBySlug(slug), productsApi.listPaginated({
          category: slug,
          page: 1,
          limit: PAGE_SIZE
        }), categoriesApi.list()]);
        if (!isActive) return;
        if (isGenderCategory(categoryResponse)) {
          setCategory(null);
          setCategories(filterStorefrontCategories(categoriesResponse));
          setProducts([]);
          setError("This collection is no longer available.");
          return;
        }
        setCategory(categoryResponse);
        setCategories(filterStorefrontCategories(categoriesResponse));
        setProducts(productsResponse.products);
        setPage(productsResponse.pagination.page);
        setTotalPages(productsResponse.pagination.pages);
      } catch (err) {
        if (!isActive) return;
        setCategory(null);
        setCategories([]);
        setProducts([]);
        setError(err instanceof Error ? err.message : "Could not load this category.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };
    void loadCategory();
    return () => {
      isActive = false;
    };
  }, [slug]);
  const handleLoadMore = async () => {
    if (isLoadingMore || page >= totalPages) return;
    setIsLoadingMore(true);
    try {
      const response = await productsApi.listPaginated({
        category: slug,
        page: page + 1,
        limit: PAGE_SIZE
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load more products.");
    } finally {
      setIsLoadingMore(false);
    }
  };
  const subtitle = isLoading ? "Loading fragrances from the collection." : category ? `${category.productCount} fragrances currently flow through this category.` : "Category details could not be loaded.";
  const heroImage = category?.image || "";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SiteShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-[var(--section-space)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { children: [
    heroImage ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-[var(--radius-panel)] border border-border/70 bg-[#efe7dc] shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: heroImage, alt: category?.name || "Category", className: "h-[clamp(15rem,36vw,24rem)] w-full object-cover object-center" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-[#1e1b18]/72 via-[#1e1b18]/18 to-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 bottom-0 p-6 text-white sm:p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-eyebrow uppercase text-[#e6c79c]", children: "Home / Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 font-display text-[clamp(2rem,4vw,4rem)]", children: category?.name || "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-2xl text-sm leading-7 text-white/82", children: category?.description || subtitle })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { eyebrow: "Category", title: category?.name || "Category", subtitle }),
    categories.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 rounded-[1.25rem] border border-border/70 bg-[#fffaf4] px-4 py-4 shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryRail, { categories, activeSlug: slug, allLabel: "Shop All", allHref: "/shop" }) }) : null,
    error ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mt-10 max-w-xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-700", children: error }) : null,
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "product-grid mt-16", children: Array.from({
      length: 3
    }).map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-pulse space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square bg-[#f1ece6]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-3/4 bg-[#eee7de]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-1/2 bg-[#eee7de]" })
    ] }, index)) }) : null,
    !isLoading && !error && products.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto mt-16 max-w-xl text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-2xl text-ink", children: "No fragrances found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-sm leading-6 text-muted", children: [
        "Products added under ",
        category?.name || "this category",
        " will appear here automatically."
      ] })
    ] }) : null,
    !isLoading && !error && products.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "product-grid mt-16", children: products.map((product, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { product, imageLoading: index < 8 ? "eager" : "lazy", imageFetchPriority: index < 8 ? "high" : "auto" }, product.id)) }),
      page < totalPages ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: handleLoadMore, disabled: isLoadingMore, className: "w-full max-w-xs rounded-full sm:w-auto", children: isLoadingMore ? "Loading..." : "Load More" }) }) : null
    ] }) : null
  ] }) }) });
}
export {
  CategoryPage as component
};
