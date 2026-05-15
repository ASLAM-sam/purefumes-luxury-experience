import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Crown,
  IndianRupee,
  RefreshCw,
  ShoppingCart,
  TriangleAlert,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminShell } from "@/components/admin/AdminShell";
import { AnalyticsChart } from "@/components/admin/AnalyticsChart";
import { StatCard } from "@/components/admin/StatCard";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const formatCurrency = (value: number) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const formatNumber = (value: number) => Number(value || 0).toLocaleString("en-IN");

function AdminDashboard() {
  const { analytics, error, loading, refreshing, refresh } = useAdminAnalytics({
    initialRange: "30d",
  });
  const summary = analytics?.summary;
  const revenueTrend = analytics?.trends?.revenue || [];

  return (
    <AdminShell>
      <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(243,237,226,0.88))] p-6 shadow-[0_20px_60px_rgba(7,31,63,0.08)] md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,161,74,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(7,31,63,0.12),transparent_34%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-navy/46">
              Executive view
            </p>
            <h1 className="mt-3 font-display text-4xl text-navy md:text-5xl">
              Production-grade control center for your perfume storefront
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-navy/62 md:text-base">
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

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <AnalyticsChart
          title="Revenue pulse"
          description="A clean read on how revenue and order volume are moving across the last 30 days."
        >
          {loading && !analytics ? (
            <LoadingSkeleton className="h-[320px] w-full" />
          ) : revenueTrend.length ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="overviewRevenueGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#c9a14a" stopOpacity={0.34} />
                      <stop offset="95%" stopColor="#c9a14a" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(7,31,63,0.08)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fill: "#5f6573", fontSize: 12 }} />
                  <YAxis
                    tick={{ fill: "#5f6573", fontSize: 12 }}
                    tickFormatter={(value) => `Rs.${Number(value || 0) / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === "revenue" ? formatCurrency(value) : formatNumber(value),
                      name === "revenue" ? "Revenue" : "Orders",
                    ]}
                    contentStyle={{
                      borderRadius: "18px",
                      borderColor: "rgba(7,31,63,0.08)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#c9a14a"
                    strokeWidth={3}
                    fill="url(#overviewRevenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="Revenue data is still warming up"
              description="Once orders are flowing, this chart will show live growth instead of placeholder analytics."
            />
          )}
        </AnalyticsChart>

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

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
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
                  <div>
                    <p className="font-semibold text-navy">{product.productName || "Product"}</p>
                    <p className="mt-1 text-sm text-navy/56">{product.brand || "Brand unavailable"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-navy">{formatCurrency(product.revenue)}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gold">
                      {formatNumber(product.quantity)} sold
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
                  <div>
                    <p className="font-semibold text-navy">{customer.name || "Unnamed customer"}</p>
                    <p className="mt-1 text-sm text-navy/56">{customer.email || "No email available"}</p>
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
    </AdminShell>
  );
}
