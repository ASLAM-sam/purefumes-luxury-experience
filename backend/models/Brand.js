import mongoose from "mongoose";

export const BRAND_CATEGORIES = ["middle-eastern", "designer", "niche"];

export const formatBrandName = (value = "") =>
  String(value)
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const sanitizeBrandName = (value = "") =>
  String(value)
    .trim()
    .replace(/\s+/g, " ");

export const normalizeBrandName = (value = "") =>
  sanitizeBrandName(value).toLowerCase();

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand name is required"],
      trim: true,
      maxlength: [120, "Brand name cannot exceed 120 characters"],
      index: true,
    },
    normalizedName: {
      type: String,
      required: true,
      unique: true,
      index: true,
      select: false,
    },
    logo: {
      type: String,
      trim: true,
      maxlength: [1000, "Brand logo URL cannot exceed 1000 characters"],
      default: "",
    },
    category: {
      type: String,
      required: [true, "Brand category is required"],
      enum: BRAND_CATEGORIES,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

brandSchema.pre("validate", function normalizeBrand(next) {
  if (this.name) {
    this.name = formatBrandName(this.name);
    this.normalizedName = normalizeBrandName(this.name);
  }

  this.logo = String(this.logo || "").trim();

  next();
});

brandSchema.virtual("id").get(function getId() {
  return this._id.toString();
});

const normalizeBrandOutput = (_doc, ret) => {
  delete ret.__v;
  delete ret.normalizedName;
  return ret;
};

brandSchema.set("toJSON", {
  virtuals: true,
  transform: normalizeBrandOutput,
});

brandSchema.set("toObject", {
  virtuals: true,
  transform: normalizeBrandOutput,
});

export default mongoose.model("Brand", brandSchema);
