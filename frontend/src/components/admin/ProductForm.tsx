import { memo, useEffect, useMemo, useState } from "react";
import { Plus, Upload, X } from "lucide-react";
import type { Brand } from "@/data/brands";
import type { BestTime, Product, Season } from "@/data/products";
import { Button } from "@/components/common/Button";
import { brandsApi } from "@/services/api";

type FormAccord = { name: string; percentage: string };
type FormSize = { size: string; price: string };
type FormState = Omit<
  Product,
  | "id"
  | "_id"
  | "createdAt"
  | "updatedAt"
  | "accords"
  | "price"
  | "sizes"
  | "stock"
  | "brandDetails"
> & {
  price: string;
  stock: string;
  sizes: FormSize[];
  accords: FormAccord[];
};

const EMPTY_IMAGES = ["", "", ""];

const createEmptyForm = (): FormState => ({
  name: "",
  brand: "",
  brandId: "",
  category: "Designer",
  price: "",
  image: "",
  images: EMPTY_IMAGES,
  description: "",
  topNotes: [],
  middleNotes: [],
  baseNotes: [],
  accords: [{ name: "", percentage: "" }],
  longevity: "8 hours",
  sillage: "Moderate",
  usage: "Day & Night",
  bestTime: [],
  seasons: [],
  sizes: [{ size: "Standard", price: "" }],
  stock: "",
});

const toImageSlots = (images: string[]) =>
  Array.from({ length: 3 }, (_, index) => images[index] || "");

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
    accords: product.accords?.length
      ? product.accords.map((accord) => ({
          name: accord.name,
          percentage: String(accord.percentage),
        }))
      : [{ name: "", percentage: "" }],
    sizes: product.sizes?.length
      ? product.sizes.map((size) => ({
          size: size.size,
          price: Number.isFinite(Number(size.price)) ? String(size.price) : "",
        }))
      : [{ size: "Standard", price: Number.isFinite(price) ? String(price) : "" }],
    stock: stock === undefined || stock === null ? "" : String(stock),
  };
};

const ALL_SEASONS: Season[] = ["Spring", "Summer", "Autumn", "Winter"];
const BEST_TIMES: BestTime[] = ["Morning", "Day", "Evening", "Night"];
const CATS = ["Middle Eastern", "Designer", "Niche"] as const;
const USAGES = ["Day", "Night", "Day & Night"] as const;
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

  useEffect(() => {
    setText(value.join(", "));
  }, [value]);

  return (
    <input
      value={text}
      placeholder={placeholder}
      onChange={(e) => {
        setText(e.target.value);
        onChange(
          e.target.value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        );
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
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
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

  const toggleSeason = (season: Season) => {
    set(
      "seasons",
      form.seasons.includes(season)
        ? form.seasons.filter((item) => item !== season)
        : [...form.seasons, season],
    );
  };

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

  const accordTotal = useMemo(
    () => form.accords.reduce((sum, accord) => sum + Number(accord.percentage || 0), 0),
    [form.accords],
  );
  const accordFormValid = useMemo(
    () =>
      form.accords.length > 0 &&
      form.accords.every((accord) => {
        const percentage = Number(accord.percentage);
        return (
          accord.name.trim().length > 0 &&
          accord.percentage !== "" &&
          Number.isFinite(percentage) &&
          percentage >= 0
        );
      }) &&
      Math.round(accordTotal * 100) === 10000,
    [accordTotal, form.accords],
  );

  const addAccord = () => set("accords", [...form.accords, { name: "", percentage: "" }]);
  const removeAccord = (index: number) =>
    set(
      "accords",
      form.accords.filter((_, itemIndex) => itemIndex !== index),
    );
  const updateAccord = (index: number, key: "name" | "percentage", value: string) => {
    set(
      "accords",
      form.accords.map((accord, itemIndex) =>
        itemIndex === index ? { ...accord, [key]: value } : accord,
      ),
    );
  };
  const toggleBestTime = (time: BestTime) => {
    set(
      "bestTime",
      form.bestTime.includes(time)
        ? form.bestTime.filter((item) => item !== time)
        : [...form.bestTime, time],
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const images = form.images.map((image) => image.trim()).filter(Boolean);
      const hasNewFiles = imageFiles.length > 0;
      const cleanAccords = form.accords
        .map((accord) => ({
          name: accord.name.trim(),
          percentage: Number(accord.percentage),
        }))
        .filter((accord) => accord.name);
      const total = cleanAccords.reduce((sum, accord) => sum + accord.percentage, 0);
      const sizes = form.sizes
        .map((size) => ({ size: size.size.trim(), price: Number(size.price) }))
        .filter((size) => size.size);
      const price = Number(form.price);
      const stock = Number(form.stock);
      const selectedBrand = brands.find((brand) => getBrandId(brand) === form.brandId);

      if (hasNewFiles && imageFiles.length !== 3) {
        throw new Error("Select exactly 3 image files.");
      }

      if (!hasNewFiles && images.length !== 3) {
        throw new Error("Exactly 3 product image URLs are required.");
      }

      if (!cleanAccords.length) {
        throw new Error("At least one accord is required.");
      }

      if (
        cleanAccords.some(
          (accord) =>
            !Number.isFinite(accord.percentage) || accord.percentage < 0 || accord.percentage > 100,
        )
      ) {
        throw new Error("Every accord percentage must be between 0 and 100.");
      }

      if (Math.round(total * 100) !== 10000) {
        throw new Error("Total accord percentage must equal 100.");
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
      payload.append("sillage", form.sillage.trim());
      payload.append("usage", form.usage);
      payload.append("timeOfDay", form.usage);
      appendJson(payload, "topNotes", form.topNotes);
      appendJson(payload, "middleNotes", form.middleNotes);
      appendJson(payload, "baseNotes", form.baseNotes);
      appendJson(payload, "notes", [...form.topNotes, ...form.middleNotes, ...form.baseNotes]);
      appendJson(payload, "season", form.seasons);
      appendJson(payload, "seasons", form.seasons);
      appendJson(payload, "bestTime", form.bestTime);
      appendJson(payload, "sizes", sizes);
      appendJson(payload, "accords", cleanAccords);

      if (hasNewFiles) {
        imageFiles.forEach((file) => payload.append("images", file));
      } else {
        payload.append("image", images[0]);
        appendJson(payload, "images", images);
      }

      await onSubmit(payload);

      if (resetOnSuccess) {
        setForm(createEmptyForm());
        setImageFiles([]);
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
                accept="image/*"
                onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                className="sr-only"
              />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
            {Array.from({ length: 3 }, (_, index) => {
              const preview = imagePreviewUrls[index];

              return preview ? (
                <img
                  key={index}
                  src={preview}
                  alt={`Product preview ${index + 1}`}
                  className="aspect-square w-full rounded-lg border border-border bg-beige object-cover"
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

      <fieldset className="rounded-lg border border-border p-5">
        <legend className="px-2 text-xs uppercase tracking-[0.25em] text-navy/60">Accords</legend>
        <div className="space-y-2">
          {form.accords.map((accord, index) => (
            <div key={index} className="grid grid-cols-[1fr_6rem_2rem] items-center gap-2">
              <input
                value={accord.name}
                onChange={(e) => updateAccord(index, "name", e.target.value)}
                placeholder="Woody"
                className={inputCls}
              />
              <input
                type="number"
                min={0}
                max={100}
                value={accord.percentage}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "") {
                    updateAccord(index, "percentage", "");
                    return;
                  }

                  if (Number(value) < 0) return;

                  updateAccord(index, "percentage", value);
                }}
                className={inputCls}
                aria-label={`${accord.name || "Accord"} percentage`}
              />
              <button
                type="button"
                onClick={() => removeAccord(index)}
                className="text-navy/50 hover:text-red-600"
                aria-label="Remove accord"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={addAccord}
              className="inline-flex items-center gap-1 text-xs text-navy/70 hover:text-navy"
            >
              <Plus className="h-3.5 w-3.5" /> Add accord
            </button>
            <span
              className={`text-xs tabular-nums ${accordTotal === 100 ? "text-emerald-700" : "text-red-600"}`}
            >
              Total {accordTotal}%
            </span>
          </div>
        </div>
      </fieldset>

      <div className="grid gap-6 md:grid-cols-3">
        <Field label="Longevity">
          <input
            value={form.longevity}
            onChange={(e) => set("longevity", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Sillage">
          <input
            value={form.sillage}
            onChange={(e) => set("sillage", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Usage">
          <select
            value={form.usage}
            onChange={(e) => set("usage", e.target.value as Product["usage"])}
            className={inputCls}
          >
            {USAGES.map((usage) => (
              <option key={usage}>{usage}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Seasons">
        <div className="flex flex-wrap gap-2">
          {ALL_SEASONS.map((season) => {
            const selected = form.seasons.includes(season);
            return (
              <button
                type="button"
                key={season}
                onClick={() => toggleSeason(season)}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                  selected ? "bg-navy text-beige" : "bg-beige/60 text-navy/60 hover:bg-beige"
                }`}
              >
                {season}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Best Time">
        <div className="flex flex-wrap gap-2">
          {BEST_TIMES.map((time) => {
            const selected = form.bestTime.includes(time);
            return (
              <button
                type="button"
                key={time}
                onClick={() => toggleBestTime(time)}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                  selected ? "bg-navy text-beige" : "bg-beige/60 text-navy/60 hover:bg-beige"
                }`}
              >
                {time}
              </button>
            );
          })}
        </div>
      </Field>

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
          disabled={saving || brandsLoading || !form.brandId || !accordFormValid}
          className="!bg-navy !text-beige"
        >
          {saving ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
});
