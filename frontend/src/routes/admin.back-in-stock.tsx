import { createFileRoute } from "@tanstack/react-router";
import { BellRing, ChevronLeft, ChevronRight, RefreshCw, RotateCcw, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { useNotification } from "@/context/NotificationContext";
import { formatINR } from "@/lib/money";
import {
  adminApi,
  type BackInStockNotification,
  type BackInStockNotificationStatus,
} from "@/services/api";

export const Route = createFileRoute("/admin/back-in-stock")({
  component: AdminBackInStockNotifications,
});

const PAGE_SIZE = 12;

const STATUSES: BackInStockNotificationStatus[] = [
  "pending",
  "queued",
  "sent",
  "failed",
  "cancelled",
];

const statusLabel: Record<BackInStockNotificationStatus, string> = {
  pending: "Pending",
  queued: "Queued",
  sent: "Sent",
  failed: "Failed",
  cancelled: "Cancelled",
};

const statusStyles: Record<BackInStockNotificationStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  queued: "bg-sky-100 text-sky-800",
  sent: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-800",
  cancelled: "bg-slate-200 text-slate-700",
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

function ProductCell({ notification }: { notification: BackInStockNotification }) {
  const image = notification.product?.image || "";
  const name = notification.product?.name || notification.productName || "Product";

  return (
    <div className="flex min-w-0 items-center gap-3">
      {image ? (
        <OptimizedImage
          src={image}
          alt={name}
          sizes="56px"
          className="h-14 w-14 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-beige/70 font-display text-xl text-navy/35">
          {name.charAt(0)}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate font-medium text-navy">{name}</p>
        <p className="mt-1 text-xs text-navy/55">
          {notification.product?.price
            ? formatINR(notification.product.price)
            : "Price unavailable"}
        </p>
      </div>
    </div>
  );
}

function NotificationActions({
  notification,
  busy,
  onRetry,
  onCancel,
}: {
  notification: BackInStockNotification;
  busy: boolean;
  onRetry: (notification: BackInStockNotification) => void;
  onCancel: (notification: BackInStockNotification) => void;
}) {
  if (notification.status === "sent" || notification.status === "cancelled") {
    return <span className="text-xs text-navy/45">No action</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {notification.status === "failed" ? (
        <Button
          variant="soft"
          size="sm"
          className="gap-2"
          disabled={busy}
          onClick={() => onRetry(notification)}
        >
          <RotateCcw className="h-4 w-4" />
          Retry
        </Button>
      ) : null}
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        disabled={busy}
        onClick={() => onCancel(notification)}
      >
        <X className="h-4 w-4" />
        Cancel
      </Button>
    </div>
  );
}

function AdminBackInStockNotifications() {
  const { addNotification } = useNotification();
  const [notifications, setNotifications] = useState<BackInStockNotification[]>([]);
  const [statusFilter, setStatusFilter] = useState<BackInStockNotificationStatus | "">("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const load = useCallback(
    async (silent = false) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      try {
        const response = await adminApi.backInStockNotifications({
          page,
          limit: PAGE_SIZE,
          status: statusFilter,
          search: search.trim() || undefined,
        });
        setNotifications(response.notifications);
        setTotalPages(Math.max(response.pagination.pages || 1, 1));
        setTotalNotifications(response.pagination.total || 0);
      } catch (ex) {
        const message =
          ex instanceof Error ? ex.message : "Back in stock notifications could not be loaded.";
        setError(message);
        if (silent) {
          addNotification(message, "error");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [addNotification, page, search, statusFilter],
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const refresh = () => load(true);
    window.addEventListener("focus", refresh);
    window.addEventListener("purefumes:back-in-stock-changed", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("purefumes:back-in-stock-changed", refresh);
    };
  }, [load]);

  const counts = useMemo(
    () =>
      notifications.reduce<Record<BackInStockNotificationStatus, number>>(
        (acc, notification) => {
          acc[notification.status] += 1;
          return acc;
        },
        { pending: 0, queued: 0, sent: 0, failed: 0, cancelled: 0 },
      ),
    [notifications],
  );

  const retryNotification = useCallback(
    async (notification: BackInStockNotification) => {
      setActionId(notification.id);
      try {
        await adminApi.retryBackInStockNotification(notification.id);
        addNotification("Back in stock email queued.");
        load(true);
      } catch (ex) {
        addNotification(
          ex instanceof Error ? ex.message : "Back in stock email could not be retried.",
          "error",
        );
      } finally {
        setActionId("");
      }
    },
    [addNotification, load],
  );

  const cancelNotification = useCallback(
    async (notification: BackInStockNotification) => {
      setActionId(notification.id);
      try {
        await adminApi.cancelBackInStockNotification(notification.id);
        addNotification("Back in stock notification cancelled.");
        load(true);
      } catch (ex) {
        addNotification(
          ex instanceof Error ? ex.message : "Back in stock notification could not be cancelled.",
          "error",
        );
      } finally {
        setActionId("");
      }
    },
    [addNotification, load],
  );

  return (
    <AdminShell>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mt-1 text-[0.65rem] uppercase tracking-[0.4em] text-navy/50">
            Inventory Alerts
          </p>
          <h1 className="font-display text-4xl text-navy">Back In Stock Notifications</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-navy/60">
            Review customer availability requests and email queue status from one place.
          </p>
        </div>
        <span className="rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-[0.68rem] uppercase tracking-[0.24em] text-navy/70">
          {totalNotifications.toLocaleString("en-IN")} alerts
        </span>
      </header>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="rounded-[1.5rem] border border-white/70 bg-white/75 p-4 shadow-[0_16px_36px_rgba(7,31,63,0.07)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <label className="block flex-1">
              <span className="text-[0.65rem] uppercase tracking-[0.24em] text-navy/45">
                Search
              </span>
              <span className="mt-2 flex h-12 items-center gap-2 rounded-2xl border border-border bg-white/90 px-4">
                <Search className="h-4 w-4 text-gold" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-navy/35"
                  placeholder="Product, email, phone"
                />
              </span>
            </label>
            <Button
              variant="soft"
              size="sm"
              className="gap-2"
              disabled={refreshing}
              onClick={() => load(true)}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-white/70 bg-white/75 p-4 shadow-[0_16px_36px_rgba(7,31,63,0.07)]">
          <label className="flex flex-col gap-2">
            <span className="text-[0.65rem] uppercase tracking-[0.24em] text-navy/45">Status</span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as BackInStockNotificationStatus | "")
              }
              className="h-12 rounded-2xl border border-border bg-white/90 px-4 text-sm text-navy outline-none transition focus:border-gold/70"
            >
              <option value="">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabel[status]}
                </option>
              ))}
            </select>
          </label>
        </section>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-5">
        {STATUSES.map((status) => (
          <div key={status} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
            <p className="text-xs uppercase tracking-[0.2em] text-navy/50">{statusLabel[status]}</p>
            <p className="mt-3 font-display text-4xl text-navy">{counts[status]}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
        <div className="lg:hidden">
          {loading ? (
            <div className="px-5 py-10 text-center text-navy/50">Loading notifications...</div>
          ) : error ? (
            <div className="px-5 py-10 text-center text-red-600">{error}</div>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={<BellRing className="h-6 w-6" />}
              title="No notifications found"
              description="Try another status or search term."
            />
          ) : (
            <div className="space-y-4 p-4">
              {notifications.map((notification) => (
                <article
                  key={notification.id}
                  className="rounded-2xl border border-border/70 bg-beige/30 p-4 shadow-soft"
                >
                  <ProductCell notification={notification} />
                  <div className="mt-4 grid gap-2 text-sm text-navy/70">
                    <p>{notification.email}</p>
                    <p>{notification.phone}</p>
                    <p>Subscribed: {formatDate(notification.createdAt)}</p>
                    <p>Sent: {formatDate(notification.sentAt)}</p>
                    <span
                      className={`w-fit rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.16em] ${statusStyles[notification.status]}`}
                    >
                      {statusLabel[notification.status]}
                    </span>
                    <NotificationActions
                      notification={notification}
                      busy={actionId === notification.id}
                      onRetry={retryNotification}
                      onCancel={cancelNotification}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="admin-table-shell hidden lg:block">
          <table className="w-full text-sm">
            <thead className="bg-beige/50 text-xs uppercase tracking-[0.2em] text-navy/70">
              <tr>
                <th className="px-6 py-4 text-left">Product</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Phone</th>
                <th className="px-6 py-4 text-left">Subscribed Date</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Sent Date</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-navy/50">
                    Loading notifications...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && notifications.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-navy/50">
                    No notifications found.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                notifications.map((notification) => (
                  <tr key={notification.id} className="align-top transition hover:bg-beige/30">
                    <td className="px-6 py-4">
                      <ProductCell notification={notification} />
                    </td>
                    <td className="px-6 py-4 text-navy/70">{notification.email}</td>
                    <td className="px-6 py-4 text-navy/70">{notification.phone}</td>
                    <td className="px-6 py-4 text-navy/60">{formatDate(notification.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.16em] ${statusStyles[notification.status]}`}
                      >
                        {statusLabel[notification.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-navy/60">{formatDate(notification.sentAt)}</td>
                    <td className="px-6 py-4">
                      <NotificationActions
                        notification={notification}
                        busy={actionId === notification.id}
                        onRetry={retryNotification}
                        onCancel={cancelNotification}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-[var(--radius-panel)] border border-white/70 bg-white/72 px-4 py-4 shadow-[0_12px_24px_rgba(7,31,63,0.06)] sm:flex-row sm:items-center sm:justify-between">
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
    </AdminShell>
  );
}
