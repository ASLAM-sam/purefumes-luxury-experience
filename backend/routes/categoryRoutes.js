import express from "express";
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  getCategories,
  getCategoryDetails,
  updateCategory,
} from "../controllers/categoryController.js";
import { adminAuth } from "../middlewares/authMiddleware.js";
import { uploadCategoryAssets } from "../middlewares/uploadMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  adminCategoryListValidation,
  categoryCreateValidation,
  categoryIdParamValidation,
  categoryListValidation,
  categoryUpdateValidation,
} from "../validators/categoryValidation.js";

const router = express.Router();

router.get("/", categoryListValidation, validateRequest, getCategories);
router.get("/manage", adminAuth, adminCategoryListValidation, validateRequest, getAdminCategories);
router.get("/slug/:slug", getCategoryDetails);
router.post(
  "/",
  adminAuth,
  uploadCategoryAssets,
  categoryCreateValidation,
  validateRequest,
  createCategory,
);
router.put(
  "/:id",
  adminAuth,
  uploadCategoryAssets,
  categoryUpdateValidation,
  validateRequest,
  updateCategory,
);
router.delete(
  "/:id",
  adminAuth,
  categoryIdParamValidation,
  validateRequest,
  deleteCategory,
);

export default router;
