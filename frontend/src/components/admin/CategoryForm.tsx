import { memo, useEffect, useMemo, useState } from "react";
import { Upload } from "lucide-react";
import type { Category } from "@/data/categories";
import { Button } from "@/components/common/Button";

type FormState = {
  name: string;
  description: string;
  image: string;
};

const inputCls =
  "w-full rounded-xl border border-border bg-beige/35 px-4 py-3 text-sm text-navy outline-none transition focus:border-navy";

const createFormState = (category?: Category | null): FormState => ({
  name: category?.name || "",
  description: category?.description || "",
  image: category?.image || "",
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

  const imagePreview = useMemo(() => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }

    return form.image;
  }, [form.image, imageFile]);

  useEffect(() => {
    setForm(createFormState(initial));
    setImageFile(null);
    setError("");
  }, [initial]);

  useEffect(() => {
    return () => {
      if (imagePreview && imageFile) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imageFile, imagePreview]);

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
      payload.append("description", form.description.trim());
      payload.append("image", form.image.trim());

      if (imageFile) {
        payload.append("imageFile", imageFile);
      }

      await onSubmit(payload);

      if (!initial?.id) {
        setForm(createFormState(null));
        setImageFile(null);
      }
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "Category could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Field label="Category Name">
        <input
          required
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          className={inputCls}
        />
      </Field>

      <Field label="Description">
        <textarea
          rows={5}
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({ ...current, description: event.target.value }))
          }
          className={`${inputCls} resize-none`}
        />
      </Field>

      <Field label="Category Image Upload">
        <div className="space-y-3">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt={form.name || "Category preview"}
              className="aspect-[16/9] w-full rounded-xl object-cover object-center"
            />
          ) : null}

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-navy/25 bg-beige/30 px-4 py-4 text-sm text-navy/70 transition hover:border-navy/50">
            <Upload className="h-4 w-4" />
            <span>{imageFile ? imageFile.name : "Choose category image"}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif"
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
              className="sr-only"
            />
          </label>
        </div>
      </Field>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" disabled={saving} className="!bg-navy !text-beige">
          {saving ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
});
