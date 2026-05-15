import mongoose from "mongoose";
import { ApiError } from "../middlewares/errorMiddleware.js";
import Brand, { normalizeBrandName } from "../models/Brand.js";
import { escapeRegex } from "./apiFeatures.js";

export const getBrandFallbackLetter = (name = "") =>
  String(name || "").trim().charAt(0).toUpperCase() || "#";

export const normalizeBrandResponse = (brand) => {
  const raw =
    typeof brand?.toObject === "function"
      ? brand.toObject({ virtuals: true })
      : brand;

  if (!raw) return null;

  const id = raw.id || raw._id?.toString?.() || raw._id;
  const { __v, normalizedName, ...cleanBrand } = raw;

  return {
    ...cleanBrand,
    _id: raw._id?.toString?.() || raw._id,
    id: String(id || ""),
    logo: String(raw.logo || "").trim(),
    fallbackLetter: getBrandFallbackLetter(raw.name),
  };
};

export const buildBrandNameMatcher = (name) => ({
  $regex: `^${escapeRegex(String(name || "").trim())}$`,
  $options: "i",
});

export const buildLinkedBrandFilter = (brand, extraNames = []) => {
  const names = [brand?.name, ...extraNames]
    .map((value) => String(value || "").trim())
    .filter(Boolean);
  const uniqueNames = [...new Set(names)];
  const matchers = uniqueNames.map((name) => ({ brand: buildBrandNameMatcher(name) }));

  return {
    $or: [{ brandId: brand._id }, ...matchers],
  };
};

export const resolveBrandFromProductInput = async ({ brandId, brandName }) => {
  const normalizedBrandId = String(brandId || "").trim();

  if (brandId !== undefined) {
    if (!normalizedBrandId) {
      return { brand: null, clearBrandId: true };
    }

    if (!mongoose.Types.ObjectId.isValid(normalizedBrandId)) {
      throw new ApiError(400, "Invalid brand id");
    }

    const brand = await Brand.findById(normalizedBrandId).lean({ virtuals: true });

    if (!brand) {
      throw new ApiError(404, "Brand not found");
    }

    return { brand: normalizeBrandResponse(brand), clearBrandId: false };
  }

  const normalizedName = normalizeBrandName(brandName);
  if (!normalizedName) {
    return { brand: null, clearBrandId: false };
  }

  const brand = await Brand.findOne({ normalizedName }).lean({ virtuals: true });

  return { brand: normalizeBrandResponse(brand), clearBrandId: false };
};

export const attachBrandDetails = async (products = []) => {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }

  const brandIds = [];
  const brandNames = [];

  products.forEach((product) => {
    const brandId = String(product?.brandId || "").trim();
    const normalizedName = normalizeBrandName(product?.brand);

    if (brandId) {
      brandIds.push(brandId);
    }

    if (normalizedName) {
      brandNames.push(normalizedName);
    }
  });

  const brandLookupFilter = [];

  if (brandIds.length) {
    brandLookupFilter.push({ _id: { $in: [...new Set(brandIds)] } });
  }

  if (brandNames.length) {
    brandLookupFilter.push({ normalizedName: { $in: [...new Set(brandNames)] } });
  }

  const brands = brandLookupFilter.length
    ? await Brand.find({ $or: brandLookupFilter }).lean({ virtuals: true })
    : [];

  const byId = new Map();
  const byName = new Map();

  brands.forEach((brand) => {
    const normalized = normalizeBrandResponse(brand);
    if (!normalized) return;

    if (normalized.id) {
      byId.set(normalized.id, normalized);
    }

    byName.set(normalizeBrandName(normalized.name), normalized);
  });

  return products.map((product) => {
    const normalizedBrandId = String(product?.brandId || "").trim();
    const brandMatch =
      byId.get(normalizedBrandId) || byName.get(normalizeBrandName(product?.brand));

    return {
      ...product,
      brandId: normalizedBrandId || brandMatch?.id || null,
      brandDetails: brandMatch || null,
    };
  });
};
