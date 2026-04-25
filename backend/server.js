import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import mongoose from "mongoose";
import morgan from "morgan";
import connectDB from "./config/db.js";
import { apiLimiter, catalogLimiter } from "./middlewares/rateLimiter.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const configuredOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const devOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];
const allowedOrigins = [
  ...new Set([
    ...configuredOrigins,
    ...(process.env.NODE_ENV === "production" ? [] : devOrigins),
  ]),
];

app.set("trust proxy", 1);
app.set("etag", false);
app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use("/api", (req, res, next) => {
  const isCatalogRead =
    req.method === "GET" &&
    (req.path.startsWith("/products") || req.path.startsWith("/categories"));

  res.set(
    "Cache-Control",
    isCatalogRead ? "public, max-age=30, stale-while-revalidate=120" : "no-store",
  );
  next();
});
app.use("/api", apiLimiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(mongoSanitize({ replaceWith: "_" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      service: "Purefumes Hyderabad API",
      timestamp: new Date().toISOString(),
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/products", catalogLimiter, productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", catalogLimiter, categoryRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(
        `Purefumes Hyderabad API running on http://localhost:${PORT}/api`,
      );
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received. Closing API server...`);
      server.close(async () => {
        await mongoose.connection.close(false);
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start API:", error.message);
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
  process.exit(1);
});
