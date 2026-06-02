import mongoose from "mongoose";
import env from "./env.js";
import logger from "./logger.js";

const DNS_ERROR_CODES = new Set(["ECONNREFUSED", "ETIMEOUT", "ENOTFOUND", "ESERVFAIL"]);

const isSrvLookupFailure = (error) =>
  String(error?.hostname || "").startsWith("_mongodb._tcp.") &&
  DNS_ERROR_CODES.has(error?.code);

const connectMongo = (mongoUri) =>
  mongoose.connect(mongoUri, {
    autoIndex: env.MONGO_AUTO_INDEX,
    maxPoolSize: env.isProduction ? 30 : 10,
    minPoolSize: env.isProduction ? 5 : 1,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxIdleTimeMS: 30000,
  });

const connectDB = async () => {
  const mongoUri = env.MONGO_URI;
  const directMongoUri = env.MONGO_URI_DIRECT;

  if (!mongoUri) {
    throw new Error("MONGO_URI is required. Add your MongoDB Atlas connection string to backend/.env.");
  }

  mongoose.set("strictQuery", true);

  let connection;

  try {
    connection = await connectMongo(mongoUri);
  } catch (error) {
    if (!directMongoUri || !isSrvLookupFailure(error)) {
      throw error;
    }

    logger.warn("MongoDB SRV lookup failed; retrying with direct seed-list URI", {
      code: error.code,
      hostname: error.hostname,
    });

    connection = await connectMongo(directMongoUri);
  }

  logger.info("MongoDB Atlas connected");
  return connection;
};

export default connectDB;
