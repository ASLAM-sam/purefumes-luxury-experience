import mongoose from "mongoose";

export const PRODUCT_CATEGORIES = ["Middle Eastern", "Designer", "Niche"];
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
    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: PRODUCT_CATEGORIES,
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
    },
    image: {
      type: String,
      trim: true,
      maxlength: [1000, "Image URL cannot exceed 1000 characters"],
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
          trim: true,
          maxlength: [1000, "Image URL cannot exceed 1000 characters"],
        },
      ],
      required: [true, "Exactly 3 images required"],
      validate: {
        validator(images) {
          return Array.isArray(images) && images.filter(Boolean).length === 3;
        },
        message: "Exactly 3 images required",
      },
    },

    // Optional fragrance metadata used by the storefront. All values are persisted in MongoDB.
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
    originalPrice: { type: Number, min: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.index({ name: "text", brand: "text", description: "text" });
productSchema.index({ category: 1, brand: 1 });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ stock: 1 });

productSchema.virtual("id").get(function getId() {
  return this._id.toString();
});

productSchema.pre("validate", function normalizeProduct(next) {
  if (
    (!this.price || this.price === 0) &&
    this.sizes?.length &&
    this.sizes[0].price
  ) {
    this.price = this.sizes[0].price;
  }

  const images = Array.isArray(this.images)
    ? this.images.map((image) => String(image).trim()).filter(Boolean)
    : [];

  this.images = [...new Set(images)];
  this.image = this.images[0] || String(this.image || "").trim();

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

  ret.image = primaryImage;
  ret.images = [...new Set(images)];
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
