import { accountApi, type AuthUser } from "@/services/api";

export const authQueryKey = ["auth", "session"] as const;

export const authSessionQueryOptions = () => ({
  queryKey: authQueryKey,
  queryFn: async (): Promise<AuthUser | null> => accountApi.me(),
  retry: false,
  staleTime: 15_000,
});
