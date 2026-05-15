import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
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
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import {
  clearBuyNowCheckoutState,
  type BuyNowCustomer,
  getBuyNowCheckoutState,
  paymentOptions,
  saveBuyNowSuccessState,
} from "@/lib/buy-now";
import { couponsApi, ordersApi, paymentsApi, type PaymentConfig } from "@/services/api";

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

export const Route = createFileRoute("/checkout")({
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
        Development bypass is enabled, so checkout will create a real order, mark the payment as
        successful, update stock, clear the cart when required, and continue the normal order flow
        without Razorpay signature verification.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {paymentOptions.map((option) => {
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
                {processing ? "Creating test order..." : "Mark paid with test-bypass and continue."}
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
  const { user, authReady } = useAuth();
  const { cart } = useApp();
  const [buyNowState] = useState(() => getBuyNowCheckoutState());
  const product = buyNowState.buyNowProduct;
  const size = buyNowState.buyNowSize ?? product?.sizes[0];
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState<DeliveryFormValues>(() => createDeliveryFormFromUser(user));
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [paymentConfigError, setPaymentConfigError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponTone, setCouponTone] = useState<CouponFeedbackTone | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if (!authReady || user) return;
    window.localStorage.setItem("purefumes_redirect_after_login", "/checkout");
    nav({ to: "/login" });
  }, [authReady, nav, user]);

  useEffect(() => {
    if (!user) return;

    setForm((current) =>
      current.name.trim() || current.phone.trim() ? current : createDeliveryFormFromUser(user),
    );
  }, [user]);

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

  useEffect(() => {
    if (!user) return;

    setForm((current) =>
      current.name.trim() || current.phone.trim() ? current : createDeliveryFormFromUser(user),
    );
  }, [user]);

  const maxQuantity = Math.max(1, product?.stock || 1);

  const subtotal = useMemo(() => {
    if (!size) return 0;
    return size.price * quantity;
  }, [quantity, size]);
  const discount = appliedCoupon?.discount ?? 0;
  const finalTotal = appliedCoupon?.finalTotal ?? subtotal;

  useEffect(() => {
    if (appliedCoupon && appliedCoupon.subtotal !== subtotal) {
      setAppliedCoupon(null);
      setCouponMessage("Coupon removed because order details changed. Apply it again to recalculate.");
      setCouponTone("info");
    }
  }, [appliedCoupon, subtotal]);

  const updateForm = useCallback(
    (key: keyof DeliveryFormValues) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
              quantity,
              size: size.size,
            },
          ],
        });

        setAppliedCoupon({
          code: result.code,
          discount: result.discount,
          finalTotal: result.finalTotal,
          subtotal: result.subtotal,
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
    [couponCode, product, quantity, size],
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
    ) => {
      if (!product || !size) return;

      const deliveryAddress = buildDeliveryAddressText(form);
      const shippingAddress = buildShippingAddress(form);
      const customer: BuyNowCustomer = {
        ...form,
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: deliveryAddress,
      };

      try {
        const order = await ordersApi.create({
          customerName: customer.name,
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
        });

        saveBuyNowSuccessState({
          buyNowProduct: product,
          buyNowSize: size,
          buyNowQuantity: quantity,
          buyNowCustomer: customer,
          buyNowPaymentMethod: paymentName,
          buyNowPaymentId: paymentResponse.razorpay_payment_id,
          buyNowPaymentGateway: paymentGateway,
          buyNowOrderId: order.id || order._id,
          buyNowCouponCode: order.couponCode || "",
          buyNowSubtotal: order.subtotalAmount ?? subtotal,
          buyNowDiscount: order.discountAmount ?? 0,
          buyNowFinalTotal: order.totalAmount,
        });
        clearBuyNowCheckoutState();
        addNotification("Payment successful. Order placed.");
        nav({ to: "/success" });
      } catch (ex) {
        const message =
          ex instanceof Error ? ex.message : "Order could not be saved after payment.";
        setLoading(null);
        setError(message);
        addNotification(message, "error");
      } finally {
        setLoading(null);
      }
    },
    [
      addNotification,
      appliedCoupon?.code,
      form,
      nav,
      product,
      quantity,
      size,
      subtotal,
    ],
  );

  const handleBypassPayment = useCallback(
    async (paymentOptionId: string) => {
      if (!product || !size) return;

      setError("");
      setLoading(paymentOptionId);

      try {
        await ensurePaymentConfig();
        await handleOrderSuccess(createMockPaymentResponse(), "test-bypass", "test-bypass");
        addNotification("Development bypass created a paid test order.");
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
        amount: Math.round(finalTotal * 100),
        currency: "INR",
        name: "Purefumes Hyderabad",
        description: `Order Payment - ${product.name}`,
        config: upiOnlyDisplayConfig,
        handler: (response) => {
          void handleOrderSuccess(response, paymentName);
        },
        prefill: {
          name: form.name.trim(),
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
            setLoading(null);
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
      finalTotal,
      form.name,
      form.phone,
      handleBypassPayment,
      handleOrderSuccess,
      product,
      quantity,
      size,
      validateCustomerDetails,
    ],
  );

  const isBypassMode = Boolean(paymentConfig?.bypassEnabled);

  if (!authReady) {
    return (
      <SiteShell>
        <section className="py-20 md:py-24">
          <Container>
            <div className="mx-auto h-40 max-w-2xl animate-pulse rounded-lg bg-beige/60" />
          </Container>
        </section>
      </SiteShell>
    );
  }

  if (!user) {
    return null;
  }

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
      <section className="py-12 md:py-16">
        <Container>
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gold">Checkout</p>
              <h1 className="mt-2 font-display text-5xl text-navy">Buy It Now</h1>
            </div>
            <Link
              to="/product/$id"
              params={{ id: product.id }}
              className="text-xs uppercase tracking-[0.25em] text-navy/60 transition duration-300 ease-in-out hover:text-navy"
            >
              Back to Product
            </Link>
          </header>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
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
                  <h2 className="mt-2 font-display text-3xl text-navy">{product.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{size.size}</p>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    {product.description}
                  </p>
                </div>
              </div>

              <form onSubmit={confirmOrder} className="mt-8 space-y-5">
                <div>
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

                <DeliveryDetailsFields form={form} onChange={updateForm} />

                {error ? <p className="text-sm text-red-600">{error}</p> : null}

                <Button
                  type="submit"
                  variant="gold"
                  disabled={Boolean(loading)}
                  className="mt-2 w-full rounded-full px-6 py-3 text-[0.72rem] font-semibold tracking-[0.28em]"
                >
                  Confirm Order
                </Button>
              </form>

              {paymentConfigError && !paymentConfig ? (
                <div className="mt-6">
                  <ErrorState description={paymentConfigError} onRetry={() => void ensurePaymentConfig()} />
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
            </div>

            <aside className="h-fit rounded-2xl border border-border bg-navy p-6 text-beige shadow-luxe">
              <p className="text-[0.65rem] uppercase tracking-[0.32em] text-gold">Order Summary</p>
              <div className="mt-5 space-y-4 text-sm text-beige/75">
                <div className="flex items-center justify-between gap-4">
                  <span>Price</span>
                  <span>Rs. {size.price}</span>
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
                  <span>Rs. {subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Discount</span>
                  <span className={discount > 0 ? "text-green-300" : ""}>
                    -Rs. {discount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <div className="mt-5 border-t border-beige/10 pt-5">
                <p className="text-[0.6rem] uppercase tracking-[0.28em] text-beige/55">
                  Final Total
                </p>
                <p className="mt-2 font-display text-4xl text-beige">
                  Rs. {finalTotal.toLocaleString("en-IN")}
                </p>
                {isBypassMode ? (
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-amber-300">
                    Development payment bypass enabled
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
  const { user } = useAuth();
  const {
    cart,
    cartTotal,
    cartDiscount,
    cartFinalTotal,
    cartCouponCode,
    clearCart,
  } = useApp();
  const [form, setForm] = useState<DeliveryFormValues>(() => createDeliveryFormFromUser(user));
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [paymentConfigError, setPaymentConfigError] = useState("");

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
    (key: keyof DeliveryFormValues) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    ) => {
      try {
        await ordersApi.create({
          customerName: form.name.trim(),
          phone: form.phone.trim(),
          address: buildDeliveryAddressText(form),
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
        });

        clearCart();
        addNotification("Payment successful. Order placed.");
        nav({ to: "/my-orders" });
      } catch (ex) {
        const message = ex instanceof Error ? ex.message : "Order could not be saved.";
        setError(message);
        addNotification(message, "error");
      } finally {
        setLoading(null);
      }
    },
    [addNotification, cart, cartCouponCode, clearCart, form, nav],
  );

  const handleBypassPayment = useCallback(
    async (paymentOptionId: string) => {
      setError("");
      setLoading(paymentOptionId);

      try {
        await ensurePaymentConfig();
        await handleOrderSuccess(createMockPaymentResponse(), "test-bypass", "test-bypass");
        addNotification("Development bypass created a paid test order.");
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
        amount: Math.round(cartFinalTotal * 100),
        currency: "INR",
        name: "Purefumes Hyderabad",
        description: "Cart Checkout",
        config: upiOnlyDisplayConfig,
        handler: (response) => {
          void handleOrderSuccess(response, paymentName);
        },
        prefill: {
          name: form.name.trim(),
          contact: form.phone.trim(),
        },
        notes: {
          items: String(cart.length),
          couponCode: cartCouponCode || "",
          paymentOption: paymentName,
        },
        modal: {
          ondismiss: () => setLoading(null),
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
      cart.length,
      cartCouponCode,
      cartFinalTotal,
      ensurePaymentConfig,
      form.name,
      form.phone,
      handleBypassPayment,
      handleOrderSuccess,
      validate,
    ],
  );

  const isBypassMode = Boolean(paymentConfig?.bypassEnabled);

  return (
    <SiteShell>
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
              <Button type="submit" variant="gold" className="mt-6 w-full">
                Continue to Payment
              </Button>

              {paymentConfigError && !paymentConfig ? (
                <div className="mt-6">
                  <ErrorState description={paymentConfigError} onRetry={() => void ensurePaymentConfig()} />
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
              <p className="text-[0.65rem] uppercase tracking-[0.32em] text-gold">
                Order Summary
              </p>
              <div className="mt-5 space-y-4">
                {cart.map((item) => (
                  <div key={item.key} className="flex justify-between gap-4 text-sm text-beige/75">
                    <span>
                      {item.product.name} x {item.quantity}
                    </span>
                    <span>Rs. {(item.size.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-beige/10 pt-5 text-sm text-beige/75">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs. {cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="mt-3 flex justify-between">
                  <span>Discount</span>
                  <span>-Rs. {cartDiscount.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div className="mt-5 border-t border-beige/10 pt-5">
                <p className="text-[0.6rem] uppercase tracking-[0.28em] text-beige/55">
                  Final Total
                </p>
                <p className="mt-2 font-display text-4xl text-beige">
                  Rs. {cartFinalTotal.toLocaleString("en-IN")}
                </p>
                {isBypassMode ? (
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-amber-300">
                    Development payment bypass enabled
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
