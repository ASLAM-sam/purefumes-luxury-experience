import { Router } from "express";
import { body, param } from "express-validator";
import { createCategory, deleteCategory, getCategories } from "../controllers/categoryController.js";
import { adminAuth } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = Router();

router.get("/", getCategories);
router.post(
  "/",
  adminAuth,
  [
    body("name").trim().notEmpty().withMessage("Category name is required").isLength({ max: 80 }),
    body("slug").optional().trim().isLength({ max: 100 }),
  ],
  validateRequest,
  createCategory,
);
router.delete(
  "/:id",
  adminAuth,
  [param("id").isMongoId().withMessage("Valid category id is required")],
  validateRequest,
  deleteCategory,
);

export default router;
