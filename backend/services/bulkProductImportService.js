import Brand, { formatBrandName, normalizeBrandName } from "../models/Brand.js";
import { createCategorySlug } from "../models/Category.js";
import Product from "../models/Product.js";
import { escapeRegex } from "../utils/apiFeatures.js";
import { normalizeMoney } from "../utils/money.js";
import {
  resolveCategoriesFromInput,
  resolveCategoryFromInput,
} from "./categoryService.js";

const BULK_PRODUCT_BATCH_SIZE = 20;

const chunk = (items = [], size = BULK_PRODUCT_BATCH_SIZE) => {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};

const stripDiacritics = (value = "") =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");

const normalizeProductName = (value = "") =>
  stripDiacritics(String(value || "").trim())
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();

const normalizeImportRow = (row = {}, index = 0) => ({
  rowNumber: Number(row.rowNumber) || index + 2,
  name: String(row.name || "").trim().replace(/\s+/g, " "),
  brandInput: String(row.brand || "").trim().replace(/\s+/g, " "),
  categoryInput: String(row.category || row.categories || "").trim().replace(/\s+/g, " "),
  typeInput: String(row.type || row.productType || row.fragranceType || "").trim().replace(/\s+/g, " "),
  priceInput: row.price ?? "",
  stockInput: row.stock ?? "",
  description: String(row.description || "").trim(),
  imageInput: String(row.image || row.imageUrl || row.primaryImage || "").trim(),
  imageUrlsInput: row.imageUrls ?? row.images ?? row.gallery ?? "",
  sizesInput: row.sizes ?? row.sizeOptions ?? "",
});

const createRowResult = (row, status, reason = "", overrides = {}) => ({
  rowNumber: row.rowNumber,
  name: row.name,
  brand: row.brandInput,
  category: overrides.category || row.categoryInput || "",
  type: row.typeInput,
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

  return { ok: true, value: normalizeMoney(price) };
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

const parseImageUrls = (primaryImage, rawImages) => {
  const list = [
    String(primaryImage || "").trim(),
    ...(Array.isArray(rawImages)
      ? rawImages
      : String(rawImages || "")
          .split(/[|,]/g)
          .map((value) => value.trim())
          .filter(Boolean)),
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  return [...new Set(list)];
};

const parseSizes = (rawSizes, fallbackPrice) => {
  if (Array.isArray(rawSizes)) {
    const parsedSizes = rawSizes
      .map((item) => {
        if (!item || typeof item !== "object") return null;

        const size = String(item.size || "").trim();
        const price = Number(item.price);

        if (!size || !Number.isFinite(price) || price < 0) {
          return null;
        }

        return { size, price: normalizeMoney(price) };
      })
      .filter(Boolean);

    return parsedSizes.length ? parsedSizes : [{ size: "Standard", price: fallbackPrice }];
  }

  const normalized = String(rawSizes || "").trim();

  if (!normalized) {
    return [{ size: "Standard", price: fallbackPrice }];
  }

  let candidateItems = [];

  if (normalized.startsWith("[")) {
    try {
      candidateItems = JSON.parse(normalized);
    } catch (_error) {
      candidateItems = [];
    }
  } else {
    candidateItems = normalized
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [sizePart, pricePart] = part.split(":");
        return {
          size: String(sizePart || "").trim(),
          price: normalizeMoney(pricePart || fallbackPrice),
        };
      });
  }

  return parseSizes(candidateItems, fallbackPrice);
};

const getProductKey = (brandName, productName) =>
  `${normalizeBrandName(brandName)}::${normalizeProductName(productName)}`;

const normalizeCreatedProduct = (product) =>
  typeof product?.toObject === "function"
    ? product.toObject({ virtuals: true })
    : product;

const loadExistingBrands = async (rows = []) => {
  const candidateBrandNames = rows.map((row) => normalizeBrandName(row.brandInput)).filter(Boolean);
  const uniqueBrandNames = [...new Set(candidateBrandNames)];

  const existingBrands = uniqueBrandNames.length
    ? await Brand.find({
        normalizedName: { $in: uniqueBrandNames },
      })
        .select("name category categoryId categoryName categorySlug normalizedName")
        .lean({ virtuals: true })
    : [];

  return new Map(
    existingBrands.map((brand) => [normalizeBrandName(brand.name), brand]),
  );
};

const getCategoryPayload = async (categoryInput = "") => {
  const category = await resolveCategoryFromInput({
    categoryId: categoryInput,
    categoryName: categoryInput,
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

const resolveBrandForRow = async (row, brandsByNormalizedName) => {
  const normalizedName = normalizeBrandName(row.brandInput);
  const existingBrand = brandsByNormalizedName.get(normalizedName);

  if (existingBrand) {
    return existingBrand;
  }

  if (!row.categoryInput) {
    throw new Error("Category is required when creating a missing brand");
  }

  const categoryPayload = await getCategoryPayload(row.categoryInput);
  const createdBrand = await Brand.create({
    name: formatBrandName(row.brandInput),
    ...categoryPayload,
  });
  const normalizedBrand = normalizeCreatedProduct(createdBrand);
  brandsByNormalizedName.set(normalizedName, normalizedBrand);

  return normalizedBrand;
};

const resolveRowCategories = async (row, brand) => {
  const categoryArgs = row.categoryInput
    ? { category: row.categoryInput }
    : brand.categoryId
      ? { categoryId: brand.categoryId }
      : { category: brand.categoryName || brand.categorySlug || brand.category };
  const categoryLabel =
    row.categoryInput ||
    brand.categoryName ||
    brand.categorySlug ||
    brand.category ||
    String(brand.categoryId || "");

  if (!String(categoryLabel || "").trim()) {
    throw new Error("Category is required");
  }

  const categories = await resolveCategoriesFromInput({
    ...categoryArgs,
    allowCreate: false,
  });

  if (!categories.length) {
    return {
      categoryIds: [],
      categoryNames: [],
      categorySlugs: [],
      primaryCategory: null,
      categoryLabel,
    };
  }

  return {
    categoryIds: categories.map((category) => category._id),
    categoryNames: categories.map((category) => category.name),
    categorySlugs: categories.map((category) => createCategorySlug(category.name)),
    primaryCategory: categories[0]._id,
    categoryLabel: categories.map((category) => category.name).join(" | "),
  };
};

export const bulkImportProducts = async (rows = []) => {
  const normalizedRows = rows.map((row, index) => normalizeImportRow(row, index));
  const totalRows = normalizedRows.length;
  const failedRows = [];
  const skippedRows = [];
  const createdProducts = [];
  const validRows = [];
  const seenUploadKeys = new Set();

  const brandsByNormalizedName = await loadExistingBrands(normalizedRows);

  for (const row of normalizedRows) {
    if (!row.name) {
      failedRows.push(createRowResult(row, "failed", "Product name is required"));
      continue;
    }

    if (row.name.length > 160) {
      failedRows.push(createRowResult(row, "failed", "Product name cannot exceed 160 characters"));
      continue;
    }

    if (!row.brandInput) {
      failedRows.push(createRowResult(row, "failed", "Brand is required"));
      continue;
    }

    let brand;

    try {
      brand = await resolveBrandForRow(row, brandsByNormalizedName);
    } catch (error) {
      failedRows.push(
        createRowResult(
          row,
          "failed",
          error instanceof Error ? error.message : "Brand could not be resolved",
        ),
      );
      continue;
    }

    const priceResult = parsePrice(row.priceInput);
    if (!priceResult.ok) {
      failedRows.push(createRowResult(row, "failed", priceResult.reason));
      continue;
    }

    const stockResult = parseStock(row.stockInput);
    if (!stockResult.ok) {
      failedRows.push(createRowResult(row, "failed", stockResult.reason));
      continue;
    }

    if (row.description.length > 4000) {
      failedRows.push(
        createRowResult(row, "failed", "Description cannot exceed 4000 characters"),
      );
      continue;
    }

    const productKey = getProductKey(brand.name, row.name);

    if (seenUploadKeys.has(productKey)) {
      skippedRows.push(
        createRowResult(
          row,
          "skipped",
          "Duplicate exact product row for the same brand in the uploaded batch",
        ),
      );
      continue;
    }

    const existingProduct = await Product.findOne({
      $and: [
        {
          $or: [
            {
              name: {
                $regex: `^${escapeRegex(row.name)}$`,
                $options: "i",
              },
            },
            {
              name: {
                $regex: `^${escapeRegex(normalizeProductName(row.name)).replace(/\\s\+/g, "\\\\s+")}$`,
                $options: "i",
              },
            },
          ],
        },
        {
          $or: [
            { brandId: brand._id },
            {
              brand: {
                $regex: `^${escapeRegex(brand.name)}$`,
                $options: "i",
              },
            },
          ],
        },
      ],
    })
      .select("_id")
      .lean();

    if (existingProduct) {
      skippedRows.push(
        createRowResult(row, "skipped", "Product already exists for this brand"),
      );
      continue;
    }

    let categorySnapshot;

    try {
      categorySnapshot = await resolveRowCategories(row, brand);
    } catch (error) {
      failedRows.push(
        createRowResult(
          row,
          "failed",
          error instanceof Error ? error.message : "Categories could not be resolved",
        ),
      );
      continue;
    }

    seenUploadKeys.add(productKey);
    validRows.push({
      ...row,
      brand,
      categoryIds: categorySnapshot.categoryIds,
      categoryNames: categorySnapshot.categoryNames,
      categorySlugs: categorySnapshot.categorySlugs,
      primaryCategory: categorySnapshot.primaryCategory,
      categoryLabel: categorySnapshot.categoryLabel,
      price: priceResult.value,
      stock: stockResult.value,
      images: parseImageUrls(row.imageInput, row.imageUrlsInput),
      sizes: parseSizes(row.sizesInput, priceResult.value),
    });
  }

  for (const batch of chunk(validRows, BULK_PRODUCT_BATCH_SIZE)) {
    const settled = await Promise.allSettled(
      batch.map(async (row) => {
        const product = await Product.create({
          name: row.name,
          brand: row.brand.name,
          brandId: row.brand._id,
          categories: row.categoryIds,
          primaryCategory: row.primaryCategory,
          categoryNames: row.categoryNames,
          categorySlugs: row.categorySlugs,
          price: row.price,
          stock: row.stock,
          description: row.description,
          type: row.typeInput,
          image: row.images[0] || "",
          images: row.images,
          notes: [],
          topNotes: [],
          middleNotes: [],
          baseNotes: [],
          accords: [],
          sizes: row.sizes,
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

      failedRows.push(
        createRowResult(row, "failed", reason, { category: row.categoryLabel }),
      );
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
