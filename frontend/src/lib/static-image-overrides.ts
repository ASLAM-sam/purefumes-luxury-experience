import type { Product } from "@/data/products";
import { cloudinaryStaticImages } from "@/lib/cloudinary-static-images";

const normalizeKey = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, "-");

const productImageOverrides = [
  {
    match: ["9pm", "9-pm", "afnan-9pm", "afnan-9-pm"],
    image: cloudinaryStaticImages.products.ninePm,
    images: [cloudinaryStaticImages.products.ninePm],
  },
  {
    match: ["pour-homme", "pour-homme-edt", "versace-pour-homme"],
    image: cloudinaryStaticImages.products.pourHomme,
    images: [cloudinaryStaticImages.products.pourHomme],
  },
  {
    match: ["the-kingdom-man", "kingdom-man", "lattafa-the-kingdom-man"],
    image: cloudinaryStaticImages.products.kingdomMan,
    images: [cloudinaryStaticImages.products.kingdomMan],
  },
];

const createFallbackProduct = ({
  id,
  name,
  brand,
  price,
  image,
}: {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
}): Product => ({
  id,
  name,
  brand,
  brandId: null,
  brandDetails: null,
  categories: [],
  categoryIds: [],
  categoryNames: [],
  categorySlugs: [],
  primaryCategory: null,
  category: "Featured",
  categoryId: null,
  categorySlug: "featured",
  categoryDetails: null,
  price,
  gender: "Men",
  rating: 0,
  reviewCount: 0,
  reviewsCount: 0,
  image,
  images: [image],
  description: "",
  notes: [],
  topNotes: [],
  middleNotes: [],
  baseNotes: [],
  accords: [],
  sillage: "",
  usage: "Day & Night",
  timeOfDay: "Day & Night",
  bestTime: ["Day", "Night"],
  season: ["Spring", "Summer", "Autumn", "Winter"],
  seasons: ["Spring", "Summer", "Autumn", "Winter"],
  sizes: [{ size: "Standard", price }],
  stock: 1,
  isBestseller: true,
  isLatest: true,
  bestsellerOrder: 0,
  displayOrder: 0,
});

export const storefrontFallbackProducts: Product[] = [
  createFallbackProduct({
    id: "fallback-kingdom-man",
    name: "THE KINGDOM MAN",
    brand: "LATTAFA",
    price: 2626,
    image: cloudinaryStaticImages.products.kingdomMan,
  }),
  createFallbackProduct({
    id: "fallback-pour-homme-edt",
    name: "pour homme edt",
    brand: "AZZARO",
    price: 7299,
    image: cloudinaryStaticImages.products.pourHomme,
  }),
  createFallbackProduct({
    id: "fallback-9pm",
    name: "9 pm",
    brand: "ARD AL ZAAFARAN",
    price: 8678,
    image: cloudinaryStaticImages.products.ninePm,
  }),
];

export const applyProductImageOverride = (product: Product): Product => {
  const productImages = (product.images || []).filter(Boolean);

  if (productImages.length || product.image) {
    return {
      ...product,
      images: productImages.length ? productImages : product.image ? [product.image] : [],
    };
  }

  const productKeys = [
    normalizeKey(product.name),
    normalizeKey(product.brand ? `${product.brand} ${product.name}` : product.name),
  ];
  const override = productImageOverrides.find(({ match }) =>
    productKeys.some((key) =>
      match.some((candidate) => key === candidate || key.includes(candidate)),
    ),
  );

  if (!override) {
    return product;
  }

  return {
    ...product,
    image: override.image,
    images: override.images,
  };
};
