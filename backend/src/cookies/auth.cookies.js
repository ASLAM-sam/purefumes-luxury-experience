import env from "../../config/env.js";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_TOKEN_TTL,
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_TTL,
} from "../constants/auth.constants.js";
import { parseDurationToMs } from "../../utils/time.js";

const isSecure = () => env.isProduction || env.ENFORCE_HTTPS;

const baseCookieOptions = () => ({
  httpOnly: true,
  secure: isSecure(),
  sameSite: isSecure() ? "none" : "lax",
  domain: isSecure() ? env.COOKIE_DOMAIN : undefined,
  path: "/",
});

export const getCookieOptions = ({ maxAge } = {}) => ({
  ...baseCookieOptions(),
  maxAge,
});

export const setAuthCookies = ({ res, accessToken, refreshToken }) => {
  res.cookie(
    ACCESS_COOKIE_NAME,
    accessToken,
    getCookieOptions({
      maxAge: parseDurationToMs(ACCESS_TOKEN_TTL, 15 * 60 * 1000),
    }),
  );
  res.cookie(
    REFRESH_COOKIE_NAME,
    refreshToken,
    getCookieOptions({
      maxAge: parseDurationToMs(REFRESH_TOKEN_TTL, 7 * 24 * 60 * 60 * 1000),
    }),
  );
};

export const clearAuthCookies = (res) => {
  res.clearCookie(ACCESS_COOKIE_NAME, getCookieOptions());
  res.clearCookie(REFRESH_COOKIE_NAME, getCookieOptions());
  res.clearCookie("token", getCookieOptions());
};
