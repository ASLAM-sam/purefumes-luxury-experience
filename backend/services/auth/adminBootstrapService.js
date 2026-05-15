import bcrypt from "bcryptjs";
import env from "../../config/env.js";
import logger from "../../config/logger.js";
import User from "../../models/User.js";

const sanitizeUsername = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");

const resolveAdminEmail = () => {
  if (env.ADMIN_EMAIL) return env.ADMIN_EMAIL;

  const username = sanitizeUsername(env.ADMIN_USERNAME);
  if (!username) return "";

  try {
    const hostname = new URL(env.FRONTEND_URL || env.BACKEND_URL).hostname || "purefumes.local";
    return `${username}@${hostname}`.toLowerCase();
  } catch (_error) {
    return `${username}@purefumes.local`;
  }
};

const resolveAdminName = ({ username, email }) => {
  const basis = sanitizeUsername(username) || String(email || "").split("@")[0] || "admin";
  return basis
    .split(/[._-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const ensureAdminAccount = async () => {
  const username = sanitizeUsername(env.ADMIN_USERNAME);
  const email = resolveAdminEmail();

  if (!email || (!env.ADMIN_PASSWORD_HASH && !env.ADMIN_PASSWORD_LEGACY)) {
    logger.warn("Admin bootstrap skipped because admin credentials are incomplete");
    return null;
  }

  const user = await User.findOne({
    $or: [{ email }, ...(username ? [{ username }] : [])],
  }).select("+passwordHash");

  let passwordHash = env.ADMIN_PASSWORD_HASH;

  if (!passwordHash && env.ADMIN_PASSWORD_LEGACY) {
    const alreadyMatches = user?.passwordHash
      ? await bcrypt.compare(env.ADMIN_PASSWORD_LEGACY, user.passwordHash)
      : false;
    passwordHash = alreadyMatches
      ? user.passwordHash
      : await bcrypt.hash(env.ADMIN_PASSWORD_LEGACY, 12);
  }

  if (!user) {
    const created = await User.create({
      name: resolveAdminName({ username, email }),
      email,
      username: username || undefined,
      passwordHash,
      role: "admin",
      emailVerified: true,
    });

    logger.info("Admin account bootstrapped", { email: created.email, username: created.username || "" });
    return created;
  }

  let dirty = false;

  if (user.role !== "admin") {
    user.role = "admin";
    dirty = true;
  }

  if (username && user.username !== username) {
    user.username = username;
    dirty = true;
  }

  if (user.email !== email) {
    user.email = email;
    dirty = true;
  }

  if (!user.emailVerified) {
    user.emailVerified = true;
    dirty = true;
  }

  if (passwordHash && user.passwordHash !== passwordHash) {
    user.passwordHash = passwordHash;
    dirty = true;
  }

  if (dirty) {
    await user.save();
    logger.info("Admin account synchronized from environment", { email: user.email, username: user.username || "" });
  }

  return user;
};

export default ensureAdminAccount;
