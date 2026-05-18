import mongoose from "mongoose";

const appSettingsSchema = new mongoose.Schema(
  {
    paymentMode: {
      type: String,
      enum: ["live", "test"],
      default: "live",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("AppSettings", appSettingsSchema);
