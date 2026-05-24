import logger from "../../config/logger.js";
import { ApiError } from "../../middlewares/errorMiddleware.js";
import Order from "../../models/Order.js";

export const PUBLIC_ORDER_ID_PATTERN = /^\d{6}$/;

const isDuplicatePublicOrderIdError = (error) =>
  error?.code === 11000 &&
  (error?.keyPattern?.publicOrderId ||
    error?.keyValue?.publicOrderId ||
    String(error?.message || "").includes("publicOrderId"));

export async function generatePublicOrderId({ session } = {}) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const orderId = Math.floor(100000 + Math.random() * 900000).toString();
    const query = Order.exists({ publicOrderId: orderId });
    const exists = session ? await query.session(session) : await query;

    if (!exists) {
      return orderId;
    }
  }

  throw new ApiError(500, "Could not generate a unique order id");
}

export const ensureOrderPublicId = async (order, { session } = {}) => {
  if (!order || PUBLIC_ORDER_ID_PATTERN.test(String(order.publicOrderId || ""))) {
    return order;
  }

  const orderId = order._id || order.id;
  if (!orderId) {
    return order;
  }

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const publicOrderId = await generatePublicOrderId({ session });

    try {
      if (typeof order.save === "function") {
        order.publicOrderId = publicOrderId;
        await order.save({ session });
        return order;
      }

      const updateQuery = Order.findOneAndUpdate(
        {
          _id: orderId,
          $or: [
            { publicOrderId: { $exists: false } },
            { publicOrderId: "" },
            { publicOrderId: null },
          ],
        },
        { $set: { publicOrderId } },
        { new: true, runValidators: true },
      ).lean({ virtuals: true });
      const updated = session ? await updateQuery.session(session) : await updateQuery;

      if (updated) {
        return updated;
      }

      const existingQuery = Order.findById(orderId).lean({ virtuals: true });
      const existing = session ? await existingQuery.session(session) : await existingQuery;
      return existing || order;
    } catch (error) {
      if (typeof order.set === "function") {
        order.set("publicOrderId", undefined, { strict: false });
      } else {
        delete order.publicOrderId;
      }

      if (isDuplicatePublicOrderIdError(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new ApiError(500, "Could not assign a unique order id");
};

export const ensureOrdersPublicIds = async (orders = []) => {
  const result = [];

  for (const order of orders) {
    try {
      result.push(await ensureOrderPublicId(order));
    } catch (error) {
      logger.warn("Failed to backfill public order id", {
        orderId: order?._id?.toString?.() || order?.id || "",
        message: error.message,
      });
      result.push(order);
    }
  }

  return result;
};
