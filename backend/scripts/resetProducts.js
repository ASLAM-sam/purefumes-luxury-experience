import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

const CATEGORY_NAMES = ["Middle Eastern", "Designer", "Niche"];
const CATEGORY_SLUGS = {
  "Middle Eastern": "middle-eastern",
  Designer: "designer",
  Niche: "niche",
};

const sampleProducts = [
  {
    name: "Oud Royal",
    category: "Middle Eastern",
    price: 1999,
    brand: "Desert House",
    description: "Rich oud fragrance with deep woody notes.",
    image: "",
    images: [],
    stock: 18,
    sizes: [{ size: "100ml", price: 1999 }],
    topNotes: ["Saffron", "Bergamot"],
    middleNotes: ["Rose", "Incense"],
    baseNotes: ["Oud", "Amber", "Sandalwood"],
    longevity: "8-10 hours",
    sillage: "Strong",
    usage: "Night",
    bestTime: ["Evening", "Night"],
    seasons: ["Autumn", "Winter"],
    isBestseller: true,
    bestsellerOrder: 1,
    originalPrice: 2299,
  },
  {
    name: "Amber Desert",
    category: "Middle Eastern",
    price: 1799,
    brand: "Amber Atelier",
    description: "Warm amber fragrance layered with spice and dry woods.",
    image: "",
    images: [],
    stock: 22,
    sizes: [{ size: "100ml", price: 1799 }],
    topNotes: ["Cardamom", "Mandarin"],
    middleNotes: ["Amber", "Cinnamon"],
    baseNotes: ["Patchouli", "Vanilla", "Cedar"],
    longevity: "7-9 hours",
    sillage: "Moderate",
    usage: "Day & Night",
    bestTime: ["Day", "Evening"],
    seasons: ["Autumn", "Winter"],
  },
  {
    name: "Musk Al Arab",
    category: "Middle Eastern",
    price: 1599,
    brand: "Arabian Musk Co.",
    description: "Soft clean musk with a smooth traditional warmth.",
    image: "",
    images: [],
    stock: 20,
    sizes: [{ size: "100ml", price: 1599 }],
    topNotes: ["Pear", "Aldehydes"],
    middleNotes: ["White Musk", "Iris"],
    baseNotes: ["Cashmere Wood", "Amber"],
    longevity: "6-8 hours",
    sillage: "Soft to moderate",
    usage: "Day",
    bestTime: ["Morning", "Day"],
    seasons: ["Spring", "Summer"],
  },
  {
    name: "Royal Bakhoor",
    category: "Middle Eastern",
    price: 1899,
    brand: "Royal Incense",
    description: "Smoky bakhoor-inspired scent with a luxurious resin trail.",
    image: "",
    images: [],
    stock: 16,
    sizes: [{ size: "100ml", price: 1899 }],
    topNotes: ["Clove", "Pink Pepper"],
    middleNotes: ["Labdanum", "Rose"],
    baseNotes: ["Smoke", "Resins", "Oud"],
    longevity: "8-10 hours",
    sillage: "Strong",
    usage: "Night",
    bestTime: ["Evening", "Night"],
    seasons: ["Autumn", "Winter"],
  },
  {
    name: "Urban Edge",
    category: "Designer",
    price: 2499,
    brand: "Studio Moderne",
    description: "Fresh modern fragrance with crisp citrus and clean woods.",
    image: "",
    images: [],
    stock: 24,
    sizes: [{ size: "100ml", price: 2499 }],
    topNotes: ["Grapefruit", "Lemon"],
    middleNotes: ["Lavender", "Geranium"],
    baseNotes: ["Vetiver", "Cedar", "Musk"],
    longevity: "6-8 hours",
    sillage: "Moderate",
    usage: "Day",
    bestTime: ["Morning", "Day"],
    seasons: ["Spring", "Summer"],
    isBestseller: true,
    bestsellerOrder: 2,
    originalPrice: 2799,
  },
  {
    name: "Midnight Code",
    category: "Designer",
    price: 2699,
    brand: "Noir Edition",
    description: "Dark aromatic profile with spices, woods, and a smooth finish.",
    image: "",
    images: [],
    stock: 19,
    sizes: [{ size: "100ml", price: 2699 }],
    topNotes: ["Black Pepper", "Bergamot"],
    middleNotes: ["Lavender", "Nutmeg"],
    baseNotes: ["Tonka Bean", "Amberwood", "Patchouli"],
    longevity: "7-9 hours",
    sillage: "Moderate to strong",
    usage: "Night",
    bestTime: ["Evening", "Night"],
    seasons: ["Autumn", "Winter"],
  },
  {
    name: "Aqua Pulse",
    category: "Designer",
    price: 2299,
    brand: "Blue Axis",
    description: "Fresh aquatic fragrance with a bright and energizing vibe.",
    image: "",
    images: [],
    stock: 26,
    sizes: [{ size: "100ml", price: 2299 }],
    topNotes: ["Marine Notes", "Bergamot"],
    middleNotes: ["Sage", "Violet Leaf"],
    baseNotes: ["Musk", "Ambergris Accord", "Cypress"],
    longevity: "5-7 hours",
    sillage: "Fresh moderate",
    usage: "Day",
    bestTime: ["Morning", "Day"],
    seasons: ["Spring", "Summer"],
  },
  {
    name: "Velvet Noir",
    category: "Designer",
    price: 2899,
    brand: "Velour Lab",
    description: "Elegant evening fragrance with smooth woods and warm spice.",
    image: "",
    images: [],
    stock: 17,
    sizes: [{ size: "100ml", price: 2899 }],
    topNotes: ["Plum", "Pink Pepper"],
    middleNotes: ["Jasmine", "Coriander"],
    baseNotes: ["Sandalwood", "Vanilla", "Amber"],
    longevity: "8 hours",
    sillage: "Strong",
    usage: "Night",
    bestTime: ["Evening", "Night"],
    seasons: ["Autumn", "Winter"],
  },
  {
    name: "Rare Essence",
    category: "Niche",
    price: 3499,
    brand: "Atelier Rare",
    description: "Unique handcrafted blend with polished woods and airy spice.",
    image: "",
    images: [],
    stock: 14,
    sizes: [{ size: "100ml", price: 3499 }],
    topNotes: ["Juniper", "Pink Pepper"],
    middleNotes: ["Orris", "Black Tea"],
    baseNotes: ["Cedar", "Amber", "Musk"],
    longevity: "8-10 hours",
    sillage: "Moderate to strong",
    usage: "Day & Night",
    bestTime: ["Day", "Evening"],
    seasons: ["Spring", "Autumn"],
    isBestseller: true,
    bestsellerOrder: 3,
    originalPrice: 3899,
  },
  {
    name: "Golden Resin",
    category: "Niche",
    price: 3799,
    brand: "Resin House",
    description: "Deep resinous fragrance with a rich ambered heart.",
    image: "",
    images: [],
    stock: 12,
    sizes: [{ size: "100ml", price: 3799 }],
    topNotes: ["Saffron", "Mandarin"],
    middleNotes: ["Myrrh", "Labdanum"],
    baseNotes: ["Benzoin", "Amber", "Dry Woods"],
    longevity: "9-11 hours",
    sillage: "Strong",
    usage: "Night",
    bestTime: ["Evening", "Night"],
    seasons: ["Autumn", "Winter"],
  },
  {
    name: "Silent Woods",
    category: "Niche",
    price: 3599,
    brand: "Silent Grove",
    description: "Earthy calming woods softened by spice and suede accents.",
    image: "",
    images: [],
    stock: 15,
    sizes: [{ size: "100ml", price: 3599 }],
    topNotes: ["Cardamom", "Fig Leaf"],
    middleNotes: ["Cedar", "Violet"],
    baseNotes: ["Vetiver", "Suede", "Musk"],
    longevity: "7-9 hours",
    sillage: "Moderate",
    usage: "Day & Night",
    bestTime: ["Day", "Evening"],
    seasons: ["Autumn", "Winter"],
  },
  {
    name: "Mystic Bloom",
    category: "Niche",
    price: 3699,
    brand: "Bloom Archive",
    description: "Complex floral composition with depth, texture, and soft woods.",
    image: "",
    images: [],
    stock: 13,
    sizes: [{ size: "100ml", price: 3699 }],
    topNotes: ["Neroli", "Pear"],
    middleNotes: ["Tuberose", "Rose", "Jasmine"],
    baseNotes: ["Cashmeran", "Amber", "Musk"],
    longevity: "7-9 hours",
    sillage: "Moderate to strong",
    usage: "Day & Night",
    bestTime: ["Day", "Evening"],
    seasons: ["Spring", "Autumn"],
  },
];

const verifyReset = async () => {
  const totalProducts = await Product.countDocuments();
  const categoryCounts = await Product.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  const duplicateNames = await Product.aggregate([
    {
      $group: {
        _id: { $toLower: "$name" },
        names: { $addToSet: "$name" },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);
  const categories = await Category.find({}, "name slug").sort({ name: 1 }).lean();

  const countsByCategory = Object.fromEntries(CATEGORY_NAMES.map((name) => [name, 0]));
  categoryCounts.forEach(({ _id, count }) => {
    countsByCategory[_id] = count;
  });

  const invalidCategoryCount = CATEGORY_NAMES.filter((name) => countsByCategory[name] !== 4);
  const extraCategories = categories
    .map((category) => category.name)
    .filter((name) => !CATEGORY_NAMES.includes(name));
  const missingCategories = CATEGORY_NAMES.filter(
    (name) => !categories.some((category) => category.name === name),
  );

  if (totalProducts !== 12) {
    throw new Error(`Verification failed: expected 12 products, found ${totalProducts}.`);
  }

  if (invalidCategoryCount.length > 0) {
    throw new Error(
      `Verification failed: expected 4 products in each category. Offending categories: ${invalidCategoryCount.join(", ")}.`,
    );
  }

  if (duplicateNames.length > 0) {
    const duplicates = duplicateNames
      .map((entry) => entry.names.join(" / "))
      .join(", ");
    throw new Error(`Verification failed: duplicate product names found: ${duplicates}.`);
  }

  if (missingCategories.length > 0 || extraCategories.length > 0) {
    throw new Error(
      `Verification failed: category collection mismatch. Missing: ${
        missingCategories.join(", ") || "none"
      }. Extra: ${extraCategories.join(", ") || "none"}.`,
    );
  }

  return {
    totalProducts,
    countsByCategory,
    categories,
  };
};

const resetProducts = async () => {
  await connectDB();

  try {
    await Product.deleteMany({});

    await Category.deleteMany({
      name: { $nin: CATEGORY_NAMES },
    });

    await Category.bulkWrite(
      CATEGORY_NAMES.map((name) => ({
        updateOne: {
          filter: { name },
          update: {
            $set: {
              name,
              slug: CATEGORY_SLUGS[name],
            },
          },
          upsert: true,
        },
      })),
    );

    await Product.insertMany(sampleProducts);

    const verification = await verifyReset();

    console.log("Product catalog reset complete.");
    console.log(`Total products: ${verification.totalProducts}`);
    console.table(verification.countsByCategory);
    console.table(
      verification.categories.map((category) => ({
        name: category.name,
        slug: category.slug,
      })),
    );
  } finally {
    await mongoose.connection.close(false);
  }
};

resetProducts().catch((error) => {
  console.error("Product reset failed.");
  console.error(error);
  process.exitCode = 1;
});
