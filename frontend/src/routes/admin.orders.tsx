import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useNotification } from "@/context/NotificationContext";
import { ordersApi, type Order } from "@/services/api";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const STATUSES: Order["status"][] = ["Pending", "Shipped", "Delivered"];

const statusColor: Record<Order["status"], string> = {
  Pending: "bg-amber-100 text-amber-800",
  Shipped: "bg-indigo-100 text-indigo-800",
  Delivered: "bg-green-100 text-green-800",
};

function AdminOrders() {
  const { addNotification } = useNotification();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    async (silent = false) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      try {
        const nextOrders = await ordersApi.list();
        setOrders(nextOrders);
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
    [addNotification],
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
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[0.65rem] tracking-[0.4em] uppercase text-navy/50">Fulfilment</p>
          <h1 className="font-display text-4xl text-navy mt-1">Orders</h1>
        </div>
        <button
          type="button"
          onClick={() => load(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-navy px-4 py-2.5 text-xs uppercase tracking-[0.22em] text-navy transition hover:bg-navy hover:text-beige disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      <div className="mt-8 bg-card rounded-2xl shadow-soft border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
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
                    Loading...
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
                    No orders yet.
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
                          className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wider border-0 outline-none cursor-pointer ${statusColor[order.status]}`}
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
    </AdminShell>
  );
}
