import { r as reactExports, j as jsxRuntimeExports, V as RefreshCw, J as Trash2, ax as PackageOpen, a4 as ChevronLeft, a5 as ChevronRight } from "./vendor-react-98xxEzFV.js";
import { A as AdminShell } from "./AdminShell-P9dOFq5Y.js";
import { D as DateRangeFilter } from "./DateRangeFilter-DB9jlqmp.js";
import { a as useNotification, J as adminApi, v as ordersApi, B as Button, b as formatPaymentStatusLabel, f as formatINR } from "./router-DvCKRw9U.js";
import { C as ConfirmModal } from "./ConfirmModal-CZ9ASx2b.js";
import { E as EmptyState } from "./EmptyState-zjf5ezCW.js";
import { u as useDateRangeFilter } from "./useDateRangeFilter-BRGCZQlN.js";
import { g as getOrderDisplayId } from "./order-id-BDPLTTNe.js";
import "./vendor-tanstack-DkD25YnA.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
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
import "./vendor-motion-3kNaalGV.js";
import "./vendor-charts-Ot63D9Dz.js";
const STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];
const PAGE_SIZE = 12;
const statusColor = {
  Pending: "bg-amber-100 text-amber-800",
  Confirmed: "bg-emerald-100 text-emerald-800",
  Processing: "bg-sky-100 text-sky-800",
  Shipped: "bg-indigo-100 text-indigo-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-rose-100 text-rose-800"
};
function AdminOrders() {
  const {
    addNotification
  } = useNotification();
  const dateRange = useDateRangeFilter({
    storageKey: "purefumes_admin_orders_date_range",
    initialRange: "30d"
  });
  const [orders, setOrders] = reactExports.useState([]);
  const [statusFilter, setStatusFilter] = reactExports.useState("");
  const [search, setSearch] = reactExports.useState("");
  const [page, setPage] = reactExports.useState(1);
  const [totalPages, setTotalPages] = reactExports.useState(1);
  const [totalOrders, setTotalOrders] = reactExports.useState(0);
  const [loading, setLoading] = reactExports.useState(true);
  const [refreshing, setRefreshing] = reactExports.useState(false);
  const [clearOrdersOpen, setClearOrdersOpen] = reactExports.useState(false);
  const [clearingOrders, setClearingOrders] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  reactExports.useEffect(() => {
    setPage(1);
  }, [dateRange.from, dateRange.range, dateRange.to, search, statusFilter]);
  const load = reactExports.useCallback(async (silent = false) => {
    if (!dateRange.isValid) {
      setError(dateRange.validationError);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");
    try {
      const response = await adminApi.orders({
        page,
        limit: PAGE_SIZE,
        status: statusFilter,
        search: search.trim() || void 0,
        ...dateRange.queryParams
      });
      setOrders(response.orders);
      setTotalPages(Math.max(response.pagination.pages || 1, 1));
      setTotalOrders(response.pagination.total || 0);
    } catch (ex) {
      const message = ex instanceof Error ? ex.message : "Orders could not be loaded.";
      setError(message);
      if (silent) {
        addNotification(message, "error");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addNotification, dateRange.isValid, dateRange.queryParams, dateRange.validationError, page, search, statusFilter]);
  reactExports.useEffect(() => {
    load();
  }, [load]);
  reactExports.useEffect(() => {
    const refresh = () => load(true);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        load(true);
      }
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("purefumes:orders-changed", refresh);
    document.addEventListener("visibilitychange", onVisibilityChange);
    const intervalId = window.setInterval(refresh, 3e4);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("purefumes:orders-changed", refresh);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [load]);
  const updateStatus = reactExports.useCallback(async (id, status) => {
    try {
      const updated = await ordersApi.updateStatus(id, status);
      setOrders((current) => current.map((order) => order._id === id || order.id === id ? updated : order));
      addNotification("Order status updated.");
      load(true);
    } catch (ex) {
      addNotification(ex instanceof Error ? ex.message : "Order status could not be updated.", "error");
    }
  }, [addNotification, load]);
  const handleClearOrders = async () => {
    setClearingOrders(true);
    try {
      const result = await adminApi.clearOrders();
      setPage(1);
      await load(true);
      addNotification(`Test orders cleared. ${result.deletedOrders || 0} orders removed.`);
      setClearOrdersOpen(false);
    } catch (clearError) {
      addNotification(clearError instanceof Error ? clearError.message : "Orders could not be cleared.", "error");
    } finally {
      setClearingOrders(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-eyebrow uppercase text-navy/50", children: "Fulfilment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 font-display text-[clamp(2rem,2vw+1.2rem,3rem)] text-navy", children: "Orders" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-body mt-3 max-w-2xl text-navy/60", children: "Review live orders by status and date window without loading the full order history." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-[0.68rem] uppercase tracking-[0.24em] text-navy/70", children: [
        totalOrders.toLocaleString("en-IN"),
        " orders"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-4 2xl:grid-cols-[minmax(0,1fr)_18rem]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DateRangeFilter, { range: dateRange.range, from: dateRange.from, to: dateRange.to, maxDate: dateRange.maxDate, error: dateRange.validationError, disabled: refreshing, onRangeChange: dateRange.setRange, onFromChange: dateRange.setFrom, onToChange: dateRange.setTo, action: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "soft", size: "sm", className: "gap-2", disabled: refreshing || Boolean(dateRange.validationError), onClick: () => load(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-4 w-4 ${refreshing ? "animate-spin" : ""}` }),
          "Refresh"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", size: "sm", className: "gap-2", disabled: clearingOrders, onClick: () => setClearOrdersOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
          "Clear Test Orders"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid gap-3 rounded-[var(--radius-panel)] border border-white/70 bg-white/75 p-4 shadow-[0_16px_36px_rgba(7,31,63,0.07)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[0.65rem] uppercase tracking-[0.24em] text-navy/45", children: "Search" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "search", value: search, onChange: (event) => setSearch(event.target.value), placeholder: "Order ID, customer, mobile, email", className: "h-12 rounded-2xl border border-border bg-white/90 px-4 text-sm text-navy outline-none transition placeholder:text-navy/35 focus:border-gold/70" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[0.65rem] uppercase tracking-[0.24em] text-navy/45", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: statusFilter, onChange: (event) => setStatusFilter(event.target.value), className: "h-12 rounded-2xl border border-border bg-white/90 px-4 text-sm text-navy outline-none transition focus:border-gold/70", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All statuses" }),
            STATUSES.map((status) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: status, children: status }, status))
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 overflow-hidden rounded-[var(--radius-panel)] border border-border/60 bg-card shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "xl:hidden", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-10 text-center text-navy/50", children: "Loading orders..." }) : error ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-10 text-center text-red-600", children: error }) : orders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PackageOpen, { className: "h-6 w-6" }), title: "No orders in this range", description: "Try a wider date range or a different order status." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4 p-4", children: orders.map((order) => {
        const productName = order.productName || "Order item";
        const price = order.totalAmount ?? order.price ?? 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-2xl border border-border/70 bg-beige/30 p-4 shadow-soft", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold", children: getOrderDisplayId(order) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-navy", children: order.customerName || "Customer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-navy/60", children: order.mobileNumber || order.phone || "Phone unavailable" }),
              order.email ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-navy/50", children: order.email }) : null
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: order.status, onChange: (event) => updateStatus(order._id || order.id || "", event.target.value), className: `shrink-0 rounded-full border-0 px-3 py-2 text-xs uppercase tracking-[0.16em] outline-none ${statusColor[order.status] || "bg-beige text-navy"}`, children: STATUSES.map((status) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: status, children: status }, status)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-2 text-sm text-navy/70", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-navy", children: productName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              order.brand || "Brand unavailable",
              " - ",
              order.size || "Size unavailable"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              "Payment Status: ",
              formatPaymentStatusLabel(order.paymentStatus)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              "Shipping:",
              " ",
              order.shippingCharge && order.shippingCharge > 0 ? formatINR(order.shippingCharge) : "Free"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gold", children: formatINR(price) })
          ] })
        ] }, order._id || order.id);
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "admin-table-shell hidden xl:block", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-beige/50 text-navy/70 text-xs uppercase tracking-[0.2em]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-6 py-4", children: "Order ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-6 py-4", children: "Customer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-6 py-4", children: "Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-6 py-4", children: "Size" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-6 py-4", children: "Price" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-6 py-4", children: "Payment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-6 py-4", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-6 py-4", children: "Date" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
          loading && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "px-6 py-10 text-center text-navy/50", children: "Loading orders..." }) }),
          !loading && error && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "px-6 py-10 text-center text-red-600", children: error }) }),
          !loading && !error && orders.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "px-6 py-10 text-center text-navy/50", children: "No orders found in this range." }) }),
          !loading && !error && orders.map((order) => {
            const productName = order.productName || "Order item";
            const brand = order.brand || "";
            const size = order.size || "-";
            const price = order.totalAmount ?? order.price ?? 0;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-beige/30 transition-colors align-top", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-navy", children: getOrderDisplayId(order) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-navy", children: order.customerName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-navy/60", children: order.mobileNumber || order.phone }),
                order.email ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-navy/50", children: order.email }) : null,
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-navy/50 mt-1 max-w-xs truncate", children: order.address })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-navy", children: productName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-navy/60", children: brand })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-navy/70", children: size }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right text-gold font-medium", children: formatINR(price) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-navy/70", children: [
                formatPaymentStatusLabel(order.paymentStatus),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-navy/55", children: [
                  "Shipping:",
                  " ",
                  order.shippingCharge && order.shippingCharge > 0 ? formatINR(order.shippingCharge) : "Free"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: order.status, onChange: (event) => updateStatus(order._id || order.id || "", event.target.value), className: `px-3 py-1.5 rounded-full text-xs uppercase tracking-wider border-0 outline-none cursor-pointer ${statusColor[order.status] || "bg-beige text-navy"}`, children: STATUSES.map((status) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: status, children: status }, status)) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-navy/60", children: new Date(order.createdAt).toLocaleDateString("en-IN") })
            ] }, order._id || order.id);
          })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col gap-3 rounded-[var(--radius-panel)] border border-white/70 bg-white/72 px-4 py-4 shadow-[0_12px_24px_rgba(7,31,63,0.06)] sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-navy/58", children: [
        "Page ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-navy", children: page }),
        " of",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-navy", children: totalPages })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "soft", size: "sm", disabled: page <= 1, className: "gap-2", onClick: () => setPage((current) => Math.max(1, current - 1)), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
          "Previous"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "soft", size: "sm", disabled: page >= totalPages, className: "gap-2", onClick: () => setPage((current) => Math.min(totalPages, current + 1)), children: [
          "Next",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmModal, { isOpen: clearOrdersOpen, title: "Clear Test Orders", message: "Delete all test/fake orders permanently?", confirmLabel: "Delete", loading: clearingOrders, onClose: () => setClearOrdersOpen(false), onConfirm: handleClearOrders })
  ] });
}
export {
  AdminOrders as component
};
