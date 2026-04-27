export type BrandCategory = "middle-eastern" | "designer" | "niche";

export type BrandPreviewProduct = {
  _id?: string;
  id: string;
  name: string;
  brand: string;
  brandId?: string | null;
  category: string;
  image: string;
  images: string[];
  price?: number;
};

export type Brand = {
  _id?: string;
  id: string;
  name: string;
  logo: string;
  fallbackLetter?: string;
  category: BrandCategory;
  productCount?: number;
  previewProducts?: BrandPreviewProduct[];
  createdAt?: string;
  updatedAt?: string;
};

export const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const groupBrandsByLetter = (brands: string[]) =>
  brands.reduce<Record<string, string[]>>((acc, brand) => {
    const letter = brand[0]?.toUpperCase();
    if (!letter) return acc;
    (acc[letter] ||= []).push(brand);
    return acc;
  }, {});
