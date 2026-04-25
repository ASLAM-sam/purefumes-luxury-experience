import mongoose from "mongoose";

export const ORDER_STATUSES = ["Pending", "Shipped", "Delivered"];

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
    size: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
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
    isSeen: {
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
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ isSeen: 1, createdAt: -1 });

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
    this.price = this.price || firstItem.price || this.totalAmount || 0;
  }

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
