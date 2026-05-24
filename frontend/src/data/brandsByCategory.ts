import type { Brand } from "@/data/brands";

export type KnownBrandCategory = "middle-eastern" | "designer" | "niche";
export type BrandCategoryFilter = KnownBrandCategory | "all" | "";

export const brandsByCategory: Record<KnownBrandCategory, string[]> = {
  designer: [
    "Bentley",
    "BOSS",
    "Burberry",
    "Bvlgari",
    "CK",
    "Carolina Herrera",
    "Chanel",
    "Chopard",
    "Colours",
    "D&G",
    "Davidoff",
    "Diesel",
    "DIOR",
    "Dunhill",
    "Elizabeth Arden",
    "Ferragamo",
    "Ferrari",
    "Flavia",
    "Grandeur",
    "Gucci",
    "Hermes",
    "Jaguar",
    "Jimmy Choo",
    "Jovan",
    "JPG",
    "Lacoste",
    "Lalique",
    "Lancome",
    "Lomani",
    "Montblanc",
    "Moschino",
    "Nautica",
    "NIKE",
    "Paco Rabanne",
    "Polo",
    "Prada",
    "Tom Ford",
    "Tommy",
    "United Colors of Benetton",
    "Valentino",
    "Versace",
    "Victoria's",
    "Viktor&Rolf",
    "YSL",
  ],
  "middle-eastern": [
    "Ard Al Zafran",
    "Afnan",
    "Armaf",
    "Ahmed Al Maghribi",
    "Al Haramain",
    "Al Wataniah",
    "Albait",
    "Arabiyat",
    "Fragrance World",
    "Hamidi",
    "IBRAQ",
    "Khadlaj",
    "Lattafa",
    "Maison Alhambra",
    "Naseem",
    "Paris Corner",
    "Pendora Scents",
    "Rasasi",
    "Rayhaan",
    "Riiffs",
    "Rue Broka",
    "Swiss Arabian",
    "Zimaya",
  ],
  niche: ["Mancera", "Creed", "Xerjoff"],
};

const categoryOrder: KnownBrandCategory[] = ["designer", "middle-eastern", "niche"];

const normalizeText = (value = "") =>
  String(value || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

export const normalizeCategory = (category: unknown): BrandCategoryFilter => {
  const value = normalizeText(String(category || "").replace(/-/g, " "));

  if (!value) return "";
  if (value === "all" || value.includes("all fragrance")) return "all";
  if (value.includes("designer")) return "designer";
  if (value.includes("middle")) return "middle-eastern";
  if (value.includes("niche")) return "niche";

  return "";
};

export const normalizeBrandName = (brand: unknown) => normalizeText(String(brand || ""));

export const getBrandsForCategory = (category: unknown): string[] => {
  const normalizedCategory = normalizeCategory(category);

  if (normalizedCategory === "all") {
    return categoryOrder.flatMap((categoryKey) => brandsByCategory[categoryKey]);
  }

  if (!normalizedCategory) {
    return [];
  }

  return brandsByCategory[normalizedCategory];
};

const brandCategoryByName = new Map<string, KnownBrandCategory>();

categoryOrder.forEach((category) => {
  brandsByCategory[category].forEach((brandName) => {
    brandCategoryByName.set(normalizeBrandName(brandName), category);
  });
});

const getBrandSortIndex = (brand: Brand, category: BrandCategoryFilter) => {
  const brandName = normalizeBrandName(brand.name);
  const list = getBrandsForCategory(category);
  const index = list.findIndex((name) => normalizeBrandName(name) === brandName);

  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

export const getMappedBrandCategory = (brandName: unknown): BrandCategoryFilter =>
  brandCategoryByName.get(normalizeBrandName(brandName)) || "";

export const isBrandAllowedForCategory = (brand: Brand, category: unknown) => {
  const normalizedCategory = normalizeCategory(category);
  const mappedCategory = getMappedBrandCategory(brand.name);
  const brandCategory = normalizeCategory(brand.category);

  if (normalizedCategory === "all") {
    return Boolean(mappedCategory || brandCategory);
  }

  if (!normalizedCategory) {
    return false;
  }

  return mappedCategory === normalizedCategory || brandCategory === normalizedCategory;
};

export const filterBrandsForCategory = (brands: Brand[], category: unknown) => {
  const normalizedCategory = normalizeCategory(category);

  if (!normalizedCategory) {
    return [];
  }

  return [...brands]
    .filter((brand) => isBrandAllowedForCategory(brand, normalizedCategory))
    .sort((left, right) => {
      const indexDelta =
        getBrandSortIndex(left, normalizedCategory) - getBrandSortIndex(right, normalizedCategory);

      return indexDelta !== 0 ? indexDelta : left.name.localeCompare(right.name);
    });
};
