import mongoose from "mongoose";

const selectedVariantSchema = new mongoose.Schema(
  {
    size: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
    selectedVariant: {
      type: selectedVariantSchema,
      default: () => ({ size: "" }),
    },
    priceAtAddition: {
      type: Number,
      required: true,
      min: [0, "Price at addition cannot be negative"],
      default: 0,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    totalItems: {
      type: Number,
      min: 0,
      default: 0,
    },
    subtotal: {
      type: Number,
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      min: 0,
      default: 0,
    },
    finalTotal: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true },
);

cartSchema.index({ updatedAt: -1 });

cartSchema.pre("validate", function normalizeCart(next) {
  this.totalItems = Array.isArray(this.items)
    ? this.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
    : 0;
  this.subtotal = Number(this.subtotal || 0);
  this.discount = Number(this.discount || 0);
  this.finalTotal = Math.max(0, Number(this.finalTotal || this.subtotal - this.discount));
  next();
});

cartSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Cart", cartSchema);
