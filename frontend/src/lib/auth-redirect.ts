const REDIRECT_AFTER_LOGIN_STORAGE_KEY = "purefumes_redirect_after_login";

const sanitizeRedirectPath = (value: string | null | undefined, fallback = "/") => {
  const redirectPath = String(value || fallback).trim();
  return redirectPath.startsWith("/") && !redirectPath.startsWith("//") ? redirectPath : fallback;
};

export const getCurrentRedirectPath = () => {
  if (typeof window === "undefined") return "/";

  return sanitizeRedirectPath(
    `${window.location.pathname}${window.location.search}${window.location.hash}`,
    "/",
  );
};

export const getRedirectAfterLogin = (fallback = "/") => {
  if (typeof window === "undefined") return fallback;

  const params = new URLSearchParams(window.location.search);
  return sanitizeRedirectPath(
    params.get("redirect") || window.localStorage.getItem(REDIRECT_AFTER_LOGIN_STORAGE_KEY),
    fallback,
  );
};

export const setRedirectAfterLogin = (path: string) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      REDIRECT_AFTER_LOGIN_STORAGE_KEY,
      sanitizeRedirectPath(path, "/"),
    );
  } catch (_error) {
    // Redirect persistence should never block auth navigation.
  }
};

export const rememberCurrentPageForLogin = () => {
  setRedirectAfterLogin(getCurrentRedirectPath());
};

export const clearRedirectAfterLogin = () => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(REDIRECT_AFTER_LOGIN_STORAGE_KEY);
  } catch (_error) {
    // Cleanup should never block auth navigation.
  }
};
