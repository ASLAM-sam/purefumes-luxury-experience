import { r as reactExports, j as jsxRuntimeExports, S as Search, X, aj as ArrowUp, ak as ArrowDown, u as ShieldCheck, z as Mail, P as Phone, al as UserRound, am as UserCheck, an as Ban, C as CircleAlert, V as RefreshCw, J as Trash2, ao as UserX, ap as CalendarDays, $ as Crown, aq as Wallet, a4 as ChevronLeft, a5 as ChevronRight } from "./vendor-react-98xxEzFV.js";
import { L as Link } from "./vendor-tanstack-DkD25YnA.js";
import { A as AdminShell } from "./AdminShell-P9dOFq5Y.js";
import { A as AnimatePresence, m as motion } from "./vendor-motion-3kNaalGV.js";
import { S as StatCard } from "./StatCard-B0GZbYer.js";
import { a as useNotification, J as adminApi, B as Button, c as formatOrderStatusLabel, b as formatPaymentStatusLabel, f as formatINR } from "./router-DvCKRw9U.js";
import { C as ConfirmModal } from "./ConfirmModal-CZ9ASx2b.js";
import { E as EmptyState } from "./EmptyState-zjf5ezCW.js";
import { E as ErrorState } from "./ErrorState-DxcmW7-q.js";
import { L as LoadingSkeleton } from "./LoadingSkeleton-ByWjt3UG.js";
import { g as getOrderDisplayId } from "./order-id-BDPLTTNe.js";
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
import "./vendor-charts-Ot63D9Dz.js";
function DataTableComponent({ columns, rows, rowKey, mobileCard, emptyState }) {
  if (!rows.length && emptyState) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: emptyState });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "admin-table-surface hidden overflow-hidden rounded-[1.75rem] border border-border/70 bg-white/86 shadow-[0_18px_40px_rgba(7,31,63,0.08)] lg:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[68vh] overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full border-separate border-spacing-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "sticky top-0 z-10 bg-[#f6f1e8]/95 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: columns.map((column) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "th",
        {
          className: `px-5 py-4 text-left text-[0.68rem] uppercase tracking-[0.28em] text-navy/68 ${column.headerClassName || ""}`,
          children: column.label
        },
        column.id
      )) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { initial: false, children: rows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.tr,
        {
          layout: true,
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -8 },
          transition: { duration: 0.2 },
          className: "group border-b border-border/60 even:bg-[#fbf8f3]/75 hover:bg-[#f4eadb]",
          children: columns.map((column) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-5 py-4 align-top text-sm text-navy ${column.className || ""}`, children: column.render(row) }, column.id))
        },
        rowKey(row)
      )) }) })
    ] }) }) }),
    mobileCard ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 lg:hidden", children: rows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        layout: true,
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        className: "rounded-[1.5rem] border border-border/70 bg-white/86 p-4 shadow-[0_18px_40px_rgba(7,31,63,0.08)]",
        children: mobileCard(row)
      },
      rowKey(row)
    )) }) : null
  ] });
}
const DataTable = reactExports.memo(DataTableComponent);
const FilterDropdown = reactExports.memo(function FilterDropdown2({
  label,
  value,
  options,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex min-w-0 flex-col gap-2 sm:min-w-[10rem]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[0.65rem] uppercase tracking-[0.28em] text-navy/45", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "select",
      {
        value,
        onChange: (event) => onChange(event.target.value),
        className: "h-12 rounded-2xl border border-white/70 bg-white/80 px-4 text-sm text-navy shadow-[0_14px_32px_rgba(7,31,63,0.08)] outline-none transition focus:border-gold/70",
        children: options.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: option.value, children: option.label }, option.value))
      }
    )
  ] });
});
const SearchBar = reactExports.memo(function SearchBar2({
  value,
  onChange,
  placeholder = "Search",
  loading = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-w-0 flex-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/45" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        value,
        onChange: (event) => onChange(event.target.value),
        placeholder,
        className: "h-12 w-full rounded-2xl border border-white/70 bg-white/80 pl-11 pr-20 text-sm text-navy shadow-[0_14px_32px_rgba(7,31,63,0.08)] outline-none transition placeholder:text-navy/35 focus:border-gold/70 focus:bg-white"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2", children: [
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 animate-pulse rounded-full bg-gold" }) : null,
      value ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => onChange(""),
          className: "rounded-full p-1 text-navy/45 transition hover:bg-navy/5 hover:text-navy",
          "aria-label": "Clear search",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
        }
      ) : null
    ] })
  ] });
});
function useDebouncedValue(value, delay = 250) {
  const [debouncedValue, setDebouncedValue] = reactExports.useState(value);
  reactExports.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delay, value]);
  return debouncedValue;
}
const PAGE_SIZE = 12;
const statusOptions = [{
  label: "All statuses",
  value: ""
}, {
  label: "Active",
  value: "active"
}, {
  label: "Blocked",
  value: "blocked"
}, {
  label: "Verified",
  value: "verified"
}, {
  label: "Unverified",
  value: "unverified"
}];
const safeString = (value) => String(value || "").trim();
const safeDate = (value) => {
  const parsed = value ? new Date(String(value)) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
};
const safeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const safeIncludes = (value, query) => safeString(value).toLowerCase().includes(query.toLowerCase());
const normalizeUser = (user, index) => {
  const id = safeString(user?.id || user?._id || user?.email || `user-${index}`);
  return {
    _key: `${id}-${index}`,
    id,
    name: safeString(user?.customerName || user?.name) || "Unnamed customer",
    customerName: safeString(user?.customerName || user?.name),
    username: safeString(user?.username),
    email: safeString(user?.email),
    mobile: safeString(user?.mobileNumber || user?.mobile || user?.phone),
    mobileNumber: safeString(user?.mobileNumber || user?.mobile || user?.phone),
    phone: safeString(user?.mobileNumber || user?.phone || user?.mobile),
    role: user?.role === "admin" ? "admin" : "user",
    profileImage: safeString(user?.profileImage),
    address: safeString(user?.address),
    totalOrders: safeNumber(user?.totalOrders),
    totalSpent: safeNumber(user?.totalSpent),
    emailVerified: Boolean(user?.emailVerified),
    isBanned: Boolean(user?.isBanned),
    createdAt: safeString(user?.createdAt),
    updatedAt: safeString(user?.updatedAt),
    lastLogin: safeString(user?.lastLogin || ""),
    lastOrderDate: safeString(user?.lastOrderDate || ""),
    addresses: Array.isArray(user?.addresses) ? user.addresses : []
  };
};
const formatDate = (value, fallback = "Not available") => {
  const parsed = safeDate(value);
  return parsed ? parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }) : fallback;
};
const formatDateTime = (value, fallback = "Not available") => {
  const parsed = safeDate(value);
  return parsed ? parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) : fallback;
};
const formatCurrency = formatINR;
const formatActivityDate = (user) => {
  if (safeDate(user.lastLogin)) {
    return `Seen ${formatDateTime(user.lastLogin)}`;
  }
  if (safeDate(user.lastOrderDate)) {
    return `Last order ${formatDateTime(user.lastOrderDate)}`;
  }
  return "No recent order";
};
const getActivityCaption = (user) => safeDate(user.lastLogin) ? `Last login ${formatDate(user.lastLogin, "Never")}` : `Last order ${formatDate(user.lastOrderDate, "Never")}`;
const getPrimaryAddress = (user) => user.addresses?.find((address) => address.isDefault) || user.addresses?.[0] || null;
const getInitials = (value) => value.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "U";
function AdminUsersPage() {
  const {
    addNotification
  } = useNotification();
  const [searchInput, setSearchInput] = reactExports.useState("");
  const deferredSearch = reactExports.useDeferredValue(searchInput);
  const debouncedSearch = useDebouncedValue(deferredSearch, 280);
  const [statusFilter, setStatusFilter] = reactExports.useState("");
  const [sortBy, setSortBy] = reactExports.useState("createdAt");
  const [sortOrder, setSortOrder] = reactExports.useState("desc");
  const [page, setPage] = reactExports.useState(1);
  const [usersResponse, setUsersResponse] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [refreshing, setRefreshing] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [selectedUserId, setSelectedUserId] = reactExports.useState("");
  const [selectedUser, setSelectedUser] = reactExports.useState(null);
  const [selectedUserLoading, setSelectedUserLoading] = reactExports.useState(false);
  const [selectedUserError, setSelectedUserError] = reactExports.useState("");
  const [mutatingUserId, setMutatingUserId] = reactExports.useState("");
  const [clearUsersOpen, setClearUsersOpen] = reactExports.useState(false);
  const [clearingUsers, setClearingUsers] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);
  const loadUsers = reactExports.useCallback(async (mode = "initial") => {
    try {
      if (mode === "initial") {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const response = await adminApi.users({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch.trim(),
        status: statusFilter,
        sortBy,
        sortOrder
      });
      setUsersResponse(response);
      setError("");
    } catch (loadError) {
      const nextError = loadError instanceof Error ? loadError.message : "Users could not be loaded.";
      setError(nextError);
      setUsersResponse((current) => current || {
        users: [],
        stats: {
          totalUsers: 0,
          activeUsers: 0,
          blockedUsers: 0,
          newUsersToday: 0,
          premiumCustomers: 0,
          revenueGenerated: 0
        },
        pagination: {
          page: 1,
          limit: PAGE_SIZE,
          total: 0,
          pages: 1
        }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearch, page, sortBy, sortOrder, statusFilter]);
  reactExports.useEffect(() => {
    void loadUsers(usersResponse ? "refresh" : "initial");
  }, [loadUsers]);
  const loadUserDetails = reactExports.useCallback(async (userId) => {
    if (!userId) return;
    try {
      setSelectedUserLoading(true);
      setSelectedUserError("");
      const details = await adminApi.userDetails(userId);
      setSelectedUser(details);
    } catch (detailError) {
      setSelectedUserError(detailError instanceof Error ? detailError.message : "User details could not be loaded.");
      setSelectedUser(null);
    } finally {
      setSelectedUserLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    if (!selectedUserId) {
      setSelectedUser(null);
      setSelectedUserError("");
      return;
    }
    void loadUserDetails(selectedUserId);
  }, [loadUserDetails, selectedUserId]);
  const normalizedUsers = reactExports.useMemo(() => (usersResponse?.users || []).map((user, index) => normalizeUser(user, index)), [usersResponse?.users]);
  const filteredUsers = reactExports.useMemo(() => {
    if (!deferredSearch.trim()) {
      return normalizedUsers;
    }
    const query = deferredSearch.trim().toLowerCase();
    return normalizedUsers?.filter((user) => [user?.name, user?.customerName, user?.username, user?.email, user?.mobile, user?.address].some((value) => safeIncludes(value, query)));
  }, [deferredSearch, normalizedUsers]);
  const stats = usersResponse?.stats || {
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    newUsersToday: 0,
    premiumCustomers: 0,
    revenueGenerated: 0
  };
  const totalPages = Math.max(usersResponse?.pagination?.pages || 1, 1);
  const totalResults = usersResponse?.pagination?.total || 0;
  const handleSort = reactExports.useCallback((field) => {
    setPage(1);
    setSortOrder((current) => sortBy === field ? current === "asc" ? "desc" : "asc" : "desc");
    setSortBy(field);
  }, [sortBy]);
  const handleToggleBan = reactExports.useCallback(async (user) => {
    try {
      setMutatingUserId(user.id);
      const updatedUser = await adminApi.banUser(user.id, !user.isBanned);
      const normalized = normalizeUser(updatedUser, 0);
      setUsersResponse((current) => current ? {
        ...current,
        users: (current.users || []).map((item, index) => {
          const safeUser = normalizeUser(item, index);
          return safeUser.id === user.id ? normalized : safeUser;
        }),
        stats: {
          ...current.stats,
          activeUsers: current.stats.activeUsers + (normalized.isBanned ? -1 : 1),
          blockedUsers: current.stats.blockedUsers + (normalized.isBanned ? 1 : -1)
        }
      } : current);
      setSelectedUser((current) => current && current.user.id === user.id ? {
        ...current,
        user: normalized
      } : current);
      addNotification(normalized.isBanned ? "User access blocked successfully." : "User access restored.");
    } catch (mutationError) {
      addNotification(mutationError instanceof Error ? mutationError.message : "User access could not be updated.", "error");
    } finally {
      setMutatingUserId("");
    }
  }, [addNotification]);
  const handleDeleteUser = reactExports.useCallback(async () => {
    if (!selectedUser?.user?.id) return;
    const confirmed = window.confirm("Delete this user account? This only works for users without order history.");
    if (!confirmed) return;
    try {
      setMutatingUserId(selectedUser.user.id);
      await adminApi.deleteUser(selectedUser.user.id);
      setUsersResponse((current) => current ? {
        ...current,
        users: (current.users || []).filter((user) => safeString(user.id) !== selectedUser.user.id),
        pagination: {
          ...current.pagination,
          total: Math.max(0, current.pagination.total - 1)
        }
      } : current);
      setSelectedUserId("");
      setSelectedUser(null);
      addNotification("User deleted.");
    } catch (mutationError) {
      addNotification(mutationError instanceof Error ? mutationError.message : "User could not be deleted.", "error");
    } finally {
      setMutatingUserId("");
    }
  }, [addNotification, selectedUser?.user?.id]);
  const handleClearUsers = reactExports.useCallback(async () => {
    try {
      setClearingUsers(true);
      const result = await adminApi.clearUsers();
      setSelectedUserId("");
      setSelectedUser(null);
      setPage(1);
      await loadUsers("refresh");
      addNotification(`Users cleared. ${result.deletedUsers || 0} customer accounts removed.`);
      setClearUsersOpen(false);
    } catch (clearError) {
      addNotification(clearError instanceof Error ? clearError.message : "Users could not be cleared.", "error");
    } finally {
      setClearingUsers(false);
    }
  }, [addNotification, loadUsers]);
  const renderSortLabel = reactExports.useCallback((label, field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleSort(field), className: "inline-flex items-center gap-1.5 transition hover:text-navy", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
    sortBy === field ? sortOrder === "asc" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "h-3.5 w-3.5" }) : null
  ] }), [handleSort, sortBy, sortOrder]);
  const columns = reactExports.useMemo(() => [{
    id: "user",
    label: renderSortLabel("Customer", "name"),
    className: "min-w-[18rem]",
    render: (user) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      user.profileImage ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: user.profileImage, alt: user.name, className: "h-12 w-12 rounded-2xl object-cover shadow-[0_10px_24px_rgba(7,31,63,0.12)]" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#071f3f] to-[#c9a14a] font-semibold text-beige shadow-[0_12px_26px_rgba(7,31,63,0.16)]", children: getInitials(user.name) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-navy", children: user.name }),
          user.emailVerified ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-emerald-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-3 w-3" }),
            " Verified"
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-navy/55", children: user.username ? `@${user.username}` : "No username set" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs uppercase tracking-[0.24em] text-navy/35", children: [
          "Joined ",
          formatDate(user.createdAt)
        ] })
      ] })
    ] })
  }, {
    id: "contact",
    label: renderSortLabel("Contact", "email"),
    className: "min-w-[16rem]",
    render: (user) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-navy/75", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4 text-gold" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: user.email || "No email available" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-navy/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4 text-gold" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: user.mobile || "No phone number" })
      ] })
    ] })
  }, {
    id: "commercial",
    label: renderSortLabel("Value", "totalSpent"),
    className: "min-w-[12rem]",
    render: (user) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-navy", children: formatCurrency(user.totalSpent) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-navy/58", children: [
        safeNumber(user.totalOrders),
        " orders"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-navy/35", children: getActivityCaption(user) })
    ] })
  }, {
    id: "status",
    label: renderSortLabel("Status", "lastLogin"),
    className: "min-w-[12rem]",
    render: (user) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] ${user.isBanned ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`, children: user.isBanned ? "Blocked" : "Active" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-navy/58", children: formatActivityDate(user) })
    ] })
  }, {
    id: "actions",
    label: "Actions",
    className: "min-w-[15rem]",
    render: (user) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "soft", size: "sm", className: "gap-2", onClick: () => setSelectedUserId(user.id), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "h-4 w-4" }),
        "View details"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: user.isBanned ? "soft" : "destructive", size: "sm", className: "gap-2", disabled: mutatingUserId === user.id, onClick: () => void handleToggleBan(user), children: [
        user.isBanned ? /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-4 w-4" }),
        user.isBanned ? "Unblock" : "Block"
      ] })
    ] })
  }], [handleToggleBan, mutatingUserId, renderSortLabel]);
  const emptyState = error && !normalizedUsers.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { description: error, onRetry: () => void loadUsers("initial") }) : debouncedSearch.trim() || statusFilter ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-6 w-6" }), title: "No users match these filters", description: "Try clearing the search, switching filters, or loading a different page.", action: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
    setSearchInput("");
    setStatusFilter("");
    setPage(1);
  }, children: "Clear filters" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "h-6 w-6" }), title: "No users yet", description: "Customer accounts will appear here as soon as signups and orders begin flowing through the store." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-[2rem] border border-white/60 bg-[radial-gradient(circle_at_top_right,rgba(201,161,74,0.18),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,243,235,0.96))] p-6 shadow-[0_22px_60px_rgba(7,31,63,0.1)] md:p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.68rem] uppercase tracking-[0.42em] text-navy/45", children: "User Intelligence" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 font-display text-4xl text-navy md:text-5xl", children: "Customers & account health" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-2xl text-sm leading-7 text-navy/62", children: "Monitor customer health, revenue contribution, verification status, and account risk from one premium admin surface." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-[0.68rem] uppercase tracking-[0.24em] text-navy/70", children: [
            totalResults.toLocaleString("en-IN"),
            " accounts"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "soft", className: "gap-2", onClick: () => void loadUsers("refresh"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-4 w-4 ${refreshing ? "animate-spin" : ""}` }),
            "Refresh"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", className: "gap-2", disabled: clearingUsers, onClick: () => setClearUsersOpen(true), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
            "Clear Users"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Users", value: stats.totalUsers.toLocaleString("en-IN"), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "h-5 w-5" }), loading: loading && !usersResponse, meta: "All customer accounts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Active Users", value: stats.activeUsers.toLocaleString("en-IN"), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "h-5 w-5" }), tone: "emerald", loading: loading && !usersResponse, meta: "Currently active customer base" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Blocked Users", value: stats.blockedUsers.toLocaleString("en-IN"), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { className: "h-5 w-5" }), tone: "rose", loading: loading && !usersResponse, meta: "Accounts restricted from access" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "New Today", value: stats.newUsersToday.toLocaleString("en-IN"), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-5 w-5" }), tone: "gold", loading: loading && !usersResponse, meta: "Fresh signups since midnight" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Premium", value: stats.premiumCustomers.toLocaleString("en-IN"), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-5 w-5" }), tone: "gold", loading: loading && !usersResponse, meta: "High-value repeat customers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Revenue Generated", value: formatCurrency(stats.revenueGenerated), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-5 w-5" }), tone: "navy", loading: loading && !usersResponse, meta: "Lifetime revenue from completed customers" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-8 rounded-[1.8rem] border border-white/70 bg-white/70 p-4 shadow-[0_18px_40px_rgba(7,31,63,0.08)] backdrop-blur md:p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 xl:flex-row xl:items-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SearchBar, { value: searchInput, onChange: setSearchInput, placeholder: "Search name, username, email, or phone", loading: refreshing }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 xl:flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FilterDropdown, { label: "Status", value: statusFilter, options: statusOptions, onChange: setStatusFilter }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-col gap-3 border-t border-border/70 pt-4 text-sm text-navy/58 md:flex-row md:items-center md:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Showing ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-navy", children: filteredUsers.length }),
            " results",
            debouncedSearch.trim() ? ` for "${debouncedSearch.trim()}"` : "",
            "."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-navy/42", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-navy/6 px-3 py-2", children: [
              "Sorted by ",
              sortBy
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-navy/6 px-3 py-2", children: sortOrder === "asc" ? "Ascending" : "Descending" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: loading && !usersResponse ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-20 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-20 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-20 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-20 w-full" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DataTable, { columns, rows: filteredUsers, rowKey: (user) => user._key, emptyState, mobileCard: (user) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            user.profileImage ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: user.profileImage, alt: user.name, className: "h-12 w-12 rounded-2xl object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#071f3f] to-[#c9a14a] font-semibold text-beige", children: getInitials(user.name) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-navy", children: user.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-navy/55", children: user.email || "No email available" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] ${user.isBanned ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`, children: user.isBanned ? "Blocked" : "Active" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-[#f9f4ea] p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.2em] text-navy/42", children: "Spend" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-2xl text-navy", children: formatCurrency(user.totalSpent) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-[#f3f7fb] p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.2em] text-navy/42", children: "Orders" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-2xl text-navy", children: safeNumber(user.totalOrders) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "soft", size: "sm", className: "gap-2", onClick: () => setSelectedUserId(user.id), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "h-4 w-4" }),
            "View details"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: user.isBanned ? "soft" : "destructive", size: "sm", className: "gap-2", disabled: mutatingUserId === user.id, onClick: () => void handleToggleBan(user), children: [
            user.isBanned ? /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-4 w-4" }),
            user.isBanned ? "Unblock" : "Block"
          ] })
        ] })
      ] }) }) }),
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
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: selectedUserId ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(motion.button, { type: "button", className: "fixed inset-0 z-40 bg-black/35 backdrop-blur-sm", initial: {
        opacity: 0
      }, animate: {
        opacity: 1
      }, exit: {
        opacity: 0
      }, onClick: () => setSelectedUserId(""), "aria-label": "Close user drawer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.aside, { initial: {
        x: "100%"
      }, animate: {
        x: 0
      }, exit: {
        x: "100%"
      }, transition: {
        type: "spring",
        damping: 28,
        stiffness: 260
      }, className: "fixed inset-y-0 right-0 z-50 w-full max-w-2xl overflow-y-auto border-l border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,241,233,0.98))] p-5 shadow-[0_30px_80px_rgba(7,31,63,0.2)] backdrop-blur md:p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.34em] text-navy/42", children: "Customer profile" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 font-display text-3xl text-navy", children: "Account intelligence" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setSelectedUserId(""), className: "rounded-full border border-border bg-white/90 p-2 text-navy/55 transition hover:text-navy", "aria-label": "Close user details", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) })
        ] }),
        selectedUserLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-28 w-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-40 w-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "h-40 w-full" })
        ] }) : selectedUserError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { description: selectedUserError, onRetry: () => void loadUserDetails(selectedUserId) }) }) : selectedUser ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-[1.7rem] border border-white/70 bg-white/80 p-5 shadow-[0_16px_34px_rgba(7,31,63,0.08)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
                selectedUser.user.profileImage ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: selectedUser.user.profileImage, alt: selectedUser.user.name, className: "h-16 w-16 rounded-[1.4rem] object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-[#071f3f] to-[#c9a14a] text-xl font-semibold text-beige", children: getInitials(selectedUser.user.name) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-3xl text-navy", children: selectedUser.user.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] ${selectedUser.user.isBanned ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`, children: selectedUser.user.isBanned ? "Blocked" : "Active" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-navy/58", children: selectedUser.user.email || "No email available" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-navy/42", children: selectedUser.user.username ? `@${selectedUser.user.username}` : "Username not set" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: selectedUser.user.isBanned ? "soft" : "destructive", size: "sm", className: "gap-2", disabled: mutatingUserId === selectedUser.user.id, onClick: () => void handleToggleBan(selectedUser.user), children: [
                  selectedUser.user.isBanned ? /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-4 w-4" }),
                  selectedUser.user.isBanned ? "Unblock" : "Block"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "gap-2", onClick: handleDeleteUser, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
                  "Delete"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid gap-4 sm:grid-cols-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-[#fbf7ef] p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.2em] text-navy/42", children: "Total spend" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-3xl text-navy", children: formatCurrency(selectedUser.summary.totalSpent) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-[#f3f7fb] p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.2em] text-navy/42", children: "Orders" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-3xl text-navy", children: selectedUser.summary.totalOrders })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-[#f5f8f2] p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.2em] text-navy/42", children: "Average order" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-3xl text-navy", children: formatCurrency(selectedUser.summary.averageOrderValue) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-[1.7rem] border border-white/70 bg-white/80 p-5 shadow-[0_16px_34px_rgba(7,31,63,0.08)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-end md:justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-2xl text-navy", children: "Account overview" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-7 text-navy/58", children: "Review customer contact details, order health, and saved delivery information without leaving the dashboard." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/orders", className: "text-xs uppercase tracking-[0.24em] text-navy/52 transition hover:text-gold", children: "View all orders" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid gap-4 md:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-[#f7f4ee] p-4 text-sm text-navy/65", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.2em] text-navy/42", children: "Profile" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-navy", children: "Phone:" }),
                    " ",
                    selectedUser.user.mobile || "Not provided"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-navy", children: "Joined:" }),
                    " ",
                    formatDateTime(selectedUser.user.createdAt)
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-navy", children: "Last order:" }),
                    " ",
                    formatDateTime(selectedUser.user.lastOrderDate, "Not available")
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-[#f2f5fa] p-4 text-sm text-navy/65", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.2em] text-navy/42", children: "Primary address" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-2", children: getPrimaryAddress(selectedUser.user) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-navy", children: getPrimaryAddress(selectedUser.user)?.fullName || selectedUser.user.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: getPrimaryAddress(selectedUser.user)?.line1 || selectedUser.user.address || "Address line unavailable" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: [getPrimaryAddress(selectedUser.user)?.city, getPrimaryAddress(selectedUser.user)?.state, getPrimaryAddress(selectedUser.user)?.postalCode].filter(Boolean).join(", ") || selectedUser.user.address || "City details unavailable" })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: selectedUser.user.address || "No saved addresses yet." }) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-[1.7rem] border border-white/70 bg-white/80 p-5 shadow-[0_16px_34px_rgba(7,31,63,0.08)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-2xl text-navy", children: "Recent orders" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-3", children: selectedUser.recentOrders?.length ? selectedUser.recentOrders.map((order) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border/70 bg-[#faf8f3] p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-navy", children: order.productName || order.items?.[0]?.productName || `Order ${getOrderDisplayId(order)}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-navy/58", children: [
                  formatDateTime(order.createdAt),
                  " - ",
                  formatOrderStatusLabel(order.status || order.orderStatus)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-right", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-navy", children: formatCurrency(order.totalAmount) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-navy/52", children: [
                  "Payment: ",
                  formatPaymentStatusLabel(order.paymentStatus)
                ] })
              ] })
            ] }) }, safeString(order.id || order._id))) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-2xl bg-[#faf8f3] px-4 py-5 text-sm text-navy/58", children: "No orders found for this user yet." }) })
          ] })
        ] }) : null
      ] })
    ] }) : null }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmModal, { isOpen: clearUsersOpen, title: "Clear Users", message: "This will remove all customer accounts.", confirmLabel: "Clear Users", loading: clearingUsers, onClose: () => setClearUsersOpen(false), onConfirm: handleClearUsers })
  ] });
}
export {
  AdminUsersPage as component
};
