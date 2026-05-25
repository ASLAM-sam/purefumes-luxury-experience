import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Crown,
  IndianRupee,
  RefreshCw,
  ShoppingCart,
  Trash2,
  TriangleAlert,
  Users,
} from "lucide-react";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AnalyticsChart } from "@/components/admin/AnalyticsChart";
import { StatCard } from "@/components/admin/StatCard";
import { Button } from "@/components/common/Button";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useNotification } from "@/context/NotificationContext";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { formatINR } from "@/lib/money";
import { adminApi } from "@/services/api";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const formatCurrency = formatINR;

const formatNumber = (value: number) => Number(value || 0).toLocaleString("en-IN");

function AdminDashboard() {
  const { addNotification } = useNotification();
  const { analytics, error, loading, refreshing, refresh } = useAdminAnalytics({
    initialRange: "30d",
  });
  const [clearAnalyticsOpen, setClearAnalyticsOpen] = useState(false);
  const [clearingAnalytics, setClearingAnalytics] = useState(false);
  const summary = analytics?.summary;

  const handleClearAnalytics = async () => {
    setClearingAnalytics(true);
    try {
      const result = await adminApi.clearAnalytics();
      await refresh();
      addNotification(
        `Analytics cleared. ${result.deletedOrders || 0} orders and ${result.deletedActivity || 0} activity entries removed.`,
      );
      setClearAnalyticsOpen(false);
    } catch (clearError) {
      addNotification(
        clearError instanceof Error ? clearError.message : "Analytics could not be cleared.",
        "error",
      );
    } finally {
      setClearingAnalytics(false);
    }
  };

  return (
    <AdminShell>
      <div className="relative overflow-hidden rounded-[var(--radius-panel)] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(243,237,226,0.88))] p-5 shadow-[0_20px_60px_rgba(7,31,63,0.08)] sm:p-6 lg:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,161,74,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(7,31,63,0.12),transparent_34%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="fluid-eyebrow uppercase text-navy/46">
              Executive view
            </p>
            <h1 className="mt-3 font-display text-[clamp(2rem,2.4vw+1.2rem,3.5rem)] text-navy">
              Production-grade control center for your perfume storefront
            </h1>
            <p className="fluid-body mt-4 max-w-2xl text-navy/62">
              Revenue, repeat customers, pending orders, and stock pressure now roll into one
              premium command surface for daily store operations.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="soft"
              className="gap-2"
              disabled={refreshing}
              onClick={() => void refresh()}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="destructive"
              className="gap-2"
              disabled={clearingAnalytics}
              onClick={() => setClearAnalyticsOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Clear Analytics
            </Button>
            <Link
              to="/admin/analytics"
              className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-3 text-xs uppercase tracking-[0.24em] text-beige transition hover:opacity-90"
            >
              Open analytics
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="adaptive-admin-grid mt-6">
        <StatCard
          label="Revenue"
          value={formatCurrency(summary?.revenueInRange || 0)}
          icon={<IndianRupee className="h-5 w-5" />}
          tone="gold"
          loading={loading && !analytics}
          meta={`Month ${formatCurrency(summary?.monthlyRevenue || 0)}`}
        />
        <StatCard
          label="Orders"
          value={formatNumber(summary?.ordersInRange || 0)}
          icon={<ShoppingCart className="h-5 w-5" />}
          tone="navy"
          loading={loading && !analytics}
          meta={`${formatCurrency(summary?.averageOrderValue || 0)} average order value`}
        />
        <StatCard
          label="Customers"
          value={formatNumber(summary?.totalUsers || 0)}
          icon={<Users className="h-5 w-5" />}
          tone="emerald"
          loading={loading && !analytics}
          meta={`${formatNumber(summary?.repeatCustomers || 0)} repeat customers`}
        />
        <StatCard
          label="Inventory alerts"
          value={formatNumber(summary?.lowStockAlerts || 0)}
          icon={<TriangleAlert className="h-5 w-5" />}
          tone="rose"
          loading={loading && !analytics}
          meta={`${formatNumber(summary?.pendingOrders || 0)} pending orders`}
        />
      </div>

      {error && !analytics ? (
        <div className="mt-6">
          <ErrorState description={error} onRetry={() => void refresh()} />
        </div>
      ) : null}

      <div className="mt-6">
        <AnalyticsChart
          title="Operational watchlist"
          description="The quickest issues to act on today."
        >
          {loading && !analytics ? (
            <div className="space-y-3">
              <LoadingSkeleton className="h-20 w-full" />
              <LoadingSkeleton className="h-20 w-full" />
              <LoadingSkeleton className="h-20 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-[1.35rem] bg-[#faf6ee] p-4">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-navy/42">
                  Pending orders
                </p>
                <p className="mt-2 font-display text-3xl text-navy">
                  {formatNumber(summary?.pendingOrders || 0)}
                </p>
              </div>
              <div className="rounded-[1.35rem] bg-[#f4f8fb] p-4">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-navy/42">
                  Repeat customers
                </p>
                <p className="mt-2 font-display text-3xl text-navy">
                  {formatNumber(summary?.repeatCustomers || 0)}
                </p>
              </div>
              <div className="rounded-[1.35rem] bg-[#f9f1f1] p-4">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-navy/42">
                  Low stock alerts
                </p>
                <p className="mt-2 font-display text-3xl text-navy">
                  {formatNumber(summary?.lowStockAlerts || 0)}
                </p>
              </div>
            </div>
          )}
        </AnalyticsChart>
      </div>

      <div className="mt-6 grid gap-6 2xl:grid-cols-2">
        <AnalyticsChart
          title="Top products"
          description="The products currently driving the strongest commercial lift."
        >
          {loading && !analytics ? (
            <div className="space-y-3">
              <LoadingSkeleton className="h-20 w-full" />
              <LoadingSkeleton className="h-20 w-full" />
              <LoadingSkeleton className="h-20 w-full" />
            </div>
          ) : analytics?.topProducts?.length ? (
            <div className="space-y-3">
              {analytics.topProducts.slice(0, 5).map((product, index) => (
                <div
                  key={`${product.productId}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-[1.35rem] bg-[#f8f4ec] px-4 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.productName || "Product"}
                        className="h-14 w-14 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-xs uppercase tracking-[0.18em] text-navy/45">
                        No image
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-navy">{product.productName || "Product"}</p>
                      <p className="mt-1 truncate text-sm text-navy/56">{product.brand || "Brand unavailable"}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-navy/40">
                        {formatNumber(product.totalOrders)} orders • {formatNumber(product.totalQuantitySold)} sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-navy">{formatCurrency(product.totalRevenueGenerated)}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gold">
                      Top purchased
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No best sellers yet"
              description="Product rankings will appear here once completed orders are available."
            />
          )}
        </AnalyticsChart>

        <AnalyticsChart
          title="Top customers"
          description="High-value buyers to retain, reward, and learn from."
        >
          {loading && !analytics ? (
            <div className="space-y-3">
              <LoadingSkeleton className="h-20 w-full" />
              <LoadingSkeleton className="h-20 w-full" />
              <LoadingSkeleton className="h-20 w-full" />
            </div>
          ) : analytics?.topCustomers?.length ? (
            <div className="space-y-3">
              {analytics.topCustomers.slice(0, 5).map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between gap-4 rounded-[1.35rem] bg-[#f4f7fb] px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-navy">{customer.name || "Unnamed customer"}</p>
                    <p className="mt-1 truncate text-sm text-navy/56">{customer.email || "No email available"}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-navy/40">
                      {customer.mobile || "No mobile available"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-navy">{formatCurrency(customer.totalSpent)}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-gold">
                      <Crown className="h-3.5 w-3.5" />
                      {formatNumber(customer.totalOrders)} orders
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Top customers will appear here"
              description="Customer rankings need completed orders before they can be calculated."
            />
          )}
        </AnalyticsChart>
      </div>

      <ConfirmModal
        isOpen={clearAnalyticsOpen}
        title="Clear Analytics"
        message="Are you sure? This action cannot be undone."
        confirmLabel="Clear Analytics"
        loading={clearingAnalytics}
        onClose={() => setClearAnalyticsOpen(false)}
        onConfirm={handleClearAnalytics}
      />
    </AdminShell>
  );
}
