import mongoose from "mongoose";
import { addMoney, multiplyMoney, normalizeMoney } from "../utils/money.js";

export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];
export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: "",
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    priceAtPurchase: {
      type: Number,
      min: [0, "Price at purchase cannot be negative"],
      default: undefined,
    },
    productImage: {
      type: String,
      trim: true,
      default: "",
    },
    size: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
    publicOrderId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
      validate: {
        validator(value) {
          return !value || /^\d{6}$/.test(value);
        },
        message: "Public order id must be exactly 6 digits",
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      index: true,
    },
    mobile: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [120, "Customer name cannot exceed 120 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: [25, "Phone number cannot exceed 25 characters"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [1000, "Address cannot exceed 1000 characters"],
    },
    shippingAddress: {
      fullName: { type: String, trim: true, default: "" },
      mobile: { type: String, trim: true, default: "" },
      line1: { type: String, trim: true, default: "" },
      line2: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "" },
      state: { type: String, trim: true, default: "" },
      postalCode: { type: String, trim: true, default: "" },
      country: { type: String, trim: true, default: "India" },
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      index: true,
    },
    productName: {
      type: String,
      trim: true,
      default: "",
    },
    brand: {
      type: String,
      trim: true,
      default: "",
    },
    size: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
      default: 0,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator(items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: "At least one order item is required",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
    },
    subtotalAmount: {
      type: Number,
      required: true,
      min: [0, "Subtotal amount cannot be negative"],
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, "Discount amount cannot be negative"],
    },
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },
    paymentId: {
      type: String,
      trim: true,
      default: "",
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: "",
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "pending",
      index: true,
    },
    paymentGateway: {
      type: String,
      trim: true,
      default: "",
    },
    paymentOrderId: {
      type: String,
      trim: true,
      default: "",
    },
    paymentSignature: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "Pending",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ORDER_STATUSES,
      default: "Pending",
      index: true,
    },
    trackingId: {
      type: String,
      trim: true,
      default: "",
    },
    deliveryDate: {
      type: Date,
      default: null,
    },
    isSeen: {
      type: Boolean,
      default: false,
      index: true,
    },
    isTestData: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ phone: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ email: 1, createdAt: -1 });
orderSchema.index({ mobile: 1, createdAt: -1 });
orderSchema.index({ phone: 1, createdAt: -1 });
orderSchema.index({ userId: 1, status: 1, paymentStatus: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });
orderSchema.index({ isSeen: 1, createdAt: -1 });
orderSchema.index({ "items.productId": 1, createdAt: -1 });
orderSchema.index(
  { paymentGateway: 1, paymentId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      paymentGateway: "Razorpay",
      paymentId: { $type: "string", $gt: "" },
    },
  },
);
orderSchema.index(
  { paymentGateway: 1, paymentOrderId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      paymentGateway: "Razorpay",
      paymentOrderId: { $type: "string", $gt: "" },
    },
  },
);

orderSchema.virtual("id").get(function getId() {
  return this._id.toString();
});

orderSchema.virtual("productId").get(function getPrimaryProductId() {
  return (
    this.product?.toString() || this.items?.[0]?.productId?.toString() || ""
  );
});

orderSchema.pre("validate", function normalizeOrder(next) {
  const firstItem = this.items?.[0];

  if (firstItem) {
    this.product = this.product || firstItem.productId;
    this.productName = this.productName || firstItem.productName || "";
    this.brand = this.brand || firstItem.brand || "";
    this.size = this.size || firstItem.size || "";
    this.price = normalizeMoney(
      this.price ?? firstItem.price ?? this.totalAmount ?? 0,
    );
  }

  this.email = String(this.email || "")
    .trim()
    .toLowerCase();
  this.mobile = String(this.mobile || this.phone || "").trim();
  this.orderStatus = this.orderStatus || this.status || "Pending";
  this.status = this.status || this.orderStatus || "Pending";
  this.paymentStatus =
    this.paymentStatus || (this.paymentId ? "paid" : "pending");
  if (this.paymentStatus === "paid" && this.status === "Pending") {
    this.status = "Confirmed";
    this.orderStatus = "Confirmed";
  }
  this.items = Array.isArray(this.items)
    ? this.items.map((item) => {
        item.price = normalizeMoney(item.price);
        item.priceAtPurchase =
          item.priceAtPurchase === undefined
            ? undefined
            : normalizeMoney(item.priceAtPurchase);
        return item;
      })
    : this.items;
  this.subtotalAmount = normalizeMoney(
    this.subtotalAmount ??
      (Array.isArray(this.items)
        ? addMoney(
            ...this.items.map((item) =>
              multiplyMoney(item.price, item.quantity),
            ),
          )
        : (this.totalAmount ?? 0)),
  );
  this.discountAmount = normalizeMoney(this.discountAmount ?? 0);
  this.totalAmount = normalizeMoney(
    this.totalAmount ?? this.subtotalAmount - this.discountAmount,
  );
  this.couponCode = String(this.couponCode || "")
    .trim()
    .toUpperCase();

  next();
});

orderSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Order", orderSchema);
