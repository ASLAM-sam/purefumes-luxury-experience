import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Category, {
  createCategoryLookupKey,
  createCategorySlug,
  normalizeCategoryName,
} from "../models/Category.js";
import Product from "../models/Product.js";

const FALLBACK_CATEGORY_NAME = "Designer";

const uniqueStrings = (values = []) =>
  [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];

const getPublicCategorySlug = (name = "") => {
  const slug = createCategorySlug(name);

  if (slug === "designer" || slug === "designer-fragrances") {
    return "designer";
  }

  if (slug === "middle-eastern" || slug === "middle-eastern-fragrances") {
    return "middle-eastern";
  }

  if (slug === "niche" || slug === "niche-fragrances") {
    return "niche";
  }

  return slug;
};

const sortCanonicalCandidates = (categories = []) =>
  [...categories].sort((left, right) => {
    const deletedDelta = Number(Boolean(left.isDeleted)) - Number(Boolean(right.isDeleted));
    if (deletedDelta !== 0) {
      return deletedDelta;
    }

    const leftCreatedAt = new Date(left.createdAt || 0).getTime();
    const rightCreatedAt = new Date(right.createdAt || 0).getTime();

    return leftCreatedAt - rightCreatedAt;
  });

const run = async () => {
  await connectDB();

  const categoryCollection = mongoose.connection.collection("categories");
  const productCollection = mongoose.connection.collection("products");

  const [rawCategories, rawProducts] = await Promise.all([
    categoryCollection.find({}).toArray(),
    productCollection.find({}).toArray(),
  ]);

  await Promise.all([
    categoryCollection.dropIndexes().catch(() => undefined),
    productCollection.dropIndexes().catch(() => undefined),
  ]);

  const canonicalNameMap = new Map();
  const rawCategoryGroups = new Map();

  rawCategories.forEach((category) => {
    const normalizedName = createCategoryLookupKey(category.name || "");
    if (!normalizedName) {
      return;
    }

    const current = rawCategoryGroups.get(normalizedName) || [];
    current.push(category);
    rawCategoryGroups.set(normalizedName, current);
  });

  const productCategoryNames = rawProducts.flatMap((product) => [
    ...(typeof product.category === "string" ? [product.category] : []),
    ...(Array.isArray(product.categoryNames) ? product.categoryNames : []),
  ]);

  uniqueStrings(productCategoryNames).forEach((name) => {
    const normalizedName = createCategoryLookupKey(name);
    if (!normalizedName || rawCategoryGroups.has(normalizedName)) {
      return;
    }

    rawCategoryGroups.set(normalizedName, []);
  });

  for (const [normalizedName, groupedCategories] of rawCategoryGroups.entries()) {
    const canonicalName = normalizeCategoryName(normalizedName);
    const orderedCandidates = sortCanonicalCandidates(groupedCategories);
    const primary = orderedCandidates[0];

    canonicalNameMap.set(normalizedName, {
      id: primary?._id || new mongoose.Types.ObjectId(),
      name: canonicalName,
      description: String(primary?.description || "").trim(),
      image: String(primary?.image || "").trim(),
      createdAt: primary?.createdAt || new Date(),
      updatedAt: new Date(),
      duplicateIds: orderedCandidates.slice(1).map((category) => category._id),
    });
  }

  if (!canonicalNameMap.size) {
    const fallbackId = new mongoose.Types.ObjectId();
    canonicalNameMap.set(createCategoryLookupKey(FALLBACK_CATEGORY_NAME), {
      id: fallbackId,
      name: FALLBACK_CATEGORY_NAME,
      description: "",
      image: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      duplicateIds: [],
    });
  }

  const duplicateIdMap = new Map();
  const canonicalCategoryDocs = [...canonicalNameMap.values()]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((category) => ({
      _id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
      createdAt: category.createdAt,
      updatedAt: new Date(),
    }));

  canonicalCategoryDocs.forEach((category) => {
    const rawMeta = canonicalNameMap.get(createCategoryLookupKey(category.name));
    rawMeta?.duplicateIds?.forEach((duplicateId) => {
      duplicateIdMap.set(String(duplicateId), category._id);
    });
  });

  await categoryCollection.deleteMany({});

  if (canonicalCategoryDocs.length) {
    await categoryCollection.insertMany(canonicalCategoryDocs, { ordered: true });
  }

  const categoryById = new Map(canonicalCategoryDocs.map((category) => [String(category._id), category]));
  const categoryByName = new Map(
    canonicalCategoryDocs.map((category) => [createCategoryLookupKey(category.name), category]),
  );

  const fallbackCategory =
    categoryByName.get(createCategoryLookupKey(FALLBACK_CATEGORY_NAME)) || canonicalCategoryDocs[0];

  const productOperations = rawProducts.map((product) => {
    const linkedCategoryIds = [
      ...(Array.isArray(product.categories) ? product.categories : []),
      ...(product.primaryCategory ? [product.primaryCategory] : []),
      ...(product.categoryId ? [product.categoryId] : []),
    ]
      .map((categoryId) => String(categoryId || "").trim())
      .map((categoryId) => {
        if (categoryById.has(categoryId)) {
          return categoryById.get(categoryId);
        }

        const duplicateMatch = duplicateIdMap.get(categoryId);
        return duplicateMatch ? categoryById.get(String(duplicateMatch)) : null;
      })
      .filter(Boolean);

    const linkedCategoryNames = [
      ...(typeof product.category === "string" ? [product.category] : []),
      ...(Array.isArray(product.categoryNames) ? product.categoryNames : []),
    ]
      .map((name) => createCategoryLookupKey(name))
      .map((lookupKey) => categoryByName.get(lookupKey))
      .filter(Boolean);

    const mergedCategories = uniqueStrings([
      ...linkedCategoryIds.map((category) => String(category._id)),
      ...linkedCategoryNames.map((category) => String(category._id)),
    ])
      .map((categoryId) => categoryById.get(categoryId))
      .filter(Boolean);

    const categories = mergedCategories.length ? mergedCategories : [fallbackCategory];
    const primaryCategory =
      categories.find(
        (category) =>
          String(category._id) === String(product.primaryCategory || product.categoryId || ""),
      ) || categories[0];

    const orderedCategories = [
      primaryCategory,
      ...categories.filter((category) => String(category._id) !== String(primaryCategory._id)),
    ];

    return {
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            categories: orderedCategories.map((category) => category._id),
            primaryCategory: primaryCategory._id,
            categoryNames: orderedCategories.map((category) => category.name),
            categorySlugs: orderedCategories.map((category) => getPublicCategorySlug(category.name)),
          },
          $unset: {
            category: "",
            categoryId: "",
          },
        },
      },
    };
  });

  if (productOperations.length) {
    await productCollection.bulkWrite(productOperations, { ordered: false });
  }

  await Promise.all([Category.syncIndexes(), Product.syncIndexes()]);

  const summary = {
    categoriesBefore: rawCategories.length,
    categoriesAfter: canonicalCategoryDocs.length,
    duplicateCategoriesRemoved: rawCategories.length - canonicalCategoryDocs.length,
    productsUpdated: rawProducts.length,
  };

  console.log("Category cleanup completed");
  console.table(summary);
};

run()
  .catch((error) => {
    console.error("Category cleanup failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
  });
