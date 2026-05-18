import express from "express";
import { getBestsellerProducts } from "../controllers/productController.js";

const router = express.Router();

router.get("/", getBestsellerProducts);

export default router;
