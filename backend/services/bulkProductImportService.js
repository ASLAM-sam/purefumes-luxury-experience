import Brand, { normalizeBrandName } from "../models/Brand.js";
import Product from "../models/Product.js";
import { escapeRegex } from "../utils/apiFeatures.js";

const BULK_PRODUCT_BATCH_SIZE = 20;

const BRAND_TO_PRODUCT_CATEGORY = {
  "middle-eastern": "Middle Eastern",
  designer: "Designer",
  niche: "Niche",
};

const chunk = (items = [], size = BULK_PRODUCT_BATCH_SIZE) => {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};

const normalizeProductName = (value = "") =>
  String(value)
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const normalizeImportRow = (row = {}, index = 0) => ({
  rowNumber: Number(row.rowNumber) || index + 2,
  name: String(row.name || "").trim().replace(/\s+/g, " "),
  brandInput: String(row.brand || "").trim().replace(/\s+/g, " "),
  priceInput: row.price ?? "",
  stockInput: row.stock ?? "",
  description: String(row.description || "").trim(),
});

const createRowResult = (row, status, reason = "", overrides = {}) => ({
  rowNumber: row.rowNumber,
  name: row.name,
  brand: row.brandInput,
  category: overrides.category || "",
  price: row.priceInput,
  stock: row.stockInput,
  description: row.description,
  status,
  reason,
});

const parsePrice = (value) => {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    return { ok: false, reason: "Price is required" };
  }

  const price = Number(normalized);

  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, reason: "Price must be a valid non-negative number" };
  }

  return { ok: true, value: price };
};

const parseStock = (value) => {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    return { ok: false, reason: "Stock is required" };
  }

  const stock = Number(normalized);

  if (!Number.isFinite(stock) || !Number.isInteger(stock) || stock < 0) {
    return { ok: false, reason: "Stock must be a valid non-negative integer" };
  }

  return { ok: true, value: stock };
};

const getProductKey = (brandName, productName) =>
  `${normalizeBrandName(brandName)}::${normalizeProductName(productName)}`;

const normalizeCreatedProduct = (product) =>
  typeof product?.toObject === "function"
    ? product.toObject({ virtuals: true })
    : product;

export const bulkImportProducts = async (rows = []) => {
  const normalizedRows = rows.map((row, index) => normalizeImportRow(row, index));
  const totalRows = normalizedRows.length;
  const failedRows = [];
  const skippedRows = [];
  const createdProducts = [];
  const validRows = [];
  const seenUploadKeys = new Set();

  const candidateBrandNames = normalizedRows
    .map((row) => normalizeBrandName(row.brandInput))
    .filter(Boolean);

  const brands = candidateBrandNames.length
    ? await Brand.find({
        normalizedName: { $in: [...new Set(candidateBrandNames)] },
      })
        .select("name category normalizedName")
        .lean({ virtuals: true })
    : [];

  const brandsByNormalizedName = new Map(
    brands.map((brand) => [normalizeBrandName(brand.name), brand]),
  );
  const brandsById = new Map(
    brands.map((brand) => [String(brand._id || brand.id || ""), brand]),
  );

  const duplicateLookupRows = normalizedRows
    .map((row) => {
      const brand = brandsByNormalizedName.get(normalizeBrandName(row.brandInput));

      if (!brand || !row.name) {
        return null;
      }

      return {
        name: row.name,
        brand,
      };
    })
    .filter(Boolean);

  const existingProductFilters = duplicateLookupRows.map((row) => ({
    name: {
      $regex: `^${escapeRegex(row.name)}$`,
      $options: "i",
    },
    $or: [
      { brandId: row.brand._id },
      {
        brand: {
          $regex: `^${escapeRegex(row.brand.name)}$`,
          $options: "i",
        },
      },
    ],
  }));

  const existingProducts = existingProductFilters.length
    ? await Product.find({ $or: existingProductFilters })
        .select("name brand brandId")
        .lean()
    : [];

  const existingProductKeys = new Set(
    existingProducts.map((product) => {
      const matchedBrand =
        brandsById.get(String(product.brandId || "")) ||
        brandsByNormalizedName.get(normalizeBrandName(product.brand));

      return getProductKey(matchedBrand?.name || product.brand, product.name);
    }),
  );

  normalizedRows.forEach((row) => {
    if (!row.name) {
      failedRows.push(createRowResult(row, "failed", "Product name is required"));
      return;
    }

    if (row.name.length > 160) {
      failedRows.push(
        createRowResult(row, "failed", "Product name cannot exceed 160 characters"),
      );
      return;
    }

    if (!row.brandInput) {
      failedRows.push(createRowResult(row, "failed", "Brand is required"));
      return;
    }

    const brand = brandsByNormalizedName.get(normalizeBrandName(row.brandInput));

    if (!brand) {
      failedRows.push(
        createRowResult(
          row,
          "failed",
          "Brand must already exist before importing products",
        ),
      );
      return;
    }

    const category = BRAND_TO_PRODUCT_CATEGORY[brand.category] || "";

    if (!category) {
      failedRows.push(
        createRowResult(
          row,
          "failed",
          "Brand category could not be mapped to a product category",
          { category },
        ),
      );
      return;
    }

    const priceResult = parsePrice(row.priceInput);
    if (!priceResult.ok) {
      failedRows.push(createRowResult(row, "failed", priceResult.reason, { category }));
      return;
    }

    const stockResult = parseStock(row.stockInput);
    if (!stockResult.ok) {
      failedRows.push(createRowResult(row, "failed", stockResult.reason, { category }));
      return;
    }

    if (row.description.length > 4000) {
      failedRows.push(
        createRowResult(
          row,
          "failed",
          "Description cannot exceed 4000 characters",
          { category },
        ),
      );
      return;
    }

    const productKey = getProductKey(brand.name, row.name);

    if (seenUploadKeys.has(productKey)) {
      skippedRows.push(
        createRowResult(
          row,
          "skipped",
          "Duplicate product for the same brand in the uploaded batch",
          { category },
        ),
      );
      return;
    }

    if (existingProductKeys.has(productKey)) {
      skippedRows.push(
        createRowResult(row, "skipped", "Product already exists for this brand", {
          category,
        }),
      );
      return;
    }

    seenUploadKeys.add(productKey);
    validRows.push({
      ...row,
      brand,
      category,
      price: priceResult.value,
      stock: stockResult.value,
    });
  });

  for (const batch of chunk(validRows, BULK_PRODUCT_BATCH_SIZE)) {
    const settled = await Promise.allSettled(
      batch.map(async (row) => {
        const product = await Product.create({
          name: row.name,
          brand: row.brand.name,
          brandId: row.brand._id,
          category: row.category,
          price: row.price,
          stock: row.stock,
          description: row.description,
          image: "",
          images: [],
          notes: [],
          topNotes: [],
          middleNotes: [],
          baseNotes: [],
          accords: [],
          sizes: [{ size: "Standard", price: row.price }],
        });

        return normalizeCreatedProduct(product);
      }),
    );

    settled.forEach((result, index) => {
      const row = batch[index];

      if (result.status === "fulfilled") {
        createdProducts.push(result.value);
        return;
      }

      const reason =
        result.reason instanceof Error
          ? result.reason.message
          : "Product could not be imported";

      failedRows.push(createRowResult(row, "failed", reason, { category: row.category }));
    });
  }

  return {
    totalRows,
    createdCount: createdProducts.length,
    skippedCount: skippedRows.length,
    failedCount: failedRows.length,
    createdProducts,
    skippedRows,
    failedRows,
    batchSize: BULK_PRODUCT_BATCH_SIZE,
  };
};
