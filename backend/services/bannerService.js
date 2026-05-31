import Banner from "../models/Banner.js";
import logger from "../config/logger.js";

export const DEFAULT_BANNERS = [
  {
    title: "Signature Fragrances",
    subtitle: "Flat 50% Off on Premium Scents",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=80",
    buttonText: "Shop Now",
    link: "/shop",
    order: 1,
    isActive: true,
  },
  {
    title: "Oud & Exotic Blends",
    subtitle: "Authentic Oud & Exotic Blends",
    image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1600&q=80",
    buttonText: "Explore",
    link: "/shop",
    order: 2,
    isActive: true,
  },
  {
    title: "Rare Fragrances",
    subtitle: "Exclusive Rare Fragrances",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1600&q=80",
    buttonText: "Discover",
    link: "/shop",
    order: 3,
    isActive: true,
  },
];

export const ensureDefaultBanners = async () => {
  const existingBannerCount = await Banner.countDocuments();

  if (existingBannerCount > 0) {
    return;
  }

  await Banner.insertMany(DEFAULT_BANNERS);
  logger.info("Default hero banners seeded");
};
