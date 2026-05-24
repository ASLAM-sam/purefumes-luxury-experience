import mongoose from "mongoose";

const stripDiacritics = (value = "") =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");

export const createCategorySlug = (value = "") =>
  stripDiacritics(value)
    .toString()
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export const createCategoryLookupKey = (value = "") =>
  stripDiacritics(value)
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

export const normalizeCategoryName = (value = "") =>
  createCategoryLookupKey(value)
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [80, "Category name cannot exceed 80 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Category description cannot exceed 2000 characters"],
      default: "",
    },
    image: {
      type: String,
      trim: true,
      maxlength: [1000, "Category image URL cannot exceed 1000 characters"],
      default: "",
    },
  },
  {
    strictQuery: false,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

categorySchema.index({ name: 1 });

categorySchema.pre("validate", function normalizeCategory(next) {
  if (this.name) {
    this.name = normalizeCategoryName(this.name);
  }

  this.description = String(this.description || "").trim();
  this.image = String(this.image || "").trim();

  next();
});

categorySchema.virtual("id").get(function getId() {
  return this._id.toString();
});

categorySchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Category", categorySchema);
