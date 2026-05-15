import mongoose from "mongoose";
import env from "./env.js";
import logger from "./logger.js";

const connectDB = async () => {
  const mongoUri = env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is required. Add your MongoDB Atlas connection string to backend/.env.");
  }

  mongoose.set("strictQuery", true);

  const connection = await mongoose.connect(mongoUri, {
    autoIndex: env.MONGO_AUTO_INDEX,
  });

  logger.info("MongoDB Atlas connected");
  return connection;
};

export default connectDB;
