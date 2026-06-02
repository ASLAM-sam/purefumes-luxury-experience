import mongoose from "mongoose";
import "dotenv/config";
import Brand from "../models/Brand.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

const mode = process.argv.includes("--apply")
  ? "apply"
  : process.argv.includes("--dry-run")
    ? "dry-run"
    : null;

if (!mode) {
  console.error("Usage: node scripts/category-array-dedupe.js --dry-run|--apply");
  process.exit(1);
}

const connect = async () => {
  const uri = process.env.MONGO_URI_DIRECT || process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI_DIRECT or MONGO_URI is required");
  }

  await mongoose.connect(uri, {
    autoIndex: false,
    serverSelectionTimeoutMS: 12000,
  });
};

const keyFor = (value) => {
  if (value && typeof value === "object" && value._id) {
    return String(value._id);
  }

  return String(value);
};

const dedupePreservingOrder = (values = []) => {
  const seen = new Set();
  const cleaned = [];
  let removed = 0;

  for (const value of Array.isArray(values) ? values : []) {
    const key = keyFor(value);

    if (seen.has(key)) {
      removed += 1;
      continue;
    }

    seen.add(key);
    cleaned.push(value);
  }

  return { cleaned, removed };
};

const countImageUrls = (products) =>
  products.reduce((total, product) => {
    const imageCount = product.image ? 1 : 0;
    const imagesCount = Array.isArray(product.images)
      ? product.images.filter(Boolean).length
      : 0;

    return total + imageCount + imagesCount;
  }, 0);

const countUniqueCategoryProducts = async () => {
  const categories = await Category.find({}).sort({ name: 1 }).lean();
  const categoryNamesById = new Map(
    categories.map((category) => [String(category._id), category.name]),
  );
  const counts = new Map(categories.map((category) => [String(category._id), 0]));
  const products = await Product.collection
    .find({}, { projection: { categories: 1 } })
    .toArray();

  for (const product of products) {
    const uniqueIds = new Set((product.categories || []).map((category) => String(category)));

    for (const id of uniqueIds) {
      counts.set(id, (counts.get(id) || 0) + 1);
    }
  }

  return [...counts.entries()].map(([id, count]) => ({
    id,
    name: categoryNamesById.get(id) || id,
    count,
  }));
};

const main = async () => {
  await connect();

  const beforeProducts = await Product.collection.find({}).toArray();
  const before = {
    products: beforeProducts.length,
    brands: await Brand.countDocuments(),
    categories: await Category.countDocuments(),
    imageUrlReferences: countImageUrls(beforeProducts),
  };

  const affected = [];
  const operations = [];
  const duplicateTotals = {
    categories: 0,
    categoryNames: 0,
    categorySlugs: 0,
  };

  for (const product of beforeProducts) {
    const categories = dedupePreservingOrder(product.categories);
    const categoryNames = dedupePreservingOrder(product.categoryNames);
    const categorySlugs = dedupePreservingOrder(product.categorySlugs);
    const duplicateCount =
      categories.removed + categoryNames.removed + categorySlugs.removed;

    if (!duplicateCount) continue;

    duplicateTotals.categories += categories.removed;
    duplicateTotals.categoryNames += categoryNames.removed;
    duplicateTotals.categorySlugs += categorySlugs.removed;

    affected.push({
      id: String(product._id),
      name: product.name,
      duplicateEntriesRemoved: duplicateCount,
      before: {
        categories: (product.categories || []).map((category) => String(category)),
        categoryNames: product.categoryNames || [],
        categorySlugs: product.categorySlugs || [],
      },
      after: {
        categories: categories.cleaned.map((category) => String(category)),
        categoryNames: categoryNames.cleaned,
        categorySlugs: categorySlugs.cleaned,
      },
    });

    operations.push({
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            categories: categories.cleaned,
            categoryNames: categoryNames.cleaned,
            categorySlugs: categorySlugs.cleaned,
          },
        },
      },
    });
  }

  let modified = 0;

  if (mode === "apply" && operations.length) {
    const writeResult = await Product.collection.bulkWrite(operations, {
      ordered: false,
    });

    modified = writeResult.modifiedCount || 0;
  }

  const afterProducts = await Product.collection.find({}).toArray();
  const after = {
    products: afterProducts.length,
    brands: await Brand.countDocuments(),
    categories: await Category.countDocuments(),
    imageUrlReferences: countImageUrls(afterProducts),
  };

  const protectedDataUnchanged =
    before.products === after.products &&
    before.brands === after.brands &&
    before.categories === after.categories &&
    before.imageUrlReferences === after.imageUrlReferences;

  const result = {
    mode,
    before,
    after,
    protectedDataUnchanged,
    affectedProducts: affected.length,
    modifiedProducts: modified,
    duplicateEntriesRemoved: duplicateTotals,
    totalDuplicateEntriesRemoved:
      duplicateTotals.categories +
      duplicateTotals.categoryNames +
      duplicateTotals.categorySlugs,
    finalCategoryCounts: await countUniqueCategoryProducts(),
    affected,
  };

  console.log(JSON.stringify(result, null, 2));

  if (!protectedDataUnchanged) {
    throw new Error("Protected data counts changed; review before proceeding");
  }
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
