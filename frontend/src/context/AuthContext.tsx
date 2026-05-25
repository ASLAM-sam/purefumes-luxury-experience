/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { accountApi, type AuthUser } from "@/services/api";
import { uiStateObserver } from "@/lib/performance/state-observers";
import { authQueryKey, authSessionQueryOptions } from "@/lib/query/auth";

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

const AUTH_SNAPSHOT_KEY = "purefumes:auth-snapshot";

const AuthCtx = createContext<AuthState | null>(null);

const readAuthSnapshot = (): AuthUser | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(AUTH_SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch (_error) {
    return null;
  }
};

const writeAuthSnapshot = (user: AuthUser | null) => {
  if (typeof window === "undefined") return;

  try {
    if (user) {
      window.sessionStorage.setItem(AUTH_SNAPSHOT_KEY, JSON.stringify(user));
    } else {
      window.sessionStorage.removeItem(AUTH_SNAPSHOT_KEY);
    }
  } catch (_error) {
    // Session hydration is best effort and should never block auth flow.
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const authActionRef = useRef<Promise<AuthUser> | null>(null);

  const sessionQuery = useQuery({
    ...authSessionQueryOptions(),
    initialData: readAuthSnapshot,
    initialDataUpdatedAt: 0,
  });

  const user = sessionQuery.data ?? null;
  const authReady = sessionQuery.isFetched;

  useEffect(() => {
    writeAuthSnapshot(user);
    uiStateObserver.updateAuth({
      userId: user?.id || null,
      authReady,
      isAuthenticated: Boolean(user),
    });
  }, [authReady, user]);

  const reloadUser = useCallback(async () => {
    const nextUser = await queryClient.fetchQuery(authSessionQueryOptions());
    queryClient.setQueryData(authQueryKey, nextUser);
    return nextUser;
  }, [queryClient]);

  const runLockedAuthAction = useCallback(
    async (action: () => Promise<AuthUser>) => {
      if (authActionRef.current) {
        return authActionRef.current;
      }

      authActionRef.current = action().finally(() => {
        authActionRef.current = null;
      });
      return authActionRef.current;
    },
    [],
  );

  const login = useCallback(
    async (identifier: string, password: string) => {
      const nextUser = await runLockedAuthAction(() => accountApi.login(identifier, password));
      queryClient.setQueryData(authQueryKey, nextUser);
      return nextUser;
    },
    [queryClient, runLockedAuthAction],
  );

  const signup = useCallback(
    async (payload: Parameters<typeof accountApi.signup>[0]) => {
      const nextUser = await runLockedAuthAction(() => accountApi.signup(payload));
      queryClient.setQueryData(authQueryKey, nextUser);
      return nextUser;
    },
    [queryClient, runLockedAuthAction],
  );

  const logout = useCallback(async () => {
    try {
      await accountApi.logout();
    } finally {
      queryClient.setQueryData(authQueryKey, null);
    }
  }, [queryClient]);

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
