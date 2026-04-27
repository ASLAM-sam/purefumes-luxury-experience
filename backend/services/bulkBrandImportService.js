import Brand, { normalizeBrandName } from "../models/Brand.js";
import Product from "../models/Product.js";
import {
  buildLinkedBrandFilter,
  normalizeBrandResponse,
} from "../utils/brandHelpers.js";

const BULK_BRAND_BATCH_SIZE = 20;

const BRAND_CATEGORY_ALIASES = new Map([
  ["middle-eastern", "middle-eastern"],
  ["middle eastern", "middle-eastern"],
  ["middleeastern", "middle-eastern"],
  ["designer", "designer"],
  ["niche", "niche"],
]);

const chunk = (items = [], size = BULK_BRAND_BATCH_SIZE) => {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
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

const normalizeBrandCategory = (value = "") => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return BRAND_CATEGORY_ALIASES.get(normalized) || "";
};

const syncProductsWithBrand = async (brand) => {
  const normalizedBrand = normalizeBrandResponse(brand);
  if (!normalizedBrand) return;

  await Product.updateMany(buildLinkedBrandFilter(brand), {
    brandId: normalizedBrand.id,
    brand: normalizedBrand.name,
  });
};

const normalizeImportRow = (row = {}, index = 0) => ({
  rowNumber: Number(row.rowNumber) || index + 2,
  name: String(row.name || "").trim(),
  categoryInput: String(row.category || "").trim(),
  category: normalizeBrandCategory(row.category),
  logo: String(row.logo || "").trim(),
});

const createRowResult = (row, status, reason = "") => ({
  rowNumber: row.rowNumber,
  name: row.name,
  category: row.category || row.categoryInput || "",
  logo: row.logo,
  status,
  reason,
});

export const bulkImportBrands = async (rows = []) => {
  const normalizedRows = rows.map((row, index) => normalizeImportRow(row, index));
  const totalRows = normalizedRows.length;
  const failedRows = [];
  const skippedRows = [];
  const createdBrands = [];
  const validRows = [];
  const seenNames = new Set();

  const candidateNames = normalizedRows
    .map((row) => normalizeBrandName(row.name))
    .filter(Boolean);

  const existingBrands = candidateNames.length
    ? await Brand.find({
        normalizedName: { $in: [...new Set(candidateNames)] },
      })
        .select("normalizedName")
        .lean()
    : [];

  const existingNames = new Set(
    existingBrands.map((brand) => String(brand.normalizedName || "").trim()),
  );

  normalizedRows.forEach((row) => {
    const normalizedName = normalizeBrandName(row.name);

    if (!row.name) {
      failedRows.push(createRowResult(row, "failed", "Brand name is required"));
      return;
    }

    if (!row.category) {
      failedRows.push(
        createRowResult(
          row,
          "failed",
          "Category must be middle-eastern, designer, or niche",
        ),
      );
      return;
    }

    if (!isHttpImageUrl(row.logo)) {
      failedRows.push(createRowResult(row, "failed", "Logo must be a valid HTTP or HTTPS URL"));
      return;
    }

    if (seenNames.has(normalizedName)) {
      skippedRows.push(
        createRowResult(row, "skipped", "Duplicate brand name in the uploaded file"),
      );
      return;
    }

    if (existingNames.has(normalizedName)) {
      skippedRows.push(createRowResult(row, "skipped", "Brand already exists"));
      return;
    }

    seenNames.add(normalizedName);
    validRows.push(row);
  });

  for (const batch of chunk(validRows, BULK_BRAND_BATCH_SIZE)) {
    const settled = await Promise.allSettled(
      batch.map(async (row) => {
        const brand = await Brand.create({
          name: row.name,
          category: row.category,
          logo: row.logo,
        });

        await syncProductsWithBrand(brand);
        return normalizeBrandResponse(brand);
      }),
    );

    settled.forEach((result, index) => {
      const row = batch[index];

      if (result.status === "fulfilled") {
        createdBrands.push(result.value);
        return;
      }

      const reason =
        result.reason instanceof Error
          ? result.reason.message
          : "Brand could not be imported";

      failedRows.push(createRowResult(row, "failed", reason));
    });
  }

  return {
    totalRows,
    createdCount: createdBrands.length,
    skippedCount: skippedRows.length,
    failedCount: failedRows.length,
    createdBrands,
    skippedRows,
    failedRows,
    batchSize: BULK_BRAND_BATCH_SIZE,
  };
};
