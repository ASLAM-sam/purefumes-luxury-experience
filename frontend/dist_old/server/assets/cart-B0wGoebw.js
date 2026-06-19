import { r as reactExports, j as jsxRuntimeExports, q as ShoppingBag, Q as Minus, U as Plus, J as Trash2 } from "./vendor-react-98xxEzFV.js";
import { f as useNavigate, L as Link } from "./vendor-tanstack-DkD25YnA.js";
import { u as useApp, n as calculateCheckoutTotals, S as SiteShell, C as Container, O as OptimizedImage, A as AutoCouponSuggestion, B as Button, f as formatINR } from "./router-DvCKRw9U.js";
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
const formatCurrency = formatINR;
function CartPage() {
  const {
    cart,
    cartCount,
    cartTotal,
    cartDiscount,
    cartFinalTotal,
    cartCouponCode,
    cartCouponMessage,
    cartCouponTone,
    cartCouponLoading,
    updateCartQuantity,
    removeFromCart,
    applyCartCoupon,
    removeCartCoupon
  } = useApp();
  const nav = useNavigate();
  const [couponCode, setCouponCode] = reactExports.useState(cartCouponCode);
  const cartTotals = calculateCheckoutTotals({
    subtotal: cartTotal,
    discount: cartDiscount
  });
  const shippingCharge = cartTotals.shippingCharge;
  const payableTotal = cartCouponCode ? cartFinalTotal : cartTotals.finalPayable;
  reactExports.useEffect(() => {
    setCouponCode(cartCouponCode);
  }, [cartCouponCode]);
  const navigateToProduct = (id) => {
    if (!id) return;
    nav({
      to: "/product/$id",
      params: {
        id
      }
    });
  };
  const onApplyCoupon = async () => {
    await applyCartCoupon(couponCode);
  };
  const applySuggestedCoupon = (code) => {
    setCouponCode(code);
    void applyCartCoupon(code);
  };
  const proceedToCheckout = () => {
    nav({
      to: "/checkout"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SiteShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-12 md:py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.4em] text-gold", children: "Cart" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 font-display text-4xl text-navy sm:text-5xl", children: "Your Selection" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-xs uppercase tracking-[0.25em] text-navy/60 hover:text-navy", children: "Continue Shopping" })
    ] }),
    cart.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-12 rounded-lg border border-border bg-card p-10 text-center shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "mx-auto h-10 w-10 text-gold" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display mt-5 text-3xl text-navy", children: "Cart is empty" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-6 inline-flex items-center justify-center rounded-lg bg-navy px-6 py-3 text-xs uppercase tracking-[0.25em] text-beige transition hover:opacity-90", children: "Browse Fragrances" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 grid gap-8 lg:grid-cols-[1fr_22rem]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: cart.map((item) => {
        const imageSrc = item.product.images?.find(Boolean) || item.product.image;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { role: "button", tabIndex: 0, onClick: () => navigateToProduct(item.product.id || item.product._id), onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            navigateToProduct(item.product.id || item.product._id);
          }
        }, className: "grid cursor-pointer gap-4 rounded-lg border border-border bg-card p-4 shadow-soft transition hover:bg-beige/30 sm:grid-cols-[6rem_1fr_auto]", children: [
          imageSrc ? /* @__PURE__ */ jsxRuntimeExports.jsx(OptimizedImage, { src: imageSrc, alt: item.product.name, width: 160, height: 160, sizes: "6rem", wrapperClassName: "product-fit-frame aspect-square w-full rounded-lg sm:w-24", className: "product-fit-image" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex aspect-square w-full items-center justify-center rounded-lg bg-beige text-xl font-display text-navy/35 sm:w-24", children: item.product.name.trim().charAt(0).toUpperCase() || "P" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.3em] text-gold", children: item.product.brand }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 font-display text-xl text-navy sm:text-2xl", children: item.product.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-navy/60", children: item.size.size }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-medium text-gold", children: formatCurrency(item.size.price) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 sm:flex-col sm:items-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center rounded-lg border border-border bg-beige/30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: (event) => {
                event.stopPropagation();
                updateCartQuantity(item.key, item.quantity - 1);
              }, className: "p-2 text-navy/60 hover:text-navy", "aria-label": "Decrease quantity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-10 text-center text-sm tabular-nums text-navy", children: item.quantity }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: (event) => {
                event.stopPropagation();
                updateCartQuantity(item.key, item.quantity + 1);
              }, className: "p-2 text-navy/60 hover:text-navy", "aria-label": "Increase quantity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: (event) => {
              event.stopPropagation();
              removeFromCart(item.key);
            }, className: "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs uppercase tracking-[0.2em] text-red-600 hover:bg-red-50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
              " Remove"
            ] })
          ] })
        ] }, item.key);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "h-fit rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6 lg:sticky lg:top-28", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.3em] text-navy/60", children: "Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 space-y-3 text-sm text-navy/70", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Items" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: cartCount })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Subtotal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(cartTotal) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Discount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cartDiscount > 0 ? "text-green-700" : "", children: [
              "-",
              formatCurrency(cartDiscount)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Shipping Charges" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: shippingCharge > 0 ? formatCurrency(shippingCharge) : "Free" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex items-center justify-between border-t border-border pt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.25em] text-navy/60", children: "Final Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-3xl text-navy", children: formatCurrency(payableTotal) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 border-t border-border pt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.22em] text-navy/55", children: "Coupon Code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AutoCouponSuggestion, { subtotal: cartTotal, appliedCode: cartCouponCode, onApply: applySuggestedCoupon, className: "mt-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-col gap-3 sm:flex-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: couponCode, onChange: (event) => setCouponCode(event.target.value.toUpperCase()), placeholder: "Coupon code", className: "w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm uppercase text-navy outline-none transition focus:border-gold" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => void onApplyCoupon(), disabled: cartCouponLoading || !cart.length, className: "rounded-lg bg-navy px-4 py-3 text-xs uppercase tracking-[0.2em] text-beige transition hover:opacity-90 disabled:opacity-50", children: cartCouponLoading ? "Applying..." : "Apply Coupon" })
          ] }),
          cartCouponCode ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between gap-3 rounded-lg bg-beige/40 px-4 py-3 text-sm text-navy/75", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Applied: ",
              cartCouponCode
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: removeCartCoupon, className: "text-xs uppercase tracking-[0.2em] text-red-600 transition hover:text-red-700", children: "Remove" })
          ] }) : null,
          cartCouponMessage ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mt-3 text-sm ${cartCouponTone === "error" ? "text-red-600" : cartCouponTone === "info" ? "text-navy/60" : "text-green-700"}`, children: cartCouponMessage }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: proceedToCheckout, className: "mt-6 w-full", disabled: !cart.length, children: "Proceed to Checkout" })
      ] })
    ] })
  ] }) }) });
}
export {
  CartPage as component
};
