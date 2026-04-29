import Banner from "../models/Banner.js";

export const DEFAULT_BANNERS = [
  {
    title: "Afnan Collection",
    subtitle: "Flat 50% Off on Premium Scents",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=80",
    buttonText: "Shop Now",
    link: "/category/designer",
    order: 1,
    isActive: true,
  },
  {
    title: "Middle Eastern Luxury",
    subtitle: "Authentic Oud & Exotic Blends",
    image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1600&q=80",
    buttonText: "Explore",
    link: "/category/middle-eastern",
    order: 2,
    isActive: true,
  },
  {
    title: "Niche Perfumes",
    subtitle: "Exclusive Rare Fragrances",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1600&q=80",
    buttonText: "Discover",
    link: "/category/niche",
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
  console.log("Default hero banners seeded");
};
