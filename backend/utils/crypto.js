import crypto from "crypto";

export const createRandomToken = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

export const hashToken = (token) =>
  crypto.createHash("sha256").update(String(token)).digest("hex");

export const timingSafeEqual = (left, right) => {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  if (leftBuffer.length !== rightBuffer.length) return false;

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};
