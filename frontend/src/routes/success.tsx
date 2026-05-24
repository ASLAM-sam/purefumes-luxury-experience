import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Container } from "@/components/common/Container";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { getBuyNowSuccessState, type BuyNowSuccessState } from "@/lib/buy-now";
import { formatINR, multiplyMoney } from "@/lib/money";
import { formatPublicOrderId } from "@/lib/order-id";
import { formatOrderStatusLabel, formatPaymentStatusLabel } from "@/lib/order-status";
import {
  buildWhatsAppOrderUrl,
  openWhatsAppOrderUrl,
  type WhatsAppOrderDetails,
} from "@/lib/whatsapp-order";

export const Route = createFileRoute("/success")({
  component: SuccessPage,
});

function SuccessPage() {
  const [state, setState] = useState<BuyNowSuccessState>({});
  const [whatsAppNotice, setWhatsAppNotice] = useState("");
  const product = state.buyNowProduct;
  const size = state.buyNowSize ?? product?.sizes[0];
  const quantity = state.buyNowQuantity ?? 1;
  const customer = state.buyNowCustomer;
  const paymentMethod = state.buyNowPaymentMethod;
  const paymentId = state.buyNowPaymentId;
  const paymentOrderId = state.buyNowPaymentOrderId;
  const paymentGateway = state.buyNowPaymentGateway;
  const paymentStatus = state.buyNowPaymentStatus || (paymentId ? "paid" : "pending");
  const orderStatus =
    state.buyNowOrderStatus ||
    (String(paymentStatus).toLowerCase() === "paid" ? "Confirmed" : "Pending");
  const orderId = state.buyNowPublicOrderId || state.buyNowOrderId;
  const displayOrderId = formatPublicOrderId(orderId) || "Generating";
  const orderDate = state.buyNowOrderDate;
  const orderItems = useMemo(
    () =>
      state.buyNowOrderItems && state.buyNowOrderItems.length
        ? state.buyNowOrderItems
        : product && size
          ? [
              {
                productId: product.id,
                productName: product.name,
                brand: product.brand,
                quantity,
                size: size.size,
                price: size.price,
                productImage: product.image || product.images?.[0] || "",
              },
            ]
          : [],
    [product, quantity, size, state.buyNowOrderItems],
  );
  const firstItem = orderItems[0];
  const total = size ? multiplyMoney(size.price, quantity) : 0;
  const subtotal = state.buyNowSubtotal ?? total;
  const discount = state.buyNowDiscount ?? 0;
  const finalTotal = state.buyNowFinalTotal ?? total;
  const couponCode = state.buyNowCouponCode ?? "";
  const whatsAppDetails = useMemo<WhatsAppOrderDetails | null>(() => {
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
      orderDate: orderDate || new Date().toISOString(),
    };
  }, [customer, displayOrderId, finalTotal, orderDate, orderItems, paymentId]);
  const isPaidRazorpayOrder =
    String(paymentGateway || "Razorpay").toLowerCase() === "razorpay" &&
    String(paymentStatus).toLowerCase() === "paid";
  const whatsAppUrl = useMemo(
    () => (isPaidRazorpayOrder && whatsAppDetails ? buildWhatsAppOrderUrl(whatsAppDetails) : ""),
    [isPaidRazorpayOrder, whatsAppDetails],
  );

  useEffect(() => {
    setState(getBuyNowSuccessState());
  }, []);

  useEffect(() => {
    if (!state.buyNowShouldOpenWhatsApp || !whatsAppUrl) return;
    if (typeof window === "undefined") return;

    const orderKey = [displayOrderId, paymentId].filter(Boolean).join(":");
    if (!orderKey) return;

    const storageKey = `purefumes_whatsapp_order_opened:${orderKey}`;
    try {
      if (window.sessionStorage.getItem(storageKey)) return;
    } catch (_error) {
      // Session storage is best-effort; WhatsApp fallback remains visible.
    }

    const timer = window.setTimeout(() => {
      const opened = openWhatsAppOrderUrl(whatsAppUrl);
      try {
        window.sessionStorage.setItem(storageKey, "1");
      } catch (_error) {
        // A blocked storage write should not affect order success.
      }

      setWhatsAppNotice(
        opened
          ? "WhatsApp opened in a new tab. If it did not appear, use the button below."
          : "WhatsApp did not open automatically. Use the button below.",
      );
    }, 700);

    return () => window.clearTimeout(timer);
  }, [displayOrderId, paymentId, state.buyNowShouldOpenWhatsApp, whatsAppUrl]);

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

            {orderItems.length ? (
              <div className="mt-10 grid gap-8 md:grid-cols-[8rem_minmax(0,1fr)]">
                {product?.image || firstItem?.productImage ? (
                  <OptimizedImage
                    src={product?.image || firstItem?.productImage || ""}
                    alt={product?.name || firstItem?.productName || "Order item"}
                    width={180}
                    height={180}
                    sizes="8rem"
                    wrapperClassName="product-fit-frame aspect-square w-full rounded-xl md:w-32"
                    className="product-fit-image"
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-beige text-3xl font-display text-navy/35 md:w-32">
                    {(product?.name || firstItem?.productName || "P")
                      .trim()
                      .charAt(0)
                      .toUpperCase() || "P"}
                  </div>
                )}
                <div className="space-y-5">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.34em] text-gold">
                      {product?.brand || firstItem?.brand || "Purefumes Hyderabad"}
                    </p>
                    <h2 className="mt-2 font-display text-3xl text-navy">
                      {orderItems.length > 1
                        ? `${orderItems.length} fragrances confirmed`
                        : product?.name || firstItem?.productName || "Order confirmed"}
                    </h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-beige/30 p-4">
                      <p className="text-[0.62rem] uppercase tracking-[0.3em] text-navy/55">
                        Order Details
                      </p>
                      <div className="mt-3 space-y-2 text-sm text-navy/75">
                        {orderItems.map((item, index) => (
                          <p key={`${item.productId || item.productName}-${index}`}>
                            {item.productName || "Product"} × {item.quantity || 1} ×{" "}
                            {item.size || "Standard"}
                          </p>
                        ))}
                        <p>Subtotal: {formatINR(subtotal)}</p>
                        <p>Discount: -{formatINR(discount)}</p>
                        <p>Final Total: {formatINR(finalTotal)}</p>
                        <p>Coupon: {couponCode || "-"}</p>
                        <p>Payment Status: {formatPaymentStatusLabel(paymentStatus)}</p>
                        <p>Order Status: {formatOrderStatusLabel(orderStatus)}</p>
                        <p>Gateway: {paymentGateway || "Razorpay"}</p>
                        <p>Method: {paymentMethod || "Online Payment"}</p>
                        <p>Payment ID: {paymentId || "-"}</p>
                        <p>Payment Order: {paymentOrderId || "-"}</p>
                        <p className="font-semibold text-navy">
                          Order ID: {displayOrderId}
                        </p>
                        <p>
                          Order Date:{" "}
                          {orderDate ? new Date(orderDate).toLocaleString("en-IN") : "-"}
                        </p>
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
                Your order summary is unavailable. Check My Orders for the latest confirmed order
                details.
              </p>
            )}

            {whatsAppUrl ? (
              <div className="mt-8 rounded-xl border border-gold/25 bg-gold/10 p-4 text-center sm:p-5">
                {whatsAppNotice ? (
                  <p className="mb-4 text-sm leading-6 text-navy/65">{whatsAppNotice}</p>
                ) : null}
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setWhatsAppNotice("WhatsApp order message is ready to send.")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-xs uppercase tracking-[0.22em] text-beige transition duration-300 ease-in-out hover:opacity-90 sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4" />
                  Send Order on WhatsApp
                </a>
              </div>
            ) : null}

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
