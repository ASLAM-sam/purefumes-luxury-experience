import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { Button } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { SiteShell } from "@/components/layout/SiteShell";
import { accountApi } from "@/services/api";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await accountApi.forgotPassword(email);
      setMessage("If an account exists, a password reset email has been sent.");
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [email]);

  return (
    <SiteShell>
      <section className="py-16 md:py-20">
        <Container>
          <form onSubmit={submit} className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 shadow-soft">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gold">Security</p>
            <h1 className="mt-2 font-display text-4xl text-navy">Forgot Password</h1>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              className="mt-6 w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm outline-none focus:border-gold"
              disabled={loading}
            />
            {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading} className="mt-5 w-full">
              {loading ? "Sending..." : "Send Reset Link"}
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
