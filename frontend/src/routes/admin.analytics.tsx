import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  Crown,
  IndianRupee,
  Package,
  Percent,
  RefreshCw,
  ShoppingBag,
  TriangleAlert,
  Users,
  Wallet,
} from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
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
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalyticsPage,
});

const PIE_COLORS = ["#071f3f", "#c9a14a", "#2f855a", "#e67e22", "#a34b7f"];

const formatCurrency = (value: number) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const formatPercent = (value: number) =>
  `${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 1 })}%`;

const formatNumber = (value: number) => Number(value || 0).toLocaleString("en-IN");

function AdminAnalyticsPage() {
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

  const revenueTrend = analytics?.trends?.revenue || [];
  const orderTrend = analytics?.trends?.orders || [];
  const userGrowth = analytics?.trends?.users || [];
  const summary = analytics?.summary;

  const salesMix = useMemo(
    () =>
      (analytics?.salesByStatus || [])
        .filter((item) => item.orders > 0 || item.revenue > 0)
        .map((item) => ({
          ...item,
          name: item.status,
          value: item.revenue || item.orders,
        })),
    [analytics?.salesByStatus],
  );

  return (
    <AdminShell>
      <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(245,239,228,0.86))] p-6 shadow-[0_20px_60px_rgba(7,31,63,0.08)] backdrop-blur md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,161,74,0.2),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(7,31,63,0.14),transparent_34%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-navy/45">
              Commerce Intelligence
            </p>
            <h1 className="mt-3 font-display text-4xl text-navy md:text-5xl">
              Premium analytics for revenue, retention, and stock health
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-navy/62 md:text-base">
              This dashboard is now wired to live ecommerce data, with real aggregation-backed
              KPIs for customers, orders, and product performance across the selected timeframe.
            </p>
          </div>

          <DateRangeFilter
            className="xl:max-w-[42rem]"
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
            }
          />
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Revenue in range"
          value={formatCurrency(summary?.revenueInRange || 0)}
          icon={<IndianRupee className="h-5 w-5" />}
          tone="gold"
          loading={loading && !analytics}
          meta={`Today ${formatCurrency(summary?.revenueToday || 0)}`}
        />
        <StatCard
          label="Orders in range"
          value={formatNumber(summary?.ordersInRange || 0)}
          icon={<Package className="h-5 w-5" />}
          tone="navy"
          loading={loading && !analytics}
          meta={`${formatCurrency(summary?.averageOrderValue || 0)} average order value`}
        />
        <StatCard
          label="Conversion rate"
          value={formatPercent(summary?.conversionRate || 0)}
          icon={<Percent className="h-5 w-5" />}
          tone="emerald"
          loading={loading && !analytics}
          meta={`${formatNumber(summary?.activeUsers || 0)} active users`}
        />
        <StatCard
          label="Repeat customers"
          value={formatNumber(summary?.repeatCustomers || 0)}
          icon={<Crown className="h-5 w-5" />}
          tone="navy"
          loading={loading && !analytics}
          meta={`${formatNumber(summary?.premiumCustomers || 0)} premium customers`}
        />
        <StatCard
          label="Abandoned carts"
          value={formatNumber(summary?.abandonedCarts || 0)}
          icon={<ShoppingBag className="h-5 w-5" />}
          tone="rose"
          loading={loading && !analytics}
          meta={`${formatNumber(summary?.blockedUsers || 0)} blocked accounts`}
        />
        <StatCard
          label="Low stock alerts"
          value={formatNumber(summary?.lowStockAlerts || 0)}
          icon={<TriangleAlert className="h-5 w-5" />}
          tone="gold"
          loading={loading && !analytics}
          meta={`${formatNumber(summary?.pendingOrders || 0)} pending orders`}
        />
      </div>

      {error && !analytics ? (
        <div className="mt-6">
          <ErrorState description={error} onRetry={() => void refresh()} />
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
        <AnalyticsChart
          title="Revenue trajectory"
          description="Track revenue momentum and order volume over time with aggregation-backed daily or monthly buckets."
          action={
            <div className="rounded-full bg-navy/6 px-4 py-2 text-xs uppercase tracking-[0.24em] text-navy/55">
              Live trend
            </div>
          }
        >
          {loading && !analytics ? (
            <LoadingSkeleton className="h-[320px] w-full" />
          ) : revenueTrend.length ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
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
                    fill="url(#revenueGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#071f3f"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={<IndianRupee className="h-6 w-6" />}
              title="No revenue trend available"
              description="Revenue will start charting here once paid orders enter the selected window."
            />
          )}
        </AnalyticsChart>

        <AnalyticsChart
          title="Sales mix"
          description="See where revenue is concentrated across order statuses for fulfillment monitoring."
        >
          {loading && !analytics ? (
            <LoadingSkeleton className="h-[320px] w-full" />
          ) : salesMix.length ? (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_200px] xl:items-center">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        borderRadius: "18px",
                        borderColor: "rgba(7,31,63,0.08)",
                      }}
                    />
                    <Pie
                      data={salesMix}
                      cx="50%"
                      cy="50%"
                      outerRadius={96}
                      dataKey="value"
                      nameKey="name"
                    >
                      {salesMix.map((item, index) => (
                        <Cell
                          key={`${item.name}-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {salesMix.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-[#faf6ee] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <div>
                        <p className="font-medium text-navy">{item.name}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-navy/40">
                          {formatNumber(item.orders)} orders
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-navy">{formatCurrency(item.revenue)}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Wallet className="h-6 w-6" />}
              title="No status mix yet"
              description="Order status distribution will appear here as the store processes real orders."
            />
          )}
        </AnalyticsChart>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <AnalyticsChart
          title="Orders trend"
          description="Volume pattern for order creation in the selected period."
        >
          {loading && !analytics ? (
            <LoadingSkeleton className="h-[280px] w-full" />
          ) : orderTrend.length ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderTrend}>
                  <CartesianGrid stroke="rgba(7,31,63,0.08)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fill: "#5f6573", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#5f6573", fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(value: number) => formatNumber(value)}
                    contentStyle={{
                      borderRadius: "18px",
                      borderColor: "rgba(7,31,63,0.08)",
                    }}
                  />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#071f3f" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={<Package className="h-6 w-6" />}
              title="No order trend available"
              description="Orders will appear here once customers begin checking out in the selected range."
            />
          )}
        </AnalyticsChart>

        <AnalyticsChart
          title="User growth"
          description="New customer acquisition trend powered by user creation analytics."
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
                    contentStyle={{
                      borderRadius: "18px",
                      borderColor: "rgba(7,31,63,0.08)",
                    }}
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

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <AnalyticsChart
          title="Category performance"
          description="Revenue contribution and units sold by fragrance category."
        >
          {loading && !analytics ? (
            <LoadingSkeleton className="h-[320px] w-full" />
          ) : analytics?.categoryPerformance?.length ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.categoryPerformance}
                  layout="vertical"
                  margin={{ left: 18, right: 14, top: 10, bottom: 10 }}
                >
                  <CartesianGrid stroke="rgba(7,31,63,0.08)" strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tick={{ fill: "#5f6573", fontSize: 12 }}
                    tickFormatter={(value) => `Rs.${Number(value || 0) / 1000}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fill: "#5f6573", fontSize: 12 }}
                    width={110}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === "revenue" ? formatCurrency(value) : formatNumber(value),
                      name === "revenue" ? "Revenue" : "Units sold",
                    ]}
                    contentStyle={{
                      borderRadius: "18px",
                      borderColor: "rgba(7,31,63,0.08)",
                    }}
                  />
                  <Bar dataKey="revenue" radius={[0, 12, 12, 0]} fill="#c9a14a" />
                  <Bar dataKey="quantity" radius={[0, 12, 12, 0]} fill="#071f3f" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={<ShoppingBag className="h-6 w-6" />}
              title="Category insights are waiting"
              description="Category analytics will unlock once product sales begin accumulating."
            />
          )}
        </AnalyticsChart>

        <AnalyticsChart
          title="Top customers"
          description="Identify the highest-value buyers for retention campaigns and VIP outreach."
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
                <motion.div
                  key={customer.id}
                  layout
                  className="rounded-[1.4rem] bg-[#faf6ef] p-4 shadow-[0_12px_24px_rgba(7,31,63,0.04)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-navy">{customer.name || "Unnamed customer"}</p>
                      <p className="mt-1 text-sm text-navy/58">{customer.email || "No email available"}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-navy/38">
                        {formatNumber(customer.totalOrders)} orders
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl text-navy">
                        {formatCurrency(customer.totalSpent)}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-navy/38">
                        {customer.emailVerified ? "Verified" : "Unverified"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Crown className="h-6 w-6" />}
              title="Top customers will appear here"
              description="Customer value rankings need completed orders before they can be calculated."
            />
          )}
        </AnalyticsChart>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <AnalyticsChart
          title="Top products"
          description="Best sellers ranked by units sold and revenue generated."
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
                  className="flex items-center justify-between gap-4 rounded-[1.35rem] bg-[#f7f2e9] px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-navy">{product.productName || "Product"}</p>
                    <p className="mt-1 text-sm text-navy/55">{product.brand || "Brand unavailable"}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-navy/38">
                      {formatNumber(product.quantity)} sold
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-navy">{formatCurrency(product.revenue)}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gold">
                      Bestseller
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Package className="h-6 w-6" />}
              title="No best sellers yet"
              description="Product rankings will become available after the first completed orders."
            />
          )}
        </AnalyticsChart>

        <AnalyticsChart
          title="Recent activity"
          description="A live pulse of recent commerce events flowing through the store."
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
                  className="flex items-start justify-between gap-4 rounded-[1.35rem] bg-[#f5f8fb] px-4 py-4"
                >
                  <div>
                    <p className="font-semibold text-navy">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-navy/58">{item.description}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-navy/38">
                      {item.at ? new Date(item.at).toLocaleString("en-IN") : "Time unavailable"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-navy">{formatCurrency(item.amount)}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-gold">
                      {item.type}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<AlertCircle className="h-6 w-6" />}
              title="No recent activity yet"
              description="This feed will fill with orders, customers, and payment events as the store becomes active."
            />
          )}
        </AnalyticsChart>
      </div>

      <div className="mt-6">
        <AnalyticsChart
          title="Inventory watchlist"
          description="Products that need replenishment soon so merchandising can stay ahead of demand."
        >
          {loading && !analytics ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <LoadingSkeleton className="h-28 w-full" />
              <LoadingSkeleton className="h-28 w-full" />
              <LoadingSkeleton className="h-28 w-full" />
              <LoadingSkeleton className="h-28 w-full" />
            </div>
          ) : analytics?.lowStockProducts?.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {analytics.lowStockProducts.slice(0, 8).map((product) => (
                <div
                  key={product.id}
                  className="rounded-[1.35rem] border border-amber-200/70 bg-amber-50/80 p-4"
                >
                  <p className="font-semibold text-navy">{product.name || "Product"}</p>
                  <p className="mt-1 text-sm text-navy/56">{product.brand || "Brand unavailable"}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-amber-700">
                    {product.category}
                  </p>
                  <p className="mt-3 font-display text-3xl text-amber-700">{product.stock}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-700">units left</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<TriangleAlert className="h-6 w-6" />}
              title="Inventory is healthy"
              description="No low stock alerts were found in the selected window."
            />
          )}
        </AnalyticsChart>
      </div>
    </AdminShell>
  );
}
