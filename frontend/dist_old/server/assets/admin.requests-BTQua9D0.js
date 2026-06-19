import { r as reactExports, j as jsxRuntimeExports, V as RefreshCw, ar as MessageSquareText, a4 as ChevronLeft, a5 as ChevronRight } from "./vendor-react-98xxEzFV.js";
import { A as AdminShell } from "./AdminShell-P9dOFq5Y.js";
import { D as DateRangeFilter } from "./DateRangeFilter-DB9jlqmp.js";
import { a as useNotification, W as perfumeRequestsApi, B as Button, O as OptimizedImage } from "./router-DvCKRw9U.js";
import { E as EmptyState } from "./EmptyState-zjf5ezCW.js";
import { u as useDateRangeFilter } from "./useDateRangeFilter-BRGCZQlN.js";
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
const STATUSES = ["new", "contacted", "sourced", "closed"];
const PAGE_SIZE = 12;
const statusLabel = {
  new: "New",
  contacted: "Contacted",
  sourced: "Sourced",
  closed: "Closed"
};
const statusStyles = {
  new: "bg-amber-100 text-amber-800",
  contacted: "bg-sky-100 text-sky-800",
  sourced: "bg-emerald-100 text-emerald-800",
  closed: "bg-slate-200 text-slate-700"
};
const formatDate = (value) => new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short"
}).format(new Date(value));
function RequestImageGrid({
  request
}) {
  if (!request.images.length) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-navy/45", children: "No images" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: request.images.map((image, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: image, target: "_blank", rel: "noreferrer", className: "block overflow-hidden rounded-xl border border-border bg-beige/40 transition hover:-translate-y-0.5 hover:shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OptimizedImage, { src: image, alt: `${request.perfumeName} reference ${index + 1}`, sizes: "88px", className: "aspect-square h-full w-full object-cover" }) }, `${request.id}-${index}`)) });
}
function AdminPerfumeRequests() {
  const {
    addNotification
  } = useNotification();
  const dateRange = useDateRangeFilter({
    storageKey: "purefumes_admin_requests_date_range",
    initialRange: "30d"
  });
  const [requests, setRequests] = reactExports.useState([]);
  const [statusFilter, setStatusFilter] = reactExports.useState("");
  const [page, setPage] = reactExports.useState(1);
  const [totalPages, setTotalPages] = reactExports.useState(1);
  const [totalRequests, setTotalRequests] = reactExports.useState(0);
  const [loading, setLoading] = reactExports.useState(true);
  const [refreshing, setRefreshing] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  reactExports.useEffect(() => {
    setPage(1);
  }, [dateRange.from, dateRange.range, dateRange.to, statusFilter]);
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
      const response = await perfumeRequestsApi.listPaginated({
        page,
        limit: PAGE_SIZE,
        status: statusFilter,
        ...dateRange.queryParams
      });
      setRequests(response.requests);
      setTotalPages(Math.max(response.pagination.pages || 1, 1));
      setTotalRequests(response.pagination.total || 0);
    } catch (ex) {
      const message = ex instanceof Error ? ex.message : "Perfume requests could not be loaded.";
      setError(message);
      if (silent) {
        addNotification(message, "error");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addNotification, dateRange.isValid, dateRange.queryParams, dateRange.validationError, page, statusFilter]);
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
    window.addEventListener("purefumes:requests-changed", refresh);
    document.addEventListener("visibilitychange", onVisibilityChange);
    const intervalId = window.setInterval(refresh, 3e4);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("purefumes:requests-changed", refresh);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [load]);
  const updateStatus = reactExports.useCallback(async (id, status) => {
    try {
      const updated = await perfumeRequestsApi.updateStatus(id, status);
      setRequests((current) => current.map((request) => request.id === id || request._id === id ? updated : request));
      addNotification("Perfume request status updated.");
      load(true);
    } catch (ex) {
      addNotification(ex instanceof Error ? ex.message : "Perfume request status could not be updated.", "error");
    }
  }, [addNotification, load]);
  const counts = reactExports.useMemo(() => requests.reduce((acc, request) => {
    acc[request.status] += 1;
    return acc;
  }, {
    new: 0,
    contacted: 0,
    sourced: 0,
    closed: 0
  }), [requests]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[0.65rem] uppercase tracking-[0.4em] text-navy/50", children: "Sourcing Desk" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-4xl text-navy", children: "Perfume Requests" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-2xl text-sm leading-7 text-navy/60", children: "Track customer sourcing queries by date and status with a clean, responsive review flow." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-[0.68rem] uppercase tracking-[0.24em] text-navy/70", children: [
        totalRequests.toLocaleString("en-IN"),
        " queries"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DateRangeFilter, { range: dateRange.range, from: dateRange.from, to: dateRange.to, maxDate: dateRange.maxDate, error: dateRange.validationError, disabled: refreshing, onRangeChange: dateRange.setRange, onFromChange: dateRange.setFrom, onToChange: dateRange.setTo, action: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "soft", size: "sm", className: "gap-2", disabled: refreshing || Boolean(dateRange.validationError), onClick: () => load(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-4 w-4 ${refreshing ? "animate-spin" : ""}` }),
        "Refresh"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "rounded-[1.5rem] border border-white/70 bg-white/75 p-4 shadow-[0_16px_36px_rgba(7,31,63,0.07)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[0.65rem] uppercase tracking-[0.24em] text-navy/45", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: statusFilter, onChange: (event) => setStatusFilter(event.target.value), className: "h-12 rounded-2xl border border-border bg-white/90 px-4 text-sm text-navy outline-none transition focus:border-gold/70", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All statuses" }),
          STATUSES.map((status) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: status, children: statusLabel[status] }, status))
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 grid gap-4 md:grid-cols-4", children: STATUSES.map((status) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-navy/50", children: statusLabel[status] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 font-display text-4xl text-navy", children: counts[status] })
    ] }, status)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 rounded-2xl border border-border/60 bg-card shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-10 text-center text-navy/50", children: "Loading queries..." }) : error ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-10 text-center text-red-600", children: error }) : requests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquareText, { className: "h-6 w-6" }), title: "No queries in this range", description: "Try a wider date range or a different request status." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4 p-4", children: requests.map((request) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-2xl border border-border/70 bg-beige/30 p-4 shadow-soft", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.18em] text-gold", children: formatDate(request.createdAt) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 font-display text-2xl text-navy", children: request.perfumeName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-navy/70", children: request.customerName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-navy/60", children: request.phoneNumber })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: request.status, onChange: (event) => updateStatus(request.id || request._id, event.target.value), className: `rounded-full border-0 px-3 py-2 text-xs uppercase tracking-[0.18em] outline-none ${statusStyles[request.status]}`, children: STATUSES.map((status) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: status, children: statusLabel[status] }, status)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-3 text-sm text-navy/70", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-navy", children: "Preferred Size:" }),
            " ",
            request.preferredSize || "-"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-navy", children: "Budget:" }),
            " ",
            request.budgetRange || "-"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "whitespace-pre-line", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-navy", children: "Notes:" }),
            " ",
            request.message
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RequestImageGrid, { request }) })
      ] }, request.id || request._id)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden overflow-x-auto lg:block", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-beige/50 text-xs uppercase tracking-[0.2em] text-navy/70", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Customer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Perfume" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Size" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Budget" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Images" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Created" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
          loading && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "px-6 py-10 text-center text-navy/50", children: "Loading queries..." }) }),
          !loading && error && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "px-6 py-10 text-center text-red-600", children: error }) }),
          !loading && !error && requests.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "px-6 py-10 text-center text-navy/50", children: "No queries found in this range." }) }),
          !loading && !error && requests.map((request) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "align-top transition-colors hover:bg-beige/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-navy", children: request.customerName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-navy/60", children: request.phoneNumber })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-navy", children: request.perfumeName }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-navy/70", children: request.preferredSize || "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-navy/70", children: request.budgetRange || "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-xs whitespace-pre-line text-sm leading-6 text-navy/70", children: request.message }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-[14rem]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RequestImageGrid, { request }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: request.status, onChange: (event) => updateStatus(request.id || request._id, event.target.value), className: `rounded-full border-0 px-3 py-1.5 text-xs uppercase tracking-[0.18em] outline-none ${statusStyles[request.status]}`, children: STATUSES.map((status) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: status, children: statusLabel[status] }, status)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-xs text-navy/60", children: formatDate(request.createdAt) })
          ] }, request.id || request._id))
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-white/70 bg-white/72 px-4 py-4 shadow-[0_12px_24px_rgba(7,31,63,0.06)] sm:flex-row sm:items-center sm:justify-between", children: [
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
    ] })
  ] });
}
export {
  AdminPerfumeRequests as component
};
