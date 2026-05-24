import { memo, useEffect, useState } from "react";
import type { Brand } from "@/data/brands";
import type { Category } from "@/data/categories";
import { Button } from "@/components/common/Button";
import { frontendEventBus } from "@/lib/performance/event-bus";
import { categoriesApi } from "@/services/api";

type FormState = {
  name: string;
  categoryId: string;
  category: string;
};

const inputCls =
  "w-full rounded-lg border border-border bg-beige/40 px-4 py-2.5 text-sm outline-none focus:border-navy";

const createFormState = (brand?: Brand): FormState => ({
  name: brand?.name || "",
  categoryId: brand?.categoryId || "",
  category: brand?.category || brand?.categorySlug || brand?.categoryName || "",
});

const normalizeCategoryValue = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const getInitialCategoryId = (brand: Brand | null | undefined, categories: Category[]) => {
  const directId = String(brand?.categoryId || "").trim();
  if (directId && categories.some((category) => category.id === directId)) {
    return directId;
  }

  const currentCategory = normalizeCategoryValue(
    brand?.categorySlug || brand?.category || brand?.categoryName || "",
  );

  return (
    categories.find(
      (category) =>
        normalizeCategoryValue(category.slug) === currentCategory ||
        normalizeCategoryValue(category.name) === currentCategory,
    )?.id || ""
  );
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.2em] text-navy/60">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export const BrandForm = memo(function BrandForm({
  initial,
  onSubmit,
  submitLabel = "Save Brand",
}: {
  initial?: Brand | null;
  onSubmit: (payload: FormData) => Promise<void>;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<FormState>(() => createFormState(initial || undefined));
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(createFormState(initial || undefined));
    setError("");
  }, [initial]);

  useEffect(() => {
    let isActive = true;

    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const nextCategories = await categoriesApi.listAdmin({ forceFresh: true });
        if (!isActive) return;
        const visibleCategories = nextCategories.filter((category) => !category.isDeleted);
        setCategories(visibleCategories);
        setForm((current) => ({
          ...current,
          categoryId: current.categoryId || getInitialCategoryId(initial, visibleCategories),
        }));
      } catch (ex) {
        if (!isActive) return;
        setCategories([]);
        setError(ex instanceof Error ? ex.message : "Categories could not be loaded.");
      } finally {
        if (isActive) {
          setCategoriesLoading(false);
        }
      }
    };

    void loadCategories();
    const unsubscribe = frontendEventBus.subscribe("catalog:changed", ({ scope }) => {
      if (scope === "categories" || scope === "all") {
        void loadCategories();
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [initial]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const trimmedName = form.name.trim();
      const selectedCategory = categories.find((category) => category.id === form.categoryId);

      if (!trimmedName) {
        throw new Error("Brand name is required.");
      }

      if (!selectedCategory) {
        throw new Error("Select a category.");
      }

      const payload = new FormData();
      payload.append("name", trimmedName);
      payload.append("categoryId", selectedCategory.id);
      payload.append("category", selectedCategory.slug);
      payload.append("categoryName", selectedCategory.name);

      await onSubmit(payload);
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "Brand could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Brand Name">
          <input
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className={inputCls}
          />
        </Field>

        <Field label="Category">
          <select
            required
            value={form.categoryId}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                categoryId: event.target.value,
                category: categories.find((category) => category.id === event.target.value)?.slug || "",
              }))
            }
            className={inputCls}
            disabled={categoriesLoading}
          >
            <option value="">
              {categoriesLoading ? "Loading categories..." : "Select category"}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" disabled={saving} className="!bg-navy !text-beige">
          {saving ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
});
