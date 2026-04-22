import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { auth } from "@/services/api";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    if (!auth.isLoggedIn() && location.pathname !== "/admin/login") {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: () => <Outlet />,
});
