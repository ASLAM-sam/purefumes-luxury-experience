import { r as reactExports, j as jsxRuntimeExports, V as RefreshCw, J as Trash2, W as IndianRupee, aa as Package, aC as Percent, $ as Crown, Z as Users, q as ShoppingBag } from "./vendor-react-98xxEzFV.js";
import { A as AdminShell } from "./AdminShell-P9dOFq5Y.js";
import { u as useAdminAnalytics, A as AnalyticsChart } from "./useAdminAnalytics-C79n_H1g.js";
import { D as DateRangeFilter } from "./DateRangeFilter-DB9jlqmp.js";
import { S as StatCard } from "./StatCard-B0GZbYer.js";
import { a as useNotification, B as Button, f as formatINR, J as adminApi } from "./router-DvCKRw9U.js";
import { C as ConfirmModal } from "./ConfirmModal-CZ9ASx2b.js";
import { E as EmptyState } from "./EmptyState-zjf5ezCW.js";
import { E as ErrorState } from "./ErrorState-DxcmW7-q.js";
import { L as LoadingSkeleton } from "./LoadingSkeleton-ByWjt3UG.js";
import { R as ResponsiveContainer, L as LineChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, a as Line } from "./vendor-charts-Ot63D9Dz.js";
import "./vendor-tanstack-DkD25YnA.js";
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
const formatCurrency = formatINR;
const formatPercent = (value) => `${Number(value || 0).toLocaleString("en-IN", {
  maximumFractionDigits: 1
})}%`;
const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");
function AdminAnalyticsPage() {
  const {
    addNotification
  } = useNotification();
  const {
    analytics,
    error,
    dateRangeError,
    from,
    loading,
    maxDate,
    range,
    refreshing,
    refresh,
    setFrom,
    setRange,
    setTo,
    to
  } = useAdminAnalytics({
    initialRange: "30d"
  });
  const [confirmClear, setConfirmClear] = reactExports.useState(null);
  const [clearing, setClearing] = reactExports.useState(false);
  const userGrowth = analytics?.trends?.users || [];
  const summary = analytics?.summary;
  const handleClear = async () => {
    if (!confirmClear) return;
    setClearing(true);
    try {
      const result = confirmClear === "analytics" ? await adminApi.clearAnalytics() : await adminApi.clearActivity();
      await refresh();
      addNotification(confirmClear === "analytics" ? "Test analytics data cleared successfully" : `Activity cleared. ${result.deletedActivity || 0} entries removed.`);
      setConfirmClear(null);
    } catch (clearError) {
      addNotification(clearError instanceof Error ? clearError.message : "Data could not be cleared.", "error");
    } finally {
      setClearing(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[var(--radius-panel)] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(243,237,226,0.9))] p-4 shadow-[0_18px_48px_rgba(7,31,63,0.08)] sm:p-5 md:p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-eyebrow uppercase text-navy/45", children: "Analytics" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 font-display text-3xl text-navy md:text-5xl", children: "Compact commerce intelligence" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-2xl text-sm leading-7 text-navy/62 md:text-base", children: "Live revenue, customer quality, acquisition, and order health in a denser layout built for daily admin use across desktop, tablet, and mobile." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[1.25rem] border border-border/70 bg-white/78 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.18em] text-navy/42", children: "Revenue in range" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-2xl text-navy md:text-3xl", children: formatCurrency(summary?.revenueInRange || 0) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-navy/55", children: [
              "Range total ",
              formatCurrency(summary?.revenueInRange || 0)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[1.25rem] border border-border/70 bg-white/78 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.18em] text-navy/42", children: "Order quality" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-2xl text-navy md:text-3xl", children: formatCurrency(summary?.averageOrderValue || 0) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-navy/55", children: [
              formatNumber(summary?.ordersInRange || 0),
              " orders in range"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DateRangeFilter, { range, from, to, maxDate, error: dateRangeError, disabled: refreshing, onRangeChange: setRange, onFromChange: setFrom, onToChange: setTo, action: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "soft", size: "sm", className: "gap-2", disabled: refreshing || Boolean(dateRangeError), onClick: () => void refresh(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-4 w-4 ${refreshing ? "animate-spin" : ""}` }),
          "Refresh"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "gap-2 border-red-300 text-red-700 hover:bg-red-600 hover:text-white hover:shadow-[0_0_15px_rgba(220,38,38,0.2)]", disabled: clearing, onClick: () => setConfirmClear("analytics"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
          "Clear Analytics Data"
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Revenue", value: formatCurrency(summary?.revenueInRange || 0), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(IndianRupee, { className: "h-5 w-5" }), tone: "gold", loading: loading && !analytics, meta: `Selected range ${formatCurrency(summary?.revenueInRange || 0)}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Orders", value: formatNumber(summary?.ordersInRange || 0), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-5 w-5" }), tone: "navy", loading: loading && !analytics, meta: `${formatCurrency(summary?.averageOrderValue || 0)} AOV` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Conversion", value: formatPercent(summary?.conversionRate || 0), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Percent, { className: "h-5 w-5" }), tone: "emerald", loading: loading && !analytics, meta: `${formatNumber(summary?.activeUsers || 0)} active users in range` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Repeat Buyers", value: formatNumber(summary?.repeatCustomers || 0), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-5 w-5" }), tone: "navy", loading: loading && !analytics, meta: `${formatNumber(summary?.premiumCustomers || 0)} premium` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [{
      label: "Total customers",
      value: formatNumber(summary?.totalUsers || 0),
      tone: "bg-[#faf5ec]"
    }, {
      label: "Pending orders",
      value: formatNumber(summary?.pendingOrders || 0),
      tone: "bg-[#f5f7fb]"
    }, {
      label: "Abandoned carts",
      value: formatNumber(summary?.abandonedCarts || 0),
      tone: "bg-[#faf2f2]"
    }, {
      label: "Low stock alerts",
      value: formatNumber(summary?.lowStockAlerts || 0),
      tone: "bg-[#f7f4ec]"
    }].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-[1.25rem] border border-border/70 p-4 shadow-soft ${item.tone}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.18em] text-navy/42", children: item.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-2xl text-navy", children: item.value })
    ] }, item.label)) }),
    error && !analytics ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { description: error, onRetry: () => void refresh() }) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid gap-6 xl:grid-cols-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsChart, { title: "User growth", description: "Customer acquisition across the selected period.", children: loading && !analytics ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-[280px] w-full" }) : userGrowth.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[280px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: userGrowth, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { stroke: "rgba(7,31,63,0.08)", strokeDasharray: "3 3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: {
        fill: "#5f6573",
        fontSize: 12
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: {
        fill: "#5f6573",
        fontSize: 12
      }, allowDecimals: false }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (value) => formatNumber(value), contentStyle: {
        borderRadius: "18px",
        borderColor: "rgba(7,31,63,0.08)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "value", stroke: "#2f855a", strokeWidth: 3, dot: {
        fill: "#2f855a",
        r: 4
      } })
    ] }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-6 w-6" }), title: "No user growth data yet", description: "Signup growth will populate here once customer acquisition starts." }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-6 xl:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsChart, { title: "Top products", description: "The strongest revenue contributors right now.", children: loading && !analytics ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-20 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-20 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-20 w-full" })
      ] }) : analytics?.topProducts?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: analytics.topProducts.slice(0, 8).map((product, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-[1.2rem] bg-[#f8f4ec] px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-start gap-3", children: [
          product.image ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: product.image, alt: product.productName || "Product", className: "h-14 w-14 rounded-2xl object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-[0.62rem] uppercase tracking-[0.18em] text-navy/45", children: "No image" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-semibold text-navy", children: product.productName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 truncate text-sm text-navy/55", children: product.brand || "Brand unavailable" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs uppercase tracking-[0.16em] text-navy/40", children: [
              formatNumber(product.totalOrders),
              " orders • ",
              formatNumber(product.totalQuantitySold),
              " sold"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-navy", children: formatCurrency(product.totalRevenueGenerated) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs uppercase tracking-[0.16em] text-gold", children: "Top purchased" })
        ] })
      ] }) }, `${product.productId}-${index}`)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-6 w-6" }), title: "No best sellers yet", description: "Product rankings will appear after completed orders are available." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsChart, { title: "Top customers", description: "High-value buyers worth retention focus.", children: loading && !analytics ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-20 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-20 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-20 w-full" })
      ] }) : analytics?.topCustomers?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: analytics.topCustomers.slice(0, 10).map((customer) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-[1.2rem] bg-[#f4f7fb] px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-semibold text-navy", children: customer.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 truncate text-sm text-navy/55", children: customer.email || "No email available" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs uppercase tracking-[0.16em] text-navy/40", children: customer.mobile || "No mobile available" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-navy", children: formatCurrency(customer.totalSpent) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs uppercase tracking-[0.16em] text-gold", children: [
            formatNumber(customer.totalOrders),
            " orders"
          ] })
        ] })
      ] }) }, customer.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-6 w-6" }), title: "Top customers will appear here", description: "Customer rankings need completed orders before they can be calculated." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsChart, { title: "Recent activity", description: "A compact pulse of the latest commerce events.", action: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", size: "sm", className: "gap-2", disabled: clearing, onClick: () => setConfirmClear("activity"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
        "Clear Activity"
      ] }), children: loading && !analytics ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-20 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-20 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-20 w-full" })
      ] }) : analytics?.recentActivity?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: analytics.recentActivity.slice(0, 6).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-[1.2rem] bg-[#faf6ef] px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-navy", children: item.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-navy/58", children: item.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs uppercase tracking-[0.16em] text-navy/38", children: item.at ? new Date(item.at).toLocaleString("en-IN") : "Time unavailable" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-navy", children: formatCurrency(item.amount) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs uppercase tracking-[0.16em] text-gold", children: item.type })
        ] })
      ] }) }, item.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-6 w-6" }), title: "No recent activity yet", description: "Tracked commerce events will appear here once activity starts." }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmModal, { isOpen: confirmClear !== null, title: confirmClear === "activity" ? "Clear Activity" : "Clear Analytics Data", message: confirmClear === "analytics" ? "Are you sure you want to delete all analytics and test order data? This action cannot be undone." : "Are you sure? This action cannot be undone.", confirmLabel: confirmClear === "activity" ? "Clear Activity" : "Yes, Clear Data", loading: clearing, onClose: () => setConfirmClear(null), onConfirm: handleClear })
  ] });
}
export {
  AdminAnalyticsPage as component
};
