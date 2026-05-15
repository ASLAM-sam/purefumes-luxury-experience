import User from "../models/User.js";

export const findUserByEmail = (email, projection = "") =>
  User.findOne({ email: String(email || "").trim().toLowerCase() }).select(projection);

export const findUserByMobile = (mobile, projection = "") =>
  User.findOne({ mobile: String(mobile || "").trim() }).select(projection);

export const findUserByUsername = (username, projection = "") =>
  User.findOne({ username: String(username || "").trim().toLowerCase() }).select(projection);

export const findUserByIdentifier = (identifier, projection = "") => {
  const value = String(identifier || "").trim();
  const isEmail = value.includes("@");

  if (isEmail) {
    return User.findOne({ email: value.toLowerCase() }).select(projection);
  }

  return User.findOne({
    $or: [{ mobile: value }, { username: value.toLowerCase() }],
  }).select(projection);
};

export const findUserById = (id, projection = "") => User.findById(id).select(projection);

export const createUser = (payload) => User.create(payload);

export const listUsers = ({ filter = {}, skip = 0, limit = 20, sort = { createdAt: -1 } }) =>
  User.find(filter).sort(sort).skip(skip).limit(limit);

export const countUsers = (filter = {}) => User.countDocuments(filter);
