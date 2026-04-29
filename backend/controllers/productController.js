import mongoose from "mongoose";
import Brand from "../models/Brand.js";
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
import { bulkImportProducts } from "../services/bulkProductImportService.js";

const PRODUCT_CACHE_TTL_MS = 30 * 1000;
const PRODUCT_CACHE_MAX_KEYS = 100;
const productListCache = new Map();

export const clearProductCache = () => productListCache.clear();

const getCacheKey = (query) => {
  const sortedEntries = Object.entries(query).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  return JSON.stringify(sortedEntries);
};

const getCachedProductList = (key) => {
  const cached = productListCache.get(key);

  if (!cached || Date.now() - cached.createdAt > PRODUCT_CACHE_TTL_MS) {
    productListCache.delete(key);
    return null;
  }

  return cached.payload;
};

const setCachedProductList = (key, payload) => {
  if (productListCache.size >= PRODUCT_CACHE_MAX_KEYS) {
    const firstKey = productListCache.keys().next().value;
    productListCache.delete(firstKey);
  }

  productListCache.set(key, {
    createdAt: Date.now(),
    payload,
  });
};

const setNoStoreHeaders = (res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
};

const debugBestseller = (...args) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("[bestsellers]", ...args);
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

const normalizeImagesFromBody = (body) => {
  const images = [
    ...parseImageField(body.images),
    ...parseImageField(body.image),
  ];
  return [...new Set(images)];
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
    throw new ApiError(400, "Accords required");
  }

  const total = accords.reduce(
    (sum, accord) => sum + Number(accord.percentage || 0),
    0,
  );

  if (Math.round(total * 100) !== 10000) {
    throw new ApiError(400, "Accords must sum to 100");
  }
};

const validateExactlyThreeImages = (images = []) => {
  const normalizedImages = Array.isArray(images)
    ? images.map((image) => String(image).trim()).filter(Boolean)
    : [];

  if (normalizedImages.length !== 3) {
    throw new ApiError(400, "Exactly 3 images required");
  }
};

const buildProductPayload = (body, { isUpdate = false } = {}) => {
  const payload = {};
  const directFields = [
    "name",
    "brand",
    "category",
    "description",
    "longevity",
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
          : value;
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

  try {
    [
      "notes",
      "topNotes",
      "middleNotes",
      "baseNotes",
      "season",
      "seasons",
      "bestTime",
    ].forEach((field) => {
      const parsed = parseArrayField(body[field]);
      if (parsed !== undefined) payload[field] = parsed;
    });

    const parsedAccords = parseJsonArrayField(body.accords);
    if (parsedAccords !== undefined)
      payload.accords = normalizeAccordInput(parsedAccords);

    ["sizes"].forEach((field) => {
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

  if (payload.season?.length) {
    payload.seasons = payload.seasons?.length
      ? payload.seasons
      : payload.season;
  }

  if (payload.timeOfDay && !payload.usage) {
    payload.usage = payload.timeOfDay;
  }

  let bodyImages = [];
  try {
    bodyImages = normalizeImagesFromBody(body);
  } catch (_error) {
    throw new ApiError(400, "images must be a valid string or JSON array");
  }
  if (
    bodyImages.length > 0 ||
    body.image !== undefined ||
    body.images !== undefined
  ) {
    payload.image = bodyImages[0] || "";
    payload.images = bodyImages;
  }

  if (!payload.price && payload.sizes?.length && payload.sizes[0]?.price) {
    payload.price = Number(payload.sizes[0].price);
  }

  if (payload.isBestseller === false && payload.bestsellerOrder === undefined) {
    payload.bestsellerOrder = 0;
  }

  return payload;
};

const addUploadedImages = async (payload, files = []) => {
  if (!files.length) return payload;

  const uploadedImages = await Promise.all(
    files.map((file) => storeUploadedImage(file)),
  );
  payload.images = [...new Set([...(payload.images || []), ...uploadedImages])];
  payload.image = payload.image || payload.images[0] || "";
  return payload;
};

const validateProductPayload = (
  payload,
  { requireImages = false, requireAccords = false } = {},
) => {
  if (requireImages || payload.images !== undefined) {
    validateExactlyThreeImages(payload.images);
  }

  if (requireAccords || payload.accords !== undefined) {
    validateAccordTotal(payload.accords || []);
  }
};

const PRODUCT_TO_BRAND_CATEGORY = {
  "Middle Eastern": "middle-eastern",
  Designer: "designer",
  Niche: "niche",
};

const syncProductBrandFields = async (
  payload,
  body = {},
  { productCategory } = {},
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
    const expectedBrandCategory = PRODUCT_TO_BRAND_CATEGORY[productCategory];

    if (expectedBrandCategory && brand.category !== expectedBrandCategory) {
      throw new ApiError(
        400,
        "Selected brand does not match the product category",
      );
    }

    payload.brandId = brand.id;
    payload.brand = brand.name;
    return payload;
  }

  if (hasBrandField) {
    payload.brandId = null;
  }

  return payload;
};

const buildProductQueryFilter = async (query = {}) => {
  const filter = buildProductFilter(query);
  const brandId = String(query.brandId || "").trim();

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

  const images = Array.isArray(raw.images)
    ? raw.images.map((image) => String(image).trim()).filter(Boolean)
    : [];
  const image = String(images[0] || raw.image || "").trim();
  const id = raw.id || raw._id?.toString?.() || raw._id;
  const { __v, ...cleanProduct } = raw;

  return {
    ...cleanProduct,
    id,
    brandId: raw.brandId ? String(raw.brandId) : null,
    image,
    images: [...new Set(images)],
    topNotes: Array.isArray(raw.topNotes) ? raw.topNotes : [],
    middleNotes: Array.isArray(raw.middleNotes) ? raw.middleNotes : [],
    baseNotes: Array.isArray(raw.baseNotes) ? raw.baseNotes : [],
    accords: Array.isArray(raw.accords) ? raw.accords : [],
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
    bestsellerOrder: Number(raw.bestsellerOrder || 0),
    displayOrder: Number(raw.bestsellerOrder || 0),
  };
};

export const getProducts = asyncHandler(async (req, res) => {
  const cacheKey = getCacheKey(req.query);
  const cachedPayload = getCachedProductList(cacheKey);

  if (cachedPayload) {
    return res.json({ success: true, data: cachedPayload });
  }

  const filter = await buildProductQueryFilter(req.query);
  const sort = buildSort(req.query.sort);
  const shouldPaginate =
    req.query.page !== undefined || req.query.limit !== undefined;

  if (!shouldPaginate) {
    const products = await Product.find(filter)
      .sort(sort)
      .lean({ virtuals: true });
    const payload = await attachBrandDetails(products.map(normalizeProductResponse));

    setCachedProductList(cacheKey, payload);
    return res.json({ success: true, data: payload });
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
    products: await attachBrandDetails(products.map(normalizeProductResponse)),
    pagination: createPaginationMeta({ page, limit, total }),
  };

  setCachedProductList(cacheKey, payload);
  res.json({ success: true, data: payload });
});

export const getProductById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid product id");
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const [payload] = await attachBrandDetails([normalizeProductResponse(product)]);

  res.json({ success: true, data: payload });
});

export const getBestsellerProducts = asyncHandler(async (_req, res) => {
  setNoStoreHeaders(res);
  debugBestseller("Fetching bestsellers from DB");

  const products = await Product.find({ isBestseller: true })
    .sort({ bestsellerOrder: 1, updatedAt: -1, name: 1 })
    .lean({ virtuals: true });
  const payload = await attachBrandDetails(products.map(normalizeProductResponse));

  res.json({ success: true, data: payload });
});

export const createProduct = asyncHandler(async (req, res) => {
  const payload = buildProductPayload(req.body);
  await addUploadedImages(payload, req.files);
  await syncProductBrandFields(payload, req.body, {
    productCategory: payload.category,
  });
  validateProductPayload(payload, {
    requireImages: true,
    requireAccords: true,
  });

  const product = await Product.create(payload);
  clearProductCache();
  const [response] = await attachBrandDetails([normalizeProductResponse(product)]);

  res.status(201).json({ success: true, data: response });
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
    data: result,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid product id");
  }

  const existingProduct = await Product.findById(req.params.id).select("category");

  if (!existingProduct) {
    throw new ApiError(404, "Product not found");
  }

  const payload = buildProductPayload(req.body, { isUpdate: true });
  await addUploadedImages(payload, req.files);
  await syncProductBrandFields(payload, req.body, {
    productCategory: payload.category || existingProduct.category,
  });
  validateProductPayload(payload);

  const product = await Product.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  clearProductCache();
  const [response] = await attachBrandDetails([normalizeProductResponse(product)]);

  res.json({ success: true, data: response });
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
  const [response] = await attachBrandDetails([normalizeProductResponse(product)]);

  res.json({ success: true, data: response });
});

export const removeProductBestseller = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid product id");
  }

  const product = await persistBestsellerState(req.params.id, {
    isBestseller: false,
  });

  clearProductCache();
  const [response] = await attachBrandDetails([normalizeProductResponse(product)]);

  res.json({ success: true, data: response });
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
  res.json({ success: true, data: { id: req.params.id } });
});

export const getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold = Number.parseInt(req.query.threshold, 10) || 10;
  const products = await Product.find({ stock: { $lt: threshold } })
    .sort({ stock: 1, name: 1 })
    .lean({ virtuals: true });
  const payload = await attachBrandDetails(products.map(normalizeProductResponse));

  res.json({
    success: true,
    data: {
      threshold,
      products: payload,
    },
  });
});
