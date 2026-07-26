import mongoose from "mongoose";
import AnalyticsEvent from "../models/AnalyticsEvent.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { ApiError, asyncHandler } from "../middlewares/errorMiddleware.js";
import { createPaginationMeta, escapeRegex, getPagination } from "../utils/apiFeatures.js";
import { getCreatedAtRangeFilter } from "../utils/dateRange.js";
import { normalizeMoney } from "../utils/money.js";
import {
  buildOrderStatusFilter,
  buildSuccessfulOrderFilter,
} from "../utils/orderStatusFilter.js";
import { getDashboardAnalytics } from "../services/analytics/analyticsService.js";
import { updateOrderStatusAndNotify, serializeOrder } from "../services/orders/orderService.js";
import { ensureOrdersPublicIds } from "../services/orders/publicOrderIdService.js";
import {
  cancelBackInStockNotification,
  listBackInStockNotifications,
  retryBackInStockNotification,
} from "../services/backInStockNotificationService.js";
import { buildUserOrderIdentityFilter } from "../repositories/orderRepository.js";

const ADMIN_USER_STAT_PREMIUM_SPENT = 15000;
const ADMIN_USER_STAT_PREMIUM_ORDERS = 3;
const USER_SORT_FIELDS = new Set([
  "createdAt",
  "updatedAt",
  "lastLogin",
  "name",
  "email",
  "username",
  "mobile",
  "totalOrders",
  "totalSpent",
]);

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const toSafeNumber = (value) => {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : 0;
};

const toSafeString = (value) => String(value || "").trim();

const TEST_FIELD_PATTERN = /^TEST_/i;
const TEST_GATEWAY_PATTERN = /^test-mode$/i;
const INTERNAL_GUEST_EMAIL_PATTERN = /@guest\.purefumes\.local$/i;

const TEST_ORDER_FILTER = {
  $or: [
    { isTestData: true },
    { paymentGateway: TEST_GATEWAY_PATTERN },
    { paymentMethod: /^test-bypass$/i },
    { paymentId: TEST_FIELD_PATTERN },
    { paymentOrderId: TEST_FIELD_PATTERN },
    { paymentSignature: "TEST_SIGNATURE" },
  ],
};

const TEST_ANALYTICS_FILTER = {
  $or: [
    { isTestData: true },
    { "metadata.isTestData": true },
    { "metadata.paymentGateway": TEST_GATEWAY_PATTERN },
    { "metadata.paymentId": TEST_FIELD_PATTERN },
    { "metadata.paymentOrderId": TEST_FIELD_PATTERN },
  ],
};

const buildOrderSearchFilter = (search = "") => {
  const normalized = String(search || "").trim();
  if (!normalized) return {};

  const withoutHash = normalized.replace(/^#/, "");
  const safeSearch = escapeRegex(normalized);
  const safePublicOrderId = escapeRegex(withoutHash);

  return {
    $or: [
      { publicOrderId: { $regex: safePublicOrderId, $options: "i" } },
      { customerName: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } },
      { mobileNumber: { $regex: safeSearch, $options: "i" } },
      { phone: { $regex: safeSearch, $options: "i" } },
      { mobile: { $regex: safeSearch, $options: "i" } },
      { "shippingAddress.mobile": { $regex: safeSearch, $options: "i" } },
    ],
  };
};

const getUserStatusFilter = (status) => {
  switch (String(status || "").trim().toLowerCase()) {
    case "active":
      return { isBanned: false };
    case "blocked":
      return { isBanned: true };
    case "verified":
      return { emailVerified: true };
    case "unverified":
      return { emailVerified: false };
    default:
      return {};
  }
};

const getUserSort = ({ sortBy, sortOrder }) => {
  const normalizedSortBy = USER_SORT_FIELDS.has(sortBy) ? sortBy : "createdAt";
  const normalizedSortOrder = String(sortOrder || "").trim().toLowerCase() === "asc" ? 1 : -1;
  return { [normalizedSortBy]: normalizedSortOrder, _id: -1 };
};

const buildUserFilter = (query = {}) => {
  const filter = { role: "user" };
  const search = String(query.search || "").trim();
  const statusFilter = getUserStatusFilter(query.status);

  Object.assign(filter, statusFilter);

  if (search) {
    const safeSearch = escapeRegex(search);
    filter.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { customerName: { $regex: safeSearch, $options: "i" } },
      { username: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } },
      { mobile: { $regex: safeSearch, $options: "i" } },
      { mobileNumber: { $regex: safeSearch, $options: "i" } },
      { address: { $regex: safeSearch, $options: "i" } },
    ];
  }

  return filter;
};

const uniqueObjectIds = (values = []) =>
  [
    ...new Map(
      values
        .filter((value) => value && mongoose.Types.ObjectId.isValid(String(value)))
        .map((value) => {
          const id = value instanceof mongoose.Types.ObjectId ? value : new mongoose.Types.ObjectId(String(value));
          return [id.toString(), id];
        }),
    ).values(),
  ];

const recomputeCustomerOrderStats = async (userIds = []) => {
  const ids = uniqueObjectIds(
    userIds.filter((id) => mongoose.Types.ObjectId.isValid(String(id))),
  );

  if (!ids.length) {
    return { modifiedCount: 0 };
  }

  const summaries = await Order.aggregate([
    { $match: { userId: { $in: ids } } },
    { $sort: { createdAt: 1 } },
    {
      $group: {
        _id: "$userId",
        totalOrders: { $sum: 1 },
        totalSpent: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ["$status", "Cancelled"] },
                  { $ne: ["$orderStatus", "Cancelled"] },
                  { $ne: ["$paymentStatus", "failed"] },
                  { $ne: ["$paymentStatus", "refunded"] },
                ],
              },
              { $ifNull: ["$totalAmount", 0] },
              0,
            ],
          },
        },
        orderHistory: { $push: "$_id" },
      },
    },
  ]);

  const summaryByUserId = new Map(
    summaries.map((summary) => [String(summary._id), summary]),
  );
  const operations = ids.map((userId) => {
    const summary = summaryByUserId.get(userId.toString());

    return {
      updateOne: {
        filter: { _id: userId, role: "user" },
        update: {
          $set: {
            totalOrders: Number(summary?.totalOrders || 0),
            totalSpent: normalizeMoney(summary?.totalSpent || 0),
            orderHistory: summary?.orderHistory || [],
          },
        },
      },
    };
  });

  return User.bulkWrite(operations, { ordered: false });
};

const deleteTestOrdersAndActivity = async ({ includeAllTestActivity = true } = {}) => {
  const testOrders = await Order.find(TEST_ORDER_FILTER).select("_id userId").lean();
  const orderIds = testOrders.map((order) => order._id).filter(Boolean);
  const userIds = uniqueObjectIds(testOrders.map((order) => order.userId));

  const orderDeleteFilter = orderIds.length ? { _id: { $in: orderIds } } : { _id: { $in: [] } };
  const analyticsDeleteFilter = {
    $or: [
      ...(includeAllTestActivity ? TEST_ANALYTICS_FILTER.$or : []),
      ...(orderIds.length ? [{ orderId: { $in: orderIds } }] : []),
    ],
  };

  const [ordersResult, analyticsResult] = await Promise.all([
    Order.deleteMany(orderDeleteFilter),
    analyticsDeleteFilter.$or.length
      ? AnalyticsEvent.deleteMany(analyticsDeleteFilter)
      : Promise.resolve({ deletedCount: 0 }),
  ]);

  await recomputeCustomerOrderStats(userIds);

  return {
    deletedOrders: ordersResult.deletedCount || 0,
    deletedActivity: analyticsResult.deletedCount || 0,
    resetUsers: userIds.length,
    orderIds,
    userIds,
  };
};

const serializeAdminUser = (user) => {
  const raw = typeof user?.toObject === "function" ? user.toObject({ virtuals: true }) : user;

  if (!raw) {
    return null;
  }

  const email = toSafeString(raw.email);

  return {
    id: raw.id || raw._id?.toString?.() || String(raw._id || ""),
    name: toSafeString(raw.customerName || raw.name) || "Unnamed user",
    customerName: toSafeString(raw.customerName || raw.name),
    username: toSafeString(raw.username),
    email: INTERNAL_GUEST_EMAIL_PATTERN.test(email) ? "" : email,
    mobile: toSafeString(raw.mobileNumber || raw.mobile),
    mobileNumber: toSafeString(raw.mobileNumber || raw.mobile),
    phone: toSafeString(raw.mobileNumber || raw.mobile),
    role: toSafeString(raw.role) || "user",
    profileImage: toSafeString(raw.profileImage),
    address: toSafeString(raw.address),
    totalOrders: toSafeNumber(raw.totalOrders),
    totalSpent: normalizeMoney(raw.totalSpent),
    isBanned: Boolean(raw.isBanned),
    emailVerified: Boolean(raw.emailVerified),
    createdAt: raw.createdAt || null,
    updatedAt: raw.updatedAt || null,
    lastLogin: raw.lastLogin || null,
    lastOrderDate: raw.lastOrderDate || null,
    addresses: Array.isArray(raw.addresses) ? raw.addresses : [],
  };
};

const getAdminUserStats = async () => {
  const today = startOfToday();
  const revenueResult = await Order.aggregate([
    { $match: buildSuccessfulOrderFilter() },
    { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
  ]);

  const [
    totalUsers,
    activeUsers,
    blockedUsers,
    newUsersToday,
    premiumCustomers,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "user", isBanned: false }),
    User.countDocuments({ role: "user", isBanned: true }),
    User.countDocuments({ role: "user", createdAt: { $gte: today } }),
    User.countDocuments({
      role: "user",
      $or: [
        { totalSpent: { $gte: ADMIN_USER_STAT_PREMIUM_SPENT } },
        { totalOrders: { $gte: ADMIN_USER_STAT_PREMIUM_ORDERS } },
      ],
    }),
  ]);

  return {
    totalUsers,
    activeUsers,
    blockedUsers,
    newUsersToday,
    premiumCustomers,
    revenueGenerated: normalizeMoney(revenueResult[0]?.totalRevenue),
  };
};

export const getAdminUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildUserFilter(req.query);
  const sort = getUserSort(req.query);

  const [users, total, stats] = await Promise.all([
    User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),
    User.countDocuments(filter),
    getAdminUserStats(),
  ]);

  res.json({
    success: true,
    data: {
      users: users.map(serializeAdminUser).filter(Boolean),
      stats,
      pagination: createPaginationMeta({ page, limit, total }),
    },
  });
});

export const getAdminOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filterParts = [];
  if (req.query.status) filterParts.push(buildOrderStatusFilter(req.query.status));
  const createdAt = getCreatedAtRangeFilter(req.query);
  if (createdAt) filterParts.push({ createdAt });
  const searchFilter = buildOrderSearchFilter(req.query.search);
  if (Object.keys(searchFilter).length) filterParts.push(searchFilter);
  const filter = buildSuccessfulOrderFilter(...filterParts);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email mobile totalOrders totalSpent")
      .populate("items.productId", "name brand image images")
      .lean({ virtuals: true }),
    Order.countDocuments(filter),
  ]);
  const ordersWithPublicIds = await ensureOrdersPublicIds(orders);

  res.json({
    success: true,
    data: {
      orders: ordersWithPublicIds.map(serializeOrder),
      pagination: createPaginationMeta({ page, limit, total }),
    },
  });
});

export const getAdminBackInStockNotifications = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: await listBackInStockNotifications({
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      search: req.query.search,
    }),
  });
});

export const retryAdminBackInStockNotification = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Back in stock email queued.",
    data: await retryBackInStockNotification(req.params.id),
  });
});

export const cancelAdminBackInStockNotification = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Back in stock notification cancelled.",
    data: await cancelBackInStockNotification(req.params.id),
  });
});

export const getAdminAnalytics = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: await getDashboardAnalytics({
      range: req.query.range,
      from: req.query.from,
      to: req.query.to,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    }),
  });
});

export const clearAdminActivity = asyncHandler(async (_req, res) => {
  const result = await AnalyticsEvent.deleteMany(TEST_ANALYTICS_FILTER);

  res.json({
    success: true,
    data: {
      deletedActivity: result.deletedCount || 0,
    },
  });
});

export const clearAdminOrders = asyncHandler(async (_req, res) => {
  const result = await deleteTestOrdersAndActivity({ includeAllTestActivity: false });

  res.json({
    success: true,
    data: {
      deletedOrders: result.deletedOrders,
      deletedActivity: result.deletedActivity,
      resetUsers: result.resetUsers,
    },
  });
});

export const clearAdminAnalytics = asyncHandler(async (_req, res) => {
  const testUsers = await User.find({ role: "user", isTestData: true }).select("_id").lean();
  const testUserIds = uniqueObjectIds(testUsers.map((user) => user._id));
  const userOrderFilter = testUserIds.length ? { userId: { $in: testUserIds } } : null;
  const userTestOrders = userOrderFilter
    ? await Order.find(userOrderFilter).select("_id userId").lean()
    : [];
  const result = await deleteTestOrdersAndActivity({ includeAllTestActivity: true });
  const extraOrderIds = userTestOrders
    .map((order) => order._id)
    .filter((orderId) => !result.orderIds.some((id) => String(id) === String(orderId)));

  let extraOrdersResult = { deletedCount: 0 };
  if (extraOrderIds.length) {
    extraOrdersResult = await Order.deleteMany({ _id: { $in: extraOrderIds } });
  }

  const analyticsFilter = {
    $or: [
      ...(testUserIds.length ? [{ userId: { $in: testUserIds } }] : []),
      ...(extraOrderIds.length ? [{ orderId: { $in: extraOrderIds } }] : []),
    ],
  };
  const analyticsUsersResult = analyticsFilter.$or.length
    ? await AnalyticsEvent.deleteMany(analyticsFilter)
    : { deletedCount: 0 };
  const cartsResult = testUserIds.length
    ? await Cart.deleteMany({ userId: { $in: testUserIds } })
    : { deletedCount: 0 };
  const usersResult = testUserIds.length
    ? await User.deleteMany({ _id: { $in: testUserIds }, role: "user", isTestData: true })
    : { deletedCount: 0 };

  await recomputeCustomerOrderStats([
    ...result.userIds,
    ...userTestOrders.map((order) => order.userId),
  ]);

  res.json({
    success: true,
    data: {
      deletedOrders: result.deletedOrders + (extraOrdersResult.deletedCount || 0),
      deletedActivity:
        result.deletedActivity + (analyticsUsersResult.deletedCount || 0),
      clearedCarts: cartsResult.deletedCount || 0,
      deletedUsers: usersResult.deletedCount || 0,
      resetUsers: result.resetUsers,
    },
  });
});

export const clearAdminUsers = asyncHandler(async (req, res) => {
  const adminId = req.user?._id?.toString?.() || String(req.user?.id || "");
  const users = await User.find({
    role: "user",
    ...(adminId && mongoose.Types.ObjectId.isValid(adminId) ? { _id: { $ne: adminId } } : {}),
  })
    .select("_id")
    .lean();
  const userIds = users.map((user) => user._id).filter(Boolean);

  if (!userIds.length) {
    return res.json({
      success: true,
      data: {
        deletedUsers: 0,
        clearedCarts: 0,
        deletedActivity: 0,
        detachedOrders: 0,
      },
    });
  }

  const [usersResult, cartsResult, analyticsResult, ordersResult] = await Promise.all([
    User.deleteMany({ _id: { $in: userIds }, role: "user" }),
    Cart.deleteMany({ userId: { $in: userIds } }),
    AnalyticsEvent.deleteMany({ userId: { $in: userIds } }),
    Order.updateMany({ userId: { $in: userIds } }, { $set: { userId: null } }),
  ]);

  res.json({
    success: true,
    data: {
      deletedUsers: usersResult.deletedCount || 0,
      clearedCarts: cartsResult.deletedCount || 0,
      deletedActivity: analyticsResult.deletedCount || 0,
      detachedOrders: ordersResult.modifiedCount || 0,
    },
  });
});

export const patchOrderStatus = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid order id");
  }

  const order = await updateOrderStatusAndNotify({
    orderId: req.params.id,
    status: req.body.status,
    trackingId: req.body.trackingId,
    deliveryDate: req.body.deliveryDate,
  });

  res.json({ success: true, data: order });
});

export const getAdminUserDetails = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid user id");
  }

  const user = await User.findById(req.params.id).lean({ virtuals: true });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const recentOrders = await Order.find(
    buildUserOrderIdentityFilter({
      userId: user._id,
      email: user.email,
      mobile: user.mobileNumber || user.mobile,
    }),
  )
    .sort({ createdAt: -1 })
    .limit(8)
    .populate("items.productId", "name brand image images")
    .lean({ virtuals: true });

  const serializedUser = serializeAdminUser(user);
  const ordersWithPublicIds = await ensureOrdersPublicIds(recentOrders);
  const serializedOrders = ordersWithPublicIds.map(serializeOrder);
  const totalSpent = normalizeMoney(
    serializedOrders.reduce((sum, order) => sum + toSafeNumber(order.totalAmount), 0),
  );
  const firstOrderAt =
    serializedOrders.length > 0
      ? serializedOrders[serializedOrders.length - 1]?.createdAt || null
      : null;
  const lastOrderAt = serializedOrders[0]?.createdAt || null;

  res.json({
    success: true,
    data: {
      user: serializedUser,
      recentOrders: serializedOrders,
      summary: {
        totalOrders: serializedUser.totalOrders,
        totalSpent: serializedUser.totalSpent,
        averageOrderValue:
          serializedUser.totalOrders > 0
            ? normalizeMoney(serializedUser.totalSpent / serializedUser.totalOrders)
            : 0,
        firstOrderAt,
        lastOrderAt,
        recentRevenue: totalSpent,
      },
    },
  });
});

export const getAdminUserOrders = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid user id");
  }

  const { page, limit, skip } = getPagination(req.query);
  const user = await User.findById(req.params.id).lean({ virtuals: true });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const orderFilter = buildUserOrderIdentityFilter({
    userId: user._id,
    email: user.email,
    mobile: user.mobileNumber || user.mobile,
  });

  const [orders, total] = await Promise.all([
    Order.find(orderFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("items.productId", "name brand image images")
      .lean({ virtuals: true }),
    Order.countDocuments(orderFilter),
  ]);
  const ordersWithPublicIds = await ensureOrdersPublicIds(orders);

  res.json({
    success: true,
    data: {
      orders: ordersWithPublicIds.map(serializeOrder),
      pagination: createPaginationMeta({ page, limit, total }),
    },
  });
});

export const banUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const isBanned = Boolean(req.body.isBanned);

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (String(req.user?._id || "") === String(userId) && isBanned) {
    throw new ApiError(400, "You cannot block your own admin account");
  }

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  user.isBanned = isBanned;
  user.bannedAt = isBanned ? new Date() : null;
  await user.save();

  res.json({
    success: true,
    data: { user: serializeAdminUser(user) },
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (String(req.user?._id || "") === String(userId)) {
    throw new ApiError(400, "You cannot delete your own admin account");
  }

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const existingOrders = await Order.countDocuments(
    buildUserOrderIdentityFilter({
      userId: user._id,
      email: user.email,
      mobile: user.mobileNumber || user.mobile,
    }),
  );
  if (existingOrders > 0) {
    throw new ApiError(409, "This user has order history. Block the account instead of deleting it.");
  }

  await Promise.all([
    Cart.deleteOne({ userId }),
    AnalyticsEvent.deleteMany({ userId }),
    User.deleteOne({ _id: userId }),
  ]);

  res.json({
    success: true,
    data: {
      userId,
      deleted: true,
    },
  });
});
