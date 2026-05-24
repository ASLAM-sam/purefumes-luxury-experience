import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },
    revenue: { type: Number, default: 0 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    isTestData: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

analyticsEventSchema.index({ type: 1, createdAt: -1 });
analyticsEventSchema.index({ userId: 1, type: 1, createdAt: -1 });
analyticsEventSchema.index({ createdAt: -1 });
analyticsEventSchema.index({ isTestData: 1, createdAt: -1 });

export default mongoose.model("AnalyticsEvent", analyticsEventSchema);
