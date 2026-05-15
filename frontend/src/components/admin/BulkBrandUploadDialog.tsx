import { useEffect, useMemo, useRef, useState } from "react";
import { Download, FileSpreadsheet, PencilLine, Trash2, Upload } from "lucide-react";
import type { Brand } from "@/data/brands";
import { useNotification } from "@/context/NotificationContext";
import { brandsApi, type BulkBrandImportResult, type BulkBrandImportRow } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PreviewRow = BulkBrandImportRow & {
  rowNumber: number;
  normalizedCategory: Brand["category"] | "";
  status: "ready" | "skipped" | "failed";
  reason: string;
};

type UploadMode = "csv" | "manual";

type ManualEntryRow = {
  id: string;
  name: string;
  category: Brand["category"] | "";
  logo: string;
};

const MANUAL_BATCH_LIMIT = 20;
let manualRowSeed = 0;

const createManualEntryRow = (): ManualEntryRow => ({
  id: `brand-row-${(manualRowSeed += 1)}`,
  name: "",
  category: "",
  logo: "",
});

const createManualEntryRows = (count = MANUAL_BATCH_LIMIT) =>
  Array.from({ length: count }, () => createManualEntryRow());

const normalizeHeader = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const normalizeBrandName = (value = "") => String(value).trim().toLowerCase().replace(/\s+/g, " ");

const normalizeCategory = (value = "") => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (
    normalized === "middle eastern" ||
    normalized === "middleeastern" ||
    normalized === "middle eastern perfumes"
  ) {
    return "middle-eastern";
  }

  if (normalized === "designer") {
    return "designer";
  }

  if (normalized === "niche") {
    return "niche";
  }

  return "";
};

const isHttpImageUrl = (value = "") => {
  const imageUrl = String(value || "").trim();
  if (!imageUrl) return true;

  try {
    const parsed = new URL(imageUrl);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch (_error) {
    return false;
  }
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

const parseBrandCsvText = (text = ""): BulkBrandImportRow[] => {
  const rows = parseCsv(text);

  if (rows.length < 2) {
    throw new Error("CSV must include a header row and at least one brand row.");
  }

  const headers = rows[0].map(normalizeHeader);
  const findHeader = (...aliases: string[]) =>
    aliases.map((alias) => headers.indexOf(alias)).find((index) => index >= 0) ?? -1;

  const nameIndex = findHeader("name", "brand", "brand_name");
  const categoryIndex = findHeader("category", "brand_category", "type");
  const logoIndex = findHeader("logo", "logo_url", "image", "image_url");

  if (nameIndex < 0 || categoryIndex < 0) {
    throw new Error("CSV headers must include at least name and category.");
  }

  return rows
    .slice(1)
    .map((row, index) => ({
      rowNumber: index + 2,
      name: String(row[nameIndex] || "").trim(),
      category: String(row[categoryIndex] || "").trim(),
      logo: logoIndex >= 0 ? String(row[logoIndex] || "").trim() : "",
    }))
    .filter((row) => row.name || row.category || row.logo);
};

function downloadTemplate() {
  const csv = [
    "name,category,logo",
    "Afnan,middle-eastern,",
    "Armaf,designer,",
    "Mancera,niche,https://example.com/mancera-logo.png",
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "brands-import-template.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function BulkBrandUploadDialog({
  open,
  onOpenChange,
  existingBrands,
  onImported,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingBrands: Brand[];
  onImported: () => Promise<void> | void;
}) {
  const { addNotification } = useNotification();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>("csv");
  const [fileName, setFileName] = useState("");
  const [csvRows, setCsvRows] = useState<BulkBrandImportRow[]>([]);
  const [manualRows, setManualRows] = useState<ManualEntryRow[]>(() => createManualEntryRows());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<BulkBrandImportResult | null>(null);

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

  const activeRows = useMemo<BulkBrandImportRow[]>(() => {
    if (uploadMode === "csv") {
      return csvRows;
    }

    return manualRows.flatMap((row, index) =>
      row.name.trim() || row.category || row.logo.trim()
        ? [
            {
              rowNumber: index + 1,
              name: row.name.trim(),
              category: row.category,
              logo: row.logo.trim(),
            },
          ]
        : [],
    );
  }, [csvRows, manualRows, uploadMode]);

  const previewRows = useMemo<PreviewRow[]>(() => {
    const existingNames = new Set(existingBrands.map((brand) => normalizeBrandName(brand.name)));
    const seenUploadNames = new Set<string>();

    return activeRows.map((row) => {
      const name = String(row.name || "").trim();
      const category = String(row.category || "").trim();
      const logo = String(row.logo || "").trim();
      const normalizedName = normalizeBrandName(name);
      const normalizedCategory = normalizeCategory(category);

      if (!name) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          normalizedCategory,
          status: "failed",
          reason: "Brand name is required.",
        };
      }

      if (!normalizedCategory) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          normalizedCategory,
          status: "failed",
          reason: "Category must be middle-eastern, designer, or niche.",
        };
      }

      if (!isHttpImageUrl(logo)) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          normalizedCategory,
          status: "failed",
          reason: "Logo must be a valid HTTP or HTTPS URL.",
        };
      }

      if (seenUploadNames.has(normalizedName)) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          normalizedCategory,
          status: "skipped",
          reason: "Duplicate brand name in this file.",
        };
      }

      if (existingNames.has(normalizedName)) {
        seenUploadNames.add(normalizedName);
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          normalizedCategory,
          status: "skipped",
          reason: "Brand already exists in the catalog.",
        };
      }

      seenUploadNames.add(normalizedName);
      return {
        ...row,
        rowNumber: row.rowNumber || 0,
        normalizedCategory,
        status: "ready",
        reason: "Ready to import.",
      };
    });
  }, [activeRows, existingBrands]);

  const readyCount = previewRows.filter((row) => row.status === "ready").length;
  const issueCount = previewRows.length - readyCount;
  const filledManualRowCount = manualRows.filter(
    (row) => row.name.trim() || row.category || row.logo.trim(),
  ).length;

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;

    setError("");
    setResult(null);
    setFileName(file.name);

    try {
      const text = await file.text();
      const parsedRows = parseBrandCsvText(text);
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
      current.map((row) => (row.id === id ? { ...row, name: "", category: "", logo: "" } : row)),
    );
  };

  const handleImport = async () => {
    if (!activeRows.length) {
      addNotification(
        uploadMode === "csv"
          ? "Choose a CSV file before importing."
          : "Fill at least one brand row before importing.",
        "error",
      );
      return;
    }

    if (readyCount === 0) {
      addNotification("There are no valid brand rows ready to import.", "error");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await brandsApi.bulkCreate(activeRows);
      setResult(response);
      await onImported();
      addNotification(`${response.createdCount} brands imported successfully.`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Bulk import failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl border-border bg-card sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl text-navy">Bulk Add Brands</DialogTitle>
          <DialogDescription className="text-navy/60">
            Add brands in batches with either a CSV file or a manual 20-row entry grid. Use{" "}
            <code>name</code>, <code>category</code>, and optional <code>logo</code>.
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
                      <p className="font-medium text-navy">Upload a brands CSV</p>
                      <p className="mt-1 text-sm text-navy/60">
                        Best for importing your catalog first, with logo URLs added in the CSV or
                        edited on each brand afterward.
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
                      <p className="font-medium text-navy">Manually add up to 20 brands</p>
                      <p className="mt-1 text-sm text-navy/60">
                        Fill the rows below, leave unused slots blank, and save the batch in one go.
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
                    Existing Brands
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
                <h3 className="font-display text-2xl text-navy">20-Brand Entry Grid</h3>
                <p className="mt-1 text-sm text-navy/60">
                  Enter brand details directly here. Blank rows are ignored during import.
                </p>
              </div>

              <div className="max-h-[24rem] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-beige/40 text-xs uppercase tracking-[0.18em] text-navy/55">
                    <tr>
                      <th className="px-5 py-4 text-left">#</th>
                      <th className="px-5 py-4 text-left">Brand Name</th>
                      <th className="px-5 py-4 text-left">Category</th>
                      <th className="px-5 py-4 text-left">Logo URL</th>
                      <th className="px-5 py-4 text-right">Clear</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {manualRows.map((row, index) => (
                      <tr key={row.id}>
                        <td className="px-5 py-3 text-navy/55">{index + 1}</td>
                        <td className="px-5 py-3">
                          <input
                            value={row.name}
                            onChange={(event) =>
                              updateManualRow(row.id, "name", event.target.value)
                            }
                            placeholder="Afnan"
                            className="w-full rounded-lg border border-border bg-beige/35 px-3 py-2.5 text-sm text-navy outline-none focus:border-navy"
                          />
                        </td>
                        <td className="px-5 py-3">
                          <select
                            value={row.category}
                            onChange={(event) =>
                              updateManualRow(row.id, "category", event.target.value)
                            }
                            className="w-full rounded-lg border border-border bg-beige/35 px-3 py-2.5 text-sm text-navy outline-none focus:border-navy"
                          >
                            <option value="">Select category</option>
                            <option value="middle-eastern">Middle Eastern</option>
                            <option value="designer">Designer</option>
                            <option value="niche">Niche</option>
                          </select>
                        </td>
                        <td className="px-5 py-3">
                          <input
                            value={row.logo}
                            onChange={(event) =>
                              updateManualRow(row.id, "logo", event.target.value)
                            }
                            placeholder="https://example.com/logo.png"
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
                    ))}
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
                Review the rows before importing. Invalid or duplicate rows are highlighted.
              </p>
            </div>

            <div className="max-h-[24rem] overflow-auto">
              {previewRows.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-navy/50">
                  {uploadMode === "csv"
                    ? "Choose a CSV file to preview the brand rows."
                    : "Fill the manual grid to preview the batch before saving."}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-beige/40 text-xs uppercase tracking-[0.18em] text-navy/55">
                    <tr>
                      <th className="px-5 py-4 text-left">Row</th>
                      <th className="px-5 py-4 text-left">Brand</th>
                      <th className="px-5 py-4 text-left">Category</th>
                      <th className="px-5 py-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {previewRows.map((row) => (
                      <tr key={row.rowNumber}>
                        <td className="px-5 py-4 text-navy/60">{row.rowNumber}</td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-navy">{row.name || "Missing name"}</p>
                          {row.logo ? (
                            <p className="mt-1 text-xs text-navy/55">{row.logo}</p>
                          ) : null}
                        </td>
                        <td className="px-5 py-4 text-navy/70">
                          {row.normalizedCategory || row.category || "-"}
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
                Created {result.createdCount} brand{result.createdCount === 1 ? "" : "s"} from{" "}
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
                            key={`skipped-${row.rowNumber}`}
                            className="rounded-lg bg-beige/30 px-3 py-2"
                          >
                            <p className="font-medium text-navy">
                              Row {row.rowNumber}: {row.name || "Unnamed brand"}
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
                            key={`failed-${row.rowNumber}`}
                            className="rounded-lg bg-beige/30 px-3 py-2"
                          >
                            <p className="font-medium text-navy">
                              Row {row.rowNumber}: {row.name || "Unnamed brand"}
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
                  ? `Import ${readyCount} Brands`
                  : `Save ${readyCount} Brands`}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
