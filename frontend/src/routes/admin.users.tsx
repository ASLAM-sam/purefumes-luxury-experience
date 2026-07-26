import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Ban,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Crown,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserRound,
  UserX,
  Wallet,
  X,
} from "lucide-react";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { FilterDropdown } from "@/components/admin/FilterDropdown";
import { SearchBar } from "@/components/admin/SearchBar";
import { StatCard } from "@/components/admin/StatCard";
import { Button } from "@/components/common/Button";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useNotification } from "@/context/NotificationContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatINR } from "@/lib/money";
import {
  adminApi,
  type AdminUser,
  type AdminUserDetailsResponse,
  type AdminUsersResponse,
} from "@/services/api";

type SortField =
  | "createdAt"
  | "lastLogin"
  | "name"
  | "email"
  | "username"
  | "mobile"
  | "totalOrders"
  | "totalSpent";

const PAGE_SIZE = 12;

const statusOptions = [
  { label: "All statuses", value: "" },
  { label: "Active", value: "active" },
  { label: "Blocked", value: "blocked" },
  { label: "Verified", value: "verified" },
  { label: "Unverified", value: "unverified" },
];

const safeString = (value: unknown) => String(value || "").trim();
const safeDate = (value: unknown) => {
  const parsed = value ? new Date(String(value)) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
};
const safeNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const safeIncludes = (value: unknown, query: string) =>
  safeString(value).toLowerCase().includes(query.toLowerCase());

type AdminUserLike = Partial<AdminUser> & { _id?: string };

const normalizeUser = (user: AdminUserLike | null | undefined, index: number): AdminUser & { _key: string } => {
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
    addresses: Array.isArray(user?.addresses) ? user.addresses : [],
  };
};

const formatDate = (value: unknown, fallback = "Not available") => {
  const parsed = safeDate(value);
  return parsed ? parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : fallback;
};

const formatDateTime = (value: unknown, fallback = "Not available") => {
  const parsed = safeDate(value);
  return parsed
    ? parsed.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : fallback;
};

const formatCurrency = formatINR;

const formatActivityDate = (user: Pick<AdminUser, "lastLogin" | "lastOrderDate">) => {
  if (safeDate(user.lastLogin)) {
    return `Seen ${formatDateTime(user.lastLogin)}`;
  }

  if (safeDate(user.lastOrderDate)) {
    return `Last order ${formatDateTime(user.lastOrderDate)}`;
  }

  return "No recent order";
};

const getActivityCaption = (user: Pick<AdminUser, "lastLogin" | "lastOrderDate">) =>
  safeDate(user.lastLogin)
    ? `Last login ${formatDate(user.lastLogin, "Never")}`
    : `Last order ${formatDate(user.lastOrderDate, "Never")}`;

const getPrimaryAddress = (user: Pick<AdminUser, "addresses" | "address" | "name">) =>
  user.addresses?.find((address) => address.isDefault) || user.addresses?.[0] || null;

const getInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";

function UsersPageError() {
  return (
    <AdminShell>
      <ErrorState
        title="Users dashboard could not render"
        description="A page-level error interrupted the admin users experience. Reload the route and try again."
      />
    </AdminShell>
  );
}

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
  errorComponent: UsersPageError,
});

function AdminUsersPage() {
  const { addNotification } = useNotification();
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput);
  const debouncedSearch = useDebouncedValue(deferredSearch, 280);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [usersResponse, setUsersResponse] = useState<AdminUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUserDetailsResponse | null>(null);
  const [selectedUserLoading, setSelectedUserLoading] = useState(false);
  const [selectedUserError, setSelectedUserError] = useState("");
  const [mutatingUserId, setMutatingUserId] = useState("");
  const [clearUsersOpen, setClearUsersOpen] = useState(false);
  const [clearingUsers, setClearingUsers] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const loadUsers = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
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
          sortOrder,
        });

        setUsersResponse(response);
        setError("");
      } catch (loadError) {
        const nextError =
          loadError instanceof Error ? loadError.message : "Users could not be loaded.";
        setError(nextError);
        setUsersResponse((current) => current || {
            users: [],
            stats: {
              totalUsers: 0,
              activeUsers: 0,
              blockedUsers: 0,
              newUsersToday: 0,
              premiumCustomers: 0,
              revenueGenerated: 0,
            },
            pagination: { page: 1, limit: PAGE_SIZE, total: 0, pages: 1 },
          });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [debouncedSearch, page, sortBy, sortOrder, statusFilter],
  );

  useEffect(() => {
    void loadUsers(usersResponse ? "refresh" : "initial");
  }, [loadUsers]);

  const loadUserDetails = useCallback(
    async (userId: string) => {
      if (!userId) return;

      try {
        setSelectedUserLoading(true);
        setSelectedUserError("");
        const details = await adminApi.userDetails(userId);
        setSelectedUser(details);
      } catch (detailError) {
        setSelectedUserError(
          detailError instanceof Error ? detailError.message : "User details could not be loaded.",
        );
        setSelectedUser(null);
      } finally {
        setSelectedUserLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUser(null);
      setSelectedUserError("");
      return;
    }

    void loadUserDetails(selectedUserId);
  }, [loadUserDetails, selectedUserId]);

  const normalizedUsers = useMemo(
    () => (usersResponse?.users || []).map((user, index) => normalizeUser(user, index)),
    [usersResponse?.users],
  );

  const filteredUsers = useMemo(() => {
    if (!deferredSearch.trim()) {
      return normalizedUsers;
    }

    const query = deferredSearch.trim().toLowerCase();

    return normalizedUsers?.filter((user) =>
      [
        user?.name,
        user?.customerName,
        user?.username,
        user?.email,
        user?.mobile,
        user?.address,
      ].some((value) => safeIncludes(value, query)),
    );
  }, [deferredSearch, normalizedUsers]);

  const stats = usersResponse?.stats || {
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    newUsersToday: 0,
    premiumCustomers: 0,
    revenueGenerated: 0,
  };

  const totalPages = Math.max(usersResponse?.pagination?.pages || 1, 1);
  const totalResults = usersResponse?.pagination?.total || 0;

  const handleSort = useCallback((field: SortField) => {
    setPage(1);
    setSortOrder((current) => (sortBy === field ? (current === "asc" ? "desc" : "asc") : "desc"));
    setSortBy(field);
  }, [sortBy]);

  const handleToggleBan = useCallback(
    async (user: AdminUser) => {
      try {
        setMutatingUserId(user.id);
        const updatedUser = await adminApi.banUser(user.id, !user.isBanned);
        const normalized = normalizeUser(updatedUser, 0);

        setUsersResponse((current) =>
          current
            ? {
                ...current,
                users: (current.users || []).map((item, index) => {
                  const safeUser = normalizeUser(item, index);
                  return safeUser.id === user.id ? normalized : safeUser;
                }),
                stats: {
                  ...current.stats,
                  activeUsers: current.stats.activeUsers + (normalized.isBanned ? -1 : 1),
                  blockedUsers: current.stats.blockedUsers + (normalized.isBanned ? 1 : -1),
                },
              }
            : current,
        );

        setSelectedUser((current) =>
          current && current.user.id === user.id
            ? {
                ...current,
                user: normalized,
              }
            : current,
        );

        addNotification(
          normalized.isBanned ? "User access blocked successfully." : "User access restored.",
        );
      } catch (mutationError) {
        addNotification(
          mutationError instanceof Error ? mutationError.message : "User access could not be updated.",
          "error",
        );
      } finally {
        setMutatingUserId("");
      }
    },
    [addNotification],
  );

  const handleDeleteUser = useCallback(async () => {
    if (!selectedUser?.user?.id) return;

    const confirmed = window.confirm(
      "Delete this user account? This only works for users without order history.",
    );

    if (!confirmed) return;

    try {
      setMutatingUserId(selectedUser.user.id);
      await adminApi.deleteUser(selectedUser.user.id);
      setUsersResponse((current) =>
        current
          ? {
              ...current,
              users: (current.users || []).filter((user) => safeString(user.id) !== selectedUser.user.id),
              pagination: {
                ...current.pagination,
                total: Math.max(0, current.pagination.total - 1),
              },
            }
          : current,
      );
      setSelectedUserId("");
      setSelectedUser(null);
      addNotification("User deleted.");
    } catch (mutationError) {
      addNotification(
        mutationError instanceof Error ? mutationError.message : "User could not be deleted.",
        "error",
      );
    } finally {
      setMutatingUserId("");
    }
  }, [addNotification, selectedUser?.user?.id]);

  const handleClearUsers = useCallback(async () => {
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
      addNotification(
        clearError instanceof Error ? clearError.message : "Users could not be cleared.",
        "error",
      );
    } finally {
      setClearingUsers(false);
    }
  }, [addNotification, loadUsers]);

  const renderSortLabel = useCallback(
    (label: string, field: SortField) => (
      <button
        type="button"
        onClick={() => handleSort(field)}
        className="inline-flex items-center gap-1.5 transition hover:text-navy"
      >
        <span>{label}</span>
        {sortBy === field ? (
          sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
        ) : null}
      </button>
    ),
    [handleSort, sortBy, sortOrder],
  );

  const columns = useMemo<DataTableColumn<(typeof filteredUsers)[number]>[]>(
    () => [
      {
        id: "user",
        label: renderSortLabel("Customer", "name"),
        className: "min-w-[18rem]",
        render: (user) => (
          <div className="flex items-start gap-3">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="h-12 w-12 rounded-2xl object-cover shadow-[0_10px_24px_rgba(7,31,63,0.12)]"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#071f3f] to-[#c9a14a] font-semibold text-beige shadow-[0_12px_26px_rgba(7,31,63,0.16)]">
                {getInitials(user.name)}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-navy">{user.name}</p>
                {user.emailVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-emerald-700">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-navy/55">{user.username ? `@${user.username}` : "No username set"}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.24em] text-navy/35">
                Joined {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "contact",
        label: renderSortLabel("Contact", "email"),
        className: "min-w-[16rem]",
        render: (user) => (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-navy/75">
              <Mail className="h-4 w-4 text-gold" />
              <span className="truncate">{user.email || "No email available"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-navy/60">
              <Phone className="h-4 w-4 text-gold" />
              <span>{user.mobile || "No phone number"}</span>
            </div>
          </div>
        ),
      },
      {
        id: "commercial",
        label: renderSortLabel("Value", "totalSpent"),
        className: "min-w-[12rem]",
        render: (user) => (
          <div className="space-y-1">
            <p className="font-semibold text-navy">{formatCurrency(user.totalSpent)}</p>
            <p className="text-sm text-navy/58">{safeNumber(user.totalOrders)} orders</p>
            <p className="text-xs uppercase tracking-[0.2em] text-navy/35">
              {getActivityCaption(user)}
            </p>
          </div>
        ),
      },
      {
        id: "status",
        label: renderSortLabel("Status", "lastLogin"),
        className: "min-w-[12rem]",
        render: (user) => (
          <div className="space-y-2">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] ${
                user.isBanned ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {user.isBanned ? "Blocked" : "Active"}
            </span>
            <p className="text-sm text-navy/58">
              {formatActivityDate(user)}
            </p>
          </div>
        ),
      },
      {
        id: "actions",
        label: "Actions",
        className: "min-w-[15rem]",
        render: (user) => (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="soft"
              size="sm"
              className="gap-2"
              onClick={() => setSelectedUserId(user.id)}
            >
              <UserRound className="h-4 w-4" />
              View details
            </Button>
            <Button
              variant={user.isBanned ? "soft" : "destructive"}
              size="sm"
              className="gap-2"
              disabled={mutatingUserId === user.id}
              onClick={() => void handleToggleBan(user)}
            >
              {user.isBanned ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
              {user.isBanned ? "Unblock" : "Block"}
            </Button>
          </div>
        ),
      },
    ],
    [handleToggleBan, mutatingUserId, renderSortLabel],
  );

  const emptyState = error && !normalizedUsers.length ? (
    <ErrorState description={error} onRetry={() => void loadUsers("initial")} />
  ) : debouncedSearch.trim() || statusFilter ? (
    <EmptyState
      icon={<AlertCircle className="h-6 w-6" />}
      title="No users match these filters"
      description="Try clearing the search, switching filters, or loading a different page."
      action={
        <Button
          variant="outline"
          onClick={() => {
            setSearchInput("");
            setStatusFilter("");
            setPage(1);
          }}
        >
          Clear filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={<UserRound className="h-6 w-6" />}
      title="No users yet"
      description="Customer accounts will appear here as soon as signups and orders begin flowing through the store."
    />
  );

  return (
    <AdminShell>
      <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-[radial-gradient(circle_at_top_right,rgba(201,161,74,0.18),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,243,235,0.96))] p-6 shadow-[0_22px_60px_rgba(7,31,63,0.1)] md:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.42em] text-navy/45">User Intelligence</p>
            <h1 className="mt-2 font-display text-4xl text-navy md:text-5xl">Customers & account health</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-navy/62">
              Monitor customer health, revenue contribution, verification status, and account risk from one premium admin surface.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-[0.68rem] uppercase tracking-[0.24em] text-navy/70">
              {totalResults.toLocaleString("en-IN")} accounts
            </span>
            <Button variant="soft" className="gap-2" onClick={() => void loadUsers("refresh")}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="destructive"
              className="gap-2"
              disabled={clearingUsers}
              onClick={() => setClearUsersOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Clear Users
            </Button>
          </div>
        </header>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <StatCard
            label="Total Users"
            value={stats.totalUsers.toLocaleString("en-IN")}
            icon={<UserRound className="h-5 w-5" />}
            loading={loading && !usersResponse}
            meta="All customer accounts"
          />
          <StatCard
            label="Active Users"
            value={stats.activeUsers.toLocaleString("en-IN")}
            icon={<UserCheck className="h-5 w-5" />}
            tone="emerald"
            loading={loading && !usersResponse}
            meta="Currently active customer base"
          />
          <StatCard
            label="Blocked Users"
            value={stats.blockedUsers.toLocaleString("en-IN")}
            icon={<UserX className="h-5 w-5" />}
            tone="rose"
            loading={loading && !usersResponse}
            meta="Accounts restricted from access"
          />
          <StatCard
            label="New Today"
            value={stats.newUsersToday.toLocaleString("en-IN")}
            icon={<CalendarDays className="h-5 w-5" />}
            tone="gold"
            loading={loading && !usersResponse}
            meta="Fresh signups since midnight"
          />
          <StatCard
            label="Premium"
            value={stats.premiumCustomers.toLocaleString("en-IN")}
            icon={<Crown className="h-5 w-5" />}
            tone="gold"
            loading={loading && !usersResponse}
            meta="High-value repeat customers"
          />
          <StatCard
            label="Revenue Generated"
            value={formatCurrency(stats.revenueGenerated)}
            icon={<Wallet className="h-5 w-5" />}
            tone="navy"
            loading={loading && !usersResponse}
            meta="Lifetime revenue from completed customers"
          />
        </div>

        <section className="mt-8 rounded-[1.8rem] border border-white/70 bg-white/70 p-4 shadow-[0_18px_40px_rgba(7,31,63,0.08)] backdrop-blur md:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search name, username, email, or phone"
              loading={refreshing}
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:flex">
              <FilterDropdown label="Status" value={statusFilter} options={statusOptions} onChange={setStatusFilter} />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-border/70 pt-4 text-sm text-navy/58 md:flex-row md:items-center md:justify-between">
            <p>
              Showing <span className="font-semibold text-navy">{filteredUsers.length}</span> results
              {debouncedSearch.trim() ? ` for "${debouncedSearch.trim()}"` : ""}.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-navy/42">
              <span className="rounded-full bg-navy/6 px-3 py-2">Sorted by {sortBy}</span>
              <span className="rounded-full bg-navy/6 px-3 py-2">{sortOrder === "asc" ? "Ascending" : "Descending"}</span>
            </div>
          </div>
        </section>

        <div className="mt-6">
          {loading && !usersResponse ? (
            <div className="space-y-4">
              <LoadingSkeleton className="h-20 w-full" />
              <LoadingSkeleton className="h-20 w-full" />
              <LoadingSkeleton className="h-20 w-full" />
              <LoadingSkeleton className="h-20 w-full" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={filteredUsers}
              rowKey={(user) => user._key}
              emptyState={emptyState}
              mobileCard={(user) => (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="h-12 w-12 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#071f3f] to-[#c9a14a] font-semibold text-beige">
                          {getInitials(user.name)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-navy">{user.name}</p>
                        <p className="text-sm text-navy/55">{user.email || "No email available"}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] ${
                        user.isBanned ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {user.isBanned ? "Blocked" : "Active"}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#f9f4ea] p-3">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-navy/42">Spend</p>
                      <p className="mt-2 font-display text-2xl text-navy">{formatCurrency(user.totalSpent)}</p>
                    </div>
                    <div className="rounded-2xl bg-[#f3f7fb] p-3">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-navy/42">Orders</p>
                      <p className="mt-2 font-display text-2xl text-navy">{safeNumber(user.totalOrders)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="soft" size="sm" className="gap-2" onClick={() => setSelectedUserId(user.id)}>
                      <UserRound className="h-4 w-4" />
                      View details
                    </Button>
                    <Button
                      variant={user.isBanned ? "soft" : "destructive"}
                      size="sm"
                      className="gap-2"
                      disabled={mutatingUserId === user.id}
                      onClick={() => void handleToggleBan(user)}
                    >
                      {user.isBanned ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      {user.isBanned ? "Unblock" : "Block"}
                    </Button>
                  </div>
                </div>
              )}
            />
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-white/70 bg-white/72 px-4 py-4 shadow-[0_12px_24px_rgba(7,31,63,0.06)] sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-navy/58">
            Page <span className="font-semibold text-navy">{page}</span> of{" "}
            <span className="font-semibold text-navy">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="soft"
              size="sm"
              disabled={page <= 1}
              className="gap-2"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="soft"
              size="sm"
              disabled={page >= totalPages}
              className="gap-2"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedUserId ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUserId("")}
              aria-label="Close user drawer"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl overflow-y-auto border-l border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,241,233,0.98))] p-5 shadow-[0_30px_80px_rgba(7,31,63,0.2)] backdrop-blur md:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.34em] text-navy/42">Customer profile</p>
                  <h2 className="mt-2 font-display text-3xl text-navy">Account intelligence</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUserId("")}
                  className="rounded-full border border-border bg-white/90 p-2 text-navy/55 transition hover:text-navy"
                  aria-label="Close user details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {selectedUserLoading ? (
                <div className="mt-6 space-y-4">
                  <LoadingSkeleton className="h-28 w-full" />
                  <LoadingSkeleton className="h-40 w-full" />
                  <LoadingSkeleton className="h-40 w-full" />
                </div>
              ) : selectedUserError ? (
                <div className="mt-6">
                  <ErrorState description={selectedUserError} onRetry={() => void loadUserDetails(selectedUserId)} />
                </div>
              ) : selectedUser ? (
                <div className="mt-6 space-y-6">
                  <section className="rounded-[1.7rem] border border-white/70 bg-white/80 p-5 shadow-[0_16px_34px_rgba(7,31,63,0.08)]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-center gap-4">
                        {selectedUser.user.profileImage ? (
                          <img
                            src={selectedUser.user.profileImage}
                            alt={selectedUser.user.name}
                            className="h-16 w-16 rounded-[1.4rem] object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-[#071f3f] to-[#c9a14a] text-xl font-semibold text-beige">
                            {getInitials(selectedUser.user.name)}
                          </div>
                        )}
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-display text-3xl text-navy">{selectedUser.user.name}</h3>
                            <span
                              className={`rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] ${
                                selectedUser.user.isBanned
                                  ? "bg-red-100 text-red-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {selectedUser.user.isBanned ? "Blocked" : "Active"}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-navy/58">{selectedUser.user.email || "No email available"}</p>
                          <p className="mt-1 text-sm text-navy/42">
                            {selectedUser.user.username ? `@${selectedUser.user.username}` : "Username not set"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={selectedUser.user.isBanned ? "soft" : "destructive"}
                          size="sm"
                          className="gap-2"
                          disabled={mutatingUserId === selectedUser.user.id}
                          onClick={() => void handleToggleBan(selectedUser.user)}
                        >
                          {selectedUser.user.isBanned ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                          {selectedUser.user.isBanned ? "Unblock" : "Block"}
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2" onClick={handleDeleteUser}>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-2xl bg-[#fbf7ef] p-4">
                        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-navy/42">Total spend</p>
                        <p className="mt-2 font-display text-3xl text-navy">{formatCurrency(selectedUser.summary.totalSpent)}</p>
                      </div>
                      <div className="rounded-2xl bg-[#f3f7fb] p-4">
                        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-navy/42">Orders</p>
                        <p className="mt-2 font-display text-3xl text-navy">{selectedUser.summary.totalOrders}</p>
                      </div>
                      <div className="rounded-2xl bg-[#f5f8f2] p-4">
                        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-navy/42">Average order</p>
                        <p className="mt-2 font-display text-3xl text-navy">{formatCurrency(selectedUser.summary.averageOrderValue)}</p>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-[1.7rem] border border-white/70 bg-white/80 p-5 shadow-[0_16px_34px_rgba(7,31,63,0.08)]">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                      <div>
                        <h3 className="font-display text-2xl text-navy">Account overview</h3>
                        <p className="mt-2 text-sm leading-7 text-navy/58">
                          Review customer contact details, order health, and saved delivery information without leaving the dashboard.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl bg-[#f7f4ee] p-4 text-sm text-navy/65">
                        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-navy/42">Profile</p>
                        <div className="mt-3 space-y-2">
                          <p><span className="font-medium text-navy">Phone:</span> {selectedUser.user.mobile || "Not provided"}</p>
                          <p><span className="font-medium text-navy">Joined:</span> {formatDateTime(selectedUser.user.createdAt)}</p>
                          <p><span className="font-medium text-navy">Last order:</span> {formatDateTime(selectedUser.user.lastOrderDate, "Not available")}</p>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-[#f2f5fa] p-4 text-sm text-navy/65">
                        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-navy/42">Primary address</p>
                        <div className="mt-3 space-y-2">
                          {getPrimaryAddress(selectedUser.user) ? (
                            <>
                              <p className="font-medium text-navy">{getPrimaryAddress(selectedUser.user)?.fullName || selectedUser.user.name}</p>
                              <p>{getPrimaryAddress(selectedUser.user)?.line1 || selectedUser.user.address || "Address line unavailable"}</p>
                              <p>
                                {[getPrimaryAddress(selectedUser.user)?.city, getPrimaryAddress(selectedUser.user)?.state, getPrimaryAddress(selectedUser.user)?.postalCode]
                                  .filter(Boolean)
                                  .join(", ") || selectedUser.user.address || "City details unavailable"}
                              </p>
                            </>
                          ) : (
                            <p>{selectedUser.user.address || "No saved addresses yet."}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                </div>
              ) : null}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <ConfirmModal
        isOpen={clearUsersOpen}
        title="Clear Users"
        message="This will remove all customer accounts."
        confirmLabel="Clear Users"
        loading={clearingUsers}
        onClose={() => setClearUsersOpen(false)}
        onConfirm={handleClearUsers}
      />
    </AdminShell>
  );
}
