import { r as reactExports, j as jsxRuntimeExports, q as ShoppingBag, Q as Minus, U as Plus } from "./vendor-react-98xxEzFV.js";
import { f as useNavigate, L as Link } from "./vendor-tanstack-DkD25YnA.js";
import { a as useNotification, u as useApp, l as createDeliveryFormFromUser, m as multiplyMoney, n as calculateCheckoutTotals, o as couponsApi, q as normalizeMoney, r as isDeliveryFormComplete, s as buildDeliveryAddressText, t as buildShippingAddress, v as ordersApi, w as paymentsApi, S as SiteShell, C as Container, O as OptimizedImage, D as DeliveryDetailsFields, B as Button, f as formatINR, A as AutoCouponSuggestion } from "./router-DvCKRw9U.js";
import { E as ErrorState } from "./ErrorState-DxcmW7-q.js";
import { L as LoadingSkeleton } from "./LoadingSkeleton-ByWjt3UG.js";
import { p as paymentOptions, a as getBuyNowCheckoutState, s as saveBuyNowSuccessState, c as clearBuyNowCheckoutState } from "./buy-now-Dvp3HSMB.js";
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
const PaymentOptions = reactExports.memo(function PaymentOptions2({ loading, onSelect }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.4em] text-gold", children: "Payment Options" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-2 font-display text-3xl text-navy", children: "Pay using UPI apps" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-6 text-muted-foreground", children: "Razorpay will open in UPI mode. On Android mobile, supported apps such as Google Pay or PhonePe can open directly; on desktop, Razorpay may show a UPI QR instead." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex flex-col gap-4 sm:flex-row", children: paymentOptions.map((option) => {
      const processing = loading === option.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          disabled: Boolean(loading),
          onClick: () => onSelect(option.id, option.name),
          className: "flex min-h-24 flex-1 items-center justify-center rounded-lg border border-border bg-white px-5 py-4 shadow-md transition duration-300 ease-in-out hover:scale-105 hover:border-gold disabled:cursor-not-allowed disabled:opacity-70",
          children: processing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-3 text-sm font-medium uppercase tracking-[0.22em] text-navy", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-5 w-5 animate-spin rounded-full border-2 border-navy border-r-transparent" }),
            "Processing"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: option.logo,
              alt: option.name,
              loading: "lazy",
              decoding: "async",
              className: "h-10 w-auto object-contain"
            }
          )
        },
        option.id
      );
    }) })
  ] });
});
const RAZORPAY_URL = "https://checkout.razorpay.com/v1/checkout.js";
let razorpayScriptPromise = null;
let paymentConfigPromise = null;
const loadRazorpay = () => {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }
  const razorpayWindow = window;
  if (razorpayWindow.Razorpay) {
    return Promise.resolve(true);
  }
  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }
  razorpayScriptPromise = new Promise((resolve) => {
    const existingScript = document.querySelector(`script[src="${RAZORPAY_URL}"]`);
    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        resolve(true);
        return;
      }
      existingScript.addEventListener("load", () => resolve(true), {
        once: true
      });
      existingScript.addEventListener("error", () => resolve(false), {
        once: true
      });
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_URL;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve(true);
    };
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
  return razorpayScriptPromise;
};
const getPaymentConfig = async () => {
  if (!paymentConfigPromise) {
    paymentConfigPromise = paymentsApi.getConfig();
  }
  return paymentConfigPromise;
};
const createMockPaymentResponse = () => ({
  razorpay_payment_id: "TEST_PAYMENT_ID",
  razorpay_order_id: `TEST_ORDER_${Date.now()}`,
  razorpay_signature: "TEST_SIGNATURE"
});
const verifyRazorpayResponse = async (response) => {
  if (!response.razorpay_order_id || !response.razorpay_signature) {
    throw new Error("Razorpay did not return complete payment verification details.");
  }
  const verification = await paymentsApi.verifyPayment({
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_order_id: response.razorpay_order_id,
    razorpay_signature: response.razorpay_signature
  });
  if (!verification.verified) {
    throw new Error("Payment signature verification failed.");
  }
};
const testPaymentOptions = [{
  id: "test-paid",
  name: "Simulate Success",
  description: "Create a paid test order with a fake gateway transaction.",
  paymentStatus: "paid"
}, {
  id: "test-pending",
  name: "Simulate Pending",
  description: "Create a pending-payment order for operational testing.",
  paymentStatus: "pending"
}, {
  id: "test-failed",
  name: "Simulate Failed",
  description: "Create a failed-payment order while preserving stock and admin visibility.",
  paymentStatus: "failed"
}, {
  id: "test-cod",
  name: "Simulate COD",
  description: "Create a cash-on-delivery style test order without gateway charge.",
  paymentStatus: "cod"
}];
const getTestPaymentOption = (id) => testPaymentOptions.find((option) => option.id === id) || testPaymentOptions[0];
const upiOnlyDisplayConfig = {
  display: {
    blocks: {
      upi_only: {
        name: "Pay via UPI",
        instruments: [{
          method: "upi"
        }]
      }
    },
    sequence: ["block.upi_only"],
    preferences: {
      show_default_blocks: false
    }
  }
};
const wait = (duration) => new Promise((resolve) => {
  window.setTimeout(resolve, duration);
});
const retryOperation = async (operation, retries = 1) => {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) throw error;
    await wait(700);
    return retryOperation(operation, retries - 1);
  }
};
const orderItemsForSuccess = (order) => Array.isArray(order.items) ? order.items.map((item) => ({
  productId: item.productId,
  productName: item.productName || "Product",
  brand: item.brand || "",
  quantity: item.quantity || 1,
  size: item.size || "Standard",
  price: item.priceAtPurchase ?? item.price ?? 0,
  productImage: item.productImage || ""
})) : [];
function PaymentVerificationOverlay({
  message
}) {
  if (!message) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[2600] flex items-center justify-center bg-[#1e1b18]/55 px-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-2xl border border-gold/25 bg-[#fffaf4] px-6 py-7 text-center shadow-luxe", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gold/25 border-t-gold" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 font-display text-2xl text-navy", children: message }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-6 text-navy/58", children: "Please keep this tab open while we secure your order." })
  ] }) });
}
function DevelopmentPaymentPanel({
  loading,
  onSelect
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 rounded-2xl border border-amber-200/70 bg-amber-50/80 p-6 shadow-soft", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.4em] text-amber-700", children: "Test payment mode" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-2 font-display text-3xl text-navy", children: "Complete checkout without Razorpay" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-6 text-navy/68", children: "Test mode is enabled, so checkout will create real order records, update inventory, preserve admin analytics visibility, and simulate multiple payment outcomes without real gateway charges." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid gap-4 sm:grid-cols-2", children: testPaymentOptions.map((option) => {
      const processing = loading === option.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", disabled: Boolean(loading), onClick: () => onSelect(option.id, option.name), className: "rounded-[1.35rem] border border-amber-200 bg-white px-4 py-5 text-left transition hover:border-amber-300 hover:shadow-[0_16px_28px_rgba(201,161,74,0.18)] disabled:cursor-not-allowed disabled:opacity-70", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.24em] text-amber-700", children: "Simulate" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-semibold text-navy", children: option.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-navy/56", children: processing ? "Creating test order..." : option.description })
      ] }, option.id);
    }) })
  ] });
}
function CheckoutPage() {
  const nav = useNavigate();
  const {
    addNotification
  } = useNotification();
  const {
    cart
  } = useApp();
  const [buyNowState] = reactExports.useState(() => getBuyNowCheckoutState());
  const product = buyNowState.buyNowProduct;
  const size = buyNowState.buyNowSize ?? product?.sizes[0];
  const [quantity, setQuantity] = reactExports.useState(1);
  const [form, setForm] = reactExports.useState(() => createDeliveryFormFromUser(null));
  const [showPaymentOptions, setShowPaymentOptions] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(null);
  const [error, setError] = reactExports.useState("");
  const [paymentConfig, setPaymentConfig] = reactExports.useState(null);
  const [paymentConfigError, setPaymentConfigError] = reactExports.useState("");
  const [verificationMessage, setVerificationMessage] = reactExports.useState("");
  const [couponCode, setCouponCode] = reactExports.useState("");
  const [appliedCoupon, setAppliedCoupon] = reactExports.useState(null);
  const [couponMessage, setCouponMessage] = reactExports.useState("");
  const [couponTone, setCouponTone] = reactExports.useState(null);
  const [couponLoading, setCouponLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let active = true;
    void getPaymentConfig().then((config) => {
      if (!active) return;
      setPaymentConfig(config);
      setPaymentConfigError("");
    }).catch((configError) => {
      if (!active) return;
      setPaymentConfigError(configError instanceof Error ? configError.message : "Payment configuration could not be loaded.");
    });
    return () => {
      active = false;
    };
  }, []);
  const maxQuantity = Math.max(1, product?.stock || 1);
  const subtotal = reactExports.useMemo(() => {
    if (!size) return 0;
    return multiplyMoney(size.price, quantity);
  }, [quantity, size]);
  const discount = appliedCoupon?.discount ?? 0;
  const checkoutTotals = calculateCheckoutTotals({
    subtotal,
    discount
  });
  const shippingCharge = checkoutTotals.shippingCharge;
  const finalTotal = appliedCoupon?.finalTotal ?? checkoutTotals.finalPayable;
  reactExports.useEffect(() => {
    if (appliedCoupon && appliedCoupon.subtotal !== subtotal) {
      setAppliedCoupon(null);
      setCouponMessage("Coupon removed because order details changed. Apply it again to recalculate.");
      setCouponTone("info");
    }
  }, [appliedCoupon, subtotal]);
  const updateForm = reactExports.useCallback((key) => (event) => {
    setForm((current) => ({
      ...current,
      [key]: event.target.value
    }));
  }, []);
  const increaseQuantity = reactExports.useCallback(() => {
    setQuantity((current) => Math.min(current + 1, maxQuantity));
  }, [maxQuantity]);
  const decreaseQuantity = reactExports.useCallback(() => {
    setQuantity((current) => Math.max(current - 1, 1));
  }, []);
  const applyCoupon = reactExports.useCallback(async (codeOverride) => {
    if (!product || !size) {
      return;
    }
    const trimmedCode = (codeOverride || couponCode).trim();
    if (codeOverride) {
      setCouponCode(codeOverride);
    }
    if (!trimmedCode) {
      setAppliedCoupon(null);
      setCouponMessage("Enter a coupon code.");
      setCouponTone("error");
      return;
    }
    setCouponLoading(true);
    try {
      const result = await couponsApi.apply({
        code: trimmedCode,
        items: [{
          productId: product.id,
          name: product.name,
          price: size.price,
          quantity,
          size: size.size
        }]
      });
      if (!result || result.success === false) {
        setAppliedCoupon(null);
        setCouponMessage(result?.message || "Invalid coupon code");
        setCouponTone("error");
        return;
      }
      const discountAmount = normalizeMoney(result.discount ?? result.coupon?.discountValue ?? 0);
      const resultSubtotal = normalizeMoney(result.subtotal ?? subtotal);
      const fallbackTotals = calculateCheckoutTotals({
        subtotal: resultSubtotal,
        discount: discountAmount
      });
      const resultFinalTotal = normalizeMoney(result.finalTotal ?? fallbackTotals.finalPayable);
      setAppliedCoupon({
        code: result.coupon?.code || result.code || trimmedCode.toUpperCase(),
        discount: discountAmount,
        finalTotal: resultFinalTotal,
        subtotal: resultSubtotal
      });
      setCouponMessage(result.message || "Coupon applied successfully");
      setCouponTone("success");
    } catch (couponError) {
      setAppliedCoupon(null);
      setCouponMessage(couponError instanceof Error ? couponError.message : "Coupon could not be applied.");
      setCouponTone("error");
    } finally {
      setCouponLoading(false);
    }
  }, [couponCode, product, quantity, size, subtotal]);
  const removeCoupon = reactExports.useCallback(() => {
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponMessage("");
    setCouponTone(null);
  }, []);
  const validateCustomerDetails = reactExports.useCallback(() => {
    const isValid = isDeliveryFormComplete(form);
    if (!isValid) {
      window.alert("Please fill all required delivery details");
    }
    return isValid;
  }, [form]);
  const confirmOrder = reactExports.useCallback((event) => {
    event.preventDefault();
    if (!validateCustomerDetails()) {
      return;
    }
    setError("");
    setShowPaymentOptions(true);
  }, [validateCustomerDetails]);
  const ensurePaymentConfig = reactExports.useCallback(async () => {
    try {
      const config = paymentConfig || await getPaymentConfig();
      setPaymentConfig(config);
      setPaymentConfigError("");
      return config;
    } catch (configError) {
      const message = configError instanceof Error ? configError.message : "Payment configuration could not be loaded.";
      setPaymentConfigError(message);
      setError(message);
      throw configError;
    }
  }, [paymentConfig]);
  const handleOrderSuccess = reactExports.useCallback(async (paymentResponse, paymentName, paymentGateway = "Razorpay", paymentStatus = "paid") => {
    if (!product || !size) return;
    const deliveryAddress = buildDeliveryAddressText(form);
    const shippingAddress = buildShippingAddress(form);
    const customer = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: deliveryAddress
    };
    try {
      const order = await retryOperation(() => ordersApi.create({
        customerName: customer.name,
        email: customer.email,
        mobileNumber: customer.phone,
        phone: customer.phone,
        address: customer.address,
        shippingAddress,
        couponCode: appliedCoupon?.code || void 0,
        items: [{
          productId: product.id,
          quantity,
          size: size.size
        }],
        paymentId: paymentResponse.razorpay_payment_id,
        paymentMethod: paymentName,
        paymentGateway,
        paymentOrderId: paymentResponse.razorpay_order_id,
        paymentSignature: paymentResponse.razorpay_signature,
        paymentStatus
      }), 1);
      const orderItems = orderItemsForSuccess(order);
      saveBuyNowSuccessState({
        buyNowProduct: product,
        buyNowSize: size,
        buyNowQuantity: quantity,
        buyNowOrderItems: orderItems.length ? orderItems : [{
          productId: product.id,
          productName: product.name,
          brand: product.brand,
          quantity,
          size: size.size,
          price: size.price,
          productImage: product.image || product.images?.[0] || ""
        }],
        buyNowCustomer: customer,
        buyNowPaymentMethod: paymentName,
        buyNowPaymentId: paymentResponse.razorpay_payment_id,
        buyNowPaymentOrderId: paymentResponse.razorpay_order_id,
        buyNowPaymentGateway: paymentGateway,
        buyNowPaymentStatus: order.paymentStatus || paymentStatus,
        buyNowOrderStatus: order.status || order.orderStatus,
        buyNowOrderId: order.publicOrderId || "",
        buyNowPublicOrderId: order.publicOrderId || "",
        buyNowOrderDate: order.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
        buyNowCouponCode: order.couponCode || "",
        buyNowSubtotal: order.subtotalAmount ?? subtotal,
        buyNowDiscount: order.discountAmount ?? 0,
        buyNowFinalTotal: order.totalAmount,
        buyNowShouldOpenWhatsApp: paymentStatus === "paid" && paymentGateway === "Razorpay"
      });
      clearBuyNowCheckoutState();
      addNotification(paymentStatus === "failed" ? "Test failed-payment order created." : paymentStatus === "pending" ? "Test pending-payment order created." : paymentStatus === "cod" ? "Test COD order created." : "Payment successful. Order placed.");
      nav({
        to: "/success"
      });
    } catch (ex) {
      const message = ex instanceof Error ? ex.message : "Order could not be saved after payment.";
      setLoading(null);
      setError(message);
      addNotification(message, "error");
    } finally {
      setVerificationMessage("");
      setLoading(null);
    }
  }, [addNotification, appliedCoupon?.code, form, nav, product, quantity, size, subtotal]);
  const handleBypassPayment = reactExports.useCallback(async (paymentOptionId) => {
    if (!product || !size) return;
    setError("");
    setLoading(paymentOptionId);
    try {
      await ensurePaymentConfig();
      const testOption = getTestPaymentOption(paymentOptionId);
      await handleOrderSuccess(createMockPaymentResponse(), testOption.paymentStatus === "cod" ? "cod" : "test-bypass", "test-mode", testOption.paymentStatus);
    } catch (bypassError) {
      const message = bypassError instanceof Error ? bypassError.message : "Test checkout could not be completed.";
      setError(message);
      addNotification(message, "error");
    } finally {
      setLoading(null);
    }
  }, [addNotification, ensurePaymentConfig, handleOrderSuccess, product, size]);
  const handlePayment = reactExports.useCallback(async (paymentOptionId, paymentName) => {
    if (!product || !size) return;
    if (!validateCustomerDetails()) {
      return;
    }
    let config;
    try {
      config = await ensurePaymentConfig();
    } catch {
      return;
    }
    if (config.bypassEnabled) {
      await handleBypassPayment(paymentOptionId);
      return;
    }
    const razorpayKey = config.keyId;
    if (!razorpayKey) {
      window.alert("Razorpay key is missing in backend/.env.");
      return;
    }
    setError("");
    setLoading(paymentOptionId);
    let razorpayOrder;
    try {
      razorpayOrder = await paymentsApi.createOrder({
        items: [{
          productId: product.id,
          quantity,
          size: size.size
        }],
        couponCode: appliedCoupon?.code || void 0,
        currency: "INR"
      });
    } catch (orderError) {
      const message = orderError instanceof Error ? orderError.message : "Payment order could not be created.";
      setLoading(null);
      setError(message);
      addNotification(message, "error");
      return;
    }
    const sdkLoaded = await loadRazorpay();
    if (!sdkLoaded) {
      setLoading(null);
      window.alert("Razorpay SDK failed to load");
      return;
    }
    const Razorpay = window.Razorpay;
    if (!Razorpay) {
      setLoading(null);
      window.alert("Razorpay SDK failed to initialize");
      return;
    }
    const paymentObject = new Razorpay({
      key: razorpayKey,
      order_id: razorpayOrder.order_id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Purefumes Hyderabad",
      description: `Order Payment - ${product.name}`,
      config: upiOnlyDisplayConfig,
      handler: (response) => {
        void (async () => {
          try {
            setVerificationMessage("Verifying your payment...");
            await retryOperation(() => verifyRazorpayResponse(response), 1);
            setVerificationMessage("Saving your order...");
            await handleOrderSuccess(response, paymentName);
          } catch (verificationError) {
            const message = verificationError instanceof Error ? verificationError.message : "Payment could not be verified.";
            setLoading(null);
            setVerificationMessage("");
            setError(message);
            addNotification(message, "error");
          }
        })();
      },
      prefill: {
        name: form.name.trim(),
        email: form.email.trim(),
        contact: form.phone.trim()
      },
      notes: {
        productId: product.id,
        productName: product.name,
        size: size.size,
        quantity: String(quantity),
        couponCode: appliedCoupon?.code || "",
        paymentOption: paymentName
      },
      modal: {
        ondismiss: () => {
          if (!verificationMessage) {
            setLoading(null);
          }
        }
      },
      theme: {
        color: "#5B3A29"
      }
    });
    paymentObject.on("payment.failed", (response) => {
      const message = response.error?.description || "Payment could not be completed.";
      setLoading(null);
      setError(message);
      addNotification(message, "error");
    });
    paymentObject.open();
  }, [addNotification, appliedCoupon?.code, ensurePaymentConfig, form.name, form.phone, handleBypassPayment, handleOrderSuccess, product, quantity, size, validateCustomerDetails, verificationMessage]);
  const isBypassMode = Boolean(paymentConfig?.bypassEnabled);
  if (!product || !size) {
    if (cart.length) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CartCheckout, {});
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SiteShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-20 md:py-24", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl rounded-2xl border border-border bg-card p-10 text-center shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "mx-auto h-10 w-10 text-gold" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-5 font-display text-4xl text-navy", children: "Nothing to checkout" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm leading-7 text-muted-foreground", children: "Choose a fragrance first, then use Buy It Now to continue with instant checkout." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-6 inline-flex items-center justify-center rounded-full bg-navy px-6 py-3 text-xs uppercase tracking-[0.28em] text-beige transition duration-300 ease-in-out hover:opacity-90", children: "Continue Shopping" })
    ] }) }) }) });
  }
  const productImage = product.images?.find(Boolean) || product.image;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(SiteShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentVerificationOverlay, { message: verificationMessage }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-12 md:py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.4em] text-gold", children: "Checkout" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 font-display text-4xl text-navy sm:text-5xl", children: "Buy It Now" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/product/$id", params: {
          id: product.id
        }, className: "text-xs uppercase tracking-[0.25em] text-navy/60 transition duration-300 ease-in-out hover:text-navy", children: "Back to Product" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-5 shadow-soft md:p-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-[8rem_minmax(0,1fr)] md:items-start", children: [
            productImage ? /* @__PURE__ */ jsxRuntimeExports.jsx(OptimizedImage, { src: productImage, alt: product.name, width: 180, height: 180, sizes: "8rem", wrapperClassName: "product-fit-frame aspect-square w-full rounded-xl md:w-32", className: "product-fit-image" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex aspect-square w-full items-center justify-center rounded-xl bg-beige text-3xl font-display text-navy/35 md:w-32", children: product.name.trim().charAt(0).toUpperCase() || "P" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.34em] text-gold", children: product.brand }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 font-display text-2xl text-navy sm:text-3xl", children: product.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: size.size }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm leading-7 text-muted-foreground", children: product.description })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: confirmOrder, className: "mt-8 space-y-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.3em] text-navy/60", children: "Quantity" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 inline-flex items-center rounded-full border border-border bg-beige/30 px-2 py-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: decreaseQuantity, className: "flex h-10 w-10 items-center justify-center rounded-full text-navy/70 transition duration-300 ease-in-out hover:bg-white hover:text-navy", "aria-label": "Decrease quantity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-12 text-center text-base font-medium tabular-nums text-navy", children: quantity }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: increaseQuantity, className: "flex h-10 w-10 items-center justify-center rounded-full text-navy/70 transition duration-300 ease-in-out hover:bg-white hover:text-navy", "aria-label": "Increase quantity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DeliveryDetailsFields, { form, onChange: updateForm }),
            error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600", children: error }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "gold", disabled: Boolean(loading || verificationMessage), className: "mt-2 w-full rounded-full px-6 py-3 text-[0.72rem] font-semibold tracking-[0.28em]", children: "Confirm Order" })
          ] }),
          paymentConfigError && !paymentConfig ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { description: paymentConfigError, onRetry: () => void ensurePaymentConfig() }) }) : null,
          showPaymentOptions ? !paymentConfig && !paymentConfigError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-24 w-full" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-24 w-full" })
          ] }) : isBypassMode ? /* @__PURE__ */ jsxRuntimeExports.jsx(DevelopmentPaymentPanel, { loading, onSelect: handlePayment }) : /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentOptions, { loading, onSelect: handlePayment }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "h-fit rounded-2xl border border-border bg-navy p-5 text-beige shadow-luxe sm:p-6 lg:sticky lg:top-28", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.32em] text-gold", children: "Order Summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 space-y-4 text-sm text-beige/75", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Price" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatINR(size.price) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Quantity" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: quantity })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Size" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: size.size })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Subtotal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatINR(subtotal) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Discount" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: discount > 0 ? "text-green-300" : "", children: [
                "-",
                formatINR(discount)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Shipping Charges" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: shippingCharge > 0 ? formatINR(shippingCharge) : "Free" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 border-t border-beige/10 pt-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.6rem] uppercase tracking-[0.28em] text-beige/55", children: "Final Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-4xl text-beige", children: formatINR(finalTotal) }),
            isBypassMode ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs uppercase tracking-[0.2em] text-amber-300", children: "TEST MODE" }) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 border-t border-beige/10 pt-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.6rem] uppercase tracking-[0.28em] text-beige/55", children: "Coupon Code" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AutoCouponSuggestion, { subtotal, appliedCode: appliedCoupon?.code, onApply: (code) => void applyCoupon(code), tone: "dark", className: "mt-3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-col gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: couponCode, onChange: (event) => setCouponCode(event.target.value.toUpperCase()), placeholder: "Coupon code", className: "w-full rounded-lg border border-beige/20 bg-white/10 px-4 py-3 text-sm uppercase text-beige outline-none transition focus:border-gold" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => void applyCoupon(), disabled: couponLoading, className: "rounded-lg bg-gold px-4 py-3 text-xs uppercase tracking-[0.2em] text-navy transition hover:opacity-90 disabled:opacity-50", children: couponLoading ? "Applying..." : "Apply Coupon" })
            ] }),
            appliedCoupon?.code ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between gap-3 rounded-lg bg-white/10 px-4 py-3 text-sm text-beige/85", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Applied: ",
                appliedCoupon.code
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: removeCoupon, className: "text-xs uppercase tracking-[0.2em] text-red-200 transition hover:text-red-100", children: "Remove" })
            ] }) : null,
            couponMessage ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mt-3 text-sm ${couponTone === "error" ? "text-red-200" : couponTone === "info" ? "text-beige/60" : "text-green-300"}`, children: couponMessage }) : null
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
function CartCheckout() {
  const nav = useNavigate();
  const {
    addNotification
  } = useNotification();
  const {
    cart,
    cartTotal,
    cartDiscount,
    cartFinalTotal,
    cartCouponCode,
    clearCart
  } = useApp();
  const cartTotals = calculateCheckoutTotals({
    subtotal: cartTotal,
    discount: cartDiscount
  });
  const cartShippingCharge = cartTotals.shippingCharge;
  const cartPayableTotal = cartCouponCode ? cartFinalTotal : cartTotals.finalPayable;
  const [form, setForm] = reactExports.useState(() => createDeliveryFormFromUser(null));
  const [showPaymentOptions, setShowPaymentOptions] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(null);
  const [error, setError] = reactExports.useState("");
  const [paymentConfig, setPaymentConfig] = reactExports.useState(null);
  const [paymentConfigError, setPaymentConfigError] = reactExports.useState("");
  const [verificationMessage, setVerificationMessage] = reactExports.useState("");
  reactExports.useEffect(() => {
    let active = true;
    void getPaymentConfig().then((config) => {
      if (!active) return;
      setPaymentConfig(config);
      setPaymentConfigError("");
    }).catch((configError) => {
      if (!active) return;
      setPaymentConfigError(configError instanceof Error ? configError.message : "Payment configuration could not be loaded.");
    });
    return () => {
      active = false;
    };
  }, []);
  const updateForm = reactExports.useCallback((key) => (event) => {
    setForm((current) => ({
      ...current,
      [key]: event.target.value
    }));
  }, []);
  const validate = reactExports.useCallback(() => {
    const isValid = isDeliveryFormComplete(form);
    if (!isValid) setError("Please fill all delivery details.");
    return isValid;
  }, [form]);
  const confirmOrder = reactExports.useCallback((event) => {
    event.preventDefault();
    setError("");
    if (validate()) setShowPaymentOptions(true);
  }, [validate]);
  const ensurePaymentConfig = reactExports.useCallback(async () => {
    try {
      const config = paymentConfig || await getPaymentConfig();
      setPaymentConfig(config);
      setPaymentConfigError("");
      return config;
    } catch (configError) {
      const message = configError instanceof Error ? configError.message : "Payment configuration could not be loaded.";
      setPaymentConfigError(message);
      setError(message);
      throw configError;
    }
  }, [paymentConfig]);
  const handleOrderSuccess = reactExports.useCallback(async (paymentResponse, paymentName, paymentGateway = "Razorpay", paymentStatus = "paid") => {
    try {
      const address = buildDeliveryAddressText(form);
      const order = await retryOperation(() => ordersApi.create({
        customerName: form.name.trim(),
        email: form.email.trim(),
        mobileNumber: form.phone.trim(),
        phone: form.phone.trim(),
        address,
        shippingAddress: buildShippingAddress(form),
        couponCode: cartCouponCode || void 0,
        clearCart: true,
        items: cart.map((item) => ({
          productId: item.product.id || item.product._id || "",
          quantity: item.quantity,
          size: item.size.size
        })),
        paymentId: paymentResponse.razorpay_payment_id,
        paymentMethod: paymentName,
        paymentGateway,
        paymentOrderId: paymentResponse.razorpay_order_id,
        paymentSignature: paymentResponse.razorpay_signature,
        paymentStatus
      }), 1);
      const orderItems = orderItemsForSuccess(order);
      saveBuyNowSuccessState({
        buyNowOrderItems: orderItems,
        buyNowCustomer: {
          ...form,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address
        },
        buyNowPaymentMethod: paymentName,
        buyNowPaymentId: paymentResponse.razorpay_payment_id,
        buyNowPaymentOrderId: paymentResponse.razorpay_order_id,
        buyNowPaymentGateway: paymentGateway,
        buyNowPaymentStatus: order.paymentStatus || paymentStatus,
        buyNowOrderStatus: order.status || order.orderStatus,
        buyNowOrderId: order.publicOrderId || "",
        buyNowPublicOrderId: order.publicOrderId || "",
        buyNowOrderDate: order.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
        buyNowCouponCode: order.couponCode || "",
        buyNowSubtotal: order.subtotalAmount ?? cartTotal,
        buyNowDiscount: order.discountAmount ?? cartDiscount,
        buyNowFinalTotal: order.totalAmount ?? cartFinalTotal,
        buyNowShouldOpenWhatsApp: paymentStatus === "paid" && paymentGateway === "Razorpay"
      });
      clearCart();
      addNotification(paymentStatus === "failed" ? "Test failed-payment order created." : paymentStatus === "pending" ? "Test pending-payment order created." : paymentStatus === "cod" ? "Test COD order created." : "Payment successful. Order placed.");
      nav({
        to: "/success"
      });
    } catch (ex) {
      const message = ex instanceof Error ? ex.message : "Order could not be saved.";
      setError(message);
      addNotification(message, "error");
    } finally {
      setVerificationMessage("");
      setLoading(null);
    }
  }, [addNotification, cart, cartCouponCode, cartDiscount, cartFinalTotal, cartTotal, clearCart, form, nav]);
  const handleBypassPayment = reactExports.useCallback(async (paymentOptionId) => {
    setError("");
    setLoading(paymentOptionId);
    try {
      await ensurePaymentConfig();
      const testOption = getTestPaymentOption(paymentOptionId);
      await handleOrderSuccess(createMockPaymentResponse(), testOption.paymentStatus === "cod" ? "cod" : "test-bypass", "test-mode", testOption.paymentStatus);
    } catch (bypassError) {
      const message = bypassError instanceof Error ? bypassError.message : "Test checkout could not be completed.";
      setError(message);
      addNotification(message, "error");
    } finally {
      setLoading(null);
    }
  }, [addNotification, ensurePaymentConfig, handleOrderSuccess]);
  const handlePayment = reactExports.useCallback(async (paymentOptionId, paymentName) => {
    if (!validate()) return;
    let config;
    try {
      config = await ensurePaymentConfig();
    } catch {
      return;
    }
    if (config.bypassEnabled) {
      await handleBypassPayment(paymentOptionId);
      return;
    }
    const razorpayKey = config.keyId;
    if (!razorpayKey) {
      setError("Razorpay key is missing in backend/.env.");
      return;
    }
    setLoading(paymentOptionId);
    let razorpayOrder;
    try {
      razorpayOrder = await paymentsApi.createOrder({
        items: cart.map((item) => ({
          productId: item.product.id || item.product._id || "",
          quantity: item.quantity,
          size: item.size.size
        })),
        couponCode: cartCouponCode || void 0,
        currency: "INR"
      });
    } catch (orderError) {
      const message = orderError instanceof Error ? orderError.message : "Payment order could not be created.";
      setLoading(null);
      setError(message);
      addNotification(message, "error");
      return;
    }
    const sdkLoaded = await loadRazorpay();
    if (!sdkLoaded) {
      setLoading(null);
      setError("Razorpay SDK failed to load.");
      return;
    }
    const Razorpay = window.Razorpay;
    if (!Razorpay) {
      setLoading(null);
      setError("Razorpay SDK failed to initialize.");
      return;
    }
    const paymentObject = new Razorpay({
      key: razorpayKey,
      order_id: razorpayOrder.order_id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Purefumes Hyderabad",
      description: "Cart Checkout",
      config: upiOnlyDisplayConfig,
      handler: (response) => {
        void (async () => {
          try {
            setVerificationMessage("Verifying your payment...");
            await retryOperation(() => verifyRazorpayResponse(response), 1);
            setVerificationMessage("Saving your order...");
            await handleOrderSuccess(response, paymentName);
          } catch (verificationError) {
            const message = verificationError instanceof Error ? verificationError.message : "Payment could not be verified.";
            setLoading(null);
            setVerificationMessage("");
            setError(message);
            addNotification(message, "error");
          }
        })();
      },
      prefill: {
        name: form.name.trim(),
        email: form.email.trim(),
        contact: form.phone.trim()
      },
      notes: {
        items: String(cart.length),
        couponCode: cartCouponCode || "",
        paymentOption: paymentName
      },
      modal: {
        ondismiss: () => {
          if (!verificationMessage) {
            setLoading(null);
          }
        }
      },
      theme: {
        color: "#5B3A29"
      }
    });
    paymentObject.on("payment.failed", (response) => {
      const message = response.error?.description || "Payment could not be completed.";
      setLoading(null);
      setError(message);
      addNotification(message, "error");
    });
    paymentObject.open();
  }, [addNotification, cart, cartCouponCode, ensurePaymentConfig, form.name, form.phone, handleBypassPayment, handleOrderSuccess, validate, verificationMessage]);
  const isBypassMode = Boolean(paymentConfig?.bypassEnabled);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(SiteShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentVerificationOverlay, { message: verificationMessage }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-12 md:py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.4em] text-gold", children: "Checkout" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 font-display text-5xl text-navy", children: "Secure Checkout" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: confirmOrder, className: "rounded-lg border border-border bg-card p-6 shadow-soft md:p-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DeliveryDetailsFields, { form, onChange: updateForm }),
          error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm text-red-600", children: error }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "gold", disabled: Boolean(loading || verificationMessage), className: "mt-6 w-full", children: "Continue to Payment" }),
          paymentConfigError && !paymentConfig ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { description: paymentConfigError, onRetry: () => void ensurePaymentConfig() }) }) : null,
          showPaymentOptions ? !paymentConfig && !paymentConfigError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-24 w-full" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-24 w-full" })
          ] }) : isBypassMode ? /* @__PURE__ */ jsxRuntimeExports.jsx(DevelopmentPaymentPanel, { loading, onSelect: handlePayment }) : /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentOptions, { loading, onSelect: handlePayment }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "h-fit rounded-lg border border-border bg-navy p-6 text-beige shadow-luxe", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.32em] text-gold", children: "Order Summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 space-y-4", children: cart.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4 text-sm text-beige/75", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              item.product.name,
              " x ",
              item.quantity
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatINR(multiplyMoney(item.size.price, item.quantity)) })
          ] }, item.key)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 border-t border-beige/10 pt-5 text-sm text-beige/75", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Subtotal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatINR(cartTotal) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Discount" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "-",
                formatINR(cartDiscount)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Shipping Charges" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: cartShippingCharge > 0 ? formatINR(cartShippingCharge) : "Free" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 border-t border-beige/10 pt-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.6rem] uppercase tracking-[0.28em] text-beige/55", children: "Final Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-4xl text-beige", children: formatINR(cartPayableTotal) }),
            isBypassMode ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs uppercase tracking-[0.2em] text-amber-300", children: "TEST MODE" }) : null
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  CheckoutPage as component
};
