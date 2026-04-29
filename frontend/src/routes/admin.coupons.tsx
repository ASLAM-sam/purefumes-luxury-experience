import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useNotification } from "@/context/NotificationContext";
import {
  couponsApi,
  type Coupon,
  type CouponDiscountType,
} from "@/services/api";

export const Route = createFileRoute("/admin/coupons")({
  component: AdminCoupons,
});

type CouponFormState = {
  code: string;
  discountType: CouponDiscountType;
  discountValue: string;
  minOrderAmount: string;
  maxDiscount: string;
  expiryDate: string;
};

const initialForm: CouponFormState = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  expiryDate: "",
};

const formatCurrency = (amount: number) => `Rs. ${Number(amount || 0).toLocaleString("en-IN")}`;

const formatDiscount = (coupon: Coupon) => {
  if (coupon.discountType === "fixed") {
    return formatCurrency(coupon.discountValue);
  }

  const maxDiscountLabel = coupon.maxDiscount ? ` up to ${formatCurrency(coupon.maxDiscount)}` : "";
  return `${coupon.discountValue}%${maxDiscountLabel}`;
};

const isCouponExpired = (coupon: Coupon) =>
  Boolean(coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now());

const formatExpiry = (coupon: Coupon) => {
  if (!coupon.expiryDate) {
    return "No expiry";
  }

  return new Date(coupon.expiryDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function AdminCoupons() {
  const { addNotification } = useNotification();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState<CouponFormState>(initialForm);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pendingToggleId, setPendingToggleId] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState("");

  const loadCoupons = useCallback(
    async (silent = false) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const nextCoupons = await couponsApi.list();
        setCoupons(nextCoupons);
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : "Coupons could not be loaded.";
        setError(message);
        if (silent) {
          addNotification(message, "error");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [addNotification],
  );

  useEffect(() => {
    void loadCoupons();
  }, [loadCoupons]);

  const activeCoupons = useMemo(
    () => coupons.filter((coupon) => coupon.isActive && !isCouponExpired(coupon)).length,
    [coupons],
  );

  const updateForm =
    (key: keyof CouponFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value =
        key === "code" ? event.target.value.toUpperCase().replace(/\s+/g, "") : event.target.value;

      setForm((current) => ({
        ...current,
        [key]: value,
        ...(key === "discountType" && value === "fixed" ? { maxDiscount: "" } : {}),
      }));
    };

  const createCoupon = async (event: React.FormEvent) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const createdCoupon = await couponsApi.create({
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        maxDiscount:
          form.discountType === "percentage" && form.maxDiscount
            ? Number(form.maxDiscount)
            : null,
        expiryDate: form.expiryDate ? new Date(`${form.expiryDate}T23:59:59`).toISOString() : null,
        isActive: true,
      });

      setCoupons((current) => [createdCoupon, ...current]);
      setForm(initialForm);
      addNotification("Coupon created successfully.");
    } catch (createError) {
      const message =
        createError instanceof Error ? createError.message : "Coupon could not be created.";
      setError(message);
      addNotification(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleCoupon = async (coupon: Coupon) => {
    const couponId = coupon.id || coupon._id;
    if (!couponId) return;

    setPendingToggleId(couponId);

    try {
      const updatedCoupon = await couponsApi.toggle(couponId);
      setCoupons((current) =>
        current.map((item) => ((item.id || item._id) === couponId ? updatedCoupon : item)),
      );
      addNotification(
        updatedCoupon.isActive ? "Coupon enabled successfully." : "Coupon disabled successfully.",
      );
    } catch (toggleError) {
      addNotification(
        toggleError instanceof Error ? toggleError.message : "Coupon status could not be updated.",
        "error",
      );
    } finally {
      setPendingToggleId("");
    }
  };

  const deleteCoupon = async (coupon: Coupon) => {
    const couponId = coupon.id || coupon._id;
    if (!couponId) return;

    setPendingDeleteId(couponId);

    try {
      await couponsApi.remove(couponId);
      setCoupons((current) => current.filter((item) => (item.id || item._id) !== couponId));
      addNotification("Coupon deleted successfully.");
    } catch (deleteError) {
      addNotification(
        deleteError instanceof Error ? deleteError.message : "Coupon could not be deleted.",
        "error",
      );
    } finally {
      setPendingDeleteId("");
    }
  };

  return (
    <AdminShell>
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[0.65rem] tracking-[0.4em] uppercase text-navy/50">Discounts</p>
          <h1 className="mt-1 font-display text-4xl text-navy">Coupons</h1>
          <p className="mt-2 text-sm text-navy/60">
            {activeCoupons} active coupon{activeCoupons === 1 ? "" : "s"} ready for checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadCoupons(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-navy px-4 py-2.5 text-xs uppercase tracking-[0.22em] text-navy transition hover:bg-navy hover:text-beige disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <p className="text-xs uppercase tracking-[0.2em] text-navy/55">Create Coupon</p>
          <form onSubmit={createCoupon} className="mt-5 space-y-4">
            <div>
              <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60">
                Coupon Code
              </span>
              <input
                required
                value={form.code}
                onChange={updateForm("code")}
                placeholder="SAVE10"
                className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm uppercase text-navy outline-none transition focus:border-gold"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div>
                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60">
                  Discount Type
                </span>
                <select
                  value={form.discountType}
                  onChange={updateForm("discountType")}
                  className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>

              <div>
                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60">
                  Discount Value
                </span>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discountValue}
                  onChange={updateForm("discountValue")}
                  placeholder={form.discountType === "percentage" ? "10" : "500"}
                  className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold"
                />
              </div>
            </div>

            <div>
              <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60">
                Minimum Order Value
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.minOrderAmount}
                onChange={updateForm("minOrderAmount")}
                placeholder="0"
                className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold"
              />
            </div>

            {form.discountType === "percentage" ? (
              <div>
                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60">
                  Max Discount
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.maxDiscount}
                  onChange={updateForm("maxDiscount")}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold"
                />
              </div>
            ) : null}

            <div>
              <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60">
                Expiry Date
              </span>
              <input
                type="date"
                value={form.expiryDate}
                onChange={updateForm("expiryDate")}
                className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold"
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center rounded-lg bg-navy px-5 py-3 text-xs uppercase tracking-[0.24em] text-beige transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Coupon"}
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-beige/50 text-xs uppercase tracking-[0.2em] text-navy/70">
                <tr>
                  <th className="px-6 py-4 text-left">Code</th>
                  <th className="px-6 py-4 text-left">Discount</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Expiry</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-navy/50">
                      Loading coupons...
                    </td>
                  </tr>
                ) : null}

                {!loading && error ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : null}

                {!loading && !error && coupons.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-navy/50">
                      No coupons created yet.
                    </td>
                  </tr>
                ) : null}

                {!loading &&
                  !error &&
                  coupons.map((coupon) => {
                    const couponId = coupon.id || coupon._id;
                    const expired = isCouponExpired(coupon);

                    return (
                      <tr key={couponId} className="align-top transition-colors hover:bg-beige/30">
                        <td className="px-6 py-4">
                          <p className="font-medium text-navy">{coupon.code}</p>
                          <p className="mt-1 text-xs text-navy/50">
                            Min order {formatCurrency(coupon.minOrderAmount)}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-navy/75">{formatDiscount(coupon)}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] ${
                              expired
                                ? "bg-red-100 text-red-700"
                                : coupon.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {expired ? "Expired" : coupon.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-navy/70">{formatExpiry(coupon)}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => void toggleCoupon(coupon)}
                              disabled={pendingToggleId === couponId}
                              className="rounded-lg border border-border bg-beige/30 px-4 py-2 text-xs uppercase tracking-[0.18em] text-navy transition hover:bg-beige/60 disabled:opacity-50"
                            >
                              {pendingToggleId === couponId
                                ? "Saving..."
                                : coupon.isActive
                                  ? "Disable"
                                  : "Enable"}
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteCoupon(coupon)}
                              disabled={pendingDeleteId === couponId}
                              className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-xs uppercase tracking-[0.18em] text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {pendingDeleteId === couponId ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
