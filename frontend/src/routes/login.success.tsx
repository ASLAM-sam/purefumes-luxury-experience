import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Container } from "@/components/common/Container";
import { SiteShell } from "@/components/layout/SiteShell";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

export const Route = createFileRoute("/login/success")({
  component: GoogleLoginSuccessPage,
});

const getSafeRedirect = () => {
  if (typeof window === "undefined") return "/profile";

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect") || window.localStorage.getItem("purefumes_redirect_after_login");

  return redirect && redirect.startsWith("/") && !redirect.startsWith("//")
    ? redirect
    : "/profile";
};

function GoogleLoginSuccessPage() {
  const navigate = useNavigate();
  const { reloadUser } = useAuth();
  const { addNotification } = useNotification();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const completeGoogleLogin = async () => {
      const redirectPath = getSafeRedirect();

      const user = await reloadUser();
      if (!user) {
        throw new Error("Google login completed, but the user session could not be restored.");
      }

      window.localStorage.removeItem("purefumes_redirect_after_login");
      addNotification(`Welcome back, ${user.name}.`);
      navigate({ to: redirectPath || "/" });
    };

    completeGoogleLogin().catch((cause) => {
      if (!active) return;
      setError(cause instanceof Error ? cause.message : "Google sign-in failed.");
    });

    return () => {
      active = false;
    };
  }, [addNotification, navigate, reloadUser]);

  return (
    <SiteShell>
      <section className="py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
            {error ? (
              <>
                <h1 className="font-display text-4xl text-navy">Google Login Failed</h1>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{error}</p>
                <Link
                  to="/login"
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-navy px-6 py-3 text-xs uppercase tracking-[0.28em] text-beige transition duration-300 ease-in-out hover:opacity-90"
                >
                  Return to Login
                </Link>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <LoaderCircle className="h-8 w-8 animate-spin" />
                </div>
                <h1 className="mt-6 font-display text-4xl text-navy">Finishing Sign-In</h1>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  We&apos;re verifying your Google account and loading your Purefumes profile.
                </p>
              </>
            )}
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
