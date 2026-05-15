import express from "express";
import { body, param, query } from "express-validator";
import {
  addWishlistItem,
  clearWishlist,
  createAddress,
  editAddress,
  getDashboard,
  getProfile,
  getProfileOrders,
  getProfileWishlist,
  makeDefaultAddress,
  removeAddress,
  removeWishlistItem,
  updateProfile,
} from "../controllers/userController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = express.Router();

router.use(requireAuth);

const mongoIdParam = (name) => param(name).isMongoId().withMessage(`Valid ${name} is required`);
const validatePostalCode = (value, { req }) => {
  const postalCode = String(value || req.body.pincode || "").trim();
  const country = String(req.body.country || "India").trim().toLowerCase();

  if (!postalCode) {
    throw new Error("Pincode is required");
  }

  if (country === "india" && !/^[1-9][0-9]{5}$/.test(postalCode)) {
    throw new Error("Pincode must be a valid 6-digit Indian pincode");
  }

  if (country !== "india" && !/^[A-Za-z0-9][A-Za-z0-9 -]{2,19}$/.test(postalCode)) {
    throw new Error("Postal code is invalid");
  }

  return true;
};

const addressValidation = [
  body("fullName").trim().notEmpty().withMessage("Full name is required").isLength({ max: 120 }),
  body().custom((_, { req }) => {
    const phone = req.body.mobile || req.body.phone;
    if (!phone) throw new Error("Phone number is required");
    return true;
  }),
  body("mobile")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^[0-9+\-\s()]{7,25}$/)
    .withMessage("Phone number is invalid"),
  body("phone")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^[0-9+\-\s()]{7,25}$/)
    .withMessage("Phone number is invalid"),
  body().custom((_, { req }) => {
    const street = req.body.line1 || req.body.street || req.body.address;
    if (!street) throw new Error("Street address is required");
    return true;
  }),
  body("line1").optional({ values: "falsy" }).trim().isLength({ max: 240 }),
  body("street").optional({ values: "falsy" }).trim().isLength({ max: 240 }),
  body("line2").optional({ values: "falsy" }).trim().isLength({ max: 240 }),
  body("landmark").optional({ values: "falsy" }).trim().isLength({ max: 240 }),
  body("city").trim().notEmpty().withMessage("City is required").isLength({ max: 100 }),
  body("state").trim().notEmpty().withMessage("State is required").isLength({ max: 100 }),
  body().custom((_, { req }) => {
    const pincode = req.body.postalCode || req.body.pincode;
    if (!pincode) throw new Error("Pincode is required");
    return true;
  }),
  body("postalCode").optional({ values: "falsy" }).trim().isLength({ max: 20 }).custom(validatePostalCode),
  body("pincode").optional({ values: "falsy" }).trim().isLength({ max: 20 }).custom(validatePostalCode),
  body("country").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
  body("isDefault").optional().isBoolean(),
];

router.get("/profile", getProfile);
router.get(
  "/dashboard",
  [query("recentLimit").optional().isInt({ min: 1, max: 10 })],
  validateRequest,
  getDashboard,
);
router.put(
  "/profile",
  [
    body("name").optional().trim().isLength({ min: 2, max: 120 }),
    body("email").optional({ values: "falsy" }).trim().isEmail().normalizeEmail(),
    body("username")
      .optional({ values: "falsy" })
      .trim()
      .matches(/^[a-z0-9]{1,6}$/)
      .withMessage("Username must be 1-6 characters using lowercase letters or numbers only"),
    body("mobile")
      .optional({ values: "falsy" })
      .trim()
      .matches(/^[0-9+\-\s()]{7,25}$/)
      .withMessage("Mobile number is invalid"),
    body("addresses").optional().isArray({ max: 10 }),
  ],
  validateRequest,
  updateProfile,
);
router.post("/addresses", addressValidation, validateRequest, createAddress);
router.put(
  "/addresses/:addressId",
  [mongoIdParam("addressId"), ...addressValidation],
  validateRequest,
  editAddress,
);
router.delete(
  "/addresses/:addressId",
  [mongoIdParam("addressId")],
  validateRequest,
  removeAddress,
);
router.patch(
  "/addresses/:addressId/default",
  [mongoIdParam("addressId")],
  validateRequest,
  makeDefaultAddress,
);
router.get(
  "/orders",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validateRequest,
  getProfileOrders,
);
router.get("/wishlist", getProfileWishlist);
router.post(
  "/wishlist/:productId",
  [mongoIdParam("productId")],
  validateRequest,
  addWishlistItem,
);
router.delete("/wishlist", clearWishlist);
router.delete(
  "/wishlist/:productId",
  [mongoIdParam("productId")],
  validateRequest,
  removeWishlistItem,
);

export default router;
