import Brand, { formatBrandName, normalizeBrandName } from "../models/Brand.js";
import Product from "../models/Product.js";
import { escapeRegex } from "../utils/apiFeatures.js";
import { normalizeMoney } from "../utils/money.js";
import { resolveCategoriesFromInput } from "./categoryService.js";

const BULK_PRODUCT_BATCH_SIZE = 20;

const LEGACY_BRAND_CATEGORY_BY_PRODUCT_CATEGORY = {
  "middle eastern": "middle-eastern",
  designer: "designer",
  niche: "niche",
};

const LEGACY_PRODUCT_CATEGORY_BY_BRAND_CATEGORY = {
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

const mapBrandCategoryFromProductCategory = (categoryName = "") => {
  const normalized = String(categoryName || "").trim().toLowerCase();
  return LEGACY_BRAND_CATEGORY_BY_PRODUCT_CATEGORY[normalized] || "designer";
};

const ensureBrandsExist = async (rows = []) => {
  const candidateBrandNames = rows.map((row) => normalizeBrandName(row.brandInput)).filter(Boolean);
  const uniqueBrandNames = [...new Set(candidateBrandNames)];

  const existingBrands = uniqueBrandNames.length
    ? await Brand.find({
        normalizedName: { $in: uniqueBrandNames },
      })
        .select("name category normalizedName")
        .lean({ virtuals: true })
    : [];

  const brandsByNormalizedName = new Map(
    existingBrands.map((brand) => [normalizeBrandName(brand.name), brand]),
  );

  const missingBrandPayloads = uniqueBrandNames
    .filter((normalizedName) => !brandsByNormalizedName.has(normalizedName))
    .map((normalizedName) => {
      const matchingRow = rows.find(
        (row) => normalizeBrandName(row.brandInput) === normalizedName,
      );
      const productCategory = String(matchingRow?.categoryInput || "").trim();

      return {
        name: formatBrandName(matchingRow?.brandInput || normalizedName),
        category: mapBrandCategoryFromProductCategory(productCategory),
      };
    });

  if (missingBrandPayloads.length) {
    const createdBrands = await Brand.insertMany(missingBrandPayloads, { ordered: false });

    createdBrands.forEach((brand) => {
      const normalizedName = normalizeBrandName(brand.name);
      brandsByNormalizedName.set(normalizedName, normalizeCreatedProduct(brand));
    });
  }

  return brandsByNormalizedName;
};

const resolveRowCategories = async (row, brand) => {
  const fallbackCategory =
    row.categoryInput || LEGACY_PRODUCT_CATEGORY_BY_BRAND_CATEGORY[brand.category] || "Designer";

  const categories = await resolveCategoriesFromInput({
    category: fallbackCategory,
    allowCreate: true,
  });

  if (!categories.length) {
    return {
      categoryIds: [],
      categoryNames: [],
      categorySlugs: [],
      primaryCategory: null,
      categoryLabel: fallbackCategory,
    };
  }

  return {
    categoryIds: categories.map((category) => category._id),
    categoryNames: categories.map((category) => category.name),
    categorySlugs: categories.map((category) => category.slug),
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

  const brandsByNormalizedName = await ensureBrandsExist(normalizedRows);
  const duplicateLookupRows = normalizedRows
    .map((row) => {
      const brand = brandsByNormalizedName.get(normalizeBrandName(row.brandInput));

      if (!brand || !row.name) {
        return null;
      }

      return { name: row.name, brand };
    })
    .filter(Boolean);

  const existingProductFilters = duplicateLookupRows.map((row) => ({
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
          { brandId: row.brand._id },
          {
            brand: {
              $regex: `^${escapeRegex(row.brand.name)}$`,
              $options: "i",
            },
          },
        ],
      },
    ],
  }));

  const existingProducts = existingProductFilters.length
    ? await Product.find({ $or: existingProductFilters })
        .select("name brand brandId")
        .lean()
    : [];

  const existingProductKeys = new Set(
    existingProducts.map((product) => getProductKey(product.brand, product.name)),
  );

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

    const brand = brandsByNormalizedName.get(normalizeBrandName(row.brandInput));

    if (!brand) {
      failedRows.push(createRowResult(row, "failed", "Brand could not be created automatically"));
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

    if (existingProductKeys.has(productKey)) {
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
