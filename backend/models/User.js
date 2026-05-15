import mongoose from "mongoose";

export const USER_ROLES = ["user", "admin"];

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, maxlength: 80, default: "Home" },
    fullName: { type: String, trim: true, maxlength: 120, default: "" },
    mobile: { type: String, trim: true, maxlength: 25, default: "" },
    line1: { type: String, trim: true, maxlength: 240, default: "" },
    line2: { type: String, trim: true, maxlength: 240, default: "" },
    city: { type: String, trim: true, maxlength: 100, default: "Hyderabad" },
    state: { type: String, trim: true, maxlength: 100, default: "Telangana" },
    postalCode: { type: String, trim: true, maxlength: 20, default: "" },
    country: { type: String, trim: true, maxlength: 80, default: "India" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true },
);

const loginHistorySchema = new mongoose.Schema(
  {
    ip: { type: String, trim: true, default: "" },
    userAgent: { type: String, trim: true, maxlength: 400, default: "" },
    device: { type: String, trim: true, maxlength: 160, default: "" },
    loggedInAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, index: true },
    family: { type: String, trim: true, default: "" },
    ip: { type: String, trim: true, default: "" },
    userAgent: { type: String, trim: true, maxlength: 400, default: "" },
    expiresAt: { type: Date, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
    lastUsedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [120, "Full name cannot exceed 120 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      maxlength: [180, "Email cannot exceed 180 characters"],
    },
    username: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
      validate: {
        validator(value) {
          if (!value || this.role === "admin") return true;
          if (!this.isNew && !this.isModified("username")) return true;
          return /^[a-z0-9]{1,6}$/.test(value);
        },
        message: "Username must be 1-6 characters using lowercase letters or numbers only",
      },
    },
    mobile: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
      maxlength: [25, "Mobile number cannot exceed 25 characters"],
    },
    passwordHash: { type: String, select: false, default: "" },
    googleId: { type: String, trim: true, unique: true, sparse: true, index: true },
    role: { type: String, enum: USER_ROLES, default: "user", index: true },
    profileImage: { type: String, trim: true, default: "" },
    addresses: { type: [addressSchema], default: [] },
    orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    totalOrders: { type: Number, min: 0, default: 0 },
    totalSpent: { type: Number, min: 0, default: 0 },
    loginHistory: { type: [loginHistorySchema], default: [] },
    lastLogin: { type: Date, default: null },
    refreshTokens: { type: [refreshTokenSchema], default: [], select: false },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    emailVerified: { type: Boolean, default: false, index: true },
    passwordResetToken: { type: String, select: false, default: "" },
    passwordResetExpiry: { type: Date, select: false, default: null },
    emailVerificationToken: { type: String, select: false, default: "" },
    emailVerificationExpiry: { type: Date, select: false, default: null },
    failedLoginAttempts: { type: Number, default: 0, select: false },
    accountLockedUntil: { type: Date, default: null, select: false },
    isBanned: { type: Boolean, default: false, index: true },
    bannedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ lastLogin: -1 });
userSchema.index({ totalSpent: -1 });

userSchema.virtual("id").get(function getId() {
  return this._id.toString();
});

userSchema.pre("validate", function normalizeUser(next) {
  this.email = String(this.email || "").trim().toLowerCase();
  const normalizedUsername = String(this.username || "").trim();
  this.username = normalizedUsername || undefined;
  const normalizedMobile = String(this.mobile || "").trim();
  this.mobile = normalizedMobile || undefined;
  this.name = String(this.name || "").trim();
  next();
});

userSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    delete ret.passwordHash;
    delete ret.refreshTokens;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpiry;
    delete ret.emailVerificationToken;
    delete ret.emailVerificationExpiry;
    delete ret.failedLoginAttempts;
    delete ret.accountLockedUntil;
    delete ret.username;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
