import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { SiteShell } from "@/components/layout/SiteShell";
import { accountApi } from "@/services/api";

export const Route = createFileRoute("/reset-password")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});

function ResetPasswordPage() {
  const nav = useNavigate();
  const token = useMemo(
    () =>
      typeof window === "undefined"
        ? ""
        : new URLSearchParams(window.location.search).get("token") || "",
    [],
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRules = /^.{6,}$/;
  const isValidPassword = passwordRules.test(password);
  const passwordsMatch = password === confirmPassword;
  const canSubmit = token && isValidPassword && passwordsMatch && !loading;

  const submit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setError("");
    setLoading(true);

    try {
      await accountApi.resetPassword(token, password);
      setMessage("Password updated. You can login now.");
      window.setTimeout(() => nav({ to: "/login" }), 2000);
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "Password could not be reset.");
    } finally {
      setLoading(false);
    }
  }, [nav, password, token, canSubmit]);

  return (
    <SiteShell>
      <section className="py-16 md:py-20">
        <Container>
          <form onSubmit={submit} className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 shadow-soft">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gold">Security</p>
            <h1 className="mt-2 font-display text-4xl text-navy">Reset Password</h1>

            <div className="mt-6">
              <input
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="New password"
                className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm outline-none focus:border-gold"
                disabled={loading}
              />
              {password && !isValidPassword && (
                <p className="mt-2 text-xs text-red-600">
                  Password must be at least 6 characters.
                </p>
              )}
            </div>

            <div className="mt-4">
              <input
                required
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm outline-none focus:border-gold"
                disabled={loading}
              />
              {confirmPassword && !passwordsMatch && (
                <p className="mt-2 text-xs text-red-600">Passwords do not match.</p>
              )}
            </div>

            {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            <Button type="submit" disabled={!canSubmit} className="mt-5 w-full">
              {loading ? "Resetting..." : "Reset Password"}
            </Button>

            <Link to="/login" className="mt-5 block text-center text-sm text-navy/65 hover:text-navy">
              Back to login
            </Link>
          </form>
        </Container>
      </section>
    </SiteShell>
  );
}
