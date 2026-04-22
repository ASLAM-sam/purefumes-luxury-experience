import mongoose from "mongoose";
import Product from "../models/Product.js";
import {
  buildProductFilter,
  buildSort,
  createPaginationMeta,
  getPagination,
} from "../utils/apiFeatures.js";
import { ApiError, asyncHandler } from "../middlewares/errorMiddleware.js";
import { storeUploadedImage } from "../middlewares/uploadMiddleware.js";

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

  ["price", "stock", "originalPrice"].forEach((field) => {
    if (body[field] !== undefined && body[field] !== "") {
      const value = Number(body[field]);

      if (!Number.isFinite(value)) {
        throw new ApiError(400, `${field} must be a valid number`);
      }

      payload[field] = field === "stock" ? Math.trunc(value) : value;
    }
  });

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
  };
};

export const getProducts = asyncHandler(async (req, res) => {
  const cacheKey = getCacheKey(req.query);
  const cachedPayload = getCachedProductList(cacheKey);

  if (cachedPayload) {
    return res.json({ success: true, data: cachedPayload });
  }

  const filter = buildProductFilter(req.query);
  const sort = buildSort(req.query.sort);
  const shouldPaginate =
    req.query.page !== undefined || req.query.limit !== undefined;

  if (!shouldPaginate) {
    const products = await Product.find(filter)
      .sort(sort)
      .lean({ virtuals: true });
    const payload = products.map(normalizeProductResponse);

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
    products: products.map(normalizeProductResponse),
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

  res.json({ success: true, data: normalizeProductResponse(product) });
});

export const createProduct = asyncHandler(async (req, res) => {
  const payload = buildProductPayload(req.body);
  await addUploadedImages(payload, req.files);
  validateProductPayload(payload, {
    requireImages: true,
    requireAccords: true,
  });

  const product = await Product.create(payload);
  clearProductCache();

  res
    .status(201)
    .json({ success: true, data: normalizeProductResponse(product) });
});

export const updateProduct = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid product id");
  }

  const payload = buildProductPayload(req.body, { isUpdate: true });
  await addUploadedImages(payload, req.files);
  validateProductPayload(payload);

  const product = await Product.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  clearProductCache();
  res.json({ success: true, data: normalizeProductResponse(product) });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid product id");
  }

  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  clearProductCache();
  res.json({ success: true, data: { id: req.params.id } });
});

export const getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold = Number.parseInt(req.query.threshold, 10) || 10;
  const products = await Product.find({ stock: { $lt: threshold } })
    .sort({ stock: 1, name: 1 })
    .lean({ virtuals: true });

  res.json({
    success: true,
    data: {
      threshold,
      products: products.map(normalizeProductResponse),
    },
  });
});
