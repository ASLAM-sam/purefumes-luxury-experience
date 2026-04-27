import { useEffect, useMemo, useRef, useState } from "react";
import { Download, FileSpreadsheet, PencilLine, Trash2, Upload } from "lucide-react";
import type { Brand } from "@/data/brands";
import type { Product } from "@/data/products";
import { useNotification } from "@/context/NotificationContext";
import {
  productsApi,
  type BulkProductImportResult,
  type BulkProductImportRow,
} from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PreviewRow = BulkProductImportRow & {
  rowNumber: number;
  detectedCategory: Product["category"] | "";
  status: "ready" | "skipped" | "failed";
  reason: string;
};

type UploadMode = "csv" | "manual";

type ManualEntryRow = {
  id: string;
  name: string;
  brand: string;
  price: string;
  stock: string;
  description: string;
};

const MANUAL_BATCH_LIMIT = 20;
let manualRowSeed = 0;

const createManualEntryRow = (): ManualEntryRow => ({
  id: `product-row-${(manualRowSeed += 1)}`,
  name: "",
  brand: "",
  price: "",
  stock: "",
  description: "",
});

const createManualEntryRows = (count = MANUAL_BATCH_LIMIT) =>
  Array.from({ length: count }, () => createManualEntryRow());

const normalizeHeader = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const normalizeName = (value = "") => String(value).trim().toLowerCase().replace(/\s+/g, " ");

const getProductCategoryFromBrand = (brand: Brand | undefined): Product["category"] | "" => {
  if (!brand) return "";
  if (brand.category === "middle-eastern") return "Middle Eastern";
  if (brand.category === "designer") return "Designer";
  if (brand.category === "niche") return "Niche";
  return "";
};

const parsePrice = (value: string | number) => {
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

const parseStock = (value: string | number) => {
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
  const rows: string[][] = [];
  let currentRow: string[] = [];
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

  return rows
    .map((row) => row.map((cell) => cell.trim()))
    .filter((row) => row.some((cell) => cell.length > 0));
};

const parseProductCsvText = (text = ""): BulkProductImportRow[] => {
  const rows = parseCsv(text);

  if (rows.length < 2) {
    throw new Error("CSV must include a header row and at least one product row.");
  }

  const headers = rows[0].map(normalizeHeader);
  const findHeader = (...aliases: string[]) =>
    aliases.map((alias) => headers.indexOf(alias)).find((index) => index >= 0) ?? -1;

  const nameIndex = findHeader("name", "product", "product_name");
  const brandIndex = findHeader("brand", "brand_name");
  const priceIndex = findHeader("price", "selling_price");
  const stockIndex = findHeader("stock", "quantity");
  const descriptionIndex = findHeader("description", "details");

  if (nameIndex < 0 || brandIndex < 0 || priceIndex < 0 || stockIndex < 0) {
    throw new Error(
      "CSV headers must include name, brand, price, and stock. Use the template to avoid guesswork.",
    );
  }

  return rows
    .slice(1)
    .map((row, index) => ({
      rowNumber: index + 2,
      name: String(row[nameIndex] || "").trim(),
      brand: String(row[brandIndex] || "").trim(),
      price: String(row[priceIndex] || "").trim(),
      stock: String(row[stockIndex] || "").trim(),
      description: descriptionIndex >= 0 ? String(row[descriptionIndex] || "").trim() : "",
    }))
    .filter((row) => row.name || row.brand || String(row.price).trim() || String(row.stock).trim());
};

function downloadTemplate() {
  const csv = [
    "name,brand,price,stock,description",
    "9PM,Afnan,2499,18,Fruity vanilla evening scent",
    "Club De Nuit Intense Man,Armaf,3299,12,Citrus smoky bestseller",
    "Red Tobacco,Mancera,5999,6,Powerful niche tobacco fragrance",
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "products-import-template.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function BulkProductUploadDialog({
  open,
  onOpenChange,
  existingProducts,
  existingBrands,
  onImported,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingProducts: Product[];
  existingBrands: Brand[];
  onImported: () => Promise<void> | void;
}) {
  const { addNotification } = useNotification();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>("csv");
  const [fileName, setFileName] = useState("");
  const [csvRows, setCsvRows] = useState<BulkProductImportRow[]>([]);
  const [manualRows, setManualRows] = useState<ManualEntryRow[]>(() => createManualEntryRows());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<BulkProductImportResult | null>(null);

  useEffect(() => {
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

  const brandMap = useMemo(
    () => new Map(existingBrands.map((brand) => [normalizeName(brand.name), brand])),
    [existingBrands],
  );

  const activeRows = useMemo<BulkProductImportRow[]>(() => {
    if (uploadMode === "csv") {
      return csvRows;
    }

    return manualRows.flatMap((row, index) =>
      row.name.trim() ||
      row.brand.trim() ||
      row.price.trim() ||
      row.stock.trim() ||
      row.description.trim()
        ? [
            {
              rowNumber: index + 1,
              name: row.name.trim(),
              brand: row.brand.trim(),
              price: row.price.trim(),
              stock: row.stock.trim(),
              description: row.description.trim(),
            },
          ]
        : [],
    );
  }, [csvRows, manualRows, uploadMode]);

  const previewRows = useMemo<PreviewRow[]>(() => {
    const existingProductKeys = new Set(
      existingProducts.map(
        (product) =>
          `${normalizeName(product.brandDetails?.name || product.brand)}::${normalizeName(product.name)}`,
      ),
    );
    const seenUploadKeys = new Set<string>();

    return activeRows.map((row) => {
      const name = String(row.name || "").trim();
      const brandName = String(row.brand || "").trim();
      const description = String(row.description || "").trim();
      const matchedBrand = brandMap.get(normalizeName(brandName));
      const detectedCategory = getProductCategoryFromBrand(matchedBrand);

      if (!name) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          detectedCategory,
          status: "failed",
          reason: "Product name is required.",
        };
      }

      if (name.length > 160) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          detectedCategory,
          status: "failed",
          reason: "Product name cannot exceed 160 characters.",
        };
      }

      if (!brandName) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          detectedCategory,
          status: "failed",
          reason: "Brand is required.",
        };
      }

      if (!matchedBrand) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          detectedCategory,
          status: "failed",
          reason: "Brand must already exist before importing products.",
        };
      }

      const priceResult = parsePrice(row.price);
      if (!priceResult.ok) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          detectedCategory,
          status: "failed",
          reason: priceResult.reason,
        };
      }

      const stockResult = parseStock(row.stock);
      if (!stockResult.ok) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          detectedCategory,
          status: "failed",
          reason: stockResult.reason,
        };
      }

      if (description.length > 4000) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          detectedCategory,
          status: "failed",
          reason: "Description cannot exceed 4000 characters.",
        };
      }

      const productKey = `${normalizeName(matchedBrand.name)}::${normalizeName(name)}`;

      if (seenUploadKeys.has(productKey)) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          detectedCategory,
          status: "skipped",
          reason: "Duplicate product for the same brand in this batch.",
        };
      }

      if (existingProductKeys.has(productKey)) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          detectedCategory,
          status: "skipped",
          reason: "Product already exists for this brand.",
        };
      }

      seenUploadKeys.add(productKey);
      return {
        ...row,
        rowNumber: row.rowNumber || 0,
        detectedCategory,
        status: "ready",
        reason:
          "Ready to import. Category will follow the selected brand and a Standard size will use the entered price.",
      };
    });
  }, [activeRows, brandMap, existingProducts]);

  const readyCount = previewRows.filter((row) => row.status === "ready").length;
  const issueCount = previewRows.length - readyCount;
  const filledManualRowCount = manualRows.filter(
    (row) =>
      row.name.trim() ||
      row.brand.trim() ||
      row.price.trim() ||
      row.stock.trim() ||
      row.description.trim(),
  ).length;

  const handleFileChange = async (file: File | undefined) => {
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

  const updateManualRow = (id: string, field: keyof Omit<ManualEntryRow, "id">, value: string) => {
    setResult(null);
    setError("");
    setManualRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const clearManualRow = (id: string) => {
    setResult(null);
    setError("");
    setManualRows((current) =>
      current.map((row) =>
        row.id === id
          ? { ...row, name: "", brand: "", price: "", stock: "", description: "" }
          : row,
      ),
    );
  };

  const handleImport = async () => {
    if (!activeRows.length) {
      addNotification(
        uploadMode === "csv"
          ? "Choose a CSV file before importing."
          : "Fill at least one product row before importing.",
        "error",
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
      const response = await productsApi.bulkCreate(activeRows);
      setResult(response);
      await onImported();
      addNotification(`${response.createdCount} products imported successfully.`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Bulk import failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl border-border bg-card sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl text-navy">Bulk Add Products</DialogTitle>
          <DialogDescription className="text-navy/60">
            Import base catalog data with either a CSV file or a manual 20-row grid. Use{" "}
            <code>name</code>, <code>brand</code>, <code>price</code>, <code>stock</code>, and
            optional <code>description</code>. Images can be managed on each product after import.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-beige/20 p-2">
            <button
              type="button"
              onClick={() => {
                setUploadMode("csv");
                setError("");
                setResult(null);
              }}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm transition ${
                uploadMode === "csv" ? "bg-navy text-beige" : "text-navy/70 hover:bg-beige/60"
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" /> CSV Upload
            </button>
            <button
              type="button"
              onClick={() => {
                setUploadMode("manual");
                setError("");
                setResult(null);
              }}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm transition ${
                uploadMode === "manual" ? "bg-navy text-beige" : "text-navy/70 hover:bg-beige/60"
              }`}
            >
              <PencilLine className="h-4 w-4" /> Manual Batch
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div
              className={`rounded-2xl p-6 ${
                uploadMode === "csv"
                  ? "border border-dashed border-navy/25 bg-beige/20"
                  : "border border-border bg-beige/15"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-beige">
                  {uploadMode === "csv" ? (
                    <FileSpreadsheet className="h-5 w-5" />
                  ) : (
                    <PencilLine className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  {uploadMode === "csv" ? (
                    <>
                      <p className="font-medium text-navy">Upload a products CSV</p>
                      <p className="mt-1 text-sm text-navy/60">
                        This step creates product records only. Product category comes from the
                        matched brand, and images can be added later from each product page.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => inputRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-3 text-sm text-beige transition hover:opacity-90"
                        >
                          <Upload className="h-4 w-4" /> Choose CSV
                        </button>
                        <button
                          type="button"
                          onClick={downloadTemplate}
                          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm text-navy/70 transition hover:bg-beige/40"
                        >
                          <Download className="h-4 w-4" /> Download Template
                        </button>
                      </div>
                      <input
                        ref={inputRef}
                        type="file"
                        accept=".csv,text/csv"
                        onChange={(event) => handleFileChange(event.target.files?.[0])}
                        className="sr-only"
                      />
                      {fileName ? (
                        <p className="mt-3 text-sm text-navy/65">
                          Selected file: <span className="font-medium text-navy">{fileName}</span>
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-navy">Manually add up to 20 products</p>
                      <p className="mt-1 text-sm text-navy/60">
                        Select an existing brand for each row so category mapping stays clean and
                        predictable.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setManualRows(createManualEntryRows());
                            setResult(null);
                            setError("");
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm text-navy/70 transition hover:bg-beige/40"
                        >
                          <Trash2 className="h-4 w-4" /> Clear 20 Rows
                        </button>
                      </div>
                      <p className="mt-3 text-sm text-navy/65">
                        Filled rows:{" "}
                        <span className="font-medium text-navy">
                          {filledManualRowCount} / {MANUAL_BATCH_LIMIT}
                        </span>
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-beige/25 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-navy/55">Preview Summary</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-navy/45">Rows</p>
                  <p className="mt-2 font-display text-3xl text-navy">{activeRows.length}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-navy/45">Ready</p>
                  <p className="mt-2 font-display text-3xl text-navy">{readyCount}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-navy/45">Needs Review</p>
                  <p className="mt-2 font-display text-3xl text-navy">{issueCount}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-navy/45">
                    Available Brands
                  </p>
                  <p className="mt-2 font-display text-3xl text-navy">{existingBrands.length}</p>
                </div>
              </div>
            </div>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          {uploadMode === "manual" ? (
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
              <div className="border-b border-border/70 px-5 py-4">
                <h3 className="font-display text-2xl text-navy">20-Product Entry Grid</h3>
                <p className="mt-1 text-sm text-navy/60">
                  Blank rows are ignored. Each saved product gets a Standard size based on the
                  entered price.
                </p>
              </div>

              <div className="max-h-[24rem] overflow-auto">
                <table className="w-full min-w-[72rem] text-sm">
                  <thead className="bg-beige/40 text-xs uppercase tracking-[0.18em] text-navy/55">
                    <tr>
                      <th className="px-5 py-4 text-left">#</th>
                      <th className="px-5 py-4 text-left">Product Name</th>
                      <th className="px-5 py-4 text-left">Brand</th>
                      <th className="px-5 py-4 text-left">Category</th>
                      <th className="px-5 py-4 text-left">Price</th>
                      <th className="px-5 py-4 text-left">Stock</th>
                      <th className="px-5 py-4 text-left">Description</th>
                      <th className="px-5 py-4 text-right">Clear</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {manualRows.map((row, index) => {
                      const matchedBrand = brandMap.get(normalizeName(row.brand));
                      const detectedCategory = getProductCategoryFromBrand(matchedBrand);

                      return (
                        <tr key={row.id}>
                          <td className="px-5 py-3 text-navy/55">{index + 1}</td>
                          <td className="px-5 py-3">
                            <input
                              value={row.name}
                              onChange={(event) =>
                                updateManualRow(row.id, "name", event.target.value)
                              }
                              placeholder="9PM"
                              className="w-full rounded-lg border border-border bg-beige/35 px-3 py-2.5 text-sm text-navy outline-none focus:border-navy"
                            />
                          </td>
                          <td className="px-5 py-3">
                            <select
                              value={row.brand}
                              onChange={(event) =>
                                updateManualRow(row.id, "brand", event.target.value)
                              }
                              className="w-full rounded-lg border border-border bg-beige/35 px-3 py-2.5 text-sm text-navy outline-none focus:border-navy"
                            >
                              <option value="">Select brand</option>
                              {existingBrands.map((brand) => (
                                <option key={brand.id} value={brand.name}>
                                  {brand.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-5 py-3 text-navy/70">
                            {detectedCategory || "Brand decides category"}
                          </td>
                          <td className="px-5 py-3">
                            <input
                              value={row.price}
                              onChange={(event) =>
                                updateManualRow(row.id, "price", event.target.value)
                              }
                              inputMode="decimal"
                              placeholder="2499"
                              className="w-full rounded-lg border border-border bg-beige/35 px-3 py-2.5 text-sm text-navy outline-none focus:border-navy"
                            />
                          </td>
                          <td className="px-5 py-3">
                            <input
                              value={row.stock}
                              onChange={(event) =>
                                updateManualRow(row.id, "stock", event.target.value)
                              }
                              inputMode="numeric"
                              placeholder="18"
                              className="w-full rounded-lg border border-border bg-beige/35 px-3 py-2.5 text-sm text-navy outline-none focus:border-navy"
                            />
                          </td>
                          <td className="px-5 py-3">
                            <input
                              value={row.description}
                              onChange={(event) =>
                                updateManualRow(row.id, "description", event.target.value)
                              }
                              placeholder="Optional short description"
                              className="w-full rounded-lg border border-border bg-beige/35 px-3 py-2.5 text-sm text-navy outline-none focus:border-navy"
                            />
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => clearManualRow(row.id)}
                              className="rounded-lg p-2 text-navy/60 transition hover:bg-beige/60 hover:text-red-600"
                              aria-label={`Clear row ${index + 1}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
            <div className="border-b border-border/70 px-5 py-4">
              <h3 className="font-display text-2xl text-navy">
                {uploadMode === "csv" ? "CSV Preview" : "Batch Preview"}
              </h3>
              <p className="mt-1 text-sm text-navy/60">
                Review the rows before importing. Category is detected from the matched brand.
              </p>
            </div>

            <div className="max-h-[24rem] overflow-auto">
              {previewRows.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-navy/50">
                  {uploadMode === "csv"
                    ? "Choose a CSV file to preview the product rows."
                    : "Fill the manual grid to preview the batch before saving."}
                </div>
              ) : (
                <table className="w-full min-w-[64rem] text-sm">
                  <thead className="bg-beige/40 text-xs uppercase tracking-[0.18em] text-navy/55">
                    <tr>
                      <th className="px-5 py-4 text-left">Row</th>
                      <th className="px-5 py-4 text-left">Product</th>
                      <th className="px-5 py-4 text-left">Brand</th>
                      <th className="px-5 py-4 text-left">Category</th>
                      <th className="px-5 py-4 text-left">Price</th>
                      <th className="px-5 py-4 text-left">Stock</th>
                      <th className="px-5 py-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {previewRows.map((row) => (
                      <tr key={`${row.rowNumber}-${row.name}-${row.brand}`}>
                        <td className="px-5 py-4 text-navy/60">{row.rowNumber}</td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-navy">{row.name || "Missing name"}</p>
                          {row.description ? (
                            <p className="mt-1 text-xs text-navy/55">{row.description}</p>
                          ) : null}
                        </td>
                        <td className="px-5 py-4 text-navy/70">{row.brand || "-"}</td>
                        <td className="px-5 py-4 text-navy/70">{row.detectedCategory || "-"}</td>
                        <td className="px-5 py-4 text-navy/70">
                          {String(row.price ?? "").trim() || "-"}
                        </td>
                        <td className="px-5 py-4 text-navy/70">
                          {String(row.stock ?? "").trim() || "-"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] ${
                              row.status === "ready"
                                ? "bg-emerald-100 text-emerald-800"
                                : row.status === "skipped"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {row.status}
                          </span>
                          <p className="mt-2 text-xs text-navy/55">{row.reason}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {result ? (
            <div className="rounded-2xl border border-border bg-beige/20 p-5">
              <h3 className="font-display text-2xl text-navy">Import Result</h3>
              <p className="mt-2 text-sm text-navy/65">
                Created {result.createdCount} product{result.createdCount === 1 ? "" : "s"} from{" "}
                {result.totalRows} row{result.totalRows === 1 ? "" : "s"}.
              </p>

              {result.failedRows.length > 0 || result.skippedRows.length > 0 ? (
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {result.skippedRows.length > 0 ? (
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="font-medium text-navy">Skipped Rows</p>
                      <div className="mt-3 space-y-2 text-sm">
                        {result.skippedRows.map((row) => (
                          <div
                            key={`skipped-${row.rowNumber}-${row.name}`}
                            className="rounded-lg bg-beige/30 px-3 py-2"
                          >
                            <p className="font-medium text-navy">
                              Row {row.rowNumber}: {row.name || "Unnamed product"}
                            </p>
                            <p className="mt-1 text-xs text-amber-700">{row.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {result.failedRows.length > 0 ? (
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="font-medium text-navy">Failed Rows</p>
                      <div className="mt-3 space-y-2 text-sm">
                        {result.failedRows.map((row) => (
                          <div
                            key={`failed-${row.rowNumber}-${row.name}`}
                            className="rounded-lg bg-beige/30 px-3 py-2"
                          >
                            <p className="font-medium text-navy">
                              Row {row.rowNumber}: {row.name || "Unnamed product"}
                            </p>
                            <p className="mt-1 text-xs text-red-600">{row.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border border-border px-5 py-3 text-sm text-navy/70 transition hover:bg-beige/40"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={saving || activeRows.length === 0 || readyCount === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm text-beige transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {saving
                ? "Importing..."
                : uploadMode === "csv"
                  ? `Import ${readyCount} Products`
                  : `Save ${readyCount} Products`}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
