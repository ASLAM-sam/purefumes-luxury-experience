import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
  {
    to: { type: String, trim: true, required: true, index: true },
    subject: { type: String, trim: true, required: true },
    template: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["queued", "sent", "failed"],
      default: "queued",
      index: true,
    },
    providerMessageId: { type: String, trim: true, default: "" },
    error: { type: String, trim: true, default: "" },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true },
);

emailLogSchema.index({ createdAt: -1 });

export default mongoose.model("EmailLog", emailLogSchema);
