import { memo, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useNotification } from "@/context/NotificationContext";
import { Button } from "@/components/common/Button";
import { ordersApi } from "@/services/api";

export const CheckoutModal = memo(function CheckoutModal() {
  const {
    cart,
    cartTotal,
    cartDiscount,
    cartFinalTotal,
    cartCouponCode,
    cartCouponMessage,
    cartCouponTone,
    cartCouponLoading,
    checkoutOpen,
    closeCheckout,
    clearCart,
    applyCartCoupon,
    removeCartCoupon,
  } = useApp();
  const { addNotification } = useNotification();
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [couponCode, setCouponCode] = useState(cartCouponCode);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const closeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setCouponCode(cartCouponCode);
  }, [cartCouponCode]);

  useEffect(
    () => () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    },
    [],
  );

  const update = useCallback(
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value })),
    [],
  );

  const resetAndClose = useCallback(() => {
    setDone(false);
    setError("");
    closeCheckout();
  }, [closeCheckout]);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!cart.length) return;

      setSubmitting(true);
      setError("");

      try {
        await ordersApi.create({
          customerName: form.name,
          phone: form.phone,
          address: form.address,
          couponCode: cartCouponCode || undefined,
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            size: item.size.size,
          })),
        });
        addNotification("Order placed.");
        clearCart();
        setDone(true);
        if (closeTimeoutRef.current) {
          window.clearTimeout(closeTimeoutRef.current);
        }
        closeTimeoutRef.current = window.setTimeout(() => {
          setForm({ name: "", phone: "", address: "" });
          resetAndClose();
        }, 2200);
      } catch (ex) {
        const message = ex instanceof Error ? ex.message : "Order could not be placed.";
        setError(message);
        addNotification(message, "error");
      } finally {
        setSubmitting(false);
      }
    },
    [addNotification, cart, clearCart, form, resetAndClose],
  );

  return (
    <AnimatePresence>
      {checkoutOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={resetAndClose}
          className="fixed inset-0 z-[95] overflow-y-auto bg-navy/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative mx-auto my-16 max-w-lg rounded-lg border border-border bg-card p-8 shadow-luxe md:p-10"
          >
            <button
              onClick={resetAndClose}
              className="absolute right-4 top-4 rounded-full bg-beige/60 p-2 text-navy hover:bg-beige"
            >
              <X className="h-4 w-4" />
            </button>

            {done ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold text-navy">
                  <Check className="h-7 w-7" />
                </div>
                <h3 className="font-display mt-6 text-3xl text-navy">Order placed</h3>
                <p className="mt-2 text-sm text-navy/60">We'll reach out shortly to confirm.</p>
              </div>
            ) : (
              <>
                <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gold">Checkout</p>
                <h3 className="font-display mt-2 text-3xl text-navy">Confirm your order</h3>

                <div className="mt-6 space-y-3 rounded-lg border border-border bg-beige/40 p-4">
                  {cart.map((item) => (
                    <div key={item.key} className="flex items-start justify-between gap-4 text-sm">
                      <div>
                        <p className="font-medium text-navy">{item.product.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-widest text-navy/50">
                          {item.size.size} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-display text-xl text-gold">
                        Rs. {item.size.price * item.quantity}
                      </p>
                    </div>
                  ))}
                  <div className="border-t border-border pt-3 text-sm text-navy/70">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span>Rs. {cartTotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span>Discount</span>
                      <span className={cartDiscount > 0 ? "text-green-700" : ""}>
                        -Rs. {cartDiscount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-xs uppercase tracking-[0.25em] text-navy/60">
                      Final Total
                    </span>
                    <span className="font-display text-2xl text-navy">
                      Rs. {cartFinalTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="mt-5 rounded-lg border border-border bg-beige/30 p-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.24em] text-navy/55">
                    Coupon Code
                  </p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      className="w-full rounded-lg border border-border bg-white/70 px-4 py-3 text-sm uppercase text-navy outline-none focus:border-navy"
                    />
                    <button
                      type="button"
                      onClick={() => void applyCartCoupon(couponCode)}
                      disabled={cartCouponLoading || !cart.length}
                      className="rounded-lg bg-navy px-4 py-3 text-xs uppercase tracking-[0.2em] text-beige transition hover:opacity-90 disabled:opacity-50"
                    >
                      {cartCouponLoading ? "Applying..." : "Apply Coupon"}
                    </button>
                  </div>
                  {cartCouponCode ? (
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-white/70 px-4 py-3 text-sm text-navy/75">
                      <span>Applied: {cartCouponCode}</span>
                      <button
                        type="button"
                        onClick={removeCartCoupon}
                        className="text-xs uppercase tracking-[0.2em] text-red-600 transition hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : null}
                  {cartCouponMessage ? (
                    <p
                      className={`mt-3 text-sm ${
                        cartCouponTone === "error"
                          ? "text-red-600"
                          : cartCouponTone === "info"
                            ? "text-navy/60"
                            : "text-green-700"
                      }`}
                    >
                      {cartCouponMessage}
                    </p>
                  ) : null}
                </div>

                <form onSubmit={submit} className="mt-6 space-y-4">
                  <input
                    required
                    value={form.name}
                    onChange={update("name")}
                    placeholder="Full name"
                    className="w-full rounded-lg border border-border bg-beige/40 px-4 py-3 text-sm outline-none focus:border-navy"
                  />
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={update("phone")}
                    placeholder="Phone number"
                    className="w-full rounded-lg border border-border bg-beige/40 px-4 py-3 text-sm outline-none focus:border-navy"
                  />
                  <textarea
                    required
                    value={form.address}
                    onChange={update("address")}
                    placeholder="Delivery address"
                    rows={3}
                    className="w-full resize-none rounded-lg border border-border bg-beige/40 px-4 py-3 text-sm outline-none focus:border-navy"
                  />
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button
                    type="submit"
                    disabled={submitting || !cart.length}
                    className="mt-4 w-full"
                  >
                    {submitting ? "Placing..." : `Place Order Rs. ${cartFinalTotal}`}
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
