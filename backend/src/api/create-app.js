import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { errorHandler, notFound } from "../../middlewares/errorMiddleware.js";
import { attachRequestId, requestLogger } from "../../middlewares/requestLogger.js";
import { adminLimiter, apiLimiter, catalogLimiter } from "../../middlewares/rateLimiter.js";
import { metricsMiddleware, renderMetrics } from "../metrics/registry.js";
import { getHealthSnapshot } from "../monitoring/health.js";
import { applySecurityMiddleware } from "../middlewares/security.js";
import { optionalAuth } from "../middlewares/authentication.js";
import authRoutes from "../routes/auth.routes.js";
import productRoutes from "../../routes/productRoutes.js";
import bestsellerRoutes from "../../routes/bestsellerRoutes.js";
import orderRoutes from "../../routes/orderRoutes.js";
import categoryRoutes from "../../routes/categoryRoutes.js";
import brandRoutes from "../../routes/brandRoutes.js";
import bannerRoutes from "../../routes/bannerRoutes.js";
import userRoutes from "../../routes/userRoutes.js";
import cartRoutes from "../../routes/cartRoutes.js";
import adminRoutes from "../../routes/adminRoutes.js";
import analyticsRoutes from "../../routes/analyticsRoutes.js";
import paymentRoutes, { checkoutPaymentRoutes } from "../../routes/paymentRoutes.js";
import perfumeRequestRoutes from "../../routes/perfumeRequestRoutes.js";
import couponRoutes from "../../routes/couponRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createConcurrencyGuard = ({ maxActiveRequests = 250, maxQueueDepth = 100 } = {}) => {
  let activeRequests = 0;
  let queuedRequests = 0;

  return (req, res, next) => {
    if (activeRequests >= maxActiveRequests) {
      if (queuedRequests >= maxQueueDepth) {
        return res.status(503).json({
          success: false,
          message: "The server is under heavy load. Please retry shortly.",
        });
      }

      queuedRequests += 1;
      setTimeout(() => {
        queuedRequests = Math.max(queuedRequests - 1, 0);
        next();
      }, 25);
      return;
    }

    activeRequests += 1;
    const release = () => {
      activeRequests = Math.max(activeRequests - 1, 0);
      res.off("finish", release);
      res.off("close", release);
    };

    res.on("finish", release);
    res.on("close", release);
    next();
  };
};

export const createApp = () => {
  const app = express();

  app.use(attachRequestId);
  applySecurityMiddleware(app);
  app.use(metricsMiddleware);
  app.use(createConcurrencyGuard());
  app.use(requestLogger);
  app.use(optionalAuth);
  app.use("/api", apiLimiter);

  app.use(
    "/uploads",
    express.static(path.resolve(__dirname, "..", "..", "uploads"), {
      fallthrough: false,
      immutable: true,
      maxAge: "30d",
      setHeaders(res) {
        res.setHeader("X-Content-Type-Options", "nosniff");
      },
    }),
  );

  app.get("/api/health", async (_req, res) => {
    const snapshot = await getHealthSnapshot();
    res.status(snapshot.status === "ok" ? 200 : 503).json({
      success: snapshot.status === "ok",
      data: snapshot,
    });
  });

  app.get("/api/metrics", (_req, res) => {
    res.type("text/plain").send(renderMetrics());
  });

  app.use("/auth", authRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/admin", adminLimiter, adminRoutes);
  app.use("/api/analytics", adminLimiter, analyticsRoutes);
  app.use("/api", checkoutPaymentRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/products", catalogLimiter, productRoutes);
  app.use("/api/bestsellers", catalogLimiter, bestsellerRoutes);
  app.use("/api/brands", catalogLimiter, brandRoutes);
  app.use("/api/banners", catalogLimiter, bannerRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/categories", catalogLimiter, categoryRoutes);
  app.use("/api/perfume-requests", perfumeRequestRoutes);
  app.use("/api/coupons", couponRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export default createApp;
