import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authSessionQueryOptions } from "@/lib/query/auth";
import { queryClient } from "@/lib/query/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/admin/login") {
      return;
    }

    const user = await queryClient.ensureQueryData(authSessionQueryOptions());
    if (!user || user.role !== "admin") {
      throw redirect({
        to: "/admin/login",
        search: { redirect: location.pathname },
      });
    }
  },
  component: () => <Outlet />,
});
