import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PackageSearch, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { SiteShell } from "@/components/layout/SiteShell";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { setRedirectAfterLogin } from "@/lib/auth-redirect";
import { formatINR } from "@/lib/money";
import { getOrderDisplayId } from "@/lib/order-id";
import { formatOrderStatusLabel, formatPaymentStatusLabel } from "@/lib/order-status";
import { ordersApi, type Order } from "@/services/api";

export const Route = createFileRoute("/my-orders")({
  component: MyOrdersPage,
});

function MyOrdersPage() {
  const nav = useNavigate();
  const { user, authReady } = useAuth();
  const { reloadCart } = useApp();
  const { addNotification } = useNotification();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authReady && !user) {
      setRedirectAfterLogin("/my-orders");
      nav({ to: "/login" });
    }
  }, [authReady, nav, user]);

  useEffect(() => {
    if (!user) return;
    ordersApi
      .myOrders({ page: 1, limit: 30 })
      .then((result) => setOrders(result.orders))
      .finally(() => setLoading(false));
  }, [user]);

  const reorder = useCallback(
    async (orderId: string) => {
      await ordersApi.reorder(orderId);
      await reloadCart();
      addNotification("Order items added to cart.");
      nav({ to: "/cart" });
    },
    [addNotification, nav, reloadCart],
  );

  if (!authReady || !user) return null;

  return (
    <SiteShell>
      <section className="py-12 md:py-16">
        <Container>
          <header>
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gold">Orders</p>
            <h1 className="mt-2 font-display text-5xl text-navy">My Orders</h1>
          </header>

          {loading ? (
            <div className="mt-10 h-48 animate-pulse rounded-lg bg-beige/60" />
          ) : orders.length === 0 ? (
            <div className="mt-10 rounded-lg border border-border bg-card p-10 text-center shadow-soft">
              <PackageSearch className="mx-auto h-10 w-10 text-gold" />
              <h2 className="mt-5 font-display text-3xl text-navy">No orders yet</h2>
              <Link to="/" className="mt-6 inline-flex rounded-lg bg-navy px-5 py-3 text-xs uppercase tracking-[0.22em] text-beige">
                Browse Fragrances
              </Link>
            </div>
          ) : (
            <div className="mt-10 space-y-5">
              {orders.map((order) => (
                <article key={order.id || order._id} className="rounded-lg border border-border bg-card p-5 shadow-soft">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[0.65rem] uppercase tracking-[0.25em] text-gold">
                        Order ID{" "}
                        <span className="font-semibold text-navy">
                          {getOrderDisplayId(order)}
                        </span>
                      </p>
                      <p className="mt-2 text-sm text-navy/60">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[0.68rem] uppercase tracking-[0.16em]">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                          Payment Status: {formatPaymentStatusLabel(order.paymentStatus)}
                        </span>
                        <span className="rounded-full bg-navy/10 px-3 py-1 text-navy/70">
                          Order Status: {formatOrderStatusLabel(order.status)}
                        </span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-display text-3xl text-navy">
                        {formatINR(order.totalAmount)}
                      </p>
                      <Button onClick={() => void reorder(order.id || order._id)} variant="outline" className="mt-3">
                        <RotateCcw className="mr-2 h-4 w-4" /> Reorder
                      </Button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {order.items.map((item) => (
                      <div key={`${item.productId}-${item.size}`} className="flex gap-4 rounded-lg bg-beige/30 p-3">
                        {item.productImage ? (
                          <OptimizedImage
                            src={item.productImage}
                            alt={item.productName}
                            width={72}
                            height={72}
                            wrapperClassName="product-fit-frame h-16 w-16 rounded-lg"
                            className="product-fit-image"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-beige text-navy/40">
                            {item.productName.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-navy">{item.productName}</p>
                          <p className="mt-1 text-sm text-navy/60">
                            {item.quantity} x {item.size || "Standard"} ·{" "}
                            {formatINR(item.priceAtPurchase ?? item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </Container>
      </section>
    </SiteShell>
  );
}
