import { memo, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Check,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingCart,
} from "lucide-react";
import { useNotification } from "@/context/NotificationContext";
import { auth, isUsingMock, ordersApi, type Order } from "@/services/api";

const items = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", Icon: Package, exact: false },
  { to: "/admin/orders", label: "Orders", Icon: ShoppingCart, exact: false },
] as const;

const ORDER_NOTIFICATION_REFRESH_MS = 10 * 60 * 1000;

const getOrderId = (order: Order) => order._id || order.id || "";

export const AdminShell = memo(function AdminShell({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const loc = useLocation();
  const { addNotification } = useNotification();
  const [orderNotifications, setOrderNotifications] = useState<Order[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const previousUnseenCountRef = useRef<number | null>(null);

  const onLogout = () => {
    auth.clear();
    nav({ to: "/admin/login" });
  };

  const fetchOrderNotifications = useCallback(async () => {
    try {
      const unseenOrders = await ordersApi.unseen();
      setOrderNotifications(unseenOrders);
      setNotificationError("");

      const previousCount = previousUnseenCountRef.current;
      if (previousCount !== null && unseenOrders.length > previousCount) {
        const difference = unseenOrders.length - previousCount;
        addNotification(
          `${difference} new ${difference === 1 ? "order" : "orders"} received.`,
          "info",
        );
      }

      previousUnseenCountRef.current = unseenOrders.length;
    } catch (error) {
      setNotificationError(
        error instanceof Error ? error.message : "Order notifications could not be loaded.",
      );
    }
  }, [addNotification]);

  useEffect(() => {
    fetchOrderNotifications();

    const onOrderChanged = () => fetchOrderNotifications();
    window.addEventListener("purefumes:orders-changed", onOrderChanged);
    const intervalId = window.setInterval(fetchOrderNotifications, ORDER_NOTIFICATION_REFRESH_MS);

    return () => {
      window.removeEventListener("purefumes:orders-changed", onOrderChanged);
      window.clearInterval(intervalId);
    };
  }, [fetchOrderNotifications]);

  const markAsSeen = useCallback(
    async (order: Order) => {
      const id = getOrderId(order);
      if (!id) return;

      try {
        await ordersApi.markSeen(id);
        setOrderNotifications((current) =>
          current.filter((notification) => getOrderId(notification) !== id),
        );
        previousUnseenCountRef.current = Math.max(0, orderNotifications.length - 1);
        addNotification("Order notification marked as seen.");
      } catch (error) {
        addNotification(
          error instanceof Error ? error.message : "Order notification could not be updated.",
          "error",
        );
      }
    },
    [addNotification, orderNotifications.length],
  );

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-64 flex-col bg-navy text-beige p-6 sticky top-0 h-screen">
        <Link to="/admin" className="font-display text-2xl">
          <span className="text-beige">Pure</span>
          <span className="text-gold">fumes</span>
          <span className="block text-[0.6rem] tracking-[0.4em] uppercase text-beige/50 mt-1">
            Admin
          </span>
        </Link>

        <nav className="mt-10 space-y-1">
          {items.map(({ to, label, Icon, exact }) => {
            const active = exact ? loc.pathname === to : loc.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                  active ? "bg-beige text-navy" : "text-beige/70 hover:bg-beige/10 hover:text-beige"
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => setNotificationOpen((open) => !open)}
            className="relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-beige/70 transition hover:bg-beige/10 hover:text-beige"
          >
            <Bell className="h-4 w-4" />
            New orders
            {orderNotifications.length > 0 && (
              <span className="ml-auto flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[0.65rem] font-semibold leading-none text-white">
                {orderNotifications.length}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="mt-3 rounded-xl border border-beige/10 bg-beige/10 p-3 shadow-soft">
              {notificationError && (
                <p className="rounded-lg bg-red-500/15 px-3 py-2 text-xs text-red-100">
                  {notificationError}
                </p>
              )}

              {!notificationError && orderNotifications.length === 0 && (
                <p className="px-3 py-2 text-xs text-beige/55">No unseen orders.</p>
              )}

              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {orderNotifications.map((order) => (
                  <div
                    key={getOrderId(order)}
                    className="rounded-lg bg-beige/95 p-3 text-navy shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{order.customerName}</p>
                        <p className="mt-1 text-xs text-navy/60">
                          {order.productName || order.items?.[0]?.productName || "New order"}
                        </p>
                        <p className="mt-1 text-xs font-medium text-gold">
                          Rs.{" "}
                          {Number(order.totalAmount || order.price || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => markAsSeen(order)}
                        className="rounded-full bg-navy p-1.5 text-beige transition hover:opacity-90"
                        aria-label="Mark order notification as seen"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-beige/60 hover:text-beige px-4 py-2"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View site
          </Link>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-beige/70 hover:bg-beige/10 hover:text-beige transition"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        {isUsingMock && (
          <div className="bg-amber-100 text-amber-900 text-xs px-6 py-2 text-center border-b border-amber-200">
            Mock mode - set <code className="font-mono">VITE_API_BASE_URL</code> to connect your
            Express backend.
          </div>
        )}
        <div className="p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
});
