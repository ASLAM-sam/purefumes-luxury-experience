import mongoose from "mongoose";

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
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Brand category is required"],
      index: true,
    },
    categoryName: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    categorySlug: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      index: true,
    },
    category: {
      type: String,
      trim: true,
      index: true,
      default: "",
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
  this.category = String(this.category || this.categorySlug || this.categoryName || "")
    .trim()
    .toLowerCase();
  this.categorySlug = String(this.categorySlug || this.category)
    .trim()
    .toLowerCase();
  this.categoryName = String(this.categoryName || "").trim();

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
