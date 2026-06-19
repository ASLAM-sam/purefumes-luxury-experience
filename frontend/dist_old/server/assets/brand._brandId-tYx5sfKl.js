import { r as reactExports, j as jsxRuntimeExports, a4 as ChevronLeft } from "./vendor-react-98xxEzFV.js";
import { U as Route, S as SiteShell, C as Container, O as OptimizedImage, B as Button, p as productsApi, V as PAGE_SIZE } from "./router-DvCKRw9U.js";
import { L as Link } from "./vendor-tanstack-DkD25YnA.js";
import { S as SectionTitle } from "./SectionTitle-CUOodH3k.js";
import { P as ProductCard } from "./ProductCard-BH3E7mti.js";
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
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const formatCategory = (category) => category.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
function BrandPage() {
  const {
    brand,
    products: initialProducts
  } = Route.useLoaderData();
  const [products, setProducts] = reactExports.useState(initialProducts.products);
  const [page, setPage] = reactExports.useState(initialProducts.pagination.page);
  const [totalPages, setTotalPages] = reactExports.useState(initialProducts.pagination.pages);
  const [isLoadingMore, setIsLoadingMore] = reactExports.useState(false);
  const [loadMoreError, setLoadMoreError] = reactExports.useState("");
  const subtitle = products.length ? `${products.length} perfume${products.length === 1 ? "" : "s"} from ${brand.name}.` : "No products under this brand yet.";
  const handleLoadMore = async () => {
    if (isLoadingMore || page >= totalPages) return;
    setIsLoadingMore(true);
    setLoadMoreError("");
    try {
      const response = await productsApi.listPaginated({
        brandId: brand.id,
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
    } catch (error) {
      setLoadMoreError(error instanceof Error ? error.message : "Could not load more products.");
    } finally {
      setIsLoadingMore(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SiteShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-14 md:py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/brands", className: "inline-flex items-center gap-1 text-xs uppercase tracking-[0.25em] text-navy/60 hover:text-navy", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
      " Back to brands"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-start gap-5 sm:flex-row sm:items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "brand-logo-frame h-24 w-24 shrink-0 bg-beige shadow-soft ring-1 ring-border md:h-28 md:w-28", children: brand.logo ? /* @__PURE__ */ jsxRuntimeExports.jsx(OptimizedImage, { src: brand.logo, alt: brand.name, width: 128, height: 128, sizes: "7rem", wrapperClassName: "flex h-full w-full items-center justify-center", className: "brand-logo-image" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-4xl text-navy md:text-5xl", children: brand.fallbackLetter || brand.name.charAt(0).toUpperCase() }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { eyebrow: "House", title: brand.name, subtitle, center: false }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-soft sm:w-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.3em] text-navy/55", children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-2xl text-navy", children: formatCategory(brand.category) })
      ] })
    ] }),
    products.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto mt-16 max-w-xl text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-2xl text-ink", children: "No products under this brand" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-sm leading-6 text-muted", children: [
        "Products linked to ",
        brand.name,
        " will appear here automatically."
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "product-grid mt-16", children: products.map((product) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { product }, product.id)) }),
      loadMoreError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mt-8 max-w-xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-700", children: loadMoreError }) : null,
      page < totalPages ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: handleLoadMore, disabled: isLoadingMore, className: "w-full max-w-xs rounded-full sm:w-auto", children: isLoadingMore ? "Loading..." : "Load More" }) }) : null
    ] })
  ] }) }) });
}
export {
  BrandPage as component
};
