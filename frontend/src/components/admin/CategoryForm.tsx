import { memo, useEffect, useState } from "react";
import { Palette, Upload } from "lucide-react";
import type { Category } from "@/data/categories";
import { Button } from "@/components/common/Button";

type FormState = {
  name: string;
  slug: string;
  image: string;
  icon: string;
  color: string;
  description: string;
  sortOrder: string;
  featured: boolean;
  isActive: boolean;
};

const inputCls =
  "w-full rounded-xl border border-border bg-beige/35 px-4 py-3 text-sm text-navy outline-none transition focus:border-navy";

const createFormState = (category?: Category | null): FormState => ({
  name: category?.name || "",
  slug: category?.slug || "",
  image: category?.image || "",
  icon: category?.icon || "",
  color: category?.color || "#8b5f3d",
  description: category?.description || "",
  sortOrder: category ? String(category.sortOrder) : "0",
  featured: Boolean(category?.featured),
  isActive: category?.isActive !== false,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.2em] text-navy/55">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export const CategoryForm = memo(function CategoryForm({
  initial,
  onSubmit,
  submitLabel = "Save Category",
}: {
  initial?: Category | null;
  onSubmit: (payload: FormData) => Promise<void>;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<FormState>(() => createFormState(initial));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(createFormState(initial));
    setImageFile(null);
    setError("");
  }, [initial]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!form.name.trim()) {
        throw new Error("Category name is required.");
      }

      const payload = new FormData();
      payload.append("name", form.name.trim());
      payload.append("slug", form.slug.trim());
      payload.append("image", form.image.trim());
      payload.append("icon", form.icon.trim());
      payload.append("color", form.color.trim());
      payload.append("description", form.description.trim());
      payload.append("sortOrder", form.sortOrder.trim() || "0");
      payload.append("featured", String(form.featured));
      payload.append("isActive", String(form.isActive));

      if (imageFile) {
        payload.append("imageFile", imageFile);
      }

      await onSubmit(payload);
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "Category could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Category Name">
          <input
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className={inputCls}
          />
        </Field>
        <Field label="Slug">
          <input
            value={form.slug}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
            placeholder="auto-generated if left blank"
            className={inputCls}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem_10rem]">
        <Field label="Icon">
          <input
            value={form.icon}
            onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))}
            placeholder="e.g. crown"
            className={inputCls}
          />
        </Field>
        <Field label="Color">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-beige/30 px-3 py-2">
            <span
              className="h-8 w-8 rounded-full border border-white/70 shadow-soft"
              style={{ backgroundColor: form.color || "#8b5f3d" }}
            />
            <input
              value={form.color}
              onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))}
              placeholder="#8b5f3d"
              className="min-h-10 w-full bg-transparent text-sm text-navy outline-none"
            />
            <Palette className="h-4 w-4 text-navy/45" />
          </div>
        </Field>
        <Field label="Sort Order">
          <input
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(event) =>
              setForm((current) => ({ ...current, sortOrder: event.target.value }))
            }
            className={inputCls}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-beige/30 px-4 py-3.5">
          <div>
            <span className="text-sm text-navy">Featured category</span>
            <p className="mt-1 text-xs text-navy/55">Shows in homepage and priority navigation.</p>
          </div>
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) =>
              setForm((current) => ({ ...current, featured: event.target.checked }))
            }
            className="h-5 w-5 accent-navy"
          />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-beige/30 px-4 py-3.5">
          <div>
            <span className="text-sm text-navy">Active category</span>
            <p className="mt-1 text-xs text-navy/55">Hidden categories stay out of storefront navigation.</p>
          </div>
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              setForm((current) => ({ ...current, isActive: event.target.checked }))
            }
            className="h-5 w-5 accent-navy"
          />
        </label>
      </div>

      <Field label="Description">
        <textarea
          rows={4}
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({ ...current, description: event.target.value }))
          }
          className={`${inputCls} resize-none`}
        />
      </Field>

      <div className="space-y-4 rounded-[1.4rem] border border-border bg-beige/15 p-4">
        <Field label="Category Image URL">
          <input
            type="url"
            value={form.image}
            onChange={(event) => {
              setImageFile(null);
              setForm((current) => ({ ...current, image: event.target.value }));
            }}
            placeholder="https://example.com/category.jpg"
            className={inputCls}
          />
        </Field>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-navy/25 bg-beige/30 px-4 py-4 text-sm text-navy/70 transition hover:border-navy/50">
          <Upload className="h-4 w-4" />
          <span>{imageFile ? imageFile.name : "Upload category image"}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            className="sr-only"
          />
        </label>
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
