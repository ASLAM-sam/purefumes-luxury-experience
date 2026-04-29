import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Container } from "@/components/common/Container";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import type { BuyNowSuccessState } from "@/lib/buy-now";

export const Route = createFileRoute("/success")({
  component: SuccessPage,
});

function SuccessPage() {
  const location = useLocation();
  const state = (location.state as BuyNowSuccessState | undefined) ?? {};
  const product = state.buyNowProduct;
  const size = state.buyNowSize ?? product?.sizes[0];
  const quantity = state.buyNowQuantity ?? 1;
  const customer = state.buyNowCustomer;
  const paymentMethod = state.buyNowPaymentMethod;
  const paymentId = state.buyNowPaymentId;
  const paymentGateway = state.buyNowPaymentGateway;
  const orderId = state.buyNowOrderId;
  const total = size ? size.price * quantity : 0;
  const subtotal = state.buyNowSubtotal ?? total;
  const discount = state.buyNowDiscount ?? 0;
  const finalTotal = state.buyNowFinalTotal ?? total;
  const couponCode = state.buyNowCouponCode ?? "";

  return (
    <SiteShell>
      <section className="py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-soft md:p-10">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="mt-6 font-display text-4xl text-navy md:text-5xl">
                Order Placed Successfully
              </h1>
              <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                Your Razorpay payment was successful and your order has been saved.
              </p>
            </div>

            {product && size ? (
              <div className="mt-10 grid gap-8 md:grid-cols-[8rem_minmax(0,1fr)]">
                {product.image ? (
                  <OptimizedImage
                    src={product.image}
                    alt={product.name}
                    width={180}
                    height={180}
                    sizes="8rem"
                    className="aspect-square w-full rounded-xl bg-beige object-cover md:w-32"
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-beige text-3xl font-display text-navy/35 md:w-32">
                    {product.name.trim().charAt(0).toUpperCase() || "P"}
                  </div>
                )}
                <div className="space-y-5">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.34em] text-gold">
                      {product.brand}
                    </p>
                    <h2 className="mt-2 font-display text-3xl text-navy">{product.name}</h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-beige/30 p-4">
                      <p className="text-[0.62rem] uppercase tracking-[0.3em] text-navy/55">
                        Order Details
                      </p>
                      <div className="mt-3 space-y-2 text-sm text-navy/75">
                        <p>Size: {size.size}</p>
                        <p>Quantity: {quantity}</p>
                        <p>Subtotal: Rs. {subtotal.toLocaleString("en-IN")}</p>
                        <p>Discount: -Rs. {discount.toLocaleString("en-IN")}</p>
                        <p>Final Total: Rs. {finalTotal.toLocaleString("en-IN")}</p>
                        <p>Coupon: {couponCode || "-"}</p>
                        <p>Gateway: {paymentGateway || "Razorpay"}</p>
                        <p>Method: {paymentMethod || "Online Payment"}</p>
                        <p>Payment ID: {paymentId || "-"}</p>
                        <p>Order ID: {orderId || "-"}</p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-beige/30 p-4">
                      <p className="text-[0.62rem] uppercase tracking-[0.3em] text-navy/55">
                        Delivery To
                      </p>
                      <div className="mt-3 space-y-2 text-sm text-navy/75">
                        <p>{customer?.name || "Customer"}</p>
                        <p>{customer?.phone || "-"}</p>
                        <p>{customer?.address || "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-8 text-center text-sm text-muted-foreground">
                Your order summary is unavailable, but no order is created until Razorpay confirms
                the payment.
              </p>
            )}

            <div className="mt-10 text-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full bg-navy px-6 py-3 text-xs uppercase tracking-[0.28em] text-beige transition duration-300 ease-in-out hover:opacity-90"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
