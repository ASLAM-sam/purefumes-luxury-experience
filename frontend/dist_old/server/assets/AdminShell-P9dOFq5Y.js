import { r as reactExports, j as jsxRuntimeExports, a5 as ChevronRight, a4 as ChevronLeft, a8 as LayoutDashboard, Z as Users, a9 as ChartColumn, aa as Package, ab as LayoutGrid, a7 as Star, ac as Tag, ad as Images, ae as TicketPercent, Y as ShoppingCart, K as MessageCircle, af as Settings, ag as Bell, ah as ExternalLink, ai as LogOut, X, M as Menu, G as Check } from "./vendor-react-98xxEzFV.js";
import { f as useNavigate, i as useLocation, L as Link } from "./vendor-tanstack-DkD25YnA.js";
import { N as useAuth, a as useNotification, v as ordersApi, P as isUsingMock, f as formatINR } from "./router-DvCKRw9U.js";
const items = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Users", Icon: Users, exact: false },
  { to: "/admin/analytics", label: "Analytics", Icon: ChartColumn, exact: false },
  { to: "/admin/products", label: "Products", Icon: Package, exact: false },
  { to: "/admin/categories", label: "Categories", Icon: LayoutGrid, exact: false },
  { to: "/admin/bestsellers", label: "Bestsellers", Icon: Star, exact: false },
  { to: "/admin/brands", label: "Brands", Icon: Tag, exact: false },
  { to: "/admin/banners", label: "Hero Banners", Icon: Images, exact: false },
  { to: "/admin/coupons", label: "Coupons", Icon: TicketPercent, exact: false },
  { to: "/admin/orders", label: "Orders", Icon: ShoppingCart, exact: false },
  { to: "/admin/requests", label: "Queries", Icon: MessageCircle, exact: false },
  { to: "/admin/settings", label: "Settings", Icon: Settings, exact: false }
];
const ORDER_NOTIFICATION_REFRESH_MS = 10 * 60 * 1e3;
const ADMIN_SIDEBAR_STORAGE_KEY = "purefumes_admin_sidebar_collapsed";
const getOrderId = (order) => order._id || order.id || "";
function OrderNotificationsPanel({
  notificationError,
  orderNotifications,
  onMarkAsSeen
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-beige/10 bg-beige/10 p-3 shadow-soft", children: [
    notificationError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg bg-red-500/15 px-3 py-2 text-xs text-red-100", children: notificationError }),
    !notificationError && orderNotifications.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-3 py-2 text-xs text-beige/55", children: "No unseen orders." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-72 space-y-2 overflow-y-auto pr-1", children: orderNotifications.map((order) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-beige/95 p-3 text-navy shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: order.customerName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-navy/60", children: order.productName || order.items?.[0]?.productName || "New order" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs font-medium text-gold", children: formatINR(order.totalAmount ?? order.price ?? 0) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => onMarkAsSeen(order),
          className: "rounded-full bg-navy p-1.5 text-beige transition hover:opacity-90",
          "aria-label": "Mark order notification as seen",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" })
        }
      )
    ] }) }, getOrderId(order))) })
  ] });
}
const AdminShell = reactExports.memo(function AdminShell2({ children }) {
  const nav = useNavigate();
  const loc = useLocation();
  const { logout } = useAuth();
  const { addNotification } = useNotification();
  const [orderNotifications, setOrderNotifications] = reactExports.useState([]);
  const [notificationOpen, setNotificationOpen] = reactExports.useState(false);
  const [notificationError, setNotificationError] = reactExports.useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = reactExports.useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = reactExports.useState(false);
  const previousUnseenCountRef = reactExports.useRef(null);
  const onLogout = async () => {
    await logout();
    nav({ to: "/admin/login" });
  };
  const fetchOrderNotifications = reactExports.useCallback(async () => {
    try {
      const unseenOrders = await ordersApi.unseen();
      setOrderNotifications(unseenOrders);
      setNotificationError("");
      const previousCount = previousUnseenCountRef.current;
      if (previousCount !== null && unseenOrders.length > previousCount) {
        const difference = unseenOrders.length - previousCount;
        addNotification(
          `${difference} new ${difference === 1 ? "order" : "orders"} received.`,
          "info"
        );
      }
      previousUnseenCountRef.current = unseenOrders.length;
    } catch (error) {
      setNotificationError(
        error instanceof Error ? error.message : "Order notifications could not be loaded."
      );
    }
  }, [addNotification]);
  reactExports.useEffect(() => {
    fetchOrderNotifications();
    const onOrderChanged = () => fetchOrderNotifications();
    window.addEventListener("purefumes:orders-changed", onOrderChanged);
    const intervalId = window.setInterval(fetchOrderNotifications, ORDER_NOTIFICATION_REFRESH_MS);
    return () => {
      window.removeEventListener("purefumes:orders-changed", onOrderChanged);
      window.clearInterval(intervalId);
    };
  }, [fetchOrderNotifications]);
  reactExports.useEffect(() => {
    setMobileMenuOpen(false);
    setNotificationOpen(false);
  }, [loc.pathname]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    const storedValue = window.localStorage.getItem(ADMIN_SIDEBAR_STORAGE_KEY);
    setDesktopSidebarCollapsed(storedValue === "true");
  }, []);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ADMIN_SIDEBAR_STORAGE_KEY, String(desktopSidebarCollapsed));
  }, [desktopSidebarCollapsed]);
  reactExports.useEffect(() => {
    if (typeof document === "undefined" || !mobileMenuOpen) {
      return void 0;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);
  const markAsSeen = reactExports.useCallback(
    async (order) => {
      const id = getOrderId(order);
      if (!id) return;
      try {
        await ordersApi.markSeen(id);
        setOrderNotifications(
          (current) => current.filter((notification) => getOrderId(notification) !== id)
        );
        previousUnseenCountRef.current = Math.max(0, orderNotifications.length - 1);
        addNotification("Order notification marked as seen.");
      } catch (error) {
        addNotification(
          error instanceof Error ? error.message : "Order notification could not be updated.",
          "error"
        );
      }
    },
    [addNotification, orderNotifications.length]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen min-w-0 bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "aside",
      {
        className: `sticky top-0 hidden h-screen shrink-0 flex-col bg-navy text-beige transition-all duration-300 xl:flex ${desktopSidebarCollapsed ? "w-24 px-3 py-5" : "w-[17rem] p-6"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `flex gap-3 ${desktopSidebarCollapsed ? "flex-col items-center" : "items-start justify-between"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Link,
                  {
                    to: "/admin",
                    className: `${desktopSidebarCollapsed ? "mx-auto text-center" : ""} font-display text-2xl`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-beige", children: "Pure" }),
                      !desktopSidebarCollapsed ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gold", children: "fumes" }) : null,
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: `mt-1 block uppercase text-beige/50 ${desktopSidebarCollapsed ? "text-[0.5rem] tracking-[0.28em]" : "text-[0.6rem] tracking-[0.4em]"}`,
                          children: "Admin"
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setDesktopSidebarCollapsed((current) => !current),
                    className: "rounded-xl border border-beige/15 bg-beige/8 p-2 text-beige/75 transition hover:bg-beige/15 hover:text-beige",
                    "aria-label": desktopSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar",
                    title: desktopSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar",
                    children: desktopSidebarCollapsed ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" })
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: `space-y-1 ${desktopSidebarCollapsed ? "mt-16" : "mt-10"}`, children: items.map(({ to, label, Icon, exact }) => {
            const active = exact ? loc.pathname === to : loc.pathname.startsWith(to);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to,
                title: desktopSidebarCollapsed ? label : void 0,
                className: `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${active ? "bg-beige text-navy" : "text-beige/82 hover:bg-beige/12 hover:text-beige"} ${desktopSidebarCollapsed ? "justify-center px-3" : ""}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4 shrink-0" }),
                  !desktopSidebarCollapsed ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }) : null
                ]
              },
              to
            );
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setNotificationOpen((open) => !open),
                title: desktopSidebarCollapsed ? "New orders" : void 0,
                className: `relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-beige/82 transition hover:bg-beige/12 hover:text-beige ${desktopSidebarCollapsed ? "justify-center px-3" : ""}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4 shrink-0" }),
                  !desktopSidebarCollapsed ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "New orders" }) : null,
                  orderNotifications.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: `flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[0.65rem] font-semibold leading-none text-white ${desktopSidebarCollapsed ? "absolute right-2 top-2" : "ml-auto"}`,
                      children: orderNotifications.length
                    }
                  )
                ]
              }
            ),
            notificationOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              OrderNotificationsPanel,
              {
                notificationError,
                orderNotifications,
                onMarkAsSeen: markAsSeen
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/",
                title: desktopSidebarCollapsed ? "View site" : void 0,
                className: `flex items-center gap-2 text-xs text-beige/74 hover:text-beige px-4 py-2 ${desktopSidebarCollapsed ? "justify-center px-3" : ""}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3.5 h-3.5 shrink-0" }),
                  !desktopSidebarCollapsed ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "View site" }) : null
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => void onLogout(),
                title: desktopSidebarCollapsed ? "Sign out" : void 0,
                className: `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-beige/82 hover:bg-beige/12 hover:text-beige transition ${desktopSidebarCollapsed ? "justify-center px-3" : ""}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "w-4 h-4 shrink-0" }),
                  !desktopSidebarCollapsed ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Sign out" }) : null
                ]
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 min-w-0", children: [
      isUsingMock,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-4 backdrop-blur xl:hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin", className: "font-display text-2xl text-navy", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Pure" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gold", children: "fumes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 block text-[0.55rem] uppercase tracking-[0.35em] text-navy/45", children: "Admin" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  setNotificationOpen((open) => !open);
                  setMobileMenuOpen(false);
                },
                className: "relative touch-target rounded-xl border border-border bg-card p-3 text-navy transition hover:border-navy/30",
                "aria-label": "Toggle order notifications",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4" }),
                  orderNotifications.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[0.6rem] font-semibold leading-none text-white", children: orderNotifications.length })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  setMobileMenuOpen((open) => !open);
                  setNotificationOpen(false);
                },
                className: "touch-target rounded-xl border border-border bg-card p-3 text-navy transition hover:border-navy/30",
                "aria-label": "Toggle admin navigation",
                children: mobileMenuOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-4 w-4" })
              }
            )
          ] })
        ] }),
        notificationOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 rounded-2xl bg-navy p-3 text-beige shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          OrderNotificationsPanel,
          {
            notificationError,
            orderNotifications,
            onMarkAsSeen: markAsSeen
          }
        ) })
      ] }),
      mobileMenuOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "fixed inset-0 z-30 bg-[#1e1b18]/30 backdrop-blur-sm xl:hidden",
          onClick: () => setMobileMenuOpen(false),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "ml-auto flex h-full w-full max-w-sm min-w-0 flex-col overflow-y-auto bg-card px-4 pb-6 pt-4 shadow-[0_20px_60px_-24px_rgba(7,31,63,0.28)]",
              onClick: (event) => event.stopPropagation(),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 border-b border-border pb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-display text-2xl text-navy", children: [
                      "Pure",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gold", children: "fumes" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[0.6rem] uppercase tracking-[0.3em] text-navy/45", children: "Admin" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setMobileMenuOpen(false),
                      className: "touch-target rounded-xl border border-border bg-beige/30 p-3 text-navy transition hover:border-navy/30",
                      "aria-label": "Close admin navigation",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-2", children: [
                  items.map(({ to, label, Icon, exact }) => {
                    const active = exact ? loc.pathname === to : loc.pathname.startsWith(to);
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Link,
                      {
                        to,
                        onClick: () => setMobileMenuOpen(false),
                        className: `flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${active ? "bg-navy text-beige" : "text-navy/78 hover:bg-beige/60 hover:text-navy"}`,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
                          " ",
                          label
                        ]
                      },
                      to
                    );
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Link,
                    {
                      to: "/",
                      onClick: () => setMobileMenuOpen(false),
                      className: "flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm text-navy/78 transition hover:bg-beige/60 hover:text-navy",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }),
                        " View site"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => void onLogout(),
                      className: "flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-navy/78 transition hover:bg-beige/60 hover:text-navy",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
                        " Sign out"
                      ]
                    }
                  )
                ] })
              ]
            }
          )
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 sm:p-6 lg:p-8 2xl:p-10", children })
    ] })
  ] });
});
export {
  AdminShell as A
};
