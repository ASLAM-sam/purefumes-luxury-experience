import User from "../../models/User.js";

const authSelect =
  "+passwordHash +refreshTokens +failedAttempts +failedLoginAttempts +lockUntil +accountLockedUntil +passwordResetToken +passwordResetExpiry +emailVerificationToken +emailVerificationExpiry";

export const findUserByIdentifierForAuth = async (identifier) => {
  const normalized = String(identifier || "").trim();
  const isEmail = normalized.includes("@");
  const query = isEmail
    ? { email: normalized.toLowerCase() }
    : {
        $or: [{ mobile: normalized }, { username: normalized.toLowerCase() }],
      };

  return User.findOne(query).select(authSelect);
};

export const findUserByIdForAuth = (id) => User.findById(id).select(authSelect);

export const findUserByEmailForAuth = (email) =>
  User.findOne({ email: String(email || "").trim().toLowerCase() }).select(authSelect);

export const findUserByVerificationToken = (tokenHash) =>
  User.findOne({
    emailVerificationToken: tokenHash,
    emailVerificationExpiry: { $gt: new Date() },
  }).select(authSelect);

export const findUserByPasswordResetToken = (tokenHash) =>
  User.findOne({
    passwordResetToken: tokenHash,
    passwordResetExpiry: { $gt: new Date() },
  }).select(authSelect);

export const createUser = (payload) => User.create(payload);

export const appendSessionAudit = async ({ userId, refreshSession, loginAudit, lastIP, now }) =>
  User.findByIdAndUpdate(
    userId,
    {
      $push: {
        refreshTokens: {
          $each: [refreshSession],
          $slice: -20,
        },
        loginHistory: {
          $each: [loginAudit],
          $position: 0,
          $slice: 20,
        },
        loginAudit: {
          $each: [loginAudit],
          $position: 0,
          $slice: 20,
        },
      },
      $set: {
        lastLogin: now,
        lastIP,
        failedAttempts: 0,
        failedLoginAttempts: 0,
        lockUntil: null,
        accountLockedUntil: null,
      },
    },
    { new: true },
  ).select(authSelect);

export const recordFailedLogin = async ({ userId, nextFailedAttempts, lockUntil }) =>
  User.findByIdAndUpdate(
    userId,
    {
      $set: {
        failedAttempts: nextFailedAttempts,
        failedLoginAttempts: nextFailedAttempts,
        lockUntil,
        accountLockedUntil: lockUntil,
      },
    },
    { new: true },
  ).select(authSelect);

export const rotateRefreshSession = async ({
  userId,
  oldTokenHash,
  replacement,
  now,
  lastIP,
}) =>
  User.updateOne(
    {
      _id: userId,
      refreshTokens: {
        $elemMatch: {
          tokenHash: oldTokenHash,
          revokedAt: null,
          expiresAt: { $gt: now },
        },
      },
    },
    {
      $set: {
        "refreshTokens.$.revokedAt": now,
        "refreshTokens.$.lastUsedAt": now,
        "refreshTokens.$.lastIP": lastIP,
        "refreshTokens.$.replacedByTokenHash": replacement.tokenHash,
        "refreshTokens.$.revokedReason": "rotated",
        lastIP,
      },
      $push: {
        refreshTokens: {
          $each: [replacement],
          $slice: -20,
        },
      },
    },
  );

export const revokeRefreshSessionByHash = async ({ tokenHash, reason = "logout", now = new Date() }) =>
  User.updateOne(
    {
      refreshTokens: {
        $elemMatch: {
          tokenHash,
          revokedAt: null,
        },
      },
    },
    {
      $set: {
        "refreshTokens.$.revokedAt": now,
        "refreshTokens.$.revokedReason": reason,
      },
    },
  );

export const revokeRefreshFamily = async ({ userId, family, reason, now = new Date() }) =>
  User.updateOne(
    { _id: userId },
    [
      {
        $set: {
          refreshTokens: {
            $map: {
              input: "$refreshTokens",
              as: "stored",
              in: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$$stored.family", family] },
                      { $eq: ["$$stored.revokedAt", null] },
                    ],
                  },
                  {
                    $mergeObjects: [
                      "$$stored",
                      {
                        revokedAt: now,
                        revokedReason: reason,
                      },
                    ],
                  },
                  "$$stored",
                ],
              },
            },
          },
        },
      },
    ],
  );
