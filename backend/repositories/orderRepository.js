import mongoose from "mongoose";
import Order from "../models/Order.js";

const orderPopulate = [
  { path: "product", select: "name brand category image images stock" },
  { path: "items.productId", select: "name brand category image images stock" },
  { path: "userId", select: "name email mobile totalOrders totalSpent" },
];

export const findOrderById = (id) =>
  Order.findById(id).populate(orderPopulate).lean({ virtuals: true });

export const findOrdersByUserId = ({ userId, skip = 0, limit = 20 }) =>
  Order.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate(orderPopulate)
    .lean({ virtuals: true });

export const countOrdersByUserId = (userId) => Order.countDocuments({ userId });

const toObjectId = (id) =>
  id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(String(id));

export const buildUserOrderIdentityFilter = ({ userId, email = "", mobile = "" }) => {
  const clauses = [];
  const legacyOwnerClauses = [];

  if (userId && mongoose.Types.ObjectId.isValid(String(userId))) {
    clauses.push({ userId: toObjectId(userId) });
  }

  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (normalizedEmail) {
    legacyOwnerClauses.push({ email: normalizedEmail });
  }

  const normalizedMobile = String(mobile || "").trim();
  if (normalizedMobile) {
    legacyOwnerClauses.push({ mobile: normalizedMobile }, { phone: normalizedMobile });
  }

  if (legacyOwnerClauses.length) {
    // Legacy guest orders did not always have userId. Never let email/mobile match
    // override a different authenticated owner.
    clauses.push({
      $and: [
        { $or: [{ userId: { $exists: false } }, { userId: null }] },
        legacyOwnerClauses.length > 1 ? { $or: legacyOwnerClauses } : legacyOwnerClauses[0],
      ],
    });
  }

  return clauses.length > 1 ? { $or: clauses } : clauses[0] || { _id: null };
};

export const findOrdersByUserIdentity = ({ user, skip = 0, limit = 20 }) =>
  Order.find(
    buildUserOrderIdentityFilter({
      userId: user?._id || user?.id,
      email: user?.email,
      mobile: user?.mobile,
    }),
  )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate(orderPopulate)
    .lean({ virtuals: true });

export const countOrdersByUserIdentity = (user) =>
  Order.countDocuments(
    buildUserOrderIdentityFilter({
      userId: user?._id || user?.id,
      email: user?.email,
      mobile: user?.mobile,
    }),
  );

export const aggregateUserOrderSummary = async (user) => {
  const [summary = {}] = await Order.aggregate([
    {
      $match: buildUserOrderIdentityFilter({
        userId: user?._id || user?.id,
        email: user?.email,
        mobile: user?.mobile,
      }),
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ["$status", "Cancelled"] },
                  { $ne: ["$orderStatus", "Cancelled"] },
                  { $ne: ["$paymentStatus", "refunded"] },
                  { $ne: ["$paymentStatus", "failed"] },
                ],
              },
              { $ifNull: ["$totalAmount", 0] },
              0,
            ],
          },
        },
      },
    },
  ]);

  return {
    totalOrders: Number(summary.totalOrders || 0),
    totalSpent: Number(summary.totalSpent || 0),
  };
};

export const findAdminOrders = ({ filter = {}, skip = 0, limit = 20 }) =>
  Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate(orderPopulate)
    .lean({ virtuals: true });

export const countAdminOrders = (filter = {}) => Order.countDocuments(filter);
