/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { accountApi, type AuthUser } from "@/services/api";
import { uiStateObserver } from "@/lib/performance/state-observers";

type AuthState = {
  user: AuthUser | null;
  authReady: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<AuthUser>;
  signup: (payload: {
    name: string;
    email: string;
    username: string;
    mobile: string;
    password: string;
    confirmPassword: string;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  reloadUser: () => Promise<AuthUser | null>;
};

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const reloadUser = useCallback(async () => {
    const nextUser = await accountApi.me();
    setUser(nextUser);
    setAuthReady(true);
    return nextUser;
  }, []);

  useEffect(() => {
    void reloadUser();
  }, [reloadUser]);

  useEffect(() => {
    uiStateObserver.updateAuth({
      userId: user?.id || null,
      authReady,
      isAuthenticated: Boolean(user),
    });
  }, [authReady, user]);

  const login = useCallback(async (identifier: string, password: string) => {
    const nextUser = await accountApi.login(identifier, password);
    setUser(nextUser);
    return nextUser;
  }, []);

  const signup = useCallback(async (payload: Parameters<typeof accountApi.signup>[0]) => {
    const nextUser = await accountApi.signup(payload);
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await accountApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      authReady,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout,
      reloadUser,
    }),
    [authReady, login, logout, reloadUser, signup, user],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
