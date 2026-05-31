import type { Brand } from "@/data/brands";
import type { Category } from "@/data/categories";

type CategoryLike =
  | Pick<Category, "id" | "_id" | "name" | "slug">
  | string
  | null
  | undefined;

export const createCatalogSlug = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export const getCategoryId = (category: CategoryLike) => {
  if (!category || typeof category === "string") return "";
  return String(category.id || category._id || "").trim();
};

export const getCategorySlug = (category: CategoryLike) => {
  if (!category) return "";
  if (typeof category === "string") return createCatalogSlug(category);
  return createCatalogSlug(category.slug || category.name || "");
};

export const getBrandCategoryId = (brand: Brand) =>
  String(brand.categoryId || "").trim();

export const getBrandCategorySlug = (brand: Brand) =>
  createCatalogSlug(brand.categorySlug || brand.category || brand.categoryName || "");

export const brandBelongsToCategory = (brand: Brand, category: CategoryLike) => {
  if (!category || category === "all") return true;

  const categoryId = getCategoryId(category);
  const brandCategoryId = getBrandCategoryId(brand);

  if (categoryId && brandCategoryId) {
    return categoryId === brandCategoryId;
  }

  const categorySlug = getCategorySlug(category);
  const brandCategorySlug = getBrandCategorySlug(brand);

  return Boolean(categorySlug && brandCategorySlug && categorySlug === brandCategorySlug);
};

export const filterBrandsByCategory = (brands: Brand[], category: CategoryLike) =>
  [...brands]
    .filter((brand) => brandBelongsToCategory(brand, category))
    .sort((left, right) => left.name.localeCompare(right.name));
