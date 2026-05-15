import { body } from "express-validator";
import {
  passwordRules,
  passwordValidationMessage,
  usernameRules,
  usernameValidationMessage,
} from "../services/auth/authService.js";

export const signupValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("Full name must be between 2 and 120 characters"),
  body("fullName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("Full name must be between 2 and 120 characters"),
  body().custom((_, { req }) => {
    if (String(req.body.name || req.body.fullName || "").trim()) return true;
    throw new Error("Full name is required");
  }),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .bail()
    .custom((value) => usernameRules.test(String(value || "")))
    .withMessage(usernameValidationMessage),
  body("mobile")
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]{7,25}$/)
    .withMessage("Mobile number is invalid"),
  body("mobileNumber")
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]{7,25}$/)
    .withMessage("Mobile number is invalid"),
  body().custom((_, { req }) => {
    if (String(req.body.mobile || req.body.mobileNumber || "").trim()) return true;
    throw new Error("Mobile number is required");
  }),
  body("password")
    .custom((value) => passwordRules.test(String(value || "")))
    .withMessage(passwordValidationMessage),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Password and confirm password do not match"),
];

export const loginValidation = [
  body("identifier")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Email, mobile number, or username is required"),
  body("email").optional().trim(),
  body("mobile").optional().trim(),
  body().custom((_, { req }) => {
    if (String(req.body.identifier || req.body.email || req.body.mobile || "").trim()) {
      return true;
    }
    throw new Error("Email, mobile number, or username is required");
  }),
  body("password").isString().notEmpty().withMessage("Password is required"),
];

export const forgotPasswordValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
];

export const resetPasswordValidation = [
  body("token").isString().notEmpty().withMessage("Reset token is required"),
  body("password")
    .custom((value) => passwordRules.test(String(value || "")))
    .withMessage(passwordValidationMessage),
];

export const verifyEmailValidation = [
  body("token").isString().notEmpty().withMessage("Verification token is required"),
];
