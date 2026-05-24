import { createFileRoute } from "@tanstack/react-router";
import { Pencil, RefreshCw, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useNotification } from "@/context/NotificationContext";
import type { Product } from "@/data/products";
import { formatINR } from "@/lib/money";
import {
  couponsApi,
  productsApi,
  type Coupon,
  type CouponApplicabilityType,
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
  applicabilityType: CouponApplicabilityType;
  applicableProducts: SelectedPerfume[];
};

type SelectedPerfume = {
  id: string;
  name: string;
  brand?: string;
  image?: string;
  price?: number;
};

const initialForm: CouponFormState = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  expiryDate: "",
  applicabilityType: "all",
  applicableProducts: [],
};

const formatCurrency = formatINR;

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

const toSelectedPerfume = (
  product: Product | Coupon["applicableProducts"][number],
): SelectedPerfume => ({
  id: String(product.id || product._id || ""),
  name: product.name || "Untitled perfume",
  brand: product.brand || "",
  image: product.image || product.images?.[0] || "",
  price: product.price,
});

const getCouponForm = (coupon: Coupon): CouponFormState => ({
  code: coupon.code,
  discountType: coupon.discountType,
  discountValue: String(coupon.discountValue || ""),
  minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : "",
  maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : "",
  expiryDate: coupon.expiryDate ? coupon.expiryDate.slice(0, 10) : "",
  applicabilityType: coupon.applicabilityType || "all",
  applicableProducts: (coupon.applicableProducts || [])
    .map(toSelectedPerfume)
    .filter((product) => product.id),
});

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
  const [editingCouponId, setEditingCouponId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);

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

  useEffect(() => {
    if (form.applicabilityType !== "selected") {
      setProductResults([]);
      setProductSearchLoading(false);
      return;
    }

    let active = true;
    const timeoutId = window.setTimeout(() => {
      setProductSearchLoading(true);
      void productsApi
        .list(
          {
            search: productSearch.trim() || undefined,
            limit: 8,
          },
          { forceFresh: true },
        )
        .then((products) => {
          if (!active) return;
          setProductResults(products);
        })
        .catch(() => {
          if (!active) return;
          setProductResults([]);
        })
        .finally(() => {
          if (active) setProductSearchLoading(false);
        });
    }, 220);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [form.applicabilityType, productSearch]);

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
        ...(key === "applicabilityType" && value === "all" ? { applicableProducts: [] } : {}),
      }));
    };

  const selectPerfume = (product: Product) => {
    const nextProduct = toSelectedPerfume(product);
    if (!nextProduct.id) return;

    setForm((current) => {
      if (current.applicableProducts.some((item) => item.id === nextProduct.id)) {
        return current;
      }

      return {
        ...current,
        applicableProducts: [...current.applicableProducts, nextProduct],
      };
    });
    setProductSearch("");
  };

  const removePerfume = (productId: string) => {
    setForm((current) => ({
      ...current,
      applicableProducts: current.applicableProducts.filter((product) => product.id !== productId),
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingCouponId("");
    setProductSearch("");
    setProductResults([]);
  };

  const editCoupon = (coupon: Coupon) => {
    setForm(getCouponForm(coupon));
    setEditingCouponId(coupon.id || coupon._id || "");
    setProductSearch("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveCoupon = async (event: React.FormEvent) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      if (form.applicabilityType === "selected" && form.applicableProducts.length === 0) {
        throw new Error("Select at least one fragrance for this coupon.");
      }

      const payload = {
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        maxDiscount:
          form.discountType === "percentage" && form.maxDiscount ? Number(form.maxDiscount) : null,
        expiryDate: form.expiryDate ? new Date(`${form.expiryDate}T23:59:59`).toISOString() : null,
        isActive: editingCouponId
          ? (coupons.find((coupon) => (coupon.id || coupon._id) === editingCouponId)?.isActive ??
            true)
          : true,
        applicabilityType: form.applicabilityType,
        applicableProducts:
          form.applicabilityType === "selected"
            ? form.applicableProducts.map((product) => product.id)
            : [],
      };

      if (editingCouponId) {
        const updatedCoupon = await couponsApi.update(editingCouponId, payload);
        setCoupons((current) =>
          current.map((coupon) =>
            (coupon.id || coupon._id) === editingCouponId ? updatedCoupon : coupon,
          ),
        );
        addNotification("Coupon updated successfully.");
      } else {
        const createdCoupon = await couponsApi.create(payload);
        setCoupons((current) => [createdCoupon, ...current]);
        addNotification("Coupon created successfully.");
      }

      resetForm();
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
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-navy/55">
                {editingCouponId ? "Edit Coupon" : "Create Coupon"}
              </p>
              {editingCouponId ? (
                <p className="mt-1 text-xs text-navy/50">
                  Update values without changing the coupon code history.
                </p>
              ) : null}
            </div>
            {editingCouponId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-border bg-beige/40 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.18em] text-navy/65 transition hover:border-gold/60 hover:text-gold"
              >
                Cancel
              </button>
            ) : null}
          </div>
          <form onSubmit={saveCoupon} className="mt-5 space-y-4">
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

            <div className="rounded-2xl border border-border/70 bg-beige/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-navy/60">
                Coupon Applicability
              </p>
              <div className="mt-4 grid gap-3">
                {[
                  { value: "all", label: "All Perfumes" },
                  { value: "selected", label: "Selected Perfumes Only" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                      form.applicabilityType === option.value
                        ? "border-gold/70 bg-white text-navy shadow-soft"
                        : "border-border bg-white/55 text-navy/68 hover:border-gold/45"
                    }`}
                  >
                    <input
                      type="radio"
                      name="applicabilityType"
                      value={option.value}
                      checked={form.applicabilityType === option.value}
                      onChange={updateForm("applicabilityType")}
                      className="h-4 w-4 accent-[#8b5f3d]"
                    />
                    <span className="font-medium">{option.label}</span>
                  </label>
                ))}
              </div>

              {form.applicabilityType === "selected" ? (
                <div className="mt-4 space-y-4">
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/45" />
                    <input
                      type="search"
                      value={productSearch}
                      onChange={(event) => setProductSearch(event.target.value)}
                      placeholder="Search perfumes by name"
                      className="w-full rounded-lg border border-border bg-white px-10 py-3 text-sm text-navy outline-none transition focus:border-gold"
                    />
                    {productSearch ? (
                      <button
                        type="button"
                        onClick={() => setProductSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/45 transition hover:text-navy"
                        aria-label="Clear perfume search"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </label>

                  <div className="rounded-xl border border-border bg-white/70 p-2">
                    {productSearchLoading ? (
                      <p className="px-3 py-2 text-sm text-navy/50">Searching perfumes...</p>
                    ) : productResults.length ? (
                      productResults
                        .filter(
                          (product) =>
                            !form.applicableProducts.some(
                              (selected) => selected.id === (product.id || product._id),
                            ),
                        )
                        .slice(0, 6)
                        .map((product) => (
                          <button
                            key={product.id || product._id}
                            type="button"
                            onClick={() => selectPerfume(product)}
                            className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm text-navy transition hover:bg-beige/60"
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-medium">{product.name}</span>
                              <span className="mt-0.5 block truncate text-xs text-navy/50">
                                {product.brand || "Purefumes"}
                              </span>
                            </span>
                            <span className="shrink-0 text-xs uppercase tracking-[0.16em] text-gold">
                              Select
                            </span>
                          </button>
                        ))
                    ) : (
                      <p className="px-3 py-2 text-sm text-navy/50">
                        {productSearch.trim()
                          ? "No perfumes found."
                          : "Start typing to search perfumes."}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[0.65rem] uppercase tracking-[0.22em] text-navy/50">
                      Selected Perfumes
                    </p>
                    {form.applicableProducts.length ? (
                      <div className="flex flex-wrap gap-2">
                        {form.applicableProducts.map((product) => (
                          <span
                            key={product.id}
                            className="inline-flex max-w-full items-center gap-2 rounded-full border border-gold/30 bg-white px-3 py-2 text-xs text-navy shadow-soft"
                          >
                            <span className="max-w-[12rem] truncate">
                              {product.name}
                              {product.brand ? ` - ${product.brand}` : ""}
                            </span>
                            <button
                              type="button"
                              onClick={() => removePerfume(product.id)}
                              className="text-navy/45 transition hover:text-red-600"
                              aria-label={`Remove ${product.name}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-lg border border-dashed border-border bg-white/55 px-3 py-3 text-sm text-navy/50">
                        No perfumes selected yet.
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center rounded-lg bg-navy px-5 py-3 text-xs uppercase tracking-[0.24em] text-beige transition hover:opacity-90 disabled:opacity-50"
            >
              {saving
                ? editingCouponId
                  ? "Saving..."
                  : "Creating..."
                : editingCouponId
                  ? "Save Coupon"
                  : "Create Coupon"}
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
                  <th className="px-6 py-4 text-left">Applicability</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Expiry</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-navy/50">
                      Loading coupons...
                    </td>
                  </tr>
                ) : null}

                {!loading && error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : null}

                {!loading && !error && coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-navy/50">
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
                        <td className="px-6 py-4 text-navy/70">
                          {coupon.applicabilityType === "selected" ? (
                            <div className="max-w-[14rem]">
                              <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
                                Selected only
                              </p>
                              <p className="mt-1 line-clamp-2 text-xs text-navy/55">
                                {coupon.applicableProducts
                                  .map((product) => product.name)
                                  .filter(Boolean)
                                  .join(", ") || `${coupon.applicableProductIds.length} perfumes`}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs uppercase tracking-[0.18em] text-navy/50">
                              All Perfumes
                            </span>
                          )}
                        </td>
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
                              onClick={() => editCoupon(coupon)}
                              className="inline-flex items-center gap-2 rounded-lg border border-border bg-beige/30 px-4 py-2 text-xs uppercase tracking-[0.18em] text-navy transition hover:bg-beige/60 disabled:opacity-50"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
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
