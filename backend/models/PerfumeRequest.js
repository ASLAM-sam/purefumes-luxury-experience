import mongoose from "mongoose";

export const PERFUME_REQUEST_STATUSES = [
  "new",
  "contacted",
  "sourced",
  "closed",
];
export const PERFUME_REQUEST_SIZE_OPTIONS = [
  "3ml",
  "6ml",
  "12ml",
  "30ml",
  "50ml",
  "100ml",
  "Other",
];
export const PERFUME_REQUEST_BUDGET_OPTIONS = [
  "Under ₹500",
  "₹500 - ₹1000",
  "₹1000 - ₹2000",
  "₹2000+",
  "Not sure",
];

const perfumeRequestSchema = new mongoose.Schema(
  {
    perfumeName: {
      type: String,
      required: [true, "Perfume name is required"],
      trim: true,
      maxlength: [180, "Perfume name cannot exceed 180 characters"],
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [120, "Customer name cannot exceed 120 characters"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: [25, "Phone number cannot exceed 25 characters"],
    },
    preferredSize: {
      type: String,
      trim: true,
      enum: ["", ...PERFUME_REQUEST_SIZE_OPTIONS],
      default: "",
    },
    budgetRange: {
      type: String,
      trim: true,
      enum: ["", ...PERFUME_REQUEST_BUDGET_OPTIONS],
      default: "",
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator(images) {
          return Array.isArray(images) && images.length <= 3;
        },
        message: "You can upload up to 3 images",
      },
    },
    status: {
      type: String,
      enum: PERFUME_REQUEST_STATUSES,
      default: "new",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

perfumeRequestSchema.index({ createdAt: -1 });
perfumeRequestSchema.index({ status: 1, createdAt: -1 });
perfumeRequestSchema.index({ phoneNumber: 1 });

perfumeRequestSchema.virtual("id").get(function getId() {
  return this._id.toString();
});

perfumeRequestSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("PerfumeRequest", perfumeRequestSchema);
