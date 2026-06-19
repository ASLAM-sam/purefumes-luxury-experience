import { r as reactExports, j as jsxRuntimeExports, as as FileSpreadsheet, at as PencilLine, au as Upload, av as Download, J as Trash2, U as Plus, aw as Pencil } from "./vendor-react-98xxEzFV.js";
import { A as AdminShell } from "./AdminShell-P9dOFq5Y.js";
import { a as useNotification, d as categoriesApi, e as createCatalogSlug, g as brandsApi, x as frontendEventBus, B as Button, X as getBrandCategoryId, Y as getBrandCategorySlug } from "./router-DvCKRw9U.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription } from "./dialog-BFHKLRA3.js";
import { C as ConfirmModal } from "./ConfirmModal-CZ9ASx2b.js";
import "./vendor-tanstack-DkD25YnA.js";
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
  id: `brand-row-${manualRowSeed += 1}`,
  name: "",
  category: "",
  logo: ""
});
const createManualEntryRows = (count = MANUAL_BATCH_LIMIT) => Array.from({ length: count }, () => createManualEntryRow());
const normalizeHeader = (value = "") => String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
const normalizeBrandName = (value = "") => String(value).trim().toLowerCase().replace(/\s+/g, " ");
const findCategoryMatch = (value = "", categories) => {
  const input = String(value || "").trim();
  const inputSlug = createCatalogSlug(input);
  if (!input && !inputSlug) return null;
  return categories.find(
    (category) => category.id === input || category._id === input || createCatalogSlug(category.slug) === inputSlug || createCatalogSlug(category.name) === inputSlug
  ) || null;
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
const parseBrandCsvText = (text = "") => {
  const rows = parseCsv(text);
  if (rows.length < 2) {
    throw new Error("CSV must include a header row and at least one brand row.");
  }
  const headers = rows[0].map(normalizeHeader);
  const findHeader = (...aliases) => aliases.map((alias) => headers.indexOf(alias)).find((index) => index >= 0) ?? -1;
  const nameIndex = findHeader("name", "brand", "brand_name");
  const categoryIndex = findHeader("category", "brand_category", "type");
  const logoIndex = findHeader("logo", "logo_url", "image", "image_url");
  if (nameIndex < 0 || categoryIndex < 0) {
    throw new Error("CSV headers must include at least name and category.");
  }
  return rows.slice(1).map((row, index) => ({
    rowNumber: index + 2,
    name: String(row[nameIndex] || "").trim(),
    category: String(row[categoryIndex] || "").trim(),
    logo: logoIndex >= 0 ? String(row[logoIndex] || "").trim() : ""
  })).filter((row) => row.name || row.category || row.logo);
};
function downloadTemplate(categories) {
  const exampleCategories = categories.length ? categories.slice(0, 3).map((category) => category.name) : ["Category Name"];
  const csv = [
    "name,category,logo",
    ...exampleCategories.map(
      (category, index) => `Brand ${index + 1},${category},${index === 0 ? "" : "https://example.com/logo.png"}`
    )
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "brands-import-template.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
function BulkBrandUploadDialog({
  open,
  onOpenChange,
  existingBrands,
  onImported
}) {
  const { addNotification } = useNotification();
  const inputRef = reactExports.useRef(null);
  const [uploadMode, setUploadMode] = reactExports.useState("csv");
  const [fileName, setFileName] = reactExports.useState("");
  const [csvRows, setCsvRows] = reactExports.useState([]);
  const [manualRows, setManualRows] = reactExports.useState(() => createManualEntryRows());
  const [categories, setCategories] = reactExports.useState([]);
  const [categoriesLoading, setCategoriesLoading] = reactExports.useState(false);
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
  reactExports.useEffect(() => {
    if (!open) return void 0;
    let isActive = true;
    setCategoriesLoading(true);
    categoriesApi.listAdmin({ forceFresh: true }).then((nextCategories) => {
      if (isActive) {
        setCategories(nextCategories.filter((category) => !category.isDeleted));
      }
    }).catch((nextError) => {
      if (isActive) {
        setCategories([]);
        setError(
          nextError instanceof Error ? nextError.message : "Categories could not be loaded."
        );
      }
    }).finally(() => {
      if (isActive) {
        setCategoriesLoading(false);
      }
    });
    return () => {
      isActive = false;
    };
  }, [open]);
  const activeRows = reactExports.useMemo(() => {
    if (uploadMode === "csv") {
      return csvRows;
    }
    return manualRows.flatMap(
      (row, index) => row.name.trim() || row.category || row.logo.trim() ? [
        {
          rowNumber: index + 1,
          name: row.name.trim(),
          category: row.category,
          logo: row.logo.trim()
        }
      ] : []
    );
  }, [csvRows, manualRows, uploadMode]);
  const previewRows = reactExports.useMemo(() => {
    const existingNames = new Set(existingBrands.map((brand) => normalizeBrandName(brand.name)));
    const seenUploadNames = /* @__PURE__ */ new Set();
    return activeRows.map((row) => {
      const name = String(row.name || "").trim();
      const category = String(row.category || "").trim();
      const logo = String(row.logo || "").trim();
      const normalizedName = normalizeBrandName(name);
      const matchedCategory = findCategoryMatch(category, categories);
      const normalizedCategory = matchedCategory?.name || "";
      if (!name) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          normalizedCategory,
          status: "failed",
          reason: "Brand name is required."
        };
      }
      if (!matchedCategory) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          normalizedCategory,
          status: "failed",
          reason: `Category '${category}' does not exist.`
        };
      }
      if (!isHttpImageUrl(logo)) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          normalizedCategory,
          status: "failed",
          reason: "Logo must be a valid HTTP or HTTPS URL."
        };
      }
      if (seenUploadNames.has(normalizedName)) {
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          normalizedCategory,
          status: "skipped",
          reason: "Duplicate brand name in this file."
        };
      }
      if (existingNames.has(normalizedName)) {
        seenUploadNames.add(normalizedName);
        return {
          ...row,
          rowNumber: row.rowNumber || 0,
          normalizedCategory,
          status: "skipped",
          reason: "Brand already exists in the catalog."
        };
      }
      seenUploadNames.add(normalizedName);
      return {
        ...row,
        rowNumber: row.rowNumber || 0,
        normalizedCategory,
        status: "ready",
        reason: "Ready to import."
      };
    });
  }, [activeRows, categories, existingBrands]);
  const readyCount = previewRows.filter((row) => row.status === "ready").length;
  const readyRows = previewRows.filter((row) => row.status === "ready").map((row) => ({
    rowNumber: row.rowNumber,
    name: row.name,
    category: row.category,
    logo: row.logo
  }));
  const issueCount = previewRows.length - readyCount;
  const filledManualRowCount = manualRows.filter(
    (row) => row.name.trim() || row.category || row.logo.trim()
  ).length;
  const handleFileChange = async (file) => {
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
      (current) => current.map((row) => row.id === id ? { ...row, name: "", category: "", logo: "" } : row)
    );
  };
  const handleImport = async () => {
    if (!activeRows.length) {
      addNotification(
        uploadMode === "csv" ? "Choose a CSV file before importing." : "Fill at least one brand row before importing.",
        "error"
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
      const response = await brandsApi.bulkCreate(readyRows);
      setResult(response);
      await onImported();
      addNotification(`${response.createdCount} brands imported successfully.`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Bulk import failed.");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[92vh] overflow-y-auto rounded-2xl border-border bg-card sm:max-w-5xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-display text-3xl text-navy", children: "Bulk Add Brands" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { className: "text-navy/60", children: [
        "Add brands in batches with either a CSV file or a manual 20-row entry grid. Use",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "name" }),
        ", ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "category" }),
        ", and optional ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "logo" }),
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
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-navy", children: "Upload a brands CSV" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-navy/60", children: "Best for importing your catalog first, with logo URLs added in the CSV or edited on each brand afterward." }),
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
                      onClick: () => downloadTemplate(categories),
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
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-navy", children: "Manually add up to 20 brands" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-navy/60", children: "Fill the rows below, leave unused slots blank, and save the batch in one go." }),
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
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.16em] text-navy/45", children: "Existing Brands" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-3xl text-navy", children: existingBrands.length })
            ] })
          ] })
        ] })
      ] }),
      error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600", children: error }) : null,
      uploadMode === "manual" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-2xl border border-border/70 bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border/70 px-5 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-2xl text-navy", children: "20-Brand Entry Grid" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-navy/60", children: "Enter brand details directly here. Blank rows are ignored during import." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[24rem] overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-beige/40 text-xs uppercase tracking-[0.18em] text-navy/55", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left", children: "#" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left", children: "Brand Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left", children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left", children: "Logo URL" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-right", children: "Clear" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: manualRows.map((row, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3 text-navy/55", children: index + 1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: row.name,
                onChange: (event) => updateManualRow(row.id, "name", event.target.value),
                placeholder: "Afnan",
                className: "w-full rounded-lg border border-border bg-beige/35 px-3 py-2.5 text-sm text-navy outline-none focus:border-navy"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: row.category,
                onChange: (event) => updateManualRow(row.id, "category", event.target.value),
                className: "w-full rounded-lg border border-border bg-beige/35 px-3 py-2.5 text-sm text-navy outline-none focus:border-navy",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: categoriesLoading ? "Loading categories..." : "Select category" }),
                  categories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: category.id, children: category.name }, category.id))
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: row.logo,
                onChange: (event) => updateManualRow(row.id, "logo", event.target.value),
                placeholder: "https://example.com/logo.png",
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
          ] }, row.id)) })
        ] }) })
      ] }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-2xl border border-border/70 bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border/70 px-5 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-2xl text-navy", children: uploadMode === "csv" ? "CSV Preview" : "Batch Preview" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-navy/60", children: "Review the rows before importing. Invalid or duplicate rows are highlighted." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[24rem] overflow-auto", children: previewRows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-10 text-center text-sm text-navy/50", children: uploadMode === "csv" ? "Choose a CSV file to preview the brand rows." : "Fill the manual grid to preview the batch before saving." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-beige/40 text-xs uppercase tracking-[0.18em] text-navy/55", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left", children: "Row" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left", children: "Brand" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left", children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left", children: "Status" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: previewRows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4 text-navy/60", children: row.rowNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-5 py-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-navy", children: row.name || "Missing name" }),
              row.logo ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-navy/55", children: row.logo }) : null
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4 text-navy/70", children: row.normalizedCategory || row.category || "-" }),
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
          ] }, row.rowNumber)) })
        ] }) })
      ] }),
      result ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-beige/20 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-2xl text-navy", children: "Import Result" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-navy/65", children: [
          "Created ",
          result.createdCount,
          " brand",
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
                    row.name || "Unnamed brand"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-amber-700", children: row.reason })
                ]
              },
              `skipped-${row.rowNumber}`
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
                    row.name || "Unnamed brand"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-red-600", children: row.reason })
                ]
              },
              `failed-${row.rowNumber}`
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
            disabled: saving || categoriesLoading || activeRows.length === 0 || readyCount === 0,
            className: "inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm text-beige transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
              saving ? "Importing..." : uploadMode === "csv" ? `Import ${readyCount} Brands` : `Save ${readyCount} Brands`
            ]
          }
        )
      ] })
    ] })
  ] }) });
}
const inputCls = "w-full rounded-lg border border-border bg-beige/40 px-4 py-2.5 text-sm outline-none focus:border-navy";
const createFormState = (brand) => ({
  name: brand?.name || "",
  categoryId: brand?.categoryId || "",
  category: brand?.category || brand?.categorySlug || brand?.categoryName || ""
});
const normalizeCategoryValue = (value = "") => String(value || "").trim().toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
const getInitialCategoryId = (brand, categories) => {
  const directId = String(brand?.categoryId || "").trim();
  if (directId && categories.some((category) => category.id === directId)) {
    return directId;
  }
  const currentCategory = normalizeCategoryValue(
    brand?.categorySlug || brand?.category || brand?.categoryName || ""
  );
  return categories.find(
    (category) => normalizeCategoryValue(category.slug) === currentCategory || normalizeCategoryValue(category.name) === currentCategory
  )?.id || "";
};
function Field({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.2em] text-navy/60", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5", children })
  ] });
}
const BrandForm = reactExports.memo(function BrandForm2({
  initial,
  onSubmit,
  submitLabel = "Save Brand"
}) {
  const [form, setForm] = reactExports.useState(() => createFormState(initial || void 0));
  const [categories, setCategories] = reactExports.useState([]);
  const [categoriesLoading, setCategoriesLoading] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  reactExports.useEffect(() => {
    setForm(createFormState(initial || void 0));
    setError("");
  }, [initial]);
  reactExports.useEffect(() => {
    let isActive = true;
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const nextCategories = await categoriesApi.listAdmin({ forceFresh: true });
        if (!isActive) return;
        const visibleCategories = nextCategories.filter((category) => !category.isDeleted);
        setCategories(visibleCategories);
        setForm((current) => ({
          ...current,
          categoryId: current.categoryId || getInitialCategoryId(initial, visibleCategories)
        }));
      } catch (ex) {
        if (!isActive) return;
        setCategories([]);
        setError(ex instanceof Error ? ex.message : "Categories could not be loaded.");
      } finally {
        if (isActive) {
          setCategoriesLoading(false);
        }
      }
    };
    void loadCategories();
    const unsubscribe = frontendEventBus.subscribe("catalog:changed", ({ scope }) => {
      if (scope === "categories" || scope === "all") {
        void loadCategories();
      }
    });
    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [initial]);
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const trimmedName = form.name.trim();
      const selectedCategory = categories.find((category) => category.id === form.categoryId);
      if (!trimmedName) {
        throw new Error("Brand name is required.");
      }
      if (!selectedCategory) {
        throw new Error("Select a category.");
      }
      const payload = new FormData();
      payload.append("name", trimmedName);
      payload.append("categoryId", selectedCategory.id);
      payload.append("category", selectedCategory.slug);
      payload.append("categoryName", selectedCategory.name);
      await onSubmit(payload);
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "Brand could not be saved.");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Brand Name", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          required: true,
          value: form.name,
          onChange: (event) => setForm((current) => ({ ...current, name: event.target.value })),
          className: inputCls
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Category", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          required: true,
          value: form.categoryId,
          onChange: (event) => setForm((current) => ({
            ...current,
            categoryId: event.target.value,
            category: categories.find((category) => category.id === event.target.value)?.slug || ""
          })),
          className: inputCls,
          disabled: categoriesLoading,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: categoriesLoading ? "Loading categories..." : "Select category" }),
            categories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: category.id, children: category.name }, category.id))
          ]
        }
      ) })
    ] }),
    error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600", children: error }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end border-t border-border pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: saving, className: "!bg-navy !text-beige", children: saving ? "Saving..." : submitLabel }) })
  ] });
});
const formatCategory = (category) => category.split("-").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
function AdminBrands() {
  const {
    addNotification
  } = useNotification();
  const [brands, setBrands] = reactExports.useState([]);
  const [categories, setCategories] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const [categoryFilter, setCategoryFilter] = reactExports.useState("all");
  const [sortMode, setSortMode] = reactExports.useState("name-asc");
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const [bulkModalOpen, setBulkModalOpen] = reactExports.useState(false);
  const [editingBrand, setEditingBrand] = reactExports.useState(null);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [deleting, setDeleting] = reactExports.useState(false);
  const controlCls = "w-full rounded-lg border border-border bg-beige/35 px-4 py-3 text-sm text-navy outline-none transition focus:border-navy";
  const loadBrands = reactExports.useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError("");
    }
    try {
      const nextBrands = await brandsApi.list();
      setBrands(nextBrands);
      setError("");
    } catch (ex) {
      if (silent) {
        addNotification("Brand saved, but the list could not refresh.", "error");
      } else {
        setBrands([]);
        setError(ex instanceof Error ? ex.message : "Brands could not be loaded.");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [addNotification]);
  reactExports.useEffect(() => {
    loadBrands();
  }, [loadBrands]);
  const loadCategories = reactExports.useCallback(async () => {
    try {
      const nextCategories = await categoriesApi.listAdmin({
        forceFresh: true
      });
      setCategories(nextCategories.filter((category) => !category.isDeleted));
    } catch (_ex) {
      setCategories([]);
    }
  }, []);
  reactExports.useEffect(() => {
    void loadCategories();
    const unsubscribe = frontendEventBus.subscribe("catalog:changed", ({
      scope
    }) => {
      if (scope === "categories" || scope === "all") {
        void loadCategories();
      }
    });
    return unsubscribe;
  }, [loadCategories]);
  const modalTitle = reactExports.useMemo(() => editingBrand ? `Edit ${editingBrand.name}` : "New Brand", [editingBrand]);
  const categoryCounts = reactExports.useMemo(() => {
    const counts = {
      all: brands.length
    };
    brands.forEach((brand) => {
      const key = getBrandCategoryId(brand) || getBrandCategorySlug(brand);
      if (!key) return;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [brands]);
  const categoryFilterOptions = reactExports.useMemo(() => {
    const bySlug = /* @__PURE__ */ new Map();
    categories.forEach((category) => {
      bySlug.set(category.id || category.slug, category.name);
    });
    brands.forEach((brand) => {
      const slug = getBrandCategoryId(brand) || getBrandCategorySlug(brand);
      if (slug && !bySlug.has(slug)) {
        bySlug.set(slug, brand.categoryName || formatCategory(slug));
      }
    });
    return [...bySlug.entries()].map(([value, label]) => ({
      value,
      label
    })).sort((left, right) => left.label.localeCompare(right.label));
  }, [brands, categories]);
  const visibleBrands = reactExports.useMemo(() => {
    const filtered = categoryFilter === "all" ? [...brands] : brands.filter((brand) => [getBrandCategoryId(brand), getBrandCategorySlug(brand)].includes(categoryFilter));
    filtered.sort((left, right) => {
      if (sortMode === "name-desc") {
        return right.name.localeCompare(left.name);
      }
      if (sortMode === "products-desc") {
        const productDelta = (right.productCount ?? 0) - (left.productCount ?? 0);
        return productDelta !== 0 ? productDelta : left.name.localeCompare(right.name);
      }
      return left.name.localeCompare(right.name);
    });
    return filtered;
  }, [brands, categoryFilter, sortMode]);
  const closeModal = reactExports.useCallback(() => {
    setModalOpen(false);
    setEditingBrand(null);
  }, []);
  const confirmDelete = reactExports.useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await brandsApi.remove(deleteTarget.id);
      setBrands((current) => current.filter((brand) => brand.id !== deleteTarget.id));
      setDeleteTarget(null);
      addNotification("Brand deleted successfully.");
      loadBrands(true);
    } catch (ex) {
      addNotification(ex instanceof Error ? ex.message : "Brand could not be deleted.", "error");
    } finally {
      setDeleting(false);
    }
  }, [addNotification, deleteTarget, loadBrands]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] tracking-[0.4em] uppercase text-navy/50", children: "Catalog" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 font-display text-4xl text-navy", children: "Brands" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full flex-col gap-3 sm:w-auto sm:flex-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setBulkModalOpen(true), className: "inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-xs uppercase tracking-[0.25em] text-navy transition hover:bg-beige/40 sm:w-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
          " Bulk Upload"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
          setEditingBrand(null);
          setModalOpen(true);
        }, className: "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-5 py-3 text-xs uppercase tracking-[0.25em] text-beige transition hover:opacity-90 sm:w-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          " New Brand"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/70 bg-card p-5 shadow-soft", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.18em] text-navy/50", children: "All Brands" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-4xl text-navy", children: categoryCounts.all })
      ] }),
      categories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/70 bg-card p-5 shadow-soft", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.18em] text-navy/50", children: category.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-4xl text-navy", children: categoryCounts[category.id] || categoryCounts[category.slug] || 0 })
      ] }, category.id))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-6 rounded-2xl border border-border/70 bg-card p-5 shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-[1fr_1fr_auto]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.18em] text-navy/55", children: "Category Filter" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: categoryFilter, onChange: (event) => setCategoryFilter(event.target.value), className: `${controlCls} mt-2`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Categories" }),
          categoryFilterOptions.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: option.value, children: option.label }, option.value))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.18em] text-navy/55", children: "Sort Brands" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: sortMode, onChange: (event) => setSortMode(event.target.value), className: `${controlCls} mt-2`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "name-asc", children: "Name A to Z" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "name-desc", children: "Name Z to A" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "products-desc", children: "Most Products" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full rounded-xl border border-border bg-beige/30 px-4 py-3 text-sm text-navy/70 lg:w-auto", children: [
        "Showing ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-navy", children: visibleBrands.length }),
        " brands"
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-4 lg:hidden", children: [
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border/60 bg-card px-5 py-10 text-center text-sm text-navy/50 shadow-soft", children: "Loading..." }) : null,
      !loading && error ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border/60 bg-card px-5 py-10 text-center text-sm text-red-600 shadow-soft", children: error }) : null,
      !loading && !error && visibleBrands.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border/60 bg-card px-5 py-10 text-center text-sm text-navy/50 shadow-soft", children: brands.length === 0 ? "No brands yet." : "No brands match the selected category filter." }) : null,
      !loading && !error && visibleBrands.map((brand) => /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "brand-logo-frame h-14 w-14 shrink-0 bg-beige ring-1 ring-border", children: brand.logo ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: brand.logo, alt: brand.name, loading: "lazy", decoding: "async", className: "brand-logo-image" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-xl text-navy", children: brand.fallbackLetter || brand.name.charAt(0).toUpperCase() }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "truncate text-lg font-medium text-navy", children: brand.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-navy/60", children: brand.categoryName || formatCategory(brand.category) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-beige/30 px-3 py-2 text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.18em] text-navy/45", children: "Products" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-base font-medium text-navy", children: brand.productCount ?? 0 })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex justify-end gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
              setEditingBrand(brand);
              setModalOpen(true);
            }, className: "rounded-lg p-2 text-navy transition hover:bg-navy/10", "aria-label": `Edit ${brand.name}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setDeleteTarget(brand), className: "rounded-lg p-2 text-red-600 transition hover:bg-red-100", "aria-label": `Delete ${brand.name}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
          ] })
        ] })
      ] }) }, brand.id))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 hidden overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft lg:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-[42rem] w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-beige/50 text-xs uppercase tracking-[0.2em] text-navy/70", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-4 text-left sm:px-6", children: "Logo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-4 text-left sm:px-6", children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-4 text-left sm:px-6", children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-4 text-right sm:px-6", children: "Products" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-4 text-right sm:px-6", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "px-4 py-10 text-center text-navy/50 sm:px-6", children: "Loading..." }) }) : null,
        !loading && error ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "px-4 py-10 text-center text-red-600 sm:px-6", children: error }) }) : null,
        !loading && !error && visibleBrands.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "px-4 py-10 text-center text-navy/50 sm:px-6", children: brands.length === 0 ? "No brands yet." : "No brands match the selected category filter." }) }) : null,
        !loading && !error && visibleBrands.map((brand) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "transition-colors hover:bg-beige/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4 sm:px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "brand-logo-frame h-12 w-12 bg-beige ring-1 ring-border", children: brand.logo ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: brand.logo, alt: brand.name, loading: "lazy", decoding: "async", className: "brand-logo-image" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-lg text-navy", children: brand.fallbackLetter || brand.name.charAt(0).toUpperCase() }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4 font-medium text-navy sm:px-6", children: brand.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4 text-navy/70 sm:px-6", children: brand.categoryName || formatCategory(brand.category) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4 text-right text-navy/70 sm:px-6", children: brand.productCount ?? 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4 sm:px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
              setEditingBrand(brand);
              setModalOpen(true);
            }, className: "rounded-lg p-2 text-navy hover:bg-navy/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setDeleteTarget(brand), className: "rounded-lg p-2 text-red-600 hover:bg-red-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
          ] }) })
        ] }, brand.id))
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: modalOpen, onOpenChange: (open) => {
      setModalOpen(open);
      if (!open) {
        setEditingBrand(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto rounded-2xl border-border bg-card sm:max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-display text-3xl text-navy", children: modalTitle }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-navy/60", children: "Keep brand details minimal so the storefront cards stay clean and consistent." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(BrandForm, { initial: editingBrand, submitLabel: editingBrand ? "Save Changes" : "Create Brand", onSubmit: async (payload) => {
        if (editingBrand) {
          await brandsApi.updateWithLogo(editingBrand.id, payload);
          addNotification("Brand updated successfully.");
        } else {
          await brandsApi.createWithLogo(payload);
          addNotification("Brand created successfully.");
        }
        closeModal();
        loadBrands(true);
      } })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmModal, { isOpen: Boolean(deleteTarget), title: "Delete brand", message: deleteTarget ? `Delete ${deleteTarget.name}? Linked products will block this action.` : "Delete this brand?", loading: deleting, onClose: () => {
      if (!deleting) {
        setDeleteTarget(null);
      }
    }, onConfirm: confirmDelete }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BulkBrandUploadDialog, { open: bulkModalOpen, onOpenChange: setBulkModalOpen, existingBrands: brands, onImported: () => loadBrands(true) })
  ] });
}
export {
  AdminBrands as component
};
