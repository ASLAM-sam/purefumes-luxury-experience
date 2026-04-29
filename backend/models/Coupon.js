import mongoose from "mongoose";

export const COUPON_DISCOUNT_TYPES = ["percentage", "fixed"];

const normalizeCouponCode = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [60, "Coupon code cannot exceed 60 characters"],
      set: normalizeCouponCode,
    },
    discountType: {
      type: String,
      enum: COUPON_DISCOUNT_TYPES,
      required: [true, "Discount type is required"],
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value cannot be negative"],
      validate: {
        validator(value) {
          if (this.discountType !== "percentage") {
            return value > 0;
          }

          return value > 0 && value <= 100;
        },
        message:
          "Percentage discounts must be between 0 and 100 and fixed discounts must be greater than 0",
      },
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum order amount cannot be negative"],
    },
    maxDiscount: {
      type: Number,
      min: [0, "Maximum discount cannot be negative"],
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ isActive: 1, expiryDate: 1 });

couponSchema.virtual("id").get(function getId() {
  return this._id.toString();
});

couponSchema.pre("validate", function normalizeCoupon(next) {
  if (this.code) {
    this.code = normalizeCouponCode(this.code);
  }

  if (this.discountType !== "percentage") {
    this.maxDiscount = this.maxDiscount ?? null;
  }

  next();
});

couponSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Coupon", couponSchema);
