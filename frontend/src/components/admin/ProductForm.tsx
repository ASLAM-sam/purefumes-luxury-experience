import { memo, useEffect, useMemo, useState } from "react";
import { Plus, Upload, X } from "lucide-react";
import type { Brand } from "@/data/brands";
import type { Product } from "@/data/products";
import { Button } from "@/components/common/Button";
import { brandsApi } from "@/services/api";

type FormSize = { size: string; price: string };
type FormState = Omit<
  Product,
  | "id"
  | "_id"
  | "createdAt"
  | "updatedAt"
  | "price"
  | "sizes"
  | "stock"
  | "brandDetails"
> & {
  price: string;
  stock: string;
  sizes: FormSize[];
  videoUrl: string;
};

const EMPTY_IMAGES = ["", "", "", "", ""];
const MAX_VIDEO_SIZE_BYTES = 10 * 1024 * 1024;
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

const createEmptyForm = (): FormState => ({
  name: "",
  brand: "",
  brandId: "",
  category: "Designer",
  price: "",
  image: "",
  images: EMPTY_IMAGES,
  videoUrl: "",
  isLatest: false,
  description: "",
  topNotes: [],
  middleNotes: [],
  baseNotes: [],
  accords: [],
  longevity: "8 hours",
  sillage: "",
  usage: "Day",
  timeOfDay: "Day",
  bestTime: [],
  season: [],
  seasons: [],
  sizes: [{ size: "Standard", price: "" }],
  stock: "",
});

const toImageSlots = (images: string[]) =>
  Array.from({ length: 5 }, (_, index) => images[index] || "");

const toFormState = (product?: Product): FormState => {
  if (!product) return createEmptyForm();

  const {
    id: _idValue,
    _id,
    createdAt,
    updatedAt,
    price: _price,
    sizes: _sizes,
    stock,
    ...rest
  } = product;
  const price = Number(product.price ?? product.sizes?.[0]?.price ?? 0);
  const images = toImageSlots(
    product.images?.length ? product.images : product.image ? [product.image] : [],
  );

  return {
    ...createEmptyForm(),
    ...rest,
    brandId: product.brandId || product.brandDetails?.id || "",
    price: Number.isFinite(price) ? String(price) : "",
    image: images[0] || "",
    images,
    videoUrl: String(product.videoUrl || ""),
    sizes: product.sizes?.length
      ? product.sizes.map((size) => ({
          size: size.size,
          price: Number.isFinite(Number(size.price)) ? String(size.price) : "",
        }))
      : [{ size: "Standard", price: Number.isFinite(price) ? String(price) : "" }],
    stock: stock === undefined || stock === null ? "" : String(stock),
  };
};

const CATS = ["Middle Eastern", "Designer", "Niche"] as const;
const CATEGORY_TO_BRAND_CATEGORY: Record<Product["category"], Brand["category"]> = {
  "Middle Eastern": "middle-eastern",
  Designer: "designer",
  Niche: "niche",
};

const getBrandId = (brand: Brand) => brand.id || brand._id || "";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.2em] text-navy/60">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full px-4 py-2.5 rounded-lg bg-beige/40 border border-border focus:border-navy outline-none text-sm";

function CSVInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [text, setText] = useState(value.join(", "));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setText(value.join(", "));
    }
  }, [focused, value]);

  const parseNotes = (inputValue: string) =>
    inputValue
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  return (
    <input
      value={text}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        const notes = parseNotes(text);
        setFocused(false);
        setText(notes.join(", "));
        onChange(notes);
      }}
      onChange={(e) => {
        setText(e.target.value);
        onChange(parseNotes(e.target.value));
      }}
      className={inputCls}
    />
  );
}

const appendJson = (data: FormData, key: string, value: unknown) => {
  data.append(key, JSON.stringify(value));
};

export const ProductForm = memo(function ProductForm({
  initial,
  onSubmit,
  submitLabel = "Save Product",
  resetOnSuccess = false,
}: {
  initial?: Product;
  onSubmit: (payload: FormData) => Promise<void>;
  submitLabel?: string;
  resetOnSuccess?: boolean;
}) {
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [brandsError, setBrandsError] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const previews = imageFiles.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);

    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageFiles]);

  useEffect(() => {
    if (!videoFile) {
      setVideoPreview("");
      return undefined;
    }

    const preview = URL.createObjectURL(videoFile);
    setVideoPreview(preview);

    return () => {
      URL.revokeObjectURL(preview);
    };
  }, [videoFile]);

  useEffect(() => {
    let isActive = true;

    const loadBrands = async () => {
      setBrandsLoading(true);
      setBrandsError("");

      try {
        const nextBrands = await brandsApi.list();

        if (!isActive) return;

        setBrands(nextBrands);
      } catch (ex) {
        if (!isActive) return;

        setBrands([]);
        setBrandsError(ex instanceof Error ? ex.message : "No brands available.");
      } finally {
        if (isActive) {
          setBrandsLoading(false);
        }
      }
    };

    loadBrands();

    return () => {
      isActive = false;
    };
  }, []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((current) => ({ ...current, [k]: v }));

  const setPrice = (value: string) => {
    if (value !== "" && Number(value) < 0) return;

    setForm((current) => ({
      ...current,
      price: value,
      sizes: current.sizes.length
        ? current.sizes.map((size, index) => (index === 0 ? { ...size, price: value } : size))
        : [{ size: "Standard", price: value }],
    }));
  };

  const setStock = (value: string) => {
    if (value !== "" && Number(value) < 0) return;

    set("stock", value);
  };

  const updateImageUrl = (index: number, value: string) => {
    setForm((current) => {
      const images = toImageSlots(current.images);
      images[index] = value;
      return { ...current, images, image: images[0] || "" };
    });
  };

  const imagePreviewUrls = filePreviews.length
    ? filePreviews
    : form.images.map((image) => image.trim()).filter(Boolean);
  const availableBrands = useMemo(() => {
    const selectedBrandId = String(form.brandId || "").trim();
    const selectedCategory = CATEGORY_TO_BRAND_CATEGORY[form.category];

    return brands.filter((brand) => {
      const currentBrandId = getBrandId(brand);

      return brand.category === selectedCategory || currentBrandId === selectedBrandId;
    });
  }, [brands, form.brandId, form.category]);

  const addSize = () => set("sizes", [...form.sizes, { size: "", price: "" }]);
  const removeSize = (index: number) =>
    set(
      "sizes",
      form.sizes.filter((_, itemIndex) => itemIndex !== index),
    );
  const updateSize = (index: number, key: "size" | "price", value: string) => {
    if (key === "price" && value !== "" && Number(value) < 0) return;

    const nextSizes = form.sizes.map((size, itemIndex) =>
      itemIndex === index ? { ...size, [key]: value } : size,
    );

    setForm((current) => ({
      ...current,
      sizes: nextSizes,
      price: index === 0 && key === "price" ? value : current.price,
    }));
  };

  const isValidVideoUrl = (value: string) =>
    !value.trim() || /\.(mp4|webm|mov)(\?.*)?$/i.test(value.trim());

  const selectVideoFile = (file?: File) => {
    setError("");

    if (!file) {
      setVideoFile(null);
      return;
    }

    if (!VIDEO_TYPES.has(file.type)) {
      setVideoFile(null);
      setError("Video must be an MP4, WebM, or MOV file.");
      return;
    }

    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      setVideoFile(null);
      setError("Video size must be under 10MB.");
      return;
    }

    setVideoFile(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const images = form.images.map((image) => image.trim()).filter(Boolean);
      const hasNewFiles = imageFiles.length > 0;
      const sizes = form.sizes
        .map((size) => ({ size: size.size.trim(), price: Number(size.price) }))
        .filter((size) => size.size);
      const price = Number(form.price);
      const stock = Number(form.stock);
      const selectedBrand = brands.find((brand) => getBrandId(brand) === form.brandId);

      if (hasNewFiles && (imageFiles.length < 1 || imageFiles.length > 5)) {
        throw new Error("Select between 1 and 5 image files.");
      }

      if (!hasNewFiles && (images.length < 1 || images.length > 5)) {
        throw new Error("Provide between 1 and 5 product image URLs.");
      }

      if (form.videoUrl.trim() && !isValidVideoUrl(form.videoUrl)) {
        throw new Error("Video URL must end with .mp4, .webm, or .mov.");
      }

      if (form.price.trim() === "" || !Number.isFinite(price) || price < 0) {
        throw new Error("Enter a valid product price.");
      }

      if (
        form.stock.trim() === "" ||
        !Number.isFinite(stock) ||
        stock < 0 ||
        !Number.isInteger(stock)
      ) {
        throw new Error("Enter a valid whole-number stock quantity.");
      }

      if (!sizes.length) {
        throw new Error("At least one size is required.");
      }

      if (brandsLoading) {
        throw new Error("Brands are still loading.");
      }

      if (!form.brandId) {
        throw new Error("Select a brand.");
      }

      if (!selectedBrand) {
        throw new Error(brandsError || "No brands available.");
      }

      if (selectedBrand.category !== CATEGORY_TO_BRAND_CATEGORY[form.category]) {
        throw new Error("Selected brand does not match the product category.");
      }

      if (
        form.sizes.some(
          (size) =>
            size.size.trim() &&
            (size.price.trim() === "" ||
              !Number.isFinite(Number(size.price)) ||
              Number(size.price) < 0),
        )
      ) {
        throw new Error("Every size needs a valid price.");
      }

      const payload = new FormData();
      payload.append("name", form.name.trim());
      payload.append("brandId", form.brandId);
      payload.append("category", form.category);
      payload.append("price", String(price));
      payload.append("stock", String(stock));
      payload.append("description", form.description.trim());
      payload.append("longevity", form.longevity.trim());
      payload.append("videoUrl", form.videoUrl.trim());
      payload.append("isLatest", String(Boolean(form.isLatest)));
      appendJson(payload, "topNotes", form.topNotes);
      appendJson(payload, "middleNotes", form.middleNotes);
      appendJson(payload, "baseNotes", form.baseNotes);
      appendJson(payload, "notes", [...form.topNotes, ...form.middleNotes, ...form.baseNotes]);
      appendJson(payload, "sizes", sizes);

      if (hasNewFiles) {
        imageFiles.forEach((file) => payload.append("images", file));
      } else {
        payload.append("image", images[0]);
        appendJson(payload, "images", images);
      }

      if (videoFile) {
        payload.append("video", videoFile);
      }

      await onSubmit(payload);

      if (resetOnSuccess) {
        setForm(createEmptyForm());
        setImageFiles([]);
        setVideoFile(null);
      }

      setSuccess("Product saved successfully.");
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "Product could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Name">
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Brand">
          <>
            <select
              required
              value={form.brandId ?? ""}
              onChange={(e) => {
                const brandId = e.target.value;
                const selectedBrand = brands.find((brand) => getBrandId(brand) === brandId);

                setForm((current) => ({
                  ...current,
                  brandId,
                  brand: selectedBrand?.name || "",
                }));
              }}
              disabled={brandsLoading || availableBrands.length === 0}
              className={inputCls}
            >
              <option value="">
                {brandsLoading
                  ? "Loading brands..."
                  : availableBrands.length > 0
                    ? "Select Brand"
                    : "No brands available"}
              </option>
              {availableBrands.map((brand) => (
                <option key={getBrandId(brand)} value={getBrandId(brand)}>
                  {brand.name}
                </option>
              ))}
            </select>
            {brandsError ? (
              <p className="mt-2 text-xs text-red-600">{brandsError}</p>
            ) : null}
            {!brandsLoading && !brandsError && availableBrands.length === 0 ? (
              <p className="mt-2 text-xs text-navy/55">No brands available.</p>
            ) : null}
          </>
        </Field>
        <Field label="Category">
          <select
            value={form.category}
            onChange={(e) => {
              const category = e.target.value as Product["category"];

              setForm((current) => {
                const selectedBrand = brands.find(
                  (brand) => getBrandId(brand) === current.brandId,
                );
                const keepBrand =
                  selectedBrand?.category === CATEGORY_TO_BRAND_CATEGORY[category];

                return {
                  ...current,
                  category,
                  brandId: keepBrand ? current.brandId : "",
                  brand: keepBrand ? current.brand : "",
                };
              });
            }}
            className={inputCls}
          >
            {CATS.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </Field>
        <Field label="Price">
          <input
            required
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Stock">
          <input
            required
            type="number"
            min={0}
            step={1}
            value={form.stock}
            onChange={(e) => setStock(e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-beige/30 p-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-navy/60">
            Latest Product
          </span>
          <p className="mt-1 text-sm text-navy/55">
            Show this fragrance in the homepage latest products section.
          </p>
        </div>
        <input
          type="checkbox"
          checked={Boolean(form.isLatest)}
          onChange={(e) => set("isLatest", e.target.checked)}
          className="h-5 w-5 accent-navy"
        />
      </label>

      <fieldset className="rounded-lg border border-border p-5">
        <legend className="px-2 text-xs uppercase tracking-[0.25em] text-navy/60">
          Product Images
        </legend>
        <div className="grid gap-5 lg:grid-cols-[1fr_16rem]">
          <div className="space-y-3">
            {form.images.map((image, index) => (
              <input
                key={index}
                type="url"
                value={image}
                placeholder={`Image URL ${index + 1}`}
                onChange={(e) => updateImageUrl(index, e.target.value)}
                className={inputCls}
              />
            ))}
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-navy/25 bg-beige/30 px-4 py-4 text-sm text-navy/70 transition hover:border-navy/50">
              <Upload className="h-4 w-4" />
              <span>
                {imageFiles.length ? `${imageFiles.length} files selected` : "Upload images"}
              </span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                  className="sr-only"
                />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
            {Array.from({ length: 5 }, (_, index) => {
              const preview = imagePreviewUrls[index];

              return preview ? (
                <img
                  key={index}
                  src={preview}
                  alt={`Product preview ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full rounded-lg border border-border bg-beige object-contain object-center p-2"
                />
              ) : (
                <div
                  key={index}
                  className="flex aspect-square w-full items-center justify-center rounded-lg border border-border bg-beige/70 text-[0.6rem] uppercase tracking-[0.18em] text-navy/40"
                >
                  Image {index + 1}
                </div>
              );
            })}
          </div>
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-border p-5">
        <legend className="px-2 text-xs uppercase tracking-[0.25em] text-navy/60">
          Product Video
        </legend>
        <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
          <div className="space-y-3">
            <Field label="Video URL">
              <input
                type="url"
                value={form.videoUrl}
                onChange={(e) => set("videoUrl", e.target.value)}
                placeholder="https://example.com/video.mp4"
                className={inputCls}
              />
            </Field>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-navy/25 bg-beige/30 px-4 py-4 text-sm text-navy/70 transition hover:border-navy/50">
              <Upload className="h-4 w-4" />
              <span>{videoFile ? videoFile.name : "Upload product video"}</span>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={(e) => selectVideoFile(e.target.files?.[0])}
                className="sr-only"
              />
            </label>
            <p className="text-xs text-navy/45">
              MP4, WebM, or MOV. Video uploads replace the URL on save.
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-beige/60">
            {videoPreview || form.videoUrl.trim() ? (
              <div className="space-y-3 p-3">
                <video
                  src={videoPreview || form.videoUrl.trim()}
                  muted
                  playsInline
                  preload="metadata"
                  className="aspect-video w-full rounded-md bg-navy/10 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setVideoFile(null);
                    set("videoUrl", "");
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs uppercase tracking-[0.18em] text-navy/70 transition hover:border-red-200 hover:text-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                  Remove video
                </button>
              </div>
            ) : (
              <div className="flex aspect-video w-full items-center justify-center px-4 text-center text-[0.65rem] uppercase tracking-[0.2em] text-navy/40">
                Video preview
              </div>
            )}
          </div>
        </div>
      </fieldset>

      <Field label="Description">
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className={`${inputCls} resize-none`}
        />
      </Field>

      <fieldset className="rounded-lg border border-border p-5">
        <legend className="px-2 text-xs uppercase tracking-[0.25em] text-navy/60">Notes</legend>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Top">
            <CSVInput
              value={form.topNotes}
              onChange={(value) => set("topNotes", value)}
              placeholder="Bergamot, Lemon"
            />
          </Field>
          <Field label="Middle">
            <CSVInput
              value={form.middleNotes}
              onChange={(value) => set("middleNotes", value)}
              placeholder="Rose, Jasmine"
            />
          </Field>
          <Field label="Base">
            <CSVInput
              value={form.baseNotes}
              onChange={(value) => set("baseNotes", value)}
              placeholder="Vanilla, Musk"
            />
          </Field>
        </div>
      </fieldset>

      <div className="grid gap-6 md:grid-cols-1">
        <Field label="Longevity">
          <input
            value={form.longevity}
            onChange={(e) => set("longevity", e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <fieldset className="rounded-lg border border-border p-5">
        <legend className="px-2 text-xs uppercase tracking-[0.25em] text-navy/60">
          Sizes & Pricing
        </legend>
        <div className="space-y-2">
          {form.sizes.map((size, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_2rem] items-center gap-2">
              <input
                value={size.size}
                onChange={(e) => updateSize(index, "size", e.target.value)}
                placeholder="2ml"
                className={inputCls}
              />
              <input
                type="number"
                min={0}
                step="0.01"
                value={size.price}
                onChange={(e) => updateSize(index, "price", e.target.value)}
                placeholder="Price"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => removeSize(index)}
                className="text-navy/50 hover:text-red-600"
                aria-label="Remove size"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSize}
            className="mt-2 inline-flex items-center gap-1 text-xs text-navy/70 hover:text-navy"
          >
            <Plus className="h-3.5 w-3.5" /> Add size
          </button>
        </div>
      </fieldset>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-700">{success}</p>}

      <div className="flex justify-end border-t border-border pt-4">
        <Button
          type="submit"
          disabled={saving || brandsLoading || !form.brandId}
          className="!bg-navy !text-beige"
        >
          {saving ? (videoFile ? "Uploading video..." : "Saving...") : submitLabel}
        </Button>
      </div>
    </form>
  );
});
