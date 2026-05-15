import express from "express";
import { getAnalyticsDashboard } from "../controllers/analyticsController.js";
import { adminAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", adminAuth, getAnalyticsDashboard);

export default router;
