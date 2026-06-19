import { r as reactExports, j as jsxRuntimeExports, V as RefreshCw, J as Trash2, O as ArrowRight, W as IndianRupee, Y as ShoppingCart, Z as Users, _ as TriangleAlert, $ as Crown } from "./vendor-react-98xxEzFV.js";
import { L as Link } from "./vendor-tanstack-DkD25YnA.js";
import { A as AdminShell } from "./AdminShell-P9dOFq5Y.js";
import { u as useAdminAnalytics, A as AnalyticsChart } from "./useAdminAnalytics-C79n_H1g.js";
import { S as StatCard } from "./StatCard-B0GZbYer.js";
import { a as useNotification, B as Button, f as formatINR, J as adminApi } from "./router-DvCKRw9U.js";
import { C as ConfirmModal } from "./ConfirmModal-CZ9ASx2b.js";
import { E as EmptyState } from "./EmptyState-zjf5ezCW.js";
import { E as ErrorState } from "./ErrorState-DxcmW7-q.js";
import { L as LoadingSkeleton } from "./LoadingSkeleton-ByWjt3UG.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./vendor-motion-3kNaalGV.js";
import "./useDateRangeFilter-BRGCZQlN.js";
import "util";
import "stream";
import "path";
import "http";
import "https";
import "url";
import "fs";
import "crypto";
import "assert";
import "./worker-entry-8w9vAzi1.js";
import "node:events";
import "os";
import "zlib";
import "events";
import "./vendor-charts-Ot63D9Dz.js";
const formatCurrency = formatINR;
const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");
function AdminDashboard() {
  const {
    addNotification
  } = useNotification();
  const {
    analytics,
    error,
    loading,
    refreshing,
    refresh
  } = useAdminAnalytics({
    initialRange: "30d"
  });
  const [clearAnalyticsOpen, setClearAnalyticsOpen] = reactExports.useState(false);
  const [clearingAnalytics, setClearingAnalytics] = reactExports.useState(false);
  const summary = analytics?.summary;
  const handleClearAnalytics = async () => {
    setClearingAnalytics(true);
    try {
      const result = await adminApi.clearAnalytics();
      await refresh();
      addNotification(`Analytics cleared. ${result.deletedOrders || 0} orders and ${result.deletedActivity || 0} activity entries removed.`);
      setClearAnalyticsOpen(false);
    } catch (clearError) {
      addNotification(clearError instanceof Error ? clearError.message : "Analytics could not be cleared.", "error");
    } finally {
      setClearingAnalytics(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-[var(--radius-panel)] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(243,237,226,0.88))] p-5 shadow-[0_20px_60px_rgba(7,31,63,0.08)] sm:p-6 lg:p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,161,74,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(7,31,63,0.12),transparent_34%)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-eyebrow uppercase text-navy/46", children: "Executive view" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 font-display text-[clamp(2rem,2.4vw+1.2rem,3.5rem)] text-navy", children: "Production-grade control center for your perfume storefront" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-body mt-4 max-w-2xl text-navy/62", children: "Revenue, repeat customers, pending orders, and stock pressure now roll into one premium command surface for daily store operations." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "soft", className: "gap-2", disabled: refreshing, onClick: () => void refresh(), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-4 w-4 ${refreshing ? "animate-spin" : ""}` }),
            "Refresh"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", className: "gap-2", disabled: clearingAnalytics, onClick: () => setClearAnalyticsOpen(true), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
            "Clear Analytics"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/analytics", className: "inline-flex items-center gap-2 rounded-full bg-navy px-5 py-3 text-xs uppercase tracking-[0.24em] text-beige transition hover:opacity-90", children: [
            "Open analytics",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "adaptive-admin-grid mt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Revenue", value: formatCurrency(summary?.revenueInRange || 0), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(IndianRupee, { className: "h-5 w-5" }), tone: "gold", loading: loading && !analytics, meta: `Month ${formatCurrency(summary?.monthlyRevenue || 0)}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Orders", value: formatNumber(summary?.ordersInRange || 0), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "h-5 w-5" }), tone: "navy", loading: loading && !analytics, meta: `${formatCurrency(summary?.averageOrderValue || 0)} average order value` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Customers", value: formatNumber(summary?.totalUsers || 0), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5" }), tone: "emerald", loading: loading && !analytics, meta: `${formatNumber(summary?.repeatCustomers || 0)} repeat customers` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Inventory alerts", value: formatNumber(summary?.lowStockAlerts || 0), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5" }), tone: "rose", loading: loading && !analytics, meta: `${formatNumber(summary?.pendingOrders || 0)} pending orders` })
    ] }),
    error && !analytics ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { description: error, onRetry: () => void refresh() }) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsChart, { title: "Operational watchlist", description: "The quickest issues to act on today.", children: loading && !analytics ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-20 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-20 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-20 w-full" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[1.35rem] bg-[#faf6ee] p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.2em] text-navy/42", children: "Pending orders" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-3xl text-navy", children: formatNumber(summary?.pendingOrders || 0) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[1.35rem] bg-[#f4f8fb] p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.2em] text-navy/42", children: "Repeat customers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-3xl text-navy", children: formatNumber(summary?.repeatCustomers || 0) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[1.35rem] bg-[#f9f1f1] p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.2em] text-navy/42", children: "Low stock alerts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-3xl text-navy", children: formatNumber(summary?.lowStockAlerts || 0) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-6 2xl:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsChart, { title: "Top products", description: "The products currently driving the strongest commercial lift.", children: loading && !analytics ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-20 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-20 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-20 w-full" })
      ] }) : analytics?.topProducts?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: analytics.topProducts.slice(0, 5).map((product, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 rounded-[1.35rem] bg-[#f8f4ec] px-4 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [
          product.image ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: product.image, alt: product.productName || "Product", className: "h-14 w-14 rounded-2xl object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-xs uppercase tracking-[0.18em] text-navy/45", children: "No image" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-semibold text-navy", children: product.productName || "Product" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 truncate text-sm text-navy/56", children: product.brand || "Brand unavailable" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs uppercase tracking-[0.16em] text-navy/40", children: [
              formatNumber(product.totalOrders),
              " orders • ",
              formatNumber(product.totalQuantitySold),
              " sold"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-navy", children: formatCurrency(product.totalRevenueGenerated) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs uppercase tracking-[0.18em] text-gold", children: "Top purchased" })
        ] })
      ] }, `${product.productId}-${index}`)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { title: "No best sellers yet", description: "Product rankings will appear here once completed orders are available." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsChart, { title: "Top customers", description: "High-value buyers to retain, reward, and learn from.", children: loading && !analytics ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-20 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-20 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-20 w-full" })
      ] }) : analytics?.topCustomers?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: analytics.topCustomers.slice(0, 5).map((customer) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 rounded-[1.35rem] bg-[#f4f7fb] px-4 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-semibold text-navy", children: customer.name || "Unnamed customer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 truncate text-sm text-navy/56", children: customer.email || "No email available" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs uppercase tracking-[0.16em] text-navy/40", children: customer.mobile || "No mobile available" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-navy", children: formatCurrency(customer.totalSpent) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-gold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3.5 w-3.5" }),
            formatNumber(customer.totalOrders),
            " orders"
          ] })
        ] })
      ] }, customer.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { title: "Top customers will appear here", description: "Customer rankings need completed orders before they can be calculated." }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmModal, { isOpen: clearAnalyticsOpen, title: "Clear Analytics", message: "Are you sure? This action cannot be undone.", confirmLabel: "Clear Analytics", loading: clearingAnalytics, onClose: () => setClearAnalyticsOpen(false), onConfirm: handleClearAnalytics })
  ] });
}
export {
  AdminDashboard as component
};
