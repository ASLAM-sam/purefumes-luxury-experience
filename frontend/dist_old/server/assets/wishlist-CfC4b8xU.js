import { j as jsxRuntimeExports, H as Heart, J as Trash2 } from "./vendor-react-98xxEzFV.js";
import { L as Link } from "./vendor-tanstack-DkD25YnA.js";
import { u as useApp, a as useNotification, S as SiteShell, C as Container, B as Button } from "./router-DvCKRw9U.js";
import { P as ProductCard } from "./ProductCard-BH3E7mti.js";
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
function WishlistPage() {
  const {
    wishlist,
    wishlistCount,
    removeFromWishlist,
    clearWishlist,
    isWishlistPending
  } = useApp();
  const {
    addNotification
  } = useNotification();
  const removeProduct = async (productId) => {
    try {
      await removeFromWishlist(productId);
      addNotification("Removed from wishlist.", "info");
    } catch (error) {
      addNotification(error instanceof Error ? error.message : "Wishlist could not be updated.", "error");
    }
  };
  const handleClearWishlist = () => {
    clearWishlist();
    addNotification("Wishlist cleared.", "info");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SiteShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-[var(--section-space)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-eyebrow uppercase text-gold", children: "Wishlist" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "fluid-section-title mt-2 font-display text-navy", children: "Saved Fragrances" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-body mt-3 text-muted-foreground", children: wishlistCount ? `${wishlistCount} saved perfume${wishlistCount === 1 ? "" : "s"} ready for your next browse.` : "Your saved perfumes will appear here." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "inline-flex items-center justify-center rounded-xl border border-border bg-card px-5 py-3 text-xs uppercase tracking-[0.24em] text-navy shadow-soft transition hover:border-gold/60 hover:text-gold", children: "Continue Shopping" }),
        wishlist.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: handleClearWishlist, className: "rounded-xl px-5 py-3 text-[0.68rem]", children: "Clear All" }) : null
      ] })
    ] }),
    wishlist.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-12 rounded-2xl border border-border bg-card p-10 text-center shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "mx-auto h-10 w-10 text-gold" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-5 font-display text-3xl text-navy", children: "No wishlist items yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-3 max-w-lg text-sm leading-7 text-muted-foreground", children: "Tap the heart on any product card or product page to save it here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-6 inline-flex items-center justify-center rounded-lg bg-navy px-6 py-3 text-xs uppercase tracking-[0.25em] text-beige transition hover:opacity-90", children: "Browse Fragrances" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "product-grid mt-12", children: wishlist.map((product) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { product }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => void removeProduct(product.id), disabled: isWishlistPending(product.id), className: "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs uppercase tracking-[0.2em] text-red-700 transition hover:bg-red-100 disabled:pointer-events-none disabled:opacity-60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
        "Remove"
      ] })
    ] }, product.id)) })
  ] }) }) });
}
export {
  WishlistPage as component
};
