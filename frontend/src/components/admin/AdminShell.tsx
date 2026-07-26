import { memo, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  BellRing,
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Images,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  MessageCircle,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Star,
  Tag,
  TicketPercent,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { formatINR } from "@/lib/money";
import { isUsingMock, ordersApi, type Order } from "@/services/api";

const items = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Users", Icon: Users, exact: false },
  { to: "/admin/analytics", label: "Analytics", Icon: BarChart3, exact: false },
  { to: "/admin/products", label: "Products", Icon: Package, exact: false },
  { to: "/admin/categories", label: "Categories", Icon: LayoutGrid, exact: false },
  { to: "/admin/bestsellers", label: "Bestsellers", Icon: Star, exact: false },
  { to: "/admin/brands", label: "Brands", Icon: Tag, exact: false },
  { to: "/admin/banners", label: "Hero Banners", Icon: Images, exact: false },
  { to: "/admin/coupons", label: "Coupons", Icon: TicketPercent, exact: false },
  { to: "/admin/orders", label: "Orders", Icon: ShoppingCart, exact: false },
  { to: "/admin/back-in-stock", label: "Back In Stock", Icon: BellRing, exact: false },
  { to: "/admin/requests", label: "Queries", Icon: MessageCircle, exact: false },
  { to: "/admin/settings", label: "Settings", Icon: Settings, exact: false },
] as const;

const ORDER_NOTIFICATION_REFRESH_MS = 10 * 60 * 1000;
const ADMIN_SIDEBAR_STORAGE_KEY = "purefumes_admin_sidebar_collapsed";

const getOrderId = (order: Order) => order._id || order.id || "";

function OrderNotificationsPanel({
  notificationError,
  orderNotifications,
  onMarkAsSeen,
}: {
  notificationError: string;
  orderNotifications: Order[];
  onMarkAsSeen: (order: Order) => void;
}) {
  return (
    <div className="rounded-xl border border-beige/10 bg-beige/10 p-3 shadow-soft">
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
          <div key={getOrderId(order)} className="rounded-lg bg-beige/95 p-3 text-navy shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{order.customerName}</p>
                <p className="mt-1 text-xs text-navy/60">
                  {order.productName || order.items?.[0]?.productName || "New order"}
                </p>
                <p className="mt-1 text-xs font-medium text-gold">
                  {formatINR(order.totalAmount ?? order.price ?? 0)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onMarkAsSeen(order)}
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
  );
}

export const AdminShell = memo(function AdminShell({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const loc = useLocation();
  const { logout } = useAuth();
  const { addNotification } = useNotification();
  const [orderNotifications, setOrderNotifications] = useState<Order[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const previousUnseenCountRef = useRef<number | null>(null);

  const onLogout = async () => {
    await logout();
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

  useEffect(() => {
    setMobileMenuOpen(false);
    setNotificationOpen(false);
  }, [loc.pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedValue = window.localStorage.getItem(ADMIN_SIDEBAR_STORAGE_KEY);
    setDesktopSidebarCollapsed(storedValue === "true");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ADMIN_SIDEBAR_STORAGE_KEY, String(desktopSidebarCollapsed));
  }, [desktopSidebarCollapsed]);

  useEffect(() => {
    if (typeof document === "undefined" || !mobileMenuOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

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
    <div className="flex min-h-screen min-w-0 bg-background">
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col bg-navy text-beige transition-all duration-300 xl:flex ${
          desktopSidebarCollapsed ? "w-24 px-3 py-5" : "w-[17rem] p-6"
        }`}
      >
        <div
          className={`flex gap-3 ${desktopSidebarCollapsed ? "flex-col items-center" : "items-start justify-between"}`}
        >
          <Link
            to="/admin"
            className={`${desktopSidebarCollapsed ? "mx-auto text-center" : ""} font-display text-2xl`}
          >
            <span className="text-beige">Pure</span>
            {!desktopSidebarCollapsed ? <span className="text-gold">fumes</span> : null}
            <span
              className={`mt-1 block uppercase text-beige/50 ${
                desktopSidebarCollapsed
                  ? "text-[0.5rem] tracking-[0.28em]"
                  : "text-[0.6rem] tracking-[0.4em]"
              }`}
            >
              Admin
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setDesktopSidebarCollapsed((current) => !current)}
            className="rounded-xl border border-beige/15 bg-beige/8 p-2 text-beige/75 transition hover:bg-beige/15 hover:text-beige"
            aria-label={desktopSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={desktopSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {desktopSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className={`space-y-1 ${desktopSidebarCollapsed ? "mt-16" : "mt-10"}`}>
          {items.map(({ to, label, Icon, exact }) => {
            const active = exact ? loc.pathname === to : loc.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                title={desktopSidebarCollapsed ? label : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                  active ? "bg-beige text-navy" : "text-beige/82 hover:bg-beige/12 hover:text-beige"
                } ${desktopSidebarCollapsed ? "justify-center px-3" : ""}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!desktopSidebarCollapsed ? <span>{label}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => setNotificationOpen((open) => !open)}
            title={desktopSidebarCollapsed ? "New orders" : undefined}
            className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-beige/82 transition hover:bg-beige/12 hover:text-beige ${
              desktopSidebarCollapsed ? "justify-center px-3" : ""
            }`}
          >
            <Bell className="h-4 w-4 shrink-0" />
            {!desktopSidebarCollapsed ? <span>New orders</span> : null}
            {orderNotifications.length > 0 && (
              <span
                className={`flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[0.65rem] font-semibold leading-none text-white ${
                  desktopSidebarCollapsed ? "absolute right-2 top-2" : "ml-auto"
                }`}
              >
                {orderNotifications.length}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="mt-3">
              <OrderNotificationsPanel
                notificationError={notificationError}
                orderNotifications={orderNotifications}
                onMarkAsSeen={markAsSeen}
              />
            </div>
          )}
        </div>

        <div className="mt-auto space-y-2">
          <Link
            to="/"
            title={desktopSidebarCollapsed ? "View site" : undefined}
            className={`flex items-center gap-2 text-xs text-beige/74 hover:text-beige px-4 py-2 ${
              desktopSidebarCollapsed ? "justify-center px-3" : ""
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            {!desktopSidebarCollapsed ? <span>View site</span> : null}
          </Link>
          <button
            onClick={() => void onLogout()}
            title={desktopSidebarCollapsed ? "Sign out" : undefined}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-beige/82 hover:bg-beige/12 hover:text-beige transition ${
              desktopSidebarCollapsed ? "justify-center px-3" : ""
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!desktopSidebarCollapsed ? <span>Sign out</span> : null}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        {isUsingMock && (
          <div className="bg-amber-100 text-amber-900 text-xs px-6 py-2 text-center border-b border-amber-200">
            Mock mode - set <code className="font-mono">VITE_API_URL</code> to connect your Express
            backend.
          </div>
        )}
        <div className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-4 backdrop-blur xl:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link to="/admin" className="font-display text-2xl text-navy">
              <span>Pure</span>
              <span className="text-gold">fumes</span>
              <span className="mt-1 block text-[0.55rem] uppercase tracking-[0.35em] text-navy/45">
                Admin
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setNotificationOpen((open) => !open);
                  setMobileMenuOpen(false);
                }}
                className="relative touch-target rounded-xl border border-border bg-card p-3 text-navy transition hover:border-navy/30"
                aria-label="Toggle order notifications"
              >
                <Bell className="h-4 w-4" />
                {orderNotifications.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[0.6rem] font-semibold leading-none text-white">
                    {orderNotifications.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen((open) => !open);
                  setNotificationOpen(false);
                }}
                className="touch-target rounded-xl border border-border bg-card p-3 text-navy transition hover:border-navy/30"
                aria-label="Toggle admin navigation"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {notificationOpen && (
            <div className="mt-4 rounded-2xl bg-navy p-3 text-beige shadow-soft">
              <OrderNotificationsPanel
                notificationError={notificationError}
                orderNotifications={orderNotifications}
                onMarkAsSeen={markAsSeen}
              />
            </div>
          )}
        </div>
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-30 bg-[#1e1b18]/30 backdrop-blur-sm xl:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="ml-auto flex h-full w-full max-w-sm min-w-0 flex-col overflow-y-auto bg-card px-4 pb-6 pt-4 shadow-[0_20px_60px_-24px_rgba(7,31,63,0.28)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <p className="font-display text-2xl text-navy">
                    Pure<span className="text-gold">fumes</span>
                  </p>
                  <p className="mt-1 text-[0.6rem] uppercase tracking-[0.3em] text-navy/45">
                    Admin
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="touch-target rounded-xl border border-border bg-beige/30 p-3 text-navy transition hover:border-navy/30"
                  aria-label="Close admin navigation"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {items.map(({ to, label, Icon, exact }) => {
                  const active = exact ? loc.pathname === to : loc.pathname.startsWith(to);

                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                        active
                          ? "bg-navy text-beige"
                          : "text-navy/78 hover:bg-beige/60 hover:text-navy"
                      }`}
                    >
                      <Icon className="h-4 w-4" /> {label}
                    </Link>
                  );
                })}

                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm text-navy/78 transition hover:bg-beige/60 hover:text-navy"
                >
                  <ExternalLink className="h-4 w-4" /> View site
                </Link>

                <button
                  type="button"
                  onClick={() => void onLogout()}
                  className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-navy/78 transition hover:bg-beige/60 hover:text-navy"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="p-4 sm:p-6 lg:p-8 2xl:p-10">{children}</div>
      </main>
    </div>
  );
});
