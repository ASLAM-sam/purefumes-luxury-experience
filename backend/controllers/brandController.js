import mongoose from "mongoose";
import { ApiError, asyncHandler } from "../middlewares/errorMiddleware.js";
import { storeUploadedImage } from "../middlewares/uploadMiddleware.js";
import Brand, { normalizeBrandName } from "../models/Brand.js";
import Product from "../models/Product.js";
import {
  buildLinkedBrandFilter,
  normalizeBrandResponse,
} from "../utils/brandHelpers.js";
import { clearProductCache } from "./productController.js";
import { bulkImportBrands } from "../services/bulkBrandImportService.js";

const buildBrandPayload = (body = {}) => {
  const payload = {};

  ["name", "logo", "category"].forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] =
        typeof body[field] === "string" ? body[field].trim() : body[field];
    }
  });

  return payload;
};

const normalizePreviewProduct = (product) => {
  const images = Array.isArray(product.images)
    ? product.images.map((image) => String(image).trim()).filter(Boolean)
    : [];

  return {
    _id: product._id?.toString?.() || product._id,
    id: product.id || product._id?.toString?.() || "",
    name: String(product.name || "").trim(),
    brand: String(product.brand || "").trim(),
    brandId: product.brandId ? String(product.brandId) : null,
    category: String(product.category || "").trim(),
    image: String(images[0] || product.image || "").trim(),
    images,
    price: Number(product.price || 0),
  };
};

const enrichBrands = async (brands = []) => {
  const normalizedBrands = brands
    .map(normalizeBrandResponse)
    .filter(Boolean);

  if (!normalizedBrands.length) {
    return [];
  }

  const brandIds = normalizedBrands.map((brand) => brand.id).filter(Boolean);
  const brandNames = normalizedBrands.map((brand) => brand.name).filter(Boolean);
  const byId = new Map(normalizedBrands.map((brand) => [brand.id, brand]));
  const byNormalizedName = new Map(
    normalizedBrands.map((brand) => [normalizeBrandName(brand.name), brand]),
  );

  const products = await Product.find({
    $or: [
      { brandId: { $in: brandIds } },
      { brand: { $in: brandNames } },
    ],
  })
    .collation({ locale: "en", strength: 2 })
    .sort({ createdAt: -1 })
    .lean({ virtuals: true });

  const brandProducts = new Map(normalizedBrands.map((brand) => [brand.id, []]));

  products.forEach((product) => {
    const brandId = String(product.brandId || "").trim();
    const matchedBrand =
      byId.get(brandId) || byNormalizedName.get(normalizeBrandName(product.brand));

    if (!matchedBrand?.id) return;

    const current = brandProducts.get(matchedBrand.id) || [];
    current.push(product);
    brandProducts.set(matchedBrand.id, current);
  });

  return normalizedBrands.map((brand) => {
    const linkedProducts = brandProducts.get(brand.id) || [];

    return {
      ...brand,
      productCount: linkedProducts.length,
      previewProducts: linkedProducts.slice(0, 4).map(normalizePreviewProduct),
    };
  });
};

const enrichSingleBrand = async (brand) => {
  const [enrichedBrand] = await enrichBrands([brand]);
  return enrichedBrand || null;
};

const addUploadedLogo = async (payload, file) => {
  if (!file) return payload;

  payload.logo = await storeUploadedImage(file, {
    cloudinaryFolder: "purefumes-hyderabad/brands",
    localSubdirectory: "brands",
  });

  return payload;
};

const ensureBrandNameAvailable = async (name, excludeId) => {
  const normalizedName = normalizeBrandName(name);
  if (!normalizedName) return;

  const duplicate = await Brand.findOne({
    normalizedName,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  })
    .select("_id")
    .lean();

  if (duplicate) {
    throw new ApiError(409, "Brand name already exists");
  }
};

const syncProductsWithBrand = async (brand, previousName = "") => {
  const current = normalizeBrandResponse(brand);
  if (!current) return;

  const historicalNames =
    previousName &&
    normalizeBrandName(previousName) !== normalizeBrandName(current.name)
      ? [previousName]
      : [];

  await Product.updateMany(buildLinkedBrandFilter(current, historicalNames), {
    brandId: current.id,
    brand: current.name,
  });
};

export const getBrands = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.category) {
    filter.category = String(req.query.category).trim();
  }

  const brands = await Brand.find(filter)
    .sort({ createdAt: -1 })
    .lean({ virtuals: true });
  const enrichedBrands = await enrichBrands(brands);

  res.json({
    success: true,
    data: enrichedBrands,
  });
});

export const getBrandById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid brand id");
  }

  const brand = await Brand.findById(req.params.id).lean({ virtuals: true });

  if (!brand) {
    throw new ApiError(404, "Brand not found");
  }

  const enrichedBrand = await enrichSingleBrand(brand);

  res.json({ success: true, data: enrichedBrand });
});

export const createBrand = asyncHandler(async (req, res) => {
  const payload = buildBrandPayload(req.body);
  await addUploadedLogo(payload, req.file);

  if (!payload.name) {
    throw new ApiError(422, "Brand name is required");
  }

  if (!payload.category) {
    throw new ApiError(422, "Brand category is required");
  }

  await ensureBrandNameAvailable(payload.name);

  const brand = await Brand.create(payload);
  await syncProductsWithBrand(brand);
  clearProductCache();
  const enrichedBrand = await enrichSingleBrand(brand);

  res.status(201).json({
    success: true,
    data: enrichedBrand,
  });
});

export const bulkCreateBrands = asyncHandler(async (req, res) => {
  const brands = Array.isArray(req.body.brands) ? req.body.brands : [];

  if (!brands.length) {
    throw new ApiError(422, "At least one brand row is required");
  }

  const result = await bulkImportBrands(brands);

  if (result.createdCount > 0) {
    clearProductCache();
  }

  res.status(201).json({
    success: true,
    data: result,
  });
});

export const updateBrand = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid brand id");
  }

  const existingBrand = await Brand.findById(req.params.id);

  if (!existingBrand) {
    throw new ApiError(404, "Brand not found");
  }

  const payload = buildBrandPayload(req.body);
  await addUploadedLogo(payload, req.file);

  if (payload.name) {
    await ensureBrandNameAvailable(payload.name, req.params.id);
  }

  const brand = await Brand.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  if (!brand) {
    throw new ApiError(404, "Brand not found");
  }

  await syncProductsWithBrand(brand, existingBrand.name);
  clearProductCache();
  const enrichedBrand = await enrichSingleBrand(brand);

  res.json({
    success: true,
    data: enrichedBrand,
  });
});

export const deleteBrand = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid brand id");
  }

  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    throw new ApiError(404, "Brand not found");
  }

  const linkedProducts = await Product.countDocuments(buildLinkedBrandFilter(brand));

  if (linkedProducts > 0) {
    throw new ApiError(
      409,
      "Cannot delete a brand that is still linked to products",
    );
  }

  await brand.deleteOne();
  clearProductCache();

  res.json({ success: true, data: { id: req.params.id } });
});
