import { r as reactExports, j as jsxRuntimeExports, as as FileSpreadsheet, at as PencilLine, au as Upload, av as Download, J as Trash2, U as Plus, aw as Pencil } from "./vendor-react-98xxEzFV.js";
import { j as useRouterState, O as Outlet, L as Link } from "./vendor-tanstack-DkD25YnA.js";
import { A as AdminShell } from "./AdminShell-P9dOFq5Y.js";
import { a as useNotification, e as createCatalogSlug, p as productsApi, g as brandsApi, d as categoriesApi, f as formatINR } from "./router-DvCKRw9U.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription } from "./dialog-BFHKLRA3.js";
import { C as ConfirmModal } from "./ConfirmModal-CZ9ASx2b.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "util";
import "stream";
import "path";
import "http";
import "https";
import "url";
import "fs";
import "crypto";
import "assert";
import "./worker-entry-8w9vAzi1.js";
import "node:events";
import "os";
import "zlib";
import "events";
import "./vendor-motion-3kNaalGV.js";
import "./vendor-charts-Ot63D9Dz.js";
import "./vendor-radix-xsh1HthL.js";
const MANUAL_BATCH_LIMIT = 20;
let manualRowSeed = 0;
const createManualEntryRow = () => ({
  id: `product-row-${manualRowSeed += 1}`,
  name: "",
  brand: "",
  category: "",
  price: "",
  stock: "",
  description: ""
});
const createManualEntryRows = (count = MANUAL_BATCH_LIMIT) => Array.from({ length: count }, () => createManualEntryRow());
const normalizeHeader = (value = "") => String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
const normalizeName = (value = "") => String(value).trim().toLowerCase().replace(/\s+/g, " ");
const getProductCategoryFromBrand = (brand) => {
  if (!brand) return "";
  return brand.categoryName || brand.categorySlug || brand.category || "";
};
const findCategoryMatch = (value = "", categories) => {
  const input = String(value || "").trim();
  const inputSlug = createCatalogSlug(input);
  if (!input && !inputSlug) return null;
  return categories.find(
    (category) => category.id === input || category._id === input || createCatalogSlug(category.slug) === inputSlug || createCatalogSlug(category.name) === inputSlug
  ) || null;
};
const parsePrice = (value) => {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return { ok: false, reason: "Price is required." };
  }
  const price = Number(normalized);
  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, reason: "Price must be a non-negative number." };
  }
  return { ok: true, value: price };
};
const parseStock = (value) => {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return { ok: false, reason: "Stock is required." };
  }
  const stock = Number(normalized);
  if (!Number.isFinite(stock) || !Number.isInteger(stock) || stock < 0) {
    return { ok: false, reason: "Stock must be a non-negative whole number." };
  }
  return { ok: true, value: stock };
};
const parseCsv = (input = "") => {
  const rows = [];
  let currentRow = [];
  let currentCell = "";
  let inQuotes = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        currentCell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      continue;
    }
    currentCell += char;
  }
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }
  return rows.map((row) => row.map((cell) => cell.trim())).filter((row) => row.some((cell) => cell.length > 0));
};
const parseProductCsvText = (text = "") => {
  const rows = parseCsv(text);
  if (rows.length < 2) {
    throw new Error("CSV must include a header row and at least one product row.");
  }
  const headers = rows[0].map(normalizeHeader);
  const findHeader = (...aliases) => aliases.map((alias) => headers.indexOf(alias)).find((index) => index >= 0) ?? -1;
  const nameIndex = findHeader("name", "product", "product_name");
  const brandIndex = findHeader("brand", "brand_name");
  const priceIndex = findHeader("price", "selling_price");
  const stockIndex = findHeader("stock", "quantity");
  const descriptionIndex = findHeader("description", "details");
  const categoryIndex = findHeader("category", "product_category");
  const imageIndex = findHeader("image", "image_url", "primary_image");
  const sizesIndex = findHeader("sizes", "size_options");
  if (nameIndex < 0 || brandIndex < 0 || priceIndex < 0 || stockIndex < 0) {
    throw new Error(
      "CSV headers must include name, brand, price, and stock. Use the template to avoid guesswork."
    );
  }
  return rows.slice(1).map((row, index) => ({
    rowNumber: index + 2,
    name: String(row[nameIndex] || "").trim(),
    brand: String(row[brandIndex] || "").trim(),
    category: categoryIndex >= 0 ? String(row[categoryIndex] || "").trim() : "",
    price: String(row[priceIndex] || "").trim(),
    stock: String(row[stockIndex] || "").trim(),
    description: descriptionIndex >= 0 ? String(row[descriptionIndex] || "").trim() : "",
    image: imageIndex >= 0 ? String(row[imageIndex] || "").trim() : "",
    sizes: sizesIndex >= 0 ? String(row[sizesIndex] || "").trim() : ""
  })).filter((row) => row.name || row.brand || String(row.price).trim() || String(row.stock).trim());
};
function downloadTemplate() {
  const csv = [
    "name,brand,category,price,stock,description,image,sizes",
    "Sample Perfume,Brand Name,Category Name,2499,18,Short product description,https://example.com/product.jpg,Standard:2499|100ml:3299"
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "products-import-template.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
function BulkProductUploadDialog({
  open,
  onOpenChange,
  existingProducts,
  existingBrands,
  existingCategories,
  onImported
}) {
  const { addNotification } = useNotification();
  const inputRef = reactExports.useRef(null);
  const [uploadMode, setUploadMode] = reactExports.useState("csv");
  const [fileName, setFileName] = reactExports.useState("");
  const [csvRows, setCsvRows] = reactExports.useState([]);
  const [manualRows, setManualRows] = reactExports.useState(() => createManualEntryRows());
  const [error, setError] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  const [result, setResult] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!open) {
      setUploadMode("csv");
      setFileName("");
      setCsvRows([]);
      setManualRows(createManualEntryRows());
      setError("");
      setSaving(false);
      setResult(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }, [open]);
  const brandMap = reactExports.useMemo(
    () => new Map(existingBrands.map((brand) => [normalizeName(brand.name), brand])),
    [existingBrands]
  );
  const activeRows = reactExports.useMemo(() => {
    if (uploadMode === "csv") {
      return csvRows;
    }
    return manualRows.flatMap(
      (row, index) => row.name.trim() || row.brand.trim() || row.category.trim() || row.price.trim() || row.stock.trim() || row.description.trim() ? [
        {
          rowNumber: index + 1,
          name: row.name.trim(),
          brand: row.brand.trim(),
          category: row.category.trim(),
          price: row.price.trim(),
          stock: row.stock.trim(),
          description: row.description.trim()
        }
      ] : []
    );
  }, [csvRows, manualRows, uploadMode]);
  const previewRows = reactExports.useMemo(() => {
    const existingProductKeys = new Set(
      existingProducts.map((product) => {
        const brandName = normalizeName(product.brandDetails?.name || product.brand);
        return `${brandName}::${normalizeName(product.name)}`;
      })
    );
    const seenUploadKeys = /* @__PURE__ */ new Set();
    return activeRows.map((row) => {
      const name = String(row.name || "").trim();
      const brandName = String(row.brand || "").trim();
      const description = String(row.description || "").trim();
      const matchedBrand = brandMap.get(normalizeName(brandName));
      const detectedCategory = row.category?.trim() || getProductCategoryFromBrand(matchedBrand);
      const matchedCategory = findCategoryMatch(detectedCategory, existingCategories);
      if (!name) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          detectedCategory,
          status: "failed",
          reason: "Product name is required."
        };
      }
      if (name.length > 160) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          detectedCategory,
          status: "failed",
          reason: "Product name cannot exceed 160 characters."
        };
      }
      if (!brandName) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          detectedCategory,
          status: "failed",
          reason: "Brand is required."
        };
      }
      if (!detectedCategory) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          detectedCategory,
          status: "failed",
          reason: "Category is required."
        };
      }
      if (!matchedBrand && !matchedCategory) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          detectedCategory,
          status: "failed",
          reason: "Category is required for a new brand and must match an existing category."
        };
      }
      if (detectedCategory && !matchedCategory) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          detectedCategory,
          status: "failed",
          reason: `Category '${detectedCategory}' does not exist.`
        };
      }
      const priceResult = parsePrice(row.price);
      if (!priceResult.ok) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          detectedCategory,
          status: "failed",
          reason: priceResult.reason
        };
      }
      const stockResult = parseStock(row.stock);
      if (!stockResult.ok) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          detectedCategory,
          status: "failed",
          reason: stockResult.reason
        };
      }
      if (description.length > 4e3) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          detectedCategory,
          status: "failed",
          reason: "Description cannot exceed 4000 characters."
        };
      }
      const productKey = `${normalizeName(brandName)}::${normalizeName(name)}`;
      if (seenUploadKeys.has(productKey)) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          detectedCategory,
          status: "skipped",
          reason: "Duplicate product for the same brand in this batch."
        };
      }
      if (existingProductKeys.has(productKey)) {
        const matched = existingProducts.find((p) => {
          const key = `${normalizeName(p.brandDetails?.name || p.brand)}::${normalizeName(p.name)}`;
          return key === productKey;
        });
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          detectedCategory,
          status: "skipped",
          reason: matched ? `Product already exists: ${matched.name}${matched.id ? ` (id: ${matched.id})` : ""}` : "Product already exists for this brand."
        };
      }
      seenUploadKeys.add(productKey);
      return {
        ...row,
        rowNumber: row.rowNumber || 0,
        detectedCategory,
        status: "ready",
        reason: "Ready to import. Missing brands will be created with the selected category, and exact duplicate products will be skipped."
      };
    });
  }, [activeRows, brandMap, existingCategories, existingProducts]);
  const readyCount = previewRows.filter((row) => row.status === "ready").length;
  const readyRows = previewRows.filter((row) => row.status === "ready");
  const issueCount = previewRows.length - readyCount;
  const filledManualRowCount = manualRows.filter(
    (row) => row.name.trim() || row.brand.trim() || row.category.trim() || row.price.trim() || row.stock.trim() || row.description.trim()
  ).length;
  const handleFileChange = async (file) => {
    if (!file) return;
    setError("");
    setResult(null);
    setFileName(file.name);
    try {
      const text = await file.text();
      const parsedRows = parseProductCsvText(text);
      setCsvRows(parsedRows);
    } catch (nextError) {
      setCsvRows([]);
      setError(nextError instanceof Error ? nextError.message : "CSV could not be parsed.");
    }
  };
  const updateManualRow = (id, field, value) => {
    setResult(null);
    setError("");
    setManualRows(
      (current) => current.map((row) => row.id === id ? { ...row, [field]: value } : row)
    );
  };
  const clearManualRow = (id) => {
    setResult(null);
    setError("");
    setManualRows(
      (current) => current.map(
        (row) => row.id === id ? { ...row, name: "", brand: "", category: "", price: "", stock: "", description: "" } : row
      )
    );
  };
  const handleImport = async () => {
    if (!activeRows.length) {
      addNotification(
        uploadMode === "csv" ? "Choose a CSV file before importing." : "Fill at least one product row before importing.",
        "error"
      );
      return;
    }
    if (readyCount === 0) {
      addNotification("There are no valid product rows ready to import.", "error");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await productsApi.bulkCreate(readyRows);
      setResult(response);
      await onImported();
      addNotification(`${response.createdCount} products imported successfully.`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Bulk import failed.");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[92vh] overflow-y-auto rounded-2xl border-border bg-card sm:max-w-6xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-display text-3xl text-navy", children: "Bulk Add Products" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { className: "text-navy/60", children: [
        "Import base catalog data with either a CSV file or a manual 20-row grid. Use",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "name" }),
        ", ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "brand" }),
        ", ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "price" }),
        ", ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "stock" }),
        ", and optional ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "category" }),
        ", ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "description" }),
        ", ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "image" }),
        ", or",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "sizes" }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 rounded-2xl border border-border bg-beige/20 p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              setUploadMode("csv");
              setError("");
              setResult(null);
            },
            className: `flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm transition ${uploadMode === "csv" ? "bg-navy text-beige" : "text-navy/70 hover:bg-beige/60"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "h-4 w-4" }),
              " CSV Upload"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              setUploadMode("manual");
              setError("");
              setResult(null);
            },
            className: `flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm transition ${uploadMode === "manual" ? "bg-navy text-beige" : "text-navy/70 hover:bg-beige/60"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PencilLine, { className: "h-4 w-4" }),
              " Manual Batch"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-[1.15fr_0.85fr]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `rounded-2xl p-6 ${uploadMode === "csv" ? "border border-dashed border-navy/25 bg-beige/20" : "border border-border bg-beige/15"}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-full bg-navy text-beige", children: uploadMode === "csv" ? /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(PencilLine, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: uploadMode === "csv" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-navy", children: "Upload a products CSV" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-navy/60", children: "This step creates product records only. Missing brands are auto-created, and exact duplicate products for the same brand are skipped safely." }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => inputRef.current?.click(),
                      className: "inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-3 text-sm text-beige transition hover:opacity-90",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
                        " Choose CSV"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: downloadTemplate,
                      className: "inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm text-navy/70 transition hover:bg-beige/40",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
                        " Download Template"
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    ref: inputRef,
                    type: "file",
                    accept: ".csv,text/csv",
                    onChange: (event) => handleFileChange(event.target.files?.[0]),
                    className: "sr-only"
                  }
                ),
                fileName ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-sm text-navy/65", children: [
                  "Selected file: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-navy", children: fileName })
                ] }) : null
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-navy", children: "Manually add up to 20 products" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-navy/60", children: "Add multiple perfumes under the same brand freely. Category is optional, and missing brands will be created during import." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex flex-wrap gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      setManualRows(createManualEntryRows());
                      setResult(null);
                      setError("");
                    },
                    className: "inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm text-navy/70 transition hover:bg-beige/40",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
                      " Clear 20 Rows"
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-sm text-navy/65", children: [
                  "Filled rows:",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-navy", children: [
                    filledManualRowCount,
                    " / ",
                    MANUAL_BATCH_LIMIT
                  ] })
                ] })
              ] }) })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-beige/25 p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-navy/55", children: "Preview Summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.16em] text-navy/45", children: "Rows" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-3xl text-navy", children: activeRows.length })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.16em] text-navy/45", children: "Ready" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-3xl text-navy", children: readyCount })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.16em] text-navy/45", children: "Needs Review" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-3xl text-navy", children: issueCount })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.16em] text-navy/45", children: "Available Brands" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-3xl text-navy", children: existingBrands.length })
            ] })
          ] })
        ] })
      ] }),
      error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600", children: error }) : null,
      uploadMode === "manual" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-2xl border border-border/70 bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border/70 px-5 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-2xl text-navy", children: "20-Product Entry Grid" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-navy/60", children: "Blank rows are ignored. Each saved product gets a Standard size based on the entered price unless you provide custom sizes in CSV." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[24rem] overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[72rem] text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-beige/40 text-xs uppercase tracking-[0.18em] text-navy/55", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left", children: "#" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left", children: "Product Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left", children: "Brand" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left", children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left", children: "Price" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left", children: "Stock" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left", children: "Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-right", children: "Clear" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: manualRows.map((row, index) => {
            const matchedBrand = brandMap.get(normalizeName(row.brand));
            const detectedCategory = row.category.trim() || getProductCategoryFromBrand(matchedBrand);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3 text-navy/55", children: index + 1 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  value: row.name,
                  onChange: (event) => updateManualRow(row.id, "name", event.target.value),
                  placeholder: "9PM",
                  className: "w-full rounded-lg border border-border bg-beige/35 px-3 py-2.5 text-sm text-navy outline-none focus:border-navy"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  value: row.brand,
                  onChange: (event) => updateManualRow(row.id, "brand", event.target.value),
                  placeholder: "Brand name",
                  className: "w-full rounded-lg border border-border bg-beige/35 px-3 py-2.5 text-sm text-navy outline-none focus:border-navy"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  value: row.category,
                  onChange: (event) => updateManualRow(row.id, "category", event.target.value),
                  placeholder: detectedCategory || "Optional",
                  className: "w-full rounded-lg border border-border bg-beige/35 px-3 py-2.5 text-sm text-navy outline-none focus:border-navy"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  value: row.price,
                  onChange: (event) => updateManualRow(row.id, "price", event.target.value),
                  inputMode: "decimal",
                  placeholder: "2499",
                  className: "w-full rounded-lg border border-border bg-beige/35 px-3 py-2.5 text-sm text-navy outline-none focus:border-navy"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  value: row.stock,
                  onChange: (event) => updateManualRow(row.id, "stock", event.target.value),
                  inputMode: "numeric",
                  placeholder: "18",
                  className: "w-full rounded-lg border border-border bg-beige/35 px-3 py-2.5 text-sm text-navy outline-none focus:border-navy"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  value: row.description,
                  onChange: (event) => updateManualRow(row.id, "description", event.target.value),
                  placeholder: "Optional short description",
                  className: "w-full rounded-lg border border-border bg-beige/35 px-3 py-2.5 text-sm text-navy outline-none focus:border-navy"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => clearManualRow(row.id),
                  className: "rounded-lg p-2 text-navy/60 transition hover:bg-beige/60 hover:text-red-600",
                  "aria-label": `Clear row ${index + 1}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                }
              ) })
            ] }, row.id);
          }) })
        ] }) })
      ] }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-2xl border border-border/70 bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border/70 px-5 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-2xl text-navy", children: uploadMode === "csv" ? "CSV Preview" : "Batch Preview" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-navy/60", children: "Review the rows before importing. Categories can come from the file, or the importer will use the selected brand's saved category relationship when needed." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[24rem] overflow-auto", children: previewRows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-10 text-center text-sm text-navy/50", children: uploadMode === "csv" ? "Choose a CSV file to preview the product rows." : "Fill the manual grid to preview the batch before saving." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[64rem] text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-beige/40 text-xs uppercase tracking-[0.18em] text-navy/55", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left", children: "Row" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left", children: "Product" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left", children: "Brand" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left", children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left", children: "Price" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left", children: "Stock" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left", children: "Status" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: previewRows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4 text-navy/60", children: row.rowNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-5 py-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-navy", children: row.name || "Missing name" }),
              row.description ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-navy/55", children: row.description }) : null
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4 text-navy/70", children: row.brand || "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4 text-navy/70", children: row.detectedCategory || "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4 text-navy/70", children: String(row.price ?? "").trim() || "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4 text-navy/70", children: String(row.stock ?? "").trim() || "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-5 py-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] ${row.status === "ready" ? "bg-emerald-100 text-emerald-800" : row.status === "skipped" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-700"}`,
                  children: row.status
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-navy/55", children: row.reason })
            ] })
          ] }, `${row.rowNumber}-${row.name}-${row.brand}`)) })
        ] }) })
      ] }),
      result ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-beige/20 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-2xl text-navy", children: "Import Result" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-navy/65", children: [
          "Created ",
          result.createdCount,
          " product",
          result.createdCount === 1 ? "" : "s",
          " from",
          " ",
          result.totalRows,
          " row",
          result.totalRows === 1 ? "" : "s",
          "."
        ] }),
        result.failedRows.length > 0 || result.skippedRows.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-4 lg:grid-cols-2", children: [
          result.skippedRows.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-navy", children: "Skipped Rows" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-2 text-sm", children: result.skippedRows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "rounded-lg bg-beige/30 px-3 py-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-navy", children: [
                    "Row ",
                    row.rowNumber,
                    ": ",
                    row.name || "Unnamed product"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-amber-700", children: row.reason })
                ]
              },
              `skipped-${row.rowNumber}-${row.name}`
            )) })
          ] }) : null,
          result.failedRows.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-navy", children: "Failed Rows" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-2 text-sm", children: result.failedRows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "rounded-lg bg-beige/30 px-3 py-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-navy", children: [
                    "Row ",
                    row.rowNumber,
                    ": ",
                    row.name || "Unnamed product"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-red-600", children: row.reason })
                ]
              },
              `failed-${row.rowNumber}-${row.name}`
            )) })
          ] }) : null
        ] }) : null
      ] }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => onOpenChange(false),
            className: "rounded-xl border border-border px-5 py-3 text-sm text-navy/70 transition hover:bg-beige/40",
            children: "Close"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: handleImport,
            disabled: saving || activeRows.length === 0 || readyCount === 0,
            className: "inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm text-beige transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
              saving ? "Importing..." : uploadMode === "csv" ? `Import ${readyCount} Products` : `Save ${readyCount} Products`
            ]
          }
        )
      ] })
    ] })
  ] }) });
}
const getProductPrice = (product) => product.price ?? product.sizes[0]?.price ?? 0;
function AdminProducts() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname
  });
  const {
    addNotification
  } = useNotification();
  const [list, setList] = reactExports.useState([]);
  const [brands, setBrands] = reactExports.useState([]);
  const [categories, setCategories] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [brandsLoading, setBrandsLoading] = reactExports.useState(true);
  const [categoriesLoading, setCategoriesLoading] = reactExports.useState(true);
  const [deleting, setDeleting] = reactExports.useState(false);
  const [latestUpdatingId, setLatestUpdatingId] = reactExports.useState(null);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [bulkOpen, setBulkOpen] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [categoryFilter, setCategoryFilter] = reactExports.useState("all");
  const [sortMode, setSortMode] = reactExports.useState("name-asc");
  const controlCls = "w-full rounded-lg border border-border bg-beige/35 px-4 py-3 text-sm text-navy outline-none transition focus:border-navy";
  const load = reactExports.useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError("");
    }
    try {
      const products = await productsApi.list();
      setList(products);
      setError("");
    } catch (ex) {
      if (silent) {
        addNotification("Product saved, but the list could not refresh.", "error");
      } else {
        setList([]);
        setError(ex instanceof Error ? ex.message : "Products could not be loaded.");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [addNotification]);
  const loadBrands = reactExports.useCallback(async (silent = false) => {
    if (!silent) {
      setBrandsLoading(true);
    }
    try {
      const nextBrands = await brandsApi.list();
      setBrands(nextBrands);
    } catch (ex) {
      if (!silent) {
        addNotification(ex instanceof Error ? ex.message : "Brands could not be loaded for bulk import.", "error");
      }
      setBrands([]);
    } finally {
      if (!silent) {
        setBrandsLoading(false);
      }
    }
  }, [addNotification]);
  const loadCategories = reactExports.useCallback(async (silent = false) => {
    if (!silent) {
      setCategoriesLoading(true);
    }
    try {
      const nextCategories = await categoriesApi.listAdmin();
      setCategories(nextCategories);
    } catch (ex) {
      if (!silent) {
        addNotification(ex instanceof Error ? ex.message : "Categories could not be loaded.", "error");
      }
      setCategories([]);
    } finally {
      if (!silent) {
        setCategoriesLoading(false);
      }
    }
  }, [addNotification]);
  reactExports.useEffect(() => {
    if (pathname === "/admin/products") {
      load();
      loadBrands();
      loadCategories();
    }
  }, [load, loadBrands, loadCategories, pathname]);
  const confirmDelete = reactExports.useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productsApi.remove(deleteTarget.id);
      setList((current) => current.filter((product) => product.id !== deleteTarget.id));
      addNotification("Product deleted successfully.");
      setDeleteTarget(null);
      load(true);
    } catch (ex) {
      addNotification(ex instanceof Error ? ex.message : "Product could not be deleted.", "error");
    } finally {
      setDeleting(false);
    }
  }, [addNotification, deleteTarget, load]);
  const handleImported = reactExports.useCallback(async () => {
    await Promise.all([load(true), loadBrands(true), loadCategories(true)]);
  }, [load, loadBrands, loadCategories]);
  const toggleLatest = reactExports.useCallback(async (product) => {
    const nextValue = !product.isLatest;
    setLatestUpdatingId(product.id);
    try {
      const updatedProduct = await productsApi.update(product.id, {
        isLatest: nextValue
      });
      setList((current) => current.map((item) => item.id === product.id ? {
        ...item,
        ...updatedProduct
      } : item));
      addNotification(nextValue ? "Product added to Latest Products." : "Product removed from Latest Products.");
    } catch (ex) {
      addNotification(ex instanceof Error ? ex.message : "Latest product status could not be updated.", "error");
    } finally {
      setLatestUpdatingId(null);
    }
  }, [addNotification]);
  const categoryCounts = reactExports.useMemo(() => {
    const counts = {
      all: list.length
    };
    list.forEach((product) => {
      counts[product.category] = (counts[product.category] || 0) + 1;
    });
    return counts;
  }, [list]);
  const visibleProducts = reactExports.useMemo(() => {
    const filtered = categoryFilter === "all" ? [...list] : list.filter((product) => product.category === categoryFilter);
    filtered.sort((left, right) => {
      if (sortMode === "name-desc") {
        return right.name.localeCompare(left.name);
      }
      if (sortMode === "price-asc") {
        return getProductPrice(left) - getProductPrice(right);
      }
      if (sortMode === "price-desc") {
        return getProductPrice(right) - getProductPrice(left);
      }
      if (sortMode === "stock-asc") {
        const stockDelta = left.stock - right.stock;
        return stockDelta !== 0 ? stockDelta : left.name.localeCompare(right.name);
      }
      return left.name.localeCompare(right.name);
    });
    return filtered;
  }, [categoryFilter, list, sortMode]);
  if (pathname !== "/admin/products") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-eyebrow uppercase text-navy/50", children: "Catalog" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 font-display text-[clamp(2rem,2vw+1.2rem,3rem)] text-navy", children: "Products" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setBulkOpen(true), disabled: brandsLoading || categoriesLoading, className: "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-xs uppercase tracking-[0.25em] text-navy transition hover:bg-beige/40 disabled:cursor-not-allowed disabled:opacity-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "h-4 w-4" }),
          brandsLoading || categoriesLoading ? "Loading Catalog..." : "Bulk Upload"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/products/new", className: "inline-flex items-center justify-center gap-2 bg-navy text-beige px-5 py-3 rounded-lg text-xs uppercase tracking-[0.25em] hover:opacity-90 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
          " New Product"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "adaptive-admin-grid mt-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/70 bg-card p-5 shadow-soft", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.18em] text-navy/50", children: "All Products" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-4xl text-navy", children: categoryCounts.all })
      ] }),
      categories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/70 bg-card p-5 shadow-soft", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.18em] text-navy/50", children: category.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-4xl text-navy", children: categoryCounts[category.name] || 0 })
      ] }, category.id))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-6 rounded-[var(--radius-panel)] border border-border/70 bg-card p-4 shadow-soft sm:p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 xl:grid-cols-[1fr_1fr_auto]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.18em] text-navy/55", children: "Category Filter" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: categoryFilter, onChange: (event) => setCategoryFilter(event.target.value), className: `${controlCls} mt-2`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Categories" }),
          categories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: category.name, children: category.name }, category.id))
        ] }),
        !categoriesLoading && categories.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-navy/55", children: "No categories available yet." }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.18em] text-navy/55", children: "Sort Products" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: sortMode, onChange: (event) => setSortMode(event.target.value), className: `${controlCls} mt-2`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "name-asc", children: "Name A to Z" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "name-desc", children: "Name Z to A" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "price-asc", children: "Price Low to High" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "price-desc", children: "Price High to Low" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "stock-asc", children: "Lowest Stock" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full rounded-xl border border-border bg-beige/30 px-4 py-3 text-sm text-navy/70 lg:w-auto", children: [
        "Showing ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-navy", children: visibleProducts.length }),
        " ",
        "products"
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 overflow-hidden rounded-[var(--radius-panel)] border border-border/60 bg-card shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "admin-table-shell", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-beige/50 text-navy/70 text-xs uppercase tracking-[0.2em]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-6 py-4", children: "Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-6 py-4", children: "Brand" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-6 py-4", children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-6 py-4", children: "Latest" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-6 py-4", children: "Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-6 py-4", children: "Stock" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-6 py-4", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
        loading && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "px-6 py-10 text-center text-navy/50", children: "Loading..." }) }),
        !loading && error && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "px-6 py-10 text-center text-red-600", children: error }) }),
        !loading && !error && list.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "px-6 py-10 text-center text-navy/50", children: "No products yet." }) }),
        !loading && !error && list.length > 0 && visibleProducts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "px-6 py-10 text-center text-navy/50", children: "No products match the selected category filter." }) }),
        !loading && !error && visibleProducts.map((product) => {
          const price = getProductPrice(product);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-beige/30 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 flex items-center gap-3", children: [
              product.image ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: product.image, alt: product.name, loading: "lazy", decoding: "async", className: "w-12 h-12 rounded-lg object-contain object-center bg-beige p-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-lg bg-beige border border-border", "aria-hidden": "true" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-navy", children: product.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-navy/70", children: product.brandDetails?.name || product.brand }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-navy/70", children: product.category }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => void toggleLatest(product), disabled: latestUpdatingId === product.id, className: `rounded-full border px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.18em] transition disabled:opacity-50 ${product.isLatest ? "border-gold/40 bg-gold/15 text-gold" : "border-border bg-beige/40 text-navy/55 hover:border-gold/40 hover:text-navy"}`, "aria-pressed": Boolean(product.isLatest), children: product.isLatest ? "Latest" : "Off" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right text-gold font-medium", children: formatINR(price) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-6 py-4 text-right tabular-nums ${product.stock <= 10 ? "text-amber-600" : "text-navy/70"}`, children: product.stock }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/products/$id", params: {
                id: product.id
              }, className: "p-2 rounded-lg hover:bg-navy/10 text-navy", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setDeleteTarget(product), className: "p-2 rounded-lg hover:bg-red-100 text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }) })
            ] }) })
          ] }, product.id);
        })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmModal, { isOpen: Boolean(deleteTarget), title: "Delete product", message: deleteTarget ? `Delete ${deleteTarget.name}? This action cannot be undone.` : "Delete this product?", loading: deleting, onClose: () => {
      if (!deleting) setDeleteTarget(null);
    }, onConfirm: confirmDelete }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BulkProductUploadDialog, { open: bulkOpen, onOpenChange: setBulkOpen, existingProducts: list, existingBrands: brands, existingCategories: categories, onImported: handleImported })
  ] });
}
export {
  AdminProducts as component
};
