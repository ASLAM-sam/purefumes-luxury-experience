import mongoose from "mongoose";
import Brand from "../models/Brand.js";
import { createCategorySlug } from "../models/Category.js";
import Product from "../models/Product.js";
import {
  buildProductFilter,
  buildSort,
  createPaginationMeta,
  escapeRegex,
  getPagination,
} from "../utils/apiFeatures.js";
import { ApiError, asyncHandler } from "../middlewares/errorMiddleware.js";
import { storeUploadedImage } from "../middlewares/uploadMiddleware.js";
import {
  attachBrandDetails,
  resolveBrandFromProductInput,
} from "../utils/brandHelpers.js";
import { deleteCacheByPrefix, getCachedJson, setCachedJson } from "../utils/cache.js";
import { bulkImportProducts } from "../services/bulkProductImportService.js";
import {
  createBackInStockSubscription,
  queueBackInStockNotificationsForProduct,
} from "../services/backInStockNotificationService.js";
import {
  attachCategoryDetails,
  resolveCategoryFromInput,
  syncProductCategoryFields,
} from "../services/categoryService.js";
import { normalizeMoney } from "../utils/money.js";
import env from "../config/env.js";
import logger from "../config/logger.js";

const PRODUCT_CACHE_TTL_SECONDS = 5 * 60;
const PRODUCT_CACHE_TTL_MS = PRODUCT_CACHE_TTL_SECONDS * 1000;
const PRODUCT_CACHE_MAX_KEYS = 100;
const productListCache = new Map();

export const clearProductCache = () => {
  productListCache.clear();
  void deleteCacheByPrefix("products:");
};

const getCacheKey = (query) => {
  const sortedEntries = Object.entries(query).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  return `products:list:${JSON.stringify(sortedEntries)}`;
};

const getCachedProductList = async (key) => {
  const cached = productListCache.get(key);

  if (!cached || Date.now() - cached.createdAt > PRODUCT_CACHE_TTL_MS) {
    productListCache.delete(key);
  } else {
    return cached.payload;
  }

  return getCachedJson(key);
};

const setCachedProductList = async (key, payload) => {
  if (productListCache.size >= PRODUCT_CACHE_MAX_KEYS) {
    const firstKey = productListCache.keys().next().value;
    productListCache.delete(firstKey);
  }

  productListCache.set(key, {
    createdAt: Date.now(),
    payload,
  });
  await setCachedJson(key, payload, PRODUCT_CACHE_TTL_SECONDS);
};

const setNoStoreHeaders = (res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
};

const debugBestseller = (...args) => {
  if (!env.isProduction) {
    logger.debug("[bestsellers]", { details: args });
  }
};

const getRequestedBestsellerOrder = (body = {}) => {
  const rawValue =
    body.bestsellerOrder !== undefined && body.bestsellerOrder !== ""
      ? body.bestsellerOrder
      : body.displayOrder;

  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return undefined;
  }

  const nextOrder = Number(rawValue);

  if (!Number.isInteger(nextOrder) || nextOrder < 0) {
    throw new ApiError(400, "bestsellerOrder must be a non-negative integer");
  }

  return nextOrder;
};

const compareBestsellerEntries = (left, right) => {
  const orderDelta = Number(left.bestsellerOrder || 0) - Number(right.bestsellerOrder || 0);

  if (orderDelta !== 0) {
    return orderDelta;
  }

  const updatedAtDelta =
    new Date(right.updatedAt || 0).getTime() - new Date(left.updatedAt || 0).getTime();

  if (updatedAtDelta !== 0) {
    return updatedAtDelta;
  }

  return String(left.name || "").localeCompare(String(right.name || ""));
};

const reindexBestsellerProducts = async () => {
  const bestsellers = await Product.find({ isBestseller: true })
    .select("_id name updatedAt bestsellerOrder")
    .lean();

  if (!bestsellers.length) {
    return;
  }

  const operations = [...bestsellers]
    .sort(compareBestsellerEntries)
    .map((product, index) => ({
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            isBestseller: true,
            bestsellerOrder: index + 1,
          },
        },
      },
    }));

  await Product.bulkWrite(operations);
};

const persistBestsellerState = async (productId, updates = {}) => {
  const existingProduct = await Product.findById(productId).select(
    "_id name isBestseller bestsellerOrder updatedAt",
  );

  if (!existingProduct) {
    throw new ApiError(404, "Product not found");
  }

  const hasStatusField = updates.isBestseller !== undefined;
  const requestedOrder = getRequestedBestsellerOrder(updates);
  const nextIsBestseller = hasStatusField
    ? parseBooleanField(updates.isBestseller, "isBestseller")
    : existingProduct.isBestseller;

  const remainingBestsellers = await Product.find({
    isBestseller: true,
    _id: { $ne: existingProduct._id },
  })
    .select("_id name updatedAt bestsellerOrder")
    .lean();

  const orderedProducts = [...remainingBestsellers].sort(compareBestsellerEntries);

  if (nextIsBestseller) {
    const desiredOrder =
      requestedOrder !== undefined
        ? requestedOrder
        : Number(existingProduct.bestsellerOrder || 0) || orderedProducts.length + 1;
    const normalizedOrder = Math.min(
      Math.max(1, desiredOrder || 1),
      orderedProducts.length + 1,
    );

    orderedProducts.splice(normalizedOrder - 1, 0, {
      _id: existingProduct._id,
      name: existingProduct.name,
      updatedAt: existingProduct.updatedAt,
      bestsellerOrder: existingProduct.bestsellerOrder || 0,
    });
  }

  const operations = orderedProducts.map((product, index) => ({
    updateOne: {
      filter: { _id: product._id },
      update: {
        $set: {
          isBestseller: true,
          bestsellerOrder: index + 1,
        },
      },
    },
  }));

  if (!nextIsBestseller) {
    operations.push({
      updateOne: {
        filter: { _id: existingProduct._id },
        update: {
          $set: {
            isBestseller: false,
            bestsellerOrder: 0,
          },
        },
      },
    });
  }

  if (operations.length > 0) {
    await Product.bulkWrite(operations);
  }

  debugBestseller("Updated bestseller state", {
    productId,
    isBestseller: nextIsBestseller,
    requestedOrder: requestedOrder ?? null,
  });

  return Product.findById(productId);
};

const parseArrayField = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    if (trimmed.startsWith("[")) {
      return JSON.parse(trimmed);
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return undefined;
};

const parseJsonArrayField = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return JSON.parse(value);
  }

  return undefined;
};

const parseImageField = (value) => {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[")) {
      return JSON.parse(trimmed)
        .map((item) => String(item).trim())
        .filter(Boolean);
    }
    return [trimmed];
  }

  return [];
};

const parseBooleanField = (value, fieldName = "value") => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();

    if (["true", "1", "yes"].includes(normalizedValue)) {
      return true;
    }

    if (["false", "0", "no"].includes(normalizedValue)) {
      return false;
    }
  }

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  throw new ApiError(400, `${fieldName} must be a boolean`);
};

const parseExistingImages = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  try {
    return parseImageField(value);
  } catch (_error) {
    throw new ApiError(400, "existingImages must be a valid JSON array");
  }
};

const normalizeStoredImageValue = (value = "") => {
  const image = String(value || "").trim();

  if (!image) return "";

  try {
    const parsed = new URL(image);
    return parsed.pathname.startsWith("/uploads/") ? parsed.pathname : image;
  } catch (_error) {
    return image;
  }
};

const getRetainedExistingImages = (body = {}, existingImages = []) => {
  const requestedImages = parseExistingImages(body.existingImages);

  if (requestedImages === undefined) {
    return undefined;
  }

  const existingImageSet = new Set(
    existingImages.map(normalizeStoredImageValue).filter(Boolean),
  );

  return requestedImages
    .map(normalizeStoredImageValue)
    .filter((image, index, images) => image && images.indexOf(image) === index)
    .filter((image) => existingImageSet.has(image))
    .slice(0, 5);
};

const normalizeAccordInput = (accords = []) => {
  if (!Array.isArray(accords)) {
    throw new ApiError(400, "accords must be an array");
  }

  return accords
    .map((accord) => {
      if (!accord || typeof accord !== "object") return null;

      const name = String(accord.name || "").trim();
      if (!name) return null;

      const percentage = Number(accord.percentage ?? accord.intensity);

      if (!Number.isFinite(percentage)) {
        throw new ApiError(400, "Accord percentage must be a valid number");
      }

      if (percentage < 0 || percentage > 100) {
        throw new ApiError(400, "Accord percentage must be between 0 and 100");
      }

      return {
        name,
        percentage,
      };
    })
    .filter(Boolean);
};

const validateAccordTotal = (accords = []) => {
  if (!accords.length) {
    return;
  }

  const total = accords.reduce(
    (sum, accord) => sum + Number(accord.percentage || 0),
    0,
  );

  if (Math.round(total * 100) !== 10000) {
    throw new ApiError(400, "Accords must sum to 100");
  }
};

const validateImageCount = (images = [], { requireMinimum = false } = {}) => {
  const normalizedImages = Array.isArray(images)
    ? images.map((image) => String(image).trim()).filter(Boolean)
    : [];

  if (normalizedImages.length > 5) {
    throw new ApiError(400, "Products can have up to 5 images");
  }

  if (requireMinimum && normalizedImages.length === 0) {
    throw new ApiError(400, "At least one product image is required");
  }
};

const buildProductPayload = (body) => {
  const payload = {};
  const directFields = [
    "name",
    "brand",
    "description",
    "type",
    "gender",
    "sillage",
    "usage",
    "timeOfDay",
  ];

  directFields.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] =
        typeof body[field] === "string" ? body[field].trim() : body[field];
    }
  });

  ["price", "stock", "originalPrice", "bestsellerOrder"].forEach((field) => {
    if (body[field] !== undefined && body[field] !== "") {
      const value = Number(body[field]);

      if (!Number.isFinite(value)) {
        throw new ApiError(400, `${field} must be a valid number`);
      }

      payload[field] =
        field === "stock" || field === "bestsellerOrder"
          ? Math.trunc(value)
          : normalizeMoney(value);
    }
  });

  if (
    (body.bestsellerOrder === undefined || body.bestsellerOrder === "") &&
    body.displayOrder !== undefined &&
    body.displayOrder !== ""
  ) {
    const value = Number(body.displayOrder);

    if (!Number.isFinite(value)) {
      throw new ApiError(400, "displayOrder must be a valid number");
    }

    payload.bestsellerOrder = Math.trunc(value);
  }

  if (body.isBestseller !== undefined) {
    payload.isBestseller = parseBooleanField(body.isBestseller, "isBestseller");
  }

  if (body.isLatest !== undefined) {
    payload.isLatest = parseBooleanField(body.isLatest, "isLatest");
  }

  try {
    ["notes", "topNotes", "middleNotes", "baseNotes", "bestTime", "season", "seasons"].forEach(
      (field) => {
        const parsed = parseArrayField(body[field]);
        if (parsed !== undefined) payload[field] = parsed;
      },
    );

    ["sizes", "accords"].forEach((field) => {
      const parsed = parseJsonArrayField(body[field]);
      if (parsed !== undefined) payload[field] = parsed;
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      400,
      "Array fields must be valid JSON arrays or comma-separated values",
    );
  }

  if (payload.notes?.length) {
    payload.topNotes = payload.topNotes?.length
      ? payload.topNotes
      : payload.notes;
  }

  if (payload.accords) {
    payload.accords = normalizeAccordInput(payload.accords);
    validateAccordTotal(payload.accords);
  }

  if (payload.sizes) {
    payload.sizes = payload.sizes.map((size) => ({
      ...size,
      size: String(size.size || "").trim(),
      price: normalizeMoney(size.price),
    }));
  }

  if (payload.price === undefined && payload.sizes?.length && payload.sizes[0]?.price !== undefined) {
    payload.price = normalizeMoney(payload.sizes[0].price);
  }

  if (payload.isBestseller === false && payload.bestsellerOrder === undefined) {
    payload.bestsellerOrder = 0;
  }

  return payload;
};

const getProductUploadFolder = (payload = {}) => {
  const primaryCategorySlug = Array.isArray(payload.categorySlugs)
    ? payload.categorySlugs[0]
    : "";
  const primaryCategoryName = Array.isArray(payload.categoryNames)
    ? payload.categoryNames[0]
    : "";
  const categorySlug =
    createCategorySlug(primaryCategorySlug || primaryCategoryName || payload.category) ||
    "uncategorized";

  return `${env.CLOUDINARY_PRODUCT_FOLDER}/${categorySlug}`;
};

const addUploadedImages = async (payload, files = []) => {
  if (!files.length) return payload;

  const uploadedImages = await Promise.all(
    files.map((file) =>
      storeUploadedImage(file, {
        cloudinaryFolder: getProductUploadFolder(payload),
        localSubdirectory: "products",
      }),
    ),
  );
  payload.images = [...new Set([...(payload.images || []), ...uploadedImages])];
  payload.image = payload.image || payload.images[0] || "";
  return payload;
};

const validateProductPayload = (
  payload,
  { requireImages = false, requireCategories = false } = {},
) => {
  if (requireImages || payload.images !== undefined) {
    validateImageCount(payload.images, { requireMinimum: requireImages });
  }

  if (requireCategories) {
    if (!Array.isArray(payload.categories) || payload.categories.length === 0) {
      throw new ApiError(422, "At least one category is required");
    }
  }

  if (payload.accords) {
    validateAccordTotal(payload.accords);
  }
};

const syncProductBrandFields = async (
  payload,
  body = {},
) => {
  const hasBrandField = Object.prototype.hasOwnProperty.call(body, "brand");
  const hasBrandIdField = Object.prototype.hasOwnProperty.call(body, "brandId");

  if (!hasBrandField && !hasBrandIdField) {
    return payload;
  }

  const { brand, clearBrandId } = await resolveBrandFromProductInput({
    brandId: hasBrandIdField ? body.brandId : undefined,
    brandName: hasBrandField ? payload.brand : undefined,
  });

  if (clearBrandId) {
    payload.brandId = null;
    return payload;
  }

  if (brand) {
    payload.brandId = brand.id;
    payload.brand = brand.name;
    return payload;
  }

  if (hasBrandField) {
    payload.brandId = null;
  }

  return payload;
};

const mergeProductFilter = (filter, matcher) => {
  if (!matcher || !Object.keys(matcher).length) {
    return filter;
  }

  if (!Object.keys(filter).length) {
    return matcher;
  }

  return {
    $and: [filter, matcher],
  };
};

const buildCategoryQueryMatcher = async (categoryQuery = "") => {
  const rawCategory = String(categoryQuery || "").trim();

  if (!rawCategory) {
    return { _id: null };
  }

  try {
    const category = await resolveCategoryFromInput({
      categoryName: rawCategory,
      allowCreate: false,
    });

    return {
      categories: category._id,
    };
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return { _id: null };
    }

    throw error;
  }
};

const buildProductQueryFilter = async (query = {}) => {
  let filter = buildProductFilter(query);
  const brandId = String(query.brandId || "").trim();
  const categoryId = String(query.categoryId || "").trim();
  const categoryQuery = String(query.category || "").trim();
  const genderQuery = String(query.gender || "").trim();

  if (categoryId) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new ApiError(400, "Invalid category id");
    }

    filter = mergeProductFilter(filter, {
      categories: new mongoose.Types.ObjectId(categoryId),
    });
  } else if (categoryQuery) {
    filter = mergeProductFilter(filter, await buildCategoryQueryMatcher(categoryQuery));
  }

  if (genderQuery) {
    const normalizedGenderSlug = createCategorySlug(genderQuery);
    const genderMatcher = {
      $or: [
        { gender: { $regex: `^${escapeRegex(genderQuery)}$`, $options: "i" } },
        { categorySlugs: normalizedGenderSlug },
      ],
    };

    filter = mergeProductFilter(filter, genderMatcher);
  }

  if (!brandId) {
    return filter;
  }

  if (!mongoose.Types.ObjectId.isValid(brandId)) {
    throw new ApiError(400, "Invalid brand id");
  }

  const brand = await Brand.findById(brandId).select("name").lean();
  const brandFilter = brand
    ? {
        $or: [
          { brandId },
          {
            brand: {
              $regex: `^${escapeRegex(String(brand.name || "").trim())}$`,
              $options: "i",
            },
          },
        ],
      }
    : { brandId };

  if (!Object.keys(filter).length) {
    return brandFilter;
  }

  return {
    $and: [filter, brandFilter],
  };
};

const normalizeProductResponse = (product) => {
  const raw =
    typeof product?.toObject === "function"
      ? product.toObject({ virtuals: true })
      : product;

  if (!raw) return raw;

  const images = [
    ...parseImageField(raw.images),
    ...parseImageField(raw.image),
  ];
  const image = String(images[0] || raw.image || "").trim();
  const categoryIds = Array.isArray(raw.categoryIds)
    ? raw.categoryIds
    : Array.isArray(raw.categories)
      ? raw.categories.map((category) =>
          typeof category === "object" && category !== null
            ? category._id?.toString?.() || String(category._id || "")
            : String(category || ""),
        )
      : raw.categoryId
        ? [raw.categoryId]
        : [];
  const id = raw.id || raw._id?.toString?.() || raw._id;
  const { __v, ...cleanProduct } = raw;

  const categoryNames = Array.isArray(raw.categoryNames)
    ? raw.categoryNames.map((name) => String(name || "").trim()).filter(Boolean)
    : raw.category
      ? [String(raw.category).trim()]
      : [];
  const categorySlugs = Array.isArray(raw.categorySlugs)
    ? raw.categorySlugs.map((slug) => String(slug || "").trim()).filter(Boolean)
    : raw.categorySlug
      ? [String(raw.categorySlug).trim()]
      : categoryNames.map((name) => createCategorySlug(name)).filter(Boolean);
  const primaryCategoryId = String(raw.primaryCategory || categoryIds[0] || "").trim() || null;

  return {
    ...cleanProduct,
    id,
    brandId: raw.brandId ? String(raw.brandId) : null,
    categories: categoryIds,
    categoryIds,
    categoryNames,
    categorySlugs,
    primaryCategory: primaryCategoryId,
    category: categoryNames[0] || "Uncategorized",
    categoryId: primaryCategoryId,
    categorySlug: categorySlugs[0] || "",
    image,
    images: [...new Set(images)],
    notes:
      Array.isArray(raw.notes) && raw.notes.length
        ? raw.notes
        : [
            ...(Array.isArray(raw.topNotes) ? raw.topNotes : []),
            ...(Array.isArray(raw.middleNotes) ? raw.middleNotes : []),
            ...(Array.isArray(raw.baseNotes) ? raw.baseNotes : []),
          ].filter(Boolean),
    seasons: Array.isArray(raw.seasons) ? raw.seasons : [],
    season:
      Array.isArray(raw.season) && raw.season.length
        ? raw.season
        : raw.seasons || [],
    timeOfDay: raw.timeOfDay || raw.usage || "",
    bestTime: Array.isArray(raw.bestTime) ? raw.bestTime : [],
    sizes: Array.isArray(raw.sizes) ? raw.sizes : [],
    isBestseller: Boolean(raw.isBestseller),
    isLatest: Boolean(raw.isLatest),
    bestsellerOrder: Number(raw.bestsellerOrder || 0),
    displayOrder: Number(raw.bestsellerOrder || 0),
  };
};

const enrichProductsForResponse = async (products = []) => {
  const normalizedProducts = products.map(normalizeProductResponse);
  const withBrands = await attachBrandDetails(normalizedProducts);
  return attachCategoryDetails(withBrands);
};

export const getProducts = asyncHandler(async (req, res) => {
  const cacheKey = getCacheKey(req.query);
  const cachedPayload = await getCachedProductList(cacheKey);

  if (cachedPayload) {
    return res.json({ success: true, message: "Products loaded successfully", data: cachedPayload });
  }

  const filter = await buildProductQueryFilter(req.query);
  const sort = buildSort(req.query.sort);
  const shouldPaginate =
    req.query.page !== undefined || req.query.limit !== undefined;

  if (!shouldPaginate) {
    const products = await Product.find(filter)
      .sort(sort)
      .lean({ virtuals: true });
    const payload = await enrichProductsForResponse(products);

    await setCachedProductList(cacheKey, payload);
    return res.json({ success: true, message: "Products loaded successfully", data: payload });
  }

  const { page, limit, skip } = getPagination(req.query);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),
    Product.countDocuments(filter),
  ]);

  const payload = {
    products: await enrichProductsForResponse(products),
    pagination: createPaginationMeta({ page, limit, total }),
  };

  await setCachedProductList(cacheKey, payload);
  res.json({ success: true, message: "Products loaded successfully", data: payload });
});

export const getProductById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid product id");
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const [payload] = await enrichProductsForResponse([product]);

  res.json({ success: true, message: "Product loaded successfully", data: payload });
});

export const subscribeToProductAvailability = asyncHandler(async (req, res) => {
  const result = await createBackInStockSubscription({
    productId: req.params.id,
    email: req.body.email,
    phone: req.body.phone,
    req,
  });

  res.status(result.alreadySubscribed ? 200 : 201).json({
    success: true,
    message: result.message,
    data: {
      alreadySubscribed: result.alreadySubscribed,
      notification: result.notification,
      message: result.message,
    },
  });
});

export const getBestsellerProducts = asyncHandler(async (_req, res) => {
  setNoStoreHeaders(res);
  debugBestseller("Fetching bestsellers from DB");
  const cacheKey = "products:bestsellers";
  const cachedPayload = await getCachedProductList(cacheKey);

  if (cachedPayload) {
    return res.json({ success: true, message: "Bestsellers loaded successfully", data: cachedPayload });
  }

  const products = await Product.find({ isBestseller: true })
    .sort({ bestsellerOrder: 1, updatedAt: -1, name: 1 })
    .lean({ virtuals: true });
  const payload = await enrichProductsForResponse(products);

  await setCachedProductList(cacheKey, payload);
  res.json({ success: true, message: "Bestsellers loaded successfully", data: payload });
});

export const getLatestProducts = asyncHandler(async (_req, res) => {
  const cacheKey = "products:latest";
  const cachedPayload = await getCachedProductList(cacheKey);

  if (cachedPayload) {
    return res.json({ success: true, message: "Latest products loaded successfully", data: cachedPayload });
  }

  const products = await Product.find({ isLatest: true })
    .sort({ createdAt: -1, updatedAt: -1, name: 1 })
    .limit(12)
    .lean({ virtuals: true });
  const payload = await enrichProductsForResponse(products);

  await setCachedProductList(cacheKey, payload);
  res.json({ success: true, message: "Latest products loaded successfully", data: payload });
});

export const createProduct = asyncHandler(async (req, res) => {
  const payload = buildProductPayload(req.body);
  await syncProductCategoryFields(payload, req.body, { allowCreate: false });
  await syncProductBrandFields(payload, req.body);
  await addUploadedImages(payload, req.productImageFiles || req.files);
  validateProductPayload(payload, {
    requireImages: true,
    requireCategories: true,
  });

  const product = await Product.create(payload);
  clearProductCache();
  const [response] = await enrichProductsForResponse([product]);

  res.status(201).json({ success: true, message: "Product created successfully", data: response });
});

export const bulkCreateProducts = asyncHandler(async (req, res) => {
  const products = Array.isArray(req.body.products) ? req.body.products : [];

  if (!products.length) {
    throw new ApiError(422, "At least one product row is required");
  }

  const result = await bulkImportProducts(products);

  if (result.createdCount > 0) {
    clearProductCache();
  }

  res.status(201).json({
    success: true,
    message: "Bulk product import completed",
    data: result,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid product id");
  }

  const existingProduct = await Product.findById(req.params.id).select(
    "name image images categories primaryCategory categoryNames categorySlugs stock",
  );

  if (!existingProduct) {
    throw new ApiError(404, "Product not found");
  }

  const payload = buildProductPayload(req.body);
  const uploadedImageFiles = req.productImageFiles || req.files || [];
  const retainedImages = getRetainedExistingImages(
    req.body,
    existingProduct.images?.length
      ? existingProduct.images
      : existingProduct.image
        ? [existingProduct.image]
        : [],
  );
  const hasImageUpdate = retainedImages !== undefined || uploadedImageFiles.length > 0;

  if (retainedImages !== undefined) {
    payload.images = retainedImages;
    payload.image = retainedImages[0] || "";
  } else if (uploadedImageFiles.length > 0) {
    payload.images = existingProduct.images?.length
      ? existingProduct.images
      : existingProduct.image
        ? [existingProduct.image]
        : [];
    payload.image = payload.images[0] || "";
  }

  await syncProductCategoryFields(payload, req.body, { allowCreate: false });
  await syncProductBrandFields(payload, req.body);

  if (payload.categories === undefined) {
    payload.categories = existingProduct.categories;
    payload.primaryCategory = existingProduct.primaryCategory;
    payload.categoryNames = existingProduct.categoryNames;
    payload.categorySlugs = existingProduct.categorySlugs;
  }

  await addUploadedImages(payload, uploadedImageFiles);

  validateProductPayload(payload, { requireImages: hasImageUpdate });

  const product = await Product.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  const oldStock = Number(existingProduct.stock || 0);
  const newStock = Number(product.stock || 0);

  if (oldStock === 0 && newStock > 0) {
    queueBackInStockNotificationsForProduct(product).catch((error) => {
      logger.error("Back in stock notification trigger failed", {
        productId: String(product._id),
        error: error.message,
      });
    });
  }

  clearProductCache();
  const [response] = await enrichProductsForResponse([product]);

  res.json({ success: true, message: "Product updated successfully", data: response });
});

export const updateProductBestseller = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid product id");
  }

  const hasStatusField = req.body.isBestseller !== undefined;
  const hasOrderField = getRequestedBestsellerOrder(req.body) !== undefined;

  if (!hasStatusField && !hasOrderField) {
    throw new ApiError(
      400,
      "Provide isBestseller or bestsellerOrder to update bestseller settings",
    );
  }

  const product = await persistBestsellerState(req.params.id, req.body);

  clearProductCache();
  const [response] = await enrichProductsForResponse([product]);

  res.json({ success: true, message: "Bestseller updated successfully", data: response });
});

export const removeProductBestseller = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid product id");
  }

  const product = await persistBestsellerState(req.params.id, {
    isBestseller: false,
  });

  clearProductCache();
  const [response] = await enrichProductsForResponse([product]);

  res.json({ success: true, message: "Bestseller removed successfully", data: response });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid product id");
  }

  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.isBestseller) {
    await reindexBestsellerProducts();
  }

  clearProductCache();
  res.json({ success: true, message: "Product deleted successfully", data: { id: req.params.id } });
});

export const getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold = Number.parseInt(req.query.threshold, 10) || 10;
  const products = await Product.find({ stock: { $lt: threshold } })
    .sort({ stock: 1, name: 1 })
    .lean({ virtuals: true });
  const payload = await enrichProductsForResponse(products);

  res.json({
    success: true,
    message: "Low stock products loaded successfully",
    data: {
      threshold,
      products: payload,
    },
  });
});
