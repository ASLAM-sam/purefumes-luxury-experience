import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { accountApi } from "@/services/api";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/admin/login") {
      return;
    }

    const user = await accountApi.me();
    if (!user || user.role !== "admin") {
      throw redirect({
        to: "/admin/login",
        search: { redirect: location.pathname },
      });
    }
  },
  component: () => <Outlet />,
});
