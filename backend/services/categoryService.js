import mongoose from "mongoose";
import Category, {
  createCategoryLookupKey,
  createCategorySlug,
  normalizeCategoryColor,
  normalizeCategoryName,
} from "../models/Category.js";
import Product from "../models/Product.js";
import { ApiError } from "../middlewares/errorMiddleware.js";
import { escapeRegex, getPagination, createPaginationMeta } from "../utils/apiFeatures.js";

const DEFAULT_CATEGORY_COLOR = "#8b5f3d";

const sanitizeOptionalText = (value = "") => String(value || "").trim();

const parseBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;

  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return fallback;

  return ["1", "true", "yes", "on"].includes(normalized);
};

const parseSortOrder = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const normalized = Number(value);

  if (!Number.isFinite(normalized)) {
    throw new ApiError(400, "sortOrder must be a valid number");
  }

  return Math.max(0, Math.trunc(normalized));
};

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
    const sortDelta = Number(left.sortOrder || 0) - Number(right.sortOrder || 0);
    if (sortDelta !== 0) {
      return sortDelta;
    }

    return String(left.name || "").localeCompare(String(right.name || ""));
  });

const toCategoryId = (value) => {
  const raw = String(value || "").trim();
  return mongoose.Types.ObjectId.isValid(raw) ? raw : "";
};

const serializeCategory = (category, { productCount = 0 } = {}) => {
  const raw =
    typeof category?.toObject === "function"
      ? category.toObject({ virtuals: true })
      : category;

  const id = raw?.id || raw?._id?.toString?.() || String(raw?._id || "");
  const sortOrder = Number(raw?.sortOrder || 0);
  const isActive = Boolean(raw?.isActive);
  const isDeleted = Boolean(raw?.isDeleted);
  const color = normalizeCategoryColor(raw?.color || DEFAULT_CATEGORY_COLOR);

  return {
    id,
    _id: id,
    name: String(raw?.name || "").trim(),
    slug: String(raw?.slug || "").trim(),
    description: String(raw?.description || "").trim(),
    image: String(raw?.image || "").trim(),
    icon: String(raw?.icon || "").trim(),
    color,
    sortOrder,
    displayOrder: sortOrder,
    isActive,
    active: isActive,
    isDeleted,
    featured: Boolean(raw?.featured),
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

const buildCategoryQuery = ({
  includeInactive = false,
  includeDeleted = false,
  featured,
  search,
} = {}) => {
  const filter = {};

  if (!includeInactive) {
    filter.isActive = true;
  }

  if (!includeDeleted) {
    filter.isDeleted = false;
  }

  if (featured !== undefined) {
    filter.featured = parseBoolean(featured);
  }

  const trimmedSearch = String(search || "").trim();

  if (trimmedSearch) {
    const safeSearch = escapeRegex(trimmedSearch);
    filter.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { slug: { $regex: safeSearch, $options: "i" } },
      { description: { $regex: safeSearch, $options: "i" } },
    ];
  }

  return filter;
};

export const buildCategoryPayload = (body = {}) => {
  const payload = {};

  ["name", "slug", "description", "image", "icon", "color"].forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = sanitizeOptionalText(body[field]);
    }
  });

  if (body.sortOrder !== undefined || body.displayOrder !== undefined) {
    payload.sortOrder = parseSortOrder(body.sortOrder ?? body.displayOrder);
  }

  if (body.featured !== undefined) {
    payload.featured = parseBoolean(body.featured, false);
  }

  if (body.isActive !== undefined || body.active !== undefined) {
    payload.isActive = parseBoolean(body.isActive ?? body.active, true);
  }

  if (body.isDeleted !== undefined) {
    payload.isDeleted = parseBoolean(body.isDeleted, false);
  }

  if (payload.color !== undefined) {
    payload.color = normalizeCategoryColor(payload.color);
  }

  return payload;
};

const generateUniqueCategorySlug = async ({ slugSource, excludeId } = {}) => {
  const baseSlug = createCategorySlug(slugSource);

  if (!baseSlug) {
    throw new ApiError(422, "Category slug could not be generated");
  }

  const filter = {
    isDeleted: false,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  };

  const existing = await Category.find({
    ...filter,
    slug: {
      $regex: `^${escapeRegex(baseSlug)}(?:-[0-9]+)?$`,
      $options: "i",
    },
  })
    .select("slug")
    .lean();

  const used = new Set(existing.map((item) => String(item.slug || "").toLowerCase()));

  if (!used.has(baseSlug.toLowerCase())) {
    return baseSlug;
  }

  let suffix = 2;
  let candidate = `${baseSlug}-${suffix}`;

  while (used.has(candidate.toLowerCase())) {
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }

  return candidate;
};

const ensureCategoryNameAvailable = async ({ name, excludeId } = {}) => {
  const normalizedName = createCategoryLookupKey(name);

  if (!normalizedName) {
    throw new ApiError(422, "Category name is required");
  }

  const duplicate = await Category.findOne({
    normalizedName,
    isDeleted: false,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  })
    .select("_id name")
    .lean();

  if (duplicate) {
    throw new ApiError(409, `Category "${normalizeCategoryName(name)}" already exists`);
  }
};

const getNextSortOrder = async () => {
  const latest = await Category.findOne({ isDeleted: false })
    .sort({ sortOrder: -1, createdAt: -1 })
    .select("sortOrder")
    .lean();

  return Number(latest?.sortOrder || 0) + 1;
};

const listCategoriesByFilter = async (filter = {}) =>
  Category.find(filter)
    .sort({ sortOrder: 1, name: 1 })
    .lean({ virtuals: true });

export const listCategories = async ({
  includeInactive = false,
  includeDeleted = false,
  featured,
  search,
} = {}) => {
  const categories = await listCategoriesByFilter(
    buildCategoryQuery({
      includeInactive,
      includeDeleted,
      featured,
      search,
    }),
  );

  const counts = await buildCategoryCounts(categories.map((category) => category._id));
  return categories.map((category) =>
    serializeCategory(category, {
      productCount: counts.get(String(category._id)) || 0,
    }),
  );
};

export const listAdminCategories = async (query = {}) => {
  const categories = await listCategories({
    includeInactive: true,
    includeDeleted: true,
    search: query.search,
  });

  const { page, limit, skip } = getPagination(query);
  const featuredFilter = String(query.featured || "").trim().toLowerCase();
  const stateFilter = String(query.state || "").trim().toLowerCase();

  let filtered = [...categories];

  if (featuredFilter === "featured") {
    filtered = filtered.filter((category) => category.featured);
  } else if (featuredFilter === "standard") {
    filtered = filtered.filter((category) => !category.featured);
  }

  if (stateFilter === "active") {
    filtered = filtered.filter((category) => category.isActive && !category.isDeleted);
  } else if (stateFilter === "inactive") {
    filtered = filtered.filter((category) => !category.isActive && !category.isDeleted);
  } else if (stateFilter === "deleted") {
    filtered = filtered.filter((category) => category.isDeleted);
  }

  return {
    items: filtered.slice(skip, skip + limit),
    pagination: createPaginationMeta({
      page,
      limit,
      total: filtered.length,
    }),
    summary: {
      total: categories.filter((category) => !category.isDeleted).length,
      active: categories.filter((category) => category.isActive && !category.isDeleted).length,
      inactive: categories.filter((category) => !category.isActive && !category.isDeleted).length,
      featured: categories.filter((category) => category.featured && !category.isDeleted).length,
      deleted: categories.filter((category) => category.isDeleted).length,
    },
  };
};

export const getCategoryById = async (id, { includeDeleted = true } = {}) => {
  const normalizedId = toCategoryId(id);

  if (!normalizedId) {
    throw new ApiError(400, "Invalid category id");
  }

  const category = await Category.findOne({
    _id: normalizedId,
    ...(includeDeleted ? {} : { isDeleted: false }),
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return category;
};

export const getCategoryBySlug = async (slug = "", { includeInactive = false } = {}) => {
  const normalizedSlug = createCategorySlug(slug);

  if (!normalizedSlug) {
    throw new ApiError(404, "Category not found");
  }

  const category = await Category.findOne({
    slug: normalizedSlug,
    isDeleted: false,
    ...(includeInactive ? {} : { isActive: true }),
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return category;
};

export const createCategory = async (payload = {}) => {
  const normalizedName = normalizeCategoryName(payload.name);
  await ensureCategoryNameAvailable({ name: normalizedName });

  const sortOrder =
    payload.sortOrder !== undefined ? parseSortOrder(payload.sortOrder) : await getNextSortOrder();
  const slug = await generateUniqueCategorySlug({
    slugSource: payload.slug || normalizedName,
  });

  return Category.create({
    ...payload,
    name: normalizedName,
    slug,
    sortOrder,
    color: normalizeCategoryColor(payload.color || DEFAULT_CATEGORY_COLOR),
    isActive: payload.isActive !== false,
    isDeleted: false,
  });
};

export const updateCategory = async (category, payload = {}) => {
  const nextName = payload.name !== undefined ? normalizeCategoryName(payload.name) : category.name;

  if (nextName && createCategoryLookupKey(nextName) !== createCategoryLookupKey(category.name)) {
    await ensureCategoryNameAvailable({
      name: nextName,
      excludeId: category._id,
    });
  }

  const nextSlug =
    payload.slug !== undefined || payload.name !== undefined
      ? await generateUniqueCategorySlug({
          slugSource: payload.slug || nextName,
          excludeId: category._id,
        })
      : category.slug;

  category.set({
    ...payload,
    ...(payload.name !== undefined ? { name: nextName } : {}),
    ...(payload.slug !== undefined || payload.name !== undefined ? { slug: nextSlug } : {}),
    ...(payload.color !== undefined ? { color: normalizeCategoryColor(payload.color) } : {}),
  });

  await category.save();
  await refreshProductsForCategoryIds([category._id]);
  return category;
};

export const reorderCategoryCollection = async (items = []) => {
  const operations = items
    .map((item, index) => {
      const id =
        typeof item === "string"
          ? item
          : typeof item === "object" && item
            ? String(item.id || item._id || "")
            : "";

      const normalizedId = toCategoryId(id);

      if (!normalizedId) {
        return null;
      }

      return {
        updateOne: {
          filter: { _id: normalizedId },
          update: {
            $set: {
              sortOrder:
                typeof item === "object" && item?.sortOrder !== undefined
                  ? parseSortOrder(item.sortOrder, index)
                  : typeof item === "object" && item?.displayOrder !== undefined
                    ? parseSortOrder(item.displayOrder, index)
                    : index,
            },
          },
        },
      };
    })
    .filter(Boolean);

  if (!operations.length) {
    throw new ApiError(422, "At least one valid category id is required");
  }

  await Category.bulkWrite(operations);
};

const getCategoryDocumentsByIds = async (ids = [], { includeDeleted = true } = {}) => {
  const normalizedIds = ids
    .map((id) => toCategoryId(id))
    .filter(Boolean);

  if (!normalizedIds.length) {
    return [];
  }

  const categories = await Category.find({
    _id: { $in: normalizedIds },
    ...(includeDeleted ? {} : { isDeleted: false }),
  }).lean({ virtuals: true });

  return sortCategoryDocuments(categories);
};

const buildCategorySnapshot = (categories = [], preferredPrimaryId = "") => {
  const normalizedCategories = sortCategoryDocuments(categories)
    .filter((category) => category && !category.isDeleted);

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
    categorySlugs: ordered.map((category) => category.slug),
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

    const normalizedName = normalizeCategoryName(token);
    const slug = createCategorySlug(token);

    const existing = await Category.findOne({
      isDeleted: false,
      $or: [{ normalizedName: createCategoryLookupKey(normalizedName) }, { slug }],
    });

    if (existing) {
      resolved.push(existing.toObject({ virtuals: true }));
      continue;
    }

    if (!allowCreate) {
      throw new ApiError(404, `Category "${normalizedName}" was not found`);
    }

    const created = await createCategory({
      name: normalizedName,
      description: sanitizeOptionalText(defaults.description),
      image: sanitizeOptionalText(defaults.image),
      icon: sanitizeOptionalText(defaults.icon),
      color: defaults.color || DEFAULT_CATEGORY_COLOR,
      featured: parseBoolean(defaults.featured, false),
      isActive: parseBoolean(defaults.isActive ?? defaults.active, true),
      sortOrder: defaults.sortOrder,
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

  const categories = (await getCategoryDocumentsByIds(categoryIds, { includeDeleted: true })).map(
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

export const softDeleteCategory = async (category) => {
  const blockingProduct = await Product.findOne({
    categories: category._id,
    $expr: { $lte: [{ $size: "$categories" }, 1] },
  })
    .select("name")
    .lean();

  if (blockingProduct) {
    throw new ApiError(
      409,
      `Reassign ${blockingProduct.name || "linked products"} before deleting this category`,
    );
  }

  const linkedProducts = await Product.find({ categories: category._id })
    .select("_id categories primaryCategory")
    .lean();

  if (linkedProducts.length) {
    const operations = linkedProducts.map((product) => {
      const nextCategoryIds = (product.categories || [])
        .map((id) => String(id))
        .filter((id) => id !== String(category._id));

      return {
        updateOne: {
          filter: { _id: product._id },
          update: {
            $set: {
              categories: nextCategoryIds,
              primaryCategory:
                String(product.primaryCategory || "") === String(category._id)
                  ? nextCategoryIds[0] || null
                  : product.primaryCategory || nextCategoryIds[0] || null,
            },
          },
        },
      };
    });

    await Product.bulkWrite(operations);
  }

  category.isDeleted = true;
  category.isActive = false;
  category.slug = await generateUniqueCategorySlug({
    slugSource: `${category.slug || category.name}-archived`,
    excludeId: category._id,
  });
  await category.save();

  if (linkedProducts.length) {
    await refreshProductsForCategoryIds(linkedProducts.flatMap((product) => product.categories || []));
  }

  return category;
};
