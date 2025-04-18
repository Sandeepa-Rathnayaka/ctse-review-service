import mongoose from "mongoose";
import logger from "./logger.config";

async function connectDB(): Promise<void> {
  mongoose.set("strictQuery", false);
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/review-service";
    await mongoose.connect(mongoURI);
    logger.info("MongoDB connected successfully 😍");
  } catch (error) {
    logger.error("MongoDB connection error 😢:", error);
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => {
  logger.info("MongoDB disconnected 😢");
});

export default connectDB;
