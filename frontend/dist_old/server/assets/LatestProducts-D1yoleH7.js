import { r as reactExports, j as jsxRuntimeExports } from "./vendor-react-98xxEzFV.js";
import { E as useRenderInstrumentation, a0 as LATEST_PRODUCTS_CHANGED_EVENT, C as Container, k as Skeleton, p as productsApi, G as storefrontFallbackProducts, z as DATA_EVENT_STORAGE_KEY } from "./router-DvCKRw9U.js";
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
const LatestProducts = reactExports.memo(function LatestProducts2() {
  useRenderInstrumentation();
  const [products, setProducts] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    let isActive = true;
    const loadLatest = async ({ silent = false, forceFresh = false } = {}) => {
      if (!silent) {
        setLoading(true);
      }
      try {
        const nextProducts = await productsApi.listLatest({ forceFresh });
        if (isActive) {
          const latestProducts = nextProducts.filter((product) => product.isLatest).slice(0, 8);
          setProducts(latestProducts.length ? latestProducts : storefrontFallbackProducts);
        }
      } catch (_error) {
        if (isActive && !silent) {
          setProducts(storefrontFallbackProducts);
        }
      } finally {
        if (isActive && !silent) {
          setLoading(false);
        }
      }
    };
    const refreshLatest = () => {
      void loadLatest({ silent: true, forceFresh: true });
    };
    const refreshLatestFromFocus = () => {
      void loadLatest({ silent: true, forceFresh: false });
    };
    const handleStorage = (event) => {
      if (event.key !== DATA_EVENT_STORAGE_KEY || !event.newValue) return;
      try {
        const payload = JSON.parse(event.newValue);
        if (payload.name === LATEST_PRODUCTS_CHANGED_EVENT) {
          refreshLatest();
        }
      } catch (_error) {
      }
    };
    void loadLatest();
    window.addEventListener(LATEST_PRODUCTS_CHANGED_EVENT, refreshLatest);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refreshLatestFromFocus);
    return () => {
      isActive = false;
      window.removeEventListener(LATEST_PRODUCTS_CHANGED_EVENT, refreshLatest);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refreshLatestFromFocus);
    };
  }, []);
  if (!loading && !products.length) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "latest-arrivals", className: "bg-background py-[var(--section-space)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SectionTitle,
      {
        eyebrow: "Just In",
        title: "Latest Arrivals",
        subtitle: "Newly curated fragrances ready to discover."
      }
    ),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "product-grid mt-12", children: Array.from({ length: 4 }).map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "rounded-[1.6rem] border border-border/70 bg-white/80 p-3 shadow-soft md:p-4",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "aspect-square rounded-xl" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-7 w-4/5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-28" })
          ] })
        ]
      },
      index
    )) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "product-grid mt-12", children: products.map((product, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      ProductCard,
      {
        product,
        showSize: true,
        variant: "bestseller",
        imageLoading: index < 3 ? "eager" : "lazy",
        imageFetchPriority: index < 3 ? "high" : "auto"
      },
      product.id
    )) })
  ] }) });
});
export {
  LatestProducts
};
