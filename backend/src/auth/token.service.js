import jwt from "jsonwebtoken";
import env from "../../config/env.js";
import { createRandomToken } from "../../utils/crypto.js";
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from "../constants/auth.constants.js";

export const signAccessToken = ({ userId, role, sessionId, deviceId }) =>
  jwt.sign(
    {
      sub: userId,
      role,
      sid: sessionId,
      did: deviceId,
      type: "access",
    },
    env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: ACCESS_TOKEN_TTL,
      jwtid: createRandomToken(12),
    },
  );

export const signRefreshToken = ({ userId, role, sessionId, family, deviceId }) =>
  jwt.sign(
    {
      sub: userId,
      role,
      sid: sessionId,
      did: deviceId,
      family,
      type: "refresh",
    },
    env.REFRESH_SECRET,
    {
      algorithm: "HS256",
      expiresIn: REFRESH_TOKEN_TTL,
      jwtid: createRandomToken(12),
    },
  );

export const verifyAccessToken = (token) =>
  jwt.verify(token, env.JWT_SECRET, {
    algorithms: ["HS256"],
  });

export const verifyRefreshToken = (token) =>
  jwt.verify(token, env.REFRESH_SECRET, {
    algorithms: ["HS256"],
  });
