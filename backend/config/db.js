import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is required. Add your MongoDB Atlas connection string to backend/.env.");
  }

  mongoose.set("strictQuery", true);

  const connection = await mongoose.connect(mongoUri, {
    autoIndex: process.env.MONGO_AUTO_INDEX === "true" || process.env.NODE_ENV !== "production",
  });

  console.log(`MongoDB Atlas connected: ${connection.connection.host}`);
  return connection;
};

export default connectDB;
