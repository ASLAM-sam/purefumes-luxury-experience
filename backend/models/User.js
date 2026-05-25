import mongoose from "mongoose";

export const USER_ROLES = ["user", "admin"];
export const LEGACY_ROLE_ALIASES = {
  "super-admin": "admin",
};

export const normalizeUserRole = (role) => {
  const normalized = LEGACY_ROLE_ALIASES[String(role || "").trim()] || String(role || "").trim();
  return USER_ROLES.includes(normalized) ? normalized : "user";
};

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
    sessionId: { type: String, trim: true, default: "", index: true },
    deviceId: { type: String, trim: true, default: "", index: true },
    deviceName: { type: String, trim: true, maxlength: 160, default: "" },
    ip: { type: String, trim: true, default: "" },
    lastIP: { type: String, trim: true, default: "" },
    userAgent: { type: String, trim: true, maxlength: 400, default: "" },
    expiresAt: { type: Date, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
    lastUsedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null },
    revokedReason: { type: String, trim: true, default: "" },
    replacedByTokenHash: { type: String, trim: true, default: "" },
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
    customerName: {
      type: String,
      trim: true,
      default: "",
      maxlength: [120, "Customer name cannot exceed 120 characters"],
    },
    mobileNumber: {
      type: String,
      trim: true,
      default: "",
      index: true,
      maxlength: [25, "Mobile number cannot exceed 25 characters"],
    },
    address: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Address cannot exceed 1000 characters"],
    },
    passwordHash: { type: String, select: false, default: "" },
    role: { type: String, enum: USER_ROLES, default: "user", index: true },
    profileImage: { type: String, trim: true, default: "" },
    addresses: { type: [addressSchema], default: [] },
    orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    totalOrders: { type: Number, min: 0, default: 0 },
    totalSpent: { type: Number, min: 0, default: 0 },
    lastOrderDate: { type: Date, default: null, index: true },
    loginHistory: { type: [loginHistorySchema], default: [] },
    loginAudit: { type: [loginHistorySchema], default: [] },
    lastLogin: { type: Date, default: null },
    lastIP: { type: String, trim: true, default: "" },
    refreshTokens: { type: [refreshTokenSchema], default: [], select: false },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    emailVerified: { type: Boolean, default: false, index: true },
    passwordResetToken: { type: String, select: false, default: "" },
    passwordResetExpiry: { type: Date, select: false, default: null },
    emailVerificationToken: { type: String, select: false, default: "" },
    emailVerificationExpiry: { type: Date, select: false, default: null },
    failedLoginAttempts: { type: Number, default: 0, select: false },
    accountLockedUntil: { type: Date, default: null, select: false },
    failedAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, default: null, select: false },
    isBanned: { type: Boolean, default: false, index: true },
    bannedAt: { type: Date, default: null },
    isTestData: { type: Boolean, default: false, index: true },
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
userSchema.index({ email: 1, role: 1 });
userSchema.index({ mobile: 1, role: 1 });
userSchema.index({ mobileNumber: 1, role: 1 });

userSchema.virtual("id").get(function getId() {
  return this._id.toString();
});

userSchema.pre("validate", function normalizeUser(next) {
  this.email = String(this.email || "").trim().toLowerCase();
  this.role = normalizeUserRole(this.role);
  const normalizedUsername = String(this.username || "").trim();
  this.username = normalizedUsername || undefined;
  const normalizedMobile = String(this.mobile || this.mobileNumber || "").trim();
  this.mobile = normalizedMobile || undefined;
  this.mobileNumber = normalizedMobile;
  this.name = String(this.name || "").trim();
  this.customerName = String(this.customerName || this.name || "").trim();
  if (!this.name) {
    this.name = this.customerName;
  }
  this.lastIP = String(this.lastIP || "").trim();
  const primaryAddress = this.addresses?.find?.((address) => address?.isDefault) || this.addresses?.[0];
  const normalizedAddress = String(
    this.address ||
      [
        primaryAddress?.line1,
        primaryAddress?.line2,
        primaryAddress?.city,
        primaryAddress?.state,
        primaryAddress?.postalCode,
        primaryAddress?.country,
      ]
        .filter(Boolean)
        .join(", "),
  ).trim();
  this.address = normalizedAddress;
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
