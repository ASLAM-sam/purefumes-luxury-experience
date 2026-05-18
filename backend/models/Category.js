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

export const normalizeCategoryColor = (value = "") => {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return "#8b5f3d";
  }

  const withHash = normalized.startsWith("#") ? normalized : `#${normalized}`;
  return /^#[0-9a-fA-F]{6}$/.test(withHash) ? withHash.toLowerCase() : "#8b5f3d";
};

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [80, "Category name cannot exceed 80 characters"],
    },
    normalizedName: {
      type: String,
      required: true,
      select: false,
    },
    slug: {
      type: String,
      required: [true, "Category slug is required"],
      trim: true,
      lowercase: true,
      maxlength: [120, "Category slug cannot exceed 120 characters"],
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
    icon: {
      type: String,
      trim: true,
      maxlength: [120, "Category icon cannot exceed 120 characters"],
      default: "",
    },
    color: {
      type: String,
      trim: true,
      maxlength: [7, "Category color must be a valid hex color"],
      default: "#8b5f3d",
    },
    sortOrder: {
      type: Number,
      min: [0, "sortOrder cannot be negative"],
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    featured: {
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

categorySchema.index(
  { normalizedName: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
);

categorySchema.index(
  { slug: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
);

categorySchema.index({ isDeleted: 1, isActive: 1, featured: 1, sortOrder: 1, name: 1 });

categorySchema.pre("validate", function normalizeCategory(next) {
  if (this.name) {
    this.name = normalizeCategoryName(this.name);
    this.normalizedName = createCategoryLookupKey(this.name);
  }

  this.slug = createCategorySlug(this.slug || this.name || "");
  this.description = String(this.description || "").trim();
  this.image = String(this.image || "").trim();
  this.icon = String(this.icon || "").trim();
  this.color = normalizeCategoryColor(this.color);

  next();
});

categorySchema.virtual("id").get(function getId() {
  return this._id.toString();
});

categorySchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    delete ret.normalizedName;
    return ret;
  },
});

export default mongoose.model("Category", categorySchema);
