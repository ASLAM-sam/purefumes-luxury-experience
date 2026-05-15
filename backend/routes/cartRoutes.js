import express from "express";
import {
  addToCart,
  clearMyCart,
  getMyCart,
  mergeCart,
  removeFromCart,
  syncMyCart,
  updateCart,
} from "../controllers/cartController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  cartItemValidation,
  cartProductParamValidation,
  cartSyncValidation,
} from "../validators/cartValidators.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getMyCart);
router.post("/merge", cartSyncValidation, validateRequest, mergeCart);
router.put("/sync", cartSyncValidation, validateRequest, syncMyCart);
router.post("/add", cartItemValidation, validateRequest, addToCart);
router.put("/update", cartItemValidation, validateRequest, updateCart);
router.delete("/clear", clearMyCart);
router.delete("/remove/:id", cartProductParamValidation, validateRequest, removeFromCart);

export default router;
