import AnalyticsEvent from "../../models/AnalyticsEvent.js";
import Cart from "../../models/Cart.js";
import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import User from "../../models/User.js";
import { getDateRange, startOfDay } from "../../utils/dateRange.js";

const LOW_STOCK_THRESHOLD = 10;
const PREMIUM_SPENT_THRESHOLD = 15000;
const PREMIUM_ORDER_THRESHOLD = 3;

const toSafeNumber = (value) => {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : 0;
};

const getOrderCustomerExpression = () => ({
  $ifNull: [
    {
      $cond: [
        { $ne: ["$userId", null] },
        { $concat: ["user:", { $toString: "$userId" }] },
        null,
      ],
    },
    {
      $cond: [
        { $ne: ["$email", ""] },
        { $concat: ["email:", "$email"] },
        {
          $cond: [
            { $ne: ["$mobile", ""] },
            { $concat: ["mobile:", "$mobile"] },
            { $concat: ["guest:", { $toString: "$_id" }] },
          ],
        },
      ],
    },
  ],
});

const buildTimeBucket = ({ rangeKey, startDate, endDate }) => {
  const daysInRange = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000);
  return rangeKey === "6m" || rangeKey === "1y" || daysInRange > 120
    ? {
        format: "%Y-%m",
      }
    : {
        format: "%Y-%m-%d",
      };
};

const sumRevenue = async (match) => {
  const result = await Order.aggregate([
    { $match: match },
    { $group: { _id: null, revenue: { $sum: "$totalAmount" } } },
  ]);

  return toSafeNumber(result[0]?.revenue);
};

const getTrendPipeline = ({ startDate, endDate, rangeKey }) => {
  const bucket = buildTimeBucket({ rangeKey, startDate, endDate });

  return [
    {
      $match: {
        status: { $ne: "Cancelled" },
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: bucket.format,
            date: "$createdAt",
          },
        },
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ];
};

const buildRecentActivity = ({ recentOrders, recentUsers, analyticsEvents }) =>
  [...recentOrders, ...recentUsers, ...analyticsEvents]
    .filter((item) => item.at)
    .sort((left, right) => new Date(right.at).getTime() - new Date(left.at).getTime())
    .slice(0, 12);

export const getDashboardAnalytics = async ({ range, from, to } = {}) => {
  const { key: rangeKey, startDate, endDate } = getDateRange({ range, from, to });
  const timeBucket = buildTimeBucket({ rangeKey, startDate, endDate });
  const todayStart = startOfDay(new Date());
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const paidOrderMatch = { status: { $ne: "Cancelled" } };
  const rangeOrderMatch = {
    status: { $ne: "Cancelled" },
    createdAt: { $gte: startDate, $lte: endDate },
  };

  const [
    totalUsers,
    activeUsers,
    blockedUsers,
    newUsersToday,
    premiumCustomers,
    totalOrders,
    ordersInRange,
    pendingOrders,
    lowStockAlerts,
    totalRevenue,
    revenueToday,
    monthlyRevenue,
    revenueInRange,
    repeatCustomersResult,
    rangeCustomersResult,
    abandonedCartResult,
    revenueTrend,
    userGrowth,
    topProductsResult,
    topCustomers,
    recentOrdersRaw,
    recentUsersRaw,
    analyticsEventsRaw,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "user", lastLogin: { $gte: startDate, $lte: endDate } }),
    User.countDocuments({ role: "user", isBanned: true }),
    User.countDocuments({ role: "user", createdAt: { $gte: todayStart } }),
    User.countDocuments({
      role: "user",
      $or: [
        { totalSpent: { $gte: PREMIUM_SPENT_THRESHOLD } },
        { totalOrders: { $gte: PREMIUM_ORDER_THRESHOLD } },
      ],
    }),
    Order.countDocuments(paidOrderMatch),
    Order.countDocuments(rangeOrderMatch),
    Order.countDocuments({ status: "Pending" }),
    Product.countDocuments({ stock: { $lte: LOW_STOCK_THRESHOLD } }),
    sumRevenue(paidOrderMatch),
    sumRevenue({ ...paidOrderMatch, createdAt: { $gte: todayStart } }),
    sumRevenue({ ...paidOrderMatch, createdAt: { $gte: monthStart } }),
    sumRevenue(rangeOrderMatch),
    Order.aggregate([
      { $match: paidOrderMatch },
      { $addFields: { customerKey: getOrderCustomerExpression() } },
      { $group: { _id: "$customerKey", orderCount: { $sum: 1 } } },
      { $match: { orderCount: { $gte: 2 } } },
      { $count: "total" },
    ]),
    Order.aggregate([
      { $match: rangeOrderMatch },
      { $addFields: { customerKey: getOrderCustomerExpression() } },
      { $group: { _id: "$customerKey", orderCount: { $sum: 1 } } },
      { $count: "total" },
    ]),
    Cart.aggregate([
      {
        $match: {
          "items.0": { $exists: true },
          updatedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: "orders",
          let: { userId: "$userId", cartUpdatedAt: "$updatedAt" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$userId", "$$userId"] },
                    { $gte: ["$createdAt", "$$cartUpdatedAt"] },
                    { $ne: ["$status", "Cancelled"] },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "completedOrders",
        },
      },
      { $match: { completedOrders: { $eq: [] } } },
      { $count: "total" },
    ]),
    Order.aggregate(getTrendPipeline({ startDate, endDate, rangeKey })),
    User.aggregate([
      { $match: { role: "user", createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: timeBucket.format,
              date: "$createdAt",
            },
          },
          users: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: rangeOrderMatch },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.productName" },
          quantity: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
      { $sort: { revenue: -1, quantity: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    ]),
    User.find({ role: "user" })
      .sort({ totalSpent: -1, totalOrders: -1 })
      .limit(8)
      .select("name email mobile totalOrders totalSpent lastLogin createdAt emailVerified isBanned")
      .lean(),
    Order.find(rangeOrderMatch)
      .sort({ createdAt: -1 })
      .limit(6)
      .select("customerName totalAmount status orderStatus createdAt paymentStatus")
      .lean({ virtuals: true }),
    User.find({ role: "user" })
      .sort({ createdAt: -1 })
      .limit(6)
      .select("name email createdAt")
      .lean(),
    AnalyticsEvent.find({ createdAt: { $gte: startDate, $lte: endDate } })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  const repeatCustomers = toSafeNumber(repeatCustomersResult[0]?.total);
  const purchasingCustomersInRange = toSafeNumber(rangeCustomersResult[0]?.total);
  const abandonedCarts = toSafeNumber(abandonedCartResult[0]?.total);
  const averageOrderValue = ordersInRange > 0 ? Number((revenueInRange / ordersInRange).toFixed(2)) : 0;
  const conversionRate =
    activeUsers > 0 ? Number(((purchasingCustomersInRange / activeUsers) * 100).toFixed(1)) : 0;

  const topProducts = topProductsResult.map((product) => ({
    productId: product._id?.toString?.() || String(product._id || ""),
    productName: product.productName || product.product?.name || "Product",
    brand: product.product?.brand || "",
    image: product.product?.image || product.product?.images?.[0] || "",
    quantity: toSafeNumber(product.quantity),
    revenue: toSafeNumber(product.revenue),
  }));

  const recentOrders = recentOrdersRaw.map((order) => ({
    id: order.id || order._id?.toString?.() || String(order._id || ""),
    title: `Order from ${order.customerName || "Customer"}`,
    description: `${order.status || order.orderStatus || "Pending"} | ${order.paymentStatus || "pending"}`,
    amount: toSafeNumber(order.totalAmount),
    at: order.createdAt || null,
    type: "order",
  }));

  const recentUsers = recentUsersRaw.map((user) => ({
    id: user._id?.toString?.() || String(user._id || ""),
    title: `${user.name || "Customer"} joined`,
    description: user.email || "New customer account",
    amount: 0,
    at: user.createdAt || null,
    type: "signup",
  }));

  const analyticsEvents = analyticsEventsRaw.map((event) => ({
    id: `event-${event._id?.toString?.() || ""}`,
    title: String(event.type || "activity").replace(/[-_]/g, " "),
    description:
      toSafeNumber(event.revenue) > 0
        ? `Revenue Rs. ${toSafeNumber(event.revenue).toLocaleString("en-IN")}`
        : "Tracked ecommerce event",
    amount: toSafeNumber(event.revenue),
    at: event.createdAt || null,
    type: String(event.type || "activity"),
  }));

  return {
    range: {
      key: rangeKey,
      from: startDate.toISOString(),
      to: endDate.toISOString(),
    },
    summary: {
      totalRevenue,
      revenueToday,
      monthlyRevenue,
      revenueInRange,
      totalOrders,
      ordersInRange,
      averageOrderValue,
      conversionRate,
      repeatCustomers,
      activeUsers,
      abandonedCarts,
      lowStockAlerts,
      totalUsers,
      blockedUsers,
      newUsersToday,
      premiumCustomers,
      pendingOrders,
    },
    trends: {
      revenue: revenueTrend.map((item) => ({
        label: item._id,
        revenue: toSafeNumber(item.revenue),
        orders: toSafeNumber(item.orders),
      })),
      users: userGrowth.map((item) => ({
        label: item._id,
        value: toSafeNumber(item.users),
      })),
    },
    topProducts,
    topCustomers: topCustomers.map((customer) => ({
      id: customer._id?.toString?.() || String(customer._id || ""),
      name: customer.name || "Customer",
      email: customer.email || "",
      mobile: customer.mobile || "",
      totalOrders: toSafeNumber(customer.totalOrders),
      totalSpent: toSafeNumber(customer.totalSpent),
      lastLogin: customer.lastLogin || null,
      createdAt: customer.createdAt || null,
      emailVerified: Boolean(customer.emailVerified),
      isBanned: Boolean(customer.isBanned),
    })),
    recentActivity: buildRecentActivity({
      recentOrders,
      recentUsers,
      analyticsEvents,
    }),
  };
};
