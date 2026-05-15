import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, PackageOpen, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { useNotification } from "@/context/NotificationContext";
import { useDateRangeFilter } from "@/hooks/useDateRangeFilter";
import { ordersApi, type Order } from "@/services/api";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const STATUSES: Order["status"][] = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const PAGE_SIZE = 12;

const statusColor: Record<Order["status"], string> = {
  Pending: "bg-amber-100 text-amber-800",
  Processing: "bg-sky-100 text-sky-800",
  Shipped: "bg-indigo-100 text-indigo-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-rose-100 text-rose-800",
};

function AdminOrders() {
  const { addNotification } = useNotification();
  const dateRange = useDateRangeFilter({
    storageKey: "purefumes_admin_orders_date_range",
    initialRange: "30d",
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<Order["status"] | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPage(1);
  }, [dateRange.from, dateRange.range, dateRange.to, statusFilter]);

  const load = useCallback(
    async (silent = false) => {
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
        const response = await ordersApi.listPaginated({
          page,
          limit: PAGE_SIZE,
          status: statusFilter,
          ...dateRange.queryParams,
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
    },
    [addNotification, dateRange.isValid, dateRange.queryParams, dateRange.validationError, page, statusFilter],
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const refresh = () => load(true);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        load(true);
      }
    };

    window.addEventListener("focus", refresh);
    window.addEventListener("purefumes:orders-changed", refresh);
    document.addEventListener("visibilitychange", onVisibilityChange);

    const intervalId = window.setInterval(refresh, 30000);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("purefumes:orders-changed", refresh);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [load]);

  const updateStatus = useCallback(
    async (id: string, status: Order["status"]) => {
      try {
        const updated = await ordersApi.updateStatus(id, status);
        setOrders((current) =>
          current.map((order) => (order._id === id || order.id === id ? updated : order)),
        );
        addNotification("Order status updated.");
        load(true);
      } catch (ex) {
        addNotification(
          ex instanceof Error ? ex.message : "Order status could not be updated.",
          "error",
        );
      }
    },
    [addNotification, load],
  );

  return (
    <AdminShell>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.65rem] tracking-[0.4em] uppercase text-navy/50">Fulfilment</p>
          <h1 className="font-display text-4xl text-navy mt-1">Orders</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-navy/60">
            Review live orders by status and date window without loading the full order history.
          </p>
        </div>
        <span className="rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-[0.68rem] uppercase tracking-[0.24em] text-navy/70">
          {totalOrders.toLocaleString("en-IN")} orders
        </span>
      </header>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <DateRangeFilter
          range={dateRange.range}
          from={dateRange.from}
          to={dateRange.to}
          maxDate={dateRange.maxDate}
          error={dateRange.validationError}
          disabled={refreshing}
          onRangeChange={dateRange.setRange}
          onFromChange={dateRange.setFrom}
          onToChange={dateRange.setTo}
          action={
            <Button
              variant="soft"
              size="sm"
              className="gap-2"
              disabled={refreshing || Boolean(dateRange.validationError)}
              onClick={() => load(true)}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          }
        />

        <section className="rounded-[1.5rem] border border-white/70 bg-white/75 p-4 shadow-[0_16px_36px_rgba(7,31,63,0.07)]">
          <label className="flex flex-col gap-2">
            <span className="text-[0.65rem] uppercase tracking-[0.24em] text-navy/45">
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as Order["status"] | "")}
              className="h-12 rounded-2xl border border-border bg-white/90 px-4 text-sm text-navy outline-none transition focus:border-gold/70"
            >
              <option value="">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </section>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
        <div className="lg:hidden">
          {loading ? (
            <div className="px-5 py-10 text-center text-navy/50">Loading orders...</div>
          ) : error ? (
            <div className="px-5 py-10 text-center text-red-600">{error}</div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon={<PackageOpen className="h-6 w-6" />}
              title="No orders in this range"
              description="Try a wider date range or a different order status."
            />
          ) : (
            <div className="space-y-4 p-4">
              {orders.map((order) => {
                const productName = order.productName || "Order item";
                const price = order.totalAmount ?? order.price ?? 0;

                return (
                  <article
                    key={order._id || order.id}
                    className="rounded-2xl border border-border/70 bg-beige/30 p-4 shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-navy">{order.customerName || "Customer"}</p>
                        <p className="mt-1 text-xs text-navy/60">{order.phone || "Phone unavailable"}</p>
                      </div>
                      <select
                        value={order.status}
                        onChange={(event) =>
                          updateStatus(
                            order._id || order.id || "",
                            event.target.value as Order["status"],
                          )
                        }
                        className={`shrink-0 rounded-full border-0 px-3 py-2 text-xs uppercase tracking-[0.16em] outline-none ${statusColor[order.status] || "bg-beige text-navy"}`}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-navy/70">
                      <p className="font-medium text-navy">{productName}</p>
                      <p>{order.brand || "Brand unavailable"} - {order.size || "Size unavailable"}</p>
                      <p className="font-semibold text-gold">Rs. {Number(price).toLocaleString("en-IN")}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-sm">
            <thead className="bg-beige/50 text-navy/70 text-xs uppercase tracking-[0.2em]">
              <tr>
                <th className="text-left px-6 py-4">Customer</th>
                <th className="text-left px-6 py-4">Product</th>
                <th className="text-left px-6 py-4">Size</th>
                <th className="text-right px-6 py-4">Price</th>
                <th className="text-left px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-navy/50">
                    Loading orders...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-navy/50">
                    No orders found in this range.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                orders.map((order) => {
                  const productName = order.productName || "Order item";
                  const brand = order.brand || "";
                  const size = order.size || "-";
                  const price = order.totalAmount ?? order.price ?? 0;

                  return (
                    <tr
                      key={order._id || order.id}
                      className="hover:bg-beige/30 transition-colors align-top"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-navy">{order.customerName}</p>
                        <p className="text-xs text-navy/60">{order.phone}</p>
                        <p className="text-xs text-navy/50 mt-1 max-w-xs truncate">
                          {order.address}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-navy">{productName}</p>
                        <p className="text-xs text-navy/60">{brand}</p>
                      </td>
                      <td className="px-6 py-4 text-navy/70">{size}</td>
                      <td className="px-6 py-4 text-right text-gold font-medium">
                        Rs. {Number(price).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(event) =>
                            updateStatus(
                              order._id || order.id || "",
                              event.target.value as Order["status"],
                            )
                          }
                          className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wider border-0 outline-none cursor-pointer ${statusColor[order.status] || "bg-beige text-navy"}`}
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
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
    </AdminShell>
  );
}
