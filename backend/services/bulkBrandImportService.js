import Brand, { normalizeBrandName } from "../models/Brand.js";
import { createCategorySlug } from "../models/Category.js";
import Product from "../models/Product.js";
import { ApiError } from "../middlewares/errorMiddleware.js";
import { resolveCategoryFromInput } from "./categoryService.js";
import {
  buildLinkedBrandFilter,
  normalizeBrandResponse,
} from "../utils/brandHelpers.js";

const BULK_BRAND_BATCH_SIZE = 20;

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
  categoryInput: String(row.categoryId || row.category || row.categoryName || row.categorySlug || "").trim(),
  logo: String(row.logo || "").trim(),
});

const createRowResult = (row, status, reason = "") => ({
  rowNumber: row.rowNumber,
  name: row.name,
  category: row.categoryName || row.categoryInput || "",
  logo: row.logo,
  status,
  reason,
});

const resolveImportCategory = async (row) => {
  if (!row.categoryInput) {
    throw new ApiError(422, "Category is required");
  }

  const category = await resolveCategoryFromInput({
    categoryId: row.categoryInput,
    categoryName: row.categoryInput,
    allowCreate: false,
  });
  const categoryName = String(category.name || "").trim();
  const categorySlug = createCategorySlug(categoryName);

  return {
    categoryId: category._id,
    categoryName,
    categorySlug,
    category: categorySlug,
  };
};

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

  for (const row of normalizedRows) {
    const normalizedName = normalizeBrandName(row.name);

    if (!row.name) {
      failedRows.push(createRowResult(row, "failed", "Brand name is required"));
      continue;
    }

    let categoryPayload;

    try {
      categoryPayload = await resolveImportCategory(row);
    } catch (error) {
      const reason =
        error instanceof ApiError && error.statusCode === 404
          ? `Category '${row.categoryInput}' does not exist.`
          : error instanceof Error
            ? error.message
            : "Category could not be resolved";
      failedRows.push(
        createRowResult(row, "failed", reason),
      );
      continue;
    }

    if (!isHttpImageUrl(row.logo)) {
      failedRows.push(createRowResult(row, "failed", "Logo must be a valid HTTP or HTTPS URL"));
      continue;
    }

    if (seenNames.has(normalizedName)) {
      skippedRows.push(
          createRowResult(row, "skipped", "Duplicate brand name in the uploaded file"),
      );
      continue;
    }

    if (existingNames.has(normalizedName)) {
      skippedRows.push(createRowResult(row, "skipped", "Brand already exists"));
      continue;
    }

    seenNames.add(normalizedName);
    validRows.push({ ...row, ...categoryPayload });
  }

  for (const batch of chunk(validRows, BULK_BRAND_BATCH_SIZE)) {
    const settled = await Promise.allSettled(
      batch.map(async (row) => {
        const brand = await Brand.create({
          name: row.name,
          category: row.category,
          categoryId: row.categoryId,
          categoryName: row.categoryName,
          categorySlug: row.categorySlug,
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
