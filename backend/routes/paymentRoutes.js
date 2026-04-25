import { Router } from "express";
import { getRazorpayConfig } from "../controllers/paymentController.js";

const router = Router();

router.get("/razorpay/config", getRazorpayConfig);

export default router;
