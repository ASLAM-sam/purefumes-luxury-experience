import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Lock, User } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const nav = useNavigate();
  const { login, logout } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setError("");
      setLoading(true);

      try {
        const user = await login(identifier, password);
        if (user.role !== "admin") {
          await logout();
          setError("Admin access is required for this portal.");
          return;
        }

        nav({ to: "/admin" });
      } catch (ex) {
        setError(ex instanceof Error ? ex.message : "Login failed");
      } finally {
        setLoading(false);
      }
    },
    [identifier, login, logout, nav, password],
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-3xl bg-background p-10 shadow-luxe"
      >
        <div className="text-center">
          <h1 className="font-display text-4xl text-navy">
            <span>Pure</span>
            <span className="text-gold">fumes</span>
          </h1>
          <p className="mt-1 text-[0.65rem] uppercase tracking-[0.4em] text-navy/50">
            Admin Portal
          </p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.25em] text-navy/60">
              Email or Username
            </span>
            <div className="relative mt-2">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" />
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
                autoComplete="username"
                className="w-full rounded-xl border border-border bg-beige/40 py-3 pl-11 pr-4 outline-none focus:border-navy"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-[0.25em] text-navy/60">Password</span>
            <div className="relative mt-2">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-border bg-beige/40 py-3 pl-11 pr-4 outline-none focus:border-navy"
              />
            </div>
          </label>

          {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}

          <Button type="submit" disabled={loading} className="w-full !bg-navy !text-beige">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
