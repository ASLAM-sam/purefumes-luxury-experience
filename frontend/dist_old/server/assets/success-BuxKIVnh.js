import { r as reactExports, j as jsxRuntimeExports, o as CircleCheck, K as MessageCircle } from "./vendor-react-98xxEzFV.js";
import { L as Link } from "./vendor-tanstack-DkD25YnA.js";
import { f as formatINR, m as multiplyMoney, S as SiteShell, C as Container, O as OptimizedImage, b as formatPaymentStatusLabel, c as formatOrderStatusLabel } from "./router-DvCKRw9U.js";
import { g as getBuyNowSuccessState } from "./buy-now-Dvp3HSMB.js";
import { f as formatPublicOrderId } from "./order-id-BDPLTTNe.js";
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
const WHATSAPP_PHONE = "918686003446";
const cleanText = (value, fallback = "-") => {
  const normalized = String(value ?? "").replace(/\r\n/g, "\n").trim();
  return normalized || fallback;
};
const formatOrderDate = (value) => {
  const date = value ? new Date(value) : /* @__PURE__ */ new Date();
  if (Number.isNaN(date.getTime())) {
    return (/* @__PURE__ */ new Date()).toLocaleString("en-IN");
  }
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};
const buildWhatsAppOrderMessage = ({
  customerName,
  phone,
  orderId,
  paymentId,
  items,
  totalAmount,
  deliveryAddress,
  paymentMethod,
  orderDate
}) => {
  const productLines = items.length ? items.map(
    (item) => `- ${cleanText(item.productName, "Product")} × ${item.quantity || 1} × ${cleanText(item.size, "Standard")}`
  ).join("\n") : "- Product details unavailable";
  return [
    "Hello Purefumes Hyderabad,",
    "",
    "A new order has been placed successfully.",
    "",
    `Order ID: ${cleanText(orderId)}`,
    `Payment ID: ${cleanText(paymentId)}`,
    "",
    "Customer Details:",
    `Name: ${cleanText(customerName)}`,
    `Phone: ${cleanText(phone)}`,
    "",
    "Products:",
    productLines,
    "",
    `Total Amount: ${formatINR(totalAmount || 0)}`,
    "",
    "Delivery Address:",
    cleanText(deliveryAddress),
    "",
    `Payment Method: ${cleanText(paymentMethod, "Razorpay")}`,
    `Order Date: ${formatOrderDate(orderDate)}`,
    "",
    "Please confirm the order."
  ].join("\n");
};
const buildWhatsAppOrderUrl = (details) => `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(buildWhatsAppOrderMessage(details))}`;
const openWhatsAppOrderUrl = (url) => {
  if (typeof window === "undefined" || !url) return false;
  try {
    const openedWindow = window.open(url, "_blank");
    if (openedWindow) {
      openedWindow.opener = null;
      return true;
    }
  } catch (_error) {
    return false;
  }
  return false;
};
function SuccessPage() {
  const [state, setState] = reactExports.useState({});
  const [whatsAppNotice, setWhatsAppNotice] = reactExports.useState("");
  const product = state.buyNowProduct;
  const size = state.buyNowSize ?? product?.sizes[0];
  const quantity = state.buyNowQuantity ?? 1;
  const customer = state.buyNowCustomer;
  const paymentMethod = state.buyNowPaymentMethod;
  const paymentId = state.buyNowPaymentId;
  const paymentOrderId = state.buyNowPaymentOrderId;
  const paymentGateway = state.buyNowPaymentGateway;
  const paymentStatus = state.buyNowPaymentStatus || (paymentId ? "paid" : "pending");
  const orderStatus = state.buyNowOrderStatus || (String(paymentStatus).toLowerCase() === "paid" ? "Confirmed" : "Pending");
  const orderId = state.buyNowPublicOrderId || state.buyNowOrderId;
  const displayOrderId = formatPublicOrderId(orderId) || "Generating";
  const orderDate = state.buyNowOrderDate;
  const orderItems = reactExports.useMemo(() => state.buyNowOrderItems && state.buyNowOrderItems.length ? state.buyNowOrderItems : product && size ? [{
    productId: product.id,
    productName: product.name,
    brand: product.brand,
    quantity,
    size: size.size,
    price: size.price,
    productImage: product.image || product.images?.[0] || ""
  }] : [], [product, quantity, size, state.buyNowOrderItems]);
  const firstItem = orderItems[0];
  const total = size ? multiplyMoney(size.price, quantity) : 0;
  const subtotal = state.buyNowSubtotal ?? total;
  const discount = state.buyNowDiscount ?? 0;
  const finalTotal = state.buyNowFinalTotal ?? total;
  const couponCode = state.buyNowCouponCode ?? "";
  const whatsAppDetails = reactExports.useMemo(() => {
    if (!customer || !orderItems.length) return null;
    return {
      customerName: customer.name || "Customer",
      phone: customer.phone || "",
      orderId: displayOrderId,
      paymentId: paymentId || "",
      items: orderItems,
      totalAmount: finalTotal,
      deliveryAddress: customer.address || "",
      paymentMethod: "Razorpay",
      orderDate: orderDate || (/* @__PURE__ */ new Date()).toISOString()
    };
  }, [customer, displayOrderId, finalTotal, orderDate, orderItems, paymentId]);
  const isPaidRazorpayOrder = String(paymentGateway || "Razorpay").toLowerCase() === "razorpay" && String(paymentStatus).toLowerCase() === "paid";
  const whatsAppUrl = reactExports.useMemo(() => isPaidRazorpayOrder && whatsAppDetails ? buildWhatsAppOrderUrl(whatsAppDetails) : "", [isPaidRazorpayOrder, whatsAppDetails]);
  reactExports.useEffect(() => {
    setState(getBuyNowSuccessState());
  }, []);
  reactExports.useEffect(() => {
    if (!state.buyNowShouldOpenWhatsApp || !whatsAppUrl) return;
    if (typeof window === "undefined") return;
    const orderKey = [displayOrderId, paymentId].filter(Boolean).join(":");
    if (!orderKey) return;
    const storageKey = `purefumes_whatsapp_order_opened:${orderKey}`;
    try {
      if (window.sessionStorage.getItem(storageKey)) return;
    } catch (_error) {
    }
    const timer = window.setTimeout(() => {
      const opened = openWhatsAppOrderUrl(whatsAppUrl);
      try {
        window.sessionStorage.setItem(storageKey, "1");
      } catch (_error) {
      }
      setWhatsAppNotice(opened ? "WhatsApp opened in a new tab. If it did not appear, use the button below." : "WhatsApp did not open automatically. Use the button below.");
    }, 700);
    return () => window.clearTimeout(timer);
  }, [displayOrderId, paymentId, state.buyNowShouldOpenWhatsApp, whatsAppUrl]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SiteShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-20 md:py-24", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-soft md:p-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-8 w-8" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-6 font-display text-4xl text-navy md:text-5xl", children: "Order Placed Successfully" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm leading-7 text-muted-foreground md:text-base", children: "Your Razorpay payment was successful and your order has been saved." })
    ] }),
    orderItems.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 grid gap-8 md:grid-cols-[8rem_minmax(0,1fr)]", children: [
      product?.image || firstItem?.productImage ? /* @__PURE__ */ jsxRuntimeExports.jsx(OptimizedImage, { src: product?.image || firstItem?.productImage || "", alt: product?.name || firstItem?.productName || "Order item", width: 180, height: 180, sizes: "8rem", wrapperClassName: "product-fit-frame aspect-square w-full rounded-xl md:w-32", className: "product-fit-image" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex aspect-square w-full items-center justify-center rounded-xl bg-beige text-3xl font-display text-navy/35 md:w-32", children: (product?.name || firstItem?.productName || "P").trim().charAt(0).toUpperCase() || "P" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.34em] text-gold", children: product?.brand || firstItem?.brand || "Purefumes Hyderabad" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 font-display text-3xl text-navy", children: orderItems.length > 1 ? `${orderItems.length} fragrances confirmed` : product?.name || firstItem?.productName || "Order confirmed" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-beige/30 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.62rem] uppercase tracking-[0.3em] text-navy/55", children: "Order Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-2 text-sm text-navy/75", children: [
              orderItems.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                item.productName || "Product",
                " × ",
                item.quantity || 1,
                " ×",
                " ",
                item.size || "Standard"
              ] }, `${item.productId || item.productName}-${index}`)),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Subtotal: ",
                formatINR(subtotal)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Discount: -",
                formatINR(discount)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Final Total: ",
                formatINR(finalTotal)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Coupon: ",
                couponCode || "-"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Payment Status: ",
                formatPaymentStatusLabel(paymentStatus)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Order Status: ",
                formatOrderStatusLabel(orderStatus)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Gateway: ",
                paymentGateway || "Razorpay"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Method: ",
                paymentMethod || "Online Payment"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Payment ID: ",
                paymentId || "-"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Payment Order: ",
                paymentOrderId || "-"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-navy", children: [
                "Order ID: ",
                displayOrderId
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Order Date:",
                " ",
                orderDate ? new Date(orderDate).toLocaleString("en-IN") : "-"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-beige/30 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.62rem] uppercase tracking-[0.3em] text-navy/55", children: "Delivery To" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-2 text-sm text-navy/75", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: customer?.name || "Customer" }),
              customer?.email ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: customer.email }) : null,
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: customer?.phone || "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: customer?.address || "-" })
            ] })
          ] })
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-8 text-center text-sm text-muted-foreground", children: "Your order summary is unavailable. Please keep your order ID handy and contact support if you need help." }),
    whatsAppUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 rounded-xl border border-gold/25 bg-gold/10 p-4 text-center sm:p-5", children: [
      whatsAppNotice ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-sm leading-6 text-navy/65", children: whatsAppNotice }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: whatsAppUrl, target: "_blank", rel: "noopener noreferrer", onClick: () => setWhatsAppNotice("WhatsApp order message is ready to send."), className: "inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-xs uppercase tracking-[0.22em] text-beige transition duration-300 ease-in-out hover:opacity-90 sm:w-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4" }),
        "Send Order on WhatsApp"
      ] })
    ] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "inline-flex items-center justify-center rounded-full bg-navy px-6 py-3 text-xs uppercase tracking-[0.28em] text-beige transition duration-300 ease-in-out hover:opacity-90", children: "Continue Shopping" }) })
  ] }) }) }) });
}
export {
  SuccessPage as component
};
