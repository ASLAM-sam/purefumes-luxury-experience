import { r as reactExports, j as jsxRuntimeExports, aA as ImagePlus, X, U as Plus } from "./vendor-react-98xxEzFV.js";
import { e as createCatalogSlug, i as filterBrandsByCategory, B as Button, d as categoriesApi, g as brandsApi } from "./router-DvCKRw9U.js";
const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp)$/i;
const IMAGE_TYPES = /* @__PURE__ */ new Set([
  "",
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "application/octet-stream"
]);
const createEmptyForm = () => ({
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
  originalPrice: "",
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
  stock: ""
});
const getProductImages = (product) => product?.images?.length ? product.images.filter(Boolean) : product?.image ? [product.image] : [];
const toFormState = (product) => {
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
  const originalPrice = Number(product.originalPrice ?? 0);
  return {
    ...createEmptyForm(),
    ...rest,
    brandId: product.brandId || product.brandDetails?.id || "",
    categories: product.categories || [],
    categoryIds: product.categoryIds?.length ? product.categoryIds : product.categories?.map((category) => category.id).filter(Boolean) || [],
    categoryNames: product.categoryNames?.length ? product.categoryNames : product.categories?.map((category) => category.name).filter(Boolean) || [],
    categorySlugs: product.categorySlugs?.length ? product.categorySlugs : product.categories?.map((category) => category.slug).filter(Boolean) || [],
    primaryCategory: product.primaryCategory || product.categoryId || "",
    category: product.category || product.categoryNames?.join(", ") || "",
    price: Number.isFinite(price) ? String(price) : "",
    originalPrice: Number.isFinite(originalPrice) && originalPrice > 0 ? String(originalPrice) : "",
    sizes: product.sizes?.length ? product.sizes.map((size) => ({
      size: size.size,
      price: Number.isFinite(Number(size.price)) ? String(size.price) : ""
    })) : [{ size: "Standard", price: Number.isFinite(price) ? String(price) : "" }],
    stock: stock === void 0 || stock === null ? "" : String(stock)
  };
};
const getBrandId = (brand) => brand.id || brand._id || "";
const getCategoryBrandValue = (category) => category?.id || category?.slug || createCatalogSlug(category?.name || "") || category?.name || "";
function Field({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.2em] text-navy/60", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5", children })
  ] });
}
const inputCls = "w-full px-4 py-2.5 rounded-lg bg-beige/40 border border-border focus:border-navy outline-none text-sm";
const TYPE_OPTIONS = ["Retail", "Tester", "Tester without cap", "Unboxed"];
function CSVInput({
  value,
  onChange,
  placeholder
}) {
  const [text, setText] = reactExports.useState(value.join(", "));
  const [focused, setFocused] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!focused) {
      setText(value.join(", "));
    }
  }, [focused, value]);
  const parseNotes = (inputValue) => inputValue.split(",").map((s) => s.trim()).filter(Boolean);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "input",
    {
      value: text,
      placeholder,
      onFocus: () => setFocused(true),
      onBlur: () => {
        const notes = parseNotes(text);
        setFocused(false);
        setText(notes.join(", "));
        onChange(notes);
      },
      onChange: (e) => {
        setText(e.target.value);
        onChange(parseNotes(e.target.value));
      },
      className: inputCls
    }
  );
}
const appendJson = (data, key, value) => {
  data.append(key, JSON.stringify(value));
};
const fileKey = (file) => `${file.name}:${file.size}:${file.lastModified}`;
const ProductForm = reactExports.memo(function ProductForm2({
  initial,
  onSubmit,
  submitLabel = "Save Product",
  resetOnSuccess = false
}) {
  const fileInputRef = reactExports.useRef(null);
  const [form, setForm] = reactExports.useState(() => toFormState(initial));
  const [brands, setBrands] = reactExports.useState([]);
  const [categories, setCategories] = reactExports.useState([]);
  const [brandsLoading, setBrandsLoading] = reactExports.useState(false);
  const [brandsError, setBrandsError] = reactExports.useState("");
  const [categoriesLoading, setCategoriesLoading] = reactExports.useState(true);
  const [categoriesError, setCategoriesError] = reactExports.useState("");
  const [existingImages, setExistingImages] = reactExports.useState(() => getProductImages(initial));
  const [imageFiles, setImageFiles] = reactExports.useState([]);
  const [filePreviews, setFilePreviews] = reactExports.useState([]);
  const [dragActive, setDragActive] = reactExports.useState(false);
  const [saving, setSaving] = reactExports.useState(false);
  const [uploadProgress, setUploadProgress] = reactExports.useState(0);
  const [error, setError] = reactExports.useState("");
  const [success, setSuccess] = reactExports.useState("");
  reactExports.useEffect(() => {
    setForm(toFormState(initial));
    setExistingImages(getProductImages(initial));
    setImageFiles([]);
    setUploadProgress(0);
    setError("");
    setSuccess("");
  }, [initial]);
  reactExports.useEffect(() => {
    const previews = imageFiles.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageFiles]);
  reactExports.useEffect(() => {
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
  const set = (k, v) => setForm((current) => ({ ...current, [k]: v }));
  const setPrice = (value) => {
    if (value !== "" && Number(value) < 0) return;
    setForm((current) => ({
      ...current,
      price: value,
      sizes: current.sizes.length ? current.sizes.map((size, index) => index === 0 ? { ...size, price: value } : size) : [{ size: "Standard", price: value }]
    }));
  };
  const setStock = (value) => {
    if (value !== "" && Number(value) < 0) return;
    set("stock", value);
  };
  const setOriginalPrice = (value) => {
    if (value !== "" && Number(value) < 0) return;
    set("originalPrice", value);
  };
  const selectedCategory = reactExports.useMemo(
    () => categories.find((category) => form.categoryIds.includes(category.id)) || form.categoryDetails || null,
    [categories, form.categoryDetails, form.categoryIds]
  );
  const selectedCategoryValue = reactExports.useMemo(() => {
    return getCategoryBrandValue(selectedCategory) || form.categorySlug || form.categorySlugs[0] || createCatalogSlug(form.categoryNames[0] || form.category) || form.categoryNames[0] || form.category;
  }, [
    form.category,
    form.categoryNames,
    form.categorySlug,
    form.categorySlugs,
    selectedCategory
  ]);
  reactExports.useEffect(() => {
    let isActive = true;
    if (!selectedCategoryValue) {
      setBrands([]);
      setBrandsLoading(false);
      setBrandsError("");
      setForm(
        (current) => current.brandId || current.brand ? { ...current, brandId: "", brand: "" } : current
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
          { forceFresh: true }
        );
        if (!isActive) return;
        setBrands(filterBrandsByCategory(nextBrands, selectedCategory || selectedCategoryValue));
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
  }, [selectedCategory, selectedCategoryValue]);
  const availableBrands = reactExports.useMemo(() => {
    if (!selectedCategoryValue) return [];
    return filterBrandsByCategory(brands, selectedCategory || selectedCategoryValue);
  }, [brands, selectedCategory, selectedCategoryValue]);
  reactExports.useEffect(() => {
    if (!form.brandId || brandsLoading || !selectedCategoryValue) return;
    const selectedBrandStillAvailable = availableBrands.some(
      (brand) => getBrandId(brand) === form.brandId
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
      type: "existing",
      index
    })),
    ...filePreviews.map((src, index) => ({
      id: `file-${imageFiles[index] ? fileKey(imageFiles[index]) : src}`,
      src,
      name: imageFiles[index]?.name || `Image ${existingImages.length + index + 1}`,
      type: "file",
      index
    }))
  ];
  const addSize = () => set("sizes", [...form.sizes, { size: "", price: "" }]);
  const removeSize = (index) => set(
    "sizes",
    form.sizes.filter((_, itemIndex) => itemIndex !== index)
  );
  const updateSize = (index, key, value) => {
    if (key === "price" && value !== "" && Number(value) < 0) return;
    const nextSizes = form.sizes.map(
      (size, itemIndex) => itemIndex === index ? { ...size, [key]: value } : size
    );
    setForm((current) => ({
      ...current,
      sizes: nextSizes,
      price: index === 0 && key === "price" ? value : current.price
    }));
  };
  const validateImageFile = (file) => {
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
  const addImageFiles = (files) => {
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
  const removeExistingImage = (index) => {
    setError("");
    setExistingImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
  };
  const removeSelectedFile = (index) => {
    setError("");
    setImageFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  };
  const handleImageInput = (files) => {
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
  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    handleImageInput(event.dataTransfer.files);
  };
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUploadProgress(0);
    setSaving(true);
    try {
      const sizes = form.sizes.map((size) => ({ size: size.size.trim(), price: Number(size.price) })).filter((size) => size.size);
      const price = Number(form.price);
      const stock = Number(form.stock);
      const originalPrice = form.originalPrice.trim() === "" ? null : Number(form.originalPrice);
      const selectedBrand = availableBrands.find((brand) => getBrandId(brand) === form.brandId);
      const selectedCategories = categories.filter(
        (category) => form.categoryIds.includes(category.id)
      );
      if (totalImageCount < 1 || totalImageCount > MAX_IMAGES) {
        throw new Error("Select between 1 and 5 product images.");
      }
      if (!initial && imageFiles.length === 0) {
        throw new Error("Select at least one product image.");
      }
      if (form.price.trim() === "" || !Number.isFinite(price) || price < 0) {
        throw new Error("Enter a valid selling price.");
      }
      if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice <= 0)) {
        throw new Error("Original Price / MRP must be greater than 0.");
      }
      if (form.stock.trim() === "" || !Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
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
      if (form.sizes.some(
        (size) => size.size.trim() && (size.price.trim() === "" || !Number.isFinite(Number(size.price)) || Number(size.price) < 0)
      )) {
        throw new Error("Every size needs a valid price.");
      }
      const payload = new FormData();
      payload.append("name", form.name.trim());
      payload.append("brandId", form.brandId);
      payload.append("categoryIds", selectedCategories.map((category) => category.id).join(","));
      payload.append("categories", selectedCategories.map((category) => category.name).join(" | "));
      payload.append("price", String(price));
      if (originalPrice !== null) {
        payload.append("originalPrice", String(originalPrice));
      }
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
        onUploadProgress: (progress) => setUploadProgress(progress)
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Name", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          required: true,
          value: form.name,
          onChange: (e) => set("name", e.target.value),
          className: inputCls
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Brand", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            required: true,
            value: form.brandId ?? "",
            onChange: (e) => {
              const brandId = e.target.value;
              const selectedBrand = availableBrands.find((brand) => getBrandId(brand) === brandId);
              setForm((current) => ({
                ...current,
                brandId,
                brand: selectedBrand?.name || ""
              }));
            },
            disabled: !selectedCategoryValue || brandsLoading || availableBrands.length === 0,
            className: inputCls,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: !selectedCategoryValue ? "Select category first" : brandsLoading ? "Loading brands..." : availableBrands.length > 0 ? "Select Brand" : "No brands available" }),
              availableBrands.map((brand) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: getBrandId(brand), children: brand.name }, getBrandId(brand)))
            ]
          }
        ),
        brandsError ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-red-600", children: brandsError }) : null,
        !brandsLoading && selectedCategoryValue && !brandsError && availableBrands.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-navy/55", children: "No brands available." }) : null
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Category", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-[1.3rem] border border-border bg-beige/20 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: categories.map((category) => {
            const selected = form.categoryIds.includes(category.id);
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  setForm((current) => {
                    const nextIds = selected ? [] : [category.id];
                    const nextCategories = categories.filter(
                      (item) => nextIds.includes(item.id)
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
                      categoryDetails: nextCategories[0] || null
                    };
                  });
                },
                className: `rounded-full border px-3 py-2 text-sm transition ${selected ? "border-navy bg-navy text-beige" : "border-border bg-card text-navy/70 hover:border-navy/35 hover:text-navy"}`,
                children: category.name
              },
              category.id
            );
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-navy/55", children: form.categoryIds.length ? `${form.categoryIds.length} categories selected` : categoriesLoading ? "Loading categories..." : "Choose one or more categories" })
        ] }),
        categoriesError ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-red-600", children: categoriesError }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Selling Price / Discount Price", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          required: true,
          type: "number",
          min: 0,
          step: "0.01",
          value: form.price,
          onChange: (e) => setPrice(e.target.value),
          className: inputCls
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Original Price / MRP", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "number",
            min: 0,
            step: "0.01",
            value: form.originalPrice,
            onChange: (e) => setOriginalPrice(e.target.value),
            className: inputCls
          }
        ),
        form.originalPrice.trim() !== "" && Number(form.originalPrice) < Number(form.price) ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-amber-700", children: "Warning: Original Price is less than Selling Price." }) : null
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Stock", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          required: true,
          type: "number",
          min: 0,
          step: 1,
          value: form.stock,
          onChange: (e) => setStock(e.target.value),
          className: inputCls
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-4 rounded-lg border border-border bg-beige/30 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.2em] text-navy/60", children: "Latest Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-navy/55", children: "Show this fragrance in the homepage latest products section." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "checkbox",
          checked: Boolean(form.isLatest),
          onChange: (e) => set("isLatest", e.target.checked),
          className: "h-5 w-5 accent-navy"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { className: "rounded-lg border border-border p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { className: "px-2 text-xs uppercase tracking-[0.25em] text-navy/60", children: "Product Images" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            role: "button",
            tabIndex: 0,
            onClick: () => fileInputRef.current?.click(),
            onKeyDown: (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            },
            onDragEnter: (event) => {
              event.preventDefault();
              setDragActive(true);
            },
            onDragOver: (event) => {
              event.preventDefault();
              setDragActive(true);
            },
            onDragLeave: (event) => {
              event.preventDefault();
              setDragActive(false);
            },
            onDrop: handleDrop,
            className: `flex min-h-32 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-6 text-center transition ${dragActive ? "border-navy bg-beige/70" : "border-navy/25 bg-beige/30 hover:border-navy/50"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  ref: fileInputRef,
                  type: "file",
                  multiple: true,
                  accept: ".jpg,.jpeg,.png,.webp",
                  onChange: (event) => handleImageInput(event.target.files),
                  className: "sr-only"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-full bg-card text-navy shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-navy", children: totalImageCount ? `${totalImageCount}/${MAX_IMAGES} images selected` : "Upload product images" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-navy/55", children: "JPG, PNG, or WEBP under 5MB each" })
              ] })
            ]
          }
        ),
        imagePreviewItems.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-5", children: imagePreviewItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "group relative overflow-hidden rounded-lg border border-border bg-beige/70",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: item.src,
                  alt: item.name,
                  loading: "lazy",
                  decoding: "async",
                  className: "aspect-square w-full object-contain object-center p-2"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => item.type === "existing" ? removeExistingImage(item.index) : removeSelectedFile(item.index),
                  className: "absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-navy shadow-sm transition hover:border-red-200 hover:text-red-600",
                  "aria-label": `Remove ${item.name}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
                }
              )
            ]
          },
          item.id
        )) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-24 items-center justify-center rounded-lg border border-border bg-beige/40 text-xs uppercase tracking-[0.2em] text-navy/40", children: "No images selected" }),
        saving && uploadProgress > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 overflow-hidden rounded-full bg-beige", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-full rounded-full bg-navy transition-all",
              style: { width: `${Math.min(Math.max(uploadProgress, 0), 100)}%` }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-right text-xs text-navy/55", children: [
            Math.round(uploadProgress),
            "%"
          ] })
        ] }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Description", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        rows: 3,
        value: form.description,
        onChange: (e) => set("description", e.target.value),
        className: `${inputCls} resize-none`
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Type", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "select",
      {
        value: form.type || "",
        onChange: (e) => set("type", e.target.value),
        className: inputCls,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select type" }),
          TYPE_OPTIONS.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: option, children: option }, option))
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { className: "rounded-lg border border-border p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { className: "px-2 text-xs uppercase tracking-[0.25em] text-navy/60", children: "Notes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Top", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          CSVInput,
          {
            value: form.topNotes,
            onChange: (value) => set("topNotes", value),
            placeholder: "Bergamot, Lemon"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Middle", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          CSVInput,
          {
            value: form.middleNotes,
            onChange: (value) => set("middleNotes", value),
            placeholder: "Rose, Jasmine"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Base", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          CSVInput,
          {
            value: form.baseNotes,
            onChange: (value) => set("baseNotes", value),
            placeholder: "Vanilla, Musk"
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { className: "rounded-lg border border-border p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { className: "px-2 text-xs uppercase tracking-[0.25em] text-navy/60", children: "Sizes & Pricing" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        form.sizes.map((size, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_1fr_2rem] items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: size.size,
              onChange: (e) => updateSize(index, "size", e.target.value),
              placeholder: "2ml",
              className: inputCls
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              min: 0,
              step: "0.01",
              value: size.price,
              onChange: (e) => updateSize(index, "price", e.target.value),
              placeholder: "Price",
              className: inputCls
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => removeSize(index),
              className: "text-navy/50 hover:text-red-600",
              "aria-label": "Remove size",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
            }
          )
        ] }, index)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: addSize,
            className: "mt-2 inline-flex items-center gap-1 text-xs text-navy/70 hover:text-navy",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
              " Add size"
            ]
          }
        )
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600", children: error }),
    success && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-emerald-700", children: success }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end border-t border-border pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        type: "submit",
        disabled: saving || brandsLoading || categoriesLoading || !form.brandId || form.categoryIds.length === 0,
        className: "!bg-navy !text-beige",
        children: saving ? `Uploading ${Math.round(uploadProgress)}%` : submitLabel
      }
    ) })
  ] });
});
export {
  ProductForm as P
};
