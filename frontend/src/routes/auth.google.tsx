import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { accountApi } from "@/services/api";

export const Route = createFileRoute("/auth/google")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});

function AuthGoogleRedirectPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect") || "/";
    const googleLoginUrl = accountApi.googleUrl(redirect);
    window.location.replace(googleLoginUrl);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0b0b] px-6 text-center text-white">
      Redirecting to Google sign-in...
    </div>
  );
}
