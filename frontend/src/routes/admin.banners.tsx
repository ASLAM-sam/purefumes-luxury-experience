import { createFileRoute } from "@tanstack/react-router";
import { ImagePlus, Pencil, Power, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useNotification } from "@/context/NotificationContext";
import { bannersApi, type Banner } from "@/services/api";

export const Route = createFileRoute("/admin/banners")({
  component: AdminBanners,
});

type BannerFormState = {
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  link: string;
  order: string;
};

const initialForm: BannerFormState = {
  title: "",
  subtitle: "",
  image: "",
  buttonText: "",
  link: "",
  order: "",
};

const sortBanners = (items: Banner[]) =>
  [...items].sort((left, right) => {
    const orderDelta = left.order - right.order;
    if (orderDelta !== 0) {
      return orderDelta;
    }

    return left.title.localeCompare(right.title);
  });

function AdminBanners() {
  const { addNotification } = useNotification();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState<BannerFormState>(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pendingToggleId, setPendingToggleId] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState("");

  const loadBanners = useCallback(
    async (silent = false) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const nextBanners = await bannersApi.listAdmin();
        setBanners(sortBanners(nextBanners));
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : "Hero banners could not be loaded.";
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
    void loadBanners();
  }, [loadBanners]);

  const activeBannerCount = useMemo(
    () => banners.filter((banner) => banner.isActive).length,
    [banners],
  );

  const previewImage = useMemo(() => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }

    return form.image.trim();
  }, [form.image, imageFile]);

  useEffect(() => {
    if (!imageFile || !previewImage.startsWith("blob:")) {
      return;
    }

    return () => {
      URL.revokeObjectURL(previewImage);
    };
  }, [imageFile, previewImage]);

  const updateForm =
    (key: keyof BannerFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({
        ...current,
        [key]: event.target.value,
      }));
    };

  const resetForm = useCallback(() => {
    setForm(initialForm);
    setImageFile(null);
    setEditingBanner(null);
    setError("");
  }, []);

  const beginEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setImageFile(null);
    setError("");
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      image: banner.image,
      buttonText: banner.buttonText,
      link: banner.link,
      order: String(banner.order ?? 0),
    });
  };

  const submitBanner = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = new FormData();
    payload.set("title", form.title.trim());
    payload.set("subtitle", form.subtitle.trim());
    payload.set("buttonText", form.buttonText.trim());
    payload.set("link", form.link.trim());
    payload.set("order", form.order.trim() || "0");

    if (imageFile) {
      payload.set("imageFile", imageFile);
    } else if (form.image.trim()) {
      payload.set("image", form.image.trim());
    }

    try {
      const savedBanner = editingBanner
        ? await bannersApi.updateWithImage(editingBanner.id, payload)
        : await bannersApi.createWithImage(payload);

      setBanners((current) => {
        const next = editingBanner
          ? current.map((banner) => (banner.id === editingBanner.id ? savedBanner : banner))
          : [savedBanner, ...current];

        return sortBanners(next);
      });

      addNotification(
        editingBanner ? "Hero banner updated successfully." : "Hero banner created successfully.",
      );
      resetForm();
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "Hero banner could not be saved.";
      setError(message);
      addNotification(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleBanner = async (banner: Banner) => {
    setPendingToggleId(banner.id);

    try {
      const updatedBanner = await bannersApi.toggle(banner.id);
      setBanners((current) =>
        sortBanners(
          current.map((item) => (item.id === banner.id ? updatedBanner : item)),
        ),
      );
      addNotification(
        updatedBanner.isActive ? "Banner enabled successfully." : "Banner disabled successfully.",
      );
    } catch (toggleError) {
      addNotification(
        toggleError instanceof Error ? toggleError.message : "Banner status could not be updated.",
        "error",
      );
    } finally {
      setPendingToggleId("");
    }
  };

  const deleteBanner = async (banner: Banner) => {
    setPendingDeleteId(banner.id);

    try {
      await bannersApi.remove(banner.id);
      setBanners((current) => current.filter((item) => item.id !== banner.id));
      if (editingBanner?.id === banner.id) {
        resetForm();
      }
      addNotification("Hero banner deleted successfully.");
    } catch (deleteError) {
      addNotification(
        deleteError instanceof Error ? deleteError.message : "Banner could not be deleted.",
        "error",
      );
    } finally {
      setPendingDeleteId("");
    }
  };

  return (
    <AdminShell>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-navy/50">Homepage</p>
          <h1 className="mt-1 font-display text-4xl text-navy">Hero Banners</h1>
          <p className="mt-2 text-sm text-navy/60">
            {activeBannerCount} active banner{activeBannerCount === 1 ? "" : "s"} rotating in the
            luxury homepage slider.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadBanners(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-navy px-4 py-2.5 text-xs uppercase tracking-[0.22em] text-navy transition hover:bg-navy hover:text-beige disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-navy/55">
                {editingBanner ? "Edit Banner" : "Create Banner"}
              </p>
              <p className="mt-2 text-sm text-navy/60">
                Upload a fresh visual or paste an image URL, then control the display order.
              </p>
            </div>

            {editingBanner ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-border px-3 py-2 text-[0.65rem] uppercase tracking-[0.22em] text-navy transition hover:bg-beige/50"
              >
                Cancel
              </button>
            ) : null}
          </div>

          <form onSubmit={submitBanner} className="mt-6 space-y-4">
            <div>
              <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60">
                Banner Title
              </span>
              <input
                required
                value={form.title}
                onChange={updateForm("title")}
                placeholder="Afnan Collection"
                className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold"
              />
            </div>

            <div>
              <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60">
                Subtitle
              </span>
              <textarea
                required
                value={form.subtitle}
                onChange={updateForm("subtitle")}
                placeholder="Flat 50% Off on Premium Scents"
                rows={3}
                className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold"
              />
            </div>

            <div>
              <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60">
                Image URL
              </span>
              <input
                value={form.image}
                onChange={updateForm("image")}
                placeholder="https://example.com/banner.jpg"
                className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold"
              />
            </div>

            <div>
              <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60">
                Upload Image
              </span>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-beige/20 px-4 py-3 text-sm text-navy/70 transition hover:border-gold hover:text-navy">
                <ImagePlus className="h-4 w-4" />
                <span>{imageFile ? imageFile.name : "Choose banner image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                  className="sr-only"
                />
              </label>
            </div>

            {previewImage ? (
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-beige/20">
                <img
                  src={previewImage}
                  alt={form.title || "Banner preview"}
                  className="h-40 w-full object-cover"
                />
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div>
                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60">
                  Button Text
                </span>
                <input
                  required
                  value={form.buttonText}
                  onChange={updateForm("buttonText")}
                  placeholder="Shop Now"
                  className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold"
                />
              </div>

              <div>
                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60">
                  Display Order
                </span>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.order}
                  onChange={updateForm("order")}
                  placeholder="1"
                  className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold"
                />
              </div>
            </div>

            <div>
              <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60">
                Link
              </span>
              <input
                required
                value={form.link}
                onChange={updateForm("link")}
                placeholder="/category/designer"
                className="w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold"
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center rounded-lg bg-navy px-5 py-3 text-xs uppercase tracking-[0.24em] text-beige transition hover:opacity-90 disabled:opacity-50"
            >
              {saving
                ? editingBanner
                  ? "Saving..."
                  : "Creating..."
                : editingBanner
                  ? "Save Banner"
                  : "Create Banner"}
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] text-sm">
              <thead className="bg-beige/50 text-xs uppercase tracking-[0.2em] text-navy/70">
                <tr>
                  <th className="px-6 py-4 text-left">Banner</th>
                  <th className="px-6 py-4 text-left">Link</th>
                  <th className="px-6 py-4 text-center">Order</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-navy/50">
                      Loading hero banners...
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

                {!loading && !error && banners.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-navy/50">
                      No hero banners created yet.
                    </td>
                  </tr>
                ) : null}

                {!loading &&
                  !error &&
                  banners.map((banner) => {
                    const isToggling = pendingToggleId === banner.id;
                    const isDeleting = pendingDeleteId === banner.id;

                    return (
                      <tr key={banner.id} className="align-top">
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-4">
                            <img
                              src={banner.image}
                              alt={banner.title}
                              className="h-20 w-28 rounded-2xl object-cover shadow-soft"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-navy">{banner.title}</p>
                              <p className="mt-2 line-clamp-2 text-sm leading-6 text-navy/60">
                                {banner.subtitle}
                              </p>
                              <p className="mt-3 text-[0.65rem] uppercase tracking-[0.24em] text-gold/90">
                                {banner.buttonText}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-navy/65">{banner.link || "-"}</td>
                        <td className="px-6 py-4 text-center font-medium text-navy">
                          {banner.order}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[0.68rem] uppercase tracking-[0.22em] ${
                              banner.isActive
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {banner.isActive ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => beginEdit(banner)}
                              className="rounded-lg p-2 text-navy transition hover:bg-navy/10"
                              aria-label={`Edit ${banner.title}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void toggleBanner(banner)}
                              disabled={isToggling}
                              className="rounded-lg p-2 text-navy transition hover:bg-navy/10 disabled:opacity-50"
                              aria-label={`${banner.isActive ? "Disable" : "Enable"} ${banner.title}`}
                            >
                              <Power className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteBanner(banner)}
                              disabled={isDeleting}
                              className="rounded-lg p-2 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                              aria-label={`Delete ${banner.title}`}
                            >
                              <Trash2 className="h-4 w-4" />
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
