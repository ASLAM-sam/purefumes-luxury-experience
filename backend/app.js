import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import express from "express";
import session from "express-session";
import passport, { configurePassport } from "./config/passport.js";
import env, { validateEnv } from "./config/env.js";
import { adminLimiter, apiLimiter, catalogLimiter } from "./middlewares/rateLimiter.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
import {
  applySecurityMiddleware,
  csrfProtection,
  getCookieOptions,
} from "./middlewares/securityMiddleware.js";
import { attachRequestId, requestLogger } from "./middlewares/requestLogger.js";
import productRoutes from "./routes/productRoutes.js";
import bestsellerRoutes from "./routes/bestsellerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import perfumeRequestRoutes from "./routes/perfumeRequestRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";

validateEnv();
configurePassport();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);

const authSessionMiddleware = session({
  name: "purefumes.sid",
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: false,
  unset: "destroy",
  proxy: true,
  cookie: {
    ...getCookieOptions({
      maxAge: 10 * 60 * 1000,
    }),
    maxAge: 10 * 60 * 1000,
  },
});

app.use(attachRequestId);
applySecurityMiddleware(app);
app.use(cookieParser(env.COOKIE_SECRET));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(authSessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (payload) => {
    if (payload && typeof payload === "object" && Object.prototype.hasOwnProperty.call(payload, "success")) {
      const normalizedPayload = {
        success: Boolean(payload.success),
        message:
          typeof payload.message === "string" && payload.message.trim()
            ? payload.message
            : payload.success
              ? "Request completed successfully"
              : "Request failed",
        data: Object.prototype.hasOwnProperty.call(payload, "data") ? payload.data : null,
      };

      if (Object.prototype.hasOwnProperty.call(payload, "errors")) {
        normalizedPayload.errors = payload.errors;
      }

      if (Object.prototype.hasOwnProperty.call(payload, "stack")) {
        normalizedPayload.stack = payload.stack;
      }

      return originalJson(normalizedPayload);
    }

    return originalJson({
      success: true,
      message: "Request completed successfully",
      data: payload ?? null,
    });
  };

  next();
});
app.use(requestLogger);

app.use("/api", (req, res, next) => {
  const isCatalogRead =
    req.method === "GET" &&
    (req.path.startsWith("/products") ||
      req.path.startsWith("/bestsellers") ||
      req.path.startsWith("/brands") ||
      req.path.startsWith("/categories") ||
      req.path === "/banners");

  res.set(
    "Cache-Control",
    isCatalogRead
      ? "public, max-age=30, stale-while-revalidate=120"
      : "no-store",
  );
  next();
});

app.use("/api", apiLimiter);
app.use(csrfProtection);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    fallthrough: false,
    immutable: true,
    maxAge: "30d",
    setHeaders(res) {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Content-Security-Policy", "default-src 'none'; img-src 'self'; media-src 'self'");
    },
  }),
);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      service: "Purefumes Hyderabad API",
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminLimiter, adminRoutes);
app.use("/api/analytics", adminLimiter, analyticsRoutes);
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

export default app;
