import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Brand from "../models/Brand.js";
import Category, {
  createCategoryLookupKey,
  createCategorySlug,
} from "../models/Category.js";
import Product from "../models/Product.js";

const toObjectId = (value) => {
  const stringValue = String(value || "").trim();
  return mongoose.Types.ObjectId.isValid(stringValue)
    ? new mongoose.Types.ObjectId(stringValue)
    : null;
};

const createCategoryIndexes = (categories = []) => {
  const byId = new Map();
  const byLookup = new Map();
  const bySlug = new Map();

  categories.forEach((category) => {
    const id = String(category._id || "").trim();
    const name = String(category.name || "").trim();
    const slug = createCategorySlug(name);

    if (id) byId.set(id, category);
    if (name) byLookup.set(createCategoryLookupKey(name), category);
    if (slug) bySlug.set(slug, category);
  });

  return { byId, byLookup, bySlug };
};

const resolveCategoryToken = (token, indexes) => {
  const value = String(token || "").trim();
  if (!value) return null;

  const objectId = toObjectId(value);
  if (objectId) {
    return indexes.byId.get(String(objectId)) || null;
  }

  return (
    indexes.byLookup.get(createCategoryLookupKey(value)) ||
    indexes.bySlug.get(createCategorySlug(value)) ||
    null
  );
};

const collectCategoryTokens = (product = {}) => [
  ...(Array.isArray(product.categories) ? product.categories : []),
  product.primaryCategory,
  product.categoryId,
  ...(Array.isArray(product.categoryNames) ? product.categoryNames : []),
  ...(Array.isArray(product.categorySlugs) ? product.categorySlugs : []),
  product.category,
  product.categorySlug,
];

const resolveProductCategories = (product, indexes) => {
  const seen = new Set();
  const categories = [];

  collectCategoryTokens(product).forEach((token) => {
    const category = resolveCategoryToken(token, indexes);
    const id = String(category?._id || "");

    if (!id || seen.has(id)) return;

    seen.add(id);
    categories.push(category);
  });

  return categories;
};

const remapProductsToCurrentCategories = async ({ dryRun = false } = {}) => {
  const categories = await Category.find({}).sort({ name: 1 }).lean();
  const indexes = createCategoryIndexes(categories);
  const products = await Product.collection
    .find(
      {},
      {
        projection: {
          categories: 1,
          primaryCategory: 1,
          categoryNames: 1,
          categorySlugs: 1,
          category: 1,
          categoryId: 1,
          categorySlug: 1,
          brandId: 1,
        },
      },
    )
    .toArray();
  const operations = [];

  products.forEach((product) => {
    const resolvedCategories = resolveProductCategories(product, indexes);
    const update = {
      $set: {
        brandId: null,
      },
    };

    if (resolvedCategories.length) {
      update.$set.categories = resolvedCategories.map((category) => category._id);
      update.$set.primaryCategory = resolvedCategories[0]._id;
      update.$set.categoryNames = resolvedCategories.map((category) => category.name);
      update.$set.categorySlugs = resolvedCategories.map((category) =>
        createCategorySlug(category.name),
      );
      update.$unset = {
        category: "",
        categoryId: "",
        categorySlug: "",
      };
    }

    operations.push({
      updateOne: {
        filter: { _id: product._id },
        update,
      },
    });
  });

  if (operations.length && !dryRun) {
    await Product.collection.bulkWrite(operations, { ordered: false });
  }

  return {
    matched: products.length,
    modified: operations.length,
  };
};

export const cleanupCatalog = async ({ dryRun = false } = {}) => {
  const before = {
    categories: await Category.countDocuments(),
    brands: await Brand.countDocuments(),
    products: await Product.countDocuments(),
  };

  const productResult = await remapProductsToCurrentCategories({ dryRun });
  const brandDeleteCount = await Brand.countDocuments();

  if (!dryRun) {
    await Brand.deleteMany({});
  }

  const categories = await Category.find({}).sort({ name: 1 }).select("name").lean();
  const after = {
    categories: dryRun ? before.categories : await Category.countDocuments(),
    brands: dryRun ? before.brands : await Brand.countDocuments(),
    products: dryRun ? before.products : await Product.countDocuments(),
  };

  return {
    dryRun,
    before,
    after,
    categoriesPreserved: categories.map((category) => category.name),
    categoryDeleteCount: 0,
    brandDeleteCount,
    productResult,
  };
};

const run = async () => {
  const dryRun = process.argv.includes("--dry-run");

  await connectDB();
  const result = await cleanupCatalog({ dryRun });
  console.log(JSON.stringify(result, null, 2));
  await mongoose.disconnect();
};

const __filename = fileURLToPath(import.meta.url);
const isCli = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isCli) {
  run().catch(async (error) => {
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  });
}
