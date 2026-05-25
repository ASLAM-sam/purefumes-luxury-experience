import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { SiteShell } from "@/components/layout/SiteShell";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { clearRedirectAfterLogin, getRedirectAfterLogin } from "@/lib/auth-redirect";

export const Route = createFileRoute("/signup")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});

function SignupPage() {
  const nav = useNavigate();
  const { signup } = useAuth();
  const { addNotification } = useNotification();
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const validationError = useMemo(() => {
    const username = form.username.trim();

    if (username && !/^[a-z0-9]{1,6}$/.test(username)) {
      return "Use up to 6 lowercase letters or numbers for your username. No spaces or symbols.";
    }

    if (form.password && form.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (form.confirmPassword && form.password !== form.confirmPassword) {
      return "Password and confirm password do not match.";
    }

    return "";
  }, [form.confirmPassword, form.password, form.username]);

  const canSubmit =
    !loading &&
    !validationError &&
    Boolean(form.name.trim() && form.email.trim() && form.username.trim() && form.mobile.trim() && form.password && form.confirmPassword);

  const submit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setError("");

      if (validationError) {
        return;
      }

      if (!form.username.trim()) {
        setError("Username is required.");
        return;
      }

      setLoading(true);

      try {
        await signup(form);
        addNotification("Account created. Please verify your email.");
        const redirect = getRedirectAfterLogin("/profile");
        clearRedirectAfterLogin();
        nav({ to: redirect });
      } catch (ex) {
        setError(ex instanceof Error ? ex.message : "Signup failed.");
      } finally {
        setLoading(false);
      }
    },
    [addNotification, form, nav, signup, validationError],
  );

  return (
    <SiteShell>
      <section className="py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-lg rounded-lg border border-border bg-card p-8 shadow-soft">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
                <UserPlus className="h-5 w-5" />
              </div>
              <p className="mt-5 text-[0.65rem] uppercase tracking-[0.4em] text-gold">Account</p>
              <h1 className="mt-2 font-display text-4xl text-navy">Create Account</h1>
            </div>

            <form onSubmit={submit} className="mt-8 grid gap-4">
              <input required value={form.name} onChange={update("name")} placeholder="Full name" className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm outline-none focus:border-gold" />
              <input required type="email" value={form.email} onChange={update("email")} placeholder="Email" className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm outline-none focus:border-gold" />
              <div>
                <input
                  required
                  value={form.username}
                  onChange={update("username")}
                  placeholder="Username"
                  autoComplete="username"
                  className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm outline-none focus:border-gold"
                />
                <p className="mt-2 text-xs leading-5 text-navy/52">
                  Up to 6 lowercase letters or numbers.
                </p>
              </div>
              <input required type="tel" value={form.mobile} onChange={update("mobile")} placeholder="Mobile number" className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm outline-none focus:border-gold" />
              <input required type="password" minLength={6} value={form.password} onChange={update("password")} placeholder="Password" className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm outline-none focus:border-gold" />
              <input required type="password" value={form.confirmPassword} onChange={update("confirmPassword")} placeholder="Confirm password" className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm outline-none focus:border-gold" />
              {validationError ? <p className="text-sm text-red-600">{validationError}</p> : null}
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <Button type="submit" disabled={!canSubmit} className="w-full">
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-navy/65">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-gold hover:text-navy">
                Login
              </Link>
            </p>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
