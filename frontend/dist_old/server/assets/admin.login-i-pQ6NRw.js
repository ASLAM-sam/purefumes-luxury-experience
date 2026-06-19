import { r as reactExports, j as jsxRuntimeExports, ay as User, az as Lock } from "./vendor-react-98xxEzFV.js";
import { f as useNavigate } from "./vendor-tanstack-DkD25YnA.js";
import { N as useAuth, B as Button } from "./router-DvCKRw9U.js";
import { m as motion } from "./vendor-motion-3kNaalGV.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "util";
import "stream";
import "path";
import "http";
import "https";
import "url";
import "fs";
import "crypto";
import "assert";
import "./worker-entry-8w9vAzi1.js";
import "node:events";
import "os";
import "zlib";
import "events";
import "./vendor-charts-Ot63D9Dz.js";
function AdminLogin() {
  const nav = useNavigate();
  const {
    login,
    logout,
    reloadUser
  } = useAuth();
  const [identifier, setIdentifier] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const submit = reactExports.useCallback(async (event) => {
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
      const verifiedSessionUser = await reloadUser();
      if (!verifiedSessionUser) {
        setError("Sign-in succeeded but your session cookie was blocked on this device/browser. Please allow cookies and try again.");
        return;
      }
      nav({
        to: "/admin"
      });
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }, [identifier, login, logout, nav, password, reloadUser]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-navy px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
    opacity: 0,
    y: 20
  }, animate: {
    opacity: 1,
    y: 0
  }, transition: {
    duration: 0.5
  }, className: "w-full max-w-md rounded-3xl bg-background p-10 shadow-luxe", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-4xl text-navy", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Pure" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gold", children: "fumes" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[0.65rem] uppercase tracking-[0.4em] text-navy/50", children: "Admin Portal" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "mt-8 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.25em] text-navy/60", children: "Email or Username" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: identifier, onChange: (event) => setIdentifier(event.target.value), required: true, autoComplete: "username", className: "w-full rounded-xl border border-border bg-beige/40 py-3 pl-11 pr-4 outline-none focus:border-navy" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.25em] text-navy/60", children: "Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: password, onChange: (event) => setPassword(event.target.value), required: true, autoComplete: "current-password", className: "w-full rounded-xl border border-border bg-beige/40 py-3 pl-11 pr-4 outline-none focus:border-navy" })
        ] })
      ] }),
      error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-red-600", children: error }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: loading, className: "w-full !bg-navy !text-beige", children: loading ? "Signing in..." : "Sign In" })
    ] })
  ] }) });
}
export {
  AdminLogin as component
};
