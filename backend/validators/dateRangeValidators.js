import { query } from "express-validator";
import { DATE_RANGE_KEYS, isFutureDate, isValidDateWindow } from "../utils/dateRange.js";

export const dateRangeQueryValidation = [
  query("range")
    .optional({ values: "falsy" })
    .isIn(DATE_RANGE_KEYS)
    .withMessage("Invalid date range"),
  query("from")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Start date is invalid"),
  query("to")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("End date is invalid"),
  query("startDate")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Start date is invalid"),
  query("endDate")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("End date is invalid"),
  query().custom((_, { req }) => {
    const range = String(req.query.range || "").trim();
    const from = String(req.query.from || req.query.startDate || "").trim();
    const to = String(req.query.to || req.query.endDate || "").trim();

    if (!range && !from && !to) return true;

    if (range === "custom" && (!from || !to)) {
      throw new Error("Start and end date are required for a custom range");
    }

    if (from || to) {
      if (!from || !to) {
        throw new Error("Start and end date are required");
      }

      if (isFutureDate(from) || isFutureDate(to)) {
        throw new Error("Date range cannot include future dates");
      }

      if (!isValidDateWindow({ from, to })) {
        throw new Error("End date cannot be before start date");
      }
    }

    return true;
  }),
];
