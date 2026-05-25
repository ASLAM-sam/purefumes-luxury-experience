import { memo, useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Plus, X } from "lucide-react";
import type { Brand } from "@/data/brands";
import type { Category } from "@/data/categories";
import type { Product } from "@/data/products";
import { filterBrandsForCategory, normalizeCategory } from "@/data/brandsByCategory";
import { Button } from "@/components/common/Button";
import { brandsApi, categoriesApi } from "@/services/api";

type FormSize = { size: string; price: string };
type ProductFormSubmitOptions = {
  onUploadProgress?: (progress: number) => void;
};
type FormState = Omit<
  Product,
  | "id"
  | "_id"
  | "createdAt"
  | "updatedAt"
  | "price"
  | "image"
  | "images"
  | "sizes"
  | "stock"
  | "brandDetails"
> & {
  price: string;
  stock: string;
  sizes: FormSize[];
};

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp)$/i;
const IMAGE_TYPES = new Set([
  "",
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "application/octet-stream",
]);

const createEmptyForm = (): FormState => ({
  name: "",
  brand: "",
  brandId: "",
  categories: [],
  categoryIds: [],
  categoryNames: [],
  categorySlugs: [],
  primaryCategory: "",
  category: "",
  categorySlug: "",
  categoryDetails: null,
  price: "",
  isLatest: false,
  description: "",
  type: "",
  topNotes: [],
  middleNotes: [],
  baseNotes: [],
  accords: [],
  sillage: "",
  usage: "Day",
  timeOfDay: "Day",
  bestTime: [],
  season: [],
  seasons: [],
  sizes: [{ size: "Standard", price: "" }],
  stock: "",
});

const getProductImages = (product?: Product) =>
  product?.images?.length ? product.images.filter(Boolean) : product?.image ? [product.image] : [];

const toFormState = (product?: Product): FormState => {
  if (!product) return createEmptyForm();

  const {
    id: _idValue,
    _id,
    createdAt,
    updatedAt,
    price: _price,
    image: _image,
    images: _images,
    sizes: _sizes,
    stock,
    ...rest
  } = product;
  const price = Number(product.price ?? product.sizes?.[0]?.price ?? 0);

  return {
    ...createEmptyForm(),
    ...rest,
    brandId: product.brandId || product.brandDetails?.id || "",
    categories: product.categories || [],
    categoryIds: product.categoryIds?.length
      ? product.categoryIds
      : product.categories?.map((category) => category.id).filter(Boolean) || [],
    categoryNames: product.categoryNames?.length
      ? product.categoryNames
      : product.categories?.map((category) => category.name).filter(Boolean) || [],
    categorySlugs: product.categorySlugs?.length
      ? product.categorySlugs
      : product.categories?.map((category) => category.slug).filter(Boolean) || [],
    primaryCategory: product.primaryCategory || product.categoryId || "",
    category: product.category || product.categoryNames?.join(", ") || "",
    price: Number.isFinite(price) ? String(price) : "",
    sizes: product.sizes?.length
      ? product.sizes.map((size) => ({
          size: size.size,
          price: Number.isFinite(Number(size.price)) ? String(size.price) : "",
        }))
      : [{ size: "Standard", price: Number.isFinite(price) ? String(price) : "" }],
    stock: stock === undefined || stock === null ? "" : String(stock),
  };
};

const getBrandId = (brand: Brand) => brand.id || brand._id || "";

const getCategoryBrandValue = (category?: Category | null) =>
  category?.slug || normalizeCategory(category?.name || "") || category?.name || "";

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

const fileKey = (file: File) => `${file.name}:${file.size}:${file.lastModified}`;

export const ProductForm = memo(function ProductForm({
  initial,
  onSubmit,
  submitLabel = "Save Product",
  resetOnSuccess = false,
}: {
  initial?: Product;
  onSubmit: (payload: FormData, options?: ProductFormSubmitOptions) => Promise<void>;
  submitLabel?: string;
  resetOnSuccess?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandsError, setBrandsError] = useState("");
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>(() => getProductImages(initial));
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setForm(toFormState(initial));
    setExistingImages(getProductImages(initial));
    setImageFiles([]);
    setUploadProgress(0);
    setError("");
    setSuccess("");
  }, [initial]);

  useEffect(() => {
    const previews = imageFiles.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);

    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageFiles]);

  useEffect(() => {
    let isActive = true;

    const loadCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError("");

      try {
        const nextCategories = await categoriesApi.listAdmin({ forceFresh: true });

        if (!isActive) return;

        setCategories(nextCategories.filter((category) => !category.isDeleted));
      } catch (ex) {
        if (!isActive) return;

        setCategories([]);
        setCategoriesError(ex instanceof Error ? ex.message : "No categories available.");
      } finally {
        if (isActive) {
          setCategoriesLoading(false);
        }
      }
    };

    void loadCategories();

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

  const selectedCategoryValue = useMemo(() => {
    const selectedCategory =
      categories.find((category) => form.categoryIds.includes(category.id)) ||
      form.categoryDetails;

    return (
      getCategoryBrandValue(selectedCategory) ||
      form.categorySlug ||
      form.categorySlugs[0] ||
      normalizeCategory(form.categoryNames[0] || form.category) ||
      form.categoryNames[0] ||
      form.category
    );
  }, [
    categories,
    form.category,
    form.categoryDetails,
    form.categoryIds,
    form.categoryNames,
    form.categorySlug,
    form.categorySlugs,
  ]);

  useEffect(() => {
    let isActive = true;

    if (!selectedCategoryValue) {
      setBrands([]);
      setBrandsLoading(false);
      setBrandsError("");
      setForm((current) =>
        current.brandId || current.brand ? { ...current, brandId: "", brand: "" } : current,
      );
      return () => {
        isActive = false;
      };
    }

    const loadBrands = async () => {
      setBrandsLoading(true);
      setBrandsError("");

      try {
        const nextBrands = await brandsApi.list(
          { category: selectedCategoryValue },
          { forceFresh: true },
        );

        if (!isActive) return;

        setBrands(filterBrandsForCategory(nextBrands, selectedCategoryValue));
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

    void loadBrands();

    return () => {
      isActive = false;
    };
  }, [selectedCategoryValue]);

  const availableBrands = useMemo(() => {
    const mappedCategory = normalizeCategory(selectedCategoryValue);
    return mappedCategory ? filterBrandsForCategory(brands, mappedCategory) : brands;
  }, [brands, selectedCategoryValue]);

  useEffect(() => {
    if (!form.brandId || brandsLoading || !selectedCategoryValue) return;

    const selectedBrandStillAvailable = availableBrands.some(
      (brand) => getBrandId(brand) === form.brandId,
    );

    if (!selectedBrandStillAvailable) {
      setForm((current) => ({ ...current, brandId: "", brand: "" }));
    }
  }, [availableBrands, brandsLoading, form.brandId, selectedCategoryValue]);
  const totalImageCount = existingImages.length + imageFiles.length;
  const imagePreviewItems = [
    ...existingImages.map((src, index) => ({
      id: `existing-${src}`,
      src,
      name: `Image ${index + 1}`,
      type: "existing" as const,
      index,
    })),
    ...filePreviews.map((src, index) => ({
      id: `file-${imageFiles[index] ? fileKey(imageFiles[index]) : src}`,
      src,
      name: imageFiles[index]?.name || `Image ${existingImages.length + index + 1}`,
      type: "file" as const,
      index,
    })),
  ];

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

  const validateImageFile = (file: File) => {
    if (!IMAGE_EXTENSIONS.test(file.name)) {
      throw new Error("Only JPG, PNG, and WEBP images are allowed.");
    }

    if (!IMAGE_TYPES.has(file.type)) {
      throw new Error("Only JPG, PNG, and WEBP images are allowed.");
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error("Image size must be under 5MB.");
    }
  };

  const addImageFiles = (files: File[]) => {
    if (!files.length) return;

    setError("");
    setSuccess("");

    files.forEach(validateImageFile);

    const currentKeys = new Set(imageFiles.map(fileKey));
    const uniqueFiles = files.filter((file) => !currentKeys.has(fileKey(file)));
    const nextFiles = [...imageFiles, ...uniqueFiles];

    if (existingImages.length + nextFiles.length > MAX_IMAGES) {
      throw new Error("Products can have up to 5 images.");
    }

    setImageFiles(nextFiles);
  };

  const removeExistingImage = (index: number) => {
    setError("");
    setExistingImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
  };

  const removeSelectedFile = (index: number) => {
    setError("");
    setImageFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleImageInput = (files: FileList | null) => {
    try {
      addImageFiles(Array.from(files || []));
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "Images could not be selected.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    handleImageInput(event.dataTransfer.files);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUploadProgress(0);
    setSaving(true);

    try {
      const sizes = form.sizes
        .map((size) => ({ size: size.size.trim(), price: Number(size.price) }))
        .filter((size) => size.size);
      const price = Number(form.price);
      const stock = Number(form.stock);
      const selectedBrand = availableBrands.find((brand) => getBrandId(brand) === form.brandId);
      const selectedCategories = categories.filter((category) =>
        form.categoryIds.includes(category.id),
      );

      if (totalImageCount < 1 || totalImageCount > MAX_IMAGES) {
        throw new Error("Select between 1 and 5 product images.");
      }

      if (!initial && imageFiles.length === 0) {
        throw new Error("Select at least one product image.");
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

      if (categoriesLoading) {
        throw new Error("Categories are still loading.");
      }

      if (!selectedCategoryValue) {
        throw new Error("Select a category before selecting a brand.");
      }

      if (!form.brandId) {
        throw new Error("Select a brand.");
      }

      if (!selectedBrand) {
        throw new Error(brandsError || "No brands available.");
      }

      if (!form.categoryIds.length || !selectedCategories.length) {
        throw new Error(categoriesError || "Select a category.");
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
      payload.append("categoryIds", selectedCategories.map((category) => category.id).join(","));
      payload.append("categories", selectedCategories.map((category) => category.name).join(" | "));
      payload.append("price", String(price));
      payload.append("stock", String(stock));
      payload.append("description", form.description.trim());
      payload.append("type", String(form.type || "").trim());
      payload.append("isLatest", String(Boolean(form.isLatest)));
      appendJson(payload, "topNotes", form.topNotes);
      appendJson(payload, "middleNotes", form.middleNotes);
      appendJson(payload, "baseNotes", form.baseNotes);
      appendJson(payload, "notes", [...form.topNotes, ...form.middleNotes, ...form.baseNotes]);
      appendJson(payload, "sizes", sizes);

      if (initial) {
        appendJson(payload, "existingImages", existingImages);
      }

      imageFiles.forEach((file) => payload.append("images", file));

      await onSubmit(payload, {
        onUploadProgress: (progress) => setUploadProgress(progress),
      });

      if (resetOnSuccess) {
        setForm(createEmptyForm());
        setExistingImages([]);
        setImageFiles([]);
      }

      setUploadProgress(100);
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
                const selectedBrand = availableBrands.find((brand) => getBrandId(brand) === brandId);

                setForm((current) => ({
                  ...current,
                  brandId,
                  brand: selectedBrand?.name || "",
                }));
              }}
              disabled={!selectedCategoryValue || brandsLoading || availableBrands.length === 0}
              className={inputCls}
            >
              <option value="">
                {!selectedCategoryValue
                  ? "Select category first"
                  : brandsLoading
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
            {brandsError ? <p className="mt-2 text-xs text-red-600">{brandsError}</p> : null}
            {!brandsLoading && selectedCategoryValue && !brandsError && availableBrands.length === 0 ? (
              <p className="mt-2 text-xs text-navy/55">No brands available.</p>
            ) : null}
          </>
        </Field>
        <Field label="Category">
          <div className="space-y-3 rounded-[1.3rem] border border-border bg-beige/20 p-3">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const selected = form.categoryIds.includes(category.id);

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setForm((current) => {
                        const nextIds = selected ? [] : [category.id];
                        const nextCategories = categories.filter((item) =>
                          nextIds.includes(item.id),
                        );

                        return {
                          ...current,
                          brand: "",
                          brandId: "",
                          categories: nextCategories,
                          categoryIds: nextIds,
                          categoryNames: nextCategories.map((item) => item.name),
                          categorySlugs: nextCategories.map((item) => item.slug),
                          primaryCategory: nextCategories[0]?.id || "",
                          category: nextCategories.map((item) => item.name).join(", "),
                          categoryId: nextCategories[0]?.id || "",
                          categorySlug: nextCategories[0]?.slug || "",
                          categoryDetails: nextCategories[0] || null,
                        };
                      });
                    }}
                    className={`rounded-full border px-3 py-2 text-sm transition ${
                      selected
                        ? "border-navy bg-navy text-beige"
                        : "border-border bg-card text-navy/70 hover:border-navy/35 hover:text-navy"
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-navy/55">
              {form.categoryIds.length
                ? `${form.categoryIds.length} categories selected`
                : categoriesLoading
                  ? "Loading categories..."
                  : "Choose one or more categories"}
            </p>
          </div>
          {categoriesError ? <p className="mt-2 text-xs text-red-600">{categoriesError}</p> : null}
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
          <span className="text-xs uppercase tracking-[0.2em] text-navy/60">Latest Product</span>
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
        <div className="space-y-4">
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragActive(false);
            }}
            onDrop={handleDrop}
            className={`flex min-h-32 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-6 text-center transition ${
              dragActive
                ? "border-navy bg-beige/70"
                : "border-navy/25 bg-beige/30 hover:border-navy/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(event) => handleImageInput(event.target.files)}
              className="sr-only"
            />
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-navy shadow-soft">
              <ImagePlus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-navy">
                {totalImageCount
                  ? `${totalImageCount}/${MAX_IMAGES} images selected`
                  : "Upload product images"}
              </p>
              <p className="mt-1 text-xs text-navy/55">JPG, PNG, or WEBP under 5MB each</p>
            </div>
          </div>

          {imagePreviewItems.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {imagePreviewItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-lg border border-border bg-beige/70"
                >
                  <img
                    src={item.src}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    className="aspect-square w-full object-contain object-center p-2"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      item.type === "existing"
                        ? removeExistingImage(item.index)
                        : removeSelectedFile(item.index)
                    }
                    className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-navy shadow-sm transition hover:border-red-200 hover:text-red-600"
                    aria-label={`Remove ${item.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-24 items-center justify-center rounded-lg border border-border bg-beige/40 text-xs uppercase tracking-[0.2em] text-navy/40">
              No images selected
            </div>
          )}

          {saving && uploadProgress > 0 ? (
            <div className="space-y-2">
              <div className="h-2 overflow-hidden rounded-full bg-beige">
                <div
                  className="h-full rounded-full bg-navy transition-all"
                  style={{ width: `${Math.min(Math.max(uploadProgress, 0), 100)}%` }}
                />
              </div>
              <p className="text-right text-xs text-navy/55">{Math.round(uploadProgress)}%</p>
            </div>
          ) : null}
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

      <Field label="Type">
        <input
          value={form.type || ""}
          onChange={(e) => set("type", e.target.value)}
          placeholder="Fresh, Woody, Summer"
          className={inputCls}
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
          disabled={
            saving ||
            brandsLoading ||
            categoriesLoading ||
            !form.brandId ||
            form.categoryIds.length === 0
          }
          className="!bg-navy !text-beige"
        >
          {saving ? `Uploading ${Math.round(uploadProgress)}%` : submitLabel}
        </Button>
      </div>
    </form>
  );
});
