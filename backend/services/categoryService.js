import mongoose from "mongoose";
import Category, {
  createCategoryLookupKey,
  createCategorySlug,
  normalizeCategoryName,
} from "../models/Category.js";
import Product from "../models/Product.js";
import { ApiError } from "../middlewares/errorMiddleware.js";
import { escapeRegex, getPagination, createPaginationMeta } from "../utils/apiFeatures.js";

const sanitizeOptionalText = (value = "") => String(value || "").trim();

const parseCategoryTokenList = (value) => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => parseCategoryTokenList(item));
  }

  if (value === undefined || value === null) {
    return [];
  }

  if (typeof value === "object") {
    const candidate = value.id || value._id || value.slug || value.name || value.value;
    return candidate ? [String(candidate).trim()] : [];
  }

  return String(value)
    .split(/[|,]/g)
    .map((item) => item.trim())
    .filter(Boolean);
};

const sortCategoryDocuments = (categories = []) =>
  [...categories].sort((left, right) => {
    const nameDelta = String(left.name || "").localeCompare(String(right.name || ""));
    if (nameDelta !== 0) {
      return nameDelta;
    }

    return String(left._id || "").localeCompare(String(right._id || ""));
  });

const toCategoryId = (value) => {
  const raw = String(value || "").trim();
  return mongoose.Types.ObjectId.isValid(raw) ? raw : "";
};

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

const buildVisibleCategoryFilter = () => ({
  isDeleted: { $ne: true },
});

const serializeCategory = (category, { productCount = 0 } = {}) => {
  const raw =
    typeof category?.toObject === "function"
      ? category.toObject({ virtuals: true })
      : category;

  const id = raw?.id || raw?._id?.toString?.() || String(raw?._id || "");
  const name = String(raw?.name || "").trim();
  const slug = getPublicCategorySlug(name);

  return {
    id,
    _id: id,
    name,
    slug,
    description: String(raw?.description || "").trim(),
    image: String(raw?.image || "").trim(),
    productCount: Number(productCount || 0),
    createdAt: raw?.createdAt || null,
    updatedAt: raw?.updatedAt || null,
  };
};

const buildCategoryCounts = async (ids = []) => {
  const objectIds = ids
    .map((id) => toCategoryId(id))
    .filter(Boolean)
    .map((id) => new mongoose.Types.ObjectId(id));

  if (!objectIds.length) {
    return new Map();
  }

  const grouped = await Product.aggregate([
    {
      $match: {
        categories: { $in: objectIds },
      },
    },
    { $unwind: "$categories" },
    {
      $match: {
        categories: { $in: objectIds },
      },
    },
    {
      $group: {
        _id: "$categories",
        count: { $sum: 1 },
      },
    },
  ]);

  return new Map(grouped.map((item) => [String(item._id), Number(item.count || 0)]));
};

const buildCategoryQuery = ({ search } = {}) => {
  const filter = buildVisibleCategoryFilter();
  const trimmedSearch = String(search || "").trim();

  if (trimmedSearch) {
    const safeSearch = escapeRegex(trimmedSearch);
    filter.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { description: { $regex: safeSearch, $options: "i" } },
    ];
  }

  return filter;
};

export const buildCategoryPayload = (body = {}) => {
  const payload = {};

  ["name", "description", "image"].forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = sanitizeOptionalText(body[field]);
    }
  });

  return payload;
};

const listCategoriesByFilter = async (filter = {}) =>
  Category.find(filter)
    .sort({ name: 1, createdAt: -1 })
    .lean({ virtuals: true });

export const listCategories = async ({ search } = {}) => {
  const categories = await listCategoriesByFilter(buildCategoryQuery({ search }));
  const counts = await buildCategoryCounts(categories.map((category) => category._id));

  return categories.map((category) =>
    serializeCategory(category, {
      productCount: counts.get(String(category._id)) || 0,
    }),
  );
};

export const listAdminCategories = async (query = {}) => {
  const categories = await listCategories({
    search: query.search,
  });

  const hasPagination = query.page !== undefined || query.limit !== undefined;

  if (!hasPagination) {
    return categories;
  }

  const { page, limit, skip } = getPagination(query);

  return {
    items: categories.slice(skip, skip + limit),
    pagination: createPaginationMeta({
      page,
      limit,
      total: categories.length,
    }),
    summary: {
      total: categories.length,
    },
  };
};

export const getCategoryById = async (id, { includeDeleted = false } = {}) => {
  const normalizedId = toCategoryId(id);

  if (!normalizedId) {
    throw new ApiError(400, "Invalid category id");
  }

  const category = await Category.findOne({
    _id: normalizedId,
    ...(includeDeleted ? {} : buildVisibleCategoryFilter()),
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return category;
};

const getVisibleCategoryDocuments = async () =>
  Category.find(buildVisibleCategoryFilter())
    .sort({ name: 1, createdAt: -1 })
    .lean({ virtuals: true });

const findCategoryByToken = async (token = "") => {
  const normalizedToken = String(token || "").trim();

  if (!normalizedToken) {
    return null;
  }

  const normalizedLookup = createCategoryLookupKey(normalizedToken);
  const normalizedSlug = createCategorySlug(normalizedToken);
  const categories = await getVisibleCategoryDocuments();

  return (
    categories.find((category) => {
      const categoryName = String(category.name || "");

      return (
        createCategoryLookupKey(categoryName) === normalizedLookup ||
        createCategorySlug(categoryName) === normalizedSlug ||
        getPublicCategorySlug(categoryName) === normalizedSlug
      );
    }) || null
  );
};

export const getCategoryBySlug = async (slug = "") => {
  const normalizedSlug = createCategorySlug(slug);

  if (!normalizedSlug) {
    throw new ApiError(404, "Category not found");
  }

  const category = await findCategoryByToken(normalizedSlug);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return category;
};

const ensureCategoryNameAvailable = async ({ name, excludeId } = {}) => {
  const normalizedName = createCategoryLookupKey(name);

  if (!normalizedName) {
    throw new ApiError(422, "Category name is required");
  }

  const categories = await getVisibleCategoryDocuments();
  const duplicate = categories.find((category) => {
    if (excludeId && String(category._id) === String(excludeId)) {
      return false;
    }

    return createCategoryLookupKey(category.name) === normalizedName;
  });

  if (duplicate) {
    throw new ApiError(409, `Category "${normalizeCategoryName(name)}" already exists`);
  }
};

export const createCategory = async (payload = {}) => {
  const normalizedName = normalizeCategoryName(payload.name);
  await ensureCategoryNameAvailable({ name: normalizedName });

  return Category.create({
    name: normalizedName,
    description: sanitizeOptionalText(payload.description),
    image: sanitizeOptionalText(payload.image),
  });
};

export const updateCategory = async (category, payload = {}) => {
  const update = {};

  if (payload.name !== undefined) {
    const nextName = normalizeCategoryName(payload.name);

    if (createCategoryLookupKey(nextName) !== createCategoryLookupKey(category.name)) {
      await ensureCategoryNameAvailable({
        name: nextName,
        excludeId: category._id,
      });
    }

    update.name = nextName;
  }

  if (payload.description !== undefined) {
    update.description = sanitizeOptionalText(payload.description);
  }

  if (payload.image !== undefined) {
    update.image = sanitizeOptionalText(payload.image);
  }

  category.set(update);

  await category.save();
  await refreshProductsForCategoryIds([category._id]);
  return category;
};

const getCategoryDocumentsByIds = async (ids = [], { includeDeleted = false } = {}) => {
  const normalizedIds = ids
    .map((id) => toCategoryId(id))
    .filter(Boolean);

  if (!normalizedIds.length) {
    return [];
  }

  const categories = await Category.find({
    _id: { $in: normalizedIds },
    ...(includeDeleted ? {} : buildVisibleCategoryFilter()),
  }).lean({ virtuals: true });

  return sortCategoryDocuments(categories);
};

const buildCategorySnapshot = (categories = [], preferredPrimaryId = "") => {
  const normalizedCategories = sortCategoryDocuments(categories).filter(
    (category) => category && category.isDeleted !== true,
  );

  if (!normalizedCategories.length) {
    return {
      categories: [],
      primaryCategory: null,
      categoryNames: [],
      categorySlugs: [],
    };
  }

  const preferred =
    preferredPrimaryId &&
    normalizedCategories.find((category) => String(category._id) === String(preferredPrimaryId));

  const ordered = preferred
    ? [preferred, ...normalizedCategories.filter((category) => String(category._id) !== String(preferred._id))]
    : normalizedCategories;

  return {
    categories: ordered.map((category) => category._id),
    primaryCategory: ordered[0]?._id || null,
    categoryNames: ordered.map((category) => category.name),
    categorySlugs: ordered.map((category) => getPublicCategorySlug(category.name)),
  };
};

const resolveCategoriesByTokens = async ({ tokens = [], allowCreate = false, defaults = {} } = {}) => {
  const uniqueTokens = [...new Set(tokens.map((token) => String(token || "").trim()).filter(Boolean))];
  const resolved = [];

  for (const token of uniqueTokens) {
    const normalizedId = toCategoryId(token);

    if (normalizedId) {
      const category = await getCategoryById(normalizedId, { includeDeleted: false });
      resolved.push(category.toObject({ virtuals: true }));
      continue;
    }

    const existing = await findCategoryByToken(token);

    if (existing) {
      resolved.push(existing);
      continue;
    }

    const normalizedName = normalizeCategoryName(token);

    if (!allowCreate) {
      throw new ApiError(404, `Category "${normalizedName}" was not found`);
    }

    const created = await createCategory({
      name: normalizedName,
      description: sanitizeOptionalText(defaults.description),
      image: sanitizeOptionalText(defaults.image),
    });

    resolved.push(created.toObject({ virtuals: true }));
  }

  return sortCategoryDocuments(resolved);
};

export const resolveCategoryFromInput = async ({
  categoryId,
  categoryName,
  allowCreate = false,
  defaults = {},
} = {}) => {
  const categories = await resolveCategoriesByTokens({
    tokens: [...parseCategoryTokenList(categoryId), ...parseCategoryTokenList(categoryName)],
    allowCreate,
    defaults,
  });

  return categories[0] || null;
};

export const resolveCategoriesFromInput = async ({
  categoryIds,
  categoryId,
  categories,
  categoryNames,
  category,
  allowCreate = false,
  defaults = {},
} = {}) =>
  resolveCategoriesByTokens({
    tokens: [
      ...parseCategoryTokenList(categoryIds),
      ...parseCategoryTokenList(categoryId),
      ...parseCategoryTokenList(categories),
      ...parseCategoryTokenList(categoryNames),
      ...parseCategoryTokenList(category),
    ],
    allowCreate,
    defaults,
  });

export const syncProductCategoryFields = async (
  payload,
  body = {},
  { allowCreate = false } = {},
) => {
  const categoryFields = [
    "categoryId",
    "categoryIds",
    "category",
    "categories",
    "categoryNames",
  ];

  const hasCategoryInput = categoryFields.some((field) =>
    Object.prototype.hasOwnProperty.call(body, field),
  );

  if (!hasCategoryInput) {
    return payload;
  }

  const resolvedCategories = await resolveCategoriesFromInput({
    categoryId: body.categoryId,
    categoryIds: body.categoryIds,
    category: body.category ?? payload.category,
    categories: body.categories,
    categoryNames: body.categoryNames,
    allowCreate,
  });

  if (!resolvedCategories.length) {
    throw new ApiError(422, "At least one category is required");
  }

  const snapshot = buildCategorySnapshot(resolvedCategories);

  payload.categories = snapshot.categories;
  payload.primaryCategory = snapshot.primaryCategory;
  payload.categoryNames = snapshot.categoryNames;
  payload.categorySlugs = snapshot.categorySlugs;
  return payload;
};

export const refreshProductsForCategoryIds = async (categoryIds = []) => {
  const normalizedCategoryIds = [...new Set(categoryIds.map((id) => toCategoryId(id)).filter(Boolean))];

  if (!normalizedCategoryIds.length) {
    return;
  }

  const products = await Product.find({
    categories: {
      $in: normalizedCategoryIds.map((id) => new mongoose.Types.ObjectId(id)),
    },
  })
    .select("categories primaryCategory")
    .lean();

  if (!products.length) {
    return;
  }

  const allCategoryIds = [...new Set(products.flatMap((product) => product.categories || []).map((id) => String(id)))];
  const categories = await getCategoryDocumentsByIds(allCategoryIds, { includeDeleted: false });
  const categoryMap = new Map(categories.map((category) => [String(category._id), category]));

  const operations = products.map((product) => {
    const linkedCategories = (product.categories || [])
      .map((categoryId) => categoryMap.get(String(categoryId)))
      .filter(Boolean);
    const snapshot = buildCategorySnapshot(linkedCategories, product.primaryCategory);

    return {
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            categories: snapshot.categories,
            primaryCategory: snapshot.primaryCategory,
            categoryNames: snapshot.categoryNames,
            categorySlugs: snapshot.categorySlugs,
          },
        },
      },
    };
  });

  if (operations.length) {
    await Product.bulkWrite(operations);
  }
};

export const syncProductsForCategory = async ({ categoryId } = {}) => {
  if (!categoryId) return;
  await refreshProductsForCategoryIds([categoryId]);
};

export const attachCategoryDetails = async (products = []) => {
  if (!Array.isArray(products) || !products.length) {
    return [];
  }

  const categoryIds = [
    ...new Set(
      products.flatMap((product) => {
        const ids = Array.isArray(product.categoryIds)
          ? product.categoryIds
          : Array.isArray(product.categories)
            ? product.categories
            : product.categoryId
              ? [product.categoryId]
              : [];

        return ids.map((id) => toCategoryId(id)).filter(Boolean);
      }),
    ),
  ];

  const categories = (await getCategoryDocumentsByIds(categoryIds, { includeDeleted: false })).map(
    (category) => serializeCategory(category),
  );

  const categoryMap = new Map(
    categories.map((category) => [String(category.id || category._id || ""), category]),
  );

  return products.map((product) => {
    const categoryIdsForProduct = Array.isArray(product.categoryIds)
      ? product.categoryIds
      : Array.isArray(product.categories)
        ? product.categories
        : product.categoryId
          ? [product.categoryId]
          : [];
    const categoryDetails = categoryIdsForProduct
      .map((id) => categoryMap.get(toCategoryId(id)))
      .filter(Boolean);
    const primaryCategory = categoryDetails[0] || null;

    return {
      ...product,
      categories: categoryDetails,
      categoryIds: categoryDetails.map((category) => category.id),
      categoryNames: categoryDetails.map((category) => category.name),
      categorySlugs: categoryDetails.map((category) => category.slug),
      categoryDetails: primaryCategory,
      categoryId: primaryCategory?.id || null,
      category: primaryCategory?.name || "",
      categorySlug: primaryCategory?.slug || "",
    };
  });
};

export const deleteCategoryPermanently = async (category) => {
  const linkedProducts = await Product.find({ categories: category._id })
    .select("_id categories primaryCategory")
    .lean();

  if (linkedProducts.length) {
    const remainingIds = [
      ...new Set(
        linkedProducts
          .flatMap((product) => product.categories || [])
          .map((id) => String(id))
          .filter((id) => id !== String(category._id)),
      ),
    ];
    const remainingCategories = await getCategoryDocumentsByIds(remainingIds, { includeDeleted: false });
    const categoryMap = new Map(remainingCategories.map((item) => [String(item._id), item]));

    const operations = linkedProducts.map((product) => {
      const linkedCategories = (product.categories || [])
        .map((id) => String(id))
        .filter((id) => id !== String(category._id))
        .map((id) => categoryMap.get(id))
        .filter(Boolean);
      const snapshot = buildCategorySnapshot(linkedCategories, product.primaryCategory);

      return {
        updateOne: {
          filter: { _id: product._id },
          update: {
            $set: {
              categories: snapshot.categories,
              primaryCategory: snapshot.primaryCategory,
              categoryNames: snapshot.categoryNames,
              categorySlugs: snapshot.categorySlugs,
            },
          },
        },
      };
    });

    await Product.bulkWrite(operations);
  }

  await Category.deleteOne({ _id: category._id });
  return category;
};
