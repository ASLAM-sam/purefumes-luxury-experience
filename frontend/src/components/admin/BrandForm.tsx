import { memo, useEffect, useState } from "react";
import { Upload } from "lucide-react";
import type { Brand } from "@/data/brands";
import { Button } from "@/components/common/Button";

type FormState = {
  name: string;
  category: Brand["category"];
  logo: string;
};

const CATEGORY_OPTIONS: Array<{ label: string; value: Brand["category"] }> = [
  { label: "Middle Eastern", value: "middle-eastern" },
  { label: "Designer", value: "designer" },
  { label: "Niche", value: "niche" },
];

const inputCls =
  "w-full rounded-lg border border-border bg-beige/40 px-4 py-2.5 text-sm outline-none focus:border-navy";

const createFormState = (brand?: Brand): FormState => ({
  name: brand?.name || "",
  category: brand?.category || "designer",
  logo: brand?.logo || "",
});

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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(createFormState(initial || undefined));
    setLogoFile(null);
    setError("");
  }, [initial]);

  useEffect(() => {
    if (!logoFile) {
      setPreview(form.logo.trim());
      return;
    }

    const objectUrl = URL.createObjectURL(logoFile);
    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [form.logo, logoFile]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const trimmedName = form.name.trim();
      const trimmedLogo = form.logo.trim();

      if (!trimmedName) {
        throw new Error("Brand name is required.");
      }

      const payload = new FormData();
      payload.append("name", trimmedName);
      payload.append("category", form.category);

      if (logoFile) {
        payload.append("logo", logoFile);
      } else {
        payload.append("logo", trimmedLogo);
      }

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
            value={form.category}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                category: event.target.value as Brand["category"],
              }))
            }
            className={inputCls}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_12rem]">
        <div className="space-y-4">
          <Field label="Logo URL">
            <input
              type="url"
              value={form.logo}
              onChange={(event) => {
                const nextLogo = event.target.value;

                setLogoFile(null);
                setForm((current) => ({ ...current, logo: nextLogo }));
              }}
              placeholder="https://example.com/logo.jpg"
              className={inputCls}
            />
          </Field>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-navy/25 bg-beige/30 px-4 py-4 text-sm text-navy/70 transition hover:border-navy/50">
            <Upload className="h-4 w-4" />
            <span>{logoFile ? logoFile.name : "Upload logo"}</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setLogoFile(event.target.files?.[0] || null)}
              className="sr-only"
            />
          </label>
        </div>

        <div className="flex items-center justify-center rounded-2xl border border-border bg-beige/60 p-4">
          {preview ? (
            <img
              src={preview}
              alt={form.name || "Brand logo preview"}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-navy text-3xl font-display text-beige">
              {form.name.trim().charAt(0).toUpperCase() || "B"}
            </div>
          )}
        </div>
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
