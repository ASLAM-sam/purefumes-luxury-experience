import { createFileRoute, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Container } from "@/components/common/Container";
import { Button } from "@/components/common/Button";
import { PaymentOptions } from "@/components/checkout/PaymentOptions";
import { useNotification } from "@/context/NotificationContext";
import type { BuyNowCustomer, BuyNowState } from "@/lib/buy-now";
import { ordersApi, paymentsApi } from "@/services/api";

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

let razorpayScriptPromise: Promise<boolean> | null = null;
let razorpayKeyPromise: Promise<string> | null = null;

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
    const existingScript = document.querySelector(`script[src="${RAZORPAY_URL}"]`) as
      | HTMLScriptElement
      | null;

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

const getRazorpayKey = async () => {
  if (!razorpayKeyPromise) {
    razorpayKeyPromise = paymentsApi.getRazorpayKey();
  }

  return razorpayKeyPromise;
};

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

function CheckoutPage() {
  const location = useLocation();
  const nav = useNavigate();
  const { addNotification } = useNotification();
  const state = (location.state as BuyNowState | undefined) ?? {};
  const product = state.buyNowProduct;
  const size = state.buyNowSize ?? product?.sizes[0];
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState<BuyNowCustomer>({ name: "", phone: "", address: "" });
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const maxQuantity = Math.max(1, product?.stock || 1);

  const total = useMemo(() => {
    if (!size) return 0;
    return size.price * quantity;
  }, [quantity, size]);

  const updateForm = useCallback(
    (key: keyof BuyNowCustomer) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const validateCustomerDetails = useCallback(() => {
    const isValid = Boolean(form.name.trim() && form.phone.trim() && form.address.trim());

    if (!isValid) {
      window.alert("Please fill all details");
    }

    return isValid;
  }, [form.address, form.name, form.phone]);

  const confirmOrder = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();

      if (!validateCustomerDetails()) {
        return;
      }

      setError("");
      setShowPaymentOptions(true);
    },
    [validateCustomerDetails],
  );

  const handleOrderSuccess = useCallback(
    async (
      paymentResponse: RazorpaySuccessResponse,
      paymentOptionId: string,
      paymentName: string,
    ) => {
      if (!product || !size) return;

      const customer = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      };

      try {
        const order = await ordersApi.create({
          customerName: customer.name,
          phone: customer.phone,
          address: customer.address,
          items: [
            {
              productId: product.id,
              quantity,
              size: size.size,
            },
          ],
          paymentId: paymentResponse.razorpay_payment_id,
          paymentMethod: paymentName,
          paymentGateway: "Razorpay",
          paymentOrderId: paymentResponse.razorpay_order_id,
          paymentSignature: paymentResponse.razorpay_signature,
        });

        addNotification("Payment successful. Order placed.");
        nav({
          to: "/success",
          state: {
            buyNowProduct: product,
            buyNowSize: size,
            buyNowQuantity: quantity,
            buyNowCustomer: customer,
            buyNowPaymentMethod: paymentName,
            buyNowPaymentId: paymentResponse.razorpay_payment_id,
            buyNowPaymentGateway: "Razorpay",
            buyNowOrderId: order.id || order._id,
          },
        });
      } catch (ex) {
        const message = ex instanceof Error ? ex.message : "Order could not be saved after payment.";
        setLoading(null);
        setError(message);
        addNotification(message, "error");
      } finally {
        setLoading(null);
      }
    },
    [addNotification, form.address, form.name, form.phone, nav, product, quantity, size],
  );

  const handlePayment = useCallback(
    async (paymentOptionId: string, paymentName: string) => {
      if (!product || !size) return;

      if (!validateCustomerDetails()) {
        return;
      }

      const razorpayKey = await getRazorpayKey();
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
        amount: Math.round(total * 100),
        currency: "INR",
        name: "Purefumes Hyderabad",
        description: `Order Payment - ${product.name}`,
        config: upiOnlyDisplayConfig,
        handler: (response) => {
          void handleOrderSuccess(response, paymentOptionId, paymentName);
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
          paymentOption: paymentName,
        },
        modal: {
          ondismiss: () => {
            setLoading(null);
          },
        },
        theme: {
          color: "#07203F",
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
      form.name,
      form.phone,
      handleOrderSuccess,
      product,
      quantity,
      size,
      total,
      validateCustomerDetails,
    ],
  );

  if (!product || !size) {
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
                <img
                  src={product.image}
                  alt={product.name}
                  className="aspect-square w-full rounded-xl bg-beige object-cover md:w-32"
                />
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.34em] text-gold">{product.brand}</p>
                  <h2 className="mt-2 font-display text-3xl text-navy">{product.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{size.size}</p>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{product.description}</p>
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    required
                    value={form.name}
                    onChange={updateForm("name")}
                    placeholder="Full name"
                    className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition duration-300 ease-in-out focus:border-gold"
                  />
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={updateForm("phone")}
                    placeholder="Phone number"
                    className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition duration-300 ease-in-out focus:border-gold"
                  />
                </div>

                <textarea
                  required
                  value={form.address}
                  onChange={updateForm("address")}
                  rows={4}
                  placeholder="Delivery address"
                  className="w-full resize-none rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition duration-300 ease-in-out focus:border-gold"
                />

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

              {showPaymentOptions ? (
                <PaymentOptions loading={loading} onSelect={handlePayment} />
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
              </div>
              <div className="mt-5 border-t border-beige/10 pt-5">
                <p className="text-[0.6rem] uppercase tracking-[0.28em] text-beige/55">Total</p>
                <p className="mt-2 font-display text-4xl text-beige">Rs. {total}</p>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
