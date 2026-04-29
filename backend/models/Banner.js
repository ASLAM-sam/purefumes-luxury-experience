import mongoose from "mongoose";

const normalizeText = (value = "") =>
  String(value)
    .trim()
    .replace(/\s+/g, " ");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Banner title is required"],
      trim: true,
      maxlength: [140, "Banner title cannot exceed 140 characters"],
    },
    subtitle: {
      type: String,
      trim: true,
      default: "",
      maxlength: [240, "Banner subtitle cannot exceed 240 characters"],
    },
    image: {
      type: String,
      required: [true, "Banner image is required"],
      trim: true,
      maxlength: [1000, "Banner image URL cannot exceed 1000 characters"],
    },
    buttonText: {
      type: String,
      trim: true,
      default: "",
      maxlength: [60, "Banner button text cannot exceed 60 characters"],
    },
    link: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Banner link cannot exceed 500 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      min: [0, "Banner order cannot be negative"],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

bannerSchema.pre("validate", function normalizeBanner(next) {
  this.title = normalizeText(this.title);
  this.subtitle = normalizeText(this.subtitle);
  this.image = String(this.image || "").trim();
  this.buttonText = normalizeText(this.buttonText);
  this.link = String(this.link || "").trim();

  next();
});

bannerSchema.virtual("id").get(function getId() {
  return this._id.toString();
});

bannerSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

bannerSchema.set("toObject", {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Banner", bannerSchema);
