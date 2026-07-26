import mongoose from "mongoose";

export const BACK_IN_STOCK_NOTIFICATION_STATUSES = [
  "pending",
  "queued",
  "sent",
  "failed",
  "cancelled",
];

const backInStockNotificationSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    productName: {
      type: String,
      trim: true,
      required: true,
      maxlength: 160,
    },
    productSlug: {
      type: String,
      trim: true,
      default: "",
      maxlength: 220,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      maxlength: 254,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      required: true,
      maxlength: 20,
    },
    status: {
      type: String,
      enum: BACK_IN_STOCK_NOTIFICATION_STATUSES,
      default: "pending",
      index: true,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    lastAttemptAt: {
      type: Date,
      default: null,
    },
    emailJobId: {
      type: String,
      trim: true,
      default: "",
    },
    ipAddress: {
      type: String,
      trim: true,
      default: "",
      maxlength: 120,
    },
    userAgent: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
  },
  {
    collection: "backInStockNotifications",
    timestamps: true,
  },
);

backInStockNotificationSchema.index(
  { productId: 1, email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "queued"] },
    },
  },
);
backInStockNotificationSchema.index({ productId: 1, email: 1, status: 1 });
backInStockNotificationSchema.index({ status: 1, createdAt: -1 });
backInStockNotificationSchema.index({ productId: 1, status: 1, createdAt: -1 });
backInStockNotificationSchema.index({ email: 1, createdAt: -1 });
backInStockNotificationSchema.index({
  productName: "text",
  email: "text",
  phone: "text",
});

backInStockNotificationSchema.virtual("id").get(function getId() {
  return this._id.toString();
});

export default mongoose.model(
  "BackInStockNotification",
  backInStockNotificationSchema,
);
