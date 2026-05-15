import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogIn } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { SiteShell } from "@/components/layout/SiteShell";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { accountApi } from "@/services/api";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const getRedirectPath = () => {
  if (typeof window === "undefined") return "/";

  const fromUrl = new URLSearchParams(window.location.search).get("redirect");
  const fromStorage = window.localStorage.getItem("purefumes_redirect_after_login");
  const redirect = fromUrl || fromStorage || "/";
  return redirect.startsWith("/") ? redirect : "/";
};

function LoginPage() {
  const nav = useNavigate();
  const { user, login } = useAuth();
  const { addNotification } = useNotification();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleAuthEnabled, setGoogleAuthEnabled] = useState(true);
  const [googleAuthMessage, setGoogleAuthMessage] = useState("");
  const oauthError = (() => {
    if (typeof window === "undefined") return "";

    const params = new URLSearchParams(window.location.search);
    if (params.get("error") !== "google_oauth") return "";
    return params.get("message") || "Google sign-in could not be completed. Please try again.";
  })();
  const redirectPath = useMemo(getRedirectPath, []);

  useEffect(() => {
    if (!user) return;
    window.localStorage.removeItem("purefumes_redirect_after_login");
    nav({ to: redirectPath });
  }, [nav, redirectPath, user]);

  useEffect(() => {
    let active = true;

    accountApi
      .authConfig()
      .then((config) => {
        if (!active) return;

        setGoogleAuthEnabled(config.google.enabled);
        setGoogleAuthMessage(
          config.google.enabled || config.google.missing.length === 0
            ? ""
            : `Google sign-in needs: ${config.google.missing.join(", ")}`,
        );
      })
      .catch(() => {
        if (!active) return;
        setGoogleAuthEnabled(true);
        setGoogleAuthMessage("");
      });

    return () => {
      active = false;
    };
  }, []);

  const submit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setError("");
      setLoading(true);

      try {
        await login(identifier, password);
        window.localStorage.removeItem("purefumes_redirect_after_login");
        addNotification("Signed in successfully.");
        nav({ to: redirectPath });
      } catch (ex) {
        setError(ex instanceof Error ? ex.message : "Login failed.");
      } finally {
        setLoading(false);
      }
    },
    [addNotification, identifier, login, nav, password, redirectPath],
  );

  const startGoogleLogin = useCallback(() => {
    const googleLoginUrl = accountApi.googleUrl(redirectPath);
    console.log("Starting Google OAuth login", { redirectPath, googleLoginUrl });
    window.location.href = googleLoginUrl;
  }, [redirectPath]);

  return (
    <SiteShell>
      <section className="py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 shadow-soft">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
                <LogIn className="h-5 w-5" />
              </div>
              <p className="mt-5 text-[0.65rem] uppercase tracking-[0.4em] text-gold">Account</p>
              <h1 className="mt-2 font-display text-4xl text-navy">Login</h1>
            </div>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <input
                required
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="Email or mobile number"
                autoComplete="username"
                className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold"
              />
              <input
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold"
              />
              {error || oauthError ? (
                <p className="text-sm text-red-600">{error || oauthError}</p>
              ) : null}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {googleAuthEnabled ? (
              <button
                type="button"
                onClick={startGoogleLogin}
                className="mt-4 flex w-full items-center justify-center rounded-lg border border-border bg-white px-4 py-3 text-sm font-medium text-navy transition hover:border-gold"
              >
                Continue with Google
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="mt-4 flex w-full cursor-not-allowed items-center justify-center rounded-lg border border-border bg-white/70 px-4 py-3 text-sm font-medium text-navy/50"
              >
                Continue with Google
              </button>
            )}
            {googleAuthMessage ? (
              <p className="mt-3 text-sm text-amber-700">{googleAuthMessage}</p>
            ) : null}

            <div className="mt-6 flex items-center justify-between text-sm text-navy/65">
              <Link to="/forgot-password" className="hover:text-navy">
                Forgot password?
              </Link>
              <Link to="/signup" className="font-medium text-gold hover:text-navy">
                Create account
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
