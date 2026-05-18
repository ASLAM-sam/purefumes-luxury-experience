import { asyncHandler } from "../middlewares/errorMiddleware.js";
import { cleanupUploadedFiles, storeUploadedImage } from "../middlewares/uploadMiddleware.js";
import {
  buildCategoryPayload,
  createCategory as persistCategory,
  getCategoryById,
  getCategoryBySlug,
  listAdminCategories,
  listCategories,
  reorderCategoryCollection,
  softDeleteCategory,
  updateCategory as persistCategoryUpdate,
} from "../services/categoryService.js";
import { clearProductCache } from "./productController.js";

const addUploadedAssets = async (payload, req) => {
  const primaryImageFile = req.categoryImageFile || req.categoryBannerImageFile;
  const unusedFiles = [req.categoryImageFile, req.categoryBannerImageFile].filter(
    (file) => file && file !== primaryImageFile,
  );

  if (primaryImageFile) {
    payload.image = await storeUploadedImage(primaryImageFile, {
      cloudinaryFolder: "purefumes-hyderabad/categories",
      localSubdirectory: "categories",
    });
  }

  await cleanupUploadedFiles(unusedFiles);

  return payload;
};

const hydrateCategoryById = async (id, { includeDeleted = true } = {}) => {
  const categories = await listCategories({
    includeInactive: true,
    includeDeleted,
  });

  return categories.find((category) => String(category.id) === String(id)) || null;
};

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await listCategories({
    featured: req.query.featured,
    search: req.query.search,
  });

  res.json({
    success: true,
    message: "Categories loaded successfully",
    data: categories,
  });
});

export const getAdminCategories = asyncHandler(async (req, res) => {
  const hasQueryControls = ["page", "limit", "search", "featured", "state"].some((field) =>
    Object.prototype.hasOwnProperty.call(req.query, field),
  );

  if (hasQueryControls) {
    const payload = await listAdminCategories(req.query);

    res.json({
      success: true,
      message: "Admin categories loaded successfully",
      data: payload,
    });
    return;
  }

  const categories = await listCategories({
    includeInactive: true,
    includeDeleted: true,
  });

  res.json({
    success: true,
    message: "Admin categories loaded successfully",
    data: categories,
  });
});

export const getCategoryDetails = asyncHandler(async (req, res) => {
  const category = await getCategoryBySlug(req.params.slug);
  const hydratedCategory = await hydrateCategoryById(category._id, { includeDeleted: false });

  res.json({
    success: true,
    message: "Category loaded successfully",
    data: hydratedCategory,
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  let payload = buildCategoryPayload(req.body);
  payload = await addUploadedAssets(payload, req);

  const category = await persistCategory(payload);
  clearProductCache();

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: await hydrateCategoryById(category._id),
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const existingCategory = await getCategoryById(req.params.id);
  let payload = buildCategoryPayload(req.body);
  payload = await addUploadedAssets(payload, req);

  const category = await persistCategoryUpdate(existingCategory, payload);
  clearProductCache();

  res.json({
    success: true,
    message: "Category updated successfully",
    data: await hydrateCategoryById(category._id),
  });
});

export const reorderCategories = asyncHandler(async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  await reorderCategoryCollection(items);
  clearProductCache();

  res.json({
    success: true,
    message: "Category order updated successfully",
    data: await listCategories({
      includeInactive: true,
      includeDeleted: true,
    }),
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await getCategoryById(req.params.id);
  await softDeleteCategory(category);
  clearProductCache();

  res.json({
    success: true,
    message: "Category deleted successfully",
    data: { id: req.params.id },
  });
});
