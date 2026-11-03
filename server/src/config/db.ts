import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error("MONGODB_URI is missing in the .env file");
  }

  await mongoose.connect(mongoURI);

  console.log("MongoDB connected successfully");
};

export default connectDB;