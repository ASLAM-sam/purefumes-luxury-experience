import mongoose from "mongoose";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { ApiError, asyncHandler } from "../middlewares/errorMiddleware.js";

export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ name: 1 }).lean({ virtuals: true });
  res.json({ success: true, data: categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({
    name: req.body.name,
    slug: req.body.slug,
  });

  res.status(201).json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid category id");
  }

  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const productCount = await Product.countDocuments({ category: category.name });
  if (productCount > 0) {
    throw new ApiError(409, "Cannot delete a category that still has products");
  }

  await category.deleteOne();
  res.json({ success: true, data: { id: req.params.id } });
});
