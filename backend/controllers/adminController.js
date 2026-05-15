import mongoose from "mongoose";
import AnalyticsEvent from "../models/AnalyticsEvent.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { ApiError, asyncHandler } from "../middlewares/errorMiddleware.js";
import { createPaginationMeta, escapeRegex, getPagination } from "../utils/apiFeatures.js";
import { getCreatedAtRangeFilter } from "../utils/dateRange.js";
import { getDashboardAnalytics } from "../services/analytics/analyticsService.js";
import { updateOrderStatusAndNotify, serializeOrder } from "../services/orders/orderService.js";

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
  const filter = {};
  const search = String(query.search || "").trim();
  const statusFilter = getUserStatusFilter(query.status);

  Object.assign(filter, statusFilter);

  if (search) {
    const safeSearch = escapeRegex(search);
    filter.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { username: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } },
      { mobile: { $regex: safeSearch, $options: "i" } },
    ];
  }

  return filter;
};

const serializeAdminUser = (user) => {
  const raw = typeof user?.toObject === "function" ? user.toObject({ virtuals: true }) : user;

  if (!raw) {
    return null;
  }

  return {
    id: raw.id || raw._id?.toString?.() || String(raw._id || ""),
    name: toSafeString(raw.name) || "Unnamed user",
    username: toSafeString(raw.username),
    email: toSafeString(raw.email),
    mobile: toSafeString(raw.mobile),
    phone: toSafeString(raw.mobile),
    role: toSafeString(raw.role) || "user",
    profileImage: toSafeString(raw.profileImage),
    totalOrders: toSafeNumber(raw.totalOrders),
    totalSpent: toSafeNumber(raw.totalSpent),
    isBanned: Boolean(raw.isBanned),
    emailVerified: Boolean(raw.emailVerified),
    createdAt: raw.createdAt || null,
    updatedAt: raw.updatedAt || null,
    lastLogin: raw.lastLogin || null,
    addresses: Array.isArray(raw.addresses) ? raw.addresses : [],
  };
};

const getAdminUserStats = async () => {
  const today = startOfToday();
  const revenueResult = await Order.aggregate([
    { $match: { status: { $ne: "Cancelled" } } },
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
    revenueGenerated: toSafeNumber(revenueResult[0]?.totalRevenue),
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
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const createdAt = getCreatedAtRangeFilter(req.query);
  if (createdAt) filter.createdAt = createdAt;

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

  res.json({
    success: true,
    data: {
      orders: orders.map(serializeOrder),
      pagination: createPaginationMeta({ page, limit, total }),
    },
  });
});

export const getAdminAnalytics = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: await getDashboardAnalytics({
      range: req.query.range,
      from: req.query.from,
      to: req.query.to,
    }),
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

  const [user, recentOrders] = await Promise.all([
    User.findById(req.params.id).lean({ virtuals: true }),
    Order.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("items.productId", "name brand image images")
      .lean({ virtuals: true }),
  ]);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const serializedUser = serializeAdminUser(user);
  const serializedOrders = recentOrders.map(serializeOrder);
  const totalSpent = serializedOrders.reduce((sum, order) => sum + toSafeNumber(order.totalAmount), 0);
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
            ? Number((serializedUser.totalSpent / serializedUser.totalOrders).toFixed(2))
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

  const [orders, total] = await Promise.all([
    Order.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("items.productId", "name brand image images")
      .lean({ virtuals: true }),
    Order.countDocuments({ userId: req.params.id }),
  ]);

  res.json({
    success: true,
    data: {
      orders: orders.map(serializeOrder),
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

  const existingOrders = await Order.countDocuments({ userId });
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
