import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/common/Button";
import { useNotification } from "@/context/NotificationContext";
import { paymentsApi, type PaymentModeSettings } from "@/services/api";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const { addNotification } = useNotification();
  const [settings, setSettings] = useState<PaymentModeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    void paymentsApi
      .getSettings()
      .then((nextSettings) => {
        if (!active) return;
        setSettings(nextSettings);
        setError("");
      })
      .catch((ex) => {
        if (!active) return;
        setError(ex instanceof Error ? ex.message : "Settings could not be loaded.");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const updatePaymentMode = async (paymentMode: "live" | "test") => {
    setSaving(true);
    setError("");

    try {
      const nextSettings = await paymentsApi.updateSettings(paymentMode);
      setSettings(nextSettings);
      addNotification(`Payment mode switched to ${paymentMode === "test" ? "Test" : "Live"} mode.`);
    } catch (ex) {
      const message = ex instanceof Error ? ex.message : "Payment mode could not be updated.";
      setError(message);
      addNotification(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const paymentMode = settings?.paymentMode || "live";

  return (
    <AdminShell>
      <section className="rounded-[var(--radius-panel)] border border-border/70 bg-card p-5 shadow-soft sm:p-6 lg:p-8">
        <p className="fluid-eyebrow uppercase text-navy/50">Operations</p>
        <h1 className="mt-2 font-display text-[clamp(2rem,2vw+1.2rem,3rem)] text-navy">Settings</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-navy/60">
          Control live versus sandbox payment behavior without touching checkout routes or order
          persistence.
        </p>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.75fr)]">
          <div className="rounded-[1.4rem] border border-border/70 bg-[#faf7f1] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-navy/50">Payment Mode</p>
            <h2 className="mt-2 font-display text-3xl text-navy">
              {loading ? "Loading..." : paymentMode === "test" ? "Test Mode" : "Live Mode"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-navy/60">
              Test mode keeps order creation, admin visibility, inventory updates, and analytics
              intact while skipping real gateway charges. Live mode restores normal Razorpay flow.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant={paymentMode === "live" ? "gold" : "soft"}
                disabled={saving || loading}
                onClick={() => void updatePaymentMode("live")}
              >
                Live Mode
              </Button>
              <Button
                type="button"
                variant={paymentMode === "test" ? "gold" : "soft"}
                disabled={saving || loading}
                onClick={() => void updatePaymentMode("test")}
              >
                Test Mode
              </Button>
            </div>

            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          </div>

          <div className="rounded-[1.4rem] border border-border/70 bg-[#f5efe3] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-navy/50">Current Behavior</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-navy/62">
              <li>Live mode charges through Razorpay when credentials are configured.</li>
              <li>Test mode keeps the order pipeline active without hitting the real gateway.</li>
              <li>Admin analytics and order lists continue reflecting simulated test checkouts.</li>
            </ul>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
