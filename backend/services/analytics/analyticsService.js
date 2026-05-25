import AnalyticsEvent from "../../models/AnalyticsEvent.js";
import Cart from "../../models/Cart.js";
import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import User from "../../models/User.js";
import { getDateRange } from "../../utils/dateRange.js";
import { formatINR, normalizeMoney } from "../../utils/money.js";
import {
  buildOrderStatusFilter,
  buildSuccessfulOrderFilter,
} from "../../utils/orderStatusFilter.js";

const LOW_STOCK_THRESHOLD = 10;
const PREMIUM_SPENT_THRESHOLD = 15000;
const PREMIUM_ORDER_THRESHOLD = 3;
const INTERNAL_GUEST_EMAIL_PATTERN = /@guest\.purefumes\.local$/i;

const toSafeNumber = (value) => {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : 0;
};

const getOrderCustomerExpression = () => ({
  $let: {
    vars: {
      email: { $ifNull: ["$email", ""] },
      mobileNumber: { $ifNull: ["$mobileNumber", ""] },
      mobile: { $ifNull: ["$mobile", ""] },
      phone: { $ifNull: ["$phone", ""] },
    },
    in: {
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
            { $ne: ["$$email", ""] },
            { $concat: ["email:", "$$email"] },
            {
              $cond: [
                { $ne: ["$$mobileNumber", ""] },
                { $concat: ["mobile:", "$$mobileNumber"] },
                {
                  $cond: [
                    { $ne: ["$$mobile", ""] },
                    { $concat: ["mobile:", "$$mobile"] },
                    {
                      $cond: [
                        { $ne: ["$$phone", ""] },
                        { $concat: ["phone:", "$$phone"] },
                        { $concat: ["guest:", { $toString: "$_id" }] },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
});

const buildTimeBucket = ({ rangeKey, startDate, endDate }) => {
  const daysInRange = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / 86400000,
  );

  if (daysInRange <= 1) {
    return {
      format: "%Y-%m-%d %H:00",
    };
  }

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

  return normalizeMoney(result[0]?.revenue);
};

const getDateToString = (format) => ({
  $dateToString: {
    format,
    date: "$createdAt",
    timezone: "Asia/Kolkata",
  },
});

const getTrendPipeline = ({ startDate, endDate, rangeKey }) => {
  const bucket = buildTimeBucket({ rangeKey, startDate, endDate });

  return [
    {
      $match: buildSuccessfulOrderFilter({
        createdAt: { $gte: startDate, $lte: endDate },
      }),
    },
    {
      $group: {
        _id: getDateToString(bucket.format),
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ];
};

const buildRecentActivity = ({ analyticsEvents }) =>
  [...analyticsEvents]
    .filter((item) => item.at)
    .sort(
      (left, right) =>
        new Date(right.at).getTime() - new Date(left.at).getTime(),
    )
    .slice(0, 12);

export const getDashboardAnalytics = async ({
  range,
  from,
  to,
  startDate: rawStartDate,
  endDate: rawEndDate,
} = {}) => {
  const {
    key: rangeKey,
    startDate,
    endDate,
  } = getDateRange({
    range,
    from,
    to,
    startDate: rawStartDate,
    endDate: rawEndDate,
  });
  const timeBucket = buildTimeBucket({ rangeKey, startDate, endDate });
  const dateFilter = { $gte: startDate, $lte: endDate };
  const successfulRangeOrderMatch = buildSuccessfulOrderFilter({
    createdAt: dateFilter,
  });

  const [
    activeUsers,
    blockedUsers,
    newUsersInRange,
    ordersInRange,
    pendingOrders,
    lowStockAlerts,
    revenueInRange,
    repeatCustomersResult,
    rangeCustomersResult,
    premiumCustomersResult,
    abandonedCartResult,
    revenueTrend,
    userGrowth,
    topProductsResult,
    topCustomers,
    analyticsEventsRaw,
  ] = await Promise.all([
    User.countDocuments({
      role: "user",
      lastLogin: dateFilter,
    }),
    User.countDocuments({
      role: "user",
      isBanned: true,
      createdAt: dateFilter,
    }),
    User.countDocuments({ role: "user", createdAt: dateFilter }),
    Order.countDocuments(successfulRangeOrderMatch),
    Order.countDocuments({
      $and: [buildOrderStatusFilter("Pending"), { createdAt: dateFilter }],
    }),
    Product.countDocuments({ stock: { $lte: LOW_STOCK_THRESHOLD } }),
    sumRevenue(successfulRangeOrderMatch),
    Order.aggregate([
      { $match: successfulRangeOrderMatch },
      { $addFields: { customerKey: getOrderCustomerExpression() } },
      { $group: { _id: "$customerKey", orderCount: { $sum: 1 } } },
      { $match: { orderCount: { $gte: 2 } } },
      { $count: "total" },
    ]),
    Order.aggregate([
      { $match: successfulRangeOrderMatch },
      { $addFields: { customerKey: getOrderCustomerExpression() } },
      { $group: { _id: "$customerKey", orderCount: { $sum: 1 } } },
      { $count: "total" },
    ]),
    Order.aggregate([
      { $match: successfulRangeOrderMatch },
      { $addFields: { customerKey: getOrderCustomerExpression() } },
      {
        $group: {
          _id: "$customerKey",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
        },
      },
      {
        $match: {
          $or: [
            { totalSpent: { $gte: PREMIUM_SPENT_THRESHOLD } },
            { totalOrders: { $gte: PREMIUM_ORDER_THRESHOLD } },
          ],
        },
      },
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
              $match: buildSuccessfulOrderFilter({
                $expr: {
                  $and: [
                    { $eq: ["$userId", "$$userId"] },
                    { $gte: ["$createdAt", "$$cartUpdatedAt"] },
                    { $lte: ["$createdAt", endDate] },
                  ],
                },
              }),
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
      {
        $match: { role: "user", createdAt: dateFilter },
      },
      {
        $group: {
          _id: getDateToString(timeBucket.format),
          users: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: successfulRangeOrderMatch },
      { $unwind: "$items" },
      { $match: { "items.productId": { $ne: null } } },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.productName" },
          productImage: { $first: "$items.productImage" },
          totalQuantitySold: { $sum: "$items.quantity" },
          totalRevenueGenerated: {
            $sum: {
              $multiply: [
                "$items.quantity",
                { $ifNull: ["$items.priceAtPurchase", "$items.price"] },
              ],
            },
          },
          orderIds: { $addToSet: "$_id" },
        },
      },
      {
        $addFields: {
          totalOrders: { $size: "$orderIds" },
        },
      },
      {
        $sort: {
          totalQuantitySold: -1,
          totalOrders: -1,
          totalRevenueGenerated: -1,
          productName: 1,
        },
      },
      { $limit: 8 },
      {
        $lookup: {
          from: "products",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$productId"] },
              },
            },
            {
              $project: {
                name: 1,
                brand: 1,
                image: 1,
                images: 1,
              },
            },
          ],
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    ]),
    Order.aggregate([
      { $match: successfulRangeOrderMatch },
      { $sort: { createdAt: -1 } },
      { $addFields: { customerKey: getOrderCustomerExpression() } },
      {
        $group: {
          _id: "$customerKey",
          userId: { $first: "$userId" },
          name: { $first: "$customerName" },
          email: { $first: "$email" },
          mobileNumber: { $first: "$mobileNumber" },
          mobile: { $first: "$mobile" },
          phone: { $first: "$phone" },
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          lastOrderAt: { $max: "$createdAt" },
          createdAt: { $min: "$createdAt" },
        },
      },
      { $sort: { totalSpent: -1, totalOrders: -1, lastOrderAt: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          let: { userId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$userId"] },
              },
            },
            {
              $project: {
                name: 1,
                customerName: 1,
                email: 1,
                mobile: 1,
                mobileNumber: 1,
                lastLogin: 1,
                lastOrderDate: 1,
                emailVerified: 1,
                isBanned: 1,
              },
            },
          ],
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    ]),
    AnalyticsEvent.find({ createdAt: dateFilter })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean(),
  ]);

  const repeatCustomers = toSafeNumber(repeatCustomersResult[0]?.total);
  const purchasingCustomersInRange = toSafeNumber(
    rangeCustomersResult[0]?.total,
  );
  const premiumCustomers = toSafeNumber(premiumCustomersResult[0]?.total);
  const abandonedCarts = toSafeNumber(abandonedCartResult[0]?.total);
  const averageOrderValue =
    ordersInRange > 0 ? normalizeMoney(revenueInRange / ordersInRange) : 0;
  const conversionRate =
    activeUsers > 0
      ? Number(((purchasingCustomersInRange / activeUsers) * 100).toFixed(1))
      : 0;

  const topProducts = topProductsResult.map((product) => ({
    productId: product._id?.toString?.() || String(product._id || ""),
    productName: product.productName || product.product?.name || "Product",
    brand: product.product?.brand || "",
    image:
      product.productImage ||
      product.product?.image ||
      product.product?.images?.[0] ||
      "",
    totalOrders: toSafeNumber(product.totalOrders),
    totalQuantitySold: toSafeNumber(product.totalQuantitySold),
    totalRevenueGenerated: normalizeMoney(product.totalRevenueGenerated),
    quantity: toSafeNumber(product.totalQuantitySold),
    revenue: normalizeMoney(product.totalRevenueGenerated),
  }));

  const analyticsEvents = analyticsEventsRaw.map((event) => ({
    id: `event-${event._id?.toString?.() || ""}`,
    title: String(event.type || "activity").replace(/[-_]/g, " "),
    description:
      toSafeNumber(event.revenue) > 0
        ? `Revenue ${formatINR(event.revenue)}`
        : "Tracked ecommerce event",
    amount: normalizeMoney(event.revenue),
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
      totalRevenue: revenueInRange,
      revenueToday: revenueInRange,
      monthlyRevenue: revenueInRange,
      revenueInRange,
      totalOrders: ordersInRange,
      ordersInRange,
      averageOrderValue,
      conversionRate,
      repeatCustomers,
      activeUsers,
      abandonedCarts,
      lowStockAlerts,
      totalUsers: purchasingCustomersInRange,
      blockedUsers,
      newUsersToday: newUsersInRange,
      premiumCustomers,
      pendingOrders,
    },
    trends: {
      revenue: revenueTrend.map((item) => ({
        label: item._id,
        revenue: normalizeMoney(item.revenue),
        orders: toSafeNumber(item.orders),
      })),
      users: userGrowth.map((item) => ({
        label: item._id,
        value: toSafeNumber(item.users),
      })),
    },
    topProducts,
    topCustomers: topCustomers.map((customer) => ({
      id:
        customer.userId?.toString?.() ||
        customer._id?.toString?.() ||
        String(customer._id || ""),
      name: customer.name || customer.user?.customerName || customer.user?.name || "Customer",
      email: INTERNAL_GUEST_EMAIL_PATTERN.test(customer.email || customer.user?.email || "")
        ? ""
        : customer.email || customer.user?.email || "",
      mobile:
        customer.mobileNumber ||
        customer.mobile ||
        customer.phone ||
        customer.user?.mobileNumber ||
        customer.user?.mobile ||
        "",
      totalOrders: toSafeNumber(customer.totalOrders),
      totalSpent: normalizeMoney(customer.totalSpent),
      lastLogin: customer.user?.lastLogin || null,
      lastOrderAt: customer.lastOrderAt || customer.user?.lastOrderDate || null,
      createdAt: customer.createdAt || null,
      emailVerified: Boolean(customer.user?.emailVerified),
      isBanned: Boolean(customer.user?.isBanned),
    })),
    recentActivity: buildRecentActivity({
      analyticsEvents,
    }),
  };
};
