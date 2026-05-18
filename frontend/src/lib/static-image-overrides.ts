import type { Category } from "@/data/categories";
import type { Product } from "@/data/products";
import ninePmImage from "@/assets/9pm.jpeg?url";
import ninePmAltImage from "@/assets/9pm_2.jpeg?url";
import designerCardImage from "@/assets/cat-designer.jpg?url";
import middleEasternCardImage from "@/assets/cat-middle-eastern.jpg?url";
import nicheCardImage from "@/assets/cat-niche.jpg?url";
import pourHommeImage from "@/assets/pour homme.webp?url";
import slide1Image from "@/assets/slide1.jpeg?url";
import slide2Image from "@/assets/slide2.jpeg?url";
import slide3Image from "@/assets/slide3.jpeg?url";
import slide4Image from "@/assets/slide4.jpg?url";
import kingdomManImage from "@/assets/the kingdom man.jpg?url";

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
    image: ninePmImage,
    images: [ninePmImage, ninePmAltImage],
  },
  {
    match: ["pour-homme", "pour-homme-edt", "versace-pour-homme"],
    image: pourHommeImage,
    images: [pourHommeImage],
  },
  {
    match: ["the-kingdom-man", "kingdom-man", "lattafa-the-kingdom-man"],
    image: kingdomManImage,
    images: [kingdomManImage],
  },
];

export const homeHeroSlides = [
  {
    id: "designer-perfumes",
    category: "Designer",
    heading: "Designer Perfumes",
    image: slide1Image,
    link: "/category/designer",
  },
  {
    id: "middle-eastern-perfumes",
    category: "Middle Eastern",
    heading: "Middle Eastern Perfumes",
    image: slide2Image,
    link: "/category/middle-eastern",
  },
  {
    id: "niche-fragrances",
    category: "Niche",
    heading: "Niche Fragrances",
    image: slide3Image,
    link: "/category/niche",
  },
  {
    id: "signature-oud",
    category: "Signature",
    heading: "Signature Oud",
    image: slide4Image,
    link: "/shop",
  },
];

export const getStorefrontCategoryCardImage = (category: Pick<Category, "name" | "slug">) => {
  const keys = [normalizeKey(category.slug), normalizeKey(category.name)];

  if (keys.some((key) => key === "designer" || key.includes("designer"))) {
    return designerCardImage;
  }

  if (keys.some((key) => key === "middle-eastern" || key.includes("middle-eastern"))) {
    return middleEasternCardImage;
  }

  if (keys.some((key) => key === "niche" || key.includes("niche"))) {
    return nicheCardImage;
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
