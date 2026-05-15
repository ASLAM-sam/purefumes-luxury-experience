import mongoose from "mongoose";

const createSlug = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      maxlength: [80, "Category name cannot exceed 80 characters"],
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

categorySchema.pre("validate", function setSlug(next) {
  if (this.name && !this.slug) {
    this.slug = createSlug(this.name);
  }
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
