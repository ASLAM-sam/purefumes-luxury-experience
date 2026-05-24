import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import env from "../../config/env.js";
import logger from "../../config/logger.js";
import { captureMessage } from "../../config/sentry.js";
import User, { normalizeUserRole } from "../../models/User.js";
import { ApiError } from "../../middlewares/errorMiddleware.js";
import { clearAuthCookies, getCookieOptions, setCsrfCookie } from "../../middlewares/securityMiddleware.js";
import { createRandomToken, hashToken } from "../../utils/crypto.js";
import { minutesFromNow, parseDurationToMs } from "../../utils/time.js";
import { addEmailJob } from "../../queues/emailQueue.js";
import {
  createUser,
  findUserByEmail,
  findUserByIdentifier,
  findUserByMobile,
  findUserByUsername,
} from "../../repositories/userRepository.js";

const ACCESS_COOKIE = "token";
const REFRESH_COOKIE = "refreshToken";
const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;
const REFRESH_RACE_GRACE_MS = 10 * 1000;

export const passwordRules =
  /^.{6,}$/;
export const passwordValidationMessage = "Password must be at least 6 characters";
export const usernameRules = /^[a-z0-9]{1,6}$/;
export const usernameValidationMessage =
  "Username must be 1-6 characters using lowercase letters or numbers only";

export const serializeUser = (user) => {
  const raw =
    typeof user?.toObject === "function" ? user.toObject({ virtuals: true }) : user;

  if (!raw) return null;

  return {
    id: raw.id || raw._id?.toString?.() || String(raw._id),
    name: raw.name,
    email: raw.email,
    username: raw.username || "",
    mobile: raw.mobile || "",
    role: normalizeUserRole(raw.role),
    profileImage: raw.profileImage || "",
    addresses: raw.addresses || [],
    totalOrders: raw.totalOrders || 0,
    totalSpent: raw.totalSpent || 0,
    emailVerified: Boolean(raw.emailVerified),
    isBanned: Boolean(raw.isBanned),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

const getClientInfo = (req) => ({
  ip: req.ip || req.headers["x-forwarded-for"] || "",
  userAgent: String(req.get("user-agent") || "").slice(0, 400),
});

const revokeRefreshFamily = (user, family) => {
  if (!family) return;

  user.refreshTokens = (user.refreshTokens || []).map((stored) => {
    if (stored.family !== family) {
      return stored;
    }

    const plain = typeof stored.toObject === "function" ? stored.toObject() : stored;
    return {
      ...plain,
      revokedAt: plain.revokedAt || new Date(),
      lastUsedAt: new Date(),
    };
  });
};

const buildFrontendUrl = (path, params = {}) => {
  const url = new URL(path, env.FRONTEND_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};

const signAccessToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: normalizeUserRole(user.role),
      type: "access",
    },
    env.JWT_SECRET,
    { algorithm: "HS256", expiresIn: env.JWT_EXPIRE },
  );

const signRefreshToken = ({ user, family }) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      role: normalizeUserRole(user.role),
      type: "refresh",
      family,
      jti: createRandomToken(12),
    },
    env.REFRESH_SECRET,
    { algorithm: "HS256", expiresIn: env.REFRESH_EXPIRE },
  );

const getRefreshTokenExpiresAt = () =>
  new Date(Date.now() + parseDurationToMs(env.REFRESH_EXPIRE, 30 * 86400000));

const buildRefreshTokenRecord = ({ token, family, req, now = new Date() }) => {
  const { ip, userAgent } = getClientInfo(req);

  return {
    tokenHash: hashToken(token),
    family,
    ip,
    userAgent,
    expiresAt: getRefreshTokenExpiresAt(),
    createdAt: now,
    lastUsedAt: now,
  };
};

const addRefreshToken = async ({ user, token, family, req }) => {
  user.refreshTokens = (user.refreshTokens || []).filter(
    (stored) => !stored.revokedAt && stored.expiresAt > new Date(),
  );
  user.refreshTokens.push(buildRefreshTokenRecord({ token, family, req }));

  await user.save();
};

const setSessionCookies = ({ res, accessToken, refreshToken }) => {
  res.cookie(
    ACCESS_COOKIE,
    accessToken,
    getCookieOptions({
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }),
  );
  res.clearCookie("accessToken", getCookieOptions());
  res.cookie(
    REFRESH_COOKIE,
    refreshToken,
    getCookieOptions({
      maxAge: 30 * 24 * 60 * 60 * 1000,
    }),
  );
  setCsrfCookie(res);
};

const issueTokens = async ({ user, req, res, family = createRandomToken(12) }) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken({ user, family });

  await addRefreshToken({ user, token: refreshToken, family, req });
  setSessionCookies({ res, accessToken, refreshToken });

  logger.info("JWT created", {
    userId: user.id,
    email: user.email,
    hasAccessToken: Boolean(accessToken),
    hasRefreshToken: Boolean(refreshToken),
  });

  return { accessToken, refreshToken };
};

const updateLoginSuccess = async ({ user, req }) => {
  const { ip, userAgent } = getClientInfo(req);

  user.failedLoginAttempts = 0;
  user.accountLockedUntil = null;
  user.lastLogin = new Date();
  user.loginHistory = [
    {
      ip,
      userAgent,
      device: userAgent.slice(0, 160),
      loggedInAt: new Date(),
    },
    ...(user.loginHistory || []),
  ].slice(0, 20);

  await user.save();
  logger.info("User login succeeded", { userId: user.id, role: user.role, email: user.email, ip });

  await addEmailJob({
    to: user.email,
    template: "loginAlert",
    data: { name: user.name, ip, userAgent },
  });
};

const updateLoginFailure = async (user, req) => {
  if (!user) return;

  user.failedLoginAttempts = Number(user.failedLoginAttempts || 0) + 1;

  if (user.failedLoginAttempts >= MAX_FAILED_LOGINS) {
    user.accountLockedUntil = minutesFromNow(LOCK_MINUTES);
  }

  await user.save();
  logger.warn("User login failed", {
    userId: user.id,
    email: user.email,
    failedLoginAttempts: user.failedLoginAttempts,
    ip: getClientInfo(req).ip,
  });

  if (user.failedLoginAttempts >= MAX_FAILED_LOGINS) {
    captureMessage("User account locked after repeated login failures", "warning", {
      req,
      tags: { area: "auth", action: "login_lockout" },
      extra: {
        userId: user.id,
        role: normalizeUserRole(user.role),
        failedLoginAttempts: user.failedLoginAttempts,
      },
    });
  }
};

const clearExpiredAccountLock = async (user) => {
  if (!user || !user.accountLockedUntil) return;
  if (user.accountLockedUntil <= new Date()) {
    user.accountLockedUntil = null;
    user.failedLoginAttempts = 0;
    await user.save();
  }
};

const ensureCanLogin = async (user) => {
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.isBanned) {
    throw new ApiError(403, "Your account has been disabled. Please contact support.");
  }

  await clearExpiredAccountLock(user);

  if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
    throw new ApiError(423, "Too many failed attempts. Try again later.");
  }
};

export const signup = async ({ payload, req, res }) => {
  const name = String(payload.name || payload.fullName || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const username = String(payload.username || "").trim();
  const mobile = String(payload.mobile || payload.mobileNumber || "").trim();
  const password = String(payload.password || "");
  const confirmPassword = String(payload.confirmPassword || "");

  if (!usernameRules.test(username)) {
    throw new ApiError(422, usernameValidationMessage);
  }

  if (!passwordRules.test(password)) {
    throw new ApiError(422, passwordValidationMessage);
  }

  if (password !== confirmPassword) {
    throw new ApiError(422, "Password and confirm password do not match");
  }

  const [existingEmail, existingMobile, existingUsername] = await Promise.all([
    findUserByEmail(email),
    findUserByMobile(mobile),
    findUserByUsername(username),
  ]);

  if (existingEmail) throw new ApiError(409, "Email is already registered");
  if (existingMobile) throw new ApiError(409, "Mobile number is already registered");
  if (existingUsername) throw new ApiError(409, "Username is already taken");

  const verificationToken = createRandomToken();
  const user = await createUser({
    name,
    email,
    username,
    mobile,
    role: "user",
    passwordHash: await bcrypt.hash(password, 12),
    emailVerificationToken: hashToken(verificationToken),
    emailVerificationExpiry: minutesFromNow(60 * 24),
  });

  await issueTokens({ user, req, res });

  const verificationUrl = buildFrontendUrl("/verify-email", { token: verificationToken });
  await addEmailJob({ to: email, template: "welcome", data: { name } });
  await addEmailJob({
    to: email,
    template: "verifyEmail",
    data: { name, verificationUrl },
  });
  logger.info("User account created", { userId: user.id, email: user.email });

  return serializeUser(user);
};

export const login = async ({ identifier, password, req, res }) => {
  const normalizedIdentifier = String(identifier || "").trim();
  if (!normalizedIdentifier) {
    throw new ApiError(401, "Invalid credentials");
  }

  const user = await findUserByIdentifier(
    normalizedIdentifier,
    "+passwordHash +failedLoginAttempts +accountLockedUntil +refreshTokens",
  );

  try {
    await ensureCanLogin(user);

    if (!user.passwordHash || !(await bcrypt.compare(String(password || ""), user.passwordHash))) {
      await updateLoginFailure(user, req);
      throw new ApiError(401, "Invalid credentials");
    }
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    throw error;
  }

  await updateLoginSuccess({ user, req });
  await issueTokens({ user, req, res });

  return serializeUser(user);
};

export const loginWithGoogle = async ({ profile, req, res }) => {
  if (!profile?.email) {
    throw new ApiError(400, "Google account email is required");
  }

  let user =
    (await User.findOne({ googleId: profile.googleId }).select("+refreshTokens +accountLockedUntil")) ||
    (await User.findOne({ email: profile.email }).select("+refreshTokens +accountLockedUntil"));

  if (!user) {
    user = await User.create({
      name: profile.name,
      email: profile.email,
      googleId: profile.googleId,
      profileImage: profile.profileImage,
      emailVerified: true,
    });
    await addEmailJob({ to: user.email, template: "welcome", data: { name: user.name } });
  } else {
    user.googleId = user.googleId || profile.googleId;
    user.profileImage = user.profileImage || profile.profileImage;
    user.emailVerified = true;
  }

  await ensureCanLogin(user);
  await updateLoginSuccess({ user, req });
  const tokens = await issueTokens({ user, req, res });
  logger.info("Google OAuth login succeeded", { userId: user.id, email: user.email });

  return {
    user: serializeUser(user),
    tokens,
  };
};

const hasRecentRefreshReplacement = (user, family, now = new Date()) => {
  if (!family) return false;

  return (user.refreshTokens || []).some((stored) => {
    const createdAt = stored.createdAt ? new Date(stored.createdAt).getTime() : 0;
    return (
      stored.family === family &&
      !stored.revokedAt &&
      stored.expiresAt > now &&
      createdAt > 0 &&
      now.getTime() - createdAt <= REFRESH_RACE_GRACE_MS
    );
  });
};

export const refreshSession = async ({ req, res }) => {
  const token = req.cookies?.[REFRESH_COOKIE] || "";

  if (!token) {
    throw new ApiError(401, "Refresh token is required");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.REFRESH_SECRET, { algorithms: ["HS256"] });
  } catch (_error) {
    clearAuthCookies(res);
    throw new ApiError(401, "Invalid refresh token");
  }

  if (decoded.type !== "refresh") {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findById(decoded.sub).select("+refreshTokens +accountLockedUntil");
  await ensureCanLogin(user);

  const now = new Date();
  const tokenHash = hashToken(token);
  const family = decoded.family || createRandomToken(12);
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken({ user, family });
  const refreshTokenRecord = buildRefreshTokenRecord({ token: refreshToken, family, req, now });
  const rotation = await User.updateOne(
    {
      _id: user._id,
      refreshTokens: {
        $elemMatch: {
          tokenHash,
          revokedAt: null,
          expiresAt: { $gt: now },
        },
      },
    },
    [
      {
        $set: {
          refreshTokens: {
            $concatArrays: [
              {
                $map: {
                  input: "$refreshTokens",
                  as: "stored",
                  in: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$$stored.tokenHash", tokenHash] },
                          { $gt: ["$$stored.expiresAt", now] },
                        ],
                      },
                      {
                        $mergeObjects: [
                          "$$stored",
                          {
                            revokedAt: now,
                            lastUsedAt: now,
                          },
                        ],
                      },
                      "$$stored",
                    ],
                  },
                },
              },
              [refreshTokenRecord],
            ],
          },
        },
      },
    ],
  );

  if (rotation.modifiedCount === 1) {
    setSessionCookies({ res, accessToken, refreshToken });
    logger.info("User session refreshed", { userId: user.id, role: normalizeUserRole(user.role) });
    return serializeUser(user);
  }

  const latestUser = await User.findById(decoded.sub).select("+refreshTokens +accountLockedUntil");
  await ensureCanLogin(latestUser);

  if (hasRecentRefreshReplacement(latestUser, family, now)) {
    setCsrfCookie(res);
    logger.info("Concurrent refresh replay absorbed", {
      userId: latestUser.id,
      family,
      ip: getClientInfo(req).ip,
    });
    return serializeUser(latestUser);
  }

  if (latestUser) {
    revokeRefreshFamily(latestUser, family);
    await latestUser.save();
    clearAuthCookies(res);
    logger.warn("Refresh token reuse or replay detected", {
      userId: latestUser.id,
      family,
      ip: getClientInfo(req).ip,
    });
    captureMessage("Refresh token reuse or replay detected", "warning", {
      req,
      tags: { area: "auth", action: "refresh_replay" },
      extra: {
        userId: latestUser.id,
        role: normalizeUserRole(latestUser.role),
      },
    });
  }

  throw new ApiError(401, "Refresh token has expired");
};

export const logout = async ({ req, res }) => {
  const token = req.cookies?.[REFRESH_COOKIE] || "";

  if (token) {
    const tokenHash = hashToken(token);
    const user = await User.findOne({ "refreshTokens.tokenHash": tokenHash }).select(
      "+refreshTokens",
    );

    if (user) {
      user.refreshTokens = user.refreshTokens.map((stored) => {
        if (stored.tokenHash !== tokenHash) return stored;
        const plain = typeof stored.toObject === "function" ? stored.toObject() : stored;
        return { ...plain, revokedAt: new Date() };
      });
      await user.save();
      logger.info("User session logged out", { userId: user.id, role: user.role });
    }
  }

  clearAuthCookies(res);
};

export const forgotPassword = async ({ email }) => {
  const user = await findUserByEmail(email, "+passwordResetToken +passwordResetExpiry");

  if (!user) {
    // Don't reveal if user exists or not for security
    logger.info("Password reset requested for non-existent user", { email });
    return;
  }

  const resetToken = createRandomToken();
  user.passwordResetToken = hashToken(resetToken);
  user.passwordResetExpiry = minutesFromNow(15);
  await user.save();

  const resetUrl = buildFrontendUrl("/reset-password", { token: resetToken });

  logger.info("Password reset token generated", {
    userId: user.id,
    email: user.email,
  });

  try {
    await addEmailJob({
      to: user.email,
      template: "resetPassword",
      data: { name: user.name, resetUrl },
    });
    logger.info("Password reset email queued successfully", { userId: user.id, email: user.email });
  } catch (error) {
    logger.error("Failed to queue password reset email", {
      userId: user.id,
      email: user.email,
      error: error.message,
    });
    throw new ApiError(500, "Failed to send password reset email. Please try again later.");
  }
};

export const resetPassword = async ({ token, password }) => {
  if (!passwordRules.test(password)) {
    throw new ApiError(422, passwordValidationMessage);
  }

  const user = await User.findOne({
    passwordResetToken: hashToken(token),
    passwordResetExpiry: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpiry +refreshTokens +passwordHash");

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  user.passwordHash = await bcrypt.hash(password, 12);
  user.passwordResetToken = "";
  user.passwordResetExpiry = null;
  user.refreshTokens = [];
  await user.save();

  await addEmailJob({
    to: user.email,
    template: "passwordResetSuccess",
    data: { name: user.name },
  });
  logger.info("Password reset completed", { userId: user.id, email: user.email });
};

export const verifyEmail = async ({ token }) => {
  const user = await User.findOne({
    emailVerificationToken: hashToken(token),
    emailVerificationExpiry: { $gt: new Date() },
  }).select("+emailVerificationToken +emailVerificationExpiry");

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token");
  }

  user.emailVerified = true;
  user.emailVerificationToken = "";
  user.emailVerificationExpiry = null;
  await user.save();
  logger.info("Email verified", { userId: user.id, email: user.email });

  return serializeUser(user);
};

export const getAuthenticatedUser = (req) => serializeUser(req.user);
