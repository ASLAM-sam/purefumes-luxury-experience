import { createFileRoute } from "@tanstack/react-router";
import {
  Crown,
  IndianRupee,
  Package,
  Percent,
  RefreshCw,
  ShoppingBag,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminShell } from "@/components/admin/AdminShell";
import { AnalyticsChart } from "@/components/admin/AnalyticsChart";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { StatCard } from "@/components/admin/StatCard";
import { Button } from "@/components/common/Button";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useNotification } from "@/context/NotificationContext";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { formatCompactINR, formatINR } from "@/lib/money";
import { adminApi } from "@/services/api";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalyticsPage,
});

const formatCurrency = formatINR;

const formatPercent = (value: number) =>
  `${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 1 })}%`;

const formatNumber = (value: number) => Number(value || 0).toLocaleString("en-IN");

function AdminAnalyticsPage() {
  const { addNotification } = useNotification();
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
    to,
  } = useAdminAnalytics({ initialRange: "30d" });
  const [confirmClear, setConfirmClear] = useState<"analytics" | "activity" | null>(null);
  const [clearing, setClearing] = useState(false);

  const revenueTrend = analytics?.trends?.revenue || [];
  const userGrowth = analytics?.trends?.users || [];
  const summary = analytics?.summary;

  const handleClear = async () => {
    if (!confirmClear) return;

    setClearing(true);
    try {
      const result =
        confirmClear === "analytics"
          ? await adminApi.clearAnalytics()
          : await adminApi.clearActivity();

      await refresh();
      addNotification(
        confirmClear === "analytics"
          ? "Test analytics data cleared successfully"
          : `Activity cleared. ${result.deletedActivity || 0} entries removed.`,
      );
      setConfirmClear(null);
    } catch (clearError) {
      addNotification(
        clearError instanceof Error ? clearError.message : "Data could not be cleared.",
        "error",
      );
    } finally {
      setClearing(false);
    }
  };

  return (
    <AdminShell>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
        <div className="rounded-[var(--radius-panel)] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(243,237,226,0.9))] p-4 shadow-[0_18px_48px_rgba(7,31,63,0.08)] sm:p-5 md:p-6">
          <p className="fluid-eyebrow uppercase text-navy/45">Analytics</p>
          <h1 className="mt-2 font-display text-3xl text-navy md:text-5xl">
            Compact commerce intelligence
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-navy/62 md:text-base">
            Live revenue, customer quality, acquisition, and order health in a denser layout built
            for daily admin use across desktop, tablet, and mobile.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-border/70 bg-white/78 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-navy/42">Revenue in range</p>
              <p className="mt-2 font-display text-2xl text-navy md:text-3xl">
                {formatCurrency(summary?.revenueInRange || 0)}
              </p>
              <p className="mt-1 text-xs text-navy/55">
                Range total {formatCurrency(summary?.revenueInRange || 0)}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border/70 bg-white/78 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-navy/42">Order quality</p>
              <p className="mt-2 font-display text-2xl text-navy md:text-3xl">
                {formatCurrency(summary?.averageOrderValue || 0)}
              </p>
              <p className="mt-1 text-xs text-navy/55">
                {formatNumber(summary?.ordersInRange || 0)} orders in range
              </p>
            </div>
          </div>
        </div>

        <DateRangeFilter
          range={range}
          from={from}
          to={to}
          maxDate={maxDate}
          error={dateRangeError}
          disabled={refreshing}
          onRangeChange={setRange}
          onFromChange={setFrom}
          onToChange={setTo}
          action={
            <div className="flex flex-wrap gap-2">
              <Button
                variant="soft"
                size="sm"
                className="gap-2"
                disabled={refreshing || Boolean(dateRangeError)}
                onClick={() => void refresh()}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-red-300 text-red-700 hover:bg-red-600 hover:text-white hover:shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                disabled={clearing}
                onClick={() => setConfirmClear("analytics")}
              >
                <Trash2 className="h-4 w-4" />
                Clear Analytics Data
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatCurrency(summary?.revenueInRange || 0)}
          icon={<IndianRupee className="h-5 w-5" />}
          tone="gold"
          loading={loading && !analytics}
          meta={`Selected range ${formatCurrency(summary?.revenueInRange || 0)}`}
        />
        <StatCard
          label="Orders"
          value={formatNumber(summary?.ordersInRange || 0)}
          icon={<Package className="h-5 w-5" />}
          tone="navy"
          loading={loading && !analytics}
          meta={`${formatCurrency(summary?.averageOrderValue || 0)} AOV`}
        />
        <StatCard
          label="Conversion"
          value={formatPercent(summary?.conversionRate || 0)}
          icon={<Percent className="h-5 w-5" />}
          tone="emerald"
          loading={loading && !analytics}
          meta={`${formatNumber(summary?.activeUsers || 0)} active users in range`}
        />
        <StatCard
          label="Repeat Buyers"
          value={formatNumber(summary?.repeatCustomers || 0)}
          icon={<Crown className="h-5 w-5" />}
          tone="navy"
          loading={loading && !analytics}
          meta={`${formatNumber(summary?.premiumCustomers || 0)} premium`}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total customers",
            value: formatNumber(summary?.totalUsers || 0),
            tone: "bg-[#faf5ec]",
          },
          {
            label: "Pending orders",
            value: formatNumber(summary?.pendingOrders || 0),
            tone: "bg-[#f5f7fb]",
          },
          {
            label: "Abandoned carts",
            value: formatNumber(summary?.abandonedCarts || 0),
            tone: "bg-[#faf2f2]",
          },
          {
            label: "Low stock alerts",
            value: formatNumber(summary?.lowStockAlerts || 0),
            tone: "bg-[#f7f4ec]",
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-[1.25rem] border border-border/70 p-4 shadow-soft ${item.tone}`}
          >
            <p className="text-xs uppercase tracking-[0.18em] text-navy/42">{item.label}</p>
            <p className="mt-2 font-display text-2xl text-navy">{item.value}</p>
          </div>
        ))}
      </div>

      {error && !analytics ? (
        <div className="mt-6">
          <ErrorState description={error} onRetry={() => void refresh()} />
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <AnalyticsChart
          title="Revenue trajectory"
          description="Revenue buckets for the selected period with order volume layered in for context."
        >
          {loading && !analytics ? (
            <LoadingSkeleton className="h-[280px] w-full" />
          ) : revenueTrend.length ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="compactRevenueGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#c9a14a" stopOpacity={0.34} />
                      <stop offset="95%" stopColor="#c9a14a" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(7,31,63,0.08)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fill: "#5f6573", fontSize: 12 }} />
                  <YAxis
                    tick={{ fill: "#5f6573", fontSize: 12 }}
                    tickFormatter={(value) => formatCompactINR(value)}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === "revenue" ? formatCurrency(value) : formatNumber(value),
                      name === "revenue" ? "Revenue" : "Orders",
                    ]}
                    contentStyle={{ borderRadius: "18px", borderColor: "rgba(7,31,63,0.08)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#c9a14a"
                    strokeWidth={3}
                    fill="url(#compactRevenueGradient)"
                  />
                  <Line type="monotone" dataKey="orders" stroke="#1e1b18" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={<IndianRupee className="h-6 w-6" />}
              title="No revenue trend available"
              description="Revenue will chart here once paid orders fall inside the selected range."
            />
          )}
        </AnalyticsChart>

        <AnalyticsChart
          title="User growth"
          description="Customer acquisition across the selected period."
        >
          {loading && !analytics ? (
            <LoadingSkeleton className="h-[280px] w-full" />
          ) : userGrowth.length ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowth}>
                  <CartesianGrid stroke="rgba(7,31,63,0.08)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fill: "#5f6573", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#5f6573", fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(value: number) => formatNumber(value)}
                    contentStyle={{ borderRadius: "18px", borderColor: "rgba(7,31,63,0.08)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2f855a"
                    strokeWidth={3}
                    dot={{ fill: "#2f855a", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="No user growth data yet"
              description="Signup growth will populate here once customer acquisition starts."
            />
          )}
        </AnalyticsChart>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <AnalyticsChart
          title="Top products"
          description="The strongest revenue contributors right now."
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
                  className="rounded-[1.2rem] bg-[#f8f4ec] px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-navy">{product.productName}</p>
                      <p className="mt-1 text-sm text-navy/55">{product.brand || "Brand unavailable"}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-navy">{formatCurrency(product.revenue)}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-gold">
                        {formatNumber(product.quantity)} sold
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<ShoppingBag className="h-6 w-6" />}
              title="No best sellers yet"
              description="Product rankings will appear after completed orders are available."
            />
          )}
        </AnalyticsChart>

        <AnalyticsChart
          title="Top customers"
          description="High-value buyers worth retention focus."
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
                  className="rounded-[1.2rem] bg-[#f4f7fb] px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-navy">{customer.name}</p>
                      <p className="mt-1 truncate text-sm text-navy/55">{customer.email || "No email available"}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-navy">{formatCurrency(customer.totalSpent)}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-gold">
                        {formatNumber(customer.totalOrders)} orders
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Crown className="h-6 w-6" />}
              title="Top customers will appear here"
              description="Customer rankings need completed orders before they can be calculated."
            />
          )}
        </AnalyticsChart>

        <AnalyticsChart
          title="Recent activity"
          description="A compact pulse of the latest commerce events."
          action={
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              disabled={clearing}
              onClick={() => setConfirmClear("activity")}
            >
              <Trash2 className="h-4 w-4" />
              Clear Activity
            </Button>
          }
        >
          {loading && !analytics ? (
            <div className="space-y-3">
              <LoadingSkeleton className="h-20 w-full" />
              <LoadingSkeleton className="h-20 w-full" />
              <LoadingSkeleton className="h-20 w-full" />
            </div>
          ) : analytics?.recentActivity?.length ? (
            <div className="space-y-3">
              {analytics.recentActivity.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="rounded-[1.2rem] bg-[#faf6ef] px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-navy">{item.title}</p>
                      <p className="mt-1 text-sm text-navy/58">{item.description}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-navy/38">
                        {item.at ? new Date(item.at).toLocaleString("en-IN") : "Time unavailable"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-navy">{formatCurrency(item.amount)}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-gold">{item.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<ShoppingBag className="h-6 w-6" />}
              title="No recent activity yet"
              description="Tracked commerce events will appear here once activity starts."
            />
          )}
        </AnalyticsChart>
      </div>

      <ConfirmModal
        isOpen={confirmClear !== null}
        title={confirmClear === "activity" ? "Clear Activity" : "Clear Analytics Data"}
        message={
          confirmClear === "analytics"
            ? "Are you sure you want to delete all analytics and test order data? This action cannot be undone."
            : "Are you sure? This action cannot be undone."
        }
        confirmLabel={confirmClear === "activity" ? "Clear Activity" : "Yes, Clear Data"}
        loading={clearing}
        onClose={() => setConfirmClear(null)}
        onConfirm={handleClear}
      />
    </AdminShell>
  );
}
