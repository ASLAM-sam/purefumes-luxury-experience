import mongoose from "mongoose";

export const PRODUCT_USAGES = ["Day", "Night", "Day & Night"];
export const PRODUCT_SEASONS = ["Spring", "Summer", "Autumn", "Winter"];
export const PRODUCT_BEST_TIMES = ["Morning", "Day", "Evening", "Night"];

const sizeSchema = new mongoose.Schema(
  {
    size: { type: String, trim: true },
    price: { type: Number, min: 0, default: 0 },
  },
  { _id: false },
);

const accordSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Accord name is required"],
      trim: true,
      maxlength: [80, "Accord name cannot exceed 80 characters"],
    },
    percentage: {
      type: Number,
      required: [true, "Accord percentage is required"],
      min: [0, "Accord percentage cannot be negative"],
      max: [100, "Accord percentage cannot exceed 100"],
    },
  },
  { _id: false },
);

const normalizeStringList = (value) => {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => String(item || "").split(","))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeObjectIdList = (value) => {
  const items = Array.isArray(value) ? value : value ? [value] : [];

  return items
    .map((item) => {
      const raw = item?._id || item?.id || item;
      if (!raw) return null;
      const stringValue = String(raw).trim();
      return mongoose.Types.ObjectId.isValid(stringValue)
        ? new mongoose.Types.ObjectId(stringValue)
        : null;
    })
    .filter(Boolean)
    .filter((item, index, array) => array.findIndex((entry) => String(entry) === String(item)) === index);
};

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [160, "Product name cannot exceed 160 characters"],
      index: true,
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [120, "Brand cannot exceed 120 characters"],
      index: true,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      default: null,
      index: true,
    },
    categories: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
      ],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one category is required",
      },
      default: [],
      index: true,
    },
    primaryCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    categoryNames: {
      type: [String],
      default: [],
      index: true,
    },
    categorySlugs: {
      type: [String],
      default: [],
      index: true,
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
      default: 0,
      index: true,
    },
    stock: {
      type: Number,
      min: [0, "Stock cannot be negative"],
      default: 0,
      index: true,
    },
    image: {
      type: String,
      trim: true,
      maxlength: [1000, "Image path cannot exceed 1000 characters"],
      default: "",
    },
    description: {
      type: String,
      trim: true,
      maxlength: [4000, "Description cannot exceed 4000 characters"],
      default: "",
    },
    images: {
      type: [
        {
          type: String,
          required: [true, "Product image is required"],
          trim: true,
          maxlength: [1000, "Image path cannot exceed 1000 characters"],
        },
      ],
      default: [],
      validate: {
        validator(images) {
          const total = Array.isArray(images) ? images.filter(Boolean).length : 0;
          return total >= 1 && total <= 5;
        },
        message: "Products must have between 1 and 5 images",
      },
    },
    videoUrl: {
      type: String,
      trim: true,
      maxlength: [1000, "Video URL cannot exceed 1000 characters"],
      default: "",
      validate: {
        validator(value) {
          return !value || /\.(mp4|webm|mov)(\?.*)?$/i.test(value);
        },
        message: "Video URL must point to an mp4, webm, or mov file",
      },
    },
    gender: {
      type: String,
      trim: true,
      maxlength: [40, "Gender label cannot exceed 40 characters"],
      default: "",
    },
    notes: { type: [String], default: [] },
    topNotes: { type: [String], default: [] },
    middleNotes: { type: [String], default: [] },
    baseNotes: { type: [String], default: [] },
    accords: { type: [accordSchema], default: [] },
    longevity: { type: String, trim: true, default: "" },
    sillage: { type: String, trim: true, default: "" },
    usage: { type: String, enum: PRODUCT_USAGES, default: "Day & Night" },
    timeOfDay: { type: String, trim: true, default: "" },
    bestTime: {
      type: [String],
      enum: PRODUCT_BEST_TIMES,
      default: [],
    },
    season: { type: [String], default: [] },
    seasons: [{ type: String, trim: true }],
    sizes: { type: [sizeSchema], default: [] },
    originalPrice: { type: Number, min: 0, default: 0 },
    isBestseller: {
      type: Boolean,
      default: false,
      index: true,
    },
    isLatest: {
      type: Boolean,
      default: false,
      index: true,
    },
    bestsellerOrder: {
      type: Number,
      min: [0, "Bestseller order cannot be negative"],
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.index({ name: "text", brand: "text", description: "text" });
productSchema.index({ createdAt: -1 });
productSchema.index({ brand: 1, categoryNames: 1 });
productSchema.index({ brandId: 1, categories: 1 });
productSchema.index({ categorySlugs: 1, price: 1 });
productSchema.index({ primaryCategory: 1, price: 1 });
productSchema.index({ isBestseller: 1, bestsellerOrder: 1, updatedAt: -1 });
productSchema.index({ isLatest: 1, createdAt: -1 });

productSchema.virtual("id").get(function getId() {
  return this._id.toString();
});

productSchema.pre("validate", function normalizeProduct(next) {
  if ((!this.price || this.price === 0) && this.sizes?.length && this.sizes[0].price) {
    this.price = this.sizes[0].price;
  }

  const images = Array.isArray(this.images)
    ? this.images.map((image) => String(image).trim()).filter(Boolean)
    : [];
  const legacyImage = String(this.image || "").trim();

  this.images = [...new Set(images.length ? images : legacyImage ? [legacyImage] : [])];
  this.image = this.images[0] || "";
  this.videoUrl = String(this.videoUrl || "").trim();
  this.gender = String(this.gender || "").trim();
  this.categoryNames = [...new Set(normalizeStringList(this.categoryNames))];
  this.categorySlugs = [...new Set(normalizeStringList(this.categorySlugs).map((slug) => slug.toLowerCase()))];
  this.categories = normalizeObjectIdList(this.categories);

  if (!this.primaryCategory && this.categories.length > 0) {
    this.primaryCategory = this.categories[0];
  }

  if (this.primaryCategory) {
    const primaryCategoryValue = String(this.primaryCategory);
    const hasPrimaryCategory = this.categories.some(
      (categoryId) => String(categoryId) === primaryCategoryValue,
    );

    if (!hasPrimaryCategory) {
      this.categories = [this.primaryCategory, ...this.categories];
    } else {
      this.categories = [
        this.primaryCategory,
        ...this.categories.filter((categoryId) => String(categoryId) !== primaryCategoryValue),
      ];
    }
  }

  this.topNotes = normalizeStringList(this.topNotes);
  this.middleNotes = normalizeStringList(this.middleNotes);
  this.baseNotes = normalizeStringList(this.baseNotes);
  this.notes = normalizeStringList(this.notes);

  if (Array.isArray(this.accords) && this.accords.length) {
    this.accords = this.accords.map((accord) => ({
      name: String(accord.name || "").trim(),
      percentage: Number(accord.percentage),
    }));

    const total = this.accords.reduce(
      (sum, accord) => sum + Number(accord.percentage || 0),
      0,
    );

    if (Math.round(total * 100) !== 10000) {
      this.invalidate("accords", "Total accord percentage must equal 100");
    }
  }

  if (!this.notes?.length) {
    this.notes = [
      ...(this.topNotes || []),
      ...(this.middleNotes || []),
      ...(this.baseNotes || []),
    ].filter(Boolean);
  }

  if (!this.seasons?.length && this.season?.length) {
    this.seasons = this.season;
  }

  if (!this.season?.length && this.seasons?.length) {
    this.season = this.seasons;
  }

  if (!this.timeOfDay && this.usage) {
    this.timeOfDay = this.usage;
  }

  if (Array.isArray(this.bestTime)) {
    this.bestTime = this.bestTime
      .map((time) => String(time).trim())
      .filter((time, index, times) => time && times.indexOf(time) === index);
  }

  next();
});

const normalizeProductOutput = (_doc, ret) => {
  const images = Array.isArray(ret.images) ? ret.images.filter(Boolean) : [];
  const primaryImage = images[0] || ret.image || "";
  const normalizedImages = images.length ? images : primaryImage ? [primaryImage] : [];
  const categoryIds = Array.isArray(ret.categories)
    ? ret.categories.map((category) => {
        if (!category) return null;
        if (typeof category === "object" && category !== null && category._id) {
          return category._id.toString?.() || String(category._id);
        }
        return category.toString?.() || String(category);
      }).filter(Boolean)
    : [];
  const primaryCategoryId =
    ret.primaryCategory && typeof ret.primaryCategory === "object" && ret.primaryCategory._id
      ? ret.primaryCategory._id.toString?.() || String(ret.primaryCategory._id)
      : ret.primaryCategory
        ? ret.primaryCategory.toString?.() || String(ret.primaryCategory)
        : categoryIds[0] || null;

  ret.image = primaryImage;
  ret.images = [...new Set(normalizedImages)];
  ret.categories = Array.isArray(ret.categories) ? ret.categories : categoryIds;
  ret.categoryIds = categoryIds;
  ret.primaryCategory = primaryCategoryId;
  ret.categoryId = primaryCategoryId;
  ret.category = Array.isArray(ret.categoryNames) ? ret.categoryNames[0] || "" : "";
  ret.categorySlug = Array.isArray(ret.categorySlugs) ? ret.categorySlugs[0] || "" : "";
  ret.notes =
    Array.isArray(ret.notes) && ret.notes.length
      ? ret.notes
      : [
          ...(Array.isArray(ret.topNotes) ? ret.topNotes : []),
          ...(Array.isArray(ret.middleNotes) ? ret.middleNotes : []),
          ...(Array.isArray(ret.baseNotes) ? ret.baseNotes : []),
        ].filter(Boolean);
  ret.season =
    Array.isArray(ret.season) && ret.season.length
      ? ret.season
      : ret.seasons || [];
  ret.seasons =
    Array.isArray(ret.seasons) && ret.seasons.length
      ? ret.seasons
      : ret.season || [];
  ret.timeOfDay = ret.timeOfDay || ret.usage || "";
  ret.bestTime = Array.isArray(ret.bestTime) ? ret.bestTime : [];
  ret.videoUrl = String(ret.videoUrl || "");
  ret.isLatest = Boolean(ret.isLatest);
  delete ret.__v;
  return ret;
};

productSchema.set("toJSON", {
  virtuals: true,
  transform: normalizeProductOutput,
});

productSchema.set("toObject", {
  virtuals: true,
  transform: normalizeProductOutput,
});

export default mongoose.model("Product", productSchema);
