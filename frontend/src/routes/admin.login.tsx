import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Lock, User } from "lucide-react";
import { Button } from "@/components/common/Button";
import { authApi, isUsingMock } from "@/services/api";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const nav = useNavigate();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await authApi.login(u, p);
      nav({ to: "/admin" });
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }, [u, p, nav]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-background rounded-3xl p-10 shadow-luxe"
      >
        <div className="text-center">
          <h1 className="font-display text-4xl text-navy">
            <span>Pure</span><span className="text-gold">fumes</span>
          </h1>
          <p className="text-[0.65rem] tracking-[0.4em] uppercase text-navy/50 mt-1">Admin Portal</p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.25em] text-navy/60">Username</span>
            <div className="mt-2 relative">
              <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-navy/40" />
              <input
                value={u} onChange={(e) => setU(e.target.value)}
                required autoComplete="username"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-beige/40 border border-border focus:border-navy outline-none"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.25em] text-navy/60">Password</span>
            <div className="mt-2 relative">
              <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-navy/40" />
              <input
                type="password" value={p} onChange={(e) => setP(e.target.value)}
                required autoComplete="current-password"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-beige/40 border border-border focus:border-navy outline-none"
              />
            </div>
          </label>

          {err && <p className="text-sm text-red-600 text-center">{err}</p>}

          <Button type="submit" disabled={loading} className="w-full !bg-navy !text-beige">
            {loading ? "Signing in…" : "Sign In"}
          </Button>

          {isUsingMock && (
            <p className="text-[0.65rem] text-center text-navy/50 leading-relaxed">
              Mock mode · default credentials <code className="font-mono">admin</code> / <code className="font-mono">purefumes2025</code>
            </p>
          )}
        </form>
      </motion.div>
    </div>
  );
}
