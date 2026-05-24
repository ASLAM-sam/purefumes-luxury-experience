import type { Category } from "@/data/categories";
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

export const storefrontFallbackCategories: Category[] = [
  {
    id: "designer",
    name: "Designer",
    slug: "designer",
    description: "Designer Indian fragrances",
    image: cloudinaryStaticImages.categoryCards.designer,
    icon: "",
    color: "#5b3a29",
    sortOrder: 1,
    displayOrder: 1,
    isActive: true,
    active: true,
    isDeleted: false,
    featured: true,
    productCount: 2,
  },
  {
    id: "middle-eastern",
    name: "Middle Eastern",
    slug: "middle-eastern",
    description: "This is Middle Eastern fragrances",
    image: cloudinaryStaticImages.categoryCards.middleEastern,
    icon: "",
    color: "#5b3a29",
    sortOrder: 2,
    displayOrder: 2,
    isActive: true,
    active: true,
    isDeleted: false,
    featured: true,
    productCount: 2,
  },
  {
    id: "niche",
    name: "Niche",
    slug: "niche",
    description: "Niche fragrances",
    image: cloudinaryStaticImages.categoryCards.niche,
    icon: "",
    color: "#5b3a29",
    sortOrder: 3,
    displayOrder: 3,
    isActive: true,
    active: true,
    isDeleted: false,
    featured: true,
    productCount: 0,
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

export const homeHeroSlides = [
  {
    id: "designer-perfumes",
    category: "Designer",
    heading: "Designer Perfumes",
    image: cloudinaryStaticImages.heroSlides.designer,
    link: "/category/designer",
  },
  {
    id: "middle-eastern-perfumes",
    category: "Middle Eastern",
    heading: "Middle Eastern Perfumes",
    image: cloudinaryStaticImages.heroSlides.middleEastern,
    link: "/category/middle-eastern",
  },
  {
    id: "niche-fragrances",
    category: "Niche",
    heading: "Niche Fragrances",
    image: cloudinaryStaticImages.heroSlides.niche,
    link: "/category/niche",
  },
  {
    id: "signature-oud",
    category: "Signature",
    heading: "Signature Oud",
    image: cloudinaryStaticImages.heroSlides.signature,
    link: "/shop",
  },
];

export const getStorefrontCategoryCardImage = (category: Pick<Category, "name" | "slug">) => {
  const keys = [normalizeKey(category.slug), normalizeKey(category.name)];

  if (keys.some((key) => key === "designer" || key.includes("designer"))) {
    return cloudinaryStaticImages.categoryCards.designer;
  }

  if (keys.some((key) => key === "middle-eastern" || key.includes("middle-eastern"))) {
    return cloudinaryStaticImages.categoryCards.middleEastern;
  }

  if (keys.some((key) => key === "niche" || key.includes("niche"))) {
    return cloudinaryStaticImages.categoryCards.niche;
  }

  return "";
};

export const applyProductImageOverride = (product: Product): Product => {
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

  const images = Array.from(
    new Set([...override.images, ...(product.images || [])].filter(Boolean)),
  );

  return {
    ...product,
    image: override.image,
    images,
  };
};
