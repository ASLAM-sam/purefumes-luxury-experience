import bcrypt from "bcryptjs";
import logger from "../../config/logger.js";
import env from "../../config/env.js";
import { ApiError } from "../../middlewares/errorMiddleware.js";
import { addEmailJob } from "../../queues/emailQueue.js";
import { createRandomToken, hashToken } from "../../utils/crypto.js";
import { minutesFromNow, parseDurationToMs } from "../../utils/time.js";
import User, { normalizeUserRole } from "../../models/User.js";
import {
  appendSessionAudit,
  createUser,
  findUserByEmailForAuth,
  findUserByIdForAuth,
  findUserByIdentifierForAuth,
  findUserByPasswordResetToken,
  findUserByVerificationToken,
  recordFailedLogin,
  revokeRefreshFamily,
  revokeRefreshSessionByHash,
  rotateRefreshSession,
} from "../repositories/auth.repository.js";
import { setAuthCookies, clearAuthCookies } from "../cookies/auth.cookies.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../auth/token.service.js";
import {
  ACCOUNT_LOCK_MINUTES,
  AUTH_LOCK_RETRY_MS,
  AUTH_LOCK_TTL_MS,
  AUTH_LOCK_WAIT_MS,
  MAX_FAILED_LOGINS,
  MAX_REFRESH_SESSIONS,
  REFRESH_REPLAY_GRACE_MS,
  REFRESH_TOKEN_TTL,
} from "../constants/auth.constants.js";
import { acquireLock, getCache, releaseLock, setCache } from "../cache/redis-cache.js";

export const passwordRules = /^.{6,}$/;
export const passwordValidationMessage = "Password must be at least 6 characters";
export const usernameRules = /^[a-z0-9]{1,6}$/;
export const usernameValidationMessage =
  "Username must be 1-6 characters using lowercase letters or numbers only";

const googleConfigStatus = {
  enabled: false,
  missing: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_CALLBACK_URL"],
  callbackUrl: "",
  backendUrl: env.BACKEND_URL,
  frontendUrl: env.FRONTEND_URL,
};

const getIpAddress = (req) =>
  String(req.headers["x-forwarded-for"] || req.ip || req.socket?.remoteAddress || "")
    .split(",")[0]
    .trim();

const getClientContext = (req) => {
  const userAgent = String(req.get("user-agent") || "").slice(0, 400);
  const deviceIdHeader = String(req.get("x-device-id") || "").trim();
  const deviceId =
    deviceIdHeader || hashToken(`${userAgent}:${String(req.get("accept-language") || "").trim()}`).slice(0, 64);

  return {
    ip: getIpAddress(req),
    userAgent,
    deviceId,
    deviceName: String(req.get("x-device-name") || userAgent || "browser").slice(0, 160),
  };
};

const getRefreshLockKey = (sessionId) => `auth:refresh-lock:${sessionId}`;
const getLoginLockKey = (identifier) => `auth:login-lock:${hashToken(identifier.toLowerCase())}`;
const getRotationReplayKey = (tokenHash) => `auth:refresh-replay:${tokenHash}`;
const getAuthCacheKey = (userId) => `auth:user:${userId}`;
const isAdminUser = (user) => normalizeUserRole(user?.role) === "admin";

export const serializeUser = (user) => {
  const raw = typeof user?.toObject === "function" ? user.toObject({ virtuals: true }) : user;
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
    totalOrders: Number(raw.totalOrders || 0),
    totalSpent: Number(raw.totalSpent || 0),
    emailVerified: Boolean(raw.emailVerified),
    isBanned: Boolean(raw.isBanned),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

const buildRefreshRecord = ({ refreshToken, sessionId, family, client, now }) => ({
  tokenHash: hashToken(refreshToken),
  family,
  sessionId,
  deviceId: client.deviceId,
  deviceName: client.deviceName,
  ip: client.ip,
  lastIP: client.ip,
  userAgent: client.userAgent,
  expiresAt: new Date(Date.now() + parseDurationToMs(REFRESH_TOKEN_TTL, 7 * 24 * 60 * 60 * 1000)),
  createdAt: now,
  lastUsedAt: now,
  revokedAt: null,
  revokedReason: "",
  replacedByTokenHash: "",
});

const buildLoginAuditEntry = (client, loggedInAt) => ({
  ip: client.ip,
  userAgent: client.userAgent,
  device: client.deviceName,
  loggedInAt,
});

const ensureAccountIsUsable = (user) => {
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.isBanned) {
    throw new ApiError(403, "Your account has been disabled. Please contact support.");
  }

  const lockUntil = user.lockUntil || user.accountLockedUntil;
  if (lockUntil && new Date(lockUntil) > new Date()) {
    throw new ApiError(423, "Too many failed attempts. Try again later.");
  }
};

const issueSession = async ({ user, req, res, family, sessionId }) => {
  const client = getClientContext(req);
  const now = new Date();
  const normalizedRole = normalizeUserRole(user.role);
  const resolvedSessionId = sessionId || createRandomToken(18);
  const resolvedFamily = family || createRandomToken(18);
  const accessToken = signAccessToken({
    userId: user.id,
    role: normalizedRole,
    sessionId: resolvedSessionId,
    deviceId: client.deviceId,
  });
  const refreshToken = signRefreshToken({
    userId: user.id,
    role: normalizedRole,
    sessionId: resolvedSessionId,
    family: resolvedFamily,
    deviceId: client.deviceId,
  });
  const refreshRecord = buildRefreshRecord({
    refreshToken,
    sessionId: resolvedSessionId,
    family: resolvedFamily,
    client,
    now,
  });

  const updatedUser = await appendSessionAudit({
    userId: user.id,
    refreshSession: refreshRecord,
    loginAudit: buildLoginAuditEntry(client, now),
    lastIP: client.ip,
    now,
  });

  const trimmedTokens = (updatedUser.refreshTokens || [])
    .filter((stored) => !stored.revokedAt && new Date(stored.expiresAt) > now)
    .slice(-MAX_REFRESH_SESSIONS);

  if (trimmedTokens.length !== (updatedUser.refreshTokens || []).length) {
    updatedUser.refreshTokens = trimmedTokens;
    await updatedUser.save();
  }

  setAuthCookies({ res, accessToken, refreshToken });
  await setCache(getAuthCacheKey(user.id), serializeUser(updatedUser), 60_000);

  return {
    user: serializeUser(updatedUser),
    accessToken,
    refreshToken,
  };
};

const registerFailedLoginAttempt = async (user) => {
  if (!user) return;

  const nextFailedAttempts = Number(user.failedAttempts || user.failedLoginAttempts || 0) + 1;
  const lockUntil =
    nextFailedAttempts >= MAX_FAILED_LOGINS ? minutesFromNow(ACCOUNT_LOCK_MINUTES) : null;

  await recordFailedLogin({
    userId: user.id,
    nextFailedAttempts,
    lockUntil,
  });
};

const absorbRecentRefreshReplay = async ({ tokenHash, res }) => {
  const replay = await getCache(getRotationReplayKey(tokenHash));
  if (!replay?.accessToken || !replay?.refreshToken) {
    return false;
  }

  setAuthCookies({
    res,
    accessToken: replay.accessToken,
    refreshToken: replay.refreshToken,
  });
  return true;
};

export const getAuthConfig = async () => ({
  google: googleConfigStatus,
});

export const getAuthenticatedUser = async (userId) => {
  const cached = await getCache(getAuthCacheKey(userId));
  if (cached) {
    return cached;
  }

  const user = await findUserByIdForAuth(userId);
  if (!user) return null;

  const serialized = serializeUser(user);
  await setCache(getAuthCacheKey(userId), serialized, 60_000);
  return serialized;
};

export const signup = async ({ payload, req, res }) => {
  const name = String(payload.name || payload.fullName || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const username = String(payload.username || "").trim().toLowerCase();
  const mobile = String(payload.mobile || payload.mobileNumber || "").trim();
  const password = String(payload.password || "");
  const confirmPassword = String(payload.confirmPassword || "");

  if (!name) {
    throw new ApiError(422, "Full name is required");
  }
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
    findUserByEmailForAuth(email),
    User.findOne({ mobile }).select("_id"),
    User.findOne({ username }).select("_id"),
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
    emailVerified: false,
    emailVerificationToken: hashToken(verificationToken),
    emailVerificationExpiry: minutesFromNow(24 * 60),
    loginAudit: [],
  });

  const session = await issueSession({ user, req, res });
  await addEmailJob({ to: email, template: "welcome", data: { name } });
  await addEmailJob({
    to: email,
    template: "verifyEmail",
    data: {
      name,
      verificationUrl: `${env.FRONTEND_URL.replace(/\/$/, "")}/verify-email?token=${verificationToken}`,
    },
  });

  return session.user;
};

export const login = async ({ identifier, password, req, res }) => {
  const normalizedIdentifier = String(identifier || "").trim();
  if (!normalizedIdentifier) {
    throw new ApiError(401, "Invalid credentials");
  }

  const loginLock = await acquireLock(getLoginLockKey(normalizedIdentifier), {
    ttlMs: AUTH_LOCK_TTL_MS,
    waitTimeoutMs: AUTH_LOCK_WAIT_MS,
    retryDelayMs: AUTH_LOCK_RETRY_MS,
  });

  if (!loginLock) {
    throw new ApiError(429, "A login request for this account is already being processed");
  }

  try {
    const user = await findUserByIdentifierForAuth(normalizedIdentifier);
    ensureAccountIsUsable(user);

    const normalizedRole = normalizeUserRole(user.role);
    if (user.role !== normalizedRole) {
      user.role = normalizedRole;
      await user.save();
    }

    if (!isAdminUser(user)) {
      throw new ApiError(
        403,
        "Customer accounts have been retired. Customers can place orders directly at checkout.",
      );
    }

    const passwordMatches = user.passwordHash
      ? await bcrypt.compare(String(password || ""), user.passwordHash)
      : false;

    if (!passwordMatches) {
      await registerFailedLoginAttempt(user);
      throw new ApiError(401, "Invalid credentials");
    }

    const session = await issueSession({ user, req, res });
    logger.info("User login succeeded", {
      userId: user.id,
      role: normalizeUserRole(user.role),
      ip: getIpAddress(req),
    });

    await addEmailJob({
      to: user.email,
      template: "loginAlert",
      data: {
        name: user.name,
        ip: getIpAddress(req),
        userAgent: String(req.get("user-agent") || ""),
      },
    });

    return session.user;
  } finally {
    await releaseLock(loginLock);
  }
};

export const refreshSession = async ({ req, res }) => {
  const presentedToken = String(req.cookies?.refreshToken || "");
  if (!presentedToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(presentedToken);
  } catch (_error) {
    clearAuthCookies(res);
    throw new ApiError(401, "Invalid refresh token");
  }

  if (decoded.type !== "refresh") {
    clearAuthCookies(res);
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await findUserByIdForAuth(decoded.sub);
  ensureAccountIsUsable(user);

  if (!isAdminUser(user)) {
    clearAuthCookies(res);
    await revokeRefreshFamily({
      userId: user.id,
      family: decoded.family,
      reason: "customer-session-disabled",
    });
    throw new ApiError(403, "Admin session required");
  }

  const tokenHash = hashToken(presentedToken);
  const currentRecord = (user.refreshTokens || []).find((stored) => stored.tokenHash === tokenHash);
  if (!currentRecord || currentRecord.revokedAt || new Date(currentRecord.expiresAt) <= new Date()) {
    const replayAbsorbed = await absorbRecentRefreshReplay({ tokenHash, res });
    if (replayAbsorbed) {
      return serializeUser(user);
    }

    await revokeRefreshFamily({
      userId: user.id,
      family: decoded.family,
      reason: "replay-detected",
    });
    clearAuthCookies(res);
    throw new ApiError(401, "Refresh token has expired");
  }

  const client = getClientContext(req);
  if (currentRecord.deviceId && client.deviceId && currentRecord.deviceId !== client.deviceId) {
    await revokeRefreshFamily({
      userId: user.id,
      family: decoded.family,
      reason: "device-mismatch",
    });
    clearAuthCookies(res);
    throw new ApiError(401, "Refresh token replay detected");
  }

  const refreshLock = await acquireLock(getRefreshLockKey(decoded.sid), {
    ttlMs: AUTH_LOCK_TTL_MS,
    waitTimeoutMs: AUTH_LOCK_WAIT_MS,
    retryDelayMs: AUTH_LOCK_RETRY_MS,
  });

  if (!refreshLock) {
    const replayAbsorbed = await absorbRecentRefreshReplay({ tokenHash, res });
    if (replayAbsorbed) {
      return serializeUser(user);
    }

    throw new ApiError(429, "Authentication refresh is already in progress");
  }

  try {
    const latestUser = await findUserByIdForAuth(decoded.sub);
    ensureAccountIsUsable(latestUser);

    const activeRecord = (latestUser.refreshTokens || []).find(
      (stored) => stored.tokenHash === tokenHash,
    );

    if (!activeRecord || activeRecord.revokedAt || new Date(activeRecord.expiresAt) <= new Date()) {
      const replayAbsorbed = await absorbRecentRefreshReplay({ tokenHash, res });
      if (replayAbsorbed) {
        return serializeUser(latestUser);
      }

      clearAuthCookies(res);
      throw new ApiError(401, "Refresh token has expired");
    }

    const now = new Date();
    const family = activeRecord.family || decoded.family || createRandomToken(18);
    const sessionId = activeRecord.sessionId || decoded.sid || createRandomToken(18);
    const accessToken = signAccessToken({
      userId: latestUser.id,
      role: normalizeUserRole(latestUser.role),
      sessionId,
      deviceId: client.deviceId,
    });
    const refreshToken = signRefreshToken({
      userId: latestUser.id,
      role: normalizeUserRole(latestUser.role),
      sessionId,
      family,
      deviceId: client.deviceId,
    });
    const replacement = buildRefreshRecord({
      refreshToken,
      sessionId,
      family,
      client,
      now,
    });

    const rotation = await rotateRefreshSession({
      userId: latestUser.id,
      oldTokenHash: tokenHash,
      replacement,
      now,
      lastIP: client.ip,
    });

    if (rotation.modifiedCount !== 1) {
      const replayAbsorbed = await absorbRecentRefreshReplay({ tokenHash, res });
      if (replayAbsorbed) {
        return serializeUser(latestUser);
      }

      clearAuthCookies(res);
      throw new ApiError(401, "Refresh token has expired");
    }

    await setCache(
      getRotationReplayKey(tokenHash),
      { accessToken, refreshToken },
      REFRESH_REPLAY_GRACE_MS,
    );
    setAuthCookies({ res, accessToken, refreshToken });
    await setCache(getAuthCacheKey(latestUser.id), serializeUser(latestUser), 60_000);
    return serializeUser(latestUser);
  } finally {
    await releaseLock(refreshLock);
  }
};

export const logout = async ({ req, res }) => {
  const presentedToken = String(req.cookies?.refreshToken || "");
  if (presentedToken) {
    await revokeRefreshSessionByHash({
      tokenHash: hashToken(presentedToken),
      reason: "logout",
    });
  }

  clearAuthCookies(res);
};

export const forgotPassword = async ({ email }) => {
  const user = await findUserByEmailForAuth(email);
  if (!user) {
    logger.info("Password reset requested for unknown user", {
      email,
    });
    return;
  }

  const resetToken = createRandomToken();
  user.passwordResetToken = hashToken(resetToken);
  user.passwordResetExpiry = minutesFromNow(15);
  await user.save();

  await addEmailJob({
    to: user.email,
    template: "resetPassword",
    data: {
      name: user.name,
      resetUrl: `${env.FRONTEND_URL.replace(/\/$/, "")}/reset-password?token=${resetToken}`,
    },
  });
};

export const resetPassword = async ({ token, password, res }) => {
  if (!passwordRules.test(password)) {
    throw new ApiError(422, passwordValidationMessage);
  }

  const user = await findUserByPasswordResetToken(hashToken(token));
  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  user.passwordHash = await bcrypt.hash(password, 12);
  user.passwordResetToken = "";
  user.passwordResetExpiry = null;
  user.refreshTokens = [];
  user.failedAttempts = 0;
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.accountLockedUntil = null;
  await user.save();

  clearAuthCookies(res);
};

export const verifyEmail = async ({ token, req, res }) => {
  const user = await findUserByVerificationToken(hashToken(token));
  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token");
  }

  user.emailVerified = true;
  user.emailVerificationToken = "";
  user.emailVerificationExpiry = null;
  await user.save();

  const session = await issueSession({ user, req, res });
  return session.user;
};

export const getCurrentUserFromRequest = async (req) => {
  if (!req.user?.id) return null;
  const user = await getAuthenticatedUser(req.user.id);
  return isAdminUser(user) ? user : null;
};
