import mongoose from "mongoose";
import Order from "../models/Order.js";
import {
  ensureOrderPublicId,
  ensureOrdersPublicIds,
} from "../services/orders/publicOrderIdService.js";

const buildOrder = (overrides = {}) => {
  const productId = new mongoose.Types.ObjectId();

  return {
    customerName: "Test Customer",
    phone: "+919999999999",
    address: "Hyderabad",
    items: [
      {
        productId,
        productName: "Test Perfume",
        quantity: 1,
        price: 999,
      },
    ],
    totalAmount: 999,
    subtotalAmount: 999,
    paymentStatus: "paid",
    paymentGateway: "test-mode",
    paymentId: `TEST_PAYMENT_${Date.now()}_${Math.random()}`,
    paymentOrderId: `TEST_ORDER_${Date.now()}_${Math.random()}`,
    isTestData: true,
    ...overrides,
  };
};

describe("Public order ids", () => {
  it("assigns unique six digit public order ids to existing orders", async () => {
    const created = await Order.create([buildOrder(), buildOrder()]);
    const leanOrders = await Order.find({
      _id: { $in: created.map((order) => order._id) },
    }).lean({ virtuals: true });

    const orders = await ensureOrdersPublicIds(leanOrders);
    const ids = orders.map((order) => order.publicOrderId);

    expect(ids).toHaveLength(2);
    expect(ids[0]).toMatch(/^\d{6}$/);
    expect(ids[1]).toMatch(/^\d{6}$/);
    expect(ids[0]).not.toBe(ids[1]);

    const saved = await Order.find({ _id: { $in: created.map((order) => order._id) } }).lean();
    expect(saved.every((order) => /^\d{6}$/.test(order.publicOrderId))).toBe(true);
  });

  it("keeps an existing public order id unchanged", async () => {
    const order = await Order.create(buildOrder({ publicOrderId: "482731" }));

    const updated = await ensureOrderPublicId(order);

    expect(updated.publicOrderId).toBe("482731");
  });
});
