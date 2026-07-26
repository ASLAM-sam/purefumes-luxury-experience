import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { AutoCouponSuggestion } from "@/components/common/AutoCouponSuggestion";
import { Button } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import {
  buildDeliveryAddressText,
  buildShippingAddress,
  createDeliveryFormFromUser,
  DeliveryDetailsFields,
  isDeliveryFormComplete,
  type DeliveryFormValues,
} from "@/components/checkout/DeliveryDetailsFields";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { PaymentOptions } from "@/components/checkout/PaymentOptions";
import { SiteShell } from "@/components/layout/SiteShell";
import { useApp } from "@/context/AppContext";
import { useNotification } from "@/context/NotificationContext";
import {
  clearBuyNowCheckoutState,
  type BuyNowCustomer,
  getBuyNowCheckoutState,
  saveBuyNowSuccessState,
} from "@/lib/buy-now";
import { calculateCheckoutTotals } from "@/lib/checkout-totals";
import { formatINR, multiplyMoney, normalizeMoney } from "@/lib/money";
import { couponsApi, ordersApi, paymentsApi, type Order, type PaymentConfig } from "@/services/api";

const RAZORPAY_URL = "https://checkout.razorpay.com/v1/checkout.js";

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

type RazorpayFailureResponse = {
  error?: {
    description?: string;
  };
};

type RazorpayOptions = {
  key: string;
  order_id?: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: (response: RazorpaySuccessResponse) => void;
  config?: {
    display?: {
      blocks?: Record<
        string,
        {
          name: string;
          instruments: Array<{
            method: "upi";
          }>;
        }
      >;
      sequence?: string[];
      preferences?: {
        show_default_blocks?: boolean;
      };
    };
  };
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  modal?: {
    ondismiss?: () => void;
  };
  theme?: {
    color?: string;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: RazorpayFailureResponse) => void) => void;
};

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

type RazorpayWindow = Window & {
  Razorpay?: RazorpayConstructor;
};

type CouponFeedbackTone = "success" | "error" | "info";

type AppliedCoupon = {
  code: string;
  discount: number;
  finalTotal: number;
  subtotal: number;
};

let razorpayScriptPromise: Promise<boolean> | null = null;
let paymentConfigPromise: Promise<PaymentConfig> | null = null;

const loadRazorpay = () => {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  const razorpayWindow = window as RazorpayWindow;
  if (razorpayWindow.Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve) => {
    const existingScript = document.querySelector(
      `script[src="${RAZORPAY_URL}"]`,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        resolve(true);
        return;
      }

      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
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

const createMockPaymentResponse = (): RazorpaySuccessResponse => ({
  razorpay_payment_id: "TEST_PAYMENT_ID",
  razorpay_order_id: `TEST_ORDER_${Date.now()}`,
  razorpay_signature: "TEST_SIGNATURE",
});

const verifyRazorpayResponse = async (response: RazorpaySuccessResponse) => {
  if (!response.razorpay_order_id || !response.razorpay_signature) {
    throw new Error("Razorpay did not return complete payment verification details.");
  }

  const verification = await paymentsApi.verifyPayment({
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_order_id: response.razorpay_order_id,
    razorpay_signature: response.razorpay_signature,
  });

  if (!verification.verified) {
    throw new Error("Payment signature verification failed.");
  }
};

const testPaymentOptions = [
  {
    id: "test-paid",
    name: "Simulate Success",
    description: "Create a paid test order with a fake gateway transaction.",
    paymentStatus: "paid" as const,
  },
  {
    id: "test-pending",
    name: "Simulate Pending",
    description: "Create a pending-payment order for operational testing.",
    paymentStatus: "pending" as const,
  },
  {
    id: "test-failed",
    name: "Simulate Failed",
    description: "Create a failed-payment order while preserving stock and admin visibility.",
    paymentStatus: "failed" as const,
  },
  {
    id: "test-cod",
    name: "Simulate COD",
    description: "Create a cash-on-delivery style test order without gateway charge.",
    paymentStatus: "cod" as const,
  },
];

const getTestPaymentOption = (id: string) =>
  testPaymentOptions.find((option) => option.id === id) || testPaymentOptions[0];

const upiOnlyDisplayConfig = {
  display: {
    blocks: {
      upi_only: {
        name: "Pay via UPI",
        instruments: [
          {
            method: "upi" as const,
          },
        ],
      },
    },
    sequence: ["block.upi_only"],
    preferences: {
      show_default_blocks: false,
    },
  },
};

const wait = (duration: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });

const retryOperation = async <T,>(operation: () => Promise<T>, retries = 1): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) throw error;
    await wait(700);
    return retryOperation(operation, retries - 1);
  }
};

const orderItemsForSuccess = (order: Order) =>
  Array.isArray(order.items)
    ? order.items.map((item) => ({
        productId: item.productId,
        productName: item.productName || "Product",
        brand: item.brand || "",
        quantity: item.quantity || 1,
        size: item.size || "Standard",
        price: item.priceAtPurchase ?? item.price ?? 0,
        productImage: item.productImage || "",
      }))
    : [];

function PaymentVerificationOverlay({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[2600] flex items-center justify-center bg-[#1e1b18]/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-gold/25 bg-[#fffaf4] px-6 py-7 text-center shadow-luxe">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gold/25 border-t-gold" />
        <p className="mt-5 font-display text-2xl text-navy">{message}</p>
        <p className="mt-2 text-sm leading-6 text-navy/58">
          Please keep this tab open while we secure your order.
        </p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: CheckoutPage,
});

function DevelopmentPaymentPanel({
  loading,
  onSelect,
}: {
  loading: string | null;
  onSelect: (paymentId: string, paymentName: string) => void;
}) {
  return (
    <div className="mt-8 rounded-2xl border border-amber-200/70 bg-amber-50/80 p-6 shadow-soft">
      <p className="text-[0.65rem] uppercase tracking-[0.4em] text-amber-700">Test payment mode</p>
      <h3 className="mt-2 font-display text-3xl text-navy">Complete checkout without Razorpay</h3>
      <p className="mt-2 text-sm leading-6 text-navy/68">
        Test mode is enabled, so checkout will create real order records, update inventory, preserve
        admin analytics visibility, and simulate multiple payment outcomes without real gateway
        charges.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {testPaymentOptions.map((option) => {
          const processing = loading === option.id;

          return (
            <button
              key={option.id}
              type="button"
              disabled={Boolean(loading)}
              onClick={() => onSelect(option.id, option.name)}
              className="rounded-[1.35rem] border border-amber-200 bg-white px-4 py-5 text-left transition hover:border-amber-300 hover:shadow-[0_16px_28px_rgba(201,161,74,0.18)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <p className="text-[0.65rem] uppercase tracking-[0.24em] text-amber-700">Simulate</p>
              <p className="mt-2 font-semibold text-navy">{option.name}</p>
              <p className="mt-2 text-sm text-navy/56">
                {processing ? "Creating test order..." : option.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CheckoutPage() {
  const nav = useNavigate();
  const { addNotification } = useNotification();
  const { cart } = useApp();
  const [buyNowState] = useState(() => getBuyNowCheckoutState());
  const product = buyNowState.buyNowProduct;
  const size = buyNowState.buyNowSize ?? product?.sizes[0];
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState<DeliveryFormValues>(() => createDeliveryFormFromUser(null));
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [paymentConfigError, setPaymentConfigError] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponTone, setCouponTone] = useState<CouponFeedbackTone | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    let active = true;

    void getPaymentConfig()
      .then((config) => {
        if (!active) return;
        setPaymentConfig(config);
        setPaymentConfigError("");
      })
      .catch((configError) => {
        if (!active) return;
        setPaymentConfigError(
          configError instanceof Error
            ? configError.message
            : "Payment configuration could not be loaded.",
        );
      });

    return () => {
      active = false;
    };
  }, []);

  const maxQuantity = Math.max(1, product?.stock || 1);

  const subtotal = useMemo(() => {
    if (!size) return 0;
    return multiplyMoney(size.price, quantity);
  }, [quantity, size]);
  const discount = appliedCoupon?.discount ?? 0;
  const checkoutTotals = calculateCheckoutTotals({ subtotal, discount });
  const shippingCharge = checkoutTotals.shippingCharge;
  const finalTotal = appliedCoupon?.finalTotal ?? checkoutTotals.finalPayable;

  useEffect(() => {
    if (appliedCoupon && appliedCoupon.subtotal !== subtotal) {
      setAppliedCoupon(null);
      setCouponMessage(
        "Coupon removed because order details changed. Apply it again to recalculate.",
      );
      setCouponTone("info");
    }
  }, [appliedCoupon, subtotal]);

  const updateForm = useCallback(
    (key: keyof DeliveryFormValues) =>
      (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((current) => ({ ...current, [key]: event.target.value }));
      },
    [],
  );

  const increaseQuantity = useCallback(() => {
    setQuantity((current) => Math.min(current + 1, maxQuantity));
  }, [maxQuantity]);

  const decreaseQuantity = useCallback(() => {
    setQuantity((current) => Math.max(current - 1, 1));
  }, []);

  const applyCoupon = useCallback(
    async (codeOverride?: string) => {
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
          items: [
            {
              productId: product.id,
              name: product.name,
              price: size.price,
              quantity,
              size: size.size,
            },
          ],
        });

        if (!result || result.success === false) {
          setAppliedCoupon(null);
          setCouponMessage(result?.message || "Invalid coupon code");
          setCouponTone("error");
          return;
        }

        const discountAmount = normalizeMoney(
          result.discount ?? result.coupon?.discountValue ?? 0,
        );
        const resultSubtotal = normalizeMoney(result.subtotal ?? subtotal);
        const fallbackTotals = calculateCheckoutTotals({
          subtotal: resultSubtotal,
          discount: discountAmount,
        });
        const resultFinalTotal = normalizeMoney(result.finalTotal ?? fallbackTotals.finalPayable);

        setAppliedCoupon({
          code: result.coupon?.code || result.code || trimmedCode.toUpperCase(),
          discount: discountAmount,
          finalTotal: resultFinalTotal,
          subtotal: resultSubtotal,
        });
        setCouponMessage(result.message || "Coupon applied successfully");
        setCouponTone("success");
      } catch (couponError) {
        setAppliedCoupon(null);
        setCouponMessage(
          couponError instanceof Error ? couponError.message : "Coupon could not be applied.",
        );
        setCouponTone("error");
      } finally {
        setCouponLoading(false);
      }
    },
    [couponCode, product, quantity, size, subtotal],
  );

  const removeCoupon = useCallback(() => {
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponMessage("");
    setCouponTone(null);
  }, []);

  const validateCustomerDetails = useCallback(() => {
    const isValid = isDeliveryFormComplete(form);

    if (!isValid) {
      window.alert("Please fill all required delivery details");
    }

    return isValid;
  }, [form]);

  const confirmOrder = useCallback(
    (event: FormEvent) => {
      event.preventDefault();

      if (!validateCustomerDetails()) {
        return;
      }

      setError("");
      setShowPaymentOptions(true);
    },
    [validateCustomerDetails],
  );

  const ensurePaymentConfig = useCallback(async () => {
    try {
      const config = paymentConfig || (await getPaymentConfig());
      setPaymentConfig(config);
      setPaymentConfigError("");
      return config;
    } catch (configError) {
      const message =
        configError instanceof Error
          ? configError.message
          : "Payment configuration could not be loaded.";
      setPaymentConfigError(message);
      setError(message);
      throw configError;
    }
  }, [paymentConfig]);

  const handleOrderSuccess = useCallback(
    async (
      paymentResponse: RazorpaySuccessResponse,
      paymentName: string,
      paymentGateway = "Razorpay",
      paymentStatus: "paid" | "failed" | "pending" | "cod" = "paid",
    ) => {
      if (!product || !size) return;

      const deliveryAddress = buildDeliveryAddressText(form);
      const shippingAddress = buildShippingAddress(form);
      const customer: BuyNowCustomer = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: deliveryAddress,
      };

      try {
        const order = await retryOperation(
          () =>
            ordersApi.create({
              customerName: customer.name,
              email: customer.email,
              mobileNumber: customer.phone,
              phone: customer.phone,
              address: customer.address,
              shippingAddress,
              couponCode: appliedCoupon?.code || undefined,
              items: [
                {
                  productId: product.id,
                  quantity,
                  size: size.size,
                },
              ],
              paymentId: paymentResponse.razorpay_payment_id,
              paymentMethod: paymentName,
              paymentGateway,
              paymentOrderId: paymentResponse.razorpay_order_id,
              paymentSignature: paymentResponse.razorpay_signature,
              paymentStatus,
            }),
          1,
        );
        const orderItems = orderItemsForSuccess(order);

        saveBuyNowSuccessState({
          buyNowProduct: product,
          buyNowSize: size,
          buyNowQuantity: quantity,
          buyNowOrderItems: orderItems.length
            ? orderItems
            : [
                {
                  productId: product.id,
                  productName: product.name,
                  brand: product.brand,
                  quantity,
                  size: size.size,
                  price: size.price,
                  productImage: product.image || product.images?.[0] || "",
                },
              ],
          buyNowCustomer: customer,
          buyNowPaymentMethod: paymentName,
          buyNowPaymentId: paymentResponse.razorpay_payment_id,
          buyNowPaymentOrderId: paymentResponse.razorpay_order_id,
          buyNowPaymentGateway: paymentGateway,
          buyNowPaymentStatus: order.paymentStatus || paymentStatus,
          buyNowOrderStatus: order.status || order.orderStatus,
          buyNowOrderId: order.publicOrderId || "",
          buyNowPublicOrderId: order.publicOrderId || "",
          buyNowOrderDate: order.createdAt || new Date().toISOString(),
          buyNowCouponCode: order.couponCode || "",
          buyNowSubtotal: order.subtotalAmount ?? subtotal,
          buyNowDiscount: order.discountAmount ?? 0,
          buyNowFinalTotal: order.totalAmount,
          buyNowShouldOpenWhatsApp: paymentStatus === "paid" && paymentGateway === "Razorpay",
        });
        clearBuyNowCheckoutState();
        addNotification(
          paymentStatus === "failed"
            ? "Test failed-payment order created."
            : paymentStatus === "pending"
              ? "Test pending-payment order created."
              : paymentStatus === "cod"
                ? "Test COD order created."
                : "Payment successful. Order placed.",
        );
        nav({ to: "/success" });
      } catch (ex) {
        const message =
          ex instanceof Error ? ex.message : "Order could not be saved after payment.";
        setLoading(null);
        setError(message);
        addNotification(message, "error");
      } finally {
        setVerificationMessage("");
        setLoading(null);
      }
    },
    [addNotification, appliedCoupon?.code, form, nav, product, quantity, size, subtotal],
  );

  const handleBypassPayment = useCallback(
    async (paymentOptionId: string) => {
      if (!product || !size) return;

      setError("");
      setLoading(paymentOptionId);

      try {
        await ensurePaymentConfig();
        const testOption = getTestPaymentOption(paymentOptionId);
        await handleOrderSuccess(
          createMockPaymentResponse(),
          testOption.paymentStatus === "cod" ? "cod" : "test-bypass",
          "test-mode",
          testOption.paymentStatus,
        );
      } catch (bypassError) {
        const message =
          bypassError instanceof Error
            ? bypassError.message
            : "Test checkout could not be completed.";
        setError(message);
        addNotification(message, "error");
      } finally {
        setLoading(null);
      }
    },
    [addNotification, ensurePaymentConfig, handleOrderSuccess, product, size],
  );

  const handlePayment = useCallback(
    async (paymentOptionId: string, paymentName: string) => {
      if (!product || !size) return;

      if (!validateCustomerDetails()) {
        return;
      }

      let config: PaymentConfig;
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
          items: [
            {
              productId: product.id,
              quantity,
              size: size.size,
            },
          ],
          couponCode: appliedCoupon?.code || undefined,
          currency: "INR",
        });
      } catch (orderError) {
        const message =
          orderError instanceof Error ? orderError.message : "Payment order could not be created.";
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

      const Razorpay = (window as RazorpayWindow).Razorpay;
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
              const message =
                verificationError instanceof Error
                  ? verificationError.message
                  : "Payment could not be verified.";
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
          contact: form.phone.trim(),
        },
        notes: {
          productId: product.id,
          productName: product.name,
          size: size.size,
          quantity: String(quantity),
          couponCode: appliedCoupon?.code || "",
          paymentOption: paymentName,
        },
        modal: {
          ondismiss: () => {
            if (!verificationMessage) {
              setLoading(null);
            }
          },
        },
        theme: {
          color: "#5B3A29",
        },
      });

      paymentObject.on("payment.failed", (response) => {
        const message = response.error?.description || "Payment could not be completed.";
        setLoading(null);
        setError(message);
        addNotification(message, "error");
      });

      paymentObject.open();
    },
    [
      addNotification,
      appliedCoupon?.code,
      ensurePaymentConfig,
      form.name,
      form.phone,
      handleBypassPayment,
      handleOrderSuccess,
      product,
      quantity,
      size,
      validateCustomerDetails,
      verificationMessage,
    ],
  );

  const isBypassMode = Boolean(paymentConfig?.bypassEnabled);

  if (!product || !size) {
    if (cart.length) {
      return <CartCheckout />;
    }

    return (
      <SiteShell>
        <section className="py-20 md:py-24">
          <Container>
            <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-10 text-center shadow-soft">
              <ShoppingBag className="mx-auto h-10 w-10 text-gold" />
              <h1 className="mt-5 font-display text-4xl text-navy">Nothing to checkout</h1>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Choose a fragrance first, then use Buy It Now to continue with instant checkout.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-navy px-6 py-3 text-xs uppercase tracking-[0.28em] text-beige transition duration-300 ease-in-out hover:opacity-90"
              >
                Continue Shopping
              </Link>
            </div>
          </Container>
        </section>
      </SiteShell>
    );
  }

  const productImage = product.images?.find(Boolean) || product.image;

  return (
    <SiteShell>
      <PaymentVerificationOverlay message={verificationMessage} />
      <section className="py-12 md:py-16">
        <Container>
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gold">Checkout</p>
              <h1 className="mt-2 font-display text-4xl text-navy sm:text-5xl">Buy It Now</h1>
            </div>
            <Link
              to="/product/$id"
              params={{ id: product.id }}
              className="text-xs uppercase tracking-[0.25em] text-navy/60 transition duration-300 ease-in-out hover:text-navy"
            >
              Back to Product
            </Link>
          </header>

          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-8">
            <div className="contents lg:block lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:p-8 lg:shadow-soft">
              <div className="order-1 rounded-2xl border border-border bg-card p-5 shadow-soft lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
                <div className="grid gap-6 md:grid-cols-[8rem_minmax(0,1fr)] md:items-start">
                  {productImage ? (
                    <OptimizedImage
                      src={productImage}
                      alt={product.name}
                      width={180}
                      height={180}
                      sizes="8rem"
                      wrapperClassName="product-fit-frame aspect-square w-full rounded-xl md:w-32"
                      className="product-fit-image"
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-beige text-3xl font-display text-navy/35 md:w-32">
                      {product.name.trim().charAt(0).toUpperCase() || "P"}
                    </div>
                  )}
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.34em] text-gold">
                      {product.brand}
                    </p>
                    <h2 className="mt-2 font-display text-2xl text-navy sm:text-3xl">
                      {product.name}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">{size.size}</p>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-[0.65rem] uppercase tracking-[0.3em] text-navy/60">Quantity</p>
                  <div className="mt-3 inline-flex items-center rounded-full border border-border bg-beige/30 px-2 py-2">
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-navy/70 transition duration-300 ease-in-out hover:bg-white hover:text-navy"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-base font-medium tabular-nums text-navy">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={increaseQuantity}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-navy/70 transition duration-300 ease-in-out hover:bg-white hover:text-navy"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <form
                onSubmit={confirmOrder}
                className="order-3 space-y-5 rounded-2xl border border-border bg-card p-5 shadow-soft lg:mt-8 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
              >
                <DeliveryDetailsFields form={form} onChange={updateForm} />

                {error ? <p className="text-sm text-red-600">{error}</p> : null}

                <Button
                  type="submit"
                  variant="gold"
                  disabled={Boolean(loading || verificationMessage)}
                  className="mt-2 w-full rounded-full px-6 py-3 text-[0.72rem] font-semibold tracking-[0.28em]"
                >
                  Continue to Payment
                </Button>
              </form>

              {paymentConfigError && !paymentConfig ? (
                <div className="order-4 mt-6">
                  <ErrorState
                    description={paymentConfigError}
                    onRetry={() => void ensurePaymentConfig()}
                  />
                </div>
              ) : null}

              {showPaymentOptions ? (
                <div className="order-4 mt-8">
                  {!paymentConfig && !paymentConfigError ? (
                    <div className="space-y-3">
                      <LoadingSkeleton className="h-24 w-full" />
                      <LoadingSkeleton className="h-24 w-full" />
                    </div>
                  ) : isBypassMode ? (
                    <DevelopmentPaymentPanel loading={loading} onSelect={handlePayment} />
                  ) : (
                    <PaymentOptions loading={loading} onSelect={handlePayment} />
                  )}
                </div>
              ) : null}
            </div>

            <aside className="order-2 h-fit rounded-2xl border border-border bg-navy p-5 text-beige shadow-luxe sm:p-6 lg:sticky lg:top-28 lg:order-none">
              <p className="text-[0.65rem] uppercase tracking-[0.32em] text-gold">Order Summary</p>
              <div className="mt-5 space-y-4 text-sm text-beige/75">
                <div className="flex items-center justify-between gap-4">
                  <span>Price</span>
                  <span>{formatINR(size.price)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Quantity</span>
                  <span>{quantity}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Size</span>
                  <span>{size.size}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Discount</span>
                  <span className={discount > 0 ? "text-green-300" : ""}>
                    -{formatINR(discount)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Shipping Charges</span>
                  <span>{shippingCharge > 0 ? formatINR(shippingCharge) : "Free"}</span>
                </div>
              </div>
              <div className="mt-5 border-t border-beige/10 pt-5">
                <p className="text-[0.6rem] uppercase tracking-[0.28em] text-beige/55">
                  Final Total
                </p>
                <p className="mt-2 font-display text-4xl text-beige">{formatINR(finalTotal)}</p>
                {isBypassMode ? (
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-amber-300">
                    TEST MODE
                  </p>
                ) : null}
              </div>
              <div className="mt-5 border-t border-beige/10 pt-5">
                <p className="text-[0.6rem] uppercase tracking-[0.28em] text-beige/55">
                  Coupon Code
                </p>
                <AutoCouponSuggestion
                  subtotal={subtotal}
                  appliedCode={appliedCoupon?.code}
                  onApply={(code) => void applyCoupon(code)}
                  tone="dark"
                  className="mt-3"
                />
                <div className="mt-3 flex flex-col gap-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="w-full rounded-lg border border-beige/20 bg-white/10 px-4 py-3 text-sm uppercase text-beige outline-none transition focus:border-gold"
                  />
                  <button
                    type="button"
                    onClick={() => void applyCoupon()}
                    disabled={couponLoading}
                    className="rounded-lg bg-gold px-4 py-3 text-xs uppercase tracking-[0.2em] text-navy transition hover:opacity-90 disabled:opacity-50"
                  >
                    {couponLoading ? "Applying..." : "Apply Coupon"}
                  </button>
                </div>
                {appliedCoupon?.code ? (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-white/10 px-4 py-3 text-sm text-beige/85">
                    <span>Applied: {appliedCoupon.code}</span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs uppercase tracking-[0.2em] text-red-200 transition hover:text-red-100"
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
                {couponMessage ? (
                  <p
                    className={`mt-3 text-sm ${
                      couponTone === "error"
                        ? "text-red-200"
                        : couponTone === "info"
                          ? "text-beige/60"
                          : "text-green-300"
                    }`}
                  >
                    {couponMessage}
                  </p>
                ) : null}
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}

function CartCheckout() {
  const nav = useNavigate();
  const { addNotification } = useNotification();
  const { cart, cartTotal, cartDiscount, cartFinalTotal, cartCouponCode, clearCart } = useApp();
  const cartTotals = calculateCheckoutTotals({ subtotal: cartTotal, discount: cartDiscount });
  const cartShippingCharge = cartTotals.shippingCharge;
  const cartPayableTotal = cartCouponCode ? cartFinalTotal : cartTotals.finalPayable;
  const [form, setForm] = useState<DeliveryFormValues>(() => createDeliveryFormFromUser(null));
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [paymentConfigError, setPaymentConfigError] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");

  useEffect(() => {
    let active = true;

    void getPaymentConfig()
      .then((config) => {
        if (!active) return;
        setPaymentConfig(config);
        setPaymentConfigError("");
      })
      .catch((configError) => {
        if (!active) return;
        setPaymentConfigError(
          configError instanceof Error
            ? configError.message
            : "Payment configuration could not be loaded.",
        );
      });

    return () => {
      active = false;
    };
  }, []);

  const updateForm = useCallback(
    (key: keyof DeliveryFormValues) =>
      (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((current) => ({ ...current, [key]: event.target.value }));
      },
    [],
  );

  const validate = useCallback(() => {
    const isValid = isDeliveryFormComplete(form);
    if (!isValid) setError("Please fill all delivery details.");
    return isValid;
  }, [form]);

  const confirmOrder = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      setError("");
      if (validate()) setShowPaymentOptions(true);
    },
    [validate],
  );

  const ensurePaymentConfig = useCallback(async () => {
    try {
      const config = paymentConfig || (await getPaymentConfig());
      setPaymentConfig(config);
      setPaymentConfigError("");
      return config;
    } catch (configError) {
      const message =
        configError instanceof Error
          ? configError.message
          : "Payment configuration could not be loaded.";
      setPaymentConfigError(message);
      setError(message);
      throw configError;
    }
  }, [paymentConfig]);

  const handleOrderSuccess = useCallback(
    async (
      paymentResponse: RazorpaySuccessResponse,
      paymentName: string,
      paymentGateway = "Razorpay",
      paymentStatus: "paid" | "failed" | "pending" | "cod" = "paid",
    ) => {
      try {
        const address = buildDeliveryAddressText(form);
        const order = await retryOperation(
          () =>
            ordersApi.create({
              customerName: form.name.trim(),
              email: form.email.trim(),
              mobileNumber: form.phone.trim(),
              phone: form.phone.trim(),
              address,
              shippingAddress: buildShippingAddress(form),
              couponCode: cartCouponCode || undefined,
              clearCart: true,
              items: cart.map((item) => ({
                productId: item.product.id || item.product._id || "",
                quantity: item.quantity,
                size: item.size.size,
              })),
              paymentId: paymentResponse.razorpay_payment_id,
              paymentMethod: paymentName,
              paymentGateway,
              paymentOrderId: paymentResponse.razorpay_order_id,
              paymentSignature: paymentResponse.razorpay_signature,
              paymentStatus,
            }),
          1,
        );
        const orderItems = orderItemsForSuccess(order);

        saveBuyNowSuccessState({
          buyNowOrderItems: orderItems,
          buyNowCustomer: {
            ...form,
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            address,
          },
          buyNowPaymentMethod: paymentName,
          buyNowPaymentId: paymentResponse.razorpay_payment_id,
          buyNowPaymentOrderId: paymentResponse.razorpay_order_id,
          buyNowPaymentGateway: paymentGateway,
          buyNowPaymentStatus: order.paymentStatus || paymentStatus,
          buyNowOrderStatus: order.status || order.orderStatus,
          buyNowOrderId: order.publicOrderId || "",
          buyNowPublicOrderId: order.publicOrderId || "",
          buyNowOrderDate: order.createdAt || new Date().toISOString(),
          buyNowCouponCode: order.couponCode || "",
          buyNowSubtotal: order.subtotalAmount ?? cartTotal,
          buyNowDiscount: order.discountAmount ?? cartDiscount,
          buyNowFinalTotal: order.totalAmount ?? cartFinalTotal,
          buyNowShouldOpenWhatsApp: paymentStatus === "paid" && paymentGateway === "Razorpay",
        });

        clearCart();
        addNotification(
          paymentStatus === "failed"
            ? "Test failed-payment order created."
            : paymentStatus === "pending"
              ? "Test pending-payment order created."
              : paymentStatus === "cod"
                ? "Test COD order created."
                : "Payment successful. Order placed.",
        );
        nav({ to: "/success" });
      } catch (ex) {
        const message = ex instanceof Error ? ex.message : "Order could not be saved.";
        setError(message);
        addNotification(message, "error");
      } finally {
        setVerificationMessage("");
        setLoading(null);
      }
    },
    [
      addNotification,
      cart,
      cartCouponCode,
      cartDiscount,
      cartFinalTotal,
      cartTotal,
      clearCart,
      form,
      nav,
    ],
  );

  const handleBypassPayment = useCallback(
    async (paymentOptionId: string) => {
      setError("");
      setLoading(paymentOptionId);

      try {
        await ensurePaymentConfig();
        const testOption = getTestPaymentOption(paymentOptionId);
        await handleOrderSuccess(
          createMockPaymentResponse(),
          testOption.paymentStatus === "cod" ? "cod" : "test-bypass",
          "test-mode",
          testOption.paymentStatus,
        );
      } catch (bypassError) {
        const message =
          bypassError instanceof Error
            ? bypassError.message
            : "Test checkout could not be completed.";
        setError(message);
        addNotification(message, "error");
      } finally {
        setLoading(null);
      }
    },
    [addNotification, ensurePaymentConfig, handleOrderSuccess],
  );

  const handlePayment = useCallback(
    async (paymentOptionId: string, paymentName: string) => {
      if (!validate()) return;

      let config: PaymentConfig;
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
            size: item.size.size,
          })),
          couponCode: cartCouponCode || undefined,
          currency: "INR",
        });
      } catch (orderError) {
        const message =
          orderError instanceof Error ? orderError.message : "Payment order could not be created.";
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

      const Razorpay = (window as RazorpayWindow).Razorpay;
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
              const message =
                verificationError instanceof Error
                  ? verificationError.message
                  : "Payment could not be verified.";
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
          contact: form.phone.trim(),
        },
        notes: {
          items: String(cart.length),
          couponCode: cartCouponCode || "",
          paymentOption: paymentName,
        },
        modal: {
          ondismiss: () => {
            if (!verificationMessage) {
              setLoading(null);
            }
          },
        },
        theme: { color: "#5B3A29" },
      });

      paymentObject.on("payment.failed", (response) => {
        const message = response.error?.description || "Payment could not be completed.";
        setLoading(null);
        setError(message);
        addNotification(message, "error");
      });

      paymentObject.open();
    },
    [
      addNotification,
      cart,
      cartCouponCode,
      ensurePaymentConfig,
      form.name,
      form.phone,
      handleBypassPayment,
      handleOrderSuccess,
      validate,
      verificationMessage,
    ],
  );

  const isBypassMode = Boolean(paymentConfig?.bypassEnabled);

  return (
    <SiteShell>
      <PaymentVerificationOverlay message={verificationMessage} />
      <section className="py-12 md:py-16">
        <Container>
          <header>
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gold">Checkout</p>
            <h1 className="mt-2 font-display text-5xl text-navy">Secure Checkout</h1>
          </header>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <form
              onSubmit={confirmOrder}
              className="rounded-lg border border-border bg-card p-6 shadow-soft md:p-8"
            >
              <DeliveryDetailsFields form={form} onChange={updateForm} />
              {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
              <Button
                type="submit"
                variant="gold"
                disabled={Boolean(loading || verificationMessage)}
                className="mt-6 w-full"
              >
                Continue to Payment
              </Button>

              {paymentConfigError && !paymentConfig ? (
                <div className="mt-6">
                  <ErrorState
                    description={paymentConfigError}
                    onRetry={() => void ensurePaymentConfig()}
                  />
                </div>
              ) : null}

              {showPaymentOptions ? (
                !paymentConfig && !paymentConfigError ? (
                  <div className="mt-8 space-y-3">
                    <LoadingSkeleton className="h-24 w-full" />
                    <LoadingSkeleton className="h-24 w-full" />
                  </div>
                ) : isBypassMode ? (
                  <DevelopmentPaymentPanel loading={loading} onSelect={handlePayment} />
                ) : (
                  <PaymentOptions loading={loading} onSelect={handlePayment} />
                )
              ) : null}
            </form>

            <aside className="h-fit rounded-lg border border-border bg-navy p-6 text-beige shadow-luxe">
              <p className="text-[0.65rem] uppercase tracking-[0.32em] text-gold">Order Summary</p>
              <div className="mt-5 space-y-4">
                {cart.map((item) => (
                  <div key={item.key} className="flex justify-between gap-4 text-sm text-beige/75">
                    <span>
                      {item.product.name} x {item.quantity}
                    </span>
                    <span>{formatINR(multiplyMoney(item.size.price, item.quantity))}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-beige/10 pt-5 text-sm text-beige/75">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatINR(cartTotal)}</span>
                </div>
                <div className="mt-3 flex justify-between">
                  <span>Discount</span>
                  <span>-{formatINR(cartDiscount)}</span>
                </div>
                <div className="mt-3 flex justify-between">
                  <span>Shipping Charges</span>
                  <span>{cartShippingCharge > 0 ? formatINR(cartShippingCharge) : "Free"}</span>
                </div>
              </div>
              <div className="mt-5 border-t border-beige/10 pt-5">
                <p className="text-[0.6rem] uppercase tracking-[0.28em] text-beige/55">
                  Final Total
                </p>
                <p className="mt-2 font-display text-4xl text-beige">{formatINR(cartPayableTotal)}</p>
                {isBypassMode ? (
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-amber-300">
                    TEST MODE
                  </p>
                ) : null}
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
