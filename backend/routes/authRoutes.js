import { Router } from "express";
import { body } from "express-validator";
import { loginAdmin } from "../controllers/authController.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = Router();

router.post(
  "/login",
  [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("password").isString().notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  loginAdmin,
);

export default router;
