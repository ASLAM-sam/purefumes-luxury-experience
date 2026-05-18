import type { Category } from "@/data/categories";

const genderCategoryPattern = /(^|\s)(men|mens|women|womens|unisex)(\s|$)/;

const normalizeCategoryValue = (value = "") =>
  value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const isGenderCategory = (category: Pick<Category, "name" | "slug">) => {
  const name = normalizeCategoryValue(category.name);
  const slug = normalizeCategoryValue(category.slug);

  return genderCategoryPattern.test(name) || genderCategoryPattern.test(slug);
};

export const filterStorefrontCategories = (categories: Category[]) =>
  categories.filter((category) => category.isActive && !category.isDeleted && !isGenderCategory(category));
